import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import {
  actionable,
  activeVisit,
  attention,
  busyJob,
  formatDate,
  NOW,
  ownershipOverdue,
  rank,
  TECHNICIANS,
  transition,
  updateDraft,
  type Action,
  type Priority,
  type ServiceRequest,
  type State,
  type Technician,
} from './domain';
import { createSeed } from './seed';
import { loadState, saveState } from './storage';

const channelIcon = { Email: Mail, WhatsApp: MessageSquare, Phone };
type Filter = 'attention' | 'all' | 'scheduled' | 'resolved';
const FILTERS: [Filter, string][] = [
  ['all', 'All requests'],
  ['attention', 'Needs attention'],
  ['scheduled', 'Scheduled'],
  ['resolved', 'Resolved'],
];

function matchesFilter(request: ServiceRequest, filter: Filter) {
  switch (filter) {
    case 'all':
      return true;
    case 'attention': {
      const flag = attention(request);
      return actionable(request) && (flag.tone !== 'neutral' || flag.label === 'Ready to assign');
    }
    case 'scheduled':
      return activeVisit(request) && Boolean(request.visit);
    case 'resolved':
      return !actionable(request);
  }
}

function actionNotice(action: Action) {
  switch (action.type) {
    case 'assign':
      return `${action.id} assigned to ${action.technician}. Visit recorded.`;
    case 'link':
      return `${action.id} linked. Both original messages are preserved.`;
    case 'close':
      return `${action.id} closed. Technician availability updated.`;
    default:
      return 'Request updated.';
  }
}

