import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  NOW,
  ageHours,
  attention,
  busyJob,
  formatDate,
  ownershipOverdue,
  rank,
  stateSchema,
  timestamp,
  transition,
  updateDraft,
  type State,
} from './domain';
import { createSeed } from './seed';

const row = (state: State, id: string) => state.requests.find((request) => request.id === id)!;
const assign = (
  state: State,
  id = 'R101',
  technician: 'T1' | 'T2' | 'T3' = 'T2',
  visit = '2026-10-01T10:00',
) => transition(state, { type: 'assign', id, technician, visit });

afterEach(() => vi.useRealTimers());

describe('assessment clock and supplied requests', () => {
  it('preserves the eight supplied requests, channels, and current records', () => {
    const state = createSeed();
    expect(stateSchema.safeParse(state).success).toBe(true);
    expect(state.requests.map((request) => request.id)).toEqual([
      'R101',
      'R102',
      'R103',
      'R104',
      'R105',
      'R106',
      'R107',
      'R108',
    ]);
    expect(row(state, 'R104')).toMatchObject({
      customer: 'C01',
      channel: 'Email',
      original: 'New row; may duplicate R101',
      candidate: 'R101',
    });
    expect(row(state, 'R106')).toMatchObject({ technician: 'T2', status: 'waiting' });
    expect(row(state, 'R107')).toMatchObject({ technician: 'T3', status: 'in-progress' });
  });

  it('uses fictional local time independently of the real clock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2035-01-01T00:00:00Z'));
    expect(NOW).toBe('2026-10-01T09:00');
    expect(timestamp(NOW)).toBe(Date.UTC(2026, 9, 1, 9));
    expect(formatDate(NOW)).toContain('09:00');
    expect(ageHours(row(createSeed(), 'R101'))).toBeCloseTo(16 + 50 / 60);
  });

  it('puts overdue urgent ownership first without declaring every old request urgent', () => {
    const state = createSeed();
    const urgent = row(state, 'R101');
    expect(ownershipOverdue(urgent)).toBe(true);
    expect(attention(urgent)).toMatchObject({ label: 'Ownership overdue', tone: 'danger' });
    expect([...state.requests].sort((a, b) => rank(a) - rank(b))[0].id).toBe('R101');
    expect(ownershipOverdue(row(state, 'R103'))).toBe(false);
    expect(ownershipOverdue({ ...urgent, received: '2026-10-01T07:01' })).toBe(false);
    expect(ownershipOverdue({ ...urgent, received: '2026-10-01T07:00' })).toBe(true);
    expect(ownershipOverdue(row(assign(state), 'R101'))).toBe(false);
  });
});

describe('coordinator review before dispatch', () => {
  it('links R104 to R101 while retaining every original field and an undo path', () => {
    const initial = createSeed();
    const original = row(initial, 'R104');
    const linked = transition(initial, { type: 'link', id: 'R104', target: 'R101' });
    expect(linked.requests).toHaveLength(8);
    expect(row(linked, 'R104')).toMatchObject({
      message: original.message,
      channel: original.channel,
      received: original.received,
      original: original.original,
      status: 'linked',
      linkedTo: 'R101',
    });
    expect(row(initial, 'R104').status).toBe('open');
    expect(() => assign(linked, 'R104')).toThrow(/closed or linked/i);
    const restored = transition(linked, { type: 'unlink', id: 'R104' });
    expect(row(restored, 'R104')).toMatchObject({
      status: 'open',
      linkedTo: null,
      message: original.message,
      original: original.original,
    });
    expect(row(restored, 'R104').events.some((event) => /undone/i.test(event.text))).toBe(true);
    expect(row(restored, 'R101').events.some((event) => /unlinked/i.test(event.text))).toBe(true);
  });

  it('refuses cross-customer, self, and assigned-job links', () => {
    const state = createSeed();
    expect(() => transition(state, { type: 'link', id: 'R104', target: 'R103' })).toThrow(
      /same customer/i,
    );
    expect(() => transition(state, { type: 'link', id: 'R104', target: 'R104' })).toThrow();
    const owned = assign(state);
    expect(() => transition(owned, { type: 'link', id: 'R101', target: 'R104' })).toThrow(/owner/i);
  });

  it('requires a human duplicate decision before assignment', () => {
    const state = createSeed();
    expect(() => assign(state, 'R104')).toThrow(/duplicate/i);
    const separate = transition(state, { type: 'separate', id: 'R104' });
    expect(row(separate, 'R104').candidate).toBeNull();
    expect(row(separate, 'R104').linkedTo).toBeNull();
    expect(() => assign(separate, 'R104')).toThrow(/equipment and urgency/i);
  });

  it.each(['R105', 'R108'])('blocks %s until equipment and urgency have been confirmed', (id) => {
    const state = createSeed();
    expect(() => assign(state, id)).toThrow(/equipment and urgency/i);
    expect(() =>
      transition(state, {
        type: 'clarify',
        id,
        equipment: 'Pump P-12',
        priority: 'unknown',
        note: 'Called customer.',
      }),
    ).toThrow();
    expect(() =>
      transition(state, {
        type: 'clarify',
        id,
        equipment: '  ',
        priority: 'normal',
        note: 'Called customer.',
      }),
    ).toThrow();
    const clarified = transition(state, {
      type: 'clarify',
      id,
      equipment: ' Pump P-12 ',
      priority: 'urgent',
      note: 'Customer confirmed equipment is stopped; production affected.',
    });
    expect(row(clarified, id)).toMatchObject({
      equipment: 'Pump P-12',
      priority: 'urgent',
      clarification: '',
    });
    expect(row(assign(clarified, id), id)).toMatchObject({
      technician: 'T2',
      status: 'assigned',
      visit: '2026-10-01T10:00',
    });
  });
});

