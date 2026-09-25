import { z } from 'zod';

// These timestamps are wall-clock values in fictional Atlas local time.
// UTC arithmetic keeps the demo independent of the reviewer's timezone.
export const NOW = '2026-10-01T09:00';
export const TECHNICIANS = ['T1', 'T2', 'T3'] as const;
export type Technician = (typeof TECHNICIANS)[number];
export const timestamp = (value: string) => Date.parse(`${value}:00Z`);
const localTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  .refine((v) => {
    const n = timestamp(v);
    return Number.isFinite(n) && new Date(n).toISOString().slice(0, 16) === v;
  }, 'Use a valid local date and time.');
export const prioritySchema = z.enum(['urgent', 'normal', 'planned', 'unknown']);
export type Priority = z.infer<typeof prioritySchema>;
const eventSchema = z.object({ text: z.string().min(1).max(2000), at: localTime });
const requestSchema = z.object({
  id: z.string().regex(/^R\d+$/),
  customer: z.string().min(1).max(100),
  received: localTime,
  channel: z.enum(['Email', 'WhatsApp', 'Phone']),
  message: z.string().min(1).max(4000),
  original: z.string().min(1).max(1000),
  title: z.string().min(1).max(160),
  equipment: z.string().max(160),
  priority: prioritySchema,
  status: z.enum(['open', 'assigned', 'in-progress', 'waiting', 'closed', 'linked']),
  technician: z.enum(TECHNICIANS).nullable(),
  visit: localTime.nullable(),
  linkedTo: z.string().nullable(),
  candidate: z.string().nullable(),
  clarification: z.string().max(1000),
  events: z.array(eventSchema),
});
export type ServiceRequest = z.infer<typeof requestSchema>;
export type State = { version: 1; requests: ServiceRequest[] };
export const stateSchema = z
  .object({ version: z.literal(1), requests: z.array(requestSchema).min(8).max(100) })
  .superRefine((s, ctx) => {
    const ids = new Set(s.requests.map((r) => r.id));
    const bad = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    if (ids.size !== s.requests.length) bad('Request IDs must be unique.');
    if (['R101', 'R102', 'R103', 'R104', 'R105', 'R106', 'R107', 'R108'].some((id) => !ids.has(id)))
      bad('The supplied records must be preserved.');
    for (const r of s.requests) {
      if ((r.status === 'linked') !== Boolean(r.linkedTo)) bad('Invalid linked request.');
      if (r.linkedTo) {
        const parent = s.requests.find((p) => p.id === r.linkedTo);
        if (!parent || parent.id === r.id || parent.linkedTo || parent.customer !== r.customer)
          bad('Invalid duplicate relationship.');
      }
      if (['assigned', 'in-progress', 'waiting'].includes(r.status) && !r.technician)
        bad('Assigned work needs an owner.');
    }
    for (const tech of TECHNICIANS) {
      if (s.requests.filter((r) => activeVisit(r) && r.technician === tech).length > 1)
        bad('A technician cannot have two active visits.');
    }
  });

export const activeVisit = (r: ServiceRequest) =>
  r.status === 'assigned' || r.status === 'in-progress';
export const actionable = (r: ServiceRequest) => r.status !== 'closed' && r.status !== 'linked';
export const ageHours = (r: ServiceRequest) => (timestamp(NOW) - timestamp(r.received)) / 3_600_000;
export const ownershipOverdue = (r: ServiceRequest) =>
  actionable(r) && r.priority === 'urgent' && !r.technician && ageHours(r) >= 2;
