import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink, HardHat, KeyRound, LogOut, Plus, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { api, type LeadStatus, type LeadSummary, type Stats, type User } from './api';
import { STATUSES, compactMoney, money, relativeTime, statusMeta } from './format';
import { LeadDrawer } from './LeadDrawer';
import { AddLeadModal, PasswordModal } from './Modals';

const PAGE_SIZE = 25;

export function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [service, setService] = useState('');
  const [sort, setSort] = useState('newest');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(() => Number(new URLSearchParams(window.location.search).get('lead')) || null);
  const [modal, setModal] = useState<'add' | 'password' | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => setPage(1), [status, service, sort, debouncedQuery]);

  const filterParams = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (service) params.set('service', service);
    if (debouncedQuery) params.set('q', debouncedQuery);
    return params;
  }, [status, service, debouncedQuery]);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    const params = new URLSearchParams(filterParams);
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));
    params.set('sort', sort);
    try {
      const [list, nextStats] = await Promise.all([api<{ leads: LeadSummary[]; total: number }>(`/admin/leads?${params}`), api<Stats>('/admin/stats')]);
      if (id !== requestId.current) return;
      setLeads(list.leads);
      setTotal(list.total);
      setStats(nextStats);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [filterParams, page, sort]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  // Keep the open lead in the URL so it can be bookmarked or shared with the team.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (openId) url.searchParams.set('lead', String(openId));
    else url.searchParams.delete('lead');
    window.history.replaceState({}, '', url);
  }, [openId]);

  const updateStatus = async (lead: LeadSummary, next: LeadStatus) => {
    setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status: next } : item)));
    await api(`/admin/leads/${lead.id}`, { method: 'PATCH', body: { status: next } }).catch(() => {});
    refresh().catch(() => {});
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#282a28] text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <span className="flex h-8 w-8 items-center justify-center bg-[#be2b24]">
            <HardHat size={16} />
          </span>
          <div className="mr-auto leading-tight">
            <p className="text-sm font-semibold">Roselawn Builders</p>
            <p className="text-[11px] text-stone-400">Lead dashboard</p>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 text-xs text-stone-300 hover:text-white sm:flex">
            View site <ExternalLink size={13} />
          </a>
          <span className="hidden text-xs text-stone-400 md:inline">{user.email}</span>
          <button className="p-2 text-stone-300 hover:text-white" onClick={() => setModal('password')} title="Change password" aria-label="Change password">
            <KeyRound size={17} />
          </button>
          <button className="p-2 text-stone-300 hover:text-white" onClick={onLogout} title="Sign out" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#be2b24]">Overview</p>
            <h1 className="mt-1 font-serif text-3xl tracking-tight">Leads</h1>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => refresh()} aria-label="Refresh">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <a className="btn-ghost" href={`/api/admin/leads.csv?${filterParams}`}>
              <Download size={15} /> Export CSV
            </a>
            <button className="btn-primary" onClick={() => setModal('add')}>
              <Plus size={16} /> Add lead
            </button>
          </div>
        </div>

        {stats && <StatTiles stats={stats} />}

        {stats && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <Panel title="Leads received" subtitle="Last 30 days">
              <DailyChart data={stats.daily} />
            </Panel>
            <Panel title="Pipeline" subtitle="Leads by stage">
              <StageBars stats={stats} active={status} onSelect={(value) => setStatus((current) => (current === value ? '' : value))} />
              {stats.bySource.length > 0 && (
                <div className="mt-5 border-t border-stone-200 pt-4">
                  <p className="mb-2 text-xs font-semibold text-stone-500">Top sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stats.bySource.map((item) => (
                      <span key={item.label} className="border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-stone-700">
                        {item.label} <strong className="ml-1 tabular-nums">{item.count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          </div>
        )}

        <section className="mt-6 border border-stone-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input className="input pl-9" placeholder="Search name, email, phone, ZIP, notes…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search leads" />
            </div>
            <select className="input w-auto" value={status} onChange={(event) => setStatus(event.target.value as LeadStatus | '')} aria-label="Filter by status">
              <option value="">All stages</option>
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select className="input w-auto" value={service} onChange={(event) => setService(event.target.value)} aria-label="Filter by project type">
              <option value="">All projects</option>
              {stats?.services.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="input w-auto" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="updated">Recently updated</option>
              <option value="value">Highest value</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Lead</th>
                  <th className="px-4 py-2.5 font-semibold">Project</th>
                  <th className="px-4 py-2.5 font-semibold">Timeline · Budget</th>
                  <th className="px-4 py-2.5 font-semibold">Stage</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Value</th>
                  <th className="px-4 py-2.5 font-semibold">Source</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className={`cursor-pointer transition hover:bg-[#faf7f2] ${openId === lead.id ? 'bg-[#faf7f2]' : ''}`} onClick={() => setOpenId(lead.id)}>
                    <td className="px-4 py-3">
                      <button className="text-left font-semibold text-stone-900 hover:text-[#be2b24]" onClick={() => setOpenId(lead.id)}>
                        {lead.status === 'new' && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#be2b24] align-middle" aria-label="Unread" />}
                        {lead.name}
                      </button>
                      <p className="text-xs text-stone-500">{[lead.phone, lead.email].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {lead.service || '—'}
                      {lead.zip && <p className="text-xs text-stone-400">ZIP {lead.zip}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600">
                      {lead.timeline || '—'}
                      <p className="text-stone-400">{lead.budget}</p>
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <StatusSelect value={lead.status} onChange={(next) => updateStatus(lead, next)} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-700">{money(lead.estimated_value)}</td>
                    <td className="px-4 py-3 text-xs text-stone-600">{lead.source}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-stone-500" title={new Date(lead.created_at).toLocaleString()}>
                      {relativeTime(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && leads.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className="font-serif text-lg">{stats?.total ? 'No leads match these filters.' : 'No leads yet.'}</p>
                <p className="mt-2 text-sm text-stone-500">{stats?.total ? 'Try clearing the search or stage filter.' : 'New requests from the website’s estimate form will appear here.'}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3 text-xs text-stone-500">
            <span>
              {total === 0 ? '0 leads' : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} leads`}
            </span>
            <div className="flex items-center gap-1">
              <button className="btn-ghost px-2 py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
                <ChevronLeft size={15} />
              </button>
              <span className="px-2 tabular-nums">
                {page} / {pages}
              </span>
              <button className="btn-ghost px-2 py-1.5" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {openId && <LeadDrawer id={openId} onClose={() => setOpenId(null)} onChanged={() => refresh().catch(() => {})} />}
      {modal === 'add' && (
        <AddLeadModal
          onClose={() => setModal(null)}
          onCreated={(id) => {
            setModal(null);
            refresh().catch(() => {});
            setOpenId(id);
          }}
        />
      )}
      {modal === 'password' && <PasswordModal onClose={() => setModal(null)} />}
    </div>
  );
}

export function StatusSelect({ value, onChange, large }: { value: LeadStatus; onChange: (value: LeadStatus) => void; large?: boolean }) {
  const meta = statusMeta(value);
  return (
    <label className={`relative inline-flex items-center gap-2 ${meta.badge} ${large ? 'px-3 py-2 text-sm' : 'px-2.5 py-1 text-xs'} font-semibold`}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
      <select className="absolute inset-0 cursor-pointer opacity-0" value={value} onChange={(event) => onChange(event.target.value as LeadStatus)} aria-label="Lead stage">
        {STATUSES.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-stone-400">{subtitle}</span>
      </div>
      {children}
    </section>
  );
}

function StatTiles({ stats }: { stats: Stats }) {
  const change = stats.last7 - stats.prev7;
  const tiles = [
    { label: 'Total leads', value: stats.total.toLocaleString(), hint: `${stats.byStatus.new} awaiting first contact` },
    {
      label: 'New this week',
      value: stats.last7.toLocaleString(),
      hint: (
        <span className={`inline-flex items-center gap-1 ${change > 0 ? 'text-emerald-700' : change < 0 ? 'text-[#8e201e]' : ''}`}>
          {change > 0 ? <TrendingUp size={13} /> : change < 0 ? <TrendingDown size={13} /> : null}
          {change === 0 ? 'Same as last week' : `${change > 0 ? '+' : ''}${change} vs. previous 7 days`}
        </span>
      ),
    },
    { label: 'Open pipeline', value: compactMoney(stats.pipelineValue), hint: 'Estimated value of active leads' },
    {
      label: 'Win rate',
      value: stats.winRate == null ? '—' : `${Math.round(stats.winRate * 100)}%`,
      hint: `${compactMoney(stats.wonValue)} won · ${stats.byStatus.won} of ${stats.byStatus.won + stats.byStatus.lost} closed`,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="border border-stone-200 bg-white p-5">
          <p className="text-xs font-semibold text-stone-500">{tile.label}</p>
          <p className="mt-2 font-serif text-3xl tabular-nums tracking-tight">{tile.value}</p>
          <p className="mt-1.5 text-xs text-stone-500">{tile.hint}</p>
        </div>
      ))}
    </div>
  );
}

function DailyChart({ data }: { data: Stats['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((item) => item.count));
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, index) => index) : [0, Math.round(max / 2), max];
  const sum = data.reduce((total, item) => total + item.count, 0);
  const label = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div>
      <p className="mb-3 text-xs text-stone-500">
        <strong className="font-serif text-xl font-normal tabular-nums text-stone-900">{sum}</strong> leads in 30 days
      </p>
      <div className="relative flex h-44 gap-2">
        <div className="relative w-5 text-right text-[10px] tabular-nums text-stone-400">
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 leading-none" style={{ bottom: `calc(${(tick / max) * 100}% - 5px)` }}>
              {tick}
            </span>
          ))}
        </div>
        <div className="relative flex-1" role="img" aria-label={`Bar chart of leads per day for the last 30 days, ${sum} total, peak of ${max} in one day.`}>
          {ticks.map((tick) => (
            <div key={tick} className="absolute inset-x-0 border-t border-stone-100" style={{ bottom: `${(tick / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {data.map((item, index) => (
              <div key={item.day} className="relative flex h-full flex-1 items-end" onMouseEnter={() => setHover(index)}>
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${hover === index ? 'bg-[#8e201e]' : 'bg-[#be2b24]'}`}
                  style={{ height: item.count ? `${(item.count / max) * 100}%` : 0, minHeight: item.count ? 3 : 0 }}
                />
                {hover === index && (
                  <div className={`pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap bg-[#282a28] px-2 py-1 text-[11px] text-white shadow ${index > data.length - 5 ? 'right-0' : index < 4 ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}>
                    {label(item.day)} · <strong>{item.count}</strong> {item.count === 1 ? 'lead' : 'leads'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-7 mt-2 flex justify-between text-[10px] text-stone-400">
        <span>{label(data[0].day)}</span>
        <span>{label(data[Math.floor(data.length / 2)].day)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function StageBars({ stats, active, onSelect }: { stats: Stats; active: LeadStatus | ''; onSelect: (status: LeadStatus) => void }) {
  const max = Math.max(1, ...Object.values(stats.byStatus));
  return (
    <ul className="space-y-1">
      {STATUSES.map((item) => {
        const count = stats.byStatus[item.value] ?? 0;
        return (
          <li key={item.value}>
            <button
              className={`grid w-full grid-cols-[130px_1fr_28px] items-center gap-3 px-1.5 py-1.5 text-left text-xs transition hover:bg-stone-50 ${active === item.value ? 'bg-stone-100' : ''}`}
              onClick={() => onSelect(item.value)}
              aria-pressed={active === item.value}
            >
              <span className="flex items-center gap-2 text-stone-700">
                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                {item.label}
              </span>
              <span className="h-2 bg-stone-100">
                <span className="block h-full rounded-r-[4px] bg-stone-700" style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span className="text-right font-semibold tabular-nums text-stone-800">{count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
