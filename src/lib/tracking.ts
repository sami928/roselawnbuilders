const KEY = 'rl_attribution';

export type Attribution = {
  landingPage: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

/** Remember where the visitor first came from, so the lead shows its source in the dashboard. */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const external = document.referrer && new URL(document.referrer).host !== window.location.host;
    const data: Attribution = {
      landingPage: window.location.pathname + window.location.search,
      referrer: external ? document.referrer : '',
    };
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
      const value = params.get(key);
      if (value) data[key] = value;
    }
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage blocked — attribution is best-effort.
  }
}

export function getAttribution(): Attribution {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through
  }
  return { landingPage: window.location.pathname, referrer: '' };
}

/** Fires a conversion event for Google Tag Manager / GA4 if either is installed. */
export function trackLead(service: string) {
  const w = window as typeof window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer?.push({ event: 'generate_lead', service });
  w.gtag?.('event', 'generate_lead', { service });
}