describe('capacity and visit commitments', () => {
  it('keeps T3 occupied until completion is explicitly confirmed', () => {
    const state = createSeed();
    expect(busyJob(state, 'T3')?.id).toBe('R107');
    expect(() => transition(state, { type: 'close', id: 'R107', confirmed: false })).toThrow(
      /confirm completion/i,
    );
    expect(() => assign(state, 'R101', 'T3')).toThrow(/active visit/i);
    const closed = transition(state, { type: 'close', id: 'R107', confirmed: true });
    expect(busyJob(closed, 'T3')).toBeUndefined();
    expect(row(assign(closed, 'R101', 'T3'), 'R101').technician).toBe('T3');
  });

  it('allows T2 to take a visit while retaining ownership of the waiting-for-part job', () => {
    const state = createSeed();
    expect(busyJob(state, 'T2')).toBeUndefined();
    const assigned = assign(state);
    expect(row(assigned, 'R106')).toMatchObject({ technician: 'T2', status: 'waiting' });
    expect(busyJob(assigned, 'T2')?.id).toBe('R101');
    expect(() => assign(assigned, 'R103')).toThrow(/R101/);
    expect(() => assign(state, 'R101', 'T1')).toThrow(/R102/);
  });

  it('lets an owner record the missing visit time without conflicting with their own job', () => {
    const scheduled = assign(createSeed(), 'R102', 'T1');
    expect(attention(row(scheduled, 'R102')).label).toBe('Scheduled');
    expect(updateDraft(row(scheduled, 'R102'))).toContain('10:00');
  });

  it.each([
    '',
    '2026-10-01T08:59',
    '2026-02-30T10:00',
    '2026-10-01T25:00',
    '2026-10-01T10:00Z',
    'not-a-date',
  ])('rejects invalid or past visit time %j', (visit) => {
    expect(() => assign(createSeed(), 'R101', 'T2', visit)).toThrow(/valid visit time/i);
  });

  it('accepts a visit exactly at the assessment clock', () => {
    expect(row(assign(createSeed(), 'R101', 'T2', NOW), 'R101').visit).toBe(NOW);
  });

  it('does not invent a delivery date in a waiting-for-parts customer draft', () => {
    const draft = updateDraft(row(createSeed(), 'R106'));
    expect(draft).toContain('T2');
    expect(draft).toContain('do not yet have a confirmed delivery or return-visit time');
  });
});

describe('audit integrity', () => {
  it('records a change only in the relevant request history, without mutating input', () => {
    const state = createSeed();
    const next = transition(state, {
      type: 'note',
      id: 'R101',
      note: 'Called C01; goods moved to backup storage.',
    });
    expect(row(next, 'R101').events).toEqual([
      { at: NOW, text: 'Called C01; goods moved to backup storage.' },
    ]);
    expect(
      next.requests
        .filter((request) => request.id !== 'R101')
        .every((request) => request.events.length === 0),
    ).toBe(true);
    expect(state.requests.every((request) => request.events.length === 0)).toBe(true);
    expect(createSeed().requests.every((request) => request.events.length === 0)).toBe(true);
  });

  it('logs duplicate decisions in exactly the source and target histories', () => {
    const linked = transition(createSeed(), { type: 'link', id: 'R104', target: 'R101' });
    expect(row(linked, 'R101').events).toHaveLength(1);
    expect(row(linked, 'R104').events).toHaveLength(1);
    expect(
      linked.requests
        .filter((request) => !['R101', 'R104'].includes(request.id))
        .every((request) => request.events.length === 0),
    ).toBe(true);
  });
});
