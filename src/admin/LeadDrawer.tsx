import { useEffect, useState, type FormEvent } from 'react';
import { Activity, Loader2, Mail, MessageSquare, Pencil, Phone, Trash2, X } from 'lucide-react';
import { api, ApiError, type Lead, type LeadStatus } from './api';
import { fullDate, relativeTime } from './format';
import { StatusSelect } from './Dashboard';
import { LeadFields, emptyLead, type LeadInput } from './Modals';

export function LeadDrawer({ id, onClose, onChanged }: { id: number; onClose: () => void; onChanged: () => void }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLead(null);
    setError('');
    setEditing(false);
    api<{ lead: Lead }>(`/admin/leads/${id}`)
      .then(({ lead }) => {
        setLead(lead);
        setValue(lead.estimated_value == null ? '' : String(lead.estimated_value));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load lead.'));
  }, [id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError('');
    try {
      const { lead: updated } = await api<{ lead: Lead }>(`/admin/leads/${id}`, { method: 'PATCH', body });
      setLead(updated);
      setValue(updated.estimated_value == null ? '' : String(updated.estimated_value));
      onChanged();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      const { lead: updated } = await api<{ lead: Lead }>(`/admin/leads/${id}/notes`, { method: 'POST', body: { body: note } });
      setLead(updated);
      setNote('');
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add note.');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId: number) => {
    const { lead: updated } = await api<{ lead: Lead }>(`/admin/leads/${id}/notes/${noteId}`, { method: 'DELETE' });
    setLead(updated);
  };

  const remove = async () => {
    if (!lead || !window.confirm(`Delete ${lead.name}’s lead and all its notes? This can’t be undone.`)) return;
    await api(`/admin/leads/${id}`, { method: 'DELETE' });
    onChanged();
    onClose();
  };

  const saveValue = () => {
    if (!lead) return;
    const next = value.replace(/[^\d.]/g, '');
    const current = lead.estimated_value == null ? '' : String(lead.estimated_value);
    if (next !== current) patch({ estimated_value: next === '' ? null : Number(next) });
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close lead" />
      <aside className="drawer-in relative flex h-full w-full max-w-xl flex-col bg-[#fbfaf7] shadow-2xl" role="dialog" aria-modal="true" aria-label="Lead details">
        <div className="flex items-start gap-3 border-b border-stone-200 bg-white px-6 py-5">
          <div className="mr-auto min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#be2b24]">Lead #{id}</p>
            <h2 className="mt-1 truncate font-serif text-2xl tracking-tight">{lead?.name ?? 'Loading…'}</h2>
            {lead && <p className="mt-1 text-xs text-stone-500">Received {fullDate(lead.created_at)}</p>}
          </div>
          <button className="p-1.5 text-stone-500 hover:text-stone-900" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {!lead && !error && (
          <div className="flex flex-1 items-center justify-center text-stone-400">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {error && <p className="mx-6 mt-4 border-l-2 border-[#be2b24] bg-[#fbe9e7] px-3 py-2 text-sm text-[#8e201e]">{error}</p>}

        {lead && (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusSelect large value={lead.status} onChange={(status: LeadStatus) => patch({ status })} />
              {lead.phone && (
                <a className="btn-ghost" href={`tel:${lead.phone}`}>
                  <Phone size={14} /> Call
                </a>
              )}
              {lead.phone && (
                <a className="btn-ghost" href={`sms:${lead.phone}`}>
                  <MessageSquare size={14} /> Text
                </a>
              )}
              {lead.email && (
                <a className="btn-ghost" href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your ${lead.service || 'project'} estimate — Roselawn Builders`)}`}>
                  <Mail size={14} /> Email
                </a>
              )}
              {saving && <Loader2 size={16} className="animate-spin text-stone-400" />}
            </div>

            <div className="mt-5 border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Details</h3>
                {!editing && (
                  <button className="flex items-center gap-1 text-xs font-semibold text-[#be2b24]" onClick={() => setEditing(true)}>
                    <Pencil size={12} /> Edit
                  </button>
                )}
              </div>
              {editing ? (
                <EditLead lead={lead} onCancel={() => setEditing(false)} onSave={async (input) => (await patch(input)) && setEditing(false)} />
              ) : (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm">
                  <Detail label="Phone" value={lead.phone} />
                  <Detail label="Email" value={lead.email} />
                  <Detail label="Project" value={lead.service} />
                  <Detail label="ZIP" value={lead.zip} />
                  <Detail label="Timeline" value={lead.timeline} />
                  <Detail label="Budget" value={lead.budget} />
                  <div className="col-span-2">
                    <dt className="text-xs text-stone-500">Message</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-stone-800">{lead.message || '—'}</dd>
                  </div>
                </dl>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="border border-stone-200 bg-white p-4">
                <label className="text-xs text-stone-500" htmlFor="value">Estimated job value</label>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-stone-400">$</span>
                  <input
                    id="value"
                    className="w-full border-b border-transparent bg-transparent font-serif text-xl tabular-nums outline-none focus:border-[#be2b24]"
                    inputMode="numeric"
                    placeholder="0"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onBlur={saveValue}
                    onKeyDown={(event) => event.key === 'Enter' && (event.target as HTMLInputElement).blur()}
                  />
                </div>
              </div>
              <div className="border border-stone-200 bg-white p-4 text-xs">
                <p className="text-stone-500">Source</p>
                <p className="mt-1 text-sm font-semibold text-stone-800">{lead.source}</p>
                {(lead.utm_campaign || lead.utm_medium) && <p className="mt-1 text-stone-500">{[lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' · ')}</p>}
                {lead.landing_page && <p className="mt-1 truncate text-stone-400" title={lead.landing_page}>Landed on {lead.landing_page}</p>}
              </div>
            </div>

            <form onSubmit={addNote} className="mt-6">
              <label className="label" htmlFor="note">Add a note</label>
              <textarea
                id="note"
                className="input min-h-[80px]"
                placeholder="Called, scheduled a site visit for Tuesday at 10am…"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) addNote(event);
                }}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">⌘/Ctrl + Enter to save</span>
                <button className="btn-dark" disabled={saving || !note.trim()}>Save note</button>
              </div>
            </form>

            <h3 className="mb-3 mt-7 text-xs font-semibold uppercase tracking-wider text-stone-500">Activity</h3>
            <ol className="relative space-y-4 border-l border-stone-200 pl-5">
              {lead.notes.map((item) => (
                <li key={item.id} className="relative">
                  <span className={`absolute -left-[27px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ${item.kind === 'note' ? 'bg-[#be2b24]' : 'bg-stone-300'}`} />
                  {item.kind === 'note' ? (
                    <div className="group border border-stone-200 bg-white p-3">
                      <p className="whitespace-pre-wrap text-sm text-stone-800">{item.body}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                        <span>
                          {item.author_name || item.author_email || 'Team'} · {relativeTime(item.created_at)}
                        </span>
                        <button className="opacity-0 transition hover:text-[#be2b24] group-hover:opacity-100" onClick={() => deleteNote(item.id)} aria-label="Delete note">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Activity size={12} /> {item.body} <span className="text-stone-400">· {relativeTime(item.created_at)}</span>
                    </p>
                  )}
                </li>
              ))}
              <li className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-stone-300 bg-white" />
                <p className="text-xs text-stone-500">
                  Lead received via {lead.source} <span className="text-stone-400">· {relativeTime(lead.created_at)}</span>
                </p>
              </li>
            </ol>

            <button className="mt-10 flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#be2b24]" onClick={remove}>
              <Trash2 size={13} /> Delete this lead
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-0.5 truncate text-stone-800" title={value}>{value || '—'}</dd>
    </div>
  );
}

function EditLead({ lead, onCancel, onSave }: { lead: Lead; onCancel: () => void; onSave: (input: LeadInput) => void }) {
  const [input, setInput] = useState<LeadInput>(() => Object.fromEntries(Object.keys(emptyLead).map((key) => [key, lead[key as keyof LeadInput] ?? ''])) as LeadInput);
  return (
    <form
      className="p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(input);
      }}
    >
      <LeadFields value={input} onChange={setInput} />
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary">Save changes</button>
      </div>
    </form>
  );
}
