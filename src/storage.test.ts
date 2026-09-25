import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { transition, type State } from './domain';
import { createSeed } from './seed';
import { loadState, saveState, STORAGE_KEY } from './storage';

let saved: Map<string, string>;
beforeEach(() => {
  saved = new Map();
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => saved.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      saved.set(key, value);
    }),
  });
});
afterEach(() => vi.unstubAllGlobals());

const persist = (state: unknown) => saved.set(STORAGE_KEY, JSON.stringify(state));

describe('browser persistence', () => {
  it('loads the original eight requests for a new browser', () => {
    expect(loadState()).toEqual({ state: createSeed(), warning: '' });
  });

  it('restores assignment and separate histories after save and reload', () => {
    let state = transition(createSeed(), { type: 'link', id: 'R104', target: 'R101' });
    state = transition(state, {
      type: 'assign',
      id: 'R101',
      technician: 'T2',
      visit: '2026-10-01T10:00',
    });
    expect(saveState(state)).toBe('');
    expect(loadState()).toEqual({ state, warning: '' });
  });

  it.each(['{broken', 'null', '[]'])(
    'recovers with a visible warning from malformed saved data %j',
    (raw) => {
      saved.set(STORAGE_KEY, raw);
      expect(loadState().state).toEqual(createSeed());
      expect(loadState().warning).not.toBe('');
    },
  );

  it.each([
    [
      'missing supplied request',
      (s: State) => {
        s.requests.pop();
      },
    ],
    [
      'duplicate request ID',
      (s: State) => {
        s.requests[7].id = 'R101';
      },
    ],
    [
      'cross-customer duplicate',
      (s: State) => {
        s.requests[3].status = 'linked';
        s.requests[3].linkedTo = 'R103';
      },
    ],
    [
      'self-linked request',
      (s: State) => {
        s.requests[3].status = 'linked';
        s.requests[3].linkedTo = 'R104';
      },
    ],
    [
      'missing duplicate parent',
      (s: State) => {
        s.requests[3].status = 'linked';
        s.requests[3].linkedTo = 'R999';
      },
    ],
    [
      'assigned job without owner',
      (s: State) => {
        s.requests[1].technician = null;
      },
    ],
    [
      'two active visits for one technician',
      (s: State) => {
        s.requests[0].status = 'assigned';
        s.requests[0].technician = 'T1';
      },
    ],
    [
      'impossible date',
      (s: State) => {
        s.requests[0].received = '2026-02-30T16:10';
      },
    ],
  ] as const)('rejects saved state with %s', (_label, corrupt) => {
    const state = createSeed();
    corrupt(state);
    persist(state);
    const result = loadState();
    expect(result.state).toEqual(createSeed());
    expect(result.warning).toContain('invalid');
  });

  it('warns and continues when browser storage is blocked', () => {
    vi.mocked(localStorage.getItem).mockImplementation(() => {
      throw new Error('Storage denied');
    });
    expect(loadState().state).toEqual(createSeed());
    expect(loadState().warning).toContain('could not be read');
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    expect(saveState(createSeed())).toContain('in this tab only');
  });
});
