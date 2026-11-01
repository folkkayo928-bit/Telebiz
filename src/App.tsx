/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Building2,
  MoreHorizontal,
  Layers,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Users,
  Megaphone,
  Send,
  CreditCard,
  ShieldAlert,
  Plus,
  Download,
  CheckCircle2,
  ExternalLink,
  Search,
  Lock,
} from 'lucide-react';
import { translations, LANGUAGE_LABELS, LanguageCode, BUSINESS_CATEGORIES } from './i18n/translations';
import { MiniAppStorefront } from './components/MiniAppStorefront';
import { BuilderStudio } from './components/BuilderStudio';
import { SuperAdminConsole } from './components/SuperAdminConsole';

type ActiveModule =
  | 'overview'
  | 'builder'
  | 'commerce'
  | 'orders'
  | 'support'
  | 'analytics'
  | 'team'
  | 'marketing'
  | 'telegram'
  | 'subscriptions'
  | 'superadmin';

export default function App() {
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('telebiz_token') || '');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('biz_kaffa');
  const [workspace, setWorkspace] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [supportThreads, setSupportThreads] = useState<any[]>([]);
  const [marketplaceAddons, setMarketplaceAddons] = useState<any[]>([]);
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState(true);

  // Modals & Interactive States
  const [fullStorefrontOpen, setFullStorefrontOpen] = useState(false);
  const [newBizModalOpen, setNewBizModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  // New Business Form State
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState('retail');
  const [newBizMethod, setNewBizMethod] = useState<'self_service' | 'done_for_you' | 'ai_builder'>('self_service');
  const [newBizDesc, setNewBizDesc] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('+251 911 223 344');
  const [newBizAddress, setNewBizAddress] = useState('Bole, Addis Ababa');
  const [newBizBot, setNewBizBot] = useState('');
  const [newBizDfyNotes, setNewBizDfyNotes] = useState('');

  // Product & Service Creation Forms
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Signature Offerings');
  const [prodPrice, setProdPrice] = useState(950);
  const [prodStock, setProdStock] = useState(30);
  const [prodDesc, setProdDesc] = useState('');
  const [prodVariations, setProdVariations] = useState('Standard, Large');

  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState(60);
  const [srvPrice, setSrvPrice] = useState(1200);
  const [srvDesc, setSrvDesc] = useState('');

  // Support Reply State
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [cannedTitle, setCannedTitle] = useState('');
  const [cannedShortcut, setCannedShortcut] = useState('');
  const [cannedContent, setCannedContent] = useState('');
  const [cannedKeyword, setCannedKeyword] = useState('');

  // Employee, Branch & Expense Forms
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState('sales');
  const [empPerms, setEmpPerms] = useState<string[]>(['orders.manage', 'support.reply']);

  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('Inventory & Supplies');
  const [expAmount, setExpAmount] = useState(2500);

  // Marketing Forms
  const [promoCode, setPromoCode] = useState('');
  const [promoName, setPromoName] = useState('');
  const [promoValue, setPromoValue] = useState(15);

  const [campName, setCampName] = useState('');
  const [campSegment, setCampSegment] = useState('vip');
  const [campBody, setCampBody] = useState('');

  // Telegram Config Form
  const [tgTokenInput, setTgTokenInput] = useState('');
  const [tgBotUsername, setTgBotUsername] = useState('');
  const [tgChannelUsername, setTgChannelUsername] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');

  // Auth Login/Register State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const t = translations[lang] || translations.en;

  const headersWithAuth = useCallback(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) h['Authorization'] = `Bearer ${authToken}`;
    return h;
  }, [authToken]);

  const loadAccountAndBusinesses = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { headers: headersWithAuth() });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setLang((data.user.preferred_language as LanguageCode) || 'en');
        setAvailableAccounts(data.availableAccounts || []);
        setBusinesses(data.businesses || []);
        if (data.businesses?.length > 0) {
          const exists = data.businesses.some((b: any) => b.id === selectedBusinessId);
          if (!exists) {
            setSelectedBusinessId(data.businesses[0].id);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [headersWithAuth, selectedBusinessId]);

  const loadTenantWorkspace = useCallback(async (bizId: string) => {
    if (!bizId) return;
    setLoading(true);
    try {
      const [wsRes, anRes, supRes, addRes] = await Promise.all([
        fetch(`/api/businesses/${bizId}/workspace`, { headers: headersWithAuth() }),
        fetch(`/api/businesses/${bizId}/analytics`, { headers: headersWithAuth() }),
        fetch(`/api/businesses/${bizId}/support`, { headers: headersWithAuth() }),
        fetch('/api/addons', { headers: headersWithAuth() }),
      ]);

      if (wsRes.ok) {
        const ws = await wsRes.json();
        setWorkspace(ws);
        setTgBotUsername(ws.business?.telegram_bot_username || '');
        setTgChannelUsername(ws.business?.telegram_channel_username || '');
        setCustomDomainInput(ws.business?.custom_domain || '');
      }
      if (anRes.ok) {
        setAnalyticsData(await anRes.json());
      }
      if (supRes.ok) {
        const threads = await supRes.json();
        setSupportThreads(threads);
        if (threads.length > 0 && !selectedConvId) {
          setSelectedConvId(threads[0].id);
        }
      }
      if (addRes.ok) {
        setMarketplaceAddons(await addRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, [headersWithAuth, selectedConvId]);

  useEffect(() => {
    loadAccountAndBusinesses();
  }, [loadAccountAndBusinesses]);

  useEffect(() => {
    if (selectedBusinessId) {
      loadTenantWorkspace(selectedBusinessId);
    }
  }, [selectedBusinessId, authToken, loadTenantWorkspace]);

  const handleSwitchDemoAccount = async (userId: string) => {
    const res = await fetch('/api/auth/switch-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('telebiz_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setStatusBanner(`Switched active session to ${data.user.name} (${data.user.platform_role})`);
      if (data.user.platform_role === 'super_admin') {
        setActiveModule('superadmin');
      } else if (activeModule === 'superadmin') {
        setActiveModule('overview');
      }
    }
  };

  const handleLanguageChange = async (nextLang: LanguageCode) => {
    setLang(nextLang);
    await fetch('/api/auth/language', {
      method: 'PATCH',
      headers: headersWithAuth(),
      body: JSON.stringify({ language: nextLang }),
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: authName,
        email: authEmail,
        password: authPassword,
        language: lang,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || 'Authentication failed');
    } else {
      localStorage.setItem('telebiz_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      loadAccountAndBusinesses();
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: newBizName,
        category: newBizCategory,
        creation_method: newBizMethod,
        description: newBizDesc,
        contact_phone: newBizPhone,
        address: newBizAddress,
        telegram_bot_username: newBizBot,
        dfy_notes: newBizDfyNotes,
      }),
    });
    const created = await res.json();
    if (res.ok) {
      setNewBizModalOpen(false);
      setNewBizName('');
      setNewBizDesc('');
      await loadAccountAndBusinesses();
      setSelectedBusinessId(created.id);
      setActiveModule('builder');
      setStatusBanner(`Created new business "${created.name}" via ${newBizMethod.replace(/_/g, ' ')}.`);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/products`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: prodName,
        category_name: prodCat,
        price: prodPrice,
        stock: prodStock,
        description: prodDesc,
        variations: prodVariations,
      }),
    });
    if (res.ok) {
      setProdName('');
      setProdDesc('');
      loadTenantWorkspace(selectedBusinessId);
      setStatusBanner('Added product to live catalog.');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/services`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: srvName,
        duration_mins: srvDuration,
        price: srvPrice,
        description: srvDesc,
      }),
    });
    if (res.ok) {
      setSrvName('');
      setSrvDesc('');
      loadTenantWorkspace(selectedBusinessId);
      setStatusBanner('Added bookable service listing.');
    }
  };

  const handleVerifyPayment = async (paymentId: string, action: 'verify' | 'fail' | 'refund') => {
    const res = await fetch(`/api/businesses/${selectedBusinessId}/payments/${paymentId}/verify`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      loadTenantWorkspace(selectedBusinessId);
      setStatusBanner(`Payment ${action === 'verify' ? 'verified & order marked Paid' : action + 'ed'}.`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, delivery_status?: string) => {
    const res = await fetch(`/api/businesses/${selectedBusinessId}/orders/${orderId}`, {
      method: 'PATCH',
      headers: headersWithAuth(),
      body: JSON.stringify({ status, delivery_status }),
    });
    if (res.ok) {
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string, payment_status?: string) => {
    const res = await fetch(`/api/businesses/${selectedBusinessId}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: headersWithAuth(),
      body: JSON.stringify({ status, payment_status }),
    });
    if (res.ok) {
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleSendSupportReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !replyText.trim()) return;
    const res = await fetch(`/api/businesses/${selectedBusinessId}/support/${selectedConvId}/messages`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        body: replyText,
        is_internal_note: isInternalNote,
        status: 'open',
      }),
    });
    if (res.ok) {
      setReplyText('');
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleUpdateConversationStatus = async (convId: string, status: string, assigned_employee_id?: string) => {
    await fetch(`/api/businesses/${selectedBusinessId}/support/${convId}/messages`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({ body: '', status, assigned_employee_id }),
    });
    loadTenantWorkspace(selectedBusinessId);
  };

  const handleAddCannedReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/canned-replies`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        title: cannedTitle,
        shortcut: cannedShortcut,
        content: cannedContent,
        is_faq: true,
        auto_trigger_keyword: cannedKeyword,
      }),
    });
    if (res.ok) {
      setCannedTitle('');
      setCannedShortcut('');
      setCannedContent('');
      setCannedKeyword('');
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleInviteEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/employees`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: empName,
        email: empEmail,
        role: empRole,
        permissions: empPerms,
      }),
    });
    if (res.ok) {
      setEmpName('');
      setEmpEmail('');
      loadTenantWorkspace(selectedBusinessId);
      setStatusBanner(`Invited ${empName} as ${empRole}.`);
    }
  };

  const handleRevokeEmployee = async (empId: string) => {
    const res = await fetch(`/api/businesses/${selectedBusinessId}/employees/${empId}`, {
      method: 'PATCH',
      headers: headersWithAuth(),
      body: JSON.stringify({ status: 'revoked' }),
    });
    if (res.ok) {
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/branches`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: branchName,
        address: branchAddress,
        phone: branchPhone,
      }),
    });
    if (res.ok) {
      setBranchName('');
      setBranchAddress('');
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/expenses`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        title: expTitle,
        category: expCategory,
        amount: expAmount,
      }),
    });
    if (res.ok) {
      setExpTitle('');
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/promotions`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        code: promoCode,
        name: promoName,
        discount_type: 'percentage',
        discount_value: promoValue,
      }),
    });
    if (res.ok) {
      setPromoCode('');
      setPromoName('');
      loadTenantWorkspace(selectedBusinessId);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/businesses/${selectedBusinessId}/campaigns`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: campName,
        type: 'broadcast',
        target_segment: campSegment,
        message_body: campBody,
      }),
    });
    if (res.ok) {
      setCampName('');
      setCampBody('');
      loadTenantWorkspace(selectedBusinessId);
      setStatusBanner('Broadcast dispatched to consented customers.');
    }
  };

  const handleSaveTelegramIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/businesses/${selectedBusinessId}/telegram`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        bot_token: tgTokenInput,
        bot_username: tgBotUsername,
        channel_username: tgChannelUsername,
        webhook_active: true,
        mini_app_published: true,
      }),
    });
    await fetch(`/api/businesses/${selectedBusinessId}/settings`, {
      method: 'PATCH',
      headers: headersWithAuth(),
      body: JSON.stringify({ custom_domain: customDomainInput }),
    });
    setTgTokenInput('');
    loadTenantWorkspace(selectedBusinessId);
    setStatusBanner('Saved Telegram Bot, optional Channel, and Web Domain configuration.');
  };

  const handleChangePlan = async (planId: string, cycle: 'monthly' | 'yearly') => {
    const res = await fetch(`/api/businesses/${selectedBusinessId}/subscription`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({ plan_id: planId, billing_cycle: cycle, payment_method: 'telebirr' }),
    });
    if (res.ok) {
      loadTenantWorkspace(selectedBusinessId);
      setStatusBanner(`Updated subscription plan to ${planId.toUpperCase()} (${cycle}).`);
    }
  };

  const handleToggleAddon = async (addonId: string, isCurrentlyActive: boolean) => {
    const res = await fetch(`/api/businesses/${selectedBusinessId}/addons/toggle`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        addon_id: addonId,
        action: isCurrentlyActive ? 'disable' : 'activate',
      }),
    });
    if (res.ok) {
      loadTenantWorkspace(selectedBusinessId);
      setStatusBanner(isCurrentlyActive ? 'Disabled add-on.' : 'Activated add-on service.');
    }
  };

  const handleExportCsvReport = () => {
    if (!workspace?.orders) return;
    const headers = ['Order Number', 'Customer', 'Phone', 'Source', 'Total (ETB)', 'Order Status', 'Payment Status', 'Method', 'Created At'];
    const rows = workspace.orders.map((o: any) => [
      o.order_number,
      `"${o.customer_name}"`,
      o.customer_phone,
      o.source,
      o.total,
      o.status,
      o.payment_status,
      o.payment_method,
      o.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${workspace.business.slug}_sales_report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeBusiness = workspace?.business || businesses[0];
  const activeConversation = supportThreads.find((c) => c.id === selectedConvId) || supportThreads[0];
  const moduleMeta: Record<ActiveModule, { title: string; description: string }> = {
    overview: { title: 'Business overview', description: 'A clear view of your business performance and daily activity.' },
    builder: { title: 'Your mini app', description: 'Create, customize and publish your Telegram and web storefront.' },
    commerce: { title: 'Products & services', description: 'Keep your catalog, inventory and bookable services organized.' },
    orders: { title: 'Orders & payments', description: 'Review orders, manage fulfillment and verify incoming payments.' },
    support: { title: 'Customer support', description: 'Keep customer conversations, replies and order context together.' },
    analytics: { title: 'Business analytics', description: 'Understand visits, customer behavior and sales conversion.' },
    team: { title: 'Team & operations', description: 'Manage staff access, branches and business expenses.' },
    marketing: { title: 'Marketing & customers', description: 'Build customer relationships with promotions, loyalty and campaigns.' },
    telegram: { title: 'Channels & connections', description: 'Connect your Telegram bot, optionally link a channel, and manage web access.' },
    subscriptions: { title: 'Plans & add-ons', description: 'Manage your platform plan and activate optional services.' },
    superadmin: { title: 'Platform administration', description: 'Manage the businesses and services across TeleBiz.' },
  };

  return (
    <div className="telebiz-app min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="telebiz-topbar sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#overview"
          onClick={(e) => { e.preventDefault(); setActiveModule('overview'); setMobileMoreOpen(false); }}
          className="flex min-w-0 items-center gap-3"
          aria-label="TeleBiz workspace home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm dark:bg-indigo-500">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight text-slate-950 dark:text-white">{t.platformTitle}</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:block">Business workspace</span>
          </span>
        </a>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-slate-200">{activeBusiness?.name || 'Select a business'}</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="truncate">Business management</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-right sm:block">
            <span className="block max-w-32 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{currentUser?.name || 'Workspace user'}</span>
            <span className="block text-[10px] text-slate-400">{currentUser?.platform_role === 'super_admin' ? 'Platform administrator' : 'Business workspace'}</span>
          </span>
          <button
            type="button"
            onClick={() => setFullStorefrontOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:px-4"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{fullStorefrontOpen ? 'Back to workspace' : 'Preview store'}</span>
            <span className="sm:hidden">{fullStorefrontOpen ? 'Back' : 'Preview'}</span>
          </button>
        </div>
      </header>

      <div className="telebiz-contextbar flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          <div className="min-w-0 flex-1 sm:max-w-sm">
            <label htmlFor="active-business-select" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Active business</label>
            <select
              id="active-business-select"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="telebiz-select w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {businesses.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name} · {b.category}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setNewBizModalOpen(true)}
            className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-indigo-950/40"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t.createNewBusiness}</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {activeBusiness && (
            <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {String(activeBusiness.status || 'active').replace(/_/g, ' ')}
            </span>
          )}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900" aria-label="Language">
            {(['en', 'am', 'om'] as LanguageCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguageChange(code)}
                className={'rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition ' + (
                  lang === code
                    ? 'bg-slate-950 text-white dark:bg-indigo-500'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
              >
                {LANGUAGE_LABELS[code]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="text-xs font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            {currentUser?.name ? 'Account' : 'Sign in'}
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusBanner && (
        <div className="mx-4 my-3 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-900 sm:mx-6 lg:mx-8 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
          <span>{statusBanner}</span>
          <button type="button" onClick={() => setStatusBanner('')} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Full Storefront Customer View Mode */}
      {fullStorefrontOpen && activeBusiness ? (
        <div className="flex-1 px-6 py-4">
          <MiniAppStorefront
            slug={activeBusiness.slug}
            mode="full_storefront"
            onOrderCreated={() => loadTenantWorkspace(selectedBusinessId)}
            onClose={() => setFullStorefrontOpen(false)}
          />
        </div>
      ) : (
        /* Main Operating Platform Layout: Sidebar (256px) + Main Content Viewport */
        <div className="telebiz-workspace flex-1 flex min-h-0">
          {/* Desktop business navigation */}
          <aside className="telebiz-sidebar hidden w-[248px] shrink-0 flex-col justify-between gap-6 px-4 py-6 lg:sticky lg:top-[134px] lg:flex lg:h-[calc(100vh-134px)] lg:overflow-y-auto">
            <div className="space-y-5">
              <div className="px-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage your business</p>
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'overview', label: t.overview, icon: LayoutDashboard },
                  { id: 'builder', label: t.builder, icon: Layers },
                  { id: 'commerce', label: t.commerce, icon: Package },
                  { id: 'orders', label: t.ordersPayments, icon: ShoppingCart },
                  { id: 'support', label: t.supportInbox, icon: MessageSquare },
                  { id: 'analytics', label: t.analytics, icon: BarChart3 },
                  { id: 'team', label: t.teamBranches, icon: Users },
                  { id: 'marketing', label: t.marketing, icon: Megaphone },
                  { id: 'telegram', label: t.telegramSetup, icon: Send },
                  { id: 'subscriptions', label: t.subscriptions, icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setActiveModule(item.id as ActiveModule); setMobileMoreOpen(false); }}
                      aria-current={active ? 'page' : undefined}
                      className={'telebiz-side-link flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-semibold transition ' + (
                        active
                          ? 'bg-slate-950 text-white shadow-sm dark:bg-indigo-500'
                          : 'text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />}
                    </button>
                  );
                })}
              </div>

              {currentUser?.platform_role === 'super_admin' && (
                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Platform</p>
                  <button
                    type="button"
                    onClick={() => setActiveModule('superadmin')}
                    aria-current={activeModule === 'superadmin' ? 'page' : undefined}
                    className={'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-semibold transition ' + (
                      activeModule === 'superadmin'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40'
                    )}
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Super admin console</span>
                  </button>
                </div>
              )}
            </div>

            {activeBusiness && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {String(activeBusiness.name || 'B').slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{activeBusiness.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">{activeBusiness.plan_id || 'Free'} plan</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] dark:border-slate-800">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold capitalize text-emerald-600">{String(activeBusiness.status || 'active').replace(/_/g, ' ')}</span>
                </div>
              </div>
            )}
          </aside>

          {/* Main Workspace Content Area */}
          <main className="telebiz-owner-main mx-auto w-full max-w-[1480px] flex-1 space-y-6 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-7">
            {/* Grace Period / Subscription Alert if applicable */}
            {activeBusiness?.subscription_status === 'grace_period' && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-amber-950 dark:text-amber-200">
                    Subscription Grace Period Active ({activeBusiness.grace_period_days} days remaining):
                  </span>{' '}
                  <span className="text-amber-800 dark:text-amber-300">
                    Your historical sales records and customer database are 100% preserved. Renew your plan to prevent temporary pause.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModule('subscriptions')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold shrink-0"
                >
                  Renew Subscription
                </button>
              </div>
            )}

            {activeModule !== 'overview' && activeModule !== 'superadmin' && (
              <section className="telebiz-page-intro flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Business workspace</p>
                  <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{moduleMeta[activeModule].title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{moduleMeta[activeModule].description}</p>
                </div>
                {activeBusiness && (
                  <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:flex">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    {activeBusiness.name}
                  </div>
                )}
              </section>
            )}

            {/* MODULE 1: EXECUTIVE OVERVIEW DASHBOARD */}
            {activeModule === 'overview' && analyticsData && workspace && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Business overview</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {activeBusiness.name}
                    </h1>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {activeBusiness.category} · {String(activeBusiness.creation_method || '').replace(/_/g, ' ')} · Mini app v{activeBusiness.mini_app_version}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCsvReport}
                      className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.exportReport}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule('builder')}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                    >
                      Customize Mini App
                    </button>
                  </div>
                </div>

                {/* 6 Primary KPI Cards (All from real recorded SQL queries) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-500">{t.totalRevenue}</div>
                    <div className="mt-1 text-lg font-display font-bold text-slate-900 dark:text-white tabular-nums">
                      {Number(analyticsData.overview.totalRevenue).toLocaleString()} ETB
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                      30d: {Number(analyticsData.overview.monthlyRevenue).toLocaleString()} ETB
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-500">{t.todayRevenue}</div>
                    <div className="mt-1 text-lg font-display font-bold text-slate-900 dark:text-white tabular-nums">
                      {Number(analyticsData.overview.todayRevenue).toLocaleString()} ETB
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                      7d: {Number(analyticsData.overview.weeklyRevenue).toLocaleString()} ETB
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-500">{t.totalOrders}</div>
                    <div className="mt-1 text-lg font-display font-bold text-slate-900 dark:text-white tabular-nums">
                      {analyticsData.overview.totalOrders}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                      {analyticsData.overview.confirmedOrders} verified · {analyticsData.overview.pendingOrders} pending
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-500">{t.totalCustomers}</div>
                    <div className="mt-1 text-lg font-display font-bold text-slate-900 dark:text-white tabular-nums">
                      {analyticsData.overview.totalCustomers}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                      {analyticsData.overview.newCustomers} new · {analyticsData.overview.returningCustomers} returning
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-500">Total Visitors</div>
                    <div className="mt-1 text-lg font-display font-bold text-slate-900 dark:text-white tabular-nums">
                      {analyticsData.overview.totalVisitors}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Telegram + Web sessions</div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-500">{t.activeBookings}</div>
                    <div className="mt-1 text-lg font-display font-bold text-slate-900 dark:text-white tabular-nums">
                      {analyticsData.overview.activeBookings}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Scheduled reservations</div>
                  </div>
                </div>

                {/* Split Row: Recent Orders & Live Mini App Storefront Simulator */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-6">
                    {/* Recent Orders Table with Payment Verification Distinction */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                            Recent Orders & Payment Verification Status
                          </h2>
                          <p className="text-xs text-slate-500">
                            Orders are never marked Paid until transaction verification succeeds.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveModule('orders')}
                          className="text-xs font-medium text-sky-600 hover:underline"
                        >
                          Manage all ({workspace.orders.length})
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                              <th className="py-2 pr-3 font-medium">Order</th>
                              <th className="py-2 px-3 font-medium">Customer</th>
                              <th className="py-2 px-3 font-medium">Channel</th>
                              <th className="py-2 px-3 font-medium">Payment State</th>
                              <th className="py-2 pl-3 font-medium text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {workspace.orders.slice(0, 6).map((ord: any) => (
                              <tr key={ord.id}>
                                <td className="py-2.5 pr-3 font-mono font-semibold text-slate-900 dark:text-white">
                                  {ord.order_number}
                                </td>
                                <td className="py-2.5 px-3">{ord.customer_name}</td>
                                <td className="py-2.5 px-3 uppercase font-mono text-[11px] text-slate-500">
                                  {ord.source} · {ord.payment_method}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`font-semibold uppercase ${
                                      ord.payment_status === 'paid'
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : ord.payment_status === 'pending_verification'
                                        ? 'text-amber-700 dark:text-amber-400'
                                        : 'text-rose-600'
                                    }`}
                                  >
                                    {ord.payment_status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="py-2.5 pl-3 text-right font-mono font-semibold tabular-nums">
                                  {Number(ord.total).toLocaleString()} {ord.currency}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 10-Stage Conversion Funnel Summary */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                          {t.salesFunnel}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setActiveModule('analytics')}
                          className="text-xs font-medium text-sky-600 hover:underline"
                        >
                          Full Analytics
                        </button>
                      </div>
                      <div className="space-y-2">
                        {analyticsData.funnelStages.map((st: any) => {
                          const maxCount = Math.max(1, analyticsData.funnelStages[0]?.count || 1);
                          const pct = Math.min(100, Math.round((st.count / maxCount) * 100));
                          return (
                            <div key={st.key} className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 dark:text-slate-300">
                                  {st.step}. {st.label}
                                </span>
                                <span className="font-mono font-semibold tabular-nums">
                                  {st.count} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-600 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Interactive Customer Mini App (5 cols) */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Interactive Customer Mini App & Web Storefront
                      </span>
                      <span>Place real test orders & bookings below</span>
                    </div>
                    <MiniAppStorefront
                      slug={activeBusiness.slug}
                      mode="embedded_preview"
                      onOrderCreated={() => loadTenantWorkspace(selectedBusinessId)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: MINI APP BUILDER STUDIO (3 CREATION METHODS) */}
            {activeModule === 'builder' && workspace && (
              <BuilderStudio
                business={workspace.business}
                versions={workspace.versions}
                authToken={authToken}
                onRefresh={() => loadTenantWorkspace(selectedBusinessId)}
              />
            )}

            {/* MODULE 3: STORE CATALOG, INVENTORY & BOOKABLE SERVICES */}
            {activeModule === 'commerce' && workspace && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Product Catalog List (7 cols) */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Products & Inventory Management ({workspace.products.length})
                    </h2>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {workspace.products.map((p: any) => (
                        <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {p.name} · <span className="font-mono text-slate-500">{p.sku}</span>
                            </div>
                            <div className="text-slate-500">
                              Category: {p.category_name} · Views: {p.views_count} · Likes: {p.likes_count} · Purchased:{' '}
                              {p.purchases_count}
                            </div>
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            <div className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                              {Number(p.price).toLocaleString()} {p.currency}
                            </div>
                            <div className="text-[11px] text-slate-500 tabular-nums">Stock: {p.stock} units</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bookable Services List */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                        Bookable Services & Reservation Packages ({workspace.services.length})
                      </h3>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {workspace.services.map((s: any) => (
                          <div key={s.id} className="py-2.5 flex items-center justify-between gap-4">
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                              <div className="text-slate-500">
                                Duration: {s.duration_mins} mins · Capacity: {s.capacity} guests
                              </div>
                            </div>
                            <div className="font-mono font-semibold tabular-nums">
                              {Number(s.price).toLocaleString()} {s.currency}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Product & Add Service Forms (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <form
                      onSubmit={handleCreateProduct}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs"
                    >
                      <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                        Add New Product to Storefront
                      </h3>
                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          placeholder="e.g., Sidama Bensa Natural (500g)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                          <input
                            type="text"
                            value={prodCat}
                            onChange={(e) => setProdCat(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Price (ETB)</label>
                          <input
                            type="number"
                            value={prodPrice}
                            onChange={(e) => setProdPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Stock</label>
                          <input
                            type="number"
                            value={prodStock}
                            onChange={(e) => setProdStock(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Variations</label>
                          <input
                            type="text"
                            value={prodVariations}
                            onChange={(e) => setProdVariations(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                      >
                        Publish Product
                      </button>
                    </form>

                    <form
                      onSubmit={handleCreateService}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs"
                    >
                      <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                        Add Bookable Service / Appointment Type
                      </h3>
                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Name</label>
                        <input
                          type="text"
                          value={srvName}
                          onChange={(e) => setSrvName(e.target.value)}
                          placeholder="e.g., Executive Consultation or Roastery Tour"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (Mins)</label>
                          <input
                            type="number"
                            value={srvDuration}
                            onChange={(e) => setSrvDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Price (ETB)</label>
                          <input
                            type="number"
                            value={srvPrice}
                            onChange={(e) => setSrvPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                      >
                        Create Bookable Service
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: ORDERS, BOOKINGS & SEPARATED PAYMENT VERIFICATION LEDGERS */}
            {activeModule === 'orders' && workspace && (
              <div className="space-y-6">
                {/* Orders Management Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Customer Orders, Fulfillment & Delivery Status ({workspace.orders.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage order lifecycle, courier dispatch, and refunds.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="py-2 pr-3">Order #</th>
                          <th className="py-2 px-3">Customer & Address</th>
                          <th className="py-2 px-3">Payment Status</th>
                          <th className="py-2 px-3">Order Status</th>
                          <th className="py-2 px-3">Delivery</th>
                          <th className="py-2 pl-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {workspace.orders.map((ord: any) => (
                          <tr key={ord.id}>
                            <td className="py-3 pr-3 font-mono font-semibold text-slate-900 dark:text-white">
                              {ord.order_number}
                              <div className="text-[11px] font-normal text-slate-500">{ord.source}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium text-slate-900 dark:text-white">{ord.customer_name}</div>
                              <div className="text-[11px] text-slate-500">
                                {ord.customer_phone} · {ord.delivery_address}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`font-semibold uppercase ${
                                  ord.payment_status === 'paid'
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : ord.payment_status === 'pending_verification'
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : 'text-rose-600'
                                }`}
                              >
                                {ord.payment_status.replace(/_/g, ' ')}
                              </span>
                              <div className="text-[11px] text-slate-500 uppercase">{ord.payment_method}</div>
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value, ord.delivery_status)}
                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                              </select>
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={ord.delivery_status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, ord.status, e.target.value)}
                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                              >
                                <option value="awaiting_dispatch">Awaiting Dispatch</option>
                                <option value="preparing_package">Preparing Package</option>
                                <option value="courier_en_route">Courier En Route</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="py-3 pl-3 text-right font-mono font-semibold tabular-nums">
                              {Number(ord.total).toLocaleString()} {ord.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Separated Payment Ledgers: Business Customer Payments vs Platform Payments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ledger B: Business Customer Payments & Verification */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                    <div>
                      <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                        Business Customer Payment Ledger & Verification
                      </h3>
                      <p className="text-xs text-slate-500">
                        Verify initiated Telebirr, CBE Birr, Card, and Telegram Stars transactions.
                      </p>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {workspace.payments
                        .filter((p: any) => p.scope === 'business')
                        .map((pay: any) => (
                          <div key={pay.id} className="py-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-mono font-semibold text-slate-900 dark:text-white">
                                {pay.reference_code} · {Number(pay.amount).toLocaleString()} {pay.currency}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {pay.description} · Method: {pay.method.toUpperCase()} · Status:{' '}
                                <span className="font-semibold uppercase">{pay.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {pay.status !== 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPayment(pay.id, 'verify')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold"
                                >
                                  {t.verifyPayment}
                                </button>
                              )}
                              {pay.status === 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPayment(pay.id, 'refund')}
                                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-rose-600"
                                >
                                  Refund
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Ledger A: Platform Subscription & Add-On Payments + Bookings */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                        Appointments & Reservations ({workspace.bookings.length})
                      </h3>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {workspace.bookings.map((b: any) => (
                          <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {b.booking_number} — {b.service_name}
                              </div>
                              <div className="text-slate-500">
                                {b.customer_name} ({b.customer_phone}) · {b.booking_date} at {b.booking_time}
                              </div>
                            </div>
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                            >
                              <option value="requested">Requested</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                        Platform Billing Ledger (Separated from Customer Orders)
                      </h3>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {workspace.payments
                          .filter((p: any) => p.scope === 'platform')
                          .map((p: any) => (
                            <div key={p.id} className="py-2.5 flex items-center justify-between">
                              <div>
                                <div className="font-mono font-semibold">{p.reference_code}</div>
                                <div className="text-slate-500">{p.description}</div>
                              </div>
                              <div className="font-mono font-semibold tabular-nums">
                                {Number(p.amount).toLocaleString()} {p.currency} ({p.status})
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 5: CUSTOMER SUPPORT CENTER */}
            {activeModule === 'support' && workspace && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Thread Inbox List (4 cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    Support Inbox ({supportThreads.length})
                  </h2>
                  <div className="space-y-2">
                    {supportThreads.map((conv: any) => (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => setSelectedConvId(conv.id)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-colors space-y-1 ${
                          activeConversation?.id === conv.id
                            ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {conv.customer_name}
                          </span>
                          <span className="font-mono text-[10px] uppercase text-slate-500">{conv.status}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 truncate">{conv.subject}</div>
                        <div className="text-[11px] text-slate-400">
                          Channel: {conv.channel} · Response SLA: {conv.first_response_mins || 3}m
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Conversation & Reply Box (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  {activeConversation ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                            {activeConversation.subject}
                          </h3>
                          <div className="text-xs text-slate-500">
                            {activeConversation.customer_name} · {activeConversation.channel}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <select
                            value={activeConversation.status}
                            onChange={(e) => handleUpdateConversationStatus(activeConversation.id, e.target.value)}
                            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="escalated">Escalated to Owner</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
                        {activeConversation.messages?.map((m: any) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-xl space-y-1 ${
                              m.is_internal_note
                                ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-900 dark:text-amber-200'
                                : m.sender_type === 'customer'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                : 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {m.sender_name} {m.is_internal_note ? '(PRIVATE INTERNAL NOTE)' : ''}
                              </span>
                              <span>{m.created_at.slice(11, 16)}</span>
                            </div>
                            <p className="leading-relaxed">{m.body}</p>
                          </div>
                        ))}
                      </div>

                      {/* Quick Canned Replies */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {workspace.cannedReplies.map((c: any) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setReplyText(c.content)}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          >
                            {c.shortcut} ({c.title})
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleSendSupportReply} className="space-y-2.5 text-xs">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={
                            isInternalNote
                              ? 'Write a private internal note visible only to your support team...'
                              : 'Write a reply to the customer via Telegram Bot / Web chat...'
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          required
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isInternalNote}
                              onChange={(e) => setIsInternalNote(e.target.checked)}
                            />
                            <span>Save as Private Internal Team Note</span>
                          </label>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                          >
                            {isInternalNote ? 'Add Internal Note' : 'Send Customer Reply'}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500">Select a conversation thread.</div>
                  )}
                </div>

                {/* Customer Profile, Order Context & Canned Reply Creator (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                    <h4 className="font-display font-semibold text-slate-900 dark:text-white">
                      Customer Context & Order History
                    </h4>
                    {activeConversation?.customerProfile ? (
                      <div className="space-y-1 text-slate-600 dark:text-slate-300">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {activeConversation.customerProfile.name}
                        </div>
                        <div>Phone: {activeConversation.customerProfile.phone}</div>
                        <div>Segment: {activeConversation.customerProfile.segment.toUpperCase()}</div>
                        <div className="tabular-nums">
                          Total Spent: {Number(activeConversation.customerProfile.total_spent).toLocaleString()} ETB
                        </div>
                        <div className="tabular-nums">
                          Loyalty Points: {activeConversation.customerProfile.loyalty_points} pts
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500">Direct Telegram/Web visitor</div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="font-medium text-slate-700 dark:text-slate-300">Linked Orders</div>
                      {activeConversation?.customerOrders?.length > 0 ? (
                        activeConversation.customerOrders.map((o: any) => (
                          <div key={o.id} className="p-2 rounded bg-slate-50 dark:bg-slate-800 flex justify-between">
                            <span className="font-mono font-semibold">{o.order_number}</span>
                            <span className="tabular-nums">
                              {Number(o.total).toLocaleString()} ETB ({o.payment_status})
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400">No linked orders</div>
                      )}
                    </div>
                  </div>

                  <form
                    onSubmit={handleAddCannedReply}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 text-xs"
                  >
                    <h4 className="font-display font-semibold text-slate-900 dark:text-white">
                      Add Canned Reply & Auto-FAQ Trigger
                    </h4>
                    <input
                      type="text"
                      value={cannedTitle}
                      onChange={(e) => setCannedTitle(e.target.value)}
                      placeholder="Title (e.g. Bulk Wholesale)"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                    <input
                      type="text"
                      value={cannedShortcut}
                      onChange={(e) => setCannedShortcut(e.target.value)}
                      placeholder="Shortcut (e.g. /wholesale)"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                      required
                    />
                    <input
                      type="text"
                      value={cannedKeyword}
                      onChange={(e) => setCannedKeyword(e.target.value)}
                      placeholder="Auto-reply keyword (e.g. wholesale)"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <textarea
                      rows={2}
                      value={cannedContent}
                      onChange={(e) => setCannedContent(e.target.value)}
                      placeholder="Reply message content..."
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                    >
                      Save Canned Reply
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* MODULE 6: 10-STAGE FUNNEL, PRODUCT & TRAFFIC ANALYTICS */}
            {activeModule === 'analytics' && analyticsData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                      Sales Funnel, Product Conversion & Traffic Analytics
                    </h2>
                    <p className="text-xs text-slate-500">
                      Computed in real time from recorded customer sessions, product interactions, and verified payments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCsvReport}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t.exportReport}
                  </button>
                </div>

                {/* Product Conversion Table highlighting High-Interest Low-Conversion items */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    Product Interest vs Conversion Diagnostics
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="py-2 pr-3">Product</th>
                          <th className="py-2 px-3 text-right">Views</th>
                          <th className="py-2 px-3 text-right">Likes</th>
                          <th className="py-2 px-3 text-right">Purchases</th>
                          <th className="py-2 px-3 text-right">Conversion Rate</th>
                          <th className="py-2 pl-3">Diagnostic Insight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {analyticsData.productAnalytics.map((p: any) => (
                          <tr key={p.id}>
                            <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">
                              {p.name} ({p.category_name})
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">{p.views_count}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">{p.likes_count}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">{p.purchases_count}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                              {p.conversionRate}%
                            </td>
                            <td className="py-2.5 pl-3">
                              {p.highInterestLowConversion ? (
                                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                                  High Interest / Low Conversion — Consider promotional bundle
                                </span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400">Healthy conversion velocity</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Traffic Sources & Popular Pages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Traffic Sources & Session Duration
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {analyticsData.trafficSources.map((src: any) => (
                        <div key={src.source} className="py-2.5 flex items-center justify-between">
                          <span className="uppercase font-mono font-semibold">{src.source}</span>
                          <span className="text-slate-500 tabular-nums">
                            {src.unique_sessions} unique sessions · {src.events_count} events · Avg{' '}
                            {Math.round(src.avg_duration || 65)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Popular Mini App Pages
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {analyticsData.popularPages.map((pg: any) => (
                        <div key={pg.page_name} className="py-2.5 flex items-center justify-between">
                          <span className="font-mono">{pg.page_name}</span>
                          <span className="font-mono font-semibold tabular-nums">{pg.views} views</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 7: EMPLOYEES, PERMISSIONS, BRANCHES & EXPENSE TRACKING */}
            {activeModule === 'team' && workspace && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Team Members, Roles & Access Control ({workspace.employees.length})
                    </h2>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {workspace.employees.map((emp: any) => (
                        <div key={emp.id} className="py-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {emp.name} ({emp.email})
                            </div>
                            <div className="text-slate-500">
                              Role: <span className="uppercase font-mono font-semibold">{emp.role}</span> · Permissions:{' '}
                              <span className="font-mono text-[11px]">{emp.permissions_json}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="uppercase font-mono text-[11px]">{emp.status}</span>
                            {emp.role !== 'owner' && emp.status !== 'revoked' && (
                              <button
                                type="button"
                                onClick={() => handleRevokeEmployee(emp.id)}
                                className="px-2.5 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form
                    onSubmit={handleInviteEmployee}
                    className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs"
                  >
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Invite Employee & Assign Role
                    </h3>
                    <input
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                    <input
                      type="email"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="sales">Sales Employee</option>
                      <option value="support">Customer Support Agent</option>
                      <option value="product_manager">Product Manager</option>
                      <option value="analyst">Analyst</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                    >
                      Send Invitation & Assign Permissions
                    </button>
                  </form>
                </div>

                {/* Branches & Operating Expenses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Business Branches ({workspace.branches.length})
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {workspace.branches.map((br: any) => (
                        <div key={br.id} className="py-2.5 flex justify-between">
                          <div>
                            <div className="font-semibold">{br.name}</div>
                            <div className="text-slate-500">{br.address}</div>
                          </div>
                          <div className="text-right text-slate-500">{br.working_hours}</div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddBranch} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="Branch Name"
                        className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        required
                      />
                      <input
                        type="text"
                        value={branchAddress}
                        onChange={(e) => setBranchAddress(e.target.value)}
                        placeholder="Address"
                        className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        required
                      />
                      <button type="submit" className="px-3 py-1.5 rounded bg-slate-900 text-white font-semibold">
                        Add
                      </button>
                    </form>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Operating Expense Ledger ({workspace.expenses.length})
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {workspace.expenses.map((ex: any) => (
                        <div key={ex.id} className="py-2.5 flex justify-between">
                          <div>
                            <div className="font-semibold">{ex.title}</div>
                            <div className="text-slate-500">
                              {ex.category} · {ex.incurred_date}
                            </div>
                          </div>
                          <div className="font-mono font-semibold tabular-nums">
                            {Number(ex.amount).toLocaleString()} {ex.currency}
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddExpense} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <input
                        type="text"
                        value={expTitle}
                        onChange={(e) => setExpTitle(e.target.value)}
                        placeholder="Expense Description"
                        className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        required
                      />
                      <input
                        type="number"
                        value={expAmount}
                        onChange={(e) => setExpAmount(Number(e.target.value))}
                        placeholder="Amount"
                        className="w-28 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        required
                      />
                      <button type="submit" className="px-3 py-1.5 rounded bg-slate-900 text-white font-semibold">
                        Log
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 8: MARKETING, PROMOTIONS, LOYALTY & CUSTOMER DATABASE */}
            {activeModule === 'marketing' && workspace && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Discount Codes */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Active Discount Codes ({workspace.promotions.length})
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {workspace.promotions.map((pr: any) => (
                        <div key={pr.id} className="py-2.5 flex justify-between">
                          <div>
                            <span className="font-mono font-bold text-sky-600">{pr.code}</span> — {pr.name}
                          </div>
                          <span className="font-mono tabular-nums">
                            {pr.discount_value}% off · Used {pr.usage_count}/{pr.max_uses}
                          </span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleCreatePromotion} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="CODE (e.g. VIP20)"
                        className="w-32 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 font-mono"
                        required
                      />
                      <input
                        type="text"
                        value={promoName}
                        onChange={(e) => setPromoName(e.target.value)}
                        placeholder="Offer description"
                        className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                        required
                      />
                      <button type="submit" className="px-3 py-1.5 rounded bg-sky-600 text-white font-semibold">
                        Create
                      </button>
                    </form>
                  </div>

                  {/* Consent-Aware Telegram Broadcasts */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                      Consent-Aware Customer Broadcasts & Campaigns
                    </h3>
                    <form onSubmit={handleSendCampaign} className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={campName}
                          onChange={(e) => setCampName(e.target.value)}
                          placeholder="Campaign Title"
                          className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                          required
                        />
                        <select
                          value={campSegment}
                          onChange={(e) => setCampSegment(e.target.value)}
                          className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="all">All Consented Customers</option>
                          <option value="vip">VIP Tier Only</option>
                          <option value="returning">Returning Buyers</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={campBody}
                        onChange={(e) => setCampBody(e.target.value)}
                        placeholder="Broadcast message (sent only to customers with marketing consent enabled)..."
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700"
                        required
                      />
                      <button type="submit" className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold">
                        Send Broadcast Campaign
                      </button>
                    </form>
                  </div>
                </div>

                {/* Customer Database & Loyalty / Referral Tracking */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    Customer CRM, Loyalty Points & Referral Links ({workspace.customers.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="py-2 pr-3">Customer</th>
                          <th className="py-2 px-3">Source & Segment</th>
                          <th className="py-2 px-3">Referral Code</th>
                          <th className="py-2 px-3 text-right">Loyalty Points</th>
                          <th className="py-2 pl-3 text-right">Total Verified Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {workspace.customers.map((c: any) => (
                          <tr key={c.id}>
                            <td className="py-2.5 pr-3 font-medium">
                              {c.name} ({c.phone})
                            </td>
                            <td className="py-2.5 px-3">
                              {c.source} · <span className="uppercase font-mono">{c.segment}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono">{c.referral_code}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">{c.loyalty_points} pts</td>
                            <td className="py-2.5 pl-3 text-right font-mono font-semibold tabular-nums">
                              {Number(c.total_spent).toLocaleString()} ETB
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 9: TELEGRAM BOT, OPTIONAL CHANNEL & WEB DOMAIN SETUP */}
            {activeModule === 'telegram' && workspace && (
              <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 text-xs">
                <div>
                  <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    Telegram Bot, Mini App Launch Links & Web Access Configuration
                  </h2>
                  <p className="text-slate-500 mt-1">
                    A Telegram channel is strictly optional. Your business operates immediately via your Telegram Bot Mini App and standalone Web Storefront.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-white">Active Distribution Endpoints</div>
                  <div className="font-mono text-sky-600">
                    Telegram Mini App Deep Link: https://t.me/{(activeBusiness.telegram_bot_username || 'Bot').replace('@', '')}/app?startapp={activeBusiness.slug}
                  </div>
                  <div className="font-mono text-slate-600 dark:text-slate-400">
                    Web Storefront URL: https://{activeBusiness.custom_domain || `telebiz.os/s/${activeBusiness.slug}`}
                  </div>
                </div>

                <form onSubmit={handleSaveTelegramIntegration} className="space-y-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Telegram Bot Username (Required for Telegram Mini App)
                    </label>
                    <input
                      type="text"
                      value={tgBotUsername}
                      onChange={(e) => setTgBotUsername(e.target.value)}
                      placeholder="@YourBusinessBot"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Telegram @BotFather API Token (Stored encrypted server-side; currently:{' '}
                      <span className="font-mono">{activeBusiness.telegram_bot_token_masked || 'Not set'}</span>)
                    </label>
                    <input
                      type="password"
                      value={tgTokenInput}
                      onChange={(e) => setTgTokenInput(e.target.value)}
                      placeholder="Enter new BotFather token to rotate credentials..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Telegram Channel Username (Strictly Optional — Leave empty if you do not have a channel)
                    </label>
                    <input
                      type="text"
                      value={tgChannelUsername}
                      onChange={(e) => setTgChannelUsername(e.target.value)}
                      placeholder="Optional: @YourBusinessChannel"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Custom Web Domain (For customers without Telegram)
                    </label>
                    <input
                      type="text"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="shop.yourbusiness.et"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                  >
                    Save Telegram & Web Configuration
                  </button>
                </form>
              </div>
            )}

            {/* MODULE 10: SUBSCRIPTIONS & ADD-ON MARKETPLACE */}
            {activeModule === 'subscriptions' && workspace && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'free',
                      name: 'Starter Free Plan',
                      audience: 'For early-stage solo merchants',
                      monthly: 0,
                      yearly: 0,
                      limits: 'Up to 25 products · 5 AI Builder runs/mo · Standard Telegram Mini App + Web access',
                    },
                    {
                      id: 'growth',
                      name: 'Growth Business Plan',
                      audience: 'For scaling retail, hospitality & clinics',
                      monthly: 1450,
                      yearly: 14500,
                      limits: 'Unlimited products & bookings · 25 AI Builder runs/mo · Multi-agent Support Inbox',
                    },
                    {
                      id: 'enterprise',
                      name: 'Enterprise Multi-Branch',
                      audience: 'For high-volume multi-branch operations',
                      monthly: 2400,
                      yearly: 24000,
                      limits: 'Unlimited branches & staff · 100 AI Builder runs/mo · Priority SLA & Custom Domain',
                    },
                  ].map((plan) => {
                    const isCurrent = activeBusiness.plan_id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`p-5 rounded-xl border bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 ${
                          isCurrent ? 'border-sky-600' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="text-xs text-slate-500">{plan.audience}</div>
                          <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                            {plan.name}
                          </h3>
                          <div className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                            {plan.monthly.toLocaleString()} ETB/mo
                          </div>
                          <p className="text-xs text-slate-500 pt-2">{plan.limits}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleChangePlan(plan.id, 'monthly')}
                            className="flex-1 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
                          >
                            {isCurrent ? 'Renew Monthly' : 'Select Monthly'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangePlan(plan.id, 'yearly')}
                            className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                          >
                            Yearly ({plan.yearly.toLocaleString()})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add-On Marketplace */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    Add-On Services Marketplace
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketplaceAddons.map((addon: any) => {
                      const activeRecord = workspace.activeAddons?.find((a: any) => a.addon_id === addon.id);
                      const isActive = Boolean(activeRecord);
                      return (
                        <div
                          key={addon.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="text-[11px] text-slate-500">{addon.category}</div>
                            <div className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                              {addon.name}
                            </div>
                            <p className="text-slate-500">{addon.description}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="font-mono font-semibold tabular-nums">
                              {Number(addon.monthly_price).toLocaleString()} ETB/mo
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleAddon(addon.id, isActive)}
                              className={`px-3 py-1.5 rounded-lg font-semibold ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-sky-600 text-white'
                              }`}
                            >
                              {isActive ? `Active (${activeRecord.status})` : 'Activate Add-On'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 11: PLATFORM SUPER ADMIN CENTRAL CONSOLE */}
            {activeModule === 'superadmin' && (
              <SuperAdminConsole
                authToken={authToken}
                onRefreshBusinesses={() => {
                  loadAccountAndBusinesses();
                  loadTenantWorkspace(selectedBusinessId);
                }}
              />
            )}
          </main>
        </div>
      )}

      {!fullStorefrontOpen && (
        <>
          {mobileMoreOpen && (
            <div className="telebiz-mobile-more fixed inset-x-3 bottom-[82px] z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15 dark:border-slate-700 dark:bg-slate-900 lg:hidden">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">More workspace tools</p>
              {[
                { id: 'commerce', label: t.commerce, icon: Package },
                { id: 'analytics', label: t.analytics, icon: BarChart3 },
                { id: 'team', label: t.teamBranches, icon: Users },
                { id: 'marketing', label: t.marketing, icon: Megaphone },
                { id: 'telegram', label: t.telegramSetup, icon: Send },
                { id: 'subscriptions', label: t.subscriptions, icon: CreditCard },
                ...(currentUser?.platform_role === 'super_admin' ? [{ id: 'superadmin', label: t.superAdmin, icon: ShieldAlert }] : []),
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setActiveModule(item.id as ActiveModule); setMobileMoreOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Icon className="h-4 w-4 text-indigo-500" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
          <nav className="telebiz-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-slate-200 bg-white/95 px-2 pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden" aria-label="Business navigation">
            {[
              { id: 'overview', label: 'Home', icon: LayoutDashboard },
              { id: 'builder', label: 'Builder', icon: Layers },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'support', label: 'Support', icon: MessageSquare },
              { id: 'more', label: 'More', icon: MoreHorizontal },
            ].map((item) => {
              const Icon = item.icon;
              const active = item.id === 'more' ? mobileMoreOpen : activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.id === 'more'
                    ? setMobileMoreOpen((open) => !open)
                    : (setActiveModule(item.id as ActiveModule), setMobileMoreOpen(false))}
                  aria-current={item.id !== 'more' && active ? 'page' : undefined}
                  aria-expanded={item.id === 'more' ? mobileMoreOpen : undefined}
                  className={'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition ' + (
                    active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </>
      )}

      {/* MODAL: CREATE NEW BUSINESS MINI APP (3 CREATION METHODS) */}
      {newBizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Create New Business Mini App & Web Storefront
              </h3>
              <button type="button" onClick={() => setNewBizModalOpen(false)} className="text-slate-500">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Choose Creation Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'self_service', label: '1. Visual Builder' },
                    { id: 'ai_builder', label: '2. AI-Powered Builder' },
                    { id: 'done_for_you', label: '3. Done-For-You Service' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewBizMethod(m.id as any)}
                      className={`p-2.5 rounded-lg border text-center font-semibold ${
                        newBizMethod === m.id
                          ? 'border-sky-600 bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-200'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="e.g., Habesha Craft Roasters"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Business Category (9 Templates)</label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {BUSINESS_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Business Description</label>
                <textarea
                  rows={2}
                  value={newBizDesc}
                  onChange={(e) => setNewBizDesc(e.target.value)}
                  placeholder="Describe your products, services, and target customers..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Telegram Bot Username (Optional)</label>
                  <input
                    type="text"
                    value={newBizBot}
                    onChange={(e) => setNewBizBot(e.target.value)}
                    placeholder="@MyBusinessBot"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {newBizMethod === 'done_for_you' && (
                <div>
                  <label className="block font-medium mb-1">
                    Done-For-You Concierge Instructions (For Platform Specialists)
                  </label>
                  <textarea
                    rows={2}
                    value={newBizDfyNotes}
                    onChange={(e) => setNewBizDfyNotes(e.target.value)}
                    placeholder="Tell our team what templates, catalog items, and Telegram integrations to configure for you..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBizModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 text-white font-semibold"
                >
                  Create Business Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SIGN IN / REGISTER */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                {authMode === 'login' ? 'Sign In to TeleBiz OS' : 'Create Business Owner Account'}
              </h3>
              <button type="button" onClick={() => setAuthModalOpen(false)} className="text-slate-500">
                Close
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700">{authError}</div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="hana@tomocacraft.et or admin@telebiz.os"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="owner123 or admin123"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-600 text-white font-semibold">
                {authMode === 'login' ? 'Sign In' : 'Register & Continue'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-sky-600 hover:underline font-medium"
              >
                {authMode === 'login'
                  ? 'Need a new account? Register here'
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
