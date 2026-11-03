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
  Pencil,
  X,
  AlertCircle,
  Clock3,
  Boxes,
  Settings,
  Globe,
  KeyRound,
  UserPlus,
  Sparkles,
  Trophy,
  Eye,
  PauseCircle,
  PlayCircle,
  Trash2,
  FolderPlus,
  Tag,
  TrendingUp,
  ImagePlus,
  Upload,
  Percent,
  Fingerprint,
  HardDrive,
  ShoppingBag,
  LogOut,
  Bell,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Radio,
  Link2,
  ArrowUpRight,
  Star,
} from 'lucide-react';
import { translations, LANGUAGE_LABELS, LanguageCode, BUSINESS_CATEGORIES } from './i18n/translations';
import { MiniAppStorefront } from './components/MiniAppStorefront';
import { BuilderStudio } from './components/BuilderStudio';
import { SuperAdminConsole } from './components/SuperAdminConsole';

export interface StylizedNotificationButton {
  label: string;
  action: string;
  target?: string;
  variant?: 'primary' | 'secondary' | 'emerald' | 'amber' | 'danger';
}

export interface StylizedNotificationItem {
  id: string;
  type?: 'order' | 'payment' | 'telegram' | 'web' | 'booking' | 'support' | 'system';
  tone?: 'success' | 'info' | 'warning' | 'error' | 'telegram';
  title: string;
  message: string;
  channel?: 'telegram_and_web' | 'telegram_bot' | 'web_toast';
  has_buttons: boolean;
  buttons: StylizedNotificationButton[];
  is_read?: boolean;
  created_at?: string;
}

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
  | 'superadmin'
  | 'more';

