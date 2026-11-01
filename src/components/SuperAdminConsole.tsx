import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  PauseCircle,
  Ban,
  RefreshCw,
  CalendarPlus,
  Gift,
  KeyRound,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';

interface SuperAdminProps {
  authToken: string;
  onRefreshBusinesses: () => void;
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
        headers: { Authorization: `Bearer ${authToken}` },
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
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const { metrics, businesses = [], addons = [], allEmployees = [], auditLogs = [], platformSupport = [] } = data;

  const filteredBusinesses = businesses.filter((b: any) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter || b.subscription_status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
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

    const res = await fetch(`/api/superadmin/businesses/${selectedBiz.id}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
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
      setActionFeedback(`Executed ${controlAction} on ${selectedBiz.name} and recorded immutable audit log.`);
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
        Authorization: `Bearer ${authToken}`,
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

  return (
    <div className="space-y-6">
      {/* Platform-Wide Monitoring KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500">Registered Businesses</div>
          <div className="mt-1 text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
            {metrics.totalBusinesses}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.activeBusinesses} active · {metrics.pausedOrSuspendedBusinesses} restricted
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500">Subscription Revenue</div>
          <div className="mt-1 text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
            {Number(metrics.subscriptionRevenue).toLocaleString()} ETB
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified Platform Plans</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500">Add-on & DFY Revenue</div>
          <div className="mt-1 text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
            {Number(metrics.addonRevenue).toLocaleString()} ETB
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Marketplace & Concierge</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500">Mini App Visitors</div>
          <div className="mt-1 text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
            {metrics.totalMiniAppVisitors}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.totalCustomerEvents} recorded funnel events
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500">Platform Orders</div>
          <div className="mt-1 text-xl font-display font-bold text-slate-900 dark:text-white tabular-nums">
            {metrics.totalPlatformOrders}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.verifiedTransactionsCount} verified payments
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500">Platform Health</div>
          <div className="mt-1 text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400">
            99.98% Uptime
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">Multi-Tenant Isolation Active</div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit overflow-x-auto">
        {[
          { id: 'businesses', label: `Businesses & 10 Governance Controls (${businesses.length})` },
          { id: 'addons', label: `Add-on Marketplace Admin (${addons.length})` },
          { id: 'employees', label: `Employee & Access Oversight (${allEmployees.length})` },
          { id: 'support', label: `Business Owner Support (${platformSupport.length})` },
          { id: 'audit', label: `Immutable Audit Logs (${auditLogs.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              subTab === t.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BUSINESSES & 10 ADMINISTRATIVE CONTROLS */}
      {subTab === 'businesses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Directory Table (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search businesses by name, slug, or category..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="grace_period">Grace Period</option>
                <option value="paused">Paused</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2.5 pr-3 font-medium">Business</th>
                    <th className="py-2.5 px-3 font-medium">Creation & DFY</th>
                    <th className="py-2.5 px-3 font-medium">Plan & Sub</th>
                    <th className="py-2.5 pl-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBusinesses.map((b: any) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBiz(b)}
                      className={`cursor-pointer transition-colors ${
                        selectedBiz?.id === b.id
                          ? 'bg-sky-50/70 dark:bg-sky-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{b.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.category} · {b.telegram_bot_username || 'No bot'} · Status: {b.status.toUpperCase()}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div>{b.creation_method}</div>
                        {b.creation_method === 'done_for_you' && (
                          <div className="text-[11px] text-sky-600 font-medium">DFY: {b.dfy_status}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900 dark:text-white uppercase">{b.plan_id}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          {b.subscription_status} · Exp {b.subscription_expires_at.slice(0, 10)}
                        </div>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedBiz(b)}
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-white"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 10 Separate Administrative Controls Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            {selectedBiz ? (
              <>
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Selected Tenant for Governance</div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    {selectedBiz.name} ({selectedBiz.slug})
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Status: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBiz.status}</span> ·
                    Subscription: <span className="font-semibold">{selectedBiz.subscription_status}</span> · Grace Period:{' '}
                    {selectedBiz.grace_period_days} days
                  </div>
                </div>

                {actionFeedback && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-200">
                    {actionFeedback}
                  </div>
                )}
                {actionError && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                    {actionError}
                  </div>
                )}

                <form onSubmit={handleExecuteControl} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Select Administrative Control (10 Distinct Operations)
                    </label>
                    <select
                      value={controlAction}
                      onChange={(e) => setControlAction(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <option value="PAUSE_BUSINESS">1. Pause Business Temporarily</option>
                      <option value="RESTRICT_FUNCTIONALITY">2. Restrict Selected Functionality</option>
                      <option value="SUSPEND_BUSINESS">3. Suspend Business (Preserves Sales & Customer Data)</option>
                      <option value="RESTORE_ACCESS">4. Restore Full Access & Clear Restrictions</option>
                      <option value="EXTEND_SUBSCRIPTION">5. Extend Subscription Period</option>
                      <option value="CHANGE_PLAN">6. Upgrade or Downgrade Subscription Plan</option>
                      <option value="GRANT_FREE_SERVICE">7. Grant Free Promotional Service / Trial</option>
                      <option value="TOGGLE_ADDON_ADMIN">8. Enable or Assign Add-On Service</option>
                      <option value="RESET_OWNER_ACCESS">9. Reset Owner Credentials & Revoke Stale Sessions</option>
                      <option value="UPDATE_DFY_STATUS">Done-For-You: Update Concierge Build Status</option>
                      <option value="DELETE_BUSINESS">10. Permanently Delete Business (Requires Slug Safeguard)</option>
                    </select>
                  </div>

                  {controlAction === 'EXTEND_SUBSCRIPTION' && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Days to Extend</label>
                      <input
                        type="number"
                        value={extendDays}
                        onChange={(e) => setExtendDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  )}

                  {controlAction === 'CHANGE_PLAN' && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Plan</label>
                      <select
                        value={targetPlan}
                        onChange={(e) => setTargetPlan(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="free">Free Plan (5 AI runs)</option>
                        <option value="growth">Growth Plan (25 AI runs)</option>
                        <option value="enterprise">Enterprise Plan (100 AI runs)</option>
                      </select>
                    </div>
                  )}

                  {(controlAction === 'GRANT_FREE_SERVICE' || controlAction === 'TOGGLE_ADDON_ADMIN') && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Select Add-On Service</label>
                      <select
                        value={targetAddonId}
                        onChange={(e) => setTargetAddonId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        {addons.map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.monthly_price} ETB/mo)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {controlAction === 'RESTRICT_FUNCTIONALITY' && (
                    <div className="space-y-1.5">
                      <label className="block text-slate-600 dark:text-slate-400">Select Modules to Restrict</label>
                      {['ai_builder', 'broadcast_campaigns', 'custom_domain'].map((feat) => (
                        <label key={feat} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={restrictedList.includes(feat)}
                            onChange={(e) =>
                              setRestrictedList((prev) =>
                                e.target.checked ? [...prev, feat] : prev.filter((x) => x !== feat)
                              )
                            }
                          />
                          <span className="font-mono">{feat}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {controlAction === 'UPDATE_DFY_STATUS' && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">Done-For-You Stage</label>
                      <select
                        value={dfyTargetStatus}
                        onChange={(e) => setDfyTargetStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="requested">Requested</option>
                        <option value="in_review">In Review</option>
                        <option value="configuring">Configuring</option>
                        <option value="ready_for_preview">Ready for Preview</option>
                        <option value="published">Published Live</option>
                      </select>
                    </div>
                  )}

                  {controlAction === 'DELETE_BUSINESS' && (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 space-y-2">
                      <div className="text-rose-800 dark:text-rose-200 font-semibold">
                        Explicit Confirmation Safeguard
                      </div>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">
                        Type <span className="font-mono font-bold">{selectedBiz.slug}</span> below to confirm permanent removal:
                      </p>
                      <input
                        type="text"
                        value={confirmSlug}
                        onChange={(e) => setConfirmSlug(e.target.value)}
                        placeholder={selectedBiz.slug}
                        className="w-full px-3 py-1.5 rounded border border-rose-300 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mandatory Audit Log Reason
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Document why this administrative change is being performed..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold text-white ${
                      controlAction === 'DELETE_BUSINESS'
                        ? 'bg-rose-600 hover:bg-rose-500'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-sky-600'
                    }`}
                  >
                    Execute Control & Record Audit Entry
                  </button>
                </form>
              </>
            ) : (
              <div className="text-xs text-slate-500">Select a business from the directory to manage.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADD-ON MARKETPLACE ADMIN */}
      {subTab === 'addons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
              Platform Add-on Catalog & Pricing
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {addons.map((a: any) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {a.name} · <span className="text-slate-500 font-normal">{a.category}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{a.description}</p>
                  </div>
                  <div className="text-right font-mono shrink-0 tabular-nums">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {Number(a.monthly_price).toLocaleString()} ETB/mo
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {Number(a.yearly_price).toLocaleString()} ETB/yr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
              Create New Marketplace Add-On
            </h3>
            <form onSubmit={handleCreateAddon} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Add-On Name</label>
                <input
                  type="text"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                  placeholder="e.g., Dedicated High-Throughput Bot Cluster"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={addonCategory}
                  onChange={(e) => setAddonCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={addonDesc}
                  onChange={(e) => setAddonDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly (ETB)</label>
                  <input
                    type="number"
                    value={addonMonthly}
                    onChange={(e) => setAddonMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Yearly (ETB)</label>
                  <input
                    type="number"
                    value={addonYearly}
                    onChange={(e) => setAddonYearly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
              >
                Publish Add-On to Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYEE & ACCESS OVERSIGHT */}
      {subTab === 'employees' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
            Cross-Tenant Employee & Role Assignment Oversight
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 px-3">Business Tenant</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Permissions</th>
                  <th className="py-2 pl-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allEmployees.map((e: any) => (
                  <tr key={e.id}>
                    <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">
                      {e.name} ({e.email})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{e.business_name}</td>
                    <td className="py-2.5 px-3 uppercase font-mono">{e.role}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{e.permissions_json}</td>
                    <td className="py-2.5 pl-3 uppercase font-semibold">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM OWNER <-> BUSINESS OWNER SUPPORT */}
      {subTab === 'support' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
            Central Platform Support Desk (Communicate with Business Owners)
          </h3>
          <div className="space-y-3">
            {platformSupport.map((conv: any) => (
              <div key={conv.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {conv.customer_name} — {conv.subject}
                  </span>
                  <span className="font-mono text-slate-500 uppercase">{conv.status}</span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {conv.messages?.map((m: any) => (
                    <div key={m.id} className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">{m.sender_name}: </span>
                      {m.body}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE ADMINISTRATIVE AUDIT LOGS */}
      {subTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
              Immutable Administrative Audit Logs
            </h3>
            <p className="text-xs text-slate-500">
              Every sensitive administrative action is recorded with actor identity, previous and new values, timestamp, and mandatory reason.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 pr-3">Timestamp</th>
                  <th className="py-2 px-3">Administrator</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Previous → New Value</th>
                  <th className="py-2 pl-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500 tabular-nums">
                      {log.created_at.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      {log.actor_name} ({log.actor_role})
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-sky-700 dark:text-sky-400">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {log.previous_value ? `${log.previous_value} → ` : ''}
                      {log.new_value}
                    </td>
                    <td className="py-2.5 pl-3 text-slate-600 dark:text-slate-300">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