export default function App() {
  const [initial] = useState(loadState);
  const [state, setState] = useState(initial.state);
  const [warning, setWarning] = useState(initial.warning);
  const [selected, setSelected] = useState('R101');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [rules, setRules] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileDetail, setMobileDetail] = useState(false);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const detailPanel = useRef<HTMLElement>(null);
  // A new request should open at its evidence, not inherit the previous job's scroll.
  useEffect(() => {
    detailPanel.current?.scrollTo({ top: 0 });
  }, [selected]);
  const current = state.requests.find((r) => r.id === selected)!;
  const open = state.requests.filter(actionable);
  const overdue = state.requests.filter(ownershipOverdue).length;
  const available = TECHNICIANS.filter((t) => !busyJob(state, t));
  const shown = state.requests
    .filter((r) => {
      const match = `${r.id} ${r.customer} ${r.title} ${r.message} ${r.technician ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return match && matchesFilter(r, filter);
    })
    .sort((a, b) => rank(a) - rank(b) || a.received.localeCompare(b.received));
  const select = (id: string) => {
    setSelected(id);
    setMobileDetail(true);
    setNotice('');
  };
  const run = (action: Action) => {
    const next = transition(state, action);
    setWarning(saveState(next));
    setState(next);
    setNotice(actionNotice(action));
  };
  function reset() {
    const next = createSeed();
    setState(next);
    setWarning(saveState(next));
    setSelected('R101');
    setFilter('all');
    setSearch('');
    setMobileDetail(false);
    setNotice('Demo reset to the eight original requests.');
    resetDialog.current?.close();
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ ...state, exportedAtDemoTime: NOW }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atlas-dispatch.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Demo records exported, including original messages and activity.');
  }
  return (
    <>
      <a className="skip-link" href="#dispatch">
        Skip to dispatch desk
      </a>
      <header className="topbar">
        <a
          href="#"
          className="brand"
          aria-label="Atlas Dispatch home"
          onClick={(e) => {
            e.preventDefault();
            setMobileDetail(false);
          }}
        >
          <span className="brand-mark">
            <Wrench size={19} />
          </span>
          <strong>
            atlas<span> / dispatch</span>
          </strong>
        </a>
        <div className="clock">
          <Clock3 size={15} />
          <span>
            <strong>09:00</strong>
            <span className="clock-date"> · 1 Oct 2026</span>
            <small>Fixed demo clock · Atlas local</small>
          </span>
        </div>
        <div className="header-actions">
          <button className="text-button" aria-expanded={rules} onClick={() => setRules(!rules)}>
            <CircleHelp size={16} />
            <span>Demo guide</span>
          </button>
          <button className="text-button" onClick={() => resetDialog.current?.showModal()}>
            <RotateCcw size={15} />
            <span>Reset demo</span>
          </button>
        </div>
      </header>
      <main id="dispatch">
        <section className="page-heading">
          <div>
            <h1>Morning dispatch</h1>
            <p>Catch the risk. Give the next job an owner.</p>
          </div>
          <span className="demo-label">Fictional assessment demo</span>
        </section>
        {rules && (
          <section className="guide" aria-label="Demo guide">
            <div>
              <h2>A three-minute walkthrough</h2>
              <p>
                Review R104 and link it to R101. Open R107, confirm completion, then assign R101 to
                the now-free T3 with a visit time. Finally open R105 to see why missing details
                block dispatch.
              </p>
            </div>
            <div>
              <h2>Explicit demo assumptions</h2>
              <ul>
                <li>
                  Urgent, unowned requests need assignment within 2 elapsed hours, including
                  overnight. This is an illustrative target, not an Atlas SLA.
                </li>
                <li>
                  Each technician can take one active visit. Waiting for a part retains ownership
                  but frees visit capacity. Skills, travel and duration are not modelled.
                </li>
                <li>
                  Cold-room risk is initially triaged urgent; routine inspection is planned. Missing
                  risk information stays unknown. Classification is editable.
                </li>
                <li>
                  All timestamps use the fixed fictional clock. Drafts are never sent. Changes stay
                  in this browser, with no shared backend.
                </li>
              </ul>
            </div>
          </section>
        )}
        {warning && (
          <div className="storage-warning" role="alert">
            {warning}
          </div>
        )}
        <section className="capacity" aria-label="Technician availability">
          <div className="capacity-heading">
            <h2>Technicians</h2>
            <span>{available.length} of 3 available</span>
          </div>
          {TECHNICIANS.map((tech) => {
            const job = busyJob(state, tech);
            const waiting = state.requests.find(
              (r) => r.technician === tech && r.status === 'waiting',
            );
            return (
              <div className="tech" key={tech}>
                <span className={`tech-avatar ${job ? '' : 'free'}`}>{tech}</span>
                <div>
                  <strong>{job ? 'On a job' : 'Available for a visit'}</strong>
                  <p>
                    {job
                      ? `${job.id} · ${job.id === 'R107' ? 'completion to confirm' : job.visit ? formatDate(job.visit) : 'time not set'}`
                      : waiting
                        ? `${waiting.id} still waiting for a part`
                        : 'No active visit'}
                  </p>
                </div>
                {job && (
                  <button
                    className="icon-button"
                    aria-label={`Review ${job.id} for ${tech}`}
                    onClick={() => select(job.id)}
                  >
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            );
          })}
        </section>
        <div className="desk-summary">
          <span>
            <strong>{open.length}</strong> open requests<span className="summary-divider">/</span>
            <strong className={overdue ? 'text-danger' : ''}>{overdue}</strong> urgent ownership
            overdue
          </span>
          <span className="save-state">
            <ShieldCheck size={14} />
            {warning ? 'Storage needs attention' : 'Saved in this browser'}
          </span>
        </div>
        <div className={`desk ${mobileDetail ? 'show-detail' : ''}`}>
          <section className="queue" aria-label="Request queue">
            <div className="queue-tools">
              <h2>
                Request queue <span>{state.requests.length}</span>
              </h2>
              <button
                className="icon-button"
                aria-label="Export demo records"
                title="Export demo records"
                onClick={exportData}
              >
                <ArrowDownToLine size={17} />
              </button>
            </div>
            <div className="filters" aria-label="Filter requests">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  className={filter === value ? 'active' : ''}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="search">
              <Search size={16} />
              <input
                type="search"
                aria-label="Search requests"
                placeholder="Search request, customer or technician"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="list-heading">
              <span>Prioritized by next action</span>
              <span>{shown.length} shown</span>
            </div>
            <div className="request-list">
              {shown.length ? (
                shown.map((request) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    selected={selected === request.id}
                    onSelect={select}
                  />
                ))
              ) : (
                <div className="empty">
                  <Search size={25} />
                  <h3>No matching requests</h3>
                  <p>
                    {search
                      ? 'Try a request ID, customer ID or technician.'
                      : 'No requests in this view yet.'}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setSearch('');
                      setFilter('all');
                    }}
                  >
                    Show all requests
                  </button>
                </div>
              )}
            </div>
            <p className="queue-footnote">
              Suggestions support the coordinator. People confirm the decisions.
            </p>
          </section>
          <section className="detail" aria-label="Selected request" ref={detailPanel}>
            <button className="mobile-back text-button" onClick={() => setMobileDetail(false)}>
              <ArrowLeft size={16} />
              Back to queue
            </button>
            <RequestDetail
              key={current.id + current.status + current.linkedTo}
              request={current}
              state={state}
              run={run}
              select={select}
            />
          </section>
        </div>
        <footer>
          <span>Atlas Industrial Services · Synthetic data only</span>
          <span>No messages sent · No live integrations</span>
        </footer>
      </main>
      <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">
        {notice && (
          <>
            <CheckCircle2 size={17} />
            <span>{notice}</span>
            <button
              className="icon-button"
              onClick={() => setNotice('')}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>
      <dialog ref={resetDialog} aria-labelledby="reset-title">
        <h2 id="reset-title">Reset this demo?</h2>
        <p>
          This removes your local changes and restores all eight original requests. Export your
          records first if you want to keep them.
        </p>
        <div className="button-row">
          <button className="secondary" onClick={() => resetDialog.current?.close()}>
            Keep my changes
          </button>
          <button className="primary" onClick={reset}>
            Reset demo
          </button>
        </div>
      </dialog>
    </>
  );
}

function RequestRow({
  request,
  selected,
  onSelect,
}: {
  request: ServiceRequest;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = channelIcon[request.channel];
  const flag = attention(request);

  return (
    <button
      className={`request-row ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      aria-label={`Open ${request.id}: ${request.title}`}
      onClick={() => onSelect(request.id)}
    >
      <span className="request-top">
        <span className="request-ref">
          {request.id}
          <span>·</span>
          {request.customer}
        </span>
        <span className={`flag ${flag.tone}`}>{flag.label}</span>
      </span>
      <span className="request-title">
        {request.title}
        <ChevronRight size={17} />
      </span>
      <span className="request-meta">
        <span>
          <Icon size={13} />
          {request.channel} · {formatDate(request.received)}
        </span>
        <span>{request.technician ?? (request.linkedTo ? request.linkedTo : 'Unassigned')}</span>
      </span>
    </button>
  );
}

