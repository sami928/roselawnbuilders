import type { LeadStatus } from './api';

export const STATUSES: { value: LeadStatus; label: string; dot: string; badge: string }[] = [
  { value: 'new', label: 'New', dot: 'bg-[#be2b24]', badge: 'bg-[#fbe9e7] text-[#8e201e]' },
  { value: 'contacted', label: 'Contacted', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-800' },
  { value: 'estimate_scheduled', label: 'Estimate scheduled', dot: 'bg-sky-600', badge: 'bg-sky-50 text-sky-800' },
  { value: 'quoted', label: 'Quoted', dot: 'bg-violet-600', badge: 'bg-violet-50 text-violet-800' },
  { value: 'won', label: 'Won', dot: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-800' },
  { value: 'lost', label: 'Lost', dot: 'bg-stone-400', badge: 'bg-stone-100 text-stone-600' },
];

export const statusMeta = (status: LeadStatus) => STATUSES.find((item) => item.value === status) ?? STATUSES[0];

export const money = (value: number | null | undefined) =>
  value == null ? '—' : value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const compactMoney = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', notation: value >= 10000 ? 'compact' : 'standard', maximumFractionDigits: value >= 10000 ? 1 : 0 });

export function relativeTime(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}

export const fullDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
