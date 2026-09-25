const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * Normalises lead input. `strict` applies the public-form rules (a way to reach the
 * visitor is required); the dashboard can save partial phone-in leads.
 */
export function parseLead(body = {}, { strict = true } = {}) {
  const lead = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 40),
    zip: clean(body.zip, 10),
    service: clean(body.service, 120),
    timeline: clean(body.timeline, 60),
    budget: clean(body.budget, 60),
    message: clean(body.message, 2000),
  };
  const errors = {};

  if (lead.name.length < 2) errors.name = 'Please enter your name.';
  if (lead.email && !EMAIL_RE.test(lead.email)) errors.email = 'Please enter a valid email address.';
  if (lead.phone && lead.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a valid phone number.';
  if (lead.zip && !/^\d{5}(-\d{4})?$/.test(lead.zip)) errors.zip = 'Please enter a 5-digit ZIP code.';
  if (strict) {
    if (!lead.email) errors.email = 'Please enter your email address.';
    if (!lead.phone) errors.phone = 'Please enter your phone number.';
    if (!lead.service) errors.service = 'Please choose a project type.';
  } else if (!lead.email && !lead.phone) {
    errors.phone = 'Add a phone number or email.';
  }

  return { lead, errors: Object.keys(errors).length ? errors : null };
}

export function parseTracking(body = {}) {
  const tracking = body.tracking && typeof body.tracking === 'object' ? body.tracking : {};
  return {
    landing_page: clean(tracking.landingPage, 500),
    referrer: clean(tracking.referrer, 500),
    utm_source: clean(tracking.utm_source, 120),
    utm_medium: clean(tracking.utm_medium, 120),
    utm_campaign: clean(tracking.utm_campaign, 120),
  };
}