export default function App() {
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('telebiz_token') || '');
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const token = localStorage.getItem('telebiz_token');
      const cached = localStorage.getItem('telebiz_cached_user');
      return token && cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(
    () => localStorage.getItem('telebiz_selected_business_id') || ''
  );
  const [workspace, setWorkspace] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [supportThreads, setSupportThreads] = useState<any[]>([]);
  const [marketplaceAddons, setMarketplaceAddons] = useState<any[]>([]);
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [previousModule, setPreviousModule] = useState<ActiveModule>('overview');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState(true);

  // Modals & Interactive States
  const [fullStorefrontOpen, setFullStorefrontOpen] = useState(false);
  const [newBizModalOpen, setNewBizModalOpen] = useState(false);
  const [launchGuideOpen, setLaunchGuideOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');
  const [paymentMethodName, setPaymentMethodName] = useState('');
  const [paymentAccountName, setPaymentAccountName] = useState('');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null);
  const [paymentMethodSaving, setPaymentMethodSaving] = useState(false);
  const [paymentMethodError, setPaymentMethodError] = useState('');
  const [verificationPaymentId, setVerificationPaymentId] = useState('');
  const [verificationReference, setVerificationReference] = useState('');
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [orderManagementError, setOrderManagementError] = useState('');

  // New Business Form State
  const [newBizName, setNewBizName] = useState('');
  const [newBizSlug, setNewBizSlug] = useState('');
  const [newBizCustomCats, setNewBizCustomCats] = useState('');
  const [newBizCategory, setNewBizCategory] = useState('retail');
  const [newBizTemplate, setNewBizTemplate] = useState<string>('clean_modern');
  const [newBizMethod, setNewBizMethod] = useState<'self_service' | 'done_for_you' | 'ai_builder'>('self_service');
  const [newBizDesc, setNewBizDesc] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizAddress, setNewBizAddress] = useState('');
  const [newBizBot, setNewBizBot] = useState('');
  const [newBizDfyNotes, setNewBizDfyNotes] = useState('');

  // Product & Service Creation Forms
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Signature Offerings');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodDiscountPct, setProdDiscountPct] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodVariations, setProdVariations] = useState('Standard, Large');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodGallery, setProdGallery] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [lastUploadStats, setLastUploadStats] = useState<{ savedPercent: number; byteSize: number; sha256: string } | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'low' | 'out' | 'hidden'>('all');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productSaving, setProductSaving] = useState(false);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [commerceError, setCommerceError] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPaymentMethodsModalOpen, setIsPaymentMethodsModalOpen] = useState(false);

  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState(60);
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);

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
  const [empPerms, setEmpPerms] = useState<string[]>(['workspace.view', 'orders.manage', 'support.reply']);

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

  // Telegram & Web Setup + Stylized Notification Config State
  const [tgTokenInput, setTgTokenInput] = useState('');
  const [tgBotUsername, setTgBotUsername] = useState('');
  const [tgChannelUsername, setTgChannelUsername] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [tgWebhookActive, setTgWebhookActive] = useState(true);
  const [tgMiniAppPublished, setTgMiniAppPublished] = useState(true);
  const [tgSetupSaving, setTgSetupSaving] = useState(false);
  const [tgTestingConnection, setTgTestingConnection] = useState(false);
  const [tgSetupFieldErrors, setTgSetupFieldErrors] = useState<Record<string, string>>({});
  const [tgDiagnosticsResult, setTgDiagnosticsResult] = useState<any>(null);
  const [copiedEndpointKey, setCopiedEndpointKey] = useState<string>('');
  const [notifSettings, setNotifSettings] = useState<{
    new_orders: boolean;
    payment_requests: boolean;
    bookings: boolean;
    support: boolean;
    telegram_sync: boolean;
    button_mode: 'auto' | 'smart_auto' | 'with_buttons' | 'without_buttons';
  }>({
    new_orders: true,
    payment_requests: true,
    bookings: true,
    support: true,
    telegram_sync: true,
    button_mode: 'auto',
  });
  const [activeStylizedNotif, setActiveStylizedNotif] = useState<StylizedNotificationItem | null>(null);
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);
  const [customNotifTitle, setCustomNotifTitle] = useState('');
  const [customNotifMessage, setCustomNotifMessage] = useState('');
  const [customNotifTone, setCustomNotifTone] = useState<'telegram' | 'success' | 'info' | 'warning' | 'error'>('telegram');
  const [customNotifWithButtons, setCustomNotifWithButtons] = useState<boolean>(true);
  const [sendingTestNotif, setSendingTestNotif] = useState(false);

  // Auth Login/Register/Telegram/Recovery State (Store Owners Only)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'telegram' | 'recover'>('login');
  const [authEmail, setAuthEmail] = useState(() => {
    return localStorage.getItem('telebiz_remembered_identifier') || '';
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authTgUsername, setAuthTgUsername] = useState(() => {
    return localStorage.getItem('telebiz_remembered_tg') || '';
  });
  const [authRecoveryPasscode, setAuthRecoveryPasscode] = useState('');
  const [authRecoveryHint, setAuthRecoveryHint] = useState('');
  const [authRecoverNewPassword, setAuthRecoverNewPassword] = useState('');
  const [authRememberMe, setAuthRememberMe] = useState(() => {
    return localStorage.getItem('telebiz_remember_me') !== 'false';
  });
  const [authError, setAuthError] = useState('');
  const [authFieldErrors, setAuthFieldErrors] = useState<Record<string, string>>({});
  const [authValidationAttempted, setAuthValidationAttempted] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [tgSubMode, setTgSubMode] = useState<'auto' | 'login' | 'signup'>('auto');
  const [tgVerifyStatus, setTgVerifyStatus] = useState<{
    checking?: boolean;
    checked?: boolean;
    exists?: boolean;
    validFormat?: boolean;
    normalizedHandle?: string;
    account?: { name: string; owner_uid: string; telegram_username: string };
    formatError?: string;
  } | null>(null);
  const [tgRedirectLoading, setTgRedirectLoading] = useState(false);
  const [tgWaitingForSession, setTgWaitingForSession] = useState(false);
  const [tgAuthKey, setTgAuthKey] = useState('');
  const [tgBotName, setTgBotName] = useState('');
  const [tgRedirectUrl, setTgRedirectUrl] = useState('');
  const [tgDirectVerifyUrl, setTgDirectVerifyUrl] = useState('');
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleSubMode, setGoogleSubMode] = useState<'login' | 'signup'>('login');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleTg, setCustomGoogleTg] = useState('');
  const [customGooglePasscode, setCustomGooglePasscode] = useState('');
  const [googleVerifyStatus, setGoogleVerifyStatus] = useState<{
    checking?: boolean;
    checked?: boolean;
    exists?: boolean;
    validFormat?: boolean;
    account?: { name: string; owner_uid: string; email: string; telegram_username?: string };
    formatError?: string;
  } | null>(null);
  const [loginVerifyStatus, setLoginVerifyStatus] = useState<{
    checking?: boolean;
    checked?: boolean;
    exists?: boolean;
    account?: { name: string; owner_uid: string; email: string; telegram_username?: string };
  } | null>(null);
  const [showAddGoogleAccount, setShowAddGoogleAccount] = useState(false);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [savedGoogleAccounts, setSavedGoogleAccounts] = useState<Array<{ email: string; name: string }>>(() => {
    try {
      const raw = localStorage.getItem('telebiz_google_accounts');
      const parsed: Array<{ email: string; name: string }> = raw ? JSON.parse(raw) : [];
      const remembered = localStorage.getItem('telebiz_remembered_identifier') || '';
      if (remembered.includes('@') && !remembered.startsWith('@') && !parsed.some((a) => a.email.toLowerCase() === remembered.toLowerCase())) {
        parsed.unshift({
          email: remembered.trim().toLowerCase(),
          name: remembered.split('@')[0],
        });
      }
      if (!parsed.some((a) => a.email.toLowerCase() === 'folkkayo928@gmail.com')) {
        parsed.push({
          email: 'folkkayo928@gmail.com',
          name: 'Platform Owner (folkkayo928)',
        });
      }
      return parsed;
    } catch {
      return [{ email: 'folkkayo928@gmail.com', name: 'Platform Owner (folkkayo928)' }];
    }
  });

  // Menu & Settings Drawer + 3-Dot Brand List Menu + Category Manager State
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<'general' | 'account' | 'security' | 'admins'>('general');
  const [workspaceFont, setWorkspaceFont] = useState<'jakarta' | 'outfit' | 'playfair' | 'fraunces' | 'space'>('jakarta');
  const [openBrandMenuId, setOpenBrandMenuId] = useState<string | null>(null);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [renamingCategory, setRenamingCategory] = useState<{ oldName: string; newName: string } | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Admin / Owner Account & Security Settings State
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileEmailInput, setProfileEmailInput] = useState('');
  const [profileTgInput, setProfileTgInput] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [recoveryPasscodeInput, setRecoveryPasscodeInput] = useState('');
  const [recoveryHintInput, setRecoveryHintInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isPasscodeLocked, setIsPasscodeLocked] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [coAdminName, setCoAdminName] = useState('');
  const [coAdminEmail, setCoAdminEmail] = useState('');
  const [coAdminPassword, setCoAdminPassword] = useState('');
  const [coAdminsList, setCoAdminsList] = useState<any[]>([]);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // 3-Role Access Control & Store/Order Filtering State
  const [storefrontCustomerOnly, setStorefrontCustomerOnly] = useState(false);
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');
  const [expandedCatalogBizId, setExpandedCatalogBizId] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'payment_requests' | 'finished' | 'rejected'>('all');
  const [roleGuideModalOpen, setRoleGuideModalOpen] = useState(false);

  const t = translations[lang] || translations.en;

  const headersWithAuth = useCallback(
    (overrideToken?: string) => {
      const h: Record<string, string> = { 'Content-Type': 'application/json' };
      const resolvedToken = overrideToken || authToken || localStorage.getItem('telebiz_token') || '';
      if (resolvedToken) h['Authorization'] = `Bearer ${resolvedToken}`;
      return h;
    },
    [authToken]
  );

  const navigateToModule = useCallback(
    (nextModule: ActiveModule) => {
      setMobileMoreOpen(false);
      if (!currentUser) {
        setAuthError('');
        setAuthFieldErrors({});
        setAuthValidationAttempted(false);
        setActiveModule(nextModule);
        return;
      }
      if (nextModule !== activeModule) {
        setPreviousModule(activeModule);
      }
      setActiveModule(nextModule);
    },
    [currentUser, activeModule]
  );

  const handleBackFromPage = useCallback(() => {
    setMobileMoreOpen(false);
    if (activeModule === 'more') {
      setActiveModule('overview');
      return;
    }
    if (previousModule && previousModule !== activeModule) {
      const target = previousModule;
      setPreviousModule('overview');
      setActiveModule(target);
      return;
    }
    setActiveModule('overview');
  }, [activeModule, previousModule]);

  const loadTenantWorkspace = useCallback(
    async (bizId: string, overrideToken?: string) => {
      const effectiveToken = overrideToken || authToken || localStorage.getItem('telebiz_token') || '';
      if (!bizId || !effectiveToken) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const reqHeaders = headersWithAuth(effectiveToken);
        const [wsRes, anRes, supRes, addRes] = await Promise.all([
          fetch(`/api/businesses/${bizId}/workspace`, { headers: reqHeaders }).catch(() => null),
          fetch(`/api/businesses/${bizId}/analytics`, { headers: reqHeaders }).catch(() => null),
          fetch(`/api/businesses/${bizId}/support`, { headers: reqHeaders }).catch(() => null),
          fetch('/api/addons', { headers: reqHeaders }).catch(() => null),
        ]);

        if (wsRes && wsRes.ok) {
          const ws = await wsRes.json().catch(() => null);
          if (ws) {
            setWorkspace(ws);
            setTgBotUsername(ws.business?.telegram_bot_username || '');
            setTgChannelUsername(ws.business?.telegram_channel_username || '');
            setCustomDomainInput(ws.business?.custom_domain || '');
            setTgWebhookActive(
              ws.business?.telegram_webhook_active !== undefined ? Boolean(ws.business.telegram_webhook_active) : true
            );
            setTgMiniAppPublished(
              ws.business?.mini_app_published !== undefined ? Boolean(ws.business.mini_app_published) : true
            );
            if (ws.business?.notification_settings_json) {
              try {
                const parsedSettings = JSON.parse(ws.business.notification_settings_json);
                setNotifSettings((prev) => ({ ...prev, ...parsedSettings }));
              } catch {
                // ignore
              }
            }
          }
        }
        if (anRes && anRes.ok) {
          const an = await anRes.json().catch(() => null);
          if (an) setAnalyticsData(an);
        }
        if (supRes && supRes.ok) {
          const threads = await supRes.json().catch(() => []);
          if (Array.isArray(threads)) {
            setSupportThreads(threads);
            if (threads.length > 0 && !selectedConvId) {
              setSelectedConvId(threads[0].id);
            }
          }
        }
        if (addRes && addRes.ok) {
          const addons = await addRes.json().catch(() => []);
          if (Array.isArray(addons)) setMarketplaceAddons(addons);
        }
      } catch (err) {
        console.warn('Workspace load warning:', err);
      } finally {
        setLoading(false);
      }
    },
    [headersWithAuth, selectedConvId, authToken]
  );

  const loadAccountAndBusinesses = useCallback(
    async (overrideToken?: string, preferredBizId?: string) => {
      const effectiveToken = overrideToken || authToken || localStorage.getItem('telebiz_token') || '';
      if (!effectiveToken) {
        // Check if running inside Telegram Mini App and user has NOT explicitly signed out
        const explicitLogout = localStorage.getItem('telebiz_explicit_logout') === 'true';
        const tgWebAppUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        if (!explicitLogout && tgWebAppUser && (tgWebAppUser.username || tgWebAppUser.id)) {
          const handle = tgWebAppUser.username ? `@${tgWebAppUser.username}` : `@tg_${tgWebAppUser.id}`;
          const fullName =
            [tgWebAppUser.first_name, tgWebAppUser.last_name].filter(Boolean).join(' ') || 'Store Owner';
          const confirmRes = await fetch('/api/auth/telegram/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegram_username: handle,
              telegram_id: String(tgWebAppUser.id),
              telegram_init_data: (window as any).Telegram?.WebApp?.initData || '',
              name: fullName,
              intent: 'auto',
              role: 'store_owner',
            }),
          }).catch(() => null);
          if (confirmRes && confirmRes.ok) {
            const confirmData = await confirmRes.json().catch(() => null);
            if (confirmData && confirmData.token && confirmData.user) {
              localStorage.setItem('telebiz_token', confirmData.token);
              localStorage.setItem('telebiz_cached_user', JSON.stringify(confirmData.user));
              localStorage.removeItem('telebiz_explicit_logout');
              setAuthToken(confirmData.token);
              setCurrentUser(confirmData.user);
              setActiveModule('overview');
              await loadAccountAndBusinesses(confirmData.token, confirmData.user.last_selected_business_id);
              return;
            }
          }
        }
        setLoading(false);
        return;
      }

      try {
        const reqHeaders = headersWithAuth(effectiveToken);
        const res = await fetch('/api/auth/me', { headers: reqHeaders }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.user) {
            localStorage.setItem('telebiz_cached_user', JSON.stringify(data.user));
            localStorage.removeItem('telebiz_explicit_logout');
            if (data.user.email) {
              localStorage.setItem('telebiz_remembered_identifier', data.user.email);
            }
            if (data.user.telegram_username) {
              localStorage.setItem('telebiz_remembered_tg', data.user.telegram_username);
            }
            setCurrentUser(data.user);
            setProfileNameInput(data.user.name || '');
            setProfileEmailInput(data.user.email || '');
            setProfileTgInput(data.user.telegram_username || '');
            setLang((data.user.preferred_language as LanguageCode) || 'en');
            setAvailableAccounts(data.availableAccounts || []);
            const bizList: any[] = data.businesses || [];
            setBusinesses(bizList);

            if (bizList.length > 0) {
              const storedBizId = localStorage.getItem('telebiz_selected_business_id') || '';
              const serverPreferredBizId = String(data.user.last_selected_business_id || '');
              const ownedBiz = bizList.find((b: any) => b.owner_id === data.user.id);

              let targetBizId = '';
              if (preferredBizId && bizList.some((b: any) => b.id === preferredBizId)) {
                targetBizId = preferredBizId;
              } else if (serverPreferredBizId && bizList.some((b: any) => b.id === serverPreferredBizId)) {
                targetBizId = serverPreferredBizId;
              } else if (storedBizId && bizList.some((b: any) => b.id === storedBizId)) {
                targetBizId = storedBizId;
              } else if (ownedBiz) {
                targetBizId = ownedBiz.id;
              } else {
                targetBizId = bizList[0].id;
              }

              localStorage.setItem('telebiz_selected_business_id', targetBizId);
              setSelectedBusinessId(targetBizId);
              await loadTenantWorkspace(targetBizId, effectiveToken);
            } else {
              setLoading(false);
            }
          }
        } else if (res && res.status === 401) {
          const currentStoredToken = localStorage.getItem('telebiz_token') || '';
          if (!currentStoredToken || currentStoredToken === effectiveToken) {
            localStorage.removeItem('telebiz_token');
            localStorage.removeItem('telebiz_cached_user');
            setAuthToken('');
            setCurrentUser(null);
            setWorkspace(null);
          }
          setLoading(false);
        }
        const admRes = await fetch('/api/superadmin/admins', { headers: reqHeaders }).catch(() => null);
        if (admRes && admRes.ok) {
          const admins = await admRes.json().catch(() => null);
          if (Array.isArray(admins)) setCoAdminsList(admins);
        }
      } catch (err) {
        console.warn('Account load warning:', err);
        setLoading(false);
      }
    },
    [authToken, headersWithAuth, loadTenantWorkspace]
  );

  const completeAuthenticatedSession = useCallback(
    async (token: string, user: any, bannerMsg?: string, targetModule: ActiveModule = 'overview') => {
      localStorage.setItem('telebiz_token', token);
      localStorage.setItem('telebiz_cached_user', JSON.stringify(user));
      localStorage.removeItem('telebiz_explicit_logout');
      if (user?.email) {
        localStorage.setItem('telebiz_remembered_identifier', user.email);
        setAuthEmail(user.email);
      }
      if (user?.telegram_username) {
        localStorage.setItem('telebiz_remembered_tg', user.telegram_username);
        setAuthTgUsername(user.telegram_username);
      }
      if (user?.last_selected_business_id) {
        localStorage.setItem('telebiz_selected_business_id', user.last_selected_business_id);
        setSelectedBusinessId(user.last_selected_business_id);
      }
      setAuthToken(token);
      setCurrentUser(user);
      setAuthFieldErrors({});
      setAuthError('');
      setAuthValidationAttempted(false);
      setAuthModalOpen(false);
      setGooglePromptOpen(false);
      setStorefrontCustomerOnly(false);
      setFullStorefrontOpen(false);
      setMobileMoreOpen(false);
      setActiveModule(targetModule);
      if (bannerMsg) {
        setStatusBanner(bannerMsg);
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      await loadAccountAndBusinesses(token, user?.last_selected_business_id);
    },
    [loadAccountAndBusinesses]
  );

  useEffect(() => {
    loadAccountAndBusinesses();
  }, [loadAccountAndBusinesses]);

  useEffect(() => {
    if (selectedBusinessId && businesses.some((b: any) => b.id === selectedBusinessId)) {
      localStorage.setItem('telebiz_selected_business_id', selectedBusinessId);
      if (authToken) {
        fetch('/api/auth/select-business', {
          method: 'PATCH',
          headers: headersWithAuth(),
          body: JSON.stringify({ businessId: selectedBusinessId }),
        }).catch(() => {});
      }
      loadTenantWorkspace(selectedBusinessId);
    }
    setEditingProduct(null);
    setProductSearch('');
    setProductStockFilter('all');
    setCommerceError('');
    setEditingPaymentMethod(null);
    setPaymentMethodName('');
    setPaymentAccountName('');
    setPaymentAccountNumber('');
    setPaymentMethodError('');
    setVerificationPaymentId('');
    setVerificationReference('');
    setOrderManagementError('');
  }, [selectedBusinessId, businesses, authToken, headersWithAuth, loadTenantWorkspace]);

  const handleSwitchDemoAccount = async (userId: string, openModule?: ActiveModule) => {
    const res = await fetch('/api/auth/switch-account', {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      const roleLabel =
        data.user.platform_role === 'super_admin'
          ? 'Platform Admin (Full Access)'
          : 'Store Owner (Isolated to Own Store Only)';
      const nextMod: ActiveModule = openModule
        ? openModule
        : data.user.platform_role === 'super_admin'
        ? 'superadmin'
        : 'overview';
      await completeAuthenticatedSession(
        data.token,
        data.user,
        `Switched active role to ${data.user.name} — ${roleLabel}`,
        nextMod
      );
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

  const handleSignOut = () => {
    fetch('/api/auth/logout', { method: 'POST', headers: headersWithAuth() }).catch(() => {});
    localStorage.setItem('telebiz_explicit_logout', 'true');
    localStorage.removeItem('telebiz_token');
    localStorage.removeItem('telebiz_cached_user');
    setAuthToken('');
    setCurrentUser(null);
    setWorkspace(null);
    setAnalyticsData(null);
    setMenuDrawerOpen(false);
    setNotifCenterOpen(false);
    setStatusBanner('You have been signed out. Log in or sign up to access your workspace.');
  };

  const checkTelegramUsername = useCallback(async (rawInput: string, silent = false) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setTgVerifyStatus(null);
      return null;
    }
    const cleanNoAt = trimmed.replace(/^@+/, '');
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(cleanNoAt)) {
      const invalidStatus = {
        checking: false,
        checked: true,
        exists: false,
        validFormat: false,
        normalizedHandle: `@${cleanNoAt}`,
        formatError:
          cleanNoAt.length < 3
            ? `Telegram Handle "@${cleanNoAt}" is too short (${cleanNoAt.length}/3 minimum characters).`
            : cleanNoAt.length > 32
            ? `Telegram Handle exceeds 32 characters (${cleanNoAt.length}/32).`
            : 'Telegram Handle can only contain letters (A–Z), numbers (0–9), and underscores (_).',
      };
      setTgVerifyStatus(invalidStatus);
      return invalidStatus;
    }

    if (!silent) {
      setTgVerifyStatus((prev) => ({ ...prev, checking: true }));
    }
    try {
      const res = await fetch(`/api/auth/check-account?type=telegram&identifier=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => null);
      if (!data) return null;
      const nextStatus = {
        checking: false,
        checked: true,
        exists: Boolean(data.exists),
        validFormat: Boolean(data.validFormat),
        normalizedHandle: data.normalizedHandle || `@${cleanNoAt}`,
        account: data.account || undefined,
        formatError: data.formatError || undefined,
      };
      setTgVerifyStatus(nextStatus);
      return nextStatus;
    } catch {
      setTgVerifyStatus((prev) => (prev ? { ...prev, checking: false } : null));
      return null;
    }
  }, []);

  // Automatically verify Telegram handle after a short debounce so account status is ready before submit
  useEffect(() => {
    if (!authModalOpen && !googlePromptOpen) return;
    const raw = (googlePromptOpen ? customGoogleTg : authTgUsername).trim();
    const cleanNoAt = raw.replace(/^@+/, '');
    if (!cleanNoAt || !/^[a-zA-Z0-9_]{3,32}$/.test(cleanNoAt)) {
      return;
    }
    const timer = setTimeout(() => {
      checkTelegramUsername(raw, true);
    }, 280);
    return () => clearTimeout(timer);
  }, [authTgUsername, customGoogleTg, authModalOpen, googlePromptOpen, checkTelegramUsername]);

  const checkLoginIdentifier = useCallback(async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed || trimmed.length < 3) {
      setLoginVerifyStatus(null);
      return null;
    }
    setLoginVerifyStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch(`/api/auth/check-account?identifier=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => null);
      if (!data) {
        setLoginVerifyStatus(null);
        return null;
      }
      const status = {
        checking: false,
        checked: true,
        exists: Boolean(data.exists),
        account: data.account || undefined,
      };
      setLoginVerifyStatus(status);
      return status;
    } catch {
      setLoginVerifyStatus(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!authModalOpen || authMode !== 'login') return;
    const trimmed = authEmail.trim();
    if (!trimmed || trimmed.length < 3) {
      setLoginVerifyStatus(null);
      return;
    }
    const timer = setTimeout(() => {
      checkLoginIdentifier(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [authEmail, authModalOpen, authMode, checkLoginIdentifier]);

  const validateCollectiveOwnerFields = useCallback(
    (params: {
      telegramHandle: string;
      ownerName: string;
      recoveryPasscode: string;
      mode: 'telegram' | 'register' | 'google' | 'recover';
      subMode?: 'auto' | 'login' | 'signup';
      handleStatus?: any;
      requireTelegramHandle?: boolean;
      requireOwnerName?: boolean;
      requirePasscode?: boolean;
    }) => {
      const {
        telegramHandle,
        ownerName,
        recoveryPasscode,
        mode,
        requireTelegramHandle = mode === 'telegram',
        requireOwnerName = false,
        requirePasscode = mode === 'recover',
      } = params;

      const rawTg = telegramHandle.trim();
      const cleanTgNoAt = rawTg.replace(/^@+/, '').replace(/\s+/g, '');
      const normalizedTg = cleanTgNoAt ? `@${cleanTgNoAt}` : '';
      const cleanName = ownerName.trim();
      const cleanPasscode = recoveryPasscode.trim();

      const fieldErrors: Record<string, string> = {};

      if (requireTelegramHandle && cleanTgNoAt.length < 3) {
        fieldErrors.telegram_username = 'Telegram Handle (@username) is required (at least 3 characters).';
      }
      if (requireOwnerName && cleanName.length < 2) {
        fieldErrors.name = 'Store Owner Name is required (at least 2 characters).';
      }
      if (requirePasscode && cleanPasscode.length < 4) {
        fieldErrors.recovery_passcode = 'Recovery Passcode must be at least 8 characters.';
      }

      const failedFields = Object.entries(fieldErrors).map(([key, message], idx) => ({
        key: key as 'telegram_username' | 'name' | 'recovery_passcode',
        fieldNumber: idx + 1,
        label: key,
        message,
      }));

      return {
        isValid: failedFields.length === 0,
        fieldErrors,
        failedFields,
        summaryMessage: failedFields.map((f) => f.message).join(' '),
        isExistingHandle: false,
        isConfirmedNewHandle: false,
        normalizedTg,
      };
    },
    []
  );

  const checkGoogleEmail = useCallback(async (rawEmail: string, silent = false) => {
    const trimmed = rawEmail.trim().toLowerCase();
    if (!trimmed) {
      setGoogleVerifyStatus(null);
      return null;
    }
    if (!silent) {
      setGoogleVerifyStatus((prev) => ({ ...prev, checking: true }));
    }
    try {
      const res = await fetch(`/api/auth/check-account?type=google&identifier=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => null);
      if (!data) return null;
      const nextStatus = {
        checking: false,
        checked: true,
        exists: Boolean(data.exists),
        validFormat: Boolean(data.validFormat),
        account: data.account || undefined,
        formatError: data.formatError || undefined,
      };
      setGoogleVerifyStatus(nextStatus);
      return nextStatus;
    } catch {
      setGoogleVerifyStatus((prev) => (prev ? { ...prev, checking: false } : null));
      return null;
    }
  }, []);

  const handleStartTelegramRedirect = async () => {
    setTgRedirectLoading(true);
    setAuthError('');
    setAuthFieldErrors({});
    try {
      // 1. Check if running directly inside Telegram WebApp context
      const tgWebAppUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgWebAppUser && (tgWebAppUser.username || tgWebAppUser.id)) {
        const handle = tgWebAppUser.username ? `@${tgWebAppUser.username}` : `@tg_${tgWebAppUser.id}`;
        const fullName = [tgWebAppUser.first_name, tgWebAppUser.last_name].filter(Boolean).join(' ') || 'Store Owner';
        const confirmRes = await fetch('/api/auth/telegram/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_username: handle,
            telegram_id: String(tgWebAppUser.id),
            telegram_init_data: (window as any).Telegram?.WebApp?.initData || '',
            name: fullName,
            intent: 'auto',
            role: 'store_owner',
          }),
        });
        const confirmData = await confirmRes.json().catch(() => ({}));
        if (!confirmRes.ok) {
          setAuthModalOpen(true);
          setAuthMode('telegram');
          setAuthError(confirmData.error || 'Complete Telegram account setup to continue.');
          return;
        }
        if (confirmRes.ok && confirmData.token) {
          await completeAuthenticatedSession(
            confirmData.token,
            confirmData.user,
            `Signed in via Telegram WebApp (${handle}) · Store Owner ID: ${confirmData.user?.owner_uid}`,
            'overview'
          );
          return;
        }
      }

      // 2. Otherwise start a Telegram Direct Connect & Bot Verification session
      const res = await fetch('/api/auth/telegram/redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'store_owner', business_id: selectedBusinessId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start Telegram login');
      setTgAuthKey(data.auth_key);
      setTgBotName(data.bot_username);
      setTgRedirectUrl(data.redirect_url);
      setTgDirectVerifyUrl(data.direct_verify_url || '');
      setTgWaitingForSession(true);

      // Start polling for approval every 2 seconds
      let pollCount = 0;
      const pollTimer = setInterval(async () => {
        pollCount++;
        if (pollCount > 120) {
          clearInterval(pollTimer);
          setTgWaitingForSession(false);
          return;
        }
        try {
          const pollRes = await fetch(`/api/auth/telegram/check-status?auth_key=${data.auth_key}`);
          const pollData = await pollRes.json();
          if ((pollData.status === 'confirmed' || pollData.completed) && pollData.token) {
            clearInterval(pollTimer);
            setTgWaitingForSession(false);
            if (authRememberMe) {
              localStorage.setItem('telebiz_remember_me', 'true');
              if (pollData.user?.telegram_username) {
                localStorage.setItem('telebiz_remembered_tg', pollData.user.telegram_username);
              }
            }
            await completeAuthenticatedSession(
              pollData.token,
              pollData.user,
              `Signed in via Telegram (${pollData.user?.telegram_username || pollData.user?.name}) · Store Owner ID: ${pollData.user?.owner_uid}`,
              'overview'
            );
          }
        } catch {
          // ignore transient poll error
        }
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || 'Could not start Telegram Direct Connect.');
    } finally {
      setTgRedirectLoading(false);
    }
  };

  const saveDeviceGoogleAccount = useCallback((email: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    setSavedGoogleAccounts((prev) => {
      const filtered = prev.filter((a) => a.email.toLowerCase() !== cleanEmail);
      const updated = [{ email: cleanEmail, name: cleanName }, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('telebiz_google_accounts', JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.token && event.data?.user) {
        const { token, user } = event.data;
        localStorage.setItem('telebiz_remember_me', 'true');
        if (user.email) {
          localStorage.setItem('telebiz_remembered_identifier', user.email);
          saveDeviceGoogleAccount(user.email, user.name || user.email.split('@')[0]);
        }
        completeAuthenticatedSession(
          token,
          user,
          `Signed in with Google as ${user.name} (${user.email})`,
          'overview'
        );
      } else if (event.data?.type === 'TELEGRAM_AUTH_SUCCESS' && event.data?.token && event.data?.user) {
        const { token, user, message } = event.data;
        localStorage.setItem('telebiz_remember_me', 'true');
        if (user.telegram_username) {
          localStorage.setItem('telebiz_remembered_tg', user.telegram_username);
        }
        setTgWaitingForSession(false);
        completeAuthenticatedSession(
          token,
          user,
          message || `Signed in via Telegram (${user.telegram_username || user.name}) · Store Owner ID: ${user.owner_uid}`,
          'overview'
        );
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [completeAuthenticatedSession, saveDeviceGoogleAccount]);

  const handleContinueWithGoogleClick = () => {
    setAuthError('');
    setAuthFieldErrors({});
    setAuthValidationAttempted(false);
    setGoogleVerifyStatus(null);
    setShowAddGoogleAccount(false);
    setGooglePromptOpen(true);
  };

  const handleGoogleAuth = async (
    _emailToUse: string,
    _nameToUse?: string,
    _options?: { directConnect?: boolean; intent?: 'login' | 'signup' | 'auto'; passcode?: string; telegramHandle?: string }
  ) => {
    setGoogleAuthLoading(true);
    setAuthError('');
    setAuthFieldErrors({});
    const popup = window.open('about:blank', 'telebiz-google-sign-in', 'popup,width=520,height=720');
    if (!popup) {
      setGoogleAuthLoading(false);
      setAuthError('Allow pop-ups for Telebiz so Google can open its secure sign-in window.');
      return;
    }
    try {
      const response = await fetch('/api/auth/google/url', { method: 'GET', credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.configured || !data.url) {
        popup.close();
        throw new Error(data.error || 'Google sign-in is not configured on this server.');
      }
      popup.location.href = data.url;
    } catch (error: any) {
      try { popup.close(); } catch { /* ignore popup close errors */ }
      setAuthError(error?.message || 'Could not start Google sign-in.');
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthFieldErrors({});
    setAuthSuccessMsg('');
    setAuthValidationAttempted(true);

    const persistAuthIdentifiers = (identifier?: string, tgHandle?: string, displayName?: string) => {
      localStorage.setItem('telebiz_remember_me', 'true');
      if (identifier && identifier.trim()) {
        localStorage.setItem('telebiz_remembered_identifier', identifier.trim());
        if (identifier.includes('@') && !identifier.startsWith('@')) {
          saveDeviceGoogleAccount(identifier.trim(), displayName || identifier.split('@')[0]);
        }
      }
      if (tgHandle && tgHandle.trim()) {
        localStorage.setItem('telebiz_remembered_tg', tgHandle.trim());
      }
    };

    if (authMode === 'telegram') {
      const rawTg = authTgUsername.trim();
      const rawName = authName.trim();
      const rawPass = authRecoveryPasscode.trim();
      const cleanTgNoAt = rawTg.replace(/^@+/, '').replace(/\s+/g, '');

      if (!cleanTgNoAt || cleanTgNoAt.length < 3) {
        setAuthFieldErrors({ telegram_username: 'Telegram Handle (@username) is required (at least 3 characters).' });
        setAuthError('Please enter your Telegram @username.');
        return;
      }

      const cleanTg = `@${cleanTgNoAt}`;
      const res = await fetch('/api/auth/telegram/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_key: tgWaitingForSession && tgAuthKey ? tgAuthKey : undefined,
          telegram_username: cleanTg,
          telegram_id: String((window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || ''),
          telegram_init_data: (window as any).Telegram?.WebApp?.initData || '',
          name: rawName || cleanTgNoAt,
          recovery_passcode: rawPass,
          intent: 'auto',
          role: 'store_owner',
          language: lang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fieldErrors) setAuthFieldErrors(data.fieldErrors);
        setAuthError(data.error || 'Telegram verification failed.');
        return;
      }
      setTgWaitingForSession(false);
      persistAuthIdentifiers(data.user.email, cleanTg, data.user.name);
      await completeAuthenticatedSession(
        data.token,
        data.user,
        data.message || `Signed in via Telegram (${cleanTg}) · Store Owner ID: ${data.user.owner_uid}`,
        'overview'
      );
      return;
    }

    if (authMode === 'recover') {
      if (!authEmail.trim()) {
        setAuthFieldErrors({ identifier: 'Email, Telegram @Handle, or Store Owner ID (OWN-...) is required.' });
        setAuthError('Please enter your Email, Telegram @Handle, or Store Owner ID.');
        return;
      }
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: authEmail.trim(),
          recovery_passcode: authRecoveryPasscode.trim(),
          new_password: authRecoverNewPassword.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fieldErrors) setAuthFieldErrors(data.fieldErrors);
        setAuthError(data.error || 'Account recovery failed. Check your Recovery Passcode.');
        return;
      }
      persistAuthIdentifiers(data.user.email || authEmail, data.user.telegram_username, data.user.name);
      await completeAuthenticatedSession(
        data.token,
        data.user,
        data.message || `Account recovered! Welcome back ${data.user.name} (${data.user.owner_uid}).`,
        'overview'
      );
      return;
    }

    if (authMode === 'register') {
      const regErrors: Record<string, string> = {};
      const cleanEmail = authEmail.trim().toLowerCase();
      const effectiveName = authName.trim() || (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : '');
      if (!effectiveName || effectiveName.length < 2) {
        regErrors.name = 'Store Owner Full Name is required.';
      }
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        regErrors.email = 'A valid Email Address is required (e.g. owner@yourbrand.com).';
      }
      if (!authPassword.trim() || authPassword.trim().length < 8) {
        regErrors.password = 'Password must be at least 8 characters.';
      }
      if (authRecoveryPasscode.trim().length < 8) {
        regErrors.recovery_passcode = 'Recovery passcode must be at least 8 characters.';
      }
      if (Object.keys(regErrors).length > 0) {
        setAuthFieldErrors(regErrors);
        setAuthError(Object.values(regErrors).join(' '));
        return;
      }
    } else if (authMode === 'login') {
      const loginErrors: Record<string, string> = {};
      if (!authEmail.trim()) {
        loginErrors.identifier = 'Please enter your Email, Telegram @Handle, or Store Owner ID (OWN-...).';
      }
      if (!authPassword.trim()) {
        loginErrors.password = 'Please enter your Password or Secondary Passcode.';
      }
      if (Object.keys(loginErrors).length > 0) {
        setAuthFieldErrors(loginErrors);
        setAuthError('Please enter both your account identifier and password/passcode.');
        return;
      }
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: authName.trim() || (authEmail.includes('@') ? authEmail.split('@')[0] : authEmail.trim()),
        email: authEmail.trim(),
        password: authPassword.trim(),
        telegram_username: authTgUsername.trim(),
        recovery_passcode: authRecoveryPasscode.trim(),
        recovery_hint: authRecoveryHint,
        language: lang,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data.fieldErrors) setAuthFieldErrors(data.fieldErrors);
      setAuthError(data.error || 'Authentication failed');
    } else {
      persistAuthIdentifiers(data.user.email || authEmail, data.user.telegram_username, data.user.name);
      await completeAuthenticatedSession(
        data.token,
        data.user,
        authMode === 'register'
          ? `Store Owner Account Created! Your Unique Store Owner ID is ${data.user.owner_uid}. Welcome to your dashboard.`
          : `Signed in as ${data.user.name} (${data.user.owner_uid || 'Store Owner'})`,
        'overview'
      );
    }
  };

  // Client-side HTML5 Canvas WebP/JPEG Photo Compressor + SHA-256 Deduplicated Upload
  const compressAndUploadDevicePhotos = async (
    fileList: FileList | null,
    target: 'new' | 'edit'
  ) => {
    if (!fileList || fileList.length === 0) return;
    setPhotoUploading(true);
    setCommerceError('');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < Math.min(fileList.length, 4); i++) {
        const file = fileList[i];
        const compressed = await new Promise<{
          dataUrl: string;
          width: number;
          height: number;
          originalSize: number;
        }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Invalid image format'));
            img.onload = () => {
              const maxDim = 960;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
              }
              let dataUrl = canvas.toDataURL('image/webp', 0.82);
              if (!dataUrl.startsWith('data:image/webp')) {
                dataUrl = canvas.toDataURL('image/jpeg', 0.82);
              }
              resolve({ dataUrl, width: w, height: h, originalSize: file.size });
            };
            img.src = String(reader.result);
          };
          reader.readAsDataURL(file);
        });

        const res = await fetch(`/api/businesses/${selectedBusinessId}/media/upload`, {
          method: 'POST',
          headers: headersWithAuth(),
          body: JSON.stringify({
            dataUrl: compressed.dataUrl,
            width: compressed.width,
            height: compressed.height,
            originalSize: compressed.originalSize,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Photo upload failed');
        }
        uploadedUrls.push(data.url);
        setLastUploadStats({
          savedPercent: data.savedPercent ?? 0,
          byteSize: data.byteSize ?? 0,
          sha256: data.sha256 ?? '',
        });
      }

      if (uploadedUrls.length > 0) {
        if (target === 'new') {
          setProdImageUrl((prev) => prev || uploadedUrls[0]);
          setProdGallery((prev) => Array.from(new Set([...prev, ...uploadedUrls])).slice(0, 4));
        } else if (editingProduct) {
          const existingGallery = Array.isArray(editingProduct.gallery) ? editingProduct.gallery : [];
          const nextGallery = Array.from(new Set([...existingGallery, ...uploadedUrls])).slice(0, 4);
          setEditingProduct({
            ...editingProduct,
            image_url: editingProduct.image_url || uploadedUrls[0],
            gallery: nextGallery,
          });
        }
      }
    } catch (err: any) {
      setCommerceError(err.message || 'Could not optimize and upload photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommerceError('');
    const templatePresetMap: Record<string, { primary: string; accent: string; font: string; bg: string; darkness: string; pattern: string }> = {
      clean_modern: { primary: '#0F172A', accent: '#6366F1', font: 'Plus Jakarta Sans', bg: '#F8FAFC', darkness: 'light', pattern: 'subtle_grid' },
      luxury_chains_jewelry: { primary: '#121214', accent: '#D4AF37', font: 'Cinzel', bg: '#0B0C10', darkness: 'dark', pattern: 'gold_dust' },
      baggy_streetwear: { primary: '#18181B', accent: '#FF5500', font: 'Oswald', bg: '#121316', darkness: 'dark', pattern: 'concrete_grain' },
      gourmet_food_roastery: { primary: '#24140E', accent: '#C86432', font: 'Playfair Display', bg: '#FAF5EE', darkness: 'light', pattern: 'craft_fibers' },
      royal_boutique: { primary: '#0F382A', accent: '#C69C6D', font: 'Amiri', bg: '#FBF8F2', darkness: 'light', pattern: 'islamic_geometry' },
      digital_menu: { primary: '#450A0A', accent: '#D97706', font: 'Space Grotesk', bg: '#180707', darkness: 'dark', pattern: 'subtle_grid' },
    };
    const chosenPreset = templatePresetMap[newBizTemplate] || templatePresetMap.clean_modern;

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({
          name: newBizName.trim(),
          store_id: newBizSlug.trim() || undefined,
          categories: newBizCustomCats.trim() ? newBizCustomCats.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
          category: newBizCategory,
          template_id: newBizTemplate,
          primary_color: chosenPreset.primary,
          accent_color: chosenPreset.accent,
          font_family: chosenPreset.font,
          background_color: chosenPreset.bg,
          page_darkness: chosenPreset.darkness,
          background_pattern: chosenPreset.pattern,
          creation_method: newBizMethod,
          description: newBizDesc,
          contact_phone: newBizPhone,
          address: newBizAddress,
          telegram_bot_username: newBizBot,
          dfy_notes: newBizDfyNotes,
        }),
      });
      const created = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommerceError(created.error || 'Store could not be created. Please try again.');
        return;
      }
      if (!created?.id) {
        setCommerceError('The server did not confirm that the store was created.');
        return;
      }

      setNewBizModalOpen(false);
      setNewBizName('');
      setNewBizSlug('');
      setNewBizCustomCats('');
      setNewBizDesc('');
      localStorage.setItem('telebiz_selected_business_id', created.id);
      setSelectedBusinessId(created.id);
      await loadAccountAndBusinesses(undefined, created.id);
      setFullStorefrontOpen(true);
      setStatusBanner(
        `Store "${created.name}" created as a private draft. Add products and connect payment and Telegram details before publishing.`
      );
    } catch (error: any) {
      setCommerceError(error?.message || 'Network error. The store was not created.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaving(true);
    setCommerceError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/products`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({
          name: prodName.trim(),
          category_name: prodCat.trim(),
          price: Number(prodPrice),
          compare_at_price: prodComparePrice ? Number(prodComparePrice) : null,
          discount_percent: prodDiscountPct ? Number(prodDiscountPct) : 0,
          stock: Number(prodStock),
          description: prodDesc,
          variations: prodVariations,
          image_url: prodImageUrl,
          gallery: prodGallery.length > 0 ? prodGallery : prodImageUrl ? [prodImageUrl] : [],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommerceError(json.error || 'The product could not be created. Please try again.');
        return;
      }
      setProdName('');
      setProdPrice('');
      setProdComparePrice('');
      setProdDiscountPct('');
      setProdStock('');
      setProdDesc('');
      setProdImageUrl('');
      setProdGallery([]);
      setIsProductModalOpen(false);
      await loadTenantWorkspace(selectedBusinessId);
      setStatusBanner('Product with optimized photos and pricing added to the catalog.');
    } catch (err: any) {
      setCommerceError(err.message || 'Network error. The product was not created.');
    } finally {
      setProductSaving(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || productSaving) return;
    setProductSaving(true);
    setCommerceError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: headersWithAuth(),
        body: JSON.stringify({
          name: String(editingProduct.name || '').trim(),
          category_name: String(editingProduct.category_name || 'Signature Offerings').trim(),
          description: String(editingProduct.description || ''),
          variations: String(editingProduct.variations || ''),
          price: Number(editingProduct.price),
          compare_at_price: editingProduct.compare_at_price ? Number(editingProduct.compare_at_price) : null,
          discount_percent: editingProduct.discount_percent ? Number(editingProduct.discount_percent) : 0,
          stock: Number(editingProduct.stock),
          image_url: editingProduct.image_url || '',
          gallery: Array.isArray(editingProduct.gallery) ? editingProduct.gallery : [],
          available: Boolean(editingProduct.available),
          featured: Boolean(editingProduct.featured),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommerceError(json.error || 'Product changes could not be saved.');
        return;
      }
      setEditingProduct(null);
      setIsProductModalOpen(false);
      await loadTenantWorkspace(selectedBusinessId);
      await loadAccountAndBusinesses();
      setStatusBanner('Product details, photos, discount, and inventory updated.');
    } catch (err: any) {
      setCommerceError(err.message || 'Network error. Product changes were not saved.');
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from your store catalog?`)) return;
    setProductSaving(true);
    setCommerceError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/products/${productId}`, {
        method: 'DELETE',
        headers: headersWithAuth(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommerceError(json.error || 'Failed to delete product.');
        return;
      }
      if (editingProduct?.id === productId) {
        setEditingProduct(null);
        setIsProductModalOpen(false);
      }
      await loadTenantWorkspace(selectedBusinessId);
      await loadAccountAndBusinesses();
      setStatusBanner(`Product "${productName}" removed from catalog.`);
    } catch (err: any) {
      setCommerceError(err.message || 'Network error.');
    } finally {
      setProductSaving(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim() || categorySaving) return;
    setCategorySaving(true);
    setCommerceError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/categories`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({ category_name: newCategoryInput.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommerceError(json.error || 'Could not add category.');
        return;
      }
      setProdCat(newCategoryInput.trim());
      setNewCategoryInput('');
      await loadTenantWorkspace(selectedBusinessId);
      setStatusBanner(`Category "${json.categories?.slice(-1)[0] || 'New'}" added to store.`);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleRenameCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingCategory || !renamingCategory.newName.trim() || categorySaving) return;
    setCategorySaving(true);
    setCommerceError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/categories`, {
        method: 'PATCH',
        headers: headersWithAuth(),
        body: JSON.stringify({
          old_name: renamingCategory.oldName,
          new_name: renamingCategory.newName.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommerceError(json.error || 'Could not rename category.');
        return;
      }
      setRenamingCategory(null);
      await loadTenantWorkspace(selectedBusinessId);
      setStatusBanner('Category renamed and products updated.');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (categorySaving) return;
    setCategorySaving(true);
    setCommerceError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/categories`, {
        method: 'DELETE',
        headers: headersWithAuth(),
        body: JSON.stringify({
          category_name: categoryName,
          fallback_category: 'General',
        }),
      });
      if (res.ok) {
        if (selectedCategoryFilter === categoryName) setSelectedCategoryFilter('all');
        await loadTenantWorkspace(selectedBusinessId);
        setStatusBanner(`Removed category "${categoryName}" (products moved to General).`);
      }
    } finally {
      setCategorySaving(false);
    }
  };

  const handleBrandQuickAction = async (bizId: string, action: 'pause' | 'resume' | 'delete') => {
    setOpenBrandMenuId(null);
    const res = await fetch(`/api/businesses/${bizId}/quick-action`, {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      await loadAccountAndBusinesses();
      if (bizId === selectedBusinessId && action !== 'delete') {
        await loadTenantWorkspace(bizId);
      }
      setStatusBanner(
        action === 'pause'
          ? 'Business service paused.'
          : action === 'resume'
          ? 'Business service resumed and active.'
          : 'Business removed from platform.'
      );
    } else {
      setStatusBanner(data.error || 'Action could not be completed.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsMessage('');
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: profileNameInput,
        email: profileEmailInput,
        telegram_username: profileTgInput,
        preferred_language: lang,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSettingsError(data.error || 'Failed to update profile.');
      return;
    }
    await loadAccountAndBusinesses();
    setSettingsMessage('Admin / Account profile updated.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsMessage('');
    const res = await fetch('/api/auth/password', {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSettingsError(data.error || 'Could not update password.');
      return;
    }
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setSettingsMessage('Password updated.');
  };

  const handleSaveRecoveryPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsMessage('');
    if (recoveryPasscodeInput.length < 8) {
      setSettingsError('Recovery passcode must be at least 8 characters.');
      return;
    }
    try {
      const res = await fetch('/api/auth/recovery-passcode', {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({
          recovery_passcode: recoveryPasscodeInput,
          recovery_hint: recoveryHintInput,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSettingsError(data.error || 'Could not update recovery passcode.');
        return;
      }
      setRecoveryPasscodeInput('');
      setRecoveryHintInput('');
      await loadAccountAndBusinesses();
      setSettingsMessage('Recovery passcode updated securely.');
    } catch (error: any) {
      setSettingsError(error?.message || 'Could not update recovery passcode.');
    }
  };

  const handleSavePasscode = async (action: 'set' | 'clear') => {
    setSettingsError('');
    setSettingsMessage('');
    const res = await fetch('/api/auth/passcode', {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({ action, passcode: passcodeInput }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSettingsError(data.error || 'Passcode update failed.');
      return;
    }
    setPasscodeInput('');
    await loadAccountAndBusinesses();
    setSettingsMessage(action === 'clear' ? 'Security passcode removed.' : 'Security passcode enabled.');
  };

  const handleUnlockPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    const res = await fetch('/api/auth/passcode', {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({ action: 'verify', passcode: unlockPinInput }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.verified) {
      setIsPasscodeLocked(false);
      setUnlockPinInput('');
    } else {
      setUnlockError(data.error || 'Invalid security passcode.');
    }
  };

  const handleAddCoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsMessage('');
    const res = await fetch('/api/superadmin/admins', {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: coAdminName,
        email: coAdminEmail,
        password: coAdminPassword,
        platform_role: 'super_admin',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSettingsError(data.error || 'Could not add administrator.');
      return;
    }
    setCoAdminName('');
    setCoAdminEmail('');
    setCoAdminPassword('');
    await loadAccountAndBusinesses();
    setSettingsMessage(`Added platform administrator "${data.admin?.name}".`);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceSaving(true);
    setCommerceError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/services`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({
          name: srvName.trim(),
          duration_mins: Number(srvDuration),
          price: Number(srvPrice),
          description: srvDesc,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommerceError(json.error || 'The service could not be created. Please try again.');
        return;
      }
      setSrvName('');
      setSrvPrice('');
      setSrvDesc('');
      await loadTenantWorkspace(selectedBusinessId);
      setStatusBanner('Bookable service added.');
    } catch (err: any) {
      setCommerceError(err.message || 'Network error. The service was not created.');
    } finally {
      setServiceSaving(false);
    }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethodSaving) return;
    setPaymentMethodSaving(true);
    setPaymentMethodError('');
    setOrderManagementError('');
    try {
      const editingId = editingPaymentMethod?.id;
      const res = await fetch(
        editingId
          ? `/api/businesses/${selectedBusinessId}/payment-methods/${editingId}`
          : `/api/businesses/${selectedBusinessId}/payment-methods`,
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: headersWithAuth(),
          body: JSON.stringify({
            method_name: paymentMethodName.trim(),
            account_name: paymentAccountName.trim(),
            account_number: paymentAccountNumber.trim(),
          }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPaymentMethodError(json.error || 'The payment method could not be saved.');
        return;
      }
      setEditingPaymentMethod(null);
      setPaymentMethodName('');
      setPaymentAccountName('');
      setPaymentAccountNumber('');
      await loadTenantWorkspace(selectedBusinessId);
      setStatusBanner(editingId ? 'Payment method updated.' : 'Payment method added to checkout.');
    } catch (err: any) {
      setPaymentMethodError(err.message || 'Network error. Payment details were not saved.');
    } finally {
      setPaymentMethodSaving(false);
    }
  };

  const handleEditPaymentMethod = (method: any) => {
    setEditingPaymentMethod(method);
    setPaymentMethodName(method.method_name || '');
    setPaymentAccountName(method.account_name || '');
    setPaymentAccountNumber(method.account_number || '');
    setPaymentMethodError('');
  };

  const handleTogglePaymentMethod = async (method: any) => {
    setPaymentMethodError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/payment-methods/${method.id}`, {
        method: 'PATCH',
        headers: headersWithAuth(),
        body: JSON.stringify({
          method_name: method.method_name,
          account_name: method.account_name,
          account_number: method.account_number,
          is_active: !Boolean(Number(method.is_active)),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPaymentMethodError(json.error || 'Payment method status could not be changed.');
        return;
      }
      await loadTenantWorkspace(selectedBusinessId);
    } catch (err: any) {
      setPaymentMethodError(err.message || 'Network error. Payment method status was not changed.');
    }
  };

  const handleVerifyPayment = async (
    paymentId: string,
    action: 'verify' | 'fail' | 'refund',
    providerTxId?: string
  ) => {
    if (action === 'verify' && String(providerTxId || '').trim().length < 3) {
      setOrderManagementError('Enter the real transaction reference after confirming the payment was received.');
      return;
    }
    setVerificationSaving(true);
    setOrderManagementError('');
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({ action, provider_tx_id: providerTxId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOrderManagementError(json.error || 'Payment status could not be updated.');
        return;
      }
      setVerificationPaymentId('');
      setVerificationReference('');
      await loadTenantWorkspace(selectedBusinessId);
      setStatusBanner(
        action === 'verify'
          ? 'Payment verified and order marked as paid.'
          : action === 'refund'
          ? 'Payment refund recorded.'
          : 'Payment marked as failed.'
      );
    } catch (err: any) {
      setOrderManagementError(err.message || 'Network error. Payment status was not changed.');
    } finally {
      setVerificationSaving(false);
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

  const showStylizedNotification = useCallback(
    (notif: Omit<StylizedNotificationItem, 'id' | 'has_buttons' | 'buttons'> & {
      id?: string;
      buttons?: StylizedNotificationButton[];
      withButtons?: boolean;
    }) => {
      const rawButtons = Array.isArray(notif.buttons) ? notif.buttons : [];
      const allowButtons =
        notif.withButtons !== undefined
          ? notif.withButtons
          : notifSettings.button_mode !== 'without_buttons';
      const finalButtons = allowButtons ? rawButtons : [];

      const item: StylizedNotificationItem = {
        id: notif.id || 'ntf_local_' + Date.now(),
        type: notif.type || 'telegram',
        tone: notif.tone || 'telegram',
        title: notif.title,
        message: notif.message,
        channel: notif.channel || 'telegram_and_web',
        has_buttons: finalButtons.length > 0,
        buttons: finalButtons,
        is_read: false,
        created_at: notif.created_at || new Date().toISOString(),
      };
      setStatusBanner('');
      setActiveStylizedNotif(item);
    },
    [notifSettings.button_mode]
  );

  // Automatically convert any legacy statusBanner string into a Stylized Notification Card
  useEffect(() => {
    if (!statusBanner) return;
    const text = statusBanner.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const isTelegram = lower.includes('telegram') || lower.includes('@');
    const isError = lower.includes('fail') || lower.includes('error') || lower.includes('could not') || lower.includes('invalid');
    const isPaymentOrOrder = lower.includes('payment') || lower.includes('order') || lower.includes('verified');

    const smartButtons: StylizedNotificationButton[] = [];
    if (notifSettings.button_mode !== 'without_buttons') {
      if (isPaymentOrOrder) {
        smartButtons.push({ label: 'View Orders & Payments', action: 'open_orders', variant: 'primary' });
        smartButtons.push({ label: 'Preview Storefront', action: 'preview_store', variant: 'secondary' });
      } else if (isTelegram && notifSettings.button_mode === 'with_buttons') {
        smartButtons.push({ label: 'Telegram & Web Setup', action: 'open_telegram', variant: 'primary' });
        smartButtons.push({ label: 'Preview Store', action: 'preview_store', variant: 'secondary' });
      }
    }

    setActiveStylizedNotif({
      id: 'ntf_banner_' + Date.now(),
      type: isTelegram ? 'telegram' : isPaymentOrOrder ? 'payment' : 'system',
      tone: isError ? 'error' : isTelegram ? 'telegram' : 'success',
      title: isError
        ? 'Action Required'
        : isTelegram
        ? 'Telegram & Workspace Synced'
        : isPaymentOrOrder
        ? 'Order & Payment Update'
        : 'Workspace Notification',
      message: text,
      channel: isTelegram ? 'telegram_and_web' : 'web_toast',
      has_buttons: smartButtons.length > 0,
      buttons: smartButtons,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    setStatusBanner('');
  }, [statusBanner, notifSettings.button_mode]);

  const handleCopyEndpoint = useCallback(
    (key: string, textToCopy: string, label: string, withButtons = false) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).catch(() => {});
      }
      setCopiedEndpointKey(key);
      setTimeout(() => {
        setCopiedEndpointKey((prev) => (prev === key ? '' : prev));
      }, 2400);
      showStylizedNotification({
        type: 'telegram',
        tone: 'success',
        title: `${label} Copied to Clipboard`,
        message: textToCopy,
        channel: 'web_toast',
        withButtons,
        buttons: withButtons
          ? [{ label: 'Open Store Preview', action: 'preview_store', variant: 'primary' }]
          : [],
      });
    },
    [showStylizedNotification]
  );

  const handleNotificationButtonClick = useCallback(
    (btn: StylizedNotificationButton) => {
      const biz = workspace?.business || businesses[0];
      const botClean = String(biz?.telegram_bot_username || 'TeleBizStoreBot').replace(/^@+/, '');
      const miniAppUrl = `https://t.me/${botClean}/app?startapp=${biz?.slug || 'store'}`;
      const webUrl = `https://${biz?.custom_domain || `telebiz.os/s/${biz?.slug || 'store'}`}`;

      switch (btn.action) {
        case 'preview_store':
          setStorefrontCustomerOnly(false);
          setFullStorefrontOpen(true);
          setNotifCenterOpen(false);
          break;
        case 'open_telegram':
          setActiveModule('telegram');
          setNotifCenterOpen(false);
          break;
        case 'open_orders':
          setActiveModule('orders');
          setNotifCenterOpen(false);
          break;
        case 'open_support':
          setActiveModule('support');
          setNotifCenterOpen(false);
          break;
        case 'open_builder':
          setActiveModule('builder');
          setNotifCenterOpen(false);
          break;
        case 'open_commerce':
          setActiveModule('commerce');
          setNotifCenterOpen(false);
          break;
        case 'copy_miniapp_url':
          handleCopyEndpoint('miniapp', miniAppUrl, 'Telegram Mini App Deep Link', false);
          break;
        case 'copy_web_url':
          handleCopyEndpoint('weburl', webUrl, 'Web Storefront URL', false);
          break;
        case 'dismiss':
        default:
          setActiveStylizedNotif(null);
          break;
      }
    },
    [workspace?.business, businesses, handleCopyEndpoint]
  );

  const handleSaveTelegramIntegration = async (e: React.FormEvent, generateToken = false) => {
    e.preventDefault();
    setTgSetupFieldErrors({});

    const localErrors: Record<string, string> = {};
    const cleanBot = tgBotUsername.trim().replace(/^@+/, '');
    const cleanChan = tgChannelUsername.trim().replace(/^@+/, '');
    const cleanDom = customDomainInput
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');

    if (!cleanBot) {
      localErrors.bot_username = 'Telegram Bot Username (@YourBusinessBot) is required to connect your Mini App.';
    } else if (!/^[a-zA-Z0-9_]{3,32}$/.test(cleanBot)) {
      localErrors.bot_username = 'Bot Username must be 3–32 characters using only letters, numbers, or underscores.';
    }

    if (cleanChan && !/^[a-zA-Z0-9_]{3,32}$/.test(cleanChan)) {
      localErrors.channel_username = 'Optional Channel Username must be 3–32 characters (letters, numbers, underscores) or left blank.';
    }

    if (cleanDom && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleanDom)) {
      localErrors.custom_domain = 'Custom Web Domain must be a valid domain (e.g. shop.yourbrand.com) or left empty for default.';
    }

    if (tgTokenInput.trim() && tgTokenInput.trim().length < 8) {
      localErrors.bot_token = 'BotFather API Token must be at least 8 characters (or leave blank to keep current encrypted token).';
    }

    if (Object.keys(localErrors).length > 0) {
      setTgSetupFieldErrors(localErrors);
      showStylizedNotification({
        type: 'telegram',
        tone: 'error',
        title: `Please Fix ${Object.keys(localErrors).length} Setup Field(s)`,
        message: Object.values(localErrors).join(' '),
        channel: 'web_toast',
        withButtons: false,
      });
      return;
    }

    setTgSetupSaving(true);
    try {
      const includeButtons = notifSettings.button_mode !== 'without_buttons';
      const res = await fetch(`/api/businesses/${selectedBusinessId}/telegram`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({
          bot_token: tgTokenInput.trim() || undefined,
          bot_username: `@${cleanBot}`,
          channel_username: cleanChan ? `@${cleanChan}` : '',
          custom_domain: cleanDom,
          webhook_active: tgWebhookActive,
          mini_app_published: tgMiniAppPublished,
          notification_settings: notifSettings,
          generate_handshake_token: generateToken,
          include_buttons_in_notification: includeButtons,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fieldErrors) setTgSetupFieldErrors(data.fieldErrors);
        showStylizedNotification({
          type: 'telegram',
          tone: 'error',
          title: 'Telegram & Web Setup Could Not Be Saved',
          message: data.error || 'Please check your Bot Username and Domain settings.',
          withButtons: false,
        });
        return;
      }

      setTgTokenInput('');
      setTgBotUsername(data.telegram_bot_username || `@${cleanBot}`);
      setTgChannelUsername(data.telegram_channel_username || '');
      setCustomDomainInput(data.custom_domain || '');
      await loadTenantWorkspace(selectedBusinessId);

      if (data.notification) {
        setActiveStylizedNotif(data.notification);
      } else {
        showStylizedNotification({
          type: 'telegram',
          tone: 'telegram',
          title: `Telegram Bot (@${cleanBot}) & Web Store Connected`,
          message: `Mini App Deep Link, Webhook Sync, and Web Storefront (${cleanDom || `telebiz.os/s/${workspace?.business?.slug}`}) saved and active.`,
          withButtons: includeButtons,
          buttons: [
            { label: 'Preview Storefront', action: 'preview_store', variant: 'primary' },
            { label: 'Copy Mini App Link', action: 'copy_miniapp_url', variant: 'secondary' },
          ],
        });
      }
    } catch (err: any) {
      showStylizedNotification({
        type: 'telegram',
        tone: 'error',
        title: 'Network Error',
        message: err.message || 'Could not reach the server to save Telegram & Web configuration.',
        withButtons: false,
      });
    } finally {
      setTgSetupSaving(false);
    }
  };

  const handleTestTelegramConnection = async (withButtonsOverride?: boolean) => {
    setTgTestingConnection(true);
    setTgSetupFieldErrors({});
    try {
      const useButtons =
        withButtonsOverride !== undefined
          ? withButtonsOverride
          : notifSettings.button_mode !== 'without_buttons';
      const res = await fetch(`/api/businesses/${selectedBusinessId}/telegram/test-connection`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({
          bot_username: tgBotUsername,
          channel_username: tgChannelUsername,
          custom_domain: customDomainInput,
          with_buttons: useButtons,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showStylizedNotification({
          type: 'telegram',
          tone: 'error',
          title: 'Connection Handshake Failed',
          message: data.error || 'Could not verify Telegram Bot & Web Storefront connection.',
          withButtons: false,
        });
        return;
      }
      setTgDiagnosticsResult(data.diagnostics);
      setTgWebhookActive(true);
      setTgMiniAppPublished(true);
      if (data.business?.telegram_bot_username) setTgBotUsername(data.business.telegram_bot_username);
      await loadTenantWorkspace(selectedBusinessId);
      if (data.notification) {
        setActiveStylizedNotif(data.notification);
      }
    } catch (err: any) {
      showStylizedNotification({
        type: 'telegram',
        tone: 'error',
        title: 'Connection Test Error',
        message: err.message || 'Network error while testing connection.',
        withButtons: false,
      });
    } finally {
      setTgTestingConnection(false);
    }
  };

  const handleSendStylizedNotification = async (options: {
    withButtons: boolean;
    preset?: {
      type: 'order' | 'payment' | 'telegram' | 'web' | 'booking' | 'support' | 'system';
      tone: 'telegram' | 'success' | 'info' | 'warning' | 'error';
      title: string;
      message: string;
      buttons?: StylizedNotificationButton[];
    };
  }) => {
    setSendingTestNotif(true);
    const biz = workspace?.business || businesses[0];
    const resolvedTitle =
      options.preset?.title ||
      customNotifTitle.trim() ||
      (options.withButtons
        ? `${biz?.name || 'Store'} — Actionable Telegram & Web Alert`
        : `${biz?.name || 'Store'} — Clean Status Update (No Buttons)`);
    const resolvedMessage =
      options.preset?.message ||
      customNotifMessage.trim() ||
      (options.withButtons
        ? `Bot ${biz?.telegram_bot_username || '@StoreBot'} and Web Storefront are synced. Use the quick buttons below to preview your storefront or inspect orders.`
        : `All Telegram Mini App webhooks, SSL routes, and customer attribution engines are operating smoothly.`);
    const resolvedTone = options.preset?.tone || customNotifTone;
    const resolvedType = options.preset?.type || 'telegram';
    const resolvedButtons: StylizedNotificationButton[] = options.withButtons
      ? options.preset?.buttons || [
          { label: 'Preview Storefront', action: 'preview_store', variant: 'primary' },
          { label: 'View Orders & Payments', action: 'open_orders', variant: 'emerald' },
          { label: 'Copy Mini App Link', action: 'copy_miniapp_url', variant: 'secondary' },
        ]
      : [];

    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/notifications/send`, {
        method: 'POST',
        headers: headersWithAuth(),
        body: JSON.stringify({
          type: resolvedType,
          tone: resolvedTone,
          title: resolvedTitle,
          message: resolvedMessage,
          channel: 'telegram_and_web',
          with_buttons: options.withButtons,
          buttons: resolvedButtons,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.notification) {
        setActiveStylizedNotif(data.notification);
        setWorkspace((prev: any) => (prev ? { ...prev, notifications: data.notifications || prev.notifications } : prev));
      } else {
        showStylizedNotification({
          type: resolvedType,
          tone: resolvedTone,
          title: resolvedTitle,
          message: resolvedMessage,
          withButtons: options.withButtons,
          buttons: resolvedButtons,
        });
      }
    } catch {
      showStylizedNotification({
        type: resolvedType,
        tone: resolvedTone,
        title: resolvedTitle,
        message: resolvedMessage,
        withButtons: options.withButtons,
        buttons: resolvedButtons,
      });
    } finally {
      setSendingTestNotif(false);
    }
  };

  const handleMarkNotificationsRead = async (notificationId?: string, clearAll = false) => {
    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}/notifications/read`, {
        method: 'PATCH',
        headers: headersWithAuth(),
        body: JSON.stringify({
          notification_id: notificationId,
          action: clearAll ? 'clear_all' : 'mark_read',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.notifications) {
        setWorkspace((prev: any) => (prev ? { ...prev, notifications: data.notifications } : prev));
      }
      if (clearAll) {
        setActiveStylizedNotif(null);
      }
    } catch {
      // ignore
    }
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
  const commerceProducts: any[] = workspace?.products || [];
  const commerceServices: any[] = workspace?.services || [];
  const storeCategories: string[] = React.useMemo(() => {
    let customCats: string[] = [];
    try {
      customCats = JSON.parse(workspace?.business?.categories_json || '[]');
    } catch {
      customCats = [];
    }
    const productCats = commerceProducts.map((p: any) => p.category_name).filter(Boolean);
    return Array.from(new Set([...customCats, ...productCats, 'Signature Offerings']));
  }, [workspace?.business?.categories_json, commerceProducts]);
  const sortedBusinessesBySales = React.useMemo(() => {
    return [...businesses].sort((a, b) => Number(b.verifiedRevenue || 0) - Number(a.verifiedRevenue || 0));
  }, [businesses]);
  const lowStockCount = commerceProducts.filter((p: any) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
  const outOfStockCount = commerceProducts.filter((p: any) => Number(p.stock) <= 0).length;
  const visibleCommerceProducts = commerceProducts.filter((p: any) => {
    const query = productSearch.trim().toLowerCase();
    const matchesSearch = !query || [p.name, p.sku, p.category_name].some((value) => String(value || '').toLowerCase().includes(query));
    const isHidden = !Boolean(Number(p.available));
    const stock = Number(p.stock || 0);
    const matchesStock =
      productStockFilter === 'all' ||
      (productStockFilter === 'low' && stock > 0 && stock <= 5) ||
      (productStockFilter === 'out' && stock <= 0) ||
      (productStockFilter === 'hidden' && isHidden);
    const matchesCat = selectedCategoryFilter === 'all' || p.category_name === selectedCategoryFilter;
    return matchesSearch && matchesStock && matchesCat;
  });
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
    more: { title: 'More & My Business List', description: 'Manage all your businesses, create new stores, preview storefronts, and configure language & platform tools in one clean place.' },
  };

  return (
    <div className={`telebiz-app font-preset-${workspaceFont} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
      {!fullStorefrontOpen && (
        <header className="telebiz-topbar sticky top-0 z-40 flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              navigateToModule('overview');
            }}
            className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:gap-3"
            aria-label="TeleBiz workspace home"
          >
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm sm:text-base font-extrabold tracking-tight text-slate-950 dark:text-white">
                {t.platformTitle}
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400 sm:block">
                Multi-Store Commerce &amp; Storefront Platform
              </span>
            </span>
          </a>

          {currentUser ? (
            <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
              <button
                type="button"
                onClick={() => navigateToModule('more')}
                className="flex max-w-md items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs text-slate-600 shadow-sm hover:border-indigo-300 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                title="Click to switch business or open My Business List in More"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="font-bold text-slate-900 dark:text-white">{activeBusiness?.name || 'Select a business'}</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">My Business List →</span>
              </button>
            </div>
          ) : (
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex text-xs font-bold text-slate-600 dark:text-slate-300">
              <a href="#telebiz-showcase" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Digital Storefronts
              </a>
              <a href="#telebiz-services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Platform Features
              </a>
              <a href="#telebiz-team" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                WearnMoney Team &amp; Reviews
              </a>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {currentUser ? (
              <>
                <span className="hidden text-right md:block">
                  <span className="block max-w-40 truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {currentUser.owner_uid || 'OWN-ID'} · {currentUser.platform_role === 'super_admin' ? 'Super Admin' : 'Store Owner'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 dark:text-slate-300"
                  title="Sign out of current account"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('telegram');
                    setTgSubMode('signup');
                    setAuthError('');
                    setAuthFieldErrors({});
                    setAuthSuccessMsg('');
                    setAuthModalOpen(true);
                  }}
                  className="btn-3d-white hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 dark:text-slate-100"
                  title="Create a new Store Owner account with Telegram or Google"
                >
                  <UserPlus className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthFieldErrors({});
                    setAuthSuccessMsg('');
                    setAuthModalOpen(true);
                  }}
                  className="btn-3d-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold text-white shadow-sm"
                  title="Sign In with Google, Telegram, or Email"
                >
                  <KeyRound className="h-3.5 w-3.5 shrink-0 text-white" />
                  <span>Sign In</span>
                </button>
              </>
            )}
            {currentUser && (
              <button
                type="button"
                onClick={() => setNotifCenterOpen((prev) => !prev)}
                className="btn-3d-white relative inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
                aria-label="Open Stylized Notifications Center"
                title="Stylized Notifications & Telegram Alerts"
              >
                <Bell className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="hidden xl:inline">Alerts</span>
                {Array.isArray(workspace?.notifications) &&
                  workspace.notifications.filter((n: any) => !n.is_read).length > 0 && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white shadow-xs">
                      {workspace.notifications.filter((n: any) => !n.is_read).length}
                    </span>
                  )}
              </button>
            )}
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  navigateToModule('more');
                }}
                className={
                  activeModule === 'more'
                    ? 'btn-3d-primary inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-xs font-bold text-white'
                    : 'btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-xs font-bold text-slate-800'
                }
                aria-label="Open More and My Business List"
                title="More & My Business List"
              >
                <MoreHorizontal className="h-4 w-4 text-indigo-600" />
                <span className="hidden sm:inline">More</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setMenuDrawerOpen(true)}
              className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-xs font-bold"
              aria-label="Open Menu and Settings"
              title="Settings & Account"
            >
              <Settings className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </header>
      )}

      {/* Platform Admin Notification Badge (Strictly shown ONLY to authenticated Platform Super Admin) */}
      {!fullStorefrontOpen && currentUser?.platform_role === 'super_admin' && (
        <div className="border-b border-indigo-900/40 bg-slate-900 text-white px-4 py-2 sm:px-6 lg:px-8 shadow-xs">
          <div className="mx-auto max-w-[1480px] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                Platform Administrator
              </span>
              <span className="text-slate-300">
                Logged in as <strong>{currentUser.email}</strong> — Full multi-store &amp; cross-category management active ({businesses.length} total stores).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModule('superadmin')}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
              >
                Super Admin Console →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stylized Notification Card (Supports both interactive action buttons AND clean buttonless notifications) */}
      {activeStylizedNotif && (
        <div className="mx-4 my-3 sm:mx-6 lg:mx-8">
          <div
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg transition-all ${
              activeStylizedNotif.tone === 'error'
                ? 'border-rose-300/90 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white dark:border-rose-800'
                : activeStylizedNotif.tone === 'warning'
                ? 'border-amber-300/90 bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-white dark:border-amber-800'
                : activeStylizedNotif.tone === 'success'
                ? 'border-emerald-300/90 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white dark:border-emerald-800'
                : 'border-sky-300/90 bg-gradient-to-r from-slate-950 via-indigo-950 to-sky-950 text-white dark:border-sky-800'
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-inner ${
                    activeStylizedNotif.tone === 'error'
                      ? 'border-rose-400/40 bg-rose-500/20 text-rose-200'
                      : activeStylizedNotif.tone === 'warning'
                      ? 'border-amber-400/40 bg-amber-500/20 text-amber-200'
                      : activeStylizedNotif.tone === 'success'
                      ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                      : 'border-sky-400/40 bg-sky-500/20 text-sky-200'
                  }`}
                >
                  {activeStylizedNotif.tone === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : activeStylizedNotif.tone === 'success' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : activeStylizedNotif.type === 'telegram' ? (
                    <Send className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-200 border border-white/15">
                      {activeStylizedNotif.channel === 'telegram_and_web'
                        ? 'Telegram Bot + Web Alert'
                        : activeStylizedNotif.channel === 'telegram_bot'
                        ? 'Telegram Bot Push'
                        : 'Live Workspace Alert'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {activeStylizedNotif.has_buttons &&
                      Array.isArray(activeStylizedNotif.buttons) &&
                      activeStylizedNotif.buttons.length > 0
                        ? `Interactive · ${activeStylizedNotif.buttons.length} Action Button${activeStylizedNotif.buttons.length > 1 ? 's' : ''}`
                        : 'Clean Notice · No Action Buttons Needed'}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-extrabold tracking-tight text-white">
                    {activeStylizedNotif.title}
                  </h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-200">
                    {activeStylizedNotif.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                {activeStylizedNotif.has_buttons &&
                  Array.isArray(activeStylizedNotif.buttons) &&
                  activeStylizedNotif.buttons.length > 0 &&
                  activeStylizedNotif.buttons.map((btn, idx) => (
                    <button
                      key={`${btn.action}-${idx}`}
                      type="button"
                      onClick={() => handleNotificationButtonClick(btn)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition shadow-sm ${
                        btn.variant === 'primary'
                          ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                          : btn.variant === 'emerald'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : btn.variant === 'amber'
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      <span>{btn.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => setActiveStylizedNotif(null)}
                  className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold text-slate-200 border border-white/10 transition"
                  title="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stylized Notification Center Drawer / Popover */}
      {notifCenterOpen && (
        <div className="mx-4 mb-3 sm:mx-6 lg:mx-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Stylized Notification Center ({workspace?.notifications?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Supports both interactive button notifications and clean button-free updates across Telegram &amp; Web.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModule('telegram');
                    setNotifCenterOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800"
                >
                  Configure &amp; Test in Telegram Setup →
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkNotificationsRead(undefined, false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Mark All Read
                </button>
                <button
                  type="button"
                  onClick={() => setNotifCenterOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!workspace?.notifications || workspace.notifications.length === 0 ? (
              <div className="py-6 text-center text-slate-500">
                No notifications recorded yet for this store. Use Telegram &amp; Web Setup to test stylized notifications.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {workspace.notifications.slice(0, 10).map((n: StylizedNotificationItem) => (
                  <div
                    key={n.id}
                    className={`rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition ${
                      n.is_read
                        ? 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
                        : 'border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/30 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {n.type} · {n.has_buttons && n.buttons?.length ? 'With Buttons' : 'No Buttons'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {String(n.created_at || '').slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{n.title}</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                    {n.has_buttons && Array.isArray(n.buttons) && n.buttons.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        {n.buttons.map((btn, i) => (
                          <button
                            key={`${n.id}-btn-${i}`}
                            type="button"
                            onClick={() => handleNotificationButtonClick(btn)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-[11px] font-bold"
                          >
                            <span>{btn.label}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Storefront Customer View Mode (Customer-only when storefrontCustomerOnly=true, or with Quick Edit Bar for Owner/Admin) */}
      {fullStorefrontOpen && activeBusiness ? (
        <div className="flex-1 px-4 py-4 sm:px-6 space-y-3">
          {storefrontCustomerOnly && (
            <div className="mx-auto max-w-5xl rounded-2xl bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-[10px] uppercase">
                  Role 3 · Customer View
                </span>
                <span>
                  Viewing <strong>{activeBusiness.name}</strong> strictly as a Customer. Admin & Store Owner dashboards and edit buttons are hidden.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStorefrontCustomerOnly(false);
                  setFullStorefrontOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-slate-950 font-extrabold text-xs"
              >
                Exit Customer View
              </button>
            </div>
          )}
          <MiniAppStorefront
            slug={activeBusiness.slug}
            mode="full_storefront"
            canQuickEdit={!storefrontCustomerOnly}
            authToken={authToken}
            onOrderCreated={() => {
              loadTenantWorkspace(selectedBusinessId);
              loadAccountAndBusinesses();
            }}
            onClose={() => {
              setStorefrontCustomerOnly(false);
              setFullStorefrontOpen(false);
            }}
            onOpenBuilder={() => {
              setStorefrontCustomerOnly(false);
              setFullStorefrontOpen(false);
              setActiveModule('builder');
            }}
            onOpenCatalog={() => {
              setStorefrontCustomerOnly(false);
              setFullStorefrontOpen(false);
              setActiveModule('commerce');
            }}
          />
        </div>
      ) : (
        /* Main Operating Platform Layout: Sidebar (248px when authenticated) + Main Content Viewport */
        <div className="telebiz-workspace flex-1 flex min-h-0">
          {/* Desktop business navigation (only visible when signed in) */}
          {currentUser && (
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
                    { id: 'more', label: 'More & My Businesses', icon: MoreHorizontal },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateToModule(item.id as ActiveModule)}
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
                      onClick={() => navigateToModule('superadmin')}
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
          )}

          {/* Main Workspace Content Area */}
          <main className="telebiz-owner-main mx-auto w-full max-w-[1480px] flex-1 space-y-6 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
            {/* SWEET & BEAUTIFUL MEDIUM-LENGTH LANDING PAGE FOR VISITORS BEFORE SIGN IN */}
            {!currentUser ? (
              <div className="mx-auto max-w-6xl space-y-10 py-2 sm:py-4">
                {/* SECTION 1: HERO BANNER WITH BACKGROUND PHOTOGRAPHY, DIGITAL STORE TRANSFORMATION & VISUAL CATEGORY SHOWCASE */}
                <section className="card-3d relative overflow-hidden rounded-3xl border border-indigo-300/40 dark:border-indigo-800/60 bg-slate-950 text-white p-6 sm:p-10 shadow-2xl">
                  {/* Layered Brand Background Photography + Rich Scrim Overlay */}
                  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1800&q=85"
                      alt="Visual Digital Storefront Background"
                      className="h-full w-full object-cover object-center opacity-35 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-indigo-950/75" />
                    <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
                  </div>

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>Turn Your Store Into Digital · Ready Templates &amp; Custom Storefronts</span>
                      </div>

                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-xs">
                        Build a Sweet, Beautiful Storefront Inside Telegram &amp; the Web.
                      </h1>

                      <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                        Have a physical shop or a brand story? Turn your store into a visual digital storefront in minutes using <strong>ready-made templates</strong> or a <strong>custom layout</strong>. Connect your Telegram for <strong>immediate notifications</strong> while customers browse, pay with any payment method you add, and leave <strong>1-to-5 star reviews</strong> right inside your Telegram Mini App.
                      </p>

                      {/* Primary Sign In & Account Creation Actions */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setAuthError('');
                            setAuthFieldErrors({});
                            setAuthSuccessMsg('');
                            setAuthModalOpen(true);
                          }}
                          className="btn-3d-primary inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-extrabold text-white shadow-lg"
                        >
                          <KeyRound className="h-4 w-4" />
                          <span>Sign In</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('telegram');
                            setTgSubMode('signup');
                            setAuthError('');
                            setAuthFieldErrors({});
                            setAuthSuccessMsg('');
                            setAuthModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 px-5 py-3.5 text-xs sm:text-sm font-extrabold shadow-md transition"
                        >
                          <Send className="h-4 w-4 text-sky-600" />
                          <span>Create Account with Telegram</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setGoogleSubMode('signup');
                            setAuthError('');
                            setAuthFieldErrors({});
                            setGooglePromptOpen(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white px-4 py-3.5 text-xs font-extrabold backdrop-blur-md transition"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Continue with Google</span>
                        </button>
                      </div>

                      {/* Concise Visual Highlights */}
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
                        <div>
                          <div className="font-display font-extrabold text-base sm:text-lg text-amber-300">Turn Digital</div>
                          <div className="text-[11px] text-slate-300">Ready Templates &amp; Custom Design</div>
                        </div>
                        <div>
                          <div className="font-display font-extrabold text-base sm:text-lg text-emerald-300">1–5 ★ Reviews</div>
                          <div className="text-[11px] text-slate-300">Built-In Buyer Ratings on Every Store</div>
                        </div>
                        <div>
                          <div className="font-display font-extrabold text-base sm:text-lg text-sky-300">Any Payment</div>
                          <div className="text-[11px] text-slate-300">Add Any Payment Option You Want</div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Storefront Showcase: Perfumes & Cosmetics, Sneakers, Luxury Chains & Jewelry, Boutique & Gaming */}
                    <div id="telebiz-showcase" className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                      <div className="space-y-3.5">
                        <div className="group relative overflow-hidden rounded-2xl border border-white/20 shadow-lg aspect-[4/5] bg-slate-900">
                          <img
                            src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85"
                            alt="Perfumes, Fragrances & Cosmetics Digital Storefront"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent p-3.5 flex flex-col justify-end text-white">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-pink-300">Perfumes &amp; Cosmetics</span>
                            <div className="font-display font-bold text-xs">Fragrances, Skincare &amp; Beauty</div>
                          </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl border border-white/20 shadow-lg aspect-[4/3] bg-slate-900">
                          <img
                            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85"
                            alt="Sneakers & Footwear Storefront"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent p-3.5 flex flex-col justify-end text-white">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300">Sneakers &amp; Footwear</span>
                            <div className="font-display font-bold text-xs">Shoes &amp; Limited Kicks</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-4">
                        <div className="group relative overflow-hidden rounded-2xl border border-white/20 shadow-lg aspect-[4/3] bg-slate-900">
                          <img
                            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85"
                            alt="Luxury Gold Chains, Necklaces & Fine Jewelry"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent p-3.5 flex flex-col justify-end text-white">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300">Fine Jewelry</span>
                            <div className="font-display font-bold text-xs">Luxury Chains &amp; Necklaces</div>
                          </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl border border-white/20 shadow-lg aspect-[4/5] bg-slate-900">
                          <img
                            src="/assets/aistudio/1790661016207_90078a84.jpg"
                            alt="Boutique Clothes, Heritage Fashion & Gaming"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent p-3.5 flex flex-col justify-end text-white">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300">Fashion, Gaming &amp; More</span>
                            <div className="font-display font-bold text-xs">Boutique Clothes &amp; Any Product</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: PLATFORM CAPABILITIES (SIMPLE, VISUAL & NON-REPETITIVE) */}
                <section id="telebiz-services" className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        Your Visual Digital Store
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950 dark:text-white mt-0.5">
                        Turn Your Story Into a Digital Storefront in Minutes
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthFieldErrors({});
                        setAuthModalOpen(true);
                      }}
                      className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open your workspace</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        tag: '01 · Digital Store',
                        title: 'Turn Your Store Into Digital',
                        desc: 'Pick a ready-made template or customize every color, banner, and layout for perfumes, cosmetics, sneakers, jewelry, clothes, or gaming.',
                        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
                      },
                      {
                        tag: '02 · Telegram Mini App',
                        title: 'Immediate Telegram Notifications',
                        desc: 'Connect your Telegram in one step so shoppers browse and buy inside your Mini App while you receive immediate order alerts.',
                        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
                      },
                      {
                        tag: '03 · 1–5 Star Reviews',
                        title: 'Catalog, Bookings & 1–5 ★ Reviews',
                        desc: 'Showcase multi-photo galleries, sizes, scents, and bookings — plus collect 1-to-5 star customer reviews directly on your store page.',
                        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
                      },
                      {
                        tag: '04 · Flexible Checkout',
                        title: 'Add Any Payment Method You Want',
                        desc: 'Configure any payment method you prefer so customers can pay smoothly and submit transfer references without friction.',
                        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
                      },
                    ].map((srv, idx) => (
                      <div
                        key={idx}
                        className="card-3d group overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                      >
                        <div>
                          <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                            <img
                              src={srv.image}
                              alt={srv.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white">
                              {srv.tag}
                            </div>
                          </div>
                          <div className="p-4 space-y-1.5">
                            <h3 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                              {srv.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {srv.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* SECTION 3: WEARNMOMEY FOUNDING TEAM & STORE OWNER REVIEWS */}
                <section
                  id="telebiz-team"
                  className="card-3d rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        Founding Vision &amp; Store Reviews
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950 dark:text-white">
                        Crafted by the WearnMoney Founding Team · Loved by Store Owners
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                        From perfumes &amp; cosmetics to sneakers, luxury chains, boutique fashion, and gaming — every store owner gets a visual digital storefront with built-in 1-to-5 star buyer reviews.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3.5 py-2 text-xs font-extrabold text-amber-800 dark:text-amber-300">
                      <span>★★★★★ 4.9 / 5 Store Rating</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        badge: 'Founding Team',
                        name: 'WearnMoney Founding Team',
                        role: 'Platform Vision & Digital Storefronts',
                        bio: 'Dedicated to turning every physical shop and brand story into a visual digital store with ready templates, immediate Telegram notifications, and 1-to-5 star customer reviews.',
                        photo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
                        isFounder: true,
                      },
                      {
                        badge: '★★★★★ 5.0 Store Review',
                        name: 'Elena R. · Perfumes & Cosmetics',
                        role: 'Fragrances, Skincare & Beauty',
                        bio: '“Turning our perfume and cosmetics collection into a digital store took minutes. Customers love leaving 5-star reviews right after ordering in our Telegram Mini App!”',
                        photo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
                        isFounder: false,
                      },
                      {
                        badge: '★★★★★ 5.0 Store Review',
                        name: 'Marcus V. · Fine Jewelry Studio',
                        role: 'Luxury Chains & Gold Necklaces',
                        bio: '“Our luxury necklace and gold chain storefront looks incredible. Shoppers browse our ready template, pay with our preferred method, and we get immediate Telegram alerts.”',
                        photo: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                        isFounder: false,
                      },
                      {
                        badge: '★★★★★ 5.0 Store Review',
                        name: 'Sami K. · Sneakers, Fashion & Gaming',
                        role: 'Limited Kicks, Boutique Clothes & Gear',
                        bio: '“Whether we drop sneakers, boutique clothes, or gaming accessories, customizing our digital store is effortless and the 1-to-5 star customer reviews build instant trust.”',
                        photo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
                        isFounder: false,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl border overflow-hidden flex flex-col transition ${
                          item.isFounder
                            ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
                        }`}
                      >
                        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                          <div
                            className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-xs ${
                              item.isFounder
                                ? 'bg-indigo-600 text-white'
                                : 'bg-amber-400 text-slate-950'
                            }`}
                          >
                            {item.badge}
                          </div>
                        </div>
                        <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                              {item.role}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                              {item.bio}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Call-to-Action Bar */}
                  <div className="rounded-2xl bg-slate-950 text-white p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                        Ready to Open Your Storefront?
                      </div>
                      <h3 className="text-lg sm:text-xl font-display font-extrabold">
                        Turn Your Store Into Digital Today
                      </h3>
                      <p className="text-xs text-slate-300">
                        Sign in or create your Store Owner account with Telegram or Google — you stay logged in until you sign out.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setAuthError('');
                          setAuthFieldErrors({});
                          setAuthModalOpen(true);
                        }}
                        className="btn-3d-primary px-5 py-3 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-2"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Sign In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('telegram');
                          setTgSubMode('signup');
                          setAuthError('');
                          setAuthFieldErrors({});
                          setAuthModalOpen(true);
                        }}
                        className="btn-3d-emerald px-4 py-3 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Create Account</span>
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <>
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
                      onClick={() => navigateToModule('subscriptions')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold shrink-0"
                    >
                      Renew Subscription
                    </button>
                  </div>
                )}

                {activeModule !== 'overview' && (
                  <section className="telebiz-page-intro flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                        Business workspace
                      </p>
                      <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                        {moduleMeta[activeModule].title}
                      </h1>
                      <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {moduleMeta[activeModule].description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      {activeBusiness && (
                        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 md:flex">
                          <Building2 className="h-4 w-4 text-indigo-500" />
                          <span>{activeBusiness.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleBackFromPage}
                        className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-rose-600 dark:text-slate-200"
                        title={`Close ${moduleMeta[activeModule].title} and go back`}
                        aria-label={`Close ${moduleMeta[activeModule].title} and go back`}
                      >
                        <X className="h-4 w-4 text-rose-600" />
                        <span>Close</span>
                      </button>
                    </div>
                  </section>
                )}

                {/* MODULE 1: EXECUTIVE OVERVIEW DASHBOARD */}
                {activeModule === 'overview' && (!analyticsData || !workspace) && (
                  <section className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-3 border-l-4 border-l-emerald-500">
                    <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Store Owner Dashboard · Loading Workspace
                    </div>
                    <h2 className="text-lg font-display font-extrabold text-slate-950 dark:text-white">
                      Welcome, {currentUser?.name} ({currentUser?.owner_uid || 'Store Owner'})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Opening your store dashboard and live storefront metrics...
                    </p>
                  </section>
                )}

                {activeModule === 'overview' && analyticsData && workspace && (
              <div className="space-y-6">
                {/* 1. Role-Aware Store Header: Admin sees Cross-Business Leaderboard; Store Owner sees Strictly Isolated Own-Store Hub */}
                {currentUser?.platform_role === 'super_admin' ? (
                  <section className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          Platform Admin · Cross-Business Sales Performance
                        </div>
                        <h2 className="mt-1 text-lg font-display font-extrabold text-slate-950 dark:text-white">
                          Which Business Is Doing More Sales ({businesses.length} Total Stores)
                        </h2>
                        <p className="text-xs text-slate-500">
                          As Platform Admin, you can inspect every business on the platform, filter by category, preview their store, or open the Super Admin Console.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModule('superadmin')}
                          className="btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Super Admin Console
                        </button>
                        <button
                          type="button"
                          onClick={handleExportCsvReport}
                          className="btn-3d-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t.exportReport}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModule('more')}
                          className="btn-3d-white px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          Businesses by Category
                        </button>
                      </div>
                    </div>

                    {/* Ranked Business Sales Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {sortedBusinessesBySales.map((biz: any, idx: number) => {
                        const isSelected = biz.id === selectedBusinessId;
                        const topRevenue = Math.max(1, Number(sortedBusinessesBySales[0]?.verifiedRevenue || 1));
                        const sharePct = Math.min(100, Math.round((Number(biz.verifiedRevenue || 0) / topRevenue) * 100));
                        return (
                          <button
                            key={biz.id}
                            type="button"
                            onClick={() => setSelectedBusinessId(biz.id)}
                            className={`text-left rounded-2xl p-4 transition-all border ${
                              isSelected
                                ? 'border-indigo-500 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 dark:from-indigo-950/50 dark:via-slate-900 dark:to-slate-900 shadow-lg ring-2 ring-indigo-500/20 -translate-y-0.5'
                                : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-white hover:border-slate-300 shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0"
                                  style={{ backgroundColor: biz.primary_color || '#4f46e5' }}
                                >
                                  #{idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white truncate">
                                    {biz.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 capitalize truncate">
                                    {biz.category} · {biz.productsCount || 0} products · Owner: {biz.owner_name || 'Assigned'}
                                  </div>
                                </div>
                              </div>
                              {idx === 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold shrink-0">
                                  Top Seller
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex items-baseline justify-between">
                              <div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Verified Sales</div>
                                <div className="text-base font-display font-extrabold text-slate-950 dark:text-white tabular-nums">
                                  {Number(biz.verifiedRevenue || 0).toLocaleString()} ETB
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Order Breakdown</div>
                                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                  {biz.finishedOrdersCount || 0} finished · {biz.pendingPaymentRequestsCount || 0} pay req · {biz.rejectedOrdersCount || 0} rejected
                                </div>
                              </div>
                            </div>

                            <div className="mt-2.5 w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.max(8, sharePct)}%`,
                                  backgroundColor: biz.primary_color || '#4f46e5',
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <section className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-5 space-y-4 border-l-4 border-l-emerald-500">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Store Owner Workspace · Strict Multi-Tenant Isolation Active
                        </div>
                        <h2 className="mt-1 text-lg font-display font-extrabold text-slate-950 dark:text-white">
                          Welcome, {currentUser?.name} ({currentUser?.owner_uid}) — {activeBusiness.name}
                        </h2>
                        <p className="text-xs text-slate-500">
                          You only see your own store ({businesses.map((b: any) => b.name).join(', ')}). Other store owners&apos; businesses, catalogs, and sales are completely hidden from your account.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleExportCsvReport}
                          className="btn-3d-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export My Sales Report
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStorefrontCustomerOnly(false);
                            setFullStorefrontOpen(true);
                          }}
                          className="btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview My Storefront
                        </button>
                      </div>
                    </div>

                    {/* Store Owner Dedicated Breakdown: Payment Requests, Finished Orders, Rejected Orders, Messages, Categories */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOrderStatusFilter('payment_requests');
                          setActiveModule('orders');
                        }}
                        className="text-left p-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 transition dark:border-amber-900/50 dark:bg-amber-950/30"
                      >
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                          Payment Requests
                        </div>
                        <div className="mt-1 text-2xl font-display font-extrabold text-amber-950 dark:text-white tabular-nums">
                          {workspace.orders.filter((o: any) => o.payment_status === 'pending_verification').length}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          Awaiting receipt verification →
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOrderStatusFilter('finished');
                          setActiveModule('orders');
                        }}
                        className="text-left p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition dark:border-emerald-900/50 dark:bg-emerald-950/30"
                      >
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Finished Orders
                        </div>
                        <div className="mt-1 text-2xl font-display font-extrabold text-emerald-950 dark:text-white tabular-nums">
                          {workspace.orders.filter((o: any) => o.status === 'completed').length}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          Completed & delivered →
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOrderStatusFilter('rejected');
                          setActiveModule('orders');
                        }}
                        className="text-left p-3.5 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 transition dark:border-rose-900/50 dark:bg-rose-950/30"
                      >
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                          Rejected / Cancelled
                        </div>
                        <div className="mt-1 text-2xl font-display font-extrabold text-rose-950 dark:text-white tabular-nums">
                          {workspace.orders.filter((o: any) => o.status === 'cancelled' || o.status === 'refunded' || o.payment_status === 'failed').length}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                          Rejected or refunded orders →
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModule('support')}
                        className="text-left p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition dark:border-indigo-900/50 dark:bg-indigo-950/30"
                      >
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                          Customer Messages
                        </div>
                        <div className="mt-1 text-2xl font-display font-extrabold text-indigo-950 dark:text-white tabular-nums">
                          {supportThreads.length}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                          Open support inbox →
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModule('commerce')}
                        className="text-left p-3.5 rounded-2xl border border-violet-200 bg-violet-50/70 hover:bg-violet-100/70 transition dark:border-violet-900/50 dark:bg-violet-950/30"
                      >
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-800 dark:text-violet-300">
                          Categories & Products
                        </div>
                        <div className="mt-1 text-2xl font-display font-extrabold text-violet-950 dark:text-white tabular-nums">
                          {workspace.products.length}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                          Edit products & categories →
                        </div>
                      </button>
                    </div>
                  </section>
                )}

                {/* 2. Selected Business 3D KPI Cards */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: activeBusiness.primary_color || '#4f46e5' }}
                      />
                      <h2 className="text-xl font-display font-extrabold text-slate-950 dark:text-white">
                        {activeBusiness.name} — Live Performance Metrics
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        v{activeBusiness.mini_app_version}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModule('commerce')}
                        className="btn-3d-white px-3.5 py-2 rounded-xl text-xs font-bold"
                      >
                        Manage Categories & Products
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModule('builder')}
                        className="btn-3d-dark px-4 py-2 rounded-xl text-xs font-bold text-white"
                      >
                        Customize Mini App
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="card-3d p-4 bg-white dark:bg-slate-900 rounded-2xl">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{t.totalRevenue}</div>
                      <div className="mt-1.5 text-xl font-display font-extrabold text-slate-950 dark:text-white tabular-nums">
                        {Number(analyticsData.overview.totalRevenue).toLocaleString()} ETB
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-1 tabular-nums">
                        30d: {Number(analyticsData.overview.monthlyRevenue).toLocaleString()} ETB
                      </div>
                    </div>

                    <div className="card-3d p-4 bg-white dark:bg-slate-900 rounded-2xl">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t.todayRevenue}</div>
                      <div className="mt-1.5 text-xl font-display font-extrabold text-slate-950 dark:text-white tabular-nums">
                        {Number(analyticsData.overview.todayRevenue).toLocaleString()} ETB
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-1 tabular-nums">
                        7d: {Number(analyticsData.overview.weeklyRevenue).toLocaleString()} ETB
                      </div>
                    </div>

                    <div className="card-3d p-4 bg-white dark:bg-slate-900 rounded-2xl">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t.totalOrders}</div>
                      <div className="mt-1.5 text-xl font-display font-extrabold text-slate-950 dark:text-white tabular-nums">
                        {analyticsData.overview.totalOrders}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-1 tabular-nums">
                        {analyticsData.overview.confirmedOrders} verified · {analyticsData.overview.pendingOrders} pending
                      </div>
                    </div>

                    <div className="card-3d p-4 bg-white dark:bg-slate-900 rounded-2xl">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">{t.totalCustomers}</div>
                      <div className="mt-1.5 text-xl font-display font-extrabold text-slate-950 dark:text-white tabular-nums">
                        {analyticsData.overview.totalCustomers}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-1 tabular-nums">
                        {analyticsData.overview.newCustomers} new · {analyticsData.overview.returningCustomers} returning
                      </div>
                    </div>

                    <div className="card-3d p-4 bg-white dark:bg-slate-900 rounded-2xl">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Total Visitors</div>
                      <div className="mt-1.5 text-xl font-display font-extrabold text-slate-950 dark:text-white tabular-nums">
                        {analyticsData.overview.totalVisitors}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-1">Telegram + Web sessions</div>
                    </div>

                    <div className="card-3d p-4 bg-white dark:bg-slate-900 rounded-2xl">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{t.activeBookings}</div>
                      <div className="mt-1.5 text-xl font-display font-extrabold text-slate-950 dark:text-white tabular-nums">
                        {analyticsData.overview.activeBookings}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-1">Scheduled reservations</div>
                    </div>
                  </div>
                </div>

                {/* 2.5. 24/7 Customer Identification Algorithm & High-Scale SQLite/Media Engine */}
                <section className="card-3d rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-400">
                        <Fingerprint className="w-3.5 h-3.5" />
                        24/7 Automatic Customer Identification & SQLite Million-Scale Engine
                      </div>
                      <h3 className="text-base font-display font-extrabold text-white">
                        Store Owner Unique ID: <span className="font-mono text-amber-300">{activeBusiness.owner_uid || currentUser?.owner_uid || 'OWN-ASSIGNED'}</span>
                      </h3>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        Customers visit and buy from <strong>{activeBusiness.name}</strong> without needing to create an account. Our 24/7 attribution algorithm automatically assigns each visitor a permanent <span className="font-mono text-emerald-300">CUS-247-...</span> fingerprint ID and links their cart, wishlist, and orders directly to your Store Owner ID (<span className="font-mono text-amber-300">{activeBusiness.owner_uid || currentUser?.owner_uid}</span>).
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('telegram');
                          setAuthModalOpen(true);
                        }}
                        className="btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Telegram Owner Login
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModule('commerce')}
                        className="btn-3d-white px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 inline-flex items-center gap-1.5"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-indigo-600" />
                        Upload Product Photos
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5" />
                        Zero-Account Customer Attribution
                      </div>
                      <div className="text-xs font-bold text-white">
                        {(workspace.customers || []).length} Identified Customers Linked 24/7
                      </div>
                      <div className="text-[11px] font-mono text-slate-300 truncate">
                        Latest IDs: {(workspace.customers || []).slice(0, 2).map((c: any) => c.customer_uid || 'CUS-247').join(' · ')}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        Million-Photo Deduplication Engine
                      </div>
                      <div className="text-xs font-bold text-white">
                        Client WebP Compression + SHA-256 Disk Addressing
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Zero base64 SQLite bloat · Immutable 365-day CDN headers
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/10 border border-white/15 p-3.5 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        Dual-Passcode Owner Recovery
                      </div>
                      <div className="text-xs font-bold text-white">
                        Email + Telegram Login + Secondary Recovery PIN
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Instant account recovery if email or password is forgotten
                      </div>
                    </div>
                  </div>
                </section>



                {/* 4. Recent Orders & Conversion Funnel (Full-Width Clean 2-Column Layout without Cramped Inline Storefront) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 card-3d bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-display font-extrabold text-slate-900 dark:text-white">
                          Recent Orders & Payment Verification ({activeBusiness.name})
                        </h2>
                        <p className="text-xs text-slate-500">
                          Orders are only marked Paid after real payment reference verification.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveModule('orders')}
                        className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600"
                      >
                        Manage all ({workspace.orders.length})
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                            <th className="py-2 pr-3 font-bold">Order</th>
                            <th className="py-2 px-3 font-bold">Customer</th>
                            <th className="py-2 px-3 font-bold">Channel</th>
                            <th className="py-2 px-3 font-bold">Payment State</th>
                            <th className="py-2 pl-3 font-bold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {workspace.orders.slice(0, 7).map((ord: any) => (
                            <tr key={ord.id}>
                              <td className="py-2.5 pr-3 font-mono font-bold text-slate-900 dark:text-white">
                                {ord.order_number}
                              </td>
                              <td className="py-2.5 px-3 font-medium">{ord.customer_name}</td>
                              <td className="py-2.5 px-3 uppercase font-mono text-[11px] text-slate-500">
                                {ord.source} · {ord.payment_method}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    ord.payment_status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      : ord.payment_status === 'pending_verification'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-700'
                                  }`}
                                >
                                  {ord.payment_status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="py-2.5 pl-3 text-right font-mono font-bold tabular-nums">
                                {Number(ord.total).toLocaleString()} {ord.currency}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Top Selling Items & Conversion Funnel */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="card-3d bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            What {activeBusiness.name} Is Selling Best
                          </h2>
                          <p className="text-xs text-slate-500">Top products ranked by purchases and customer interest</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveModule('commerce')}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Edit Catalog
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(analyticsData.topProducts || []).slice(0, 4).map((prod: any, i: number) => (
                          <div
                            key={prod.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">
                                #{i + 1} · {prod.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {prod.category_name} · {prod.views_count} views · {prod.likes_count} likes
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <div className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                                {prod.purchases_count} sold
                              </div>
                              <div className="text-[11px] text-slate-500 tabular-nums">
                                {Number(prod.price).toLocaleString()} ETB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card-3d bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-display font-extrabold text-slate-900 dark:text-white">
                          {t.salesFunnel}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setActiveModule('analytics')}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Full Analytics
                        </button>
                      </div>
                      <div className="space-y-2">
                        {analyticsData.funnelStages.slice(0, 6).map((st: any) => {
                          const maxCount = Math.max(1, analyticsData.funnelStages[0]?.count || 1);
                          const pct = Math.min(100, Math.round((st.count / maxCount) * 100));
                          return (
                            <div key={st.key} className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {st.step}. {st.label}
                                </span>
                                <span className="font-mono font-bold tabular-nums">
                                  {st.count} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-600 to-sky-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Store Owner's Collected Customer Reviews (1 to 5 Stars) */}
                <section className="card-3d bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              className={`h-4 w-4 ${
                                st <= Math.round(Number(workspace.reviewStats?.averageRating || 5))
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-display font-extrabold text-slate-900 dark:text-white">
                          {Number(workspace.reviewStats?.averageRating || 5).toFixed(1)} / 5.0 Average Rating
                        </span>
                        <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300">
                          {(workspace.reviews || []).length} Customer {(workspace.reviews || []).length === 1 ? 'Review' : 'Reviews'}
                        </span>
                      </div>
                      <h2 className="mt-1 text-base font-display font-extrabold text-slate-900 dark:text-white">
                        Collected Store Customer Reviews (1 to 5 Stars) — {activeBusiness.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Every customer who buys from or visits your storefront can leave a 1-to-5 star rating and review on your store page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFullStorefrontOpen(true)}
                      className="btn-3d-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shrink-0"
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      <span>Open Storefront Review Page</span>
                    </button>
                  </div>

                  {(workspace.reviews || []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                      No customer reviews collected yet. Share your storefront link so buyers can rate your store from 1 to 5 stars!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {(workspace.reviews || []).map((rev: any) => (
                        <div
                          key={rev.id}
                          className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 flex flex-col justify-between gap-2.5 text-xs"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-3.5 w-3.5 ${
                                      s <= Number(rev.rating || 5)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 font-mono font-extrabold text-slate-900 dark:text-white">
                                  {rev.rating}/5
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {rev.verified_purchase ? (
                                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                                    Verified Buyer
                                  </span>
                                ) : null}
                                <button
                                  type="button"
                                  title="Remove review"
                                  onClick={async () => {
                                    await fetch(`/api/businesses/${activeBusiness.id}/reviews/${rev.id}`, {
                                      method: 'DELETE',
                                      headers: headersWithAuth(),
                                    });
                                    loadTenantWorkspace(activeBusiness.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-600 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                              “{rev.comment}”
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-500">
                            <span className="font-bold text-slate-900 dark:text-white">{rev.customer_name}</span>
                            {rev.product_name ? (
                              <span className="truncate max-w-[160px] font-medium text-indigo-600 dark:text-indigo-400">
                                {rev.product_name}
                              </span>
                            ) : (
                              <span>Storefront Review</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* MODULE 2: MINI APP BUILDER STUDIO (3 CREATION METHODS + MULTI-STORE COVER CARDS) */}
            {activeModule === 'builder' && workspace && (
              <BuilderStudio
                business={workspace.business}
                businesses={businesses}
                onSelectBusiness={(id) => setSelectedBusinessId(id)}
                onOpenFullPreview={() => setFullStorefrontOpen(true)}
                versions={workspace.versions}
                authToken={authToken}
                onRefresh={() => {
                  loadTenantWorkspace(selectedBusinessId);
                  loadAccountAndBusinesses();
                }}
              />
            )}

            {/* MODULE 3: STORE CATALOG, INVENTORY & BOOKABLE SERVICES */}
            {activeModule === 'commerce' && workspace && (
              <div className="space-y-6">
                <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Catalog management</div>
                    <h2 className="mt-1 text-2xl font-display font-semibold tracking-tight text-slate-950 dark:text-white">Products & services</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Keep your storefront accurate, upload product photos from your device, and organize digital menu categories.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProdName('');
                        setProdCat(storeCategories[0] || 'Signature Offerings');
                        setProdPrice('');
                        setProdComparePrice('');
                        setProdDiscountPct('');
                        setProdStock('25');
                        setProdDesc('');
                        setProdVariations('Standard');
                        setProdImageUrl('');
                        setProdGallery([]);
                        setCommerceError('');
                        setIsProductModalOpen(true);
                      }}
                      className="btn-3d-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-105"
                    >
                      <Plus className="h-4 w-4" />
                      <span>+ Add New Product</span>
                    </button>
                    <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {workspace.business?.name || 'Current business'}
                    </div>
                  </div>
                </section>

                {commerceError && (
                  <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="flex-1">{commerceError}</span>
                    <button type="button" onClick={() => setCommerceError('')} aria-label="Dismiss error" className="shrink-0 underline">Dismiss</button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="card-3d rounded-2xl bg-white p-4 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500"><span>Catalog items</span><Package className="h-4 w-4 text-indigo-600" /></div>
                    <div className="mt-2 text-2xl font-display font-extrabold tabular-nums text-slate-950 dark:text-white">{commerceProducts.length}</div>
                    <p className="mt-1 text-[11px] text-slate-500">Products across {storeCategories.length} categories</p>
                  </div>
                  <div className="card-3d rounded-2xl bg-white p-4 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500"><span>Low stock</span><Boxes className="h-4 w-4 text-amber-600" /></div>
                    <div className="mt-2 text-2xl font-display font-extrabold tabular-nums text-slate-950 dark:text-white">{lowStockCount}</div>
                    <p className="mt-1 text-[11px] text-slate-500">Between 1 and 5 units</p>
                  </div>
                  <div className="card-3d rounded-2xl bg-white p-4 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500"><span>Out of stock</span><AlertCircle className="h-4 w-4 text-rose-600" /></div>
                    <div className="mt-2 text-2xl font-display font-extrabold tabular-nums text-slate-950 dark:text-white">{outOfStockCount}</div>
                    <p className="mt-1 text-[11px] text-slate-500">Products with zero units recorded</p>
                  </div>
                </div>

                {/* Store Digital Menu Categories Manager */}
                <section className="card-3d rounded-2xl bg-white p-4 sm:p-5 dark:bg-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                        <Tag className="w-3.5 h-3.5" />
                        Digital Menu & Storefront Categories
                      </div>
                      <h3 className="mt-0.5 text-base font-display font-extrabold text-slate-950 dark:text-white">
                        Create, Rename & Organize Product Categories
                      </h3>
                      <p className="text-xs text-slate-500">
                        Add custom categories (e.g. "Breakfast", "Hot Drinks", "VIP Packages", "New Arrivals") and assign any product under any category.
                      </p>
                    </div>
                    <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="New category name..."
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={categorySaving}
                        className="btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5 shrink-0"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        Add Category
                      </button>
                    </form>
                  </div>

                  {renamingCategory && (
                    <form onSubmit={handleRenameCategory} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                      <span className="font-bold text-indigo-950 dark:text-indigo-200">
                        Rename "{renamingCategory.oldName}" to:
                      </span>
                      <input
                        type="text"
                        required
                        value={renamingCategory.newName}
                        onChange={(e) => setRenamingCategory({ ...renamingCategory, newName: e.target.value })}
                        className="rounded-lg border border-indigo-300 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold"
                      />
                      <button type="submit" className="btn-3d-primary px-3 py-1.5 rounded-lg text-white font-bold">
                        Save Name
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingCategory(null)}
                        className="btn-3d-white px-3 py-1.5 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={
                        selectedCategoryFilter === 'all'
                          ? 'btn-3d-dark px-3.5 py-1.5 rounded-xl text-xs font-bold text-white'
                          : 'btn-3d-white px-3.5 py-1.5 rounded-xl text-xs font-semibold'
                      }
                    >
                      All Categories ({commerceProducts.length})
                    </button>
                    {storeCategories.map((cat) => {
                      const count = commerceProducts.filter((p: any) => p.category_name === cat).length;
                      const isActive = selectedCategoryFilter === cat;
                      return (
                        <div
                          key={cat}
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold transition ${
                            isActive
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCategoryFilter(cat)}
                            className="px-1 font-bold"
                          >
                            {cat} <span className="opacity-75">({count})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingCategory({ oldName: cat, newName: cat })}
                            title={`Rename ${cat}`}
                            className="p-1 rounded hover:bg-black/10"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          {storeCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              title={`Delete ${cat}`}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="space-y-6">
                  {/* Product Inventory Full-Width Card */}
                  <div className="card-3d rounded-2xl bg-white p-4 dark:bg-slate-900 sm:p-5 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">Product Inventory</h3>
                        <p className="mt-1 text-xs text-slate-500">{visibleCommerceProducts.length} of {commerceProducts.length} products shown</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="search"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Search product or category..."
                            aria-label="Search products"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-indigo-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(null);
                            setProdName('');
                            setProdCat(storeCategories[0] || 'Signature Offerings');
                            setProdPrice('');
                            setProdComparePrice('');
                            setProdDiscountPct('');
                            setProdStock('25');
                            setProdDesc('');
                            setProdVariations('Standard');
                            setProdImageUrl('');
                            setProdGallery([]);
                            setCommerceError('');
                            setIsProductModalOpen(true);
                          }}
                          className="btn-3d-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Product</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All products', count: commerceProducts.length },
                        { id: 'low', label: 'Low stock', count: lowStockCount },
                        { id: 'out', label: 'Out of stock', count: outOfStockCount },
                        { id: 'hidden', label: 'Hidden', count: commerceProducts.filter((p: any) => !Boolean(Number(p.available))).length },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setProductStockFilter(filter.id as 'all' | 'low' | 'out' | 'hidden')}
                          aria-pressed={productStockFilter === filter.id}
                          className={productStockFilter === filter.id
                            ? 'btn-3d-dark rounded-full px-3 py-1.5 text-[11px] font-bold text-white'
                            : 'btn-3d-white rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-700'}
                        >
                          {filter.label} <span className="ml-1 opacity-65">{filter.count}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-1">
                      {visibleCommerceProducts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-12 text-center dark:border-slate-700">
                          <Package className="mx-auto h-8 w-8 text-slate-400" />
                          <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                            {commerceProducts.length === 0 ? 'Your catalog is ready for its first product' : 'No products match these filters'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                            {commerceProducts.length === 0 ? 'Click "+ Add Product" to upload photos and set price, discount, and description.' : 'Try another search or choose a different category.'}
                          </p>
                          {commerceProducts.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(null);
                                setProdName('');
                                setProdCat(storeCategories[0] || 'Signature Offerings');
                                setProdPrice('');
                                setProdComparePrice('');
                                setProdDiscountPct('');
                                setProdStock('25');
                                setProdDesc('');
                                setProdVariations('Standard');
                                setProdImageUrl('');
                                setProdGallery([]);
                                setIsProductModalOpen(true);
                              }}
                              className="mt-4 btn-3d-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                            >
                              <Plus className="h-4 w-4" />
                              Add Your First Product
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {visibleCommerceProducts.map((product: any) => {
                            const stock = Number(product.stock || 0);
                            const hidden = !Boolean(Number(product.available));
                            const stockLabel = stock <= 0 ? 'Out of stock' : stock <= 5 ? 'Low stock' : 'In stock';
                            const stockClass = stock <= 0
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                              : stock <= 5
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
                            const discountPct = Number(product.discount_percent || 0) || (
                              product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
                                ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100)
                                : 0
                            );
                            return (
                              <article key={product.id} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 transition hover:border-indigo-300 hover:shadow-md bg-white dark:bg-slate-900/80 flex flex-col justify-between gap-3">
                                <div>
                                  <div className="flex items-start gap-3.5">
                                    {product.image_url ? (
                                      <img
                                        src={product.image_url}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-20 w-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 shadow-xs"
                                      />
                                    ) : (
                                      <div className="h-20 w-20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0 bg-slate-50 dark:bg-slate-950">
                                        <ImagePlus className="h-6 w-6" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <h4 className="truncate text-sm font-bold text-slate-950 dark:text-white">{product.name}</h4>
                                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                          {product.category_name || 'General'}
                                        </span>
                                        {discountPct > 0 && (
                                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                            {discountPct}% OFF
                                          </span>
                                        )}
                                        {Boolean(Number(product.featured)) && (
                                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                            Featured
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                                        {product.description || 'No description provided.'}
                                      </p>
                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + stockClass}>{stockLabel} ({stock})</span>
                                        {hidden && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">Hidden</span>}
                                        <span className="text-[10px] font-mono text-slate-400">SKU: {product.sku || 'Auto'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-3">
                                  <div>
                                    <div className="text-base font-display font-extrabold tabular-nums text-slate-950 dark:text-white">
                                      {Number(product.price || 0).toLocaleString()} {product.currency || 'ETB'}
                                    </div>
                                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                                      <div className="text-[11px] text-slate-400 line-through tabular-nums">
                                        {Number(product.compare_at_price).toLocaleString()} {product.currency || 'ETB'}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCommerceError('');
                                        let parsedVars = '';
                                        let parsedGallery: string[] = [];
                                        try {
                                          const arr = JSON.parse(product.variations_json || '[]');
                                          parsedVars = Array.isArray(arr) ? arr.join(', ') : '';
                                        } catch {
                                          parsedVars = '';
                                        }
                                        try {
                                          const g = JSON.parse(product.gallery_json || '[]');
                                          parsedGallery = Array.isArray(g) ? g : [];
                                        } catch {
                                          parsedGallery = [];
                                        }
                                        setEditingProduct({
                                          id: product.id,
                                          name: product.name || '',
                                          category_name: product.category_name || storeCategories[0] || 'Signature Offerings',
                                          description: product.description || '',
                                          variations: parsedVars,
                                          price: String(product.price ?? ''),
                                          compare_at_price: product.compare_at_price ? String(product.compare_at_price) : '',
                                          discount_percent: product.discount_percent ? String(product.discount_percent) : '',
                                          stock: String(product.stock ?? 0),
                                          image_url: product.image_url || '',
                                          gallery: parsedGallery,
                                          available: Boolean(Number(product.available)),
                                          featured: Boolean(Number(product.featured)),
                                        });
                                        setIsProductModalOpen(true);
                                      }}
                                      className="btn-3d-white inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-indigo-600" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(product.id, product.name)}
                                      className="btn-3d-white inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                      title={`Delete ${product.name}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bookable Services Full-Width Card */}
                  <div className="card-3d rounded-2xl bg-white p-4 dark:bg-slate-900 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">Bookable Services & Appointments</h3>
                        <p className="mt-0.5 text-xs text-slate-500">{commerceServices.length} services configured</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                        className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{showAddServiceForm ? 'Close Form' : 'Add Service'}</span>
                      </button>
                    </div>

                    {showAddServiceForm && (
                      <form onSubmit={(e) => { handleCreateService(e); setShowAddServiceForm(false); }} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">New Appointment or Bookable Service</div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Service name</label>
                          <input required value={srvName} onChange={(e) => setSrvName(e.target.value)} placeholder="e.g. VIP Consultation or Table Reservation" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Duration (minutes)</label>
                            <input type="number" min="1" value={srvDuration} onChange={(e) => setSrvDuration(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Price (ETB)</label>
                            <input required type="number" min="0" step="0.01" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} placeholder="0 for free booking" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Description (optional)</label>
                          <textarea rows={2} value={srvDesc} onChange={(e) => setSrvDesc(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setShowAddServiceForm(false)} className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold">Cancel</button>
                          <button type="submit" disabled={serviceSaving} className="btn-3d-primary px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50">
                            {serviceSaving ? 'Creating...' : 'Create Service'}
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {commerceServices.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center dark:border-slate-700">
                          <Clock3 className="mx-auto h-5 w-5 text-slate-400" />
                          <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No bookable services yet</p>
                          <p className="mt-1 text-[11px] text-slate-500">Click &quot;Add Service&quot; above to create appointments, bookings, or consultations.</p>
                        </div>
                      ) : commerceServices.map((service: any) => (
                        <div key={service.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-950 dark:text-white">{service.name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {Number(service.duration_mins || 0)} minutes · Capacity {Number(service.capacity || 1)}
                            </div>
                            {service.description && <p className="mt-1 text-xs leading-5 text-slate-500">{service.description}</p>}
                          </div>
                          <div className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{Number(service.price || 0).toLocaleString()} {service.currency || 'ETB'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: ORDERS, BOOKINGS & PAYMENT METHODS */}
            {activeModule === 'orders' && workspace && (
              <div className="space-y-6">

                <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Order operations</div>
                    <h2 className="mt-1 text-2xl font-display font-semibold tracking-tight text-slate-950 dark:text-white">Orders & payments — {workspace.business?.name}</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Track orders, confirm received payments, and manage the account details customers use at checkout.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPaymentMethod(null);
                        setPaymentMethodName('');
                        setPaymentAccountName('');
                        setPaymentAccountNumber('');
                        setPaymentMethodError('');
                        setIsPaymentMethodsModalOpen(true);
                      }}
                      className="btn-3d-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-105"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Manage Payment Accounts ({(workspace.paymentMethods || []).filter((m: any) => Boolean(Number(m.is_active))).length} Active)</span>
                    </button>
                    <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {workspace.business?.name || 'Current business'}
                    </div>
                  </div>
                </section>

                {orderManagementError && (
                  <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="flex-1">{orderManagementError}</span>
                    <button type="button" onClick={() => setOrderManagementError('')} className="shrink-0 underline">Dismiss</button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('all')}
                    className={`text-left rounded-2xl border p-4 shadow-sm transition ${
                      orderStatusFilter === 'all'
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-500">All Sales Orders</div>
                    <div className="mt-2 text-2xl font-extrabold tabular-nums text-slate-950 dark:text-white">
                      {workspace.orders.length}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Click to view all records</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('payment_requests')}
                    className={`text-left rounded-2xl border p-4 shadow-sm transition ${
                      orderStatusFilter === 'payment_requests'
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Payment Requests</div>
                    <div className="mt-2 text-2xl font-extrabold tabular-nums text-amber-900 dark:text-white">
                      {workspace.orders.filter((o: any) => o.payment_status === 'pending_verification').length}
                    </div>
                    <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">Awaiting transfer verification</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('finished')}
                    className={`text-left rounded-2xl border p-4 shadow-sm transition ${
                      orderStatusFilter === 'finished'
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Finished Orders</div>
                    <div className="mt-2 text-2xl font-extrabold tabular-nums text-emerald-900 dark:text-white">
                      {workspace.orders.filter((o: any) => o.status === 'completed').length}
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">Completed & delivered</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter('rejected')}
                    className={`text-left rounded-2xl border p-4 shadow-sm transition ${
                      orderStatusFilter === 'rejected'
                        ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-rose-700 dark:text-rose-400">Rejected / Cancelled</div>
                    <div className="mt-2 text-2xl font-extrabold tabular-nums text-rose-900 dark:text-white">
                      {workspace.orders.filter((o: any) => o.status === 'cancelled' || o.status === 'refunded' || o.payment_status === 'failed').length}
                    </div>
                    <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-300">Rejected or refunded orders</p>
                  </button>
                </div>

                {/* Orders and fulfillment */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                        Customer orders ({orderStatusFilter === 'all' ? 'All' : orderStatusFilter === 'payment_requests' ? 'Payment Requests' : orderStatusFilter === 'finished' ? 'Finished' : 'Rejected / Cancelled'})
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">Update order progress, verify payment requests, or mark finished/rejected.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['all', 'payment_requests', 'finished', 'rejected'] as const).map((flt) => (
                        <button
                          key={flt}
                          type="button"
                          onClick={() => setOrderStatusFilter(flt)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            orderStatusFilter === flt
                              ? 'bg-slate-950 text-white dark:bg-indigo-600'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {flt === 'all' ? 'All' : flt === 'payment_requests' ? 'Payment Requests' : flt === 'finished' ? 'Finished' : 'Rejected'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {workspace.orders.filter((ord: any) => {
                      if (orderStatusFilter === 'payment_requests') return ord.payment_status === 'pending_verification';
                      if (orderStatusFilter === 'finished') return ord.status === 'completed';
                      if (orderStatusFilter === 'rejected') return ord.status === 'cancelled' || ord.status === 'refunded' || ord.payment_status === 'failed';
                      return true;
                    }).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-9 text-center dark:border-slate-700">
                        <Package className="mx-auto h-6 w-6 text-slate-400" />
                        <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">No matching orders in this filter</p>
                        <p className="mt-1 text-xs text-slate-500">Switch filter above to view all customer orders.</p>
                      </div>
                    ) : workspace.orders
                        .filter((ord: any) => {
                          if (orderStatusFilter === 'payment_requests') return ord.payment_status === 'pending_verification';
                          if (orderStatusFilter === 'finished') return ord.status === 'completed';
                          if (orderStatusFilter === 'rejected') return ord.status === 'cancelled' || ord.status === 'refunded' || ord.payment_status === 'failed';
                          return true;
                        })
                        .map((ord: any) => (
                      <article key={ord.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-slate-950 dark:text-white">{ord.order_number}</span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{String(ord.status).replace(/_/g, ' ')}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ord.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : ord.payment_status === 'pending_verification' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : ord.payment_status === 'failed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                {String(ord.payment_status).replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="mt-2 text-xs font-medium text-slate-800 dark:text-slate-200">{ord.customer_name} · {ord.customer_phone}</p>
                            <p className="mt-1 break-words text-xs text-slate-500">{ord.delivery_address || 'No delivery address supplied'} · {String(ord.source || 'web').toUpperCase()}</p>
                            <p className="mt-2 text-xs text-slate-500">Payment method: <span className="font-semibold text-slate-700 dark:text-slate-300">{ord.payment_method}</span></p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
                            <div className="text-lg font-semibold tabular-nums text-slate-950 dark:text-white">{Number(ord.total).toLocaleString()} {ord.currency}</div>
                            <select value={ord.status} onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value, ord.delivery_status)} aria-label={'Order status for ' + ord.order_number} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 sm:w-auto">
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="out_for_delivery">Out for delivery</option>
                              <option value="completed">Completed (Finished)</option>
                              <option value="cancelled">Cancelled (Rejected)</option>
                              <option value="refunded">Refunded</option>
                            </select>
                            <select value={ord.delivery_status} onChange={(e) => handleUpdateOrderStatus(ord.id, ord.status, e.target.value)} aria-label={'Delivery status for ' + ord.order_number} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 sm:w-auto">
                              <option value="awaiting_dispatch">Awaiting dispatch</option>
                              <option value="preparing_package">Preparing package</option>
                              <option value="courier_en_route">Courier en route</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {/* Business payments */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Payment request data & verification</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Check your bank or mobile-money account first. Enter its real transaction reference to verify receipt, or reject invalid payment requests.</p>
                    </div>
                    <div className="mt-3 space-y-3">
                      {workspace.payments.filter((p: any) => p.scope === 'business').length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                          <CreditCard className="mx-auto h-5 w-5 text-slate-400" />
                          <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No customer payments recorded</p>
                        </div>
                      ) : workspace.payments.filter((p: any) => p.scope === 'business').map((pay: any) => (
                        <article key={pay.id} className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="font-mono text-xs font-semibold text-slate-950 dark:text-white">{pay.reference_code} · {Number(pay.amount).toLocaleString()} {pay.currency}</div>
                              <div className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">{pay.payment_method_name || pay.method}</div>
                              <div className="mt-1 text-[11px] text-slate-500">{pay.description}</div>
                              {pay.payment_account_name && <div className="mt-2 text-[11px] text-slate-500">Account holder: {pay.payment_account_name}</div>}
                              {pay.payment_account_number && <div className="mt-0.5 break-all font-mono text-[11px] text-slate-600 dark:text-slate-400">Account: {pay.payment_account_number}</div>}
                              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${pay.status === 'verified' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : pay.status === 'failed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'}`}>{String(pay.status).toUpperCase()}</span>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              {pay.status !== 'verified' && (
                                <button type="button" disabled={verificationSaving} onClick={() => { setVerificationPaymentId(verificationPaymentId === pay.id ? '' : pay.id); setVerificationReference(''); setOrderManagementError(''); }} className="rounded-lg bg-slate-950 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950">
                                  Verify receipt
                                </button>
                              )}
                              {pay.status === 'pending' && (
                                <button type="button" disabled={verificationSaving} onClick={() => handleVerifyPayment(pay.id, 'fail')} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                                  Reject request
                                </button>
                              )}
                              {pay.status === 'verified' && (
                                <button type="button" disabled={verificationSaving} onClick={() => handleVerifyPayment(pay.id, 'refund')} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-rose-950/30">Refund</button>
                              )}
                            </div>
                          </div>
                          {verificationPaymentId === pay.id && (
                            <form onSubmit={(e) => { e.preventDefault(); handleVerifyPayment(pay.id, 'verify', verificationReference); }} className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60">
                              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">Real bank / provider transaction reference</label>
                              <input required minLength={3} value={verificationReference} onChange={(e) => setVerificationReference(e.target.value)} placeholder="Enter the reference shown by your bank" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900" />
                              <div className="flex flex-wrap justify-end gap-2">
                                <button type="button" onClick={() => { setVerificationPaymentId(''); setVerificationReference(''); }} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</button>
                                <button type="submit" disabled={verificationSaving} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50">{verificationSaving ? 'Confirming...' : 'Confirm money received'}</button>
                              </div>
                            </form>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>

                  {/* Bookings and platform billing */}
                  <div className="space-y-5">
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Appointments & reservations</h3>
                        <p className="mt-1 text-xs text-slate-500">{workspace.bookings.length} booking records</p>
                      </div>
                      <div className="mt-3 space-y-2">
                        {workspace.bookings.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center dark:border-slate-700">
                            <Clock3 className="mx-auto h-5 w-5 text-slate-400" />
                            <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No bookings yet</p>
                          </div>
                        ) : workspace.bookings.map((booking: any) => (
                          <article key={booking.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-950 dark:text-white">{booking.booking_number} · {booking.service_name}</div>
                              <div className="mt-1 text-[11px] text-slate-500">{booking.customer_name} · {booking.customer_phone}</div>
                              <div className="mt-1 text-[11px] text-slate-500">{booking.booking_date} at {booking.booking_time} · {booking.guests} guests</div>
                              <div className="mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">{Number(booking.amount).toLocaleString()} {booking.currency} · Payment {String(booking.payment_status).replace(/_/g, ' ')}</div>
                            </div>
                            <select value={booking.status} onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)} aria-label={'Booking status for ' + booking.booking_number} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                              <option value="requested">Requested</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </article>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Platform billing</h3>
                      <p className="mt-1 text-xs text-slate-500">TeleBiz subscription and add-on payments are kept separate.</p>
                      <div className="mt-3 space-y-2">
                        {workspace.payments.filter((p: any) => p.scope === 'platform').length === 0 ? (
                          <p className="py-4 text-center text-xs text-slate-500">No platform billing records.</p>
                        ) : workspace.payments.filter((p: any) => p.scope === 'platform').map((payment: any) => (
                          <div key={payment.id} className="flex items-center justify-between gap-3 border-t border-slate-100 py-2.5 text-xs dark:border-slate-800">
                            <div className="min-w-0"><div className="font-mono font-semibold text-slate-900 dark:text-white">{payment.reference_code}</div><div className="mt-1 truncate text-[11px] text-slate-500">{payment.description}</div></div>
                            <div className="shrink-0 text-right font-semibold tabular-nums text-slate-800 dark:text-slate-200">{Number(payment.amount).toLocaleString()} {payment.currency}<div className="mt-1 text-[10px] font-normal uppercase text-slate-500">{payment.status}</div></div>
                          </div>
                        ))}
                      </div>
                    </section>
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
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100">Access permissions</div>
                      <p className="text-[10px] text-slate-500">Only selected actions will be available to this employee.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { value: 'workspace.view', label: 'View workspace' },
                          { value: 'orders.manage', label: 'Manage orders & payments' },
                          { value: 'bookings.manage', label: 'Manage bookings' },
                          { value: 'products.manage', label: 'Manage products & categories' },
                          { value: 'builder.edit', label: 'Edit storefront builder' },
                          { value: 'support.view', label: 'View support inbox' },
                          { value: 'support.reply', label: 'Reply to customers' },
                          { value: 'analytics.view', label: 'View analytics' },
                          { value: 'reviews.manage', label: 'Manage reviews' },
                          { value: 'settings.manage', label: 'Manage store settings' },
                          { value: 'telegram.manage', label: 'Configure Telegram' },
                          { value: 'notifications.view', label: 'View notifications' },
                          { value: 'notifications.manage', label: 'Send notifications' },
                          { value: 'marketing.manage', label: 'Manage promotions & campaigns' },
                          { value: 'finance.manage', label: 'Manage expenses' },
                          { value: 'branches.manage', label: 'Manage branches' },
                          { value: 'subscription.manage', label: 'Manage subscription' },
                          { value: 'addons.manage', label: 'Manage add-ons' },
                          { value: 'team.manage', label: 'Manage employees' },
                        ].map((permission) => (
                          <label key={permission.value} className="flex items-center gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={empPerms.includes(permission.value)}
                              onChange={(e) => setEmpPerms((prev) =>
                                e.target.checked
                                  ? [...prev, permission.value]
                                  : prev.filter((value) => value !== permission.value)
                              )}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
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

            {/* MODULE 9: TELEGRAM BOT, OPTIONAL CHANNEL, WEB DOMAIN SETUP & STYLIZED NOTIFICATION STUDIO */}
            {activeModule === 'telegram' && workspace && (
              <div className="space-y-6 text-xs">
                {/* Top Status & Live Connection Hub */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          <Send className="h-3 w-3" />
                          Telegram &amp; Web Setup
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            activeBusiness?.telegram_bot_username && tgWebhookActive
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              activeBusiness?.telegram_bot_username && tgWebhookActive ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {activeBusiness?.telegram_bot_username && tgWebhookActive
                            ? `Connected & Synced (${activeBusiness.telegram_bot_username})`
                            : 'Ready to Connect'}
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-display font-extrabold text-slate-900 dark:text-white">
                        Telegram Bot, Mini App Deep Links, Web Domain &amp; Stylized Notifications
                      </h2>
                      <p className="text-slate-500 mt-1">
                        A Telegram channel is strictly optional. Connect your Telegram Bot Mini App and standalone Web Storefront below, run live connection diagnostics, and customize stylized notifications with or without buttons.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={tgTestingConnection}
                        onClick={() => handleTestTelegramConnection(true)}
                        className="btn-3d-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-sm disabled:opacity-60"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${tgTestingConnection ? 'animate-spin' : ''}`} />
                        <span>{tgTestingConnection ? 'Verifying Connection...' : 'Verify & Test Connection'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStorefrontCustomerOnly(false);
                          setFullStorefrontOpen(true);
                        }}
                        className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Open Live Storefront</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Distribution Endpoints Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* 1. Telegram Mini App Deep Link */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                            1. Telegram Mini App Deep Link
                          </span>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            {tgMiniAppPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all">
                          https://t.me/{(tgBotUsername || activeBusiness.telegram_bot_username || 'Bot').replace(/^@+/, '')}/app?startapp={activeBusiness.slug}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEndpoint(
                              'miniapp',
                              `https://t.me/${(tgBotUsername || activeBusiness.telegram_bot_username || 'Bot').replace(/^@+/, '')}/app?startapp=${activeBusiness.slug}`,
                              'Telegram Mini App Deep Link',
                              true
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 text-[11px] font-bold transition"
                        >
                          {copiedEndpointKey === 'miniapp' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedEndpointKey === 'miniapp' ? 'Copied!' : 'Copy Deep Link'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStorefrontCustomerOnly(false);
                            setFullStorefrontOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <span>Launch</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* 2. Standalone Web Storefront URL */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            2. Standalone Web Storefront URL
                          </span>
                          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                            SSL Active
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all">
                          https://{customDomainInput.trim() || activeBusiness.custom_domain || `telebiz.os/s/${activeBusiness.slug}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEndpoint(
                              'weburl',
                              `https://${customDomainInput.trim() || activeBusiness.custom_domain || `telebiz.os/s/${activeBusiness.slug}`}`,
                              'Web Storefront URL',
                              false
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-[11px] font-bold transition"
                        >
                          {copiedEndpointKey === 'weburl' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedEndpointKey === 'weburl' ? 'Copied!' : 'Copy Web URL'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStorefrontCustomerOnly(true);
                            setFullStorefrontOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <span>Customer View</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* 3. Optional Telegram Channel & Bot Webhook Status */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            3. Bot Webhook &amp; Optional Channel
                          </span>
                          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {tgChannelUsername || activeBusiness.telegram_channel_username ? 'Channel Linked' : 'Direct Bot Mode'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Bot: <span className="font-mono text-sky-600">{tgBotUsername || activeBusiness.telegram_bot_username || '@NotSet'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Channel: <span className="font-mono">{tgChannelUsername || activeBusiness.telegram_channel_username || 'None (Optional)'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleSaveTelegramIntegration(e as any, true)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-[11px] font-bold transition"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Auto-Sync Handshake Token</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Diagnostic Report (Shown when user runs Verify & Test Connection) */}
                  {tgDiagnosticsResult && (
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Live Telegram &amp; Web Diagnostic Passed ({tgDiagnosticsResult.latency_ms}ms)</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                          Synced: {String(tgDiagnosticsResult.synced_at || '').slice(0, 19).replace('T', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
                        <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-emerald-200/70 dark:border-emerald-900">
                          <div className="text-slate-400 uppercase font-bold text-[10px]">Bot Handshake</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {tgDiagnosticsResult.bot_username} · OK
                          </div>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-emerald-200/70 dark:border-emerald-900">
                          <div className="text-slate-400 uppercase font-bold text-[10px]">Webhook Endpoint</div>
                          <div className="font-mono font-bold text-emerald-600 mt-0.5">Active (200 OK)</div>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-emerald-200/70 dark:border-emerald-900">
                          <div className="text-slate-400 uppercase font-bold text-[10px]">Channel Mode</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {tgDiagnosticsResult.channel_status}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-emerald-200/70 dark:border-emerald-900">
                          <div className="text-slate-400 uppercase font-bold text-[10px]">Web Storefront SSL</div>
                          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                            {tgDiagnosticsResult.web_storefront_url}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Two-Column Layout: Left = Telegram & Web Connection Form, Right = Stylized Notification Studio */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT COLUMN (7 cols): Telegram Bot, Optional Channel & Web Domain Configuration */}
                  <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                    <div>
                      <h3 className="text-sm font-display font-extrabold text-slate-900 dark:text-white">
                        1. Connect Telegram Bot, Optional Channel &amp; Web Domain
                      </h3>
                      <p className="text-slate-500 mt-0.5">
                        Configure your @BotUsername, encrypted @BotFather token, optional Telegram channel, and standalone web domain. All fields are validated before saving.
                      </p>
                    </div>

                    <form onSubmit={(e) => handleSaveTelegramIntegration(e, false)} className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Telegram Bot Username <span className="text-rose-500">*</span> (Required for Mini App)
                        </label>
                        <input
                          type="text"
                          value={tgBotUsername}
                          onChange={(e) => {
                            setTgBotUsername(e.target.value);
                            if (tgSetupFieldErrors.bot_username) {
                              setTgSetupFieldErrors((prev) => ({ ...prev, bot_username: '' }));
                            }
                          }}
                          placeholder="@YourBusinessBot"
                          className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                            tgSetupFieldErrors.bot_username
                              ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}
                        />
                        {tgSetupFieldErrors.bot_username && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{tgSetupFieldErrors.bot_username}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">
                            Telegram @BotFather API Token
                          </label>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                            Active Token: {activeBusiness.telegram_bot_token_masked || 'Not set'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={tgTokenInput}
                            onChange={(e) => {
                              setTgTokenInput(e.target.value);
                              if (tgSetupFieldErrors.bot_token) {
                                setTgSetupFieldErrors((prev) => ({ ...prev, bot_token: '' }));
                              }
                            }}
                            placeholder="Paste new @BotFather token or leave blank to keep current..."
                            className={`flex-1 px-3.5 py-2.5 rounded-xl border font-mono ${
                              tgSetupFieldErrors.bot_token
                                ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveTelegramIntegration(e as any, true)}
                            className="shrink-0 px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold hover:bg-sky-100 transition"
                            title="Generate and bind a verified BotFather handshake token automatically"
                          >
                            Generate Verified Token
                          </button>
                        </div>
                        {tgSetupFieldErrors.bot_token && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{tgSetupFieldErrors.bot_token}</span>
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Telegram Channel Username (Strictly Optional)
                          </label>
                          <input
                            type="text"
                            value={tgChannelUsername}
                            onChange={(e) => {
                              setTgChannelUsername(e.target.value);
                              if (tgSetupFieldErrors.channel_username) {
                                setTgSetupFieldErrors((prev) => ({ ...prev, channel_username: '' }));
                              }
                            }}
                            placeholder="Optional: @YourBusinessChannel"
                            className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                              tgSetupFieldErrors.channel_username
                                ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}
                          />
                          {tgSetupFieldErrors.channel_username && (
                            <p className="mt-1 text-[11px] font-semibold text-rose-600">
                              {tgSetupFieldErrors.channel_username}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Custom Web Domain (For Web Customers)
                          </label>
                          <input
                            type="text"
                            value={customDomainInput}
                            onChange={(e) => {
                              setCustomDomainInput(e.target.value);
                              if (tgSetupFieldErrors.custom_domain) {
                                setTgSetupFieldErrors((prev) => ({ ...prev, custom_domain: '' }));
                              }
                            }}
                            placeholder={`shop.${activeBusiness.slug}.et`}
                            className={`w-full px-3.5 py-2.5 rounded-xl border font-mono ${
                              tgSetupFieldErrors.custom_domain
                                ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}
                          />
                          {tgSetupFieldErrors.custom_domain && (
                            <p className="mt-1 text-[11px] font-semibold text-rose-600">
                              {tgSetupFieldErrors.custom_domain}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Connection Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3 cursor-pointer">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">Real-Time Webhook Sync</div>
                            <div className="text-[11px] text-slate-500">Sync orders, payments &amp; bot callbacks</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={tgWebhookActive}
                            onChange={(e) => setTgWebhookActive(e.target.checked)}
                            className="h-4 w-4 accent-sky-600 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3 cursor-pointer">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">Mini App &amp; Web Published</div>
                            <div className="text-[11px] text-slate-500">Allow live customer orders &amp; bookings</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={tgMiniAppPublished}
                            onChange={(e) => setTgMiniAppPublished(e.target.checked)}
                            className="h-4 w-4 accent-emerald-600 rounded"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={tgSetupSaving}
                          className="btn-3d-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-sm disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{tgSetupSaving ? 'Saving & Connecting...' : 'Save & Connect Telegram + Web'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={tgTestingConnection}
                          onClick={() => handleTestTelegramConnection(false)}
                          className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                        >
                          <Radio className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Quick Ping (No Buttons Alert)</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* RIGHT COLUMN (5 cols): Stylized Notification Studio (With Buttons & Without Buttons) */}
                  <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          <Bell className="h-3 w-3" />
                          Stylized Notification Studio
                        </span>
                        <h3 className="mt-1.5 text-sm font-display font-extrabold text-slate-900 dark:text-white">
                          2. Stylized Notifications (With or Without Buttons)
                        </h3>
                        <p className="text-slate-500 mt-0.5">
                          Choose whether notifications include interactive action buttons or appear as sleek, button-free status cards. Test both styles live below.
                        </p>
                      </div>
                    </div>

                    {/* Button Mode Selector */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Default Notification Layout Style
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'with_buttons', label: 'With Buttons', desc: 'Interactive CTAs' },
                          { id: 'without_buttons', label: 'Without Buttons', desc: 'Clean message only' },
                          { id: 'smart_auto', label: 'Smart Auto', desc: 'Buttons when needed' },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() =>
                              setNotifSettings((prev) => ({
                                ...prev,
                                button_mode: mode.id as 'with_buttons' | 'without_buttons' | 'smart_auto',
                              }))
                            }
                            className={`rounded-xl border p-2.5 text-left transition ${
                              notifSettings.button_mode === mode.id
                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-white ring-2 ring-indigo-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="font-extrabold text-xs">{mode.label}</div>
                            <div className="text-[10px] opacity-80 mt-0.5">{mode.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Instant 1-Click Live Notification Testers */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        Instant Live Test (See Stylized Banner Top of Screen)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={sendingTestNotif}
                          onClick={() =>
                            handleSendStylizedNotification({
                              withButtons: true,
                              preset: {
                                type: 'telegram',
                                tone: 'telegram',
                                title: `New Telegram Order & Bot Sync (${activeBusiness.name})`,
                                message: `Customer placed a verified order via ${tgBotUsername || activeBusiness.telegram_bot_username || '@StoreBot'}. Use the action buttons to inspect orders or preview the storefront.`,
                                buttons: [
                                  { label: 'View Orders & Payments', action: 'open_orders', variant: 'primary' },
                                  { label: 'Preview Storefront', action: 'preview_store', variant: 'emerald' },
                                  { label: 'Copy Mini App Link', action: 'copy_miniapp_url', variant: 'secondary' },
                                ],
                              },
                            })
                          }
                          className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 p-3 text-left transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sky-900 dark:text-sky-200">
                              Test WITH Buttons
                            </span>
                            <span className="rounded-full bg-sky-600 text-white px-2 py-0.5 text-[10px] font-bold">
                              3 Buttons
                            </span>
                          </div>
                          <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 mt-1">
                            Triggers a stylized notification card with interactive action buttons.
                          </p>
                        </button>

                        <button
                          type="button"
                          disabled={sendingTestNotif}
                          onClick={() =>
                            handleSendStylizedNotification({
                              withButtons: false,
                              preset: {
                                type: 'telegram',
                                tone: 'success',
                                title: `Telegram Webhook & Web SSL Healthy`,
                                message: `Clean stylized notification without action buttons — ${tgBotUsername || activeBusiness.telegram_bot_username || '@StoreBot'} and ${customDomainInput || activeBusiness.custom_domain || `telebiz.os/s/${activeBusiness.slug}`} are online.`,
                                buttons: [],
                              },
                            })
                          }
                          className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 p-3 text-left transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                              Test WITHOUT Buttons
                            </span>
                            <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                              No Buttons
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                            Triggers a sleek, button-free stylized notification banner.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Custom Stylized Notification Composer */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3.5 space-y-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Send Custom Stylized Notification
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={customNotifTitle}
                          onChange={(e) => setCustomNotifTitle(e.target.value)}
                          placeholder="Notification title..."
                          className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <select
                          value={customNotifTone}
                          onChange={(e) => setCustomNotifTone(e.target.value as any)}
                          className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                        >
                          <option value="telegram">Telegram Theme</option>
                          <option value="success">Emerald Success</option>
                          <option value="info">Indigo Info</option>
                          <option value="warning">Amber Warning</option>
                          <option value="error">Rose Alert</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={customNotifMessage}
                        onChange={(e) => setCustomNotifMessage(e.target.value)}
                        placeholder="Write your notification message..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={customNotifWithButtons}
                            onChange={(e) => setCustomNotifWithButtons(e.target.checked)}
                            className="h-4 w-4 accent-indigo-600 rounded"
                          />
                          <span>Include Action Buttons on Card</span>
                        </label>
                        <button
                          type="button"
                          disabled={sendingTestNotif}
                          onClick={() =>
                            handleSendStylizedNotification({
                              withButtons: customNotifWithButtons,
                            })
                          }
                          className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-extrabold hover:opacity-95 transition"
                        >
                          {customNotifWithButtons ? 'Send With Buttons' : 'Send Without Buttons'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
                onPreviewBusiness={(bizId) => {
                  setSelectedBusinessId(bizId);
                  setStorefrontCustomerOnly(false);
                  setFullStorefrontOpen(true);
                }}
                onEditBusinessCatalog={(bizId) => {
                  setSelectedBusinessId(bizId);
                  setActiveModule('commerce');
                }}
                onOpenCreateBusiness={() => setNewBizModalOpen(true)}
              />
            )}

            {/* MODULE 12: MORE HUB — MOVED ACTION BUTTONS + MY BUSINESS LIST + WORKSPACE TOOLS */}
            {activeModule === 'more' && (
              <div className="space-y-6">
                {/* 1. Moved Storefront & Platform Controls (The 4 Requested Buttons) */}
                <section className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                      Quick Store & Platform Actions
                    </div>
                    <h2 className="mt-0.5 text-base font-display font-extrabold text-slate-950 dark:text-white">
                      Store Creation, Entry Preview, Telegram Guide & Language
                    </h2>
                    <p className="text-xs text-slate-500">
                      Moved here from the storefront and header so your storefront preview and workspace remain clean and uncluttered.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Button 1: New Business App */}
                    <button
                      type="button"
                      onClick={() => setNewBizModalOpen(true)}
                      className="btn-3d-primary rounded-2xl p-4 text-left text-white flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-white" />
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                          Create
                        </span>
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-sm">New Business App</div>
                        <div className="text-[11px] text-indigo-100 mt-0.5">
                          Launch a new Telegram & Web store
                        </div>
                      </div>
                    </button>

                    {/* Button 2: Open Store for Entry Preview */}
                    <button
                      type="button"
                      onClick={() => {
                        setStorefrontCustomerOnly(false);
                        setFullStorefrontOpen(true);
                      }}
                      className="btn-3d-emerald rounded-2xl p-4 text-left text-white flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                          Live View
                        </span>
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-sm">Open Store for Entry Preview</div>
                        <div className="text-[11px] text-emerald-100 mt-0.5 truncate">
                          Preview {activeBusiness?.name || 'current store'}
                        </div>
                      </div>
                    </button>

                    {/* Button 3: How Store and Telegram Works */}
                    <button
                      type="button"
                      onClick={() => setLaunchGuideOpen(true)}
                      className="btn-3d-white rounded-2xl p-4 text-left flex flex-col justify-between gap-3 border-emerald-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Send className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Guide
                        </span>
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                          How Store & Telegram Works
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Step-by-step Telegram & channel setup
                        </div>
                      </div>
                    </button>

                    {/* Button 4: English / Language Button */}
                    <div className="card-3d rounded-2xl p-4 bg-slate-50/80 dark:bg-slate-950/60 flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Globe className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {LANGUAGE_LABELS[lang]}
                        </span>
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white mb-2">
                          Language ({LANGUAGE_LABELS[lang]})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(['en', 'am', 'om'] as LanguageCode[]).map((code) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => setLang(code)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                lang === code
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {LANGUAGE_LABELS[code]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. MY BUSINESS LIST ('Business' Section — Role-Aware: Admin sees all by Category + What They Sell; Store Owner sees ONLY their own store) */}
                <section className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                        <Building2 className="w-3.5 h-3.5" />
                        {currentUser?.platform_role === 'super_admin'
                          ? 'Platform Admin · Complete Business Directory by Category'
                          : 'Store Owner · My Isolated Business List'}
                      </div>
                      <h2 className="mt-0.5 text-lg font-display font-extrabold text-slate-950 dark:text-white">
                        {currentUser?.platform_role === 'super_admin'
                          ? `All Platform Businesses (${businesses.length} Stores)`
                          : `My Store (${businesses.length} Owned Store)`}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {currentUser?.platform_role === 'super_admin'
                          ? 'Filter businesses by category, click any store to preview its live page, inspect what they are selling, block/pause, delete, or add a new business.'
                          : 'Strict Role Isolation: As a Store Owner, you only see and manage the store(s) owned by your account. Other businesses on the platform are hidden.'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                      {currentUser?.platform_role === 'super_admin' && (
                        <button
                          type="button"
                          onClick={() => setActiveModule('superadmin')}
                          className="btn-3d-white px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 inline-flex items-center gap-1.5"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Manage Owners & Customers
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNewBizModalOpen(true)}
                        className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create New Store
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills (shown when Admin views all businesses across categories) */}
                  {currentUser?.platform_role === 'super_admin' && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'all', label: `All Categories (${businesses.length})` },
                        { id: 'retail', label: 'Retail & Boutique' },
                        { id: 'coffee_shop', label: 'Coffee & Roastery' },
                        { id: 'hotel', label: 'Hotel & Hospitality' },
                        { id: 'salon', label: 'Salon & Wellness' },
                        { id: 'restaurant', label: 'Restaurant & Dining' },
                        { id: 'real_estate', label: 'Real Estate' },
                      ].map((cat) => {
                        const count = cat.id === 'all' ? businesses.length : businesses.filter((b: any) => b.category === cat.id).length;
                        if (cat.id !== 'all' && count === 0) return null;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setAdminCategoryFilter(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              adminCategoryFilter === cat.id
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {cat.label} {cat.id !== 'all' ? `(${count})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/90 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/30">
                    {businesses
                      .filter((b: any) => currentUser?.platform_role !== 'super_admin' || adminCategoryFilter === 'all' || b.category === adminCategoryFilter)
                      .map((biz: any) => {
                        const isSelected = biz.id === selectedBusinessId;
                        const isPaused = biz.status === 'paused' || biz.status === 'suspended';
                        const isCatalogExpanded = expandedCatalogBizId === biz.id;
                        const catalogProducts = Array.isArray(biz.catalogProducts) ? biz.catalogProducts : [];
                        const catalogServices = Array.isArray(biz.catalogServices) ? biz.catalogServices : [];
                        return (
                          <div
                            key={biz.id}
                            className={`px-4 py-4 transition space-y-3 ${
                              isSelected
                                ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                                : 'hover:bg-white dark:hover:bg-slate-900/90'
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span
                                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-sm shadow-sm shrink-0"
                                  style={{ backgroundColor: biz.primary_color || '#4f46e5' }}
                                >
                                  {String(biz.name || 'B').slice(0, 2).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedBusinessId(biz.id);
                                        setStatusBanner(`Switched active business to "${biz.name}".`);
                                      }}
                                      className="font-display font-extrabold text-sm text-slate-950 dark:text-white hover:text-indigo-600 transition text-left"
                                    >
                                      {biz.name}
                                    </button>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {String(biz.category || 'retail').replace(/_/g, ' ')}
                                    </span>
                                    {isSelected && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-600 text-white">
                                        Active Store
                                      </span>
                                    )}
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        isPaused
                                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      }`}
                                    >
                                      {biz.status || 'active'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                                    {biz.owner_name && (
                                      <>
                                        <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{biz.owner_name}</strong> ({biz.owner_uid})</span>
                                        <span>·</span>
                                      </>
                                    )}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                                      {Number(biz.verifiedRevenue || 0).toLocaleString()} ETB sales
                                    </span>
                                    <span>·</span>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{biz.finishedOrdersCount ?? biz.paidOrdersCount ?? 0} finished</span>
                                    <span>·</span>
                                    <span className="text-amber-700 dark:text-amber-400 font-semibold">{biz.pendingPaymentRequestsCount ?? biz.pendingOrdersCount ?? 0} pay requests</span>
                                    <span>·</span>
                                    <span className="text-rose-600 dark:text-rose-400 font-semibold">{biz.rejectedOrdersCount ?? 0} rejected</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedCatalogBizId(isCatalogExpanded ? null : biz.id)}
                                  className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 text-indigo-700"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  {isCatalogExpanded ? 'Hide What They Sell' : `What They Sell (${catalogProducts.length + catalogServices.length})`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBusinessId(biz.id);
                                    setStorefrontCustomerOnly(false);
                                    setFullStorefrontOpen(true);
                                  }}
                                  className="btn-3d-emerald px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 text-white"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Preview Page
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBusinessId(biz.id);
                                    navigateToModule('builder');
                                  }}
                                  className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 text-indigo-700"
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  Edit Builder
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBusinessId(biz.id);
                                    navigateToModule('commerce');
                                  }}
                                  className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                                >
                                  <Package className="w-3.5 h-3.5 text-violet-600" />
                                  Products
                                </button>
                                {isPaused ? (
                                  <button
                                    type="button"
                                    onClick={() => handleBrandQuickAction(biz.id, 'resume')}
                                    className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 text-emerald-700"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    Unblock / Resume
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleBrandQuickAction(biz.id, 'pause')}
                                    className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 text-amber-700"
                                  >
                                    <PauseCircle className="w-3.5 h-3.5" />
                                    Block / Pause
                                  </button>
                                )}
                                {(currentUser?.platform_role === 'super_admin' || businesses.length > 1) && (
                                  <button
                                    type="button"
                                    onClick={() => handleBrandQuickAction(biz.id, 'delete')}
                                    className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 text-rose-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expandable "What They Are Selling" Catalog Drawer */}
                            {isCatalogExpanded && (
                              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    What {biz.name} Is Selling ({catalogProducts.length} Products · {catalogServices.length} Services)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedBusinessId(biz.id);
                                      setStorefrontCustomerOnly(false);
                                      setFullStorefrontOpen(true);
                                    }}
                                    className="text-xs font-bold text-emerald-600 hover:underline"
                                  >
                                    Open Full Storefront Preview →
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  {catalogProducts.map((prod: any) => (
                                    <div key={prod.id} className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
                                      {prod.image_url ? (
                                        <img src={prod.image_url} alt={prod.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-200" />
                                      ) : (
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                          {String(prod.name || 'P').slice(0, 1)}
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.name}</div>
                                        <div className="text-[10px] text-slate-500 truncate">{prod.category} · Stock: {prod.stock}</div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                                          {Number(prod.discount_price || prod.price || 0).toLocaleString()} ETB
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {catalogServices.map((svc: any) => (
                                    <div key={svc.id} className="flex items-center justify-between gap-2 p-2 rounded-xl border border-violet-200/70 dark:border-violet-900/40 bg-violet-50/30 dark:bg-violet-950/20">
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{svc.name}</div>
                                        <div className="text-[10px] text-violet-600 dark:text-violet-300">{svc.category} · {svc.duration_minutes} mins</div>
                                      </div>
                                      <div className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums shrink-0">
                                        {Number(svc.price || 0).toLocaleString()} ETB
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </section>

                {/* 3. Additional Workspace Tools & Administration */}
                <section className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      All Workspace Tools
                    </div>
                    <h3 className="mt-0.5 text-sm font-display font-extrabold text-slate-950 dark:text-white">
                      Jump to Any Business Management Section
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'commerce', label: t.commerce, desc: 'Add products, device photos & discounts', icon: Package },
                      { id: 'analytics', label: t.analytics, desc: 'Traffic, funnel & revenue analytics', icon: BarChart3 },
                      { id: 'team', label: t.teamBranches, desc: 'Employees, roles, branches & expenses', icon: Users },
                      { id: 'marketing', label: t.marketing, desc: 'Promo codes, loyalty & broadcasts', icon: Megaphone },
                      { id: 'telegram', label: t.telegramSetup, desc: 'Bot token, channel link & web domain', icon: Send },
                      { id: 'subscriptions', label: t.subscriptions, desc: 'Plans, billing & marketplace add-ons', icon: CreditCard },
                      ...(currentUser?.platform_role === 'super_admin'
                        ? [{ id: 'superadmin', label: t.superAdmin, desc: 'Platform-wide super administration', icon: ShieldAlert }]
                        : []),
                    ].map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => navigateToModule(tool.id as ActiveModule)}
                          className="card-3d rounded-2xl p-4 text-left bg-slate-50/70 dark:bg-slate-950/50 hover:bg-white transition flex items-start gap-3"
                        >
                          <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-display font-extrabold text-xs text-slate-950 dark:text-white">
                              {tool.label}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {tool.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
              </>
            )}
          </main>
        </div>
      )}

      {!fullStorefrontOpen && currentUser && (
        <nav className="telebiz-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-slate-200 bg-white/95 px-2 pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden" aria-label="Business navigation">
          {[
            { id: 'overview', label: 'Home', icon: LayoutDashboard },
            { id: 'builder', label: 'Builder', icon: Layers },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'support', label: 'Support', icon: MessageSquare },
            { id: 'more', label: 'More', icon: MoreHorizontal },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigateToModule(item.id as ActiveModule);
                }}
                aria-current={active ? 'page' : undefined}
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
      )}

      {/* MODAL: CREATE NEW BUSINESS MINI APP (WITH VISUAL TEMPLATES & LIVE PREVIEW) */}
      {newBizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-5 text-xs my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                  Instant Visual Storefront Generator
                </span>
                <h3 className="text-lg font-display font-extrabold text-slate-950 dark:text-white mt-0.5">
                  Create Your Business Storefront & Telegram Mini App
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Pick a visual template to create a private draft. Add your real products and payment details, connect Telegram, then publish when ready.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewBizModalOpen(false)}
                className="btn-3d-white inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold shrink-0"
                aria-label="Close create business modal"
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              {commerceError && (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {commerceError}
                </div>
              )}
              {/* STEP 1: STORE IDENTITY & CUSTOM STORE ID */}
              <div className="card-3d rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Step 1 — Store Name, Custom Store ID & Category</span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Clean Slate</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                      Store / Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newBizName}
                      onChange={(e) => {
                        setNewBizName(e.target.value);
                        if (!newBizSlug) {
                          setNewBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30));
                        }
                      }}
                      placeholder="e.g. Aurum Royal Jewelry, District Streetwear, Velvet Beauty, Kaffa Roast..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                      Custom Store ID / URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={newBizSlug}
                      onChange={(e) => setNewBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="e.g. aurum-chains or my-store-name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                      Store Category *
                    </label>
                    <select
                      value={newBizCategory}
                      onChange={(e) => setNewBizCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                    >
                      {BUSINESS_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                      Your Initial Product Categories (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newBizCustomCats}
                      onChange={(e) => setNewBizCustomCats(e.target.value)}
                      placeholder="e.g. Chains, Necklaces, Rings or Hoodies, Cargo Pants, Tees"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Store Deep Link:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-xs sm:max-w-md">
                    https://t.me/YourBot?startapp={newBizSlug || 'your-store-id'}
                  </span>
                </div>
              </div>

              {/* STEP 2: VISUAL AESTHETIC STYLE PRESETS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-xs text-slate-900 dark:text-white">
                    Step 2 — Visual Aesthetic & Palette Style (Fully Editable Anytime in Builder)
                  </label>
                  <span className="text-[10px] text-slate-400">Sets appearance only, never forces fake items</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'clean_modern',
                      title: 'Clean Minimal Studio',
                      sub: 'Crisp monochrome slate, high-contrast typography',
                      primary: '#0F172A',
                      accent: '#6366F1',
                      tag: 'Minimal & Contemporary',
                    },
                    {
                      id: 'luxury_chains_jewelry',
                      title: 'Luxe Onyx & Champagne',
                      sub: 'Rich dark tones & warm gold luster for jewelry & luxury',
                      primary: '#121214',
                      accent: '#D4AF37',
                      tag: 'Luxury & Jewelry',
                    },
                    {
                      id: 'baggy_streetwear',
                      title: 'Streetwear High-Contrast',
                      sub: 'Punchy cyber orange & heavy bold display',
                      primary: '#18181B',
                      accent: '#FF5500',
                      tag: 'Fashion Drop',
                    },
                    {
                      id: 'gourmet_food_roastery',
                      title: 'Warm Roastery & Artisan',
                      sub: 'Deep espresso & terracotta for food, canisters & coffee',
                      primary: '#24140E',
                      accent: '#C86432',
                      tag: 'Food & Roastery',
                    },
                    {
                      id: 'royal_boutique',
                      title: 'Heritage Emerald & Gold',
                      sub: 'Deep forest green with warm amber gold highlights',
                      primary: '#0F382A',
                      accent: '#C69C6D',
                      tag: 'Heritage & Culture',
                    },
                    {
                      id: 'digital_menu',
                      title: 'Modern Crimson & Amber',
                      sub: 'Appetizing deep ruby & warm amber for dining & quick order',
                      primary: '#450A0A',
                      accent: '#D97706',
                      tag: 'Dining & Menu',
                    },
                  ].map((tpl) => {
                    const selected = newBizTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setNewBizTemplate(tpl.id)}
                        className={`text-left rounded-2xl p-3 border transition flex flex-col justify-between ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div
                            className="rounded-xl p-2.5 mb-2 text-white flex items-center justify-between shadow-xs"
                            style={{ backgroundColor: tpl.primary }}
                          >
                            <span
                              className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs"
                              style={{ backgroundColor: tpl.accent, color: '#0F172A' }}
                            >
                              {tpl.tag}
                            </span>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tpl.accent }} />
                          </div>
                          <div className="font-display font-bold text-xs text-slate-900 dark:text-white">
                            {tpl.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {tpl.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: STORE DESCRIPTION & CONTACT */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                    Store Tagline & Description
                  </label>
                  <textarea
                    rows={2}
                    value={newBizDesc}
                    onChange={(e) => setNewBizDesc(e.target.value)}
                    placeholder="Enter what your business sells, authenticity promise, or delivery turnaround..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                      Store Contact Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={newBizPhone}
                      onChange={(e) => setNewBizPhone(e.target.value)}
                      placeholder="e.g. +251 911 000 000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs mb-1 text-slate-700 dark:text-slate-300">
                      Telegram Bot Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={newBizBot}
                      onChange={(e) => setNewBizBot(e.target.value)}
                      placeholder="@MyStoreBot"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-3">
                <span className="text-[11px] text-slate-500 font-medium">
                  ✨ <strong>Clean Slate Guarantee:</strong> Starts with 0 starter products. You add your real products &amp; prices.
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setNewBizModalOpen(false)}
                    className="btn-3d-white px-4 py-2.5 rounded-xl font-bold text-xs flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-3d-primary px-5 py-2.5 rounded-xl text-white font-extrabold text-xs flex-1 sm:flex-none"
                  >
                    Save &amp; Open Store Preview →
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE WALKTHROUGH — HOW STORE OWNERS SIGN UP, PREVIEW, PUBLISH & LINK TELEGRAM */}
      {launchGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-6 text-xs my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                  End-to-End Platform Playbook
                </span>
                <h3 className="text-lg font-display font-extrabold text-slate-950 dark:text-white mt-0.5">
                  How Store Owners Create, Preview, Publish & Connect to Telegram Channels
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLaunchGuideOpen(false)}
                className="btn-3d-white inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold shrink-0"
                aria-label="Close platform guide"
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-3d rounded-2xl p-4 bg-slate-50/80 dark:bg-slate-950/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-900 text-white font-extrabold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                    Sign Up & Automatic Visual Template
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Store owners register an account (or click <strong>+ Create New Business</strong>) and pick a visual template like <strong>Al-Saudia Luxury Boutique</strong>. The platform automatically generates their storefront with pre-built categories, 4 sample products (with sizes, color swatches, compare-at discounts), a booking service, and opens the <strong>Live Storefront Preview</strong> immediately.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLaunchGuideOpen(false);
                    setNewBizModalOpen(true);
                  }}
                  className="btn-3d-white px-3 py-1.5 rounded-xl font-bold text-emerald-800 mt-1"
                >
                  Try Creating a Store Now →
                </button>
              </div>

              <div className="card-3d rounded-2xl p-4 bg-slate-50/80 dark:bg-slate-950/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-900 text-white font-extrabold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                    Live Preview & Instant Customization
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Inside the Storefront Preview, owners can toggle between <strong>Interactive Storefront</strong> and the <strong>3-Screen Mobile Showcase (Photo View)</strong>. Using the top bar, they can click <strong>Quick Edit Theme & Colors</strong> right on the storefront to change their brand colors, fonts, or banner, or open <strong>Catalog</strong> to upload their own products and prices.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLaunchGuideOpen(false);
                    setFullStorefrontOpen(true);
                  }}
                  className="btn-3d-emerald px-3 py-1.5 rounded-xl font-bold text-white mt-1"
                >
                  Open Live Boutique Storefront →
                </button>
              </div>

              <div className="card-3d rounded-2xl p-4 bg-slate-50/80 dark:bg-slate-950/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-900 text-white font-extrabold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                    Publish & Link to Telegram Bot + Channel
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  When ready, the owner clicks <strong>Publish Store</strong> in the Builder, then goes to <strong>Telegram & Web Setup</strong>:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                  <li><strong>Telegram Bot Mini App:</strong> Enter their `@BotFather` bot username (e.g. `@AlSaudiaWearBot`) — customers tap the <strong>"Open Store"</strong> Menu Button inside Telegram chat.</li>
                  <li><strong>Telegram Channel Link:</strong> Enter their public channel (`@AlSaudiaOfficial`). Every product post in the channel gets a direct <strong>"🛍️ Shop in Mini App"</strong> button (`https://t.me/YourBot/app?startapp=store`).</li>
                  <li><strong>Web Link (No Telegram Needed):</strong> Share `{window.location.origin}/?store={activeBusiness?.slug || 'al-saudia-boutique'}` on Instagram, WhatsApp, or TikTok.</li>
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setLaunchGuideOpen(false);
                    setFullStorefrontOpen(false);
                    setActiveModule('telegram');
                  }}
                  className="btn-3d-white px-3 py-1.5 rounded-xl font-bold text-indigo-700 mt-1"
                >
                  Go to Telegram & Channel Setup →
                </button>
              </div>

              <div className="card-3d rounded-2xl p-4 bg-slate-50/80 dark:bg-slate-950/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-900 text-white font-extrabold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                    How Customers Engage & Buy
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Customers tap the link in the business’s Telegram Channel, Bot, or Web URL:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                  <li><strong>Screen 1 (Home):</strong> Browse the hero banner, category visual cards (`Thobes`, `Agal`, `Bishts`, `Jalabiyas`), and Best Sellers.</li>
                  <li><strong>Screen 2 (Category Grid):</strong> Filter by category pills, save favorites to Wishlist, or tap <strong>Add to Cart</strong>.</li>
                  <li><strong>Screen 3 (Product Detail):</strong> Inspect the 4-photo vertical gallery, pick their <strong>Size (S–XXL)</strong> and <strong>Color swatch</strong>, and tap <strong>Buy Now</strong>.</li>
                  <li><strong>Checkout & Tracking:</strong> Apply promo codes (`ROYAL25`), copy the store's payment account with 1 tap, submit their order, and track live delivery or chat with support!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STORE OWNER AUTHENTICATION (BETTER AUTH DESIGN) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 text-xs my-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  <Fingerprint className="w-3.5 h-3.5" />
                  Better Auth · Workspace Security
                </div>
                <h3 className="text-xl font-display font-extrabold text-slate-950 dark:text-white mt-0.5">
                  {authMode === 'login'
                    ? 'Sign In to Your Workspace'
                    : authMode === 'register'
                    ? 'Create Your Store Owner Account'
                    : authMode === 'telegram'
                    ? 'Continue with Telegram'
                    : 'Recover Account Access'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Store Owner workspace authentication. Log in to an existing account or sign up a new Store Owner with Google, Telegram, or Email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="btn-3d-white inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold shrink-0"
                aria-label="Cancel and close authentication modal"
                title="Cancel and close"
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Close</span>
              </button>
            </div>

            {/* Provider Buttons: Google & Telegram */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleContinueWithGoogleClick}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-xs text-xs group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Log In or Sign Up)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('telegram');
                  setAuthError('');
                  setAuthFieldErrors({});
                  setAuthSuccessMsg('');
                  if (authTgUsername.trim()) {
                    checkTelegramUsername(authTgUsername, true);
                  }
                }}
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border font-bold transition shadow-xs text-xs ${
                  authMode === 'telegram'
                    ? 'border-sky-500 bg-sky-600 text-white'
                    : 'border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/40'
                }`}
              >
                <Send className={`w-4 h-4 shrink-0 ${authMode === 'telegram' ? 'text-white' : 'text-sky-500'}`} />
                <span>Continue with Telegram (Direct Connect or @Handle)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
                or continue with email / username
              </span>
            </div>

            {/* Better Auth Tab Switcher */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthFieldErrors({});
                  setAuthSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition ${
                  authMode === 'login'
                    ? 'bg-slate-950 text-white shadow-xs dark:bg-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthFieldErrors({});
                  setAuthSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition ${
                  authMode === 'register'
                    ? 'bg-slate-950 text-white shadow-xs dark:bg-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('telegram');
                  setAuthError('');
                  setAuthFieldErrors({});
                  setAuthSuccessMsg('');
                  if (authTgUsername.trim()) {
                    checkTelegramUsername(authTgUsername, true);
                  }
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 ${
                  authMode === 'telegram'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>Telegram</span>
              </button>
            </div>

            {/* Unified Collective Validation & Field-Fix Checklist Banner */}
            {(authError || Object.keys(authFieldErrors).length > 0) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 space-y-2.5">
                <div className="flex items-start gap-2 font-extrabold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{authError || 'Please review and fix the highlighted fields below:'}</span>
                </div>
                {Object.keys(authFieldErrors).length > 0 && (
                  <div className="pl-6 space-y-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                      Collective Field Validation Report ({Object.keys(authFieldErrors).length}{' '}
                      {Object.keys(authFieldErrors).length === 1 ? 'field failed' : 'fields failed'}):
                    </div>
                    <ul className="space-y-1">
                      {authFieldErrors.telegram_username && (
                        <li className="flex items-start gap-1.5 bg-white/80 dark:bg-slate-900/70 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            Field 1 Failed
                          </span>
                          <div>
                            <strong className="text-rose-950 dark:text-white">Telegram Handle (@username):</strong>{' '}
                            {authFieldErrors.telegram_username}
                          </div>
                        </li>
                      )}
                      {authFieldErrors.name && (
                        <li className="flex items-start gap-1.5 bg-white/80 dark:bg-slate-900/70 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            Field 2 Failed
                          </span>
                          <div>
                            <strong className="text-rose-950 dark:text-white">Store Owner Name:</strong>{' '}
                            {authFieldErrors.name}
                          </div>
                        </li>
                      )}
                      {authFieldErrors.recovery_passcode && (
                        <li className="flex items-start gap-1.5 bg-white/80 dark:bg-slate-900/70 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            Field 3 Failed
                          </span>
                          <div>
                            <strong className="text-rose-950 dark:text-white">Secondary Recovery Passcode:</strong>{' '}
                            {authFieldErrors.recovery_passcode}
                          </div>
                        </li>
                      )}
                      {authFieldErrors.email && (
                        <li className="flex items-start gap-1.5 bg-white/80 dark:bg-slate-900/70 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            Email Failed
                          </span>
                          <div>
                            <strong className="text-rose-950 dark:text-white">Email Address:</strong>{' '}
                            {authFieldErrors.email}
                          </div>
                        </li>
                      )}
                      {authFieldErrors.identifier && (
                        <li className="flex items-start gap-1.5 bg-white/80 dark:bg-slate-900/70 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            Identifier Failed
                          </span>
                          <div>
                            <strong className="text-rose-950 dark:text-white">Account Identifier:</strong>{' '}
                            {authFieldErrors.identifier}
                          </div>
                        </li>
                      )}
                      {authFieldErrors.password && (
                        <li className="flex items-start gap-1.5 bg-white/80 dark:bg-slate-900/70 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            Password Failed
                          </span>
                          <div>
                            <strong className="text-rose-950 dark:text-white">Password / Passcode:</strong>{' '}
                            {authFieldErrors.password}
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5" noValidate>
              {authMode === 'login' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Email, Telegram @Handle, or Store Owner ID (`OWN-...`)
                      </label>
                      {loginVerifyStatus?.checking && (
                        <span className="text-[10px] font-bold text-indigo-600 animate-pulse">Checking account...</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={authEmail}
                      onChange={(e) => {
                        setAuthEmail(e.target.value);
                        if (authFieldErrors.identifier) {
                          setAuthFieldErrors((prev) => ({ ...prev, identifier: '' }));
                        }
                      }}
                      onBlur={() => {
                        if (authEmail.trim().length >= 3) {
                          checkLoginIdentifier(authEmail);
                        }
                      }}
                      placeholder="owner@yourbrand.com, @telegram_handle, or OWN-..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 font-medium ${
                        authFieldErrors.identifier
                          ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                          : loginVerifyStatus?.checked && loginVerifyStatus.exists
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      required
                    />
                    {authFieldErrors.identifier && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">{authFieldErrors.identifier}</p>
                    )}

                    {/* Real-Time Check Result based on what the user writes down */}
                    {loginVerifyStatus?.checked && loginVerifyStatus.exists && loginVerifyStatus.account && (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-extrabold text-emerald-950 dark:text-emerald-200">
                              Existing Account Verified:
                            </span>{' '}
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                              {loginVerifyStatus.account.name} ({loginVerifyStatus.account.owner_uid})
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                          Ready
                        </span>
                      </div>
                    )}

                    {loginVerifyStatus?.checked && !loginVerifyStatus.exists && authEmail.trim().length >= 3 && (
                      <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-[11px]">
                        <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold">No existing account found for &ldquo;{authEmail.trim()}&rdquo;.</span>{' '}
                            <span>If you are new, choose how you&apos;d like to create your Store Owner account below:</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pl-6">
                          <button
                            type="button"
                            onClick={() => {
                              const raw = authEmail.trim();
                              if (raw.startsWith('@') || !raw.includes('@')) {
                                setAuthTgUsername(raw.startsWith('@') ? raw : `@${raw}`);
                              }
                              setAuthMode('telegram');
                              setTgSubMode('signup');
                              setAuthError('');
                              setAuthFieldErrors({});
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[10px] inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Create with Telegram Manually</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthModalOpen(false);
                              setGoogleSubMode('signup');
                              setShowAddGoogleAccount(true);
                              if (authEmail.includes('@') && !authEmail.startsWith('@')) {
                                setCustomGoogleEmail(authEmail.trim());
                              }
                              setGooglePromptOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-[10px] inline-flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3 text-indigo-600" />
                            <span>Create with Google</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Password or Secondary Passcode
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('recover');
                          setAuthError('');
                          setAuthFieldErrors({});
                          setAuthValidationAttempted(false);
                          setAuthSuccessMsg('');
                        }}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => {
                        setAuthPassword(e.target.value);
                        if (authFieldErrors.password) {
                          setAuthFieldErrors((prev) => ({ ...prev, password: '' }));
                        }
                      }}
                      placeholder="Enter your password or secondary passcode"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 ${
                        authFieldErrors.password
                          ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      required
                    />
                    {authFieldErrors.password && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">{authFieldErrors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={authRememberMe}
                        onChange={(e) => setAuthRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                      />
                      <span>Remember identifier on this device</span>
                    </label>
                  </div>

                  <button type="submit" className="btn-3d-primary w-full py-3 rounded-xl text-white font-extrabold shadow-md">
                    Sign In to Store Owner Workspace →
                  </button>

                  {/* Clear Guide for Users Who Don't Have an Account Yet */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 space-y-2">
                    <div className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                      Don&apos;t have an account yet? Create one in seconds:
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      You can create a new Store Owner account manually with your <strong>Telegram @handle</strong> (plus your Store Owner Name &amp; Secondary Passcode) or <strong>Continue with Google</strong>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('telegram');
                          setTgSubMode('signup');
                          setAuthError('');
                          setAuthFieldErrors({});
                          setAuthSuccessMsg('');
                        }}
                        className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Create with Telegram Manually</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGoogleSubMode('signup');
                          setShowAddGoogleAccount(true);
                          setAuthError('');
                          setAuthFieldErrors({});
                          setGooglePromptOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 hover:bg-slate-50"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sign Up with Google</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {authMode === 'register' && (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100/80 dark:bg-slate-950/60 px-3 py-2 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
                      New Store Owner Registration
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthFieldErrors({});
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 dark:text-slate-300"
                      title="Cancel sign up and return to sign in"
                    >
                      <X className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cancel</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Store Owner Full Name *
                      </label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => {
                          setAuthName(e.target.value);
                          if (authFieldErrors.name) setAuthFieldErrors((p) => ({ ...p, name: '' }));
                        }}
                        placeholder="e.g. Tariq Al-Mansoor"
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 ${
                          authFieldErrors.name
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                        required
                      />
                      {authFieldErrors.name && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">{authFieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Telegram Handle (Optional)
                      </label>
                      <input
                        type="text"
                        value={authTgUsername}
                        onChange={(e) => {
                          setAuthTgUsername(e.target.value);
                          if (authFieldErrors.telegram_username) {
                            setAuthFieldErrors((p) => ({ ...p, telegram_username: '' }));
                          }
                        }}
                        placeholder="@your_telegram"
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 font-mono ${
                          authFieldErrors.telegram_username
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {authFieldErrors.telegram_username && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">{authFieldErrors.telegram_username}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => {
                          setAuthEmail(e.target.value);
                          if (authFieldErrors.email) setAuthFieldErrors((p) => ({ ...p, email: '' }));
                        }}
                        placeholder="owner@yourbrand.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 ${
                          authFieldErrors.email
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                        required
                      />
                      {authFieldErrors.email && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">{authFieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Primary Password *
                      </label>
                      <input
                        type="password"
                        minLength={6}
                        value={authPassword}
                        onChange={(e) => {
                          setAuthPassword(e.target.value);
                          if (authFieldErrors.password) setAuthFieldErrors((p) => ({ ...p, password: '' }));
                        }}
                        placeholder="Min 6 characters"
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 ${
                          authFieldErrors.password
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                        required
                      />
                      {authFieldErrors.password && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">{authFieldErrors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Secondary Recovery Passcode */}
                  <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        Secondary Recovery Passcode (Optional)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold">
                        Required · 8+ characters
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300">
                      Used to log in with your Telegram handle or recover your store account if you forget your password.
                    </p>
                    <input
                      type="password"
                      minLength={8}
                      required
                      value={authRecoveryPasscode}
                      onChange={(e) => {
                        setAuthRecoveryPasscode(e.target.value);
                        if (authFieldErrors.recovery_passcode) {
                          setAuthFieldErrors((p) => ({ ...p, recovery_passcode: '' }));
                        }
                      }}
                      placeholder="Create a separate recovery passcode (8+ characters)"
                      className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-950 font-mono tracking-widest text-xs ${
                        authFieldErrors.recovery_passcode
                          ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                          : 'border-indigo-200 dark:border-indigo-800'
                      }`}
                    />
                    {authFieldErrors.recovery_passcode && (
                      <p className="text-[10px] font-bold text-rose-600 mt-1">{authFieldErrors.recovery_passcode}</p>
                    )}
                  </div>

                  <button type="submit" className="btn-3d-emerald w-full py-3 rounded-xl text-white font-extrabold">
                    Create Store Owner Account &amp; Generate Unique ID →
                  </button>
                </>
              )}

              {authMode === 'telegram' && (
                <div className="space-y-3.5">
                  <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/30 p-3.5 space-y-2">
                    <div className="font-extrabold text-sky-950 dark:text-sky-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-sky-600" />
                        Telegram Store Owner Authentication
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-sky-600 text-white text-[9px] font-extrabold uppercase">
                          Verified Handshake
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setAuthError('');
                            setAuthFieldErrors({});
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-rose-600 border border-sky-200 dark:border-sky-800"
                          title="Cancel Telegram connect and go back"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Back</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Option 1:</strong> Direct connect &amp; verify via Telegram Bot.{' '}
                      <strong>Option 2:</strong> Fill out your Telegram Handle, Store Owner Name (required if new), and Secondary Passcode below.
                    </p>
                  </div>

                  {/* Option 1: Direct Connect & Verify via Telegram */}
                  {tgWaitingForSession ? (
                    <div className="rounded-2xl border-2 border-sky-400 bg-sky-50/90 dark:bg-slate-950 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm shrink-0">
                            <Send className="w-4 h-4 animate-bounce" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-sky-950 dark:text-white">
                              Telegram Direct Connect Session Active
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Session Key: <span className="font-mono font-bold">{tgAuthKey}</span> · Waiting for verification...
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTgWaitingForSession(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Cancel</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tgDirectVerifyUrl && (
                          <a
                            href={tgDirectVerifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-3d-primary py-2.5 px-3 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Open Verification Tab ↗</span>
                          </a>
                        )}
                        {tgRedirectUrl && (
                          <a
                            href={tgRedirectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-3d-white py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 dark:text-white flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5 text-sky-600" />
                            <span>Open {tgBotName || '@TeleBizStoreBot'} App ↗</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 text-center">
                        You can also complete verification directly using the 3-field form below — it automatically links to this active session.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={tgRedirectLoading}
                        onClick={async () => {
                          await handleStartTelegramRedirect();
                        }}
                        className="btn-3d-primary py-3 px-3 rounded-xl text-white font-extrabold flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 transition text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{tgRedirectLoading ? 'Connecting...' : 'Direct Connect via Telegram'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setAuthValidationAttempted(true);
                          setAuthError('');
                          setAuthSuccessMsg('');
                          let latestStatus = tgVerifyStatus;
                          if (authTgUsername.trim()) {
                            latestStatus = await checkTelegramUsername(authTgUsername, true);
                          }
                          const check = validateCollectiveOwnerFields({
                            telegramHandle: authTgUsername,
                            ownerName: authName,
                            recoveryPasscode: authRecoveryPasscode,
                            mode: 'telegram',
                            subMode: tgSubMode,
                            handleStatus: latestStatus,
                            requireTelegramHandle: true,
                            requirePasscode: true,
                          });
                          setAuthFieldErrors(check.fieldErrors);
                          if (!check.isValid) {
                            setAuthError(check.summaryMessage);
                          } else {
                            setAuthSuccessMsg(
                              'All 3 fields (Telegram Handle, Store Owner Name, and Secondary Passcode) passed pre-check validation!'
                            );
                          }
                        }}
                        className="btn-3d-white py-3 px-3 rounded-xl font-extrabold flex items-center justify-center gap-1.5 text-slate-800 dark:text-white text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Validate All 3 Fields</span>
                      </button>
                    </div>
                  )}

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Or fill out Telegram Handle, Owner Name &amp; Passcode
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  {/* Mode Selector for 3-Field Form: Auto-Detect / Log In (Existing) / Sign Up (New) */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setTgSubMode('auto');
                        setAuthError('');
                        setAuthFieldErrors({});
                        setAuthValidationAttempted(false);
                        setAuthSuccessMsg('');
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition ${
                        tgSubMode === 'auto'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Smart Auto-Detect
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTgSubMode('login');
                        setAuthError('');
                        setAuthFieldErrors({});
                        setAuthValidationAttempted(false);
                        setAuthSuccessMsg('');
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition ${
                        tgSubMode === 'login'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Log In (Existing)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTgSubMode('signup');
                        setAuthError('');
                        setAuthFieldErrors({});
                        setAuthValidationAttempted(false);
                        setAuthSuccessMsg('');
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition ${
                        tgSubMode === 'signup'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sign Up (New)
                    </button>
                  </div>

                  {/* FIELD 1: Telegram Handle (@username) with Real-Time Verification & Validation Highlighting */}
                  <div
                    className={`p-3 rounded-2xl border transition ${
                      authFieldErrors.telegram_username
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                        : authValidationAttempted && !authFieldErrors.telegram_username
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>1. Telegram Handle (`@username`) *</span>
                      </label>
                      {authFieldErrors.telegram_username ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold uppercase">
                          ✗ Invalid — Fix Field 1
                        </span>
                      ) : authValidationAttempted ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase">
                          ✓ Field 1 Valid
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">
                          3–32 chars (letters, numbers, _)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={authTgUsername}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAuthTgUsername(val);
                          setTgVerifyStatus(null);
                          setAuthSuccessMsg('');
                          if (authFieldErrors.telegram_username) {
                            setAuthFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.telegram_username;
                              return copy;
                            });
                          }
                        }}
                        onBlur={() => {
                          if (authTgUsername.trim()) {
                            checkTelegramUsername(authTgUsername);
                          }
                        }}
                        placeholder="@your_telegram_username"
                        className={`flex-1 px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 font-mono text-xs ${
                          authFieldErrors.telegram_username
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                            : (tgVerifyStatus?.checked && tgVerifyStatus.validFormat) ||
                              (authValidationAttempted && !authFieldErrors.telegram_username)
                            ? 'border-2 border-emerald-500'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => checkTelegramUsername(authTgUsername)}
                        disabled={!authTgUsername.trim() || Boolean(tgVerifyStatus?.checking)}
                        className="btn-3d-white px-3 py-2 rounded-xl font-bold text-[11px] shrink-0 disabled:opacity-50"
                      >
                        {tgVerifyStatus?.checking ? 'Checking...' : 'Check @Handle'}
                      </button>
                    </div>

                    {authFieldErrors.telegram_username && (
                      <div className="mt-1.5 p-2 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-[11px] font-bold text-rose-700 dark:text-rose-200 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{authFieldErrors.telegram_username}</span>
                      </div>
                    )}

                    {/* Real-Time Verification Badge for Telegram Handle */}
                    {tgVerifyStatus?.checked && tgVerifyStatus.validFormat && !authFieldErrors.telegram_username && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border text-[11px] font-semibold flex items-start justify-between gap-2 ${
                          tgVerifyStatus.exists
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                        }`}
                      >
                        {tgVerifyStatus.exists && tgVerifyStatus.account ? (
                          <div>
                            <div className="font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                Existing Account Found: {tgVerifyStatus.account.name} ({tgVerifyStatus.account.owner_uid})
                              </span>
                            </div>
                            <p className="text-[10px] mt-0.5 opacity-90">
                              Enter your <strong>Secondary Passcode</strong> in Field 3 below to log in. (Store Owner Name is already saved.)
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="font-extrabold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>New Telegram Handle ({tgVerifyStatus.normalizedHandle}) Available!</span>
                            </div>
                            <p className="text-[10px] mt-0.5 opacity-90">
                              Because this handle is new, you <strong>must write your Store Owner Name</strong> in Field 2 and set a <strong>Secondary Passcode</strong> in Field 3.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FIELDS 2 & 3: Store Owner Name & Secondary Passcode with Explicit Per-Field Validation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* FIELD 2: Store Owner Name */}
                    <div
                      className={`p-3 rounded-2xl border transition ${
                        authFieldErrors.name
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                          : authValidationAttempted && !authFieldErrors.name
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <label className="font-extrabold text-slate-800 dark:text-slate-200">
                          2. Store Owner Name
                        </label>
                        {authFieldErrors.name ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            ✗ Fix Field 2
                          </span>
                        ) : authValidationAttempted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            ✓ Valid
                          </span>
                        ) : tgSubMode === 'signup' || (tgVerifyStatus?.checked && !tgVerifyStatus.exists) ? (
                          <span className="text-rose-600 text-[10px] font-extrabold shrink-0">* Required (New)</span>
                        ) : tgVerifyStatus?.checked && tgVerifyStatus.exists ? (
                          <span className="text-emerald-600 text-[10px] font-bold shrink-0">Saved on Account</span>
                        ) : (
                          <span className="text-indigo-600 text-[10px] font-bold shrink-0">Required if New</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => {
                          setAuthName(e.target.value);
                          setAuthSuccessMsg('');
                          if (authFieldErrors.name) {
                            setAuthFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.name;
                              return copy;
                            });
                          }
                        }}
                        placeholder={
                          tgVerifyStatus?.checked && tgVerifyStatus.exists && tgVerifyStatus.account
                            ? tgVerifyStatus.account.name
                            : 'Write Store Owner Name (Required if new)'
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-xs ${
                          authFieldErrors.name
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                            : authValidationAttempted && !authFieldErrors.name
                            ? 'border-2 border-emerald-500'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {authFieldErrors.name && (
                        <div className="mt-1.5 p-2 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-[10px] font-bold text-rose-700 dark:text-rose-200 flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{authFieldErrors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* FIELD 3: Secondary Recovery Passcode */}
                    <div
                      className={`p-3 rounded-2xl border transition ${
                        authFieldErrors.recovery_passcode
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                          : authValidationAttempted && !authFieldErrors.recovery_passcode
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <label className="font-extrabold text-slate-800 dark:text-slate-200">
                          3. Secondary Passcode *
                        </label>
                        {authFieldErrors.recovery_passcode ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            ✗ Fix Field 3
                          </span>
                        ) : authValidationAttempted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase shrink-0">
                            ✓ Valid
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-semibold shrink-0">8+ characters for new accounts</span>
                        )}
                      </div>
                      <input
                        type="password"
                        value={authRecoveryPasscode}
                        onChange={(e) => {
                          setAuthRecoveryPasscode(e.target.value);
                          setAuthSuccessMsg('');
                          if (authFieldErrors.recovery_passcode) {
                            setAuthFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.recovery_passcode;
                              return copy;
                            });
                          }
                        }}
                        placeholder={
                          tgVerifyStatus?.checked && tgVerifyStatus.exists
                            ? 'Enter your account passcode'
                            : 'Enter 8+ characters for a new account'
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 font-mono text-xs ${
                          authFieldErrors.recovery_passcode
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                            : authValidationAttempted && !authFieldErrors.recovery_passcode
                            ? 'border-2 border-emerald-500'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {authFieldErrors.recovery_passcode && (
                        <div className="mt-1.5 p-2 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-[10px] font-bold text-rose-700 dark:text-rose-200 flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{authFieldErrors.recovery_passcode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-3d-primary w-full py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 text-white shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {tgSubMode === 'login' || (tgVerifyStatus?.checked && tgVerifyStatus.exists && tgSubMode !== 'signup')
                        ? 'Verify Passcode & Log In with Telegram →'
                        : tgSubMode === 'signup' || (tgVerifyStatus?.checked && !tgVerifyStatus.exists)
                        ? 'Create New Store Owner with Telegram →'
                        : 'Verify & Continue with Telegram →'}
                    </span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthFieldErrors({});
                        setAuthValidationAttempted(false);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      ← Back to Email Sign In
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'recover' && (
                <>
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-extrabold text-amber-950 dark:text-amber-200">
                        Recover Your Account Access
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setAuthError('');
                          setAuthFieldErrors({});
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/80 dark:bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-rose-600 border border-amber-200 dark:border-amber-800"
                      >
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Enter your Email, Telegram @Handle, or Store Owner ID (`OWN-...`) along with your Secondary Recovery Passcode.
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email, Telegram @Handle, or Store Owner ID (`OWN-...`)
                    </label>
                    <input
                      type="text"
                      value={authEmail}
                      onChange={(e) => {
                        setAuthEmail(e.target.value);
                        if (authFieldErrors.identifier) setAuthFieldErrors((p) => ({ ...p, identifier: '' }));
                      }}
                      placeholder="Enter your email, @telegram_handle, or OWN-..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 ${
                        authFieldErrors.identifier ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      required
                    />
                    {authFieldErrors.identifier && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">{authFieldErrors.identifier}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Secondary Recovery Passcode
                      </label>
                      <input
                        type="password"
                        value={authRecoveryPasscode}
                        onChange={(e) => {
                          setAuthRecoveryPasscode(e.target.value);
                          if (authFieldErrors.recovery_passcode) {
                            setAuthFieldErrors((p) => ({ ...p, recovery_passcode: '' }));
                          }
                        }}
                        placeholder="Enter your recovery passcode"
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 font-mono ${
                          authFieldErrors.recovery_passcode
                            ? 'border-rose-400 bg-rose-50/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                        required
                      />
                      {authFieldErrors.recovery_passcode && (
                        <p className="text-[11px] font-bold text-rose-600 mt-1">{authFieldErrors.recovery_passcode}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Set New Password (Optional)
                      </label>
                      <input
                        type="password"
                        minLength={8}
                        value={authRecoverNewPassword}
                        onChange={(e) => setAuthRecoverNewPassword(e.target.value)}
                        placeholder="New password (minimum 8 characters)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-3d-dark w-full py-3 rounded-xl text-white font-extrabold shadow-md">
                    Verify Recovery Passcode &amp; Restore Account →
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthFieldErrors({});
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* GOOGLE ACCOUNT CHOOSER & LOG IN / SIGN UP MODAL */}
      {googlePromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Continue with Google</h4>
                  <p className="text-[11px] text-slate-500">Use Google's secure account chooser to sign in or create an account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGooglePromptOpen(false);
                  setShowAddGoogleAccount(false);
                  setAuthError('');
                  setAuthFieldErrors({});
                }}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(authError || Object.keys(authFieldErrors).length > 0) && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 space-y-1.5">
                <div className="font-extrabold text-[11px] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{authError || 'Please fix the highlighted fields below:'}</span>
                </div>
                {Object.keys(authFieldErrors).length > 0 && (
                  <ul className="list-disc pl-5 text-[10px] font-semibold space-y-0.5">
                    {authFieldErrors.email && <li><strong>Google Email:</strong> {authFieldErrors.email}</li>}
                    {authFieldErrors.name && <li><strong>Store Owner Name:</strong> {authFieldErrors.name}</li>}
                    {authFieldErrors.telegram_username && <li><strong>Telegram Handle:</strong> {authFieldErrors.telegram_username}</li>}
                    {authFieldErrors.recovery_passcode && <li><strong>Secondary Passcode:</strong> {authFieldErrors.recovery_passcode}</li>}
                  </ul>
                )}
              </div>
            )}

            {/* Two Direct Connect Options + Manual Log In / Sign Up Switcher */}
            {!showAddGoogleAccount && (
              <div className="space-y-3">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Option 1 · Direct Connect with Saved Google Account
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {savedGoogleAccounts.map((acc) => {
                    const initials = (acc.name || acc.email || 'G').slice(0, 2).toUpperCase();
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        disabled={googleAuthLoading}
                        onClick={() =>
                          handleGoogleAuth(acc.email, acc.name, {
                            directConnect: true,
                            intent: 'auto',
                          })
                        }
                        className="w-full text-left px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {acc.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          Direct Connect →
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pt-1">
                  Option 2 · Choose a Google Account
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSubMode('login');
                      setShowAddGoogleAccount(true);
                      setAuthError('');
                      setAuthFieldErrors({});
                    }}
                    className="btn-3d-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Continue with Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSubMode('signup');
                      setShowAddGoogleAccount(true);
                      setAuthError('');
                      setAuthFieldErrors({});
                    }}
                    className="btn-3d-primary py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Choose Google Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* Google Log In vs. Sign Up Form */}
            {showAddGoogleAccount && (
              <div className="space-y-3">
                {/* Mode Tabs: Log In vs. Sign Up */}
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSubMode('login');
                      setAuthError('');
                      setAuthFieldErrors({});
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition ${
                      googleSubMode === 'login'
                        ? 'bg-slate-950 text-white dark:bg-indigo-600 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Log In (Existing)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSubMode('signup');
                      setAuthError('');
                      setAuthFieldErrors({});
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition ${
                      googleSubMode === 'signup'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Sign Up (New Store Owner)
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Google account email (display hint only)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => {
                        setCustomGoogleEmail(e.target.value);
                        setGoogleVerifyStatus(null);
                        if (authFieldErrors.email) {
                          setAuthFieldErrors((p) => {
                            const c = { ...p };
                            delete c.email;
                            return c;
                          });
                        }
                      }}
                      onBlur={() => {
                        if (customGoogleEmail.trim()) {
                          checkGoogleEmail(customGoogleEmail);
                        }
                      }}
                      placeholder="yourname@gmail.com"
                      className={`flex-1 px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-xs font-medium ${
                        authFieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => checkGoogleEmail(customGoogleEmail)}
                      disabled={!customGoogleEmail.trim() || Boolean(googleVerifyStatus?.checking)}
                      className="btn-3d-white px-3 py-2 rounded-xl font-bold text-[11px] shrink-0 disabled:opacity-50"
                    >
                      {googleVerifyStatus?.checking ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                  {authFieldErrors.email && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">{authFieldErrors.email}</p>
                  )}

                  {googleVerifyStatus?.checked && googleVerifyStatus.validFormat && !authFieldErrors.email && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl border text-[11px] font-semibold ${
                        googleVerifyStatus.exists
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                      }`}
                    >
                      {googleVerifyStatus.exists && googleVerifyStatus.account ? (
                        <div>
                          <strong>✓ Existing Google Account:</strong> {googleVerifyStatus.account.name} (
                          {googleVerifyStatus.account.owner_uid}). Ready to log in!
                        </div>
                      ) : (
                        <div>
                          <strong>✨ New Google Account:</strong> Please write your <strong>Store Owner Name</strong> below to complete registration.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {(googleSubMode === 'signup' || (googleVerifyStatus?.checked && !googleVerifyStatus.exists)) && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Store Owner Name <span className="text-rose-600 font-extrabold">* (Required for New Account)</span>
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => {
                        setCustomGoogleName(e.target.value);
                        if (authFieldErrors.name) {
                          setAuthFieldErrors((p) => {
                            const c = { ...p };
                            delete c.name;
                            return c;
                          });
                        }
                      }}
                      placeholder="Your Full Name or Store Brand"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-xs ${
                        authFieldErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {authFieldErrors.name && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">{authFieldErrors.name}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Telegram Handle (Optional)
                    </label>
                    <input
                      type="text"
                      value={customGoogleTg}
                      onChange={(e) => {
                        setCustomGoogleTg(e.target.value);
                        if (authFieldErrors.telegram_username) {
                          setAuthFieldErrors((p) => {
                            const c = { ...p };
                            delete c.telegram_username;
                            return c;
                          });
                        }
                      }}
                      placeholder="@your_telegram"
                      className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-950 font-mono text-xs ${
                        authFieldErrors.telegram_username
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Recovery passcode can be set after Google sign-in
                    </label>
                    <input
                      type="password"
                      value={customGooglePasscode}
                      onChange={(e) => {
                        setCustomGooglePasscode(e.target.value);
                        if (authFieldErrors.recovery_passcode) {
                          setAuthFieldErrors((p) => {
                            const c = { ...p };
                            delete c.recovery_passcode;
                            return c;
                          });
                        }
                      }}
                      placeholder="Set a recovery passcode after sign-in"
                      className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-950 font-mono text-xs ${
                        authFieldErrors.recovery_passcode
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGoogleAccount(false);
                      setAuthError('');
                      setAuthFieldErrors({});
                    }}
                    className="btn-3d-white px-3.5 py-2.5 rounded-xl font-bold text-xs"
                  >
                    ← Direct Connect List
                  </button>
                  <button
                    type="button"
                    disabled={googleAuthLoading}
                    onClick={() =>
                      handleGoogleAuth(customGoogleEmail, customGoogleName, {
                        directConnect: false,
                        intent: googleSubMode,
                        passcode: customGooglePasscode,
                        telegramHandle: customGoogleTg,
                      })
                    }
                    className="btn-3d-primary px-5 py-2.5 rounded-xl font-bold text-white disabled:opacity-50"
                  >
                    {googleAuthLoading
                      ? 'Verifying...'
                      : googleSubMode === 'signup'
                      ? 'Sign Up with Google →'
                      : 'Log In with Google →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORGANIZED MENU & SETTINGS DRAWER (Language, Workspace Fonts, Admin Profile, Password, Passcode, Co-Admins) */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full overflow-y-auto p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-display font-extrabold text-slate-950 dark:text-white">
                    Platform Menu & Account Settings
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Languages, typography, admin account credentials, passcode lock & co-admins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuDrawerOpen(false)}
                className="btn-3d-white inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold shrink-0"
                aria-label="Close settings menu"
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Close</span>
              </button>
            </div>

            {/* Menu Navigation Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'general', label: 'Language & Fonts', icon: Globe },
                { id: 'account', label: 'Admin Account', icon: Users },
                { id: 'security', label: 'Password & PIN', icon: KeyRound },
                { id: 'admins', label: 'Add Co-Admin', icon: UserPlus },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = menuTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMenuTab(tab.id as any);
                      setSettingsError('');
                      setSettingsMessage('');
                    }}
                    className={
                      active
                        ? 'btn-3d-primary py-2.5 px-3 rounded-xl font-bold text-white flex items-center justify-center gap-1.5'
                        : 'btn-3d-white py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5'
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {settingsMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center justify-between">
                <span>{settingsMessage}</span>
                <button type="button" onClick={() => setSettingsMessage('')} className="underline">Dismiss</button>
              </div>
            )}
            {settingsError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center justify-between">
                <span>{settingsError}</span>
                <button type="button" onClick={() => setSettingsError('')} className="underline">Dismiss</button>
              </div>
            )}

            {/* TAB 1: LANGUAGE, WORKSPACE FONTS & ROLE SWITCHER */}
            {menuTab === 'general' && (
              <div className="space-y-5">
                <div className="card-3d rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                    Platform Language (ቋንቋ / Afaan)
                  </div>
                  <p className="text-slate-500">
                    Choose your preferred operating language across menus and dashboards.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['en', 'am', 'om'] as LanguageCode[]).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleLanguageChange(code)}
                        className={
                          lang === code
                            ? 'btn-3d-primary py-3 px-3 rounded-xl font-bold text-white text-center'
                            : 'btn-3d-white py-3 px-3 rounded-xl font-bold text-center'
                        }
                      >
                        {LANGUAGE_LABELS[code]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card-3d rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Workspace Typography & Font Style
                  </div>
                  <p className="text-slate-500">
                    Customize the font style of your entire operating dashboard. (You can also set individual store fonts in the Builder.)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'jakarta', name: 'Plus Jakarta Sans', desc: 'Modern Geometric Tech' },
                      { id: 'outfit', name: 'Outfit Display', desc: 'Bold Rounded Contemporary' },
                      { id: 'playfair', name: 'Playfair Display', desc: 'Luxury Editorial Serif' },
                      { id: 'fraunces', name: 'Fraunces Soft Serif', desc: 'Artisanal Hospitality' },
                      { id: 'space', name: 'Space Grotesk', desc: 'Crisp Technical Studio' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setWorkspaceFont(f.id as any)}
                        className={`text-left p-3 rounded-xl border transition ${
                          workspaceFont === f.id
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 font-bold ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-950 dark:text-white">{f.name}</div>
                        <div className="text-[11px] text-slate-500">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {availableAccounts.length > 0 && (
                  <div className="card-3d rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                    <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                      Quick Account / Role Switcher
                    </div>
                    <p className="text-slate-500">
                      Switch between Super Admin and Business Owner accounts or sign in with another account.
                    </p>
                    <div className="space-y-2">
                      {availableAccounts.map((acc: any) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleSwitchDemoAccount(acc.id)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${
                            currentUser?.id === acc.id
                              ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 font-bold'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-950 dark:text-white">{acc.name}</div>
                            <div className="text-[11px] text-slate-500">{acc.email}</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
                            {acc.platform_role}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuDrawerOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="btn-3d-white w-full py-2.5 rounded-xl font-bold text-center"
                    >
                      Sign In / Register Another Account
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADMIN / OWNER PROFILE */}
            {menuTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="card-3d rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 space-y-4">
                <div>
                  <h4 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">
                    Change Admin / Owner Name & Account Details
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Update your display name, login email address, and Telegram handle.
                  </p>
                </div>
                <div>
                  <label className="block font-bold mb-1">Admin / Owner Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileNameInput}
                    onChange={(e) => setProfileNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Account Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmailInput}
                    onChange={(e) => setProfileEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Telegram Username</label>
                  <input
                    type="text"
                    value={profileTgInput}
                    onChange={(e) => setProfileTgInput(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <button type="submit" className="btn-3d-primary w-full py-2.5 rounded-xl font-bold text-white">
                  Save Admin Profile Changes
                </button>
              </form>
            )}

            {/* TAB 3: PASSWORD & PASSCODE LOCK */}
            {menuTab === 'security' && (
              <div className="space-y-5">
                <form onSubmit={handleSaveRecoveryPasscode} className="card-3d rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div>
                    <h4 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">Account Recovery Passcode</h4>
                    <p className="text-slate-500">Set a separate 8+ character code to recover access if you lose your sign-in method.</p>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">New Recovery Passcode</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={recoveryPasscodeInput}
                      onChange={(e) => setRecoveryPasscodeInput(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Enter a separate recovery code"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Recovery Hint (optional)</label>
                    <input
                      type="text"
                      maxLength={120}
                      value={recoveryHintInput}
                      onChange={(e) => setRecoveryHintInput(e.target.value)}
                      placeholder="A hint only you understand"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <button type="submit" className="btn-3d-primary w-full py-2.5 rounded-xl font-bold text-white">
                    Save Recovery Passcode
                  </button>
                </form>

                <form onSubmit={handleChangePassword} className="card-3d rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div>
                    <h4 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">
                      Change Account Password
                    </h4>
                    <p className="text-slate-500">Update your login password at any time.</p>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Current Password (required for password accounts)</label>
                    <input
                      type="password"
                      required={currentUser?.auth_provider === 'email'}
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">New Password (minimum 8 characters)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <button type="submit" className="btn-3d-dark w-full py-2.5 rounded-xl font-bold text-white">
                    Update Password
                  </button>
                </form>

                <div className="card-3d rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">
                        Security Passcode / Quick PIN Lock
                      </h4>
                      <p className="text-slate-500">
                        Set a 4 to 6 digit passcode to lock your admin screen when stepping away.
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        currentUser?.has_passcode
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {currentUser?.has_passcode ? 'PIN Active' : 'No PIN Set'}
                    </span>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">4–6 Digit Security Passcode</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 2026"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono tracking-widest text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSavePasscode('set')}
                      className="btn-3d-primary flex-1 py-2.5 rounded-xl font-bold text-white"
                    >
                      {currentUser?.has_passcode ? 'Update Passcode' : 'Enable Passcode Lock'}
                    </button>
                    {currentUser?.has_passcode && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuDrawerOpen(false);
                            setIsPasscodeLocked(true);
                          }}
                          className="btn-3d-white px-4 py-2.5 rounded-xl font-bold text-amber-700"
                        >
                          Lock Screen Now
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSavePasscode('clear')}
                          className="btn-3d-white px-4 py-2.5 rounded-xl font-bold text-rose-600"
                        >
                          Remove PIN
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ADD PLATFORM CO-ADMINS */}
            {menuTab === 'admins' && (
              <div className="space-y-5">
                <form onSubmit={handleAddCoAdmin} className="card-3d rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div>
                    <h4 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">
                      Add New Admin to Control Platform
                    </h4>
                    <p className="text-slate-500">
                      Create an additional administrator account with full platform & store management access.
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      value={coAdminName}
                      onChange={(e) => setCoAdminName(e.target.value)}
                      placeholder="e.g. Dawit Bekele"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={coAdminEmail}
                      onChange={(e) => setCoAdminEmail(e.target.value)}
                      placeholder="dawit@telebiz.os"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Initial Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={coAdminPassword}
                      onChange={(e) => setCoAdminPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <button type="submit" className="btn-3d-primary w-full py-2.5 rounded-xl font-bold text-white">
                    Create Platform Administrator
                  </button>
                </form>

                <div className="card-3d rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
                    Active Platform Administrators ({coAdminsList.length})
                  </div>
                  <div className="space-y-2">
                    {coAdminsList.map((adm: any) => (
                      <div
                        key={adm.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <div>
                          <div className="font-bold text-slate-950 dark:text-white">{adm.name}</div>
                          <div className="text-[11px] text-slate-500">{adm.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSwitchDemoAccount(adm.id)}
                          className="btn-3d-white px-3 py-1.5 rounded-lg text-[11px] font-bold"
                        >
                          Switch to Admin
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3-ROLE RECOGNITION & ISOLATION ALGORITHM EXPLANATION MODAL */}
      {roleGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  3-Tier Role-Based Access Control (RBAC) & Tenant Isolation
                </div>
                <h3 className="mt-1 text-lg font-display font-extrabold text-slate-950 dark:text-white">
                  How the Algorithm Recognizes & Separates Admin, Store Owners & Customers
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleGuideModalOpen(false)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-2">
                <div className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-[10px] uppercase w-fit">
                  1. Platform Admin (Owner)
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Database Role: <code className="text-indigo-600">platform_role = &apos;super_admin&apos;</code>
                </div>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                  <li>Unrestricted SQL query across all tenants (<code className="font-mono">SELECT * FROM businesses</code>).</li>
                  <li>Filters business lists by <strong>Category</strong> (Retail, Coffee, Hotel, Salon, Restaurant, Real Estate).</li>
                  <li>Clicks any business to preview its storefront page and inspect <strong>what they are selling</strong>.</li>
                  <li>Can <strong>Block/Suspend</strong>, <strong>Add</strong>, or <strong>Delete</strong> any business, Store Owner, or Customer.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30 space-y-2">
                <div className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] uppercase w-fit">
                  2. Store Owners
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Database Role: <code className="text-emerald-600">platform_role = &apos;user&apos;</code> + <code className="text-emerald-600">OWN-...</code> ID
                </div>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                  <li>Every backend query enforces <code className="font-mono">WHERE b.owner_id = req.user.id</code> via <code className="font-mono">verifyTenantAccess</code>.</li>
                  <li>Sees <strong>ONLY their own store(s)</strong> — never other businesses on the platform.</li>
                  <li>Sees their sales report, <strong>Payment Request data</strong>, <strong>Finished orders</strong>, <strong>Rejected orders</strong>, Customer Messages, Categories, and Store Builder.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30 space-y-2">
                <div className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-extrabold text-[10px] uppercase w-fit">
                  3. Store Customers
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Public Mini App Scope + <code className="text-amber-600">CUS-247-...</code> ID
                </div>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                  <li>Accesses only public storefront routes (<code className="font-mono">/api/storefront/:slug</code>) scoped to a single store&apos;s <code className="font-mono">business_id</code>.</li>
                  <li>Identified 24/7 by automatic <code className="font-mono">CUS-247-...</code> token without needing a password.</li>
                  <li>Can browse products, add to cart, submit payment transfer references, and message store support — zero access to owner or admin tools.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRoleGuideModalOpen(false)}
                className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED FULL PRODUCT MODAL (ADD & EDIT WITH DEVICE PHOTO UPLOAD & WEBP OPTIMIZATION) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  <Package className="w-3.5 h-3.5" />
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
                </div>
                <h3 className="mt-0.5 text-lg font-display font-extrabold text-slate-950 dark:text-white">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'New Product with Photos & Pricing'}
                </h3>
                <p className="text-xs text-slate-500">
                  Upload photos from your device (WebP compressed & deduplicated), set price, discount, and inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {commerceError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
                <span>{commerceError}</span>
                <button type="button" onClick={() => setCommerceError('')} className="underline">Dismiss</button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
              {/* Photo Upload Box */}
              <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-indigo-600" />
                    Product Photos (Upload from Device)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Auto WebP + Deduplication
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{photoUploading ? 'Optimizing & Uploading...' : 'Upload Photos from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => compressAndUploadDevicePhotos(e.target.files, editingProduct ? 'edit' : 'new')}
                    />
                  </label>
                  {(editingProduct ? editingProduct.image_url : prodImageUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editingProduct) {
                          setEditingProduct({ ...editingProduct, image_url: '', gallery: [] });
                        } else {
                          setProdImageUrl('');
                          setProdGallery([]);
                        }
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Clear Photos
                    </button>
                  )}
                </div>

                {/* Uploaded Gallery Thumbnails */}
                {((editingProduct ? (editingProduct.gallery?.length ? editingProduct.gallery : [editingProduct.image_url]) : prodGallery.length ? prodGallery : [prodImageUrl]).filter(Boolean).length > 0) && (
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                    {(editingProduct ? (editingProduct.gallery?.length ? editingProduct.gallery : [editingProduct.image_url]) : prodGallery).filter(Boolean).map((url: string, idx: number) => {
                      const isMain = editingProduct ? editingProduct.image_url === url : prodImageUrl === url;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (editingProduct) setEditingProduct({ ...editingProduct, image_url: url });
                            else setProdImageUrl(url);
                          }}
                          className={`relative rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                            isMain ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <img src={url} alt={`Upload ${idx + 1}`} className="h-16 w-16 object-cover" />
                          {isMain && (
                            <span className="absolute bottom-0 inset-x-0 bg-indigo-600 text-white text-[8px] font-bold text-center">
                              Cover
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Product Name</label>
                <input
                  required
                  value={editingProduct ? editingProduct.name : prodName}
                  onChange={(e) => {
                    if (editingProduct) setEditingProduct({ ...editingProduct, name: e.target.value });
                    else setProdName(e.target.value);
                  }}
                  placeholder="e.g. Royal Embroidered Bisht, Platinum Cuban Link, Baggy Cargo Pants"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={storeCategories.includes(editingProduct ? editingProduct.category_name : prodCat) ? (editingProduct ? editingProduct.category_name : prodCat) : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        if (editingProduct) setEditingProduct({ ...editingProduct, category_name: e.target.value });
                        else setProdCat(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                  >
                    {storeCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom__">+ Type a new category</option>
                  </select>
                  <input
                    required
                    value={editingProduct ? editingProduct.category_name : prodCat}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, category_name: e.target.value });
                      else setProdCat(e.target.value);
                    }}
                    placeholder="Category name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Selling Price (ETB)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct ? editingProduct.price : prodPrice}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, price: e.target.value });
                      else setProdPrice(e.target.value);
                    }}
                    placeholder="e.g. 1500"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Inventory Stock Count</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={editingProduct ? editingProduct.stock : prodStock}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, stock: e.target.value });
                      else setProdStock(e.target.value);
                    }}
                    placeholder="e.g. 30"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Discount and Compare-at price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Discount (% OFF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="95"
                    value={editingProduct ? (editingProduct.discount_percent || '') : prodDiscountPct}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, discount_percent: e.target.value });
                      else setProdDiscountPct(e.target.value);
                    }}
                    placeholder="e.g. 20 for 20% OFF"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Compare-at / Original Price (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct ? (editingProduct.compare_at_price || '') : prodComparePrice}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, compare_at_price: e.target.value });
                      else setProdComparePrice(e.target.value);
                    }}
                    placeholder="Original price before discount"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Variations */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Sizes, Colors & Variations (comma-separated)</label>
                <input
                  value={editingProduct ? (editingProduct.variations || '') : prodVariations}
                  onChange={(e) => {
                    if (editingProduct) setEditingProduct({ ...editingProduct, variations: e.target.value });
                    else setProdVariations(e.target.value);
                  }}
                  placeholder="e.g. S, M, L, XL · Gold, Silver, Rose Gold · 250g, 500g, 1kg"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct ? (editingProduct.description || '') : prodDesc}
                  onChange={(e) => {
                    if (editingProduct) setEditingProduct({ ...editingProduct, description: e.target.value });
                    else setProdDesc(e.target.value);
                  }}
                  placeholder="Describe material quality, authenticity, origin, sizing advice or care instructions..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              {/* Storefront & Featured Toggles */}
              {editingProduct && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Visible on Storefront</span>
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.available)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Featured Highlight</span>
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.featured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600"
                    />
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.name)}
                      className="btn-3d-white px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="btn-3d-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productSaving || photoUploading}
                    className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{productSaving ? 'Saving...' : editingProduct ? 'Save Product Changes' : 'Save Product to Store'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED CUSTOMER PAYMENT METHODS MODAL */}
      {isPaymentMethodsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  Checkout Payment Accounts Configuration
                </div>
                <h3 className="mt-0.5 text-lg font-display font-extrabold text-slate-950 dark:text-white">
                  Customer Payment Accounts
                </h3>
                <p className="text-xs text-slate-500">
                  Add or edit bank &amp; mobile money accounts. Customers can 1-click copy your account details at checkout to make their payment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentMethodsModalOpen(false);
                  setEditingPaymentMethod(null);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentMethodError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                {paymentMethodError}
              </div>
            )}

            {/* List of existing payment accounts */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Accounts ({(workspace?.paymentMethods || []).filter((m: any) => Boolean(Number(m.is_active))).length})
              </div>
              {(workspace?.paymentMethods || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
                  No payment accounts configured yet. Add one below.
                </div>
              ) : (
                (workspace?.paymentMethods || []).map((method: any) => (
                  <article key={method.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-950 dark:text-white">{method.method_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${Boolean(Number(method.is_active)) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
                          {Boolean(Number(method.is_active)) ? 'Active at Checkout' : 'Deactivated'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">{method.account_name}</p>
                      <p className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{method.account_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditPaymentMethod(method)}
                        className="btn-3d-white px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3 text-indigo-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(method)}
                        className="btn-3d-white px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        {Boolean(Number(method.is_active)) ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Add / Edit Form */}
            <form onSubmit={handleSavePaymentMethod} className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                  {editingPaymentMethod ? 'Edit Payment Account' : 'Add New Payment Account'}
                </span>
                {editingPaymentMethod && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPaymentMethod(null);
                      setPaymentMethodName('');
                      setPaymentAccountName('');
                      setPaymentAccountNumber('');
                      setPaymentMethodError('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Provider / Method Name</label>
                <input
                  required
                  maxLength={80}
                  value={paymentMethodName}
                  onChange={(e) => setPaymentMethodName(e.target.value)}
                  placeholder="e.g. Telebirr, Commercial Bank of Ethiopia, Bank of Abyssinia, CBE Birr"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Account Holder Name</label>
                <input
                  required
                  maxLength={120}
                  value={paymentAccountName}
                  onChange={(e) => setPaymentAccountName(e.target.value)}
                  placeholder="Name as registered on the bank/telebirr account"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Account Number / Phone Number</label>
                <input
                  required
                  maxLength={80}
                  value={paymentAccountNumber}
                  onChange={(e) => setPaymentAccountNumber(e.target.value)}
                  placeholder="e.g. 1000123456789 or 0911234567"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold font-mono dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={paymentMethodSaving}
                  className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{paymentMethodSaving ? 'Saving...' : editingPaymentMethod ? 'Save Account Changes' : 'Add Payment Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY PASSCODE LOCK SCREEN OVERLAY */}
      {isPasscodeLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleUnlockPasscode}
            className="card-3d relative bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 text-center"
          >
            <button
              type="button"
              onClick={() => {
                setIsPasscodeLocked(false);
                handleSignOut();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600"
              title="Exit lock screen and sign out"
              aria-label="Exit lock screen and sign out"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold text-slate-950 dark:text-white">
                Workspace Locked
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your 4–6 digit security passcode for {currentUser?.name} to unlock.
              </p>
            </div>
            {unlockError && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                {unlockError}
              </div>
            )}
            <input
              type="password"
              maxLength={6}
              required
              value={unlockPinInput}
              onChange={(e) => setUnlockPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <button type="submit" className="btn-3d-primary w-full py-3 rounded-xl font-bold text-white text-xs">
              Unlock TeleBiz OS
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
