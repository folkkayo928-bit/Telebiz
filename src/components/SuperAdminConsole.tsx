import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowUpRight,
  Ban,
  Building2,
  CalendarPlus,
  CheckCircle2,
  CreditCard,
  Eye,
  Gift,
  KeyRound,
  LifeBuoy,
  MessageSquare,
  Plus,
  PauseCircle,
  RefreshCw,
  Search,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';

interface SuperAdminProps {
  authToken: string;
  onRefreshBusinesses: () => void;
}

const panelClass = 'rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

function StatusPill({ status }: { status?: string }) {
  const value = String(status || 'unknown');
  const normalized = value.toLowerCase();
  const tone = /(active|published|verified|paid|resolved|complete)/.test(normalized)
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
    : /(grace|pending|requested|open|review|configur)/.test(normalized)
      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
      : /(paused|suspended|blocked|failed|rejected|expired)/.test(normalized)
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
        : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

  return (
    <span className={'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ' + tone}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {value.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  Icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className={panelClass + ' group min-w-0 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md'}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' + accent}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 truncate text-[11px] text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950/50">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-900">
        <Building2 className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

export const SuperAdminConsole: React.FC<SuperAdminProps> = ({
  authToken,
  onRefreshBusinesses,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'businesses' | 'addons' | 'employees' | 'audit' | 'support'>('businesses');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Administrative Control Action Modal/Panel State
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [controlAction, setControlAction] = useState('EXTEND_SUBSCRIPTION');
  const [reason, setReason] = useState('');
  const [extendDays, setExtendDays] = useState(30);
  const [targetPlan, setTargetPlan] = useState('enterprise');
  const [targetAddonId, setTargetAddonId] = useState('add_ai_builder');
  const [restrictedList, setRestrictedList] = useState<string[]>([]);
  const [dfyTargetStatus, setDfyTargetStatus] = useState('published');
  const [confirmSlug, setConfirmSlug] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');
  const [actionError, setActionError] = useState('');

  // New Addon Form
  const [addonName, setAddonName] = useState('');
  const [addonCategory, setAddonCategory] = useState('AI & Automation');
  const [addonDesc, setAddonDesc] = useState('');
  const [addonMonthly, setAddonMonthly] = useState(750);
  const [addonYearly, setAddonYearly] = useState(7500);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/overview', {
        headers: { Authorization: 'Bearer ' + authToken },
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
        if (!selectedBiz && json.businesses?.length > 0) {
          setSelectedBiz(json.businesses[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [authToken]);

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <div className="h-36 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  const { metrics = {}, businesses = [], addons = [], allEmployees = [], auditLogs = [], platformSupport = [] } = data;

  const filteredBusinesses = businesses.filter((b: any) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter || b.subscription_status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      String(b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExecuteControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz) return;
    setActionError('');
    setActionFeedback('');

    const payload: any = {};
    if (controlAction === 'EXTEND_SUBSCRIPTION') payload.days = extendDays;
    if (controlAction === 'CHANGE_PLAN') payload.plan_id = targetPlan;
    if (controlAction === 'GRANT_FREE_SERVICE') {
      payload.addon_id = targetAddonId;
      payload.days = extendDays;
    }
    if (controlAction === 'TOGGLE_ADDON_ADMIN') {
      payload.addon_id = targetAddonId;
      payload.enable = true;
    }
    if (controlAction === 'RESTRICT_FUNCTIONALITY') {
      payload.restrictedFeatures = restrictedList;
    }
    if (controlAction === 'UPDATE_DFY_STATUS') {
      payload.dfy_status = dfyTargetStatus;
      payload.dfy_notes = selectedBiz.dfy_notes;
    }

    const res = await fetch('/api/superadmin/businesses/' + selectedBiz.id + '/control', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        controlAction,
        payload,
        reason,
        confirmBusinessSlug: confirmSlug,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setActionError(json.error || 'Administrative action failed');
    } else {
      setActionFeedback('Executed ' + controlAction + ' on ' + selectedBiz.name + ' and recorded immutable audit log.');
      setReason('');
      setConfirmSlug('');
      fetchOverview();
      onRefreshBusinesses();
    }
  };

  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/superadmin/addons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        name: addonName,
        category: addonCategory,
        description: addonDesc,
        monthly_price: addonMonthly,
        yearly_price: addonYearly,
        is_active: true,
      }),
    });
    if (res.ok) {
      setAddonName('');
      setAddonDesc('');
      fetchOverview();
    }
  };

  const metricCards = [
    {
      label: 'Registered businesses',
      value: Number(metrics.totalBusinesses || 0).toLocaleString(),
      detail: String(metrics.activeBusinesses || 0) + ' active · ' + String(metrics.pausedOrSuspendedBusinesses || 0) + ' paused or restricted',
      Icon: Building2,
      accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    {
      label: 'Subscription revenue',
      value: Number(metrics.subscriptionRevenue || 0).toLocaleString() + ' ETB',
      detail: 'Verified platform plans',
      Icon: CreditCard,
      accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      label: 'Add-on & service revenue',
      value: Number(metrics.addonRevenue || 0).toLocaleString() + ' ETB',
      detail: 'Marketplace and done-for-you services',
      Icon: Sparkles,
      accent: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
    },
    {
      label: 'Mini App visitors',
      value: Number(metrics.totalMiniAppVisitors || 0).toLocaleString(),
      detail: Number(metrics.totalCustomerEvents || 0).toLocaleString() + ' recorded customer events',
      Icon: Eye,
      accent: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    },
    {
      label: 'Platform orders',
      value: Number(metrics.totalPlatformOrders || 0).toLocaleString(),
      detail: Number(metrics.verifiedTransactionsCount || 0).toLocaleString() + ' verified payments',
      Icon: ShoppingCart,
      accent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
  ];

  const tabs = [
    { id: 'businesses', label: 'Businesses', count: businesses.length, Icon: Building2 },
    { id: 'addons', label: 'Add-ons', count: addons.length, Icon: Sparkles },
    { id: 'employees', label: 'Team oversight', count: allEmployees.length, Icon: Users },
    { id: 'support', label: 'Support desk', count: platformSupport.length, Icon: LifeBuoy },
    { id: 'audit', label: 'Audit trail', count: auditLogs.length, Icon: ScrollText },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-lg shadow-slate-900/10 sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              TeleBiz platform control
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Command center</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Manage business accounts, subscriptions, platform services, support and administrative activity from one workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              <Activity className="h-4 w-4 text-emerald-300" />
              Platform administration
            </span>
            <button
              type="button"
              onClick={fetchOverview}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={'h-4 w-4 ' + (loading ? 'animate-spin' : '')} />
              Refresh data
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.Icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id as any)}
                className={
                  'inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ' +
                  (active
                    ? 'border-slate-950 bg-slate-950 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-950'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800')
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className={'rounded-full px-2 py-0.5 text-[10px] ' + (active ? 'bg-white/15 text-white dark:bg-slate-900/10 dark:text-slate-900' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {subTab === 'businesses' && (
          <div className="grid items-start gap-5 2xl:grid-cols-12">
            <section className={panelClass + ' min-w-0 overflow-hidden 2xl:col-span-7'}>
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">Business directory</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select a business to review its account and apply an administrative action.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 sm:min-w-56">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search businesses..."
                        className={fieldClass + ' pl-9'}
                        aria-label="Search businesses"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={fieldClass + ' sm:w-40'}
                      aria-label="Filter businesses by status"
                    >
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="grace_period">Grace period</option>
                      <option value="paused">Paused</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredBusinesses.length === 0 ? (
                <div className="p-5 sm:p-6">
                  <EmptyState title="No businesses found" detail="Try another search term or change the status filter." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[690px] text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5 sm:px-6">Business</th>
                        <th className="px-3 py-3.5">Creation</th>
                        <th className="px-3 py-3.5">Plan</th>
                        <th className="px-5 py-3.5 text-right sm:px-6">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredBusinesses.map((b: any) => {
                        const selected = selectedBiz?.id === b.id;
                        return (
                          <tr
                            key={b.id}
                            onClick={() => setSelectedBiz(b)}
                            className={'cursor-pointer transition ' + (selected ? 'bg-indigo-50/70 dark:bg-indigo-950/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40')}
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ' + (selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>
                                  {String(b.name || 'B').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{b.name}</p>
                                  <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{b.category} · {b.telegram_bot_username || 'No bot connected'}</p>
                                  <div className="mt-2"><StatusPill status={b.status} /></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{String(b.creation_method || '').replace(/_/g, ' ')}</p>
                              {b.creation_method === 'done_for_you' && <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-300">Build: {String(b.dfy_status || 'requested').replace(/_/g, ' ')}</p>}
                            </td>
                            <td className="px-3 py-4">
                              <p className="text-xs font-semibold uppercase text-slate-800 dark:text-slate-100">{b.plan_id || '—'}</p>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{String(b.subscription_status || 'unknown').replace(/_/g, ' ')}</p>
                              <p className="mt-1 text-[10px] text-slate-400">Expires {b.subscription_expires_at ? String(b.subscription_expires_at).slice(0, 10) : '—'}</p>
                            </td>
                            <td className="px-5 py-4 text-right sm:px-6">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedBiz(b); }}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-indigo-950/40"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-6">
                <span>Showing {filteredBusinesses.length} of {businesses.length} businesses</span>
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Administrative access</span>
              </div>
            </section>

            <section className={panelClass + ' 2xl:col-span-5'}>
              {selectedBiz ? (
                <>
                  <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Business controls</p>
                        <h2 className="mt-1 break-words text-base font-semibold text-slate-950 dark:text-white">{selectedBiz.name}</h2>
                        <p className="mt-1 break-all font-mono text-[10px] text-slate-400">{selectedBiz.slug}</p>
                      </div>
                      <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"><Building2 className="h-5 w-5" /></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusPill status={selectedBiz.status} />
                      <StatusPill status={selectedBiz.subscription_status} />
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Grace period: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedBiz.grace_period_days || 0} days</span></p>
                  </div>

                  <div className="space-y-4 p-5 sm:p-6">
                    {actionFeedback && (
                      <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {actionFeedback}
                      </div>
                    )}
                    {actionError && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                        {actionError}
                      </div>
                    )}

                    <form onSubmit={handleExecuteControl} className="space-y-4">
                      <div>
                        <label className={labelClass}>Administrative action</label>
                        <select value={controlAction} onChange={(e) => setControlAction(e.target.value)} className={fieldClass}>
                          <option value="PAUSE_BUSINESS">Pause business temporarily</option>
                          <option value="RESTRICT_FUNCTIONALITY">Restrict selected features</option>
                          <option value="SUSPEND_BUSINESS">Suspend business — preserve records</option>
                          <option value="RESTORE_ACCESS">Restore full access</option>
                          <option value="EXTEND_SUBSCRIPTION">Extend subscription</option>
                          <option value="CHANGE_PLAN">Change subscription plan</option>
                          <option value="GRANT_FREE_SERVICE">Grant promotional service / trial</option>
                          <option value="TOGGLE_ADDON_ADMIN">Enable or assign an add-on</option>
                          <option value="RESET_OWNER_ACCESS">Reset owner access and revoke sessions</option>
                          <option value="UPDATE_DFY_STATUS">Update done-for-you build stage</option>
                          <option value="DELETE_BUSINESS">Permanently delete business</option>
                        </select>
                      </div>

                      {controlAction === 'EXTEND_SUBSCRIPTION' && (
                        <div>
                          <label className={labelClass}>Days to extend</label>
                          <input type="number" min="1" value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value))} className={fieldClass} />
                        </div>
                      )}

                      {controlAction === 'CHANGE_PLAN' && (
                        <div>
                          <label className={labelClass}>Target plan</label>
                          <select value={targetPlan} onChange={(e) => setTargetPlan(e.target.value)} className={fieldClass}>
                            <option value="free">Free plan</option>
                            <option value="growth">Growth plan</option>
                            <option value="enterprise">Enterprise plan</option>
                          </select>
                        </div>
                      )}

                      {(controlAction === 'GRANT_FREE_SERVICE' || controlAction === 'TOGGLE_ADDON_ADMIN') && (
                        <div>
                          <label className={labelClass}>Add-on service</label>
                          <select value={targetAddonId} onChange={(e) => setTargetAddonId(e.target.value)} className={fieldClass}>
                            {addons.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.monthly_price} ETB/mo)</option>)}
                          </select>
                        </div>
                      )}

                      {controlAction === 'RESTRICT_FUNCTIONALITY' && (
                        <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-700">
                          <label className={labelClass}>Features to restrict</label>
                          <div className="space-y-3">
                            {['ai_builder', 'broadcast_campaigns', 'custom_domain'].map((feat) => (
                              <label key={feat} className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={restrictedList.includes(feat)}
                                  onChange={(e) => setRestrictedList((prev) => e.target.checked ? [...prev, feat] : prev.filter((x) => x !== feat))}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{feat.replace(/_/g, ' ')}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {controlAction === 'UPDATE_DFY_STATUS' && (
                        <div>
                          <label className={labelClass}>Done-for-you stage</label>
                          <select value={dfyTargetStatus} onChange={(e) => setDfyTargetStatus(e.target.value)} className={fieldClass}>
                            <option value="requested">Requested</option>
                            <option value="in_review">In review</option>
                            <option value="configuring">Configuring</option>
                            <option value="ready_for_preview">Ready for preview</option>
                            <option value="published">Published live</option>
                          </select>
                        </div>
                      )}

                      {controlAction === 'DELETE_BUSINESS' && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200">
                            <Trash2 className="h-4 w-4" /> Permanent deletion safeguard
                          </div>
                          <p className="mt-2 text-[11px] leading-5 text-rose-700 dark:text-rose-300">This is a destructive action. Type the exact business slug to confirm: <span className="font-mono font-bold">{selectedBiz.slug}</span></p>
                          <input type="text" value={confirmSlug} onChange={(e) => setConfirmSlug(e.target.value)} placeholder={selectedBiz.slug} className={fieldClass + ' mt-3 border-rose-200 font-mono dark:border-rose-900'} />
                        </div>
                      )}

                      <div>
                        <label className={labelClass}>Reason for audit log</label>
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Explain why this action is needed..."
                          className={fieldClass}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className={'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 ' + (controlAction === 'DELETE_BUSINESS' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-950 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500')}
                      >
                        {controlAction === 'DELETE_BUSINESS' ? <Trash2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                        Execute action and record audit
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-5 sm:p-6"><EmptyState title="Select a business" detail="Choose a business from the directory to review its status and manage its account." /></div>
              )}
            </section>
          </div>
        )}

        {subTab === 'addons' && (
          <div className="grid items-start gap-5 xl:grid-cols-12">
            <section className={panelClass + ' overflow-hidden xl:col-span-7'}>
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Add-on catalog</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Services available to businesses on the platform.</p>
              </div>
              {addons.length === 0 ? (
                <div className="p-5"><EmptyState title="No add-ons yet" detail="Create the first optional service using the form." /></div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {addons.map((a: any) => (
                    <div key={a.id} className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"><Sparkles className="h-5 w-5" /></div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.name}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{a.category}</p>
                          <p className="mt-2 max-w-xl text-xs leading-5 text-slate-600 dark:text-slate-300">{a.description}</p>
                        </div>
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{Number(a.monthly_price).toLocaleString()} ETB<span className="text-[11px] font-normal text-slate-400"> / mo</span></p>
                        <p className="mt-1 text-[11px] text-slate-500">{Number(a.yearly_price).toLocaleString()} ETB / year</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={panelClass + ' p-5 sm:p-6 xl:col-span-5'}>
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"><Plus className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Create an add-on</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Publish an optional business service.</p>
                </div>
              </div>
              <form onSubmit={handleCreateAddon} className="space-y-4">
                <div>
                  <label className={labelClass}>Add-on name</label>
                  <input type="text" value={addonName} onChange={(e) => setAddonName(e.target.value)} placeholder="e.g. Advanced analytics" className={fieldClass} required />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <input type="text" value={addonCategory} onChange={(e) => setAddonCategory(e.target.value)} className={fieldClass} required />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={addonDesc} onChange={(e) => setAddonDesc(e.target.value)} className={fieldClass + ' resize-y'} required />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label className={labelClass}>Monthly price (ETB)</label><input type="number" min="0" value={addonMonthly} onChange={(e) => setAddonMonthly(Number(e.target.value))} className={fieldClass} /></div>
                  <div><label className={labelClass}>Yearly price (ETB)</label><input type="number" min="0" value={addonYearly} onChange={(e) => setAddonYearly(Number(e.target.value))} className={fieldClass} /></div>
                </div>
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-indigo-500">
                  <Plus className="h-4 w-4" /> Publish add-on
                </button>
              </form>
            </section>
          </div>
        )}

        {subTab === 'employees' && (
          <section className={panelClass + ' overflow-hidden'}>
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"><Users className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Employee and access oversight</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review workforce access across business accounts.</p>
                </div>
              </div>
            </div>
            {allEmployees.length === 0 ? (
              <div className="p-5"><EmptyState title="No employee accounts" detail="Employee accounts will appear here when businesses invite their teams." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr><th className="px-5 py-3.5">Employee</th><th className="px-3 py-3.5">Business</th><th className="px-3 py-3.5">Role</th><th className="px-3 py-3.5">Permissions</th><th className="px-5 py-3.5">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {allEmployees.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{e.name}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{e.email}</p>
                        </td>
                        <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{e.business_name}</td>
                        <td className="px-3 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">{e.role}</span></td>
                        <td className="max-w-xs truncate px-3 py-4 font-mono text-[10px] text-slate-500" title={e.permissions_json}>{e.permissions_json}</td>
                        <td className="px-5 py-4"><StatusPill status={e.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {subTab === 'support' && (
          <section className={panelClass + ' overflow-hidden'}>
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><LifeBuoy className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Business owner support</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Conversations between the platform team and business owners.</p>
                </div>
              </div>
            </div>
            {platformSupport.length === 0 ? (
              <div className="p-5"><EmptyState title="No support conversations" detail="Messages from business owners will appear here." /></div>
            ) : (
              <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
                {platformSupport.map((conv: any) => (
                  <article key={conv.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-indigo-900">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{String(conv.customer_name || 'B').slice(0, 1).toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{conv.customer_name}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{conv.subject}</p>
                        </div>
                      </div>
                      <StatusPill status={conv.status} />
                    </div>
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {(conv.messages || []).map((m: any) => (
                        <div key={m.id} className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{m.sender_name}: </span>{m.body}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {subTab === 'audit' && (
          <section className={panelClass + ' overflow-hidden'}>
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><ScrollText className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Administrative audit trail</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review recorded changes, responsible administrators and reasons.</p>
                </div>
              </div>
            </div>
            {auditLogs.length === 0 ? (
              <div className="p-5"><EmptyState title="No audit entries yet" detail="Administrative actions will be listed here once recorded." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr><th className="px-5 py-3.5">Timestamp</th><th className="px-3 py-3.5">Administrator</th><th className="px-3 py-3.5">Action</th><th className="px-3 py-3.5">Change</th><th className="px-5 py-3.5">Reason</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-[10px] text-slate-500">{log.created_at ? String(log.created_at).slice(0, 19).replace('T', ' ') : '—'}</td>
                        <td className="px-3 py-4"><p className="font-semibold text-slate-800 dark:text-slate-100">{log.actor_name}</p><p className="mt-1 text-[10px] text-slate-500">{log.actor_role}</p></td>
                        <td className="px-3 py-4"><span className="rounded-lg bg-indigo-50 px-2 py-1.5 font-mono text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{log.action}</span></td>
                        <td className="max-w-sm whitespace-normal px-3 py-4 text-[11px] leading-5 text-slate-600 dark:text-slate-300">{log.previous_value ? <span>{log.previous_value} <ArrowUpRight className="mx-1 inline h-3 w-3" /> </span> : null}{log.new_value || '—'}</td>
                        <td className="max-w-xs whitespace-normal px-5 py-4 text-[11px] leading-5 text-slate-500">{log.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </section>
    </div>
  );
};