export function attention(r: ServiceRequest): {
  label: string;
  tone: 'danger' | 'warning' | 'neutral';
  reason: string;
} {
  if (r.status === 'linked')
    return {
      label: `Linked to ${r.linkedTo}`,
      tone: 'neutral',
      reason: 'Follow-up retained with the original job.',
    };
  if (r.status === 'closed')
    return {
      label: 'Closed',
      tone: 'neutral',
      reason: 'Completion was confirmed by the coordinator.',
    };
  if (ownershipOverdue(r))
    return {
      label: 'Ownership overdue',
      tone: 'danger',
      reason: 'Urgent and unassigned for more than 2 hours (demo policy).',
    };
  if (r.candidate)
    return {
      label: 'Possible duplicate',
      tone: 'warning',
      reason: `Same customer and cold-room fault as ${r.candidate}. Review before linking.`,
    };
  if (r.priority === 'unknown' || !r.equipment)
    return {
      label: 'Needs clarification',
      tone: 'warning',
      reason: r.clarification || 'Confirm equipment and urgency before dispatch.',
    };
  if (r.id === 'R107')
    return {
      label: 'Confirm completion',
      tone: 'warning',
      reason: 'Customer reports it is running. Confirm closure before freeing T3.',
    };
  if (r.technician && !r.visit && r.status !== 'waiting')
    return {
      label: 'Visit time missing',
      tone: 'warning',
      reason: 'An owner exists, but the customer has no visit time.',
    };
  if (r.status === 'waiting')
    return {
      label: 'Waiting for part',
      tone: 'warning',
      reason: 'Retain the owner and prepare an honest customer update.',
    };
  if (r.visit && timestamp(r.visit) < timestamp(NOW))
    return {
      label: 'Visit overdue',
      tone: 'danger',
      reason: 'The recorded visit time has passed. Check with the technician.',
    };
  if (r.status === 'assigned')
    return { label: 'Scheduled', tone: 'neutral', reason: 'Owner and visit time recorded.' };
  if (r.priority === 'planned')
    return {
      label: 'Plan for next week',
      tone: 'neutral',
      reason: 'Routine inspection; no exact date supplied.',
    };
  return {
    label: 'Ready to assign',
    tone: 'neutral',
    reason: 'Choose an available technician and agree a visit time.',
  };
}
export function rank(r: ServiceRequest): number {
  if (!actionable(r)) return 99;
  if (ownershipOverdue(r)) return 0;
  if (r.candidate) return 1;
  if (r.priority === 'unknown') return r.id === 'R108' ? 2 : 3;
  if (r.id === 'R107') return 4;
  if (r.technician && !r.visit && r.status !== 'waiting') return 5;
  if (r.status === 'waiting') return 6;
  if (r.priority === 'planned') return 9;
  return 7;
}
export function busyJob(state: State, tech: Technician, except?: string) {
  return state.requests.find((r) => r.id !== except && r.technician === tech && activeVisit(r));
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }).format(new Date(timestamp(value)));
}
export function updateDraft(r: ServiceRequest) {
  const lead = `Hello ${r.customer}, an update on ${r.id} (${r.title.toLowerCase()}):`;
  if (r.status === 'closed')
    return `${lead} we have recorded the job as complete following confirmation. Please contact us if the problem returns.`;
  if (r.status === 'waiting')
    return `${lead} ${r.technician} remains your point of contact. We are waiting for a replacement part. We do not yet have a confirmed delivery or return-visit time.`;
  if (r.priority === 'unknown' || !r.equipment)
    return `${lead} please confirm the equipment identifier, whether it is still operating, and any safety or operational impact. A visit time has not yet been agreed.`;
  if (r.technician && r.visit)
    return `${lead} ${r.technician} is assigned, with a visit recorded for ${formatDate(r.visit)} (Atlas local time). Please confirm access and let us know if the situation changes.`;
  if (r.technician)
    return `${lead} ${r.technician} is assigned. A visit time is not yet confirmed. We will contact you once it is agreed.`;
  return `${lead} your request is recorded. A technician and visit time are not yet confirmed.`;
}

export type Action =
  | { type: 'assign'; id: string; technician: Technician; visit: string }
  | { type: 'clarify'; id: string; equipment: string; priority: Priority; note: string }
  | { type: 'link'; id: string; target: string }
  | { type: 'separate'; id: string }
  | { type: 'unlink'; id: string }
  | { type: 'close'; id: string; confirmed: boolean }
  | { type: 'note'; id: string; note: string };

