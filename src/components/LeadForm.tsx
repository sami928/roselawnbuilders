import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import { services } from '@/content/services';
import { site } from '@/site';
import { useRouter } from '@/router';
import { getAttribution, trackLead } from '@/lib/tracking';

const timelines = ['As soon as possible', 'Within 1–3 months', '3–6 months out', 'Just planning ahead'];
const budgets = ['Under $10k', '$10k – $25k', '$25k – $50k', '$50k – $100k', '$100k+', 'Not sure yet'];
const projectTypes = [...services.map((service) => ({ title: service.title, icon: service.icon })), { title: 'Something else', icon: null }];

type Fields = { name: string; email: string; phone: string; zip: string; service: string; timeline: string; budget: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const STEPS = ['Project', 'Details', 'Contact'];

/**
 * The multi-step estimate form. Asking the easy questions first (project type,
 * timeline) and contact details last lifts completion rates over one long form.
 */
export function LeadForm({ defaultService = '', id, heading = 'Get your free estimate' }: { defaultService?: string; id?: string; heading?: string }) {
  const { navigate } = useRouter();
  const [step, setStep] = useState(defaultService ? 1 : 0);
  const [form, setForm] = useState<Fields>({ name: '', email: '', phone: '', zip: '', service: defaultService, timeline: '', budget: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field: keyof Fields, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const chooseService = (title: string) => {
    update('service', title);
    setStep(1);
  };

  const validateContact = () => {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Please enter a valid email.';
    if (form.phone.replace(/\D/g, '').length < 7) next.phone = 'Please enter a valid phone number.';
    if (form.zip && !/^\d{5}(-\d{4})?$/.test(form.zip.trim())) next.zip = 'Use a 5-digit ZIP.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 2) return setStep(step + 1);
    if (!validateContact()) return;
    setSaving(true);
    setFormError('');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company_website: honeypot, tracking: getAttribution() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error);
      }
      trackLead(form.service);
      navigate('/thank-you');
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : `We couldn't send that just yet. Please call us at ${site.phone}.`);
      setSaving(false);
    }
  };

  return (
    <form className="funnel-form" id={id} onSubmit={submit} noValidate>
      <div className="funnel-form-head">
        <p className="funnel-form-title">{heading}</p>
        <p className="funnel-form-sub">Takes about 60 seconds · No obligation</p>
        <ol className="funnel-progress" aria-label="Form progress">
          {STEPS.map((label, index) => (
            <li key={label} className={index < step ? 'done' : index === step ? 'active' : ''} aria-current={index === step ? 'step' : undefined}>
              <span>{index < step ? <Check size={12} /> : index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <fieldset className="funnel-step">
          <legend>What kind of project are you planning?</legend>
          <div className="choice-grid">
            {projectTypes.map(({ title, icon: Icon }) => (
              <button type="button" key={title} className={form.service === title ? 'choice selected' : 'choice'} onClick={() => chooseService(title)} aria-pressed={form.service === title}>
                {Icon ? <Icon size={20} strokeWidth={1.6} /> : <ArrowRight size={20} strokeWidth={1.6} />}
                <span>{title}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="funnel-step">
          <legend>
            When are you hoping to start{form.service && form.service !== 'Something else' ? <> your <strong>{form.service.toLowerCase()}</strong> project</> : ''}?
          </legend>
          <div className="pill-group" role="radiogroup" aria-label="Timeline">
            {timelines.map((option) => (
              <button type="button" role="radio" aria-checked={form.timeline === option} key={option} className={form.timeline === option ? 'pill selected' : 'pill'} onClick={() => update('timeline', option)}>
                {option}
              </button>
            ))}
          </div>
          <p className="step-label">Rough budget range</p>
          <div className="pill-group" role="radiogroup" aria-label="Budget">
            {budgets.map((option) => (
              <button type="button" role="radio" aria-checked={form.budget === option} key={option} className={form.budget === option ? 'pill selected' : 'pill'} onClick={() => update('budget', option)}>
                {option}
              </button>
            ))}
          </div>
          <label className="field">
            Anything we should know? <span className="optional">Optional</span>
            <textarea rows={3} maxLength={2000} value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="e.g. 1920s bungalow, want to open the kitchen to the dining room" />
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="funnel-step">
          <legend>Where should we send your estimate?</legend>
          <div className="form-row">
            <Field label="Your name" error={errors.name}>
              <input autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Jane Smith" />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="(503) 555-0123" />
            </Field>
          </div>
          <div className="form-row">
            <Field label="Email" error={errors.email}>
              <input type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="jane@email.com" />
            </Field>
            <Field label="Project ZIP" optional error={errors.zip}>
              <input inputMode="numeric" autoComplete="postal-code" value={form.zip} onChange={(event) => update('zip', event.target.value)} placeholder="97211" />
            </Field>
          </div>
          <label className="hp-field" aria-hidden="true">
            Leave this empty
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          </label>
        </fieldset>
      )}

      {formError && <p className="form-error" role="alert">{formError}</p>}

      {step > 0 && (
        <div className="funnel-actions">
          <button type="button" className="button button-quiet" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="button button-primary" disabled={saving}>
            {step < 2 ? 'Continue' : saving ? 'Sending…' : 'Get my free estimate'} <ArrowRight size={17} />
          </button>
        </div>
      )}
      <p className="form-note">
        <Lock size={12} /> Your details stay with {site.name}. We never sell or share them.
      </p>
    </form>
  );
}

function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className={error ? 'field has-error' : 'field'}>
      <span>
        {label} {optional && <span className="optional">Optional</span>}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