function RequestDetail({
  request: r,
  state,
  run,
  select,
}: {
  request: ServiceRequest;
  state: State;
  run: (a: Action) => void;
  select: (id: string) => void;
}) {
  const [error, setError] = useState('');
  const [tech, setTech] = useState<Technician | ''>(r.technician ?? '');
  const [visit, setVisit] = useState(
    r.visit ?? (r.priority === 'planned' ? '2026-10-05T09:00' : '2026-10-01T10:00'),
  );
  const [confirmed, setConfirmed] = useState(false);
  const [equipment, setEquipment] = useState(r.equipment);
  const [priority, setPriority] = useState<Priority>(r.priority);
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const flag = attention(r);
  const related = state.requests.filter((x) => x.linkedTo === r.id);
  const candidate = state.requests.find((x) => x.id === r.candidate);
  const canAct = actionable(r);
  const unclear = r.priority === 'unknown' || !r.equipment;
  function perform(action: Action) {
    try {
      run(action);
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.');
      return false;
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(updateDraft(r));
      setCopied(true);
      setCopyError('');
    } catch {
      setCopyError('Clipboard is unavailable. Select and copy the text below.');
    }
  }
  return (
    <>
      <div className="detail-header">
        <div className="detail-ref">
          <span>{r.id}</span>
          <span>{r.customer}</span>
          <span>{r.channel}</span>
        </div>
        <span className={`priority priority-${r.priority}`}>
          {r.priority === 'unknown'
            ? 'Priority unknown'
            : `${r.priority[0].toUpperCase()}${r.priority.slice(1)}`}
        </span>
      </div>
      <h2 className="detail-title">{r.title}</h2>
      <div className={`next-action ${flag.tone}`}>
        <div>
          <span className="status-dot" />
          <strong>{flag.label}</strong>
        </div>
        <p>{flag.reason}</p>
      </div>
      <div className="evidence">
        <div className="section-label">
          <h3>Original request</h3>
          <time>{formatDate(r.received)}</time>
        </div>
        <blockquote>{r.message}</blockquote>
        <p className="original-record">
          <strong>Original record:</strong> {r.original}
        </p>
      </div>
      <dl className="job-facts">
        <div>
          <dt>Owner</dt>
          <dd>{r.technician ?? 'Unassigned'}</dd>
        </div>
        <div>
          <dt>Visit</dt>
          <dd>{r.visit ? formatDate(r.visit) : 'Not agreed'}</dd>
        </div>
      </dl>
      {related.length > 0 && (
        <div className="linked-messages">
          <h3>
            <Link2 size={15} />
            Linked follow-ups
          </h3>
          {related.map((x) => (
            <button className="linked-message" key={x.id} onClick={() => select(x.id)}>
              <strong>
                {x.id} · {x.channel} · {formatDate(x.received)}
              </strong>
              <span>{x.message}</span>
              <span className="inline-link">
                View original & undo link <ArrowRight size={13} />
              </span>
            </button>
          ))}
        </div>
      )}
      {r.id === 'R101' && state.requests.find((x) => x.id === 'R104')?.candidate && (
        <button className="related-hint" onClick={() => select('R104')}>
          <Link2 size={17} />
          <span>
            <strong>One possible follow-up</strong>
            <small>Review R104 before creating another job</small>
          </span>
          <ArrowRight size={17} />
        </button>
      )}
      {r.status === 'linked' && (
        <div className="action-section">
          <h3>One job, both messages</h3>
          <p>
            This request is excluded from the dispatch queue's open count. Its original message is
            retained.
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => select(r.linkedTo!)}>
              Open {r.linkedTo}
              <ArrowRight size={15} />
            </button>
            <button className="secondary" onClick={() => perform({ type: 'unlink', id: r.id })}>
              Undo link
            </button>
          </div>
        </div>
      )}
      {r.status === 'closed' && (
        <div className="closed-state">
          <CheckCircle2 size={20} />
          <div>
            <h3>Completion confirmed</h3>
            <p>
              {r.technician} is no longer occupied by this job. The original record and activity
              remain available.
            </p>
          </div>
        </div>
      )}
      {candidate && canAct && (
        <div className="action-section">
          <h3>Is this the same job?</h3>
          <p>The customer and fault match. Similar text alone is not enough to merge requests.</p>
          <div className="comparison">
            <strong>
              {candidate.id} · {candidate.customer} · {formatDate(candidate.received)}
            </strong>
            <p>{candidate.message}</p>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirmed this is the same cold-room fault.
          </label>
          <div className="button-row">
            <button
              className="primary"
              disabled={!confirmed}
              onClick={() => perform({ type: 'link', id: r.id, target: candidate.id })}
            >
              <Link2 size={15} />
              Link to {candidate.id}
            </button>
            <button
              className="secondary"
              onClick={() => {
                setConfirmed(false);
                perform({ type: 'separate', id: r.id });
              }}
            >
              Keep separate
            </button>
          </div>
        </div>
      )}
      {canAct && !candidate && (unclear || editing) && (
        <form
          className="action-section"
          onSubmit={(e) => {
            e.preventDefault();
            if (perform({ type: 'clarify', id: r.id, equipment, priority, note })) {
              setEditing(false);
              setNote('');
            }
          }}
        >
          <h3>{unclear ? 'Clarify before dispatch' : 'Edit triage'}</h3>
          <p>
            {unclear
              ? 'Call the customer. Record what you learn; do not guess.'
              : 'Confirm equipment and operational impact with the customer.'}
          </p>
          <label>
            Equipment or identifier
            <input
              required
              maxLength={160}
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g. Packing line pump P-04"
            />
          </label>
          <label>
            Confirmed priority
            <select
              required
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="unknown">Choose after clarification</option>
              <option value="urgent">Urgent — immediate operational risk</option>
              <option value="normal">Normal — routine repair</option>
              <option value="planned">Planned — future work</option>
            </select>
          </label>
          <label>
            What did the customer confirm?
            <textarea
              required
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Equipment, impact and any safety concern…"
              rows={3}
            />
          </label>
          <div className="button-row">
            <button className="primary" type="submit">
              Save clarification
              <Check size={15} />
            </button>
            {editing && (
              <button className="secondary" type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
          {unclear && (
            <p className="lock-note">
              <ShieldCheck size={14} />
              Assignment unlocks after equipment and urgency are confirmed.
            </p>
          )}
        </form>
      )}
      {canAct && !candidate && !unclear && !editing && r.id === 'R107' && (
        <div className="action-section">
          <h3>Confirm completion</h3>
          <p>
            The message suggests a fix, but the record is still in progress. Check before releasing
            T3.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirmed with the technician or customer that the job is complete.
          </label>
          <button
            className="primary"
            disabled={!confirmed}
            onClick={() => perform({ type: 'close', id: r.id, confirmed })}
          >
            Close job & release T3
            <CheckCircle2 size={16} />
          </button>
        </div>
      )}
      {canAct && !candidate && !unclear && !editing && r.id !== 'R107' && (
        <form
          className="action-section"
          onSubmit={(e) => {
            e.preventDefault();
            if (!tech) {
              setError('Choose a technician.');
              return;
            }
            perform({ type: 'assign', id: r.id, technician: tech, visit });
          }}
        >
          <div className="section-label">
            <h3>
              {r.status === 'waiting'
                ? 'Schedule a return visit'
                : r.visit
                  ? 'Update the visit'
                  : 'Give this job a plan'}
            </h3>
            <button type="button" className="text-button small" onClick={() => setEditing(true)}>
              Edit triage
            </button>
          </div>
          <p>
            {r.status === 'waiting'
              ? 'Only schedule after the part and customer access are confirmed. This moves the job out of waiting.'
              : 'Agree the time with the customer before saving.'}
          </p>
          <div className="form-grid">
            <label>
              Technician
              <select required value={tech} onChange={(e) => setTech(e.target.value as Technician)}>
                <option value="">Choose technician</option>
                {TECHNICIANS.map((t) => {
                  const busy = busyJob(state, t, r.id);
                  return (
                    <option key={t} value={t} disabled={!!busy}>
                      {t} ·{' '}
                      {busy
                        ? `busy on ${busy.id}`
                        : t === r.technician
                          ? 'current owner'
                          : 'available'}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              Visit time · Atlas local
              <input
                aria-label="Visit time, Atlas local"
                required
                type="datetime-local"
                min={NOW}
                value={visit}
                onChange={(e) => setVisit(e.target.value)}
              />
            </label>
          </div>
          <button className="primary" type="submit">
            {r.visit ? 'Save visit' : 'Assign & set visit'}
            <ArrowRight size={16} />
          </button>
          <p className="lock-note">
            One active visit per technician · Skills and travel not modelled
          </p>
        </form>
      )}
      {canAct && r.technician && r.id !== 'R107' && (
        <details className="complete-job">
          <summary>Complete this job</summary>
          <label className="check-label">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirmed with the technician or customer that the job is complete.
          </label>
          <button
            className="secondary"
            disabled={!confirmed}
            onClick={() => perform({ type: 'close', id: r.id, confirmed })}
          >
            Confirm completion
            <CheckCircle2 size={15} />
          </button>
        </details>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {r.status !== 'linked' && (
        <section className="update-section">
          <button
            className="update-toggle"
            aria-expanded={draft}
            onClick={() => {
              setDraft(!draft);
              setCopied(false);
            }}
          >
            <MessageSquare size={17} />
            <span>Prepare a customer update</span>
            <ChevronRight size={17} className={draft ? 'rotate' : ''} />
          </button>
          {draft && (
            <div className="draft">
              <p>Draft only. Review and send through your usual channel.</p>
              <textarea
                aria-label="Customer update draft"
                readOnly
                rows={5}
                value={updateDraft(r)}
              />
              <button className="secondary" onClick={copy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied — not sent' : 'Copy draft'}
              </button>
              {copyError && <p role="alert">{copyError}</p>}
            </div>
          )}
        </section>
      )}
      <details className="activity">
        <summary>
          Activity <span>{r.events.length}</span>
        </summary>
        {r.events.length ? (
          <ol>
            {[...r.events].reverse().map((event, i) => (
              <li key={i}>
                <time>09:00 · demo clock</time>
                <p>{event.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p>No changes yet. The original request is preserved above.</p>
        )}
      </details>
    </>
  );
}