export function transition(state: State, action: Action): State {
  const next = structuredClone(state);
  const r = next.requests.find((r) => r.id === action.id);
  if (!r) throw new Error('Request not found. Reload the demo.');
  const log = (text: string) => r.events.push({ at: NOW, text });
  if (!actionable(r) && action.type !== 'unlink')
    throw new Error('This request is closed or linked. Open its original job instead.');
  switch (action.type) {
    case 'assign': {
      if (r.candidate) throw new Error('Review the possible duplicate before assigning.');
      if (!r.equipment.trim() || r.priority === 'unknown')
        throw new Error('Confirm equipment and urgency before assigning.');
      if (!TECHNICIANS.includes(action.technician)) throw new Error('Choose a valid technician.');
      if (!localTime.safeParse(action.visit).success || timestamp(action.visit) < timestamp(NOW))
        throw new Error('Choose a valid visit time at or after 1 October, 09:00.');
      const busy = busyJob(next, action.technician, r.id);
      if (busy)
        throw new Error(
          `${action.technician} already has an active visit (${busy.id}). Confirm completion before assigning another.`,
        );
      r.technician = action.technician;
      r.visit = action.visit;
      r.status = 'assigned';
      log(
        `Assigned ${action.technician}; visit agreed for ${formatDate(action.visit)} (Atlas local).`,
      );
      break;
    }
    case 'clarify': {
      if (
        !action.equipment.trim() ||
        action.equipment.trim().length > 160 ||
        action.priority === 'unknown' ||
        !prioritySchema.safeParse(action.priority).success ||
        !action.note.trim() ||
        action.note.length > 1000
      )
        throw new Error('Add equipment, a confirmed priority, and a short clarification note.');
      r.equipment = action.equipment.trim();
      r.priority = action.priority;
      r.clarification = '';
      log(`Clarified: ${action.note.trim()} Equipment: ${r.equipment}. Priority: ${r.priority}.`);
      break;
    }
    case 'link': {
      const target = next.requests.find((t) => t.id === action.target);
      if (!target || target.id === r.id || !actionable(target) || target.customer !== r.customer)
        throw new Error('Link only to an active original request from the same customer.');
      if (r.technician || next.requests.some((t) => t.linkedTo === r.id))
        throw new Error('A job with an owner or linked messages cannot be linked away.');
      r.status = 'linked';
      r.linkedTo = target.id;
      r.candidate = null;
      r.visit = null;
      log(`Coordinator confirmed this is a follow-up to ${target.id}. Original message preserved.`);
      target.events.push({
        at: NOW,
        text: `${r.id} linked as a follow-up. Original channel and message preserved.`,
      });
      break;
    }
    case 'unlink': {
      if (!r.linkedTo) throw new Error('This request is not linked.');
      const target = next.requests.find((t) => t.id === r.linkedTo);
      target?.events.push({
        at: NOW,
        text: `${r.id} unlinked by coordinator; restored as a separate request.`,
      });
      r.status = 'open';
      r.linkedTo = null;
      r.candidate = null;
      log('Link undone. Restored as a separate request; triage is required.');
      break;
    }
    case 'separate':
      if (!r.candidate) throw new Error('No duplicate suggestion to dismiss.');
      r.candidate = null;
      log('Coordinator reviewed the match and kept this as a separate request.');
      break;
    case 'close':
      if (!action.confirmed)
        throw new Error('Confirm completion with the technician or customer before closing.');
      if (!r.technician) throw new Error('Only an owned job can be completed in this demo.');
      r.status = 'closed';
      log(`Completion confirmed by coordinator; ${r.technician} released from this job.`);
      break;
    case 'note':
      if (!action.note.trim() || action.note.length > 1000)
        throw new Error('Enter a note between 1 and 1,000 characters.');
      log(action.note.trim());
      break;
  }
  return stateSchema.parse(next);
}
