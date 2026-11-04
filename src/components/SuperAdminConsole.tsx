import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowUpRight,
  Ban,
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  LifeBuoy,
  Package,
  Plus,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';

interface SuperAdminProps {
  authToken: string;
  onRefreshBusinesses: () => void;
  onPreviewBusiness?: (biz: any) => void;
  onEditBusinessCatalog?: (biz: any) => void;
  onOpenCreateBusiness?: () => void;
}

const panelClass = 'rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Categories',
  retail: 'Retail & Boutique',
  coffee_shop: 'Coffee & Roastery',
  restaurant: 'Restaurant & Dining',
  hotel: 'Hotel & Hospitality',
  salon: 'Salon & Wellness',
  real_estate: 'Real Estate',
  digital: 'Digital Products',
  education: 'Education',
  services: 'Services',
};

function StatusPill({ status }: { status?: string }) {
  const value = String(status || 'unknown');
  const normalized = value.toLowerCase();
  const tone = /(active|published|verified|paid|resolved|complete)/.test(normalized)
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
    : /(grace|pending|requested|open|review|configur)/.test(normalized)
      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
      : /(paused|suspended|blocked|failed|rejected|expired|cancelled)/.test(normalized)
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
  onPreviewBusiness,
  onEditBusinessCatalog,
  onOpenCreateBusiness,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'businesses' | 'users' | 'addons' | 'employees' | 'audit' | 'support'>('businesses');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

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
        if (json.businesses?.length > 0) {
          setSelectedBiz((prev: any) => {
            if (!prev) return json.businesses[0];
            return json.businesses.find((b: any) => b.id === prev.id) || json.businesses[0];
          });
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

  const {
    metrics = {},
    businesses = [],
    allUsers = [],
    allCustomers = [],
    addons = [],
    allEmployees = [],
    auditLogs = [],
    platformSupport = [],
    pendingPlatformPayments = [],
  } = data;

  const availableCategories: string[] = Array.from(
    new Set(['all', ...businesses.map((b: any) => String(b.category || 'retail'))])
  );

  const filteredBusinesses = businesses.filter((b: any) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter || b.subscription_status === statusFilter;
    const matchesCat = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      String(b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.owner_uid || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCat && matchesSearch;
  });

  const handleQuickBizAction = async (biz: any, actionType: 'SUSPEND_BUSINESS' | 'PAUSE_BUSINESS' | 'RESTORE_ACCESS' | 'DELETE_BUSINESS') => {
    setActionError('');
    setActionFeedback('');
    const res = await fetch('/api/superadmin/businesses/' + biz.id + '/control', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        controlAction: actionType,
        payload: {},
        reason: `Admin quick governance action (${actionType})`,
        confirmBusinessSlug: actionType === 'DELETE_BUSINESS' ? biz.slug : '',
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setActionError(json.error || 'Action failed');
    } else {
      setActionFeedback(`Executed ${actionType.replace(/_/g, ' ')} on "${biz.name}".`);
      await fetchOverview();
      onRefreshBusinesses();
    }
  };

  const handleUserControl = async (user: any, action: 'BLOCK_USER' | 'UNBLOCK_USER' | 'DELETE_USER') => {
    setActionError('');
    setActionFeedback('');
    const res = await fetch(`/api/superadmin/users/${user.id}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        action,
        reason: `Platform Admin ${action} on ${user.name}`,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setActionError(json.error || 'User control action failed');
    } else {
      setActionFeedback(`Updated user "${user.name}" (${action.replace(/_/g, ' ')}).`);
      await fetchOverview();
      onRefreshBusinesses();
    }
  };

  const handleCustomerControl = async (customer: any, action: 'BLOCK_CUSTOMER' | 'UNBLOCK_CUSTOMER' | 'DELETE_CUSTOMER') => {
    const res = await fetch(`/api/superadmin/customers/${customer.id}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setActionFeedback(`Updated customer "${customer.name}" (${action.replace(/_/g, ' ')}).`);
      await fetchOverview();
    }
  };

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

  const handleVerifyPlatformPayment = async (payment: any, action: 'verify' | 'reject') => {
    setActionError('');
    setActionFeedback('');
    const res = await fetch(`/api/superadmin/payments/${payment.id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        action,
        reason:
          action === 'verify'
            ? `Verified platform ${payment.payment_type} transfer (${payment.transaction_reference || payment.id})`
            : `Rejected unverified platform ${payment.payment_type} transfer`,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setActionError(json.error || 'Could not process platform payment verification.');
    } else {
      setActionFeedback(
        action === 'verify'
          ? `Verified platform payment for ${payment.business_name || payment.business_id} and activated service.`
          : `Rejected platform payment for ${payment.business_name || payment.business_id}.`
      );
      await fetchOverview();
      onRefreshBusinesses();
    }
  };

  const metricCards = [
    {
      label: 'Registered businesses',
      value: Number(metrics.totalBusinesses || 0).toLocaleString(),
      detail: String(metrics.activeBusinesses || 0) + ' active · ' + String(metrics.pausedOrSuspendedBusinesses || 0) + ' paused/suspended',
      Icon: Building2,
      accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    {
      label: 'Store owners & users',
      value: Number(metrics.totalStoreOwners || 0).toLocaleString() + ' Owners',
      detail: Number(metrics.totalCustomers || 0).toLocaleString() + ' tracked store customers',
      Icon: Users,
      accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      label: 'Platform revenue',
      value: Number((metrics.subscriptionRevenue || 0) + (metrics.addonRevenue || 0)).toLocaleString() + ' ETB',
      detail: 'Subscriptions + add-on services',
      Icon: CreditCard,
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
    { id: 'businesses', label: 'Businesses by Category & Catalog', count: businesses.length, Icon: Building2 },
    { id: 'users', label: 'Store Owners & Customers', count: allUsers.length + allCustomers.length, Icon: Users },
    { id: 'addons', label: 'Add-ons', count: addons.length, Icon: Sparkles },
    { id: 'employees', label: 'Team oversight', count: allEmployees.length, Icon: ShieldCheck },
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
              Role 1 · Platform Super Admin Command Center
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Full Platform Governance & Store Inspector</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Browse all businesses by category, click any business to preview its live storefront and inspect what they are selling, or block, add, and delete businesses and users.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onOpenCreateBusiness && (
              <button
                type="button"
                onClick={onOpenCreateBusiness}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Add New Business
              </button>
            )}
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

      {actionFeedback && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {actionFeedback}
          </span>
          <button type="button" onClick={() => setActionFeedback('')} className="underline">
            Dismiss
          </button>
        </div>
      )}
      {actionError && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError('')} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {pendingPlatformPayments.length > 0 && (
        <section className={panelClass + ' p-4 sm:p-5 border-amber-300 dark:border-amber-800'}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                Pending Platform Subscription &amp; Add-on Transfers ({pendingPlatformPayments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Verify manual transfer references before activating paid subscriptions or add-on services.
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingPlatformPayments.map((pmt: any) => (
              <div key={pmt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {pmt.business_name || pmt.business_id} ·{' '}
                    <span className="uppercase text-indigo-600 dark:text-indigo-400">{pmt.payment_type}</span>
                  </div>
                  <div className="text-slate-500">
                    Amount: <strong>{Number(pmt.amount || 0).toLocaleString()} {pmt.currency || 'ETB'}</strong> · Method:{' '}
                    <span className="font-semibold">{pmt.method}</span> · Ref:{' '}
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {pmt.customer_tx_ref || pmt.transaction_reference || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleVerifyPlatformPayment(pmt, 'verify')}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    Verify &amp; Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyPlatformPayment(pmt, 'reject')}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
          <div className="space-y-4">
            {/* Category Filter Bar for Admin */}
            <div className={panelClass + ' p-4'}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Browse Business Lists by Category
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Click any category below to filter stores, then click a business to preview its page and see what they are selling.
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat) => {
                  const count = cat === 'all' ? businesses.length : businesses.filter((b: any) => b.category === cat).length;
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={
                        'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ' +
                        (active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300')
                      }
                    >
                      <span>{CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ')}</span>
                      <span className={'rounded-full px-2 py-0.5 text-[10px] font-bold ' + (active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid items-start gap-5 2xl:grid-cols-12">
              <section className={panelClass + ' min-w-0 overflow-hidden 2xl:col-span-6'}>
                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div>
                      <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                        {CATEGORY_LABELS[categoryFilter] || categoryFilter} ({filteredBusinesses.length})
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Click any business row to inspect what they sell, preview their store, or block/delete.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="relative min-w-0 sm:min-w-48">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search store or owner..."
                          className={fieldClass + ' pl-9'}
                          aria-label="Search businesses"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={fieldClass + ' sm:w-36'}
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
                    <EmptyState title="No businesses found" detail="Try another category, search term, or status filter." />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBusinesses.map((b: any) => {
                      const selected = selectedBiz?.id === b.id;
                      const isBlocked = b.status === 'suspended' || b.status === 'paused';
                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBiz(b)}
                          className={
                            'cursor-pointer px-5 py-4 transition sm:px-6 ' +
                            (selected
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/30'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40')
                          }
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div
                                className={
                                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-xs '
                                }
                                style={{ backgroundColor: b.primary_color || '#4f46e5' }}
                              >
                                {String(b.name || 'B').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{b.name}</p>
                                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {CATEGORY_LABELS[b.category] || b.category}
                                  </span>
                                  <StatusPill status={b.status} />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  Owner: <span className="font-semibold text-slate-700 dark:text-slate-200">{b.owner_name}</span>{' '}
                                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">({b.owner_uid})</span>
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                    {Number(b.verifiedRevenue || 0).toLocaleString()} ETB sales
                                  </span>
                                  <span>·</span>
                                  <span>{b.productsCount || 0} products</span>
                                  <span>·</span>
                                  <span>{b.finishedOrdersCount || 0} finished</span>
                                  <span>·</span>
                                  <span>{b.pendingPaymentRequestsCount || 0} payment reqs</span>
                                  <span>·</span>
                                  <span className="text-rose-600">{b.rejectedOrdersCount || 0} rejected</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {onPreviewBusiness && (
                                <button
                                  type="button"
                                  onClick={() => onPreviewBusiness(b)}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Preview Store
                                </button>
                              )}
                              {isBlocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickBizAction(b, 'RESTORE_ACCESS')}
                                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                >
                                  <PlayCircle className="h-3.5 w-3.5" />
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickBizAction(b, 'SUSPEND_BUSINESS')}
                                  className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  Block
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedBiz(b)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                              >
                                Inspect
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* RIGHT COLUMN: SELECTED BUSINESS FULL CATALOG INSPECTOR & GOVERNANCE */}
              <section className={panelClass + ' 2xl:col-span-6'}>
                {selectedBiz ? (
                  <>
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
                            Admin Store Inspector · {CATEGORY_LABELS[selectedBiz.category] || selectedBiz.category}
                          </p>
                          <h2 className="mt-1 break-words text-lg font-bold text-slate-950 dark:text-white">
                            {selectedBiz.name}
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            Owner: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBiz.owner_name}</span> ({selectedBiz.owner_email}) ·{' '}
                            <span className="font-mono text-[11px] font-bold text-indigo-600">{selectedBiz.owner_uid}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {onPreviewBusiness && (
                            <button
                              type="button"
                              onClick={() => onPreviewBusiness(selectedBiz)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                            >
                              <Eye className="h-4 w-4" />
                              Preview Live Storefront Page
                            </button>
                          )}
                          {onEditBusinessCatalog && (
                            <button
                              type="button"
                              onClick={() => onEditBusinessCatalog(selectedBiz)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              <Package className="h-4 w-4 text-indigo-600" />
                              Edit Store Catalog
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Store Order & Sales Breakdown */}
                      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                          <div className="text-[10px] font-semibold uppercase text-slate-400">Verified Sales</div>
                          <div className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {Number(selectedBiz.verifiedRevenue || 0).toLocaleString()} ETB
                          </div>
                        </div>
                        <div className="rounded-xl bg-amber-50/70 p-3 dark:bg-amber-950/30">
                          <div className="text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-300">Payment Requests</div>
                          <div className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
                            {selectedBiz.pendingPaymentRequestsCount || 0} Pending
                          </div>
                        </div>
                        <div className="rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-950/30">
                          <div className="text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">Finished Orders</div>
                          <div className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                            {selectedBiz.finishedOrdersCount || 0} Completed
                          </div>
                        </div>
                        <div className="rounded-xl bg-rose-50/70 p-3 dark:bg-rose-950/30">
                          <div className="text-[10px] font-semibold uppercase text-rose-700 dark:text-rose-300">Rejected / Failed</div>
                          <div className="mt-1 text-sm font-bold text-rose-800 dark:text-rose-200">
                            {selectedBiz.rejectedOrdersCount || 0} Rejected
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WHAT THEY ARE SELLING (PRODUCTS & SERVICES CATALOG) */}
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            What {selectedBiz.name} Is Selling ({(selectedBiz.catalogProducts || []).length} Products · {(selectedBiz.catalogServices || []).length} Services)
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Live inventory, categories, and pricing listed on this business’s storefront.
                          </p>
                        </div>
                      </div>

                      {(selectedBiz.catalogProducts || []).length === 0 ? (
                        <p className="text-xs text-slate-400 py-3">No products listed in this store yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                          {(selectedBiz.catalogProducts || []).map((prod: any) => (
                            <div
                              key={prod.id}
                              className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/50"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white truncate">{prod.name}</div>
                                <div className="text-[10px] text-slate-500">
                                  Category: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{prod.category_name}</span> · Stock: {prod.stock}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="font-mono font-bold text-slate-900 dark:text-white">
                                  {Number(prod.price).toLocaleString()} {prod.currency || 'ETB'}
                                </div>
                                {Number(prod.discount_percent) > 0 && (
                                  <span className="inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                                    {prod.discount_percent}% OFF
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Administrative Governance Controls */}
                    <div className="space-y-4 p-5 sm:p-6">
                      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleQuickBizAction(selectedBiz, 'SUSPEND_BUSINESS')}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Block / Suspend Store
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickBizAction(selectedBiz, 'PAUSE_BUSINESS')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <PauseCircle className="h-3.5 w-3.5" />
                          Pause Store
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickBizAction(selectedBiz, 'RESTORE_ACCESS')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          Restore / Activate Store
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickBizAction(selectedBiz, 'DELETE_BUSINESS')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Store
                        </button>
                      </div>

                      <form onSubmit={handleExecuteControl} className="space-y-4">
                        <div>
                          <label className={labelClass}>Advanced administrative action</label>
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
                  <div className="p-5 sm:p-6"><EmptyState title="Select a business" detail="Choose a business from the directory to review its catalog, preview its storefront, and manage its account." /></div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: STORE OWNERS & CUSTOMERS GOVERNANCE */}
        {subTab === 'users' && (
          <div className="space-y-6">
            <section className={panelClass + ' overflow-hidden'}>
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                    Store Owners & Platform Administrators ({allUsers.length})
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Each Store Owner is isolated to their own store(s) via their Unique Owner UID. As Admin, you can block, unblock, or delete any user.
                  </p>
                </div>
                <div className="relative sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search owners or customers..."
                    className={fieldClass + ' pl-9'}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">User / Store Owner</th>
                      <th className="px-3 py-3.5">Role & Unique ID</th>
                      <th className="px-3 py-3.5">Owned Store(s)</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {allUsers
                      .filter(
                        (u: any) =>
                          !userSearch ||
                          String(u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                          String(u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                          String(u.owner_uid || '').toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((u: any) => {
                        const isBlocked = u.account_status === 'blocked';
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                {u.email} {u.telegram_username ? `· ${u.telegram_username}` : ''}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              <span
                                className={
                                  'inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ' +
                                  (u.platform_role === 'super_admin'
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300')
                                }
                              >
                                {u.platform_role === 'super_admin' ? '1. Platform Admin' : '2. Store Owner'}
                              </span>
                              <div className="mt-1 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                {u.owner_uid}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              {(u.ownedBusinesses || []).length === 0 ? (
                                <span className="text-slate-400">
                                  {u.platform_role === 'super_admin' ? 'All Platform Stores (Admin)' : 'No stores yet'}
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {u.ownedBusinesses.map((ob: any) => (
                                    <span
                                      key={ob.id}
                                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                      {ob.name} ({ob.category})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-4">
                              <StatusPill status={u.account_status || 'active'} />
                            </td>
                            <td className="px-5 py-4 text-right">
                              {u.platform_role !== 'super_admin' && (
                                <div className="inline-flex items-center gap-2">
                                  {isBlocked ? (
                                    <button
                                      type="button"
                                      onClick={() => handleUserControl(u, 'UNBLOCK_USER')}
                                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                    >
                                      Unblock Owner
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleUserControl(u, 'BLOCK_USER')}
                                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                    >
                                      Block Owner
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleUserControl(u, 'DELETE_USER')}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Customers Directory */}
            <section className={panelClass + ' overflow-hidden'}>
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  3. Store Customers Directory ({allCustomers.length})
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Customers are automatically recognized 24/7 via Customer UID (`CUS-247-...`) and attributed to the specific store they visit.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-3 py-3.5">Customer UID & Store Owner UID</th>
                      <th className="px-3 py-3.5">Store Visited</th>
                      <th className="px-3 py-3.5">Spent & Visits</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {allCustomers
                      .filter(
                        (c: any) =>
                          !userSearch ||
                          String(c.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                          String(c.business_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                          String(c.customer_uid || '').toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((c: any) => {
                        const isBlocked = c.status === 'blocked';
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">{c.phone}</p>
                            </td>
                            <td className="px-3 py-4 font-mono text-[11px]">
                              <div className="font-bold text-indigo-600 dark:text-indigo-400">{c.customer_uid || 'CUS-247'}</div>
                              <div className="text-[10px] text-slate-400">Owner: {c.owner_uid}</div>
                            </td>
                            <td className="px-3 py-4 font-semibold text-slate-800 dark:text-slate-200">{c.business_name}</td>
                            <td className="px-3 py-4 tabular-nums">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                {Number(c.total_spent || 0).toLocaleString()} ETB
                              </span>{' '}
                              · {c.visits_count || 1} visits
                            </td>
                            <td className="px-3 py-4">
                              <StatusPill status={c.status || 'active'} />
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                {isBlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCustomerControl(c, 'UNBLOCK_CUSTOMER')}
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                                  >
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCustomerControl(c, 'BLOCK_CUSTOMER')}
                                    className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
                                  >
                                    Block
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCustomerControl(c, 'DELETE_CUSTOMER')}
                                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
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
                        <td className="max-w-xs whitespace-normal px-3 py-4 text-[11px] leading-5 text-slate-500">{log.reason || '—'}</td>
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
