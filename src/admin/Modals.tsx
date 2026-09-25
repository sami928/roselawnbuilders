import { useState, type FormEvent, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { api, ApiError, type Lead } from './api';
import { serviceTitles } from '@/content/services';

export const emptyLead = { name: '', phone: '', email: '', zip: '', service: '', timeline: '', budget: '', message: '' };
export type LeadInput = typeof emptyLead;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto border-t-[3px] border-[#be2b24] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl tracking-tight">{title}</h2>
          <button className="p-1 text-stone-500 hover:text-stone-900" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function LeadFields({ value, onChange, errors = {} }: { value: LeadInput; onChange: (value: LeadInput) => void; errors?: Record<string, string> }) {
  const field = (key: keyof LeadInput, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <label className="label" htmlFor={`lead-${key}`}>{label}</label>
      <input id={`lead-${key}`} className="input" value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })} {...props} />
      {errors[key] && <p className="mt-1 text-xs text-[#be2b24]">{errors[key]}</p>}
    </div>
  );
  const options = value.service && !serviceTitles.includes(value.service) ? [...serviceTitles, value.service] : serviceTitles;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">{field('name', 'Name', { required: true, autoFocus: true })}</div>
      {field('phone', 'Phone', { type: 'tel' })}
      {field('email', 'Email', { type: 'email' })}
      <div>
        <label className="label" htmlFor="lead-service">Project</label>
        <select id="lead-service" className="input" value={value.service} onChange={(event) => onChange({ ...value, service: event.target.value })}>
          <option value="">—</option>
          {options.map((item) => <option key={item}>{item}</option>)}
          {!options.includes('Something else') && <option>Something else</option>}
        </select>
      </div>
      {field('zip', 'ZIP')}
      {field('timeline', 'Timeline', { placeholder: 'e.g. Within 1–3 months' })}
      {field('budget', 'Budget', { placeholder: 'e.g. $25k – $50k' })}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="lead-message">Project notes</label>
        <textarea id="lead-message" className="input min-h-[80px]" value={value.message} onChange={(event) => onChange({ ...value, message: event.target.value })} />
      </div>
    </div>
  );
}

export function AddLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const [input, setInput] = useState<LeadInput>(emptyLead);
  const [source, setSource] = useState('phone');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { lead } = await api<{ lead: Lead }>('/admin/leads', { method: 'POST', body: { ...input, source } });
      onCreated(lead.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields ?? {});
        setError(err.message);
      }
      setSaving(false);
    }
  };

  return (
    <Modal title="Add a lead" onClose={onClose}>
      <form onSubmit={submit}>
        <LeadFields value={input} onChange={setInput} errors={errors} />
        <div className="mt-3">
          <label className="label" htmlFor="lead-source">How did they reach you?</label>
          <select id="lead-source" className="input" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="phone">Phone call</option>
            <option value="referral">Referral</option>
            <option value="walk-in">In person</option>
            <option value="email">Email</option>
            <option value="social">Social media</option>
            <option value="manual">Other</option>
          </select>
        </div>
        {error && <p className="mt-4 text-sm text-[#be2b24]">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={saving}>Add lead</button>
        </div>
      </form>
    </Modal>
  );
}

export function PasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (next !== confirm) return setError('New passwords don’t match.');
    setError('');
    try {
      await api('/auth/password', { method: 'POST', body: { current, next } });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change password.');
    }
  };

  return (
    <Modal title="Change password" onClose={onClose}>
      {done ? (
        <div className="py-4 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check />
          </span>
          <p className="mt-4 text-sm text-stone-600">Password updated. Other devices have been signed out.</p>
          <button className="btn-dark mt-5" onClick={onClose}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label" htmlFor="pw-current">Current password</label>
            <input id="pw-current" className="input" type="password" autoComplete="current-password" required value={current} onChange={(event) => setCurrent(event.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pw-next">New password</label>
            <input id="pw-next" className="input" type="password" autoComplete="new-password" minLength={10} required value={next} onChange={(event) => setNext(event.target.value)} />
            <p className="mt-1 text-xs text-stone-400">At least 10 characters.</p>
          </div>
          <div>
            <label className="label" htmlFor="pw-confirm">Confirm new password</label>
            <input id="pw-confirm" className="input" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </div>
          {error && <p className="text-sm text-[#be2b24]">{error}</p>}
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary">Update password</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
