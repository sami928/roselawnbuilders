export type LeadStatus = 'new' | 'contacted' | 'estimate_scheduled' | 'quoted' | 'won' | 'lost';

export type LeadSummary = {
  id: number;
  name: string;
  email: string;
  phone: string;
  zip: string;
  service: string;
  timeline: string;
  budget: string;
  status: LeadStatus;
  estimated_value: number | null;
  source: string;
  created_at: string;
  updated_at: string;
};

export type LeadNote = { id: number; kind: 'note' | 'event'; body: string; created_at: string; author_name: string | null; author_email: string | null };

export type Lead = LeadSummary & {
  message: string;
  landing_page: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  notes: LeadNote[];
};

export type Stats = {
  total: number;
  last7: number;
  prev7: number;
  pipelineValue: number;
  wonValue: number;
  winRate: number | null;
  byStatus: Record<LeadStatus, number>;
  daily: { day: string; count: number }[];
  byService: { label: string; count: number }[];
  bySource: { label: string; count: number }[];
  services: string[];
};

export type User = { id: number; email: string; name: string };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Fired when any call comes back 401 so the app can drop to the sign-in screen. */
export const UNAUTHORIZED_EVENT = 'rl:unauthorized';

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    credentials: 'same-origin',
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(data.error || 'Request failed.', response.status, data.fields);
  }
  return data as T;
}
