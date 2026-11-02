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
  | 'superadmin'
  | 'more';

export default function App() {
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('telebiz_token') || '');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('biz_boutique');
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
  const [newBizCategory, setNewBizCategory] = useState('retail');
  const [newBizTemplate, setNewBizTemplate] = useState<string>('royal_boutique');
  const [newBizMethod, setNewBizMethod] = useState<'self_service' | 'done_for_you' | 'ai_builder'>('self_service');
  const [newBizDesc, setNewBizDesc] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('+251 911 223 344');
  const [newBizAddress, setNewBizAddress] = useState('Bole, Addis Ababa');
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

  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState(60);
  const [srvPrice, setSrvPrice] = useState('');
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

  // Auth Login/Register/Telegram/Recovery State (Store Owners Only)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'telegram' | 'recover'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authTgUsername, setAuthTgUsername] = useState('');
  const [authRecoveryPasscode, setAuthRecoveryPasscode] = useState('');
  const [authRecoveryHint, setAuthRecoveryHint] = useState('');
  const [authRecoverNewPassword, setAuthRecoverNewPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

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

  const headersWithAuth = useCallback(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) h['Authorization'] = `Bearer ${authToken}`;
    return h;
  }, [authToken]);

  const loadAccountAndBusinesses = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { headers: headersWithAuth() }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.user) {
          setCurrentUser(data.user);
          setProfileNameInput(data.user.name || '');
          setProfileEmailInput(data.user.email || '');
          setProfileTgInput(data.user.telegram_username || '');
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
      }
      const admRes = await fetch('/api/superadmin/admins', { headers: headersWithAuth() }).catch(() => null);
      if (admRes && admRes.ok) {
        const admins = await admRes.json().catch(() => null);
        if (Array.isArray(admins)) setCoAdminsList(admins);
      }
    } catch (err) {
      console.warn('Account load warning:', err);
    }
  }, [headersWithAuth, selectedBusinessId]);

  const loadTenantWorkspace = useCallback(async (bizId: string) => {
    if (!bizId) return;
    setLoading(true);
    try {
      const [wsRes, anRes, supRes, addRes] = await Promise.all([
        fetch(`/api/businesses/${bizId}/workspace`, { headers: headersWithAuth() }).catch(() => null),
        fetch(`/api/businesses/${bizId}/analytics`, { headers: headersWithAuth() }).catch(() => null),
        fetch(`/api/businesses/${bizId}/support`, { headers: headersWithAuth() }).catch(() => null),
        fetch('/api/addons', { headers: headersWithAuth() }).catch(() => null),
      ]);

      if (wsRes && wsRes.ok) {
        const ws = await wsRes.json().catch(() => null);
        if (ws) {
          setWorkspace(ws);
          setTgBotUsername(ws.business?.telegram_bot_username || '');
          setTgChannelUsername(ws.business?.telegram_channel_username || '');
          setCustomDomainInput(ws.business?.custom_domain || '');
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
  }, [headersWithAuth, selectedConvId]);

  useEffect(() => {
    loadAccountAndBusinesses();
  }, [loadAccountAndBusinesses]);

  useEffect(() => {
    if (selectedBusinessId) {
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
  }, [selectedBusinessId, authToken, loadTenantWorkspace]);

  const handleSwitchDemoAccount = async (userId: string, openModule?: ActiveModule) => {
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
      setStorefrontCustomerOnly(false);
      setFullStorefrontOpen(false);
      const roleLabel = data.user.platform_role === 'super_admin' ? 'Platform Admin (Full Access)' : 'Store Owner (Isolated to Own Store Only)';
      setStatusBanner(`Switched active role to ${data.user.name} — ${roleLabel}`);
      if (openModule) {
        setActiveModule(openModule);
      } else if (data.user.platform_role === 'super_admin') {
        setActiveModule('superadmin');
      } else {
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
    setAuthSuccessMsg('');

    if (authMode === 'telegram') {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_username: authTgUsername,
          name: authName,
          recovery_passcode: authRecoveryPasscode,
          language: lang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || 'Telegram sign-in failed');
        return;
      }
      localStorage.setItem('telebiz_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      setStatusBanner(
        `Signed in via Telegram (${data.user.telegram_username}) · Store Owner ID: ${data.user.owner_uid}`
      );
      loadAccountAndBusinesses();
      return;
    }

    if (authMode === 'recover') {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: authEmail,
          recovery_passcode: authRecoveryPasscode,
          new_password: authRecoverNewPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || 'Account recovery failed. Check your Recovery Passcode.');
        return;
      }
      localStorage.setItem('telebiz_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      setStatusBanner(
        data.message || `Account recovered! Welcome back ${data.user.name} (${data.user.owner_uid}).`
      );
      loadAccountAndBusinesses();
      return;
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: authName,
        email: authEmail,
        password: authPassword,
        telegram_username: authTgUsername,
        recovery_passcode: authRecoveryPasscode,
        recovery_hint: authRecoveryHint,
        language: lang,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAuthError(data.error || 'Authentication failed');
    } else {
      localStorage.setItem('telebiz_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      setStatusBanner(
        authMode === 'register'
          ? `Store Owner Account Created! Your Unique Store Owner ID is ${data.user.owner_uid}. Recovery Passcode is active.`
          : `Signed in as ${data.user.name} (${data.user.owner_uid || 'Store Owner'})`
      );
      loadAccountAndBusinesses();
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
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: headersWithAuth(),
      body: JSON.stringify({
        name: newBizName,
        category: newBizCategory,
        template_id: newBizTemplate,
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
      setFullStorefrontOpen(true);
      setStatusBanner(
        `Created "${created.name}" with the ${newBizTemplate.replace(/_/g, ' ')} visual template, starter products & categories! You are now viewing your live storefront preview.`
      );
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
      await loadTenantWorkspace(selectedBusinessId);
      await loadAccountAndBusinesses();
      setStatusBanner('Product details, photos, discount, and inventory updated.');
    } catch (err: any) {
      setCommerceError(err.message || 'Network error. Product changes were not saved.');
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
        <header className="telebiz-topbar sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="#overview"
            onClick={(e) => { e.preventDefault(); setActiveModule('overview'); setMobileMoreOpen(false); }}
            className="flex min-w-0 items-center gap-3"
            aria-label="TeleBiz workspace home"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight text-slate-950 dark:text-white">{t.platformTitle}</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400 sm:block">3D Multi-Store Operating Platform</span>
            </span>
          </a>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <button
              type="button"
              onClick={() => setActiveModule('more')}
              className="flex max-w-md items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs text-slate-600 shadow-sm hover:border-indigo-300 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              title="Click to switch business or open My Business List in More"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="font-bold text-slate-900 dark:text-white">{activeBusiness?.name || 'Select a business'}</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">My Business List →</span>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <span className="hidden text-right sm:block">
              <span className="block max-w-40 truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                {currentUser?.name || 'Workspace user'}
              </span>
              <span className="block text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {currentUser?.owner_uid || 'OWN-ID'} · {currentUser?.platform_role === 'super_admin' ? 'Super Admin' : 'Store Owner'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthSuccessMsg('');
                setAuthModalOpen(true);
              }}
              className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-indigo-700"
              title="Store Owner Login / Telegram Login / Account Recovery"
            >
              <Send className="h-3.5 w-3.5 text-sky-600" />
              <span className="hidden md:inline">Owner Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveModule('more');
                setMobileMoreOpen(false);
              }}
              className={
                activeModule === 'more'
                  ? 'btn-3d-primary inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white'
                  : 'btn-3d-white inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800'
              }
              aria-label="Open More and My Business List"
            >
              <MoreHorizontal className="h-4 w-4 text-indigo-600" />
              <span>More</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuDrawerOpen(true)}
              className="btn-3d-white inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold"
              aria-label="Open Menu and Settings"
            >
              <Settings className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </header>
      )}

      {/* 3-Category Role Recognition & Strict Access Bar (1. Platform Admin, 2. Store Owner, 3. Customer) */}
      {!fullStorefrontOpen && (
        <div className="border-b border-slate-200/90 bg-slate-900 text-white px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1480px] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-extrabold text-[10px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                3-Role Isolation Engine
              </span>

              {/* Role 1: Platform Admin */}
              <button
                type="button"
                onClick={() => handleSwitchDemoAccount('usr_superadmin', 'superadmin')}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 ${
                  currentUser?.platform_role === 'super_admin'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>1. Platform Admin</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/25 text-indigo-200">
                  All Categories & Stores
                </span>
              </button>

              {/* Role 2: Store Owners (Isolated to their own store only) */}
              <div className="inline-flex items-center gap-1.5 bg-slate-800 rounded-xl p-1 border border-slate-700">
                <span className={`px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                  currentUser?.platform_role !== 'super_admin'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300'
                }`}>
                  2. Store Owner:
                </span>
                <select
                  aria-label="Switch Store Owner Account"
                  value={currentUser?.platform_role !== 'super_admin' ? currentUser?.id : ''}
                  onChange={(e) => {
                    if (e.target.value) handleSwitchDemoAccount(e.target.value, 'overview');
                  }}
                  className="bg-slate-900 text-white text-[11px] font-bold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none"
                >
                  <option value="" disabled>
                    {currentUser?.platform_role === 'super_admin' ? 'Select a Store Owner to test isolation...' : 'Switch Store Owner'}
                  </option>
                  {availableAccounts
                    .filter((acc: any) => acc.platform_role !== 'super_admin')
                    .map((acc: any) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.owner_uid || 'OWNER'}) — Sees Own Store Only
                      </option>
                    ))}
                </select>
              </div>

              {/* Role 3: Their Customers */}
              <button
                type="button"
                onClick={() => {
                  setStorefrontCustomerOnly(true);
                  setFullStorefrontOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30 transition flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Customer View ({activeBusiness?.name || 'Store'})</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-300">
                Active Scope:{' '}
                {currentUser?.platform_role === 'super_admin' ? (
                  <strong className="text-indigo-300">Platform Admin — Viewing all {businesses.length} stores across all categories</strong>
                ) : (
                  <strong className="text-emerald-300">Store Owner — Strictly isolated to {businesses.length} owned store(s) ({businesses.map((b: any) => b.name).join(', ')})</strong>
                )}
              </span>
              <button
                type="button"
                onClick={() => setRoleGuideModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition"
              >
                How Role Algorithm Works →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Notification Banner */}
      {statusBanner && (
        <div className="mx-4 my-3 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-950 shadow-sm sm:mx-6 lg:mx-8 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
          <span>{statusBanner}</span>
          <button type="button" onClick={() => setStatusBanner('')} className="underline ml-4 font-bold">
            Dismiss
          </button>
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
                  { id: 'more', label: 'More & My Businesses', icon: MoreHorizontal },
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
                      Keep your storefront accurate, manage stock, and publish the services customers can book.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {workspace.business?.name || 'Current business'}
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

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <section className="space-y-4 xl:col-span-7">
                    <div className="card-3d rounded-2xl bg-white p-4 dark:bg-slate-900 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Product inventory</h3>
                          <p className="mt-1 text-xs text-slate-500">{visibleCommerceProducts.length} of {commerceProducts.length} products shown</p>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="search"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Search product, SKU or category"
                            aria-label="Search products"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
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

                      <div className="mt-4 space-y-3">
                        {visibleCommerceProducts.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
                            <Package className="mx-auto h-6 w-6 text-slate-400" />
                            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                              {commerceProducts.length === 0 ? 'Your catalog is ready for its first product' : 'No products match these filters'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {commerceProducts.length === 0 ? 'Add a product to begin building your catalog.' : 'Try another search or choose a different category filter.'}
                            </p>
                          </div>
                        ) : visibleCommerceProducts.map((product: any) => {
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
                            <article key={product.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 shadow-xs dark:border-slate-800 dark:hover:border-slate-700">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                  {product.image_url ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      loading="lazy"
                                      decoding="async"
                                      className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0 bg-slate-50 dark:bg-slate-950">
                                      <ImagePlus className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="truncate text-sm font-bold text-slate-950 dark:text-white">{product.name}</h4>
                                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                        {product.category_name || 'Uncategorized'}
                                      </span>
                                      {discountPct > 0 && (
                                        <span className="rounded-full bg-emerald-900 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                          {discountPct}% OFF
                                        </span>
                                      )}
                                      {Boolean(Number(product.featured)) && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Featured</span>}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                      SKU: <span className="font-mono">{product.sku || 'Assigned'}</span>
                                      {product.description ? ` · ${product.description}` : ''}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + stockClass}>{stockLabel}</span>
                                      {hidden && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">Hidden from storefront</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                  <div className="text-left sm:text-right">
                                    <div className="text-base font-display font-extrabold tabular-nums text-slate-950 dark:text-white">
                                      {Number(product.price || 0).toLocaleString()} {product.currency || 'ETB'}
                                    </div>
                                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                                      <div className="text-[11px] text-slate-400 line-through tabular-nums">
                                        {Number(product.compare_at_price).toLocaleString()} {product.currency || 'ETB'}
                                      </div>
                                    )}
                                    <div className="mt-1 text-xs text-slate-500">{stock.toLocaleString()} units recorded</div>
                                  </div>
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
                                    }}
                                    className="btn-3d-white inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-indigo-600" /> Edit Photo / Price / Category
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[10px] text-slate-400 dark:border-slate-800">
                                <span>{Number(product.views_count || 0).toLocaleString()} views</span>
                                <span>{Number(product.likes_count || 0).toLocaleString()} likes</span>
                                <span>{Number(product.purchases_count || 0).toLocaleString()} purchases</span>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card-3d rounded-2xl bg-white p-4 dark:bg-slate-900 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Bookable services</h3>
                          <p className="mt-1 text-xs text-slate-500">{commerceServices.length} services configured</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">Appointments & reservations</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {commerceServices.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                            <Clock3 className="mx-auto h-5 w-5 text-slate-400" />
                            <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">No bookable services yet</p>
                            <p className="mt-1 text-[11px] text-slate-500">Add an appointment, tour, or reservation type.</p>
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
                  </section>

                  <section className="space-y-4 xl:col-span-5">
                    {editingProduct && (
                      <form onSubmit={handleUpdateProduct} className="card-3d space-y-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 p-4 dark:bg-slate-900 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">Edit catalog item, photos & discount</div>
                            <h3 className="mt-1 text-sm font-extrabold text-slate-950 dark:text-white">{editingProduct.name}</h3>
                          </div>
                          <button type="button" onClick={() => setEditingProduct(null)} aria-label="Close product editor" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
                        </div>

                        {/* Device Photo Upload & Gallery in Edit Form */}
                        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-950 p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <ImagePlus className="w-4 h-4 text-indigo-600" />
                              Product Photos (Upload from Device)
                            </label>
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                              Auto WebP + SHA-256 Deduplicated
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="btn-3d-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 text-indigo-700">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{photoUploading ? 'Optimizing & Uploading...' : 'Upload Photo(s) from Device'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => compressAndUploadDevicePhotos(e.target.files, 'edit')}
                              />
                            </label>
                            {editingProduct.image_url && (
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, image_url: '', gallery: [] })}
                                className="text-[11px] text-rose-600 font-bold hover:underline"
                              >
                                Clear Photos
                              </button>
                            )}
                          </div>
                          {(editingProduct.image_url || (editingProduct.gallery && editingProduct.gallery.length > 0)) && (
                            <div className="flex items-center gap-2 overflow-x-auto pt-1">
                              {(editingProduct.gallery?.length ? editingProduct.gallery : [editingProduct.image_url]).map((url: string, idx: number) => (
                                <div key={idx} className="relative group shrink-0">
                                  <img
                                    src={url}
                                    alt={`Preview ${idx + 1}`}
                                    className={`h-14 w-14 rounded-xl object-cover border-2 ${editingProduct.image_url === url ? 'border-indigo-600' : 'border-slate-200'}`}
                                    onClick={() => setEditingProduct({ ...editingProduct, image_url: url })}
                                  />
                                  {idx === 0 && (
                                    <span className="absolute bottom-0.5 left-0.5 right-0.5 bg-black/70 text-white text-[8px] font-bold text-center rounded">
                                      Cover
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Product name</label>
                          <input required value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Assign / Move to Category</label>
                          <select
                            value={storeCategories.includes(editingProduct.category_name) ? editingProduct.category_name : '__custom__'}
                            onChange={(e) => {
                              if (e.target.value !== '__custom__') {
                                setEditingProduct({ ...editingProduct, category_name: e.target.value });
                              }
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950 mb-2"
                          >
                            {storeCategories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                            <option value="__custom__">+ Type a custom category below</option>
                          </select>
                          <input
                            required
                            value={editingProduct.category_name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category_name: e.target.value })}
                            placeholder="Category name"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Selling Price (ETB)</label>
                            <input required type="number" min="0" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Stock units</label>
                            <input required type="number" min="0" step="1" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-bold text-emerald-700 dark:text-emerald-400">Discount (% OFF)</label>
                            <input
                              type="number"
                              min="0"
                              max="95"
                              value={editingProduct.discount_percent || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, discount_percent: e.target.value })}
                              placeholder="e.g. 25"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Original Price (Optional)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingProduct.compare_at_price || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: e.target.value })}
                              placeholder="Auto-calculated if blank"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Options / Variations (comma-separated)</label>
                          <input value={editingProduct.variations || ''} onChange={(e) => setEditingProduct({ ...editingProduct, variations: e.target.value })} placeholder="S, M, L, XL, XXL · White, Black, Beige" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                          <textarea rows={2} value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950" />
                        </div>
                        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-950">
                          <span><strong className="block font-semibold text-slate-800 dark:text-slate-200">Available on storefront</strong><span className="text-[10px] text-slate-500">Customers can see and order this product</span></span>
                          <input type="checkbox" checked={Boolean(editingProduct.available)} onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })} className="h-4 w-4 accent-indigo-600" />
                        </label>
                        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-950">
                          <span><strong className="block font-semibold text-slate-800 dark:text-slate-200">Feature this product</strong><span className="text-[10px] text-slate-500">Highlight it in the catalog</span></span>
                          <input type="checkbox" checked={Boolean(editingProduct.featured)} onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })} className="h-4 w-4 accent-indigo-600" />
                        </label>
                        <button type="submit" disabled={productSaving} className="btn-3d-primary w-full rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                          {productSaving ? 'Saving changes...' : 'Save Product, Photos & Discount'}
                        </button>
                      </form>
                    )}

                    <form onSubmit={handleCreateProduct} className="card-3d space-y-3.5 rounded-2xl bg-white p-4 dark:bg-slate-900 sm:p-5">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">New catalog item + Device Photo Upload</div>
                        <h3 className="mt-1 text-sm font-bold text-slate-950 dark:text-white">Add a Product with Photos, Price, Discount & Description</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Upload photos directly from your phone or computer. Photos are automatically compressed to WebP and deduplicated on disk so your store scales to millions of images.
                        </p>
                      </div>

                      {/* Device Photo Upload Box */}
                      <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <ImagePlus className="w-4 h-4 text-indigo-600" />
                            1. Upload Product Photo(s) from Device
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            Up to 4 Gallery Photos
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{photoUploading ? 'Optimizing & Uploading...' : 'Choose Photo(s) from Device'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => compressAndUploadDevicePhotos(e.target.files, 'new')}
                            />
                          </label>
                          {prodImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setProdImageUrl('');
                                setProdGallery([]);
                              }}
                              className="text-xs font-bold text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {lastUploadStats && (
                          <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                            ✓ WebP Optimized ({Math.round(lastUploadStats.byteSize / 1024)} KB · Saved {lastUploadStats.savedPercent}% · SHA-256 #{lastUploadStats.sha256.slice(0, 8)})
                          </div>
                        )}
                        {prodGallery.length > 0 && (
                          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                            {prodGallery.map((url, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setProdImageUrl(url)}
                                className={`relative rounded-xl overflow-hidden border-2 shrink-0 ${
                                  prodImageUrl === url ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'border-slate-200'
                                }`}
                              >
                                <img src={url} alt={`Uploaded ${idx + 1}`} className="h-14 w-14 object-cover" />
                                {prodImageUrl === url && (
                                  <span className="absolute bottom-0 inset-x-0 bg-indigo-600 text-white text-[8px] font-bold text-center">
                                    Main
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Product name</label>
                        <input required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="e.g. Royal Embroidered Bisht or Signature Blend" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                        <select
                          value={storeCategories.includes(prodCat) ? prodCat : '__custom__'}
                          onChange={(e) => {
                            if (e.target.value !== '__custom__') setProdCat(e.target.value);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950 mb-2"
                        >
                          {storeCategories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="__custom__">+ Type a new category below</option>
                        </select>
                        <input required value={prodCat} onChange={(e) => setProdCat(e.target.value)} placeholder="Or type category name..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Selling Price (ETB)</label>
                          <input required type="number" min="0" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="e.g. 129.99" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Starting stock</label>
                          <input required type="number" min="0" step="1" value={prodStock} onChange={(e) => setProdStock(e.target.value)} placeholder="e.g. 25" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Percent className="w-3 h-3" /> Discount (% OFF)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="95"
                            value={prodDiscountPct}
                            onChange={(e) => setProdDiscountPct(e.target.value)}
                            placeholder="e.g. 25 for 25% OFF"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Compare-at Price (Optional)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={prodComparePrice}
                            onChange={(e) => setProdComparePrice(e.target.value)}
                            placeholder="Auto-calculated if % set"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Sizes, Colors & Variations (comma-separated)</label>
                        <input value={prodVariations} onChange={(e) => setProdVariations(e.target.value)} placeholder="S, M, L, XL, XXL · White, Black, Beige" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                        <textarea rows={2} value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Describe fabric, quality, fit, delivery details..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                      </div>
                      <button type="submit" disabled={productSaving || photoUploading} className="btn-3d-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white disabled:opacity-50">
                        <Plus className="h-4 w-4" /> {productSaving ? 'Creating product...' : 'Add Product with Photos & Discount'}
                      </button>
                    </form>

                    <form onSubmit={handleCreateService} className="card-3d space-y-3 rounded-2xl bg-white p-4 dark:bg-slate-900 sm:p-5">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Appointments & reservations</div>
                        <h3 className="mt-1 text-sm font-bold text-slate-950 dark:text-white">Add a bookable service</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Create the service customers can request through your storefront.</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Service name</label>
                        <input required value={srvName} onChange={(e) => setSrvName(e.target.value)} placeholder="e.g. Consultation or room reservation" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Duration (minutes)</label>
                          <input type="number" min="1" value={srvDuration} onChange={(e) => setSrvDuration(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Price (ETB)</label>
                          <input required type="number" min="0" step="0.01" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Description (optional)</label>
                        <textarea rows={2} value={srvDesc} onChange={(e) => setSrvDesc(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950" />
                      </div>
                      <button type="submit" disabled={serviceSaving} className="btn-3d-dark inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                        <Plus className="h-4 w-4" /> {serviceSaving ? 'Creating service...' : 'Add service'}
                      </button>
                    </form>
                  </section>
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
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {workspace.business?.name || 'Current business'}
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

                {/* Multiple owner-managed checkout payment methods */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Checkout configuration</div>
                      <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">Customer payment methods</h3>
                      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                        Add several bank or mobile-money accounts. Active methods appear at checkout; customers can copy the account holder name and number after placing an order.
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {(workspace.paymentMethods || []).filter((m: any) => Boolean(Number(m.is_active))).length} active
                    </span>
                  </div>

                  {paymentMethodError && (
                    <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">{paymentMethodError}</div>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <div className="space-y-2 xl:col-span-7">
                      {(workspace.paymentMethods || []).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                          <CreditCard className="mx-auto h-6 w-6 text-slate-400" />
                          <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">No payment methods configured</p>
                          <p className="mt-1 text-xs text-slate-500">Add your first payment account so customers can complete checkout.</p>
                        </div>
                      ) : (workspace.paymentMethods || []).map((method: any) => (
                        <article key={method.id} className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-950 dark:text-white">{method.method_name}</h4>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${Boolean(Number(method.is_active)) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                  {Boolean(Number(method.is_active)) ? 'Active at checkout' : 'Inactive'}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{method.account_name}</p>
                              <p className="mt-1 break-all font-mono text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200">{method.account_number}</p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              <button type="button" onClick={() => handleEditPaymentMethod(method)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button type="button" onClick={() => handleTogglePaymentMethod(method)} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                                {Boolean(Number(method.is_active)) ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <form onSubmit={handleSavePaymentMethod} className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 xl:col-span-5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-950 dark:text-white">{editingPaymentMethod ? 'Edit payment method' : 'Add payment method'}</h4>
                          <p className="mt-1 text-[11px] text-slate-500">All three fields are shown to customers.</p>
                        </div>
                        {editingPaymentMethod && (
                          <button type="button" onClick={() => { setEditingPaymentMethod(null); setPaymentMethodName(''); setPaymentAccountName(''); setPaymentAccountNumber(''); setPaymentMethodError(''); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label="Cancel payment method edit">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Payment method name</label>
                        <input required maxLength={80} value={paymentMethodName} onChange={(e) => setPaymentMethodName(e.target.value)} placeholder="e.g. Telebirr or Commercial Bank of Ethiopia" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Account holder name</label>
                        <input required maxLength={120} value={paymentAccountName} onChange={(e) => setPaymentAccountName(e.target.value)} placeholder="Name shown on the account" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Account number</label>
                        <input required maxLength={80} value={paymentAccountNumber} onChange={(e) => setPaymentAccountNumber(e.target.value)} placeholder="Enter the receiving account number" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900" />
                      </div>
                      <button type="submit" disabled={paymentMethodSaving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950">
                        <Plus className="h-4 w-4" /> {paymentMethodSaving ? 'Saving...' : editingPaymentMethod ? 'Save payment method' : 'Add payment method'}
                      </button>
                    </form>
                  </div>
                  <p className="mt-3 text-[10px] leading-5 text-slate-400">Deactivated methods are hidden from new checkouts. Previous orders keep the payment instructions selected when they were placed.</p>
                </section>

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
                                    setActiveModule('builder');
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
                                    setActiveModule('commerce');
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
                          onClick={() => setActiveModule(tool.id as ActiveModule)}
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
          </main>
        </div>
      )}

      {!fullStorefrontOpen && (
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
                  setActiveModule(item.id as ActiveModule);
                  setMobileMoreOpen(false);
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
                  Pick a visual template below — we automatically build your store with sample categories, products, and checkout so you can preview and edit immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewBizModalOpen(false)}
                className="btn-3d-white px-3.5 py-2 rounded-xl font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              {/* STEP 1: VISUAL STOREFRONT TEMPLATE PICKER */}
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-white mb-2">
                  Step 1 — Choose Your Visual Storefront Template (Auto-Populates Products & Categories)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'royal_boutique',
                      cat: 'retail',
                      title: 'Al-Saudia Traditional & Luxury Wear',
                      subtitle: 'Thobes, Agal, Bishts, Jalabiyas & Arabian Culture',
                      primary: '#0F382A',
                      accent: '#C69C6D',
                      cats: ['Thobes', 'Agal', 'Bishts', 'Jalabiyas', 'Accessories'],
                      badge: 'Arabian Heritage',
                    },
                    {
                      id: 'luxury_chains_jewelry',
                      cat: 'retail',
                      title: 'Aurum & Stone Royal Chains & Fine Jewelry',
                      subtitle: '18K Cuban Chains, Solitaire Diamonds, Signets & Watches',
                      primary: '#D4AF37',
                      accent: '#F5D77F',
                      cats: ['Chains', 'Necklaces', 'Rings', 'Watches', 'Bracelets'],
                      badge: 'Chains & Jewelry',
                    },
                    {
                      id: 'baggy_streetwear',
                      cat: 'retail',
                      title: 'District 92 Oversize & Baggy Streetwear',
                      subtitle: 'Heavy 420GSM Hoodies, Parachute Cargo & Boxy Tees',
                      primary: '#FF5500',
                      accent: '#FFFFFF',
                      cats: ['Hoodies', 'Baggy Cargo', 'Vintage Tees', 'Outerwear'],
                      badge: 'Baggy Fashion Drop',
                    },
                    {
                      id: 'gourmet_food_roastery',
                      cat: 'coffee_shop',
                      title: 'Kaffa Origin Roastery & Gourmet Food',
                      subtitle: 'Borosilicate Glass Storage Canisters, Honey & Coffee',
                      primary: '#2D1810',
                      accent: '#C86432',
                      cats: ['Single-Origin Coffee', 'Storage Canisters', 'Raw Honey', 'Brew Gear'],
                      badge: 'Gourmet Food & Storage',
                    },
                    {
                      id: 'digital_menu',
                      cat: 'restaurant',
                      title: 'Fine Dining & Fast Delivery',
                      subtitle: 'Platters, Grill, Drinks & Table Booking',
                      primary: '#7C2D12',
                      accent: '#D97706',
                      cats: ['Signature Platters', 'Mains', 'Beverages', 'Desserts'],
                      badge: 'Food & Menu',
                    },
                    {
                      id: 'wellness_salon',
                      cat: 'salon',
                      title: 'Beauty, Oud & Wellness Spa',
                      subtitle: 'Skincare, Fragrances & Appointments',
                      primary: '#4A1D36',
                      accent: '#D4AF37',
                      cats: ['Oud & Perfumes', 'Skincare', 'Hair Care', 'Spa'],
                      badge: 'Beauty & Appointments',
                    },
                  ].map((tpl) => {
                    const selected = newBizTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setNewBizTemplate(tpl.id);
                          setNewBizCategory(tpl.cat);
                          if (!newBizName) {
                            setNewBizName(tpl.title);
                          }
                          if (!newBizDesc) {
                            setNewBizDesc(`${tpl.title} — ${tpl.subtitle}. Crafted for modern lifestyle.`);
                          }
                        }}
                        className={`text-left rounded-2xl p-3.5 border transition flex flex-col justify-between ${
                          selected
                            ? 'border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          {/* Mini visual header preview inside template card */}
                          <div
                            className="rounded-xl p-2.5 mb-2.5 text-white flex items-center justify-between"
                            style={{ backgroundColor: tpl.primary }}
                          >
                            <div>
                              <span
                                className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1"
                                style={{ backgroundColor: tpl.accent, color: '#1C1917' }}
                              >
                                {tpl.badge}
                              </span>
                              <div className="font-serif font-bold text-xs truncate">{tpl.title}</div>
                            </div>
                            <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px]">
                              🛍️
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {tpl.subtitle}
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                          {tpl.cats.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: CREATION MODE */}
              <div>
                <label className="block font-extrabold text-slate-900 dark:text-white mb-1.5">
                  Step 2 — How Would You Like to Build & Manage?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'self_service', label: '1. Visual Self-Service Builder', sub: 'Instant template + live edit' },
                    { id: 'ai_builder', label: '2. AI-Powered Store Builder', sub: 'Describe & auto-customize' },
                    { id: 'done_for_you', label: '3. Done-For-You Concierge', sub: 'Our team builds it for you' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewBizMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        newBizMethod === m.id
                          ? 'border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="font-bold">{m.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: STORE DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Store / Brand Name</label>
                  <input
                    type="text"
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="e.g., Al-Noor Royal Wear"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Business Category</label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
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
                <label className="block font-bold mb-1">Store Tagline & Description</label>
                <textarea
                  rows={2}
                  value={newBizDesc}
                  onChange={(e) => setNewBizDesc(e.target.value)}
                  placeholder="Timeless elegance — traditional wear, bespoke tailoring, and fast delivery..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Store Contact Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Telegram Bot Username (Can also link later)</label>
                  <input
                    type="text"
                    value={newBizBot}
                    onChange={(e) => setNewBizBot(e.target.value)}
                    placeholder="@MyStoreBot"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {newBizMethod === 'done_for_you' && (
                <div>
                  <label className="block font-bold mb-1">
                    Done-For-You Concierge Instructions (For Our Specialists)
                  </label>
                  <textarea
                    rows={2}
                    value={newBizDfyNotes}
                    onChange={(e) => setNewBizDfyNotes(e.target.value)}
                    placeholder="Tell our team what colors, products, and Telegram channel links to set up for you..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  Includes 4 starter products, categories, size/color selectors & 1-step checkout.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBizModalOpen(false)}
                    className="btn-3d-white px-4 py-2.5 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-3d-emerald px-5 py-2.5 rounded-xl text-white font-extrabold"
                  >
                    Create Store & Open Visual Preview →
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
                className="btn-3d-white px-3.5 py-2 rounded-xl font-bold"
              >
                Close Guide
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

      {/* MODAL: STORE OWNER SIGN IN / REGISTER / TELEGRAM LOGIN / PASSCODE RECOVERY */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 text-xs my-8">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  <Fingerprint className="w-3.5 h-3.5" />
                  Store Owner Identity & Recovery Vault
                </div>
                <h3 className="text-lg font-display font-extrabold text-slate-950 dark:text-white mt-0.5">
                  {authMode === 'login'
                    ? 'Sign In to Your Store Owner Account'
                    : authMode === 'register'
                    ? 'Create Store Owner Account + Recovery Passcode'
                    : authMode === 'telegram'
                    ? 'Continue with Telegram (Store Owners)'
                    : 'Recover Account with Secondary Passcode'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Accounts are strictly for Store Owners. Customers shop & checkout without needing an account (tracked 24/7 via Customer UID).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="btn-3d-white px-3 py-1.5 rounded-xl font-bold shrink-0"
              >
                Close
              </button>
            </div>

            {/* 4-Mode Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl">
              {[
                { id: 'login', label: 'Email Sign In' },
                { id: 'register', label: 'New Store Owner' },
                { id: 'telegram', label: 'Telegram Login' },
                { id: 'recover', label: 'Recover Account' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setAuthMode(tab.id as any);
                    setAuthError('');
                    setAuthSuccessMsg('');
                  }}
                  className={`py-2 px-2.5 rounded-xl font-bold text-[11px] transition ${
                    authMode === tab.id
                      ? 'bg-slate-950 text-white shadow-xs dark:bg-indigo-600'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                {authError}
              </div>
            )}
            {authSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                {authSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'login' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address, Store Owner ID (`OWN-...`), or `@telegram`
                    </label>
                    <input
                      type="text"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="hana@tomocacraft.et or OWN-HAN-204881"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="owner123 or admin123"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-3d-primary w-full py-3 rounded-xl text-white font-extrabold">
                    Sign In to Store Owner Workspace →
                  </button>
                </>
              )}

              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Store Owner Full Name</label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Tariq Al-Mansoor"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telegram Handle (Optional)</label>
                      <input
                        type="text"
                        value={authTgUsername}
                        onChange={(e) => setAuthTgUsername(e.target.value)}
                        placeholder="@your_telegram"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="owner@yourbrand.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Password</label>
                      <input
                        type="password"
                        minLength={6}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                        required
                      />
                    </div>
                  </div>

                  {/* Mandatory Secondary Recovery Passcode */}
                  <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-indigo-600" />
                        Mandatory Secondary Recovery Passcode
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold uppercase">
                        Required for Recovery
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Set a second secret Passcode / PIN (4–12 digits or characters). If you ever forget your email or password, you can recover your account immediately with this code.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Secondary Recovery Passcode
                        </label>
                        <input
                          type="password"
                          minLength={4}
                          value={authRecoveryPasscode}
                          onChange={(e) => setAuthRecoveryPasscode(e.target.value)}
                          placeholder="e.g. 2026 or secret-pin"
                          className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-white dark:bg-slate-950 font-mono tracking-widest"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Passcode Memory Hint (Optional)
                        </label>
                        <input
                          type="text"
                          value={authRecoveryHint}
                          onChange={(e) => setAuthRecoveryHint(e.target.value)}
                          placeholder="e.g. Founding year"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-950"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-3d-emerald w-full py-3 rounded-xl text-white font-extrabold">
                    Create Store Owner Account & Generate Unique ID →
                  </button>
                </>
              )}

              {authMode === 'telegram' && (
                <>
                  <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/30 p-3.5 space-y-2">
                    <div className="font-extrabold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-sky-600" />
                      1-Click Telegram Store Owner Login & Registration
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Sign in or open a new store using your Telegram username. You will receive a permanent Store Owner Unique ID (`OWN-...`) that links your Telegram Mini App and customers 24/7.
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Telegram Username</label>
                    <input
                      type="text"
                      value={authTgUsername}
                      onChange={(e) => setAuthTgUsername(e.target.value)}
                      placeholder="@hana_tomoca or @your_telegram_handle"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Display Name (If New Store Owner)
                      </label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Your Name or Brand"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Recovery Passcode (4+ chars)
                      </label>
                      <input
                        type="password"
                        value={authRecoveryPasscode}
                        onChange={(e) => setAuthRecoveryPasscode(e.target.value)}
                        placeholder="e.g. 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-3d-primary w-full py-3 rounded-xl text-white font-extrabold flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Continue with Telegram →
                  </button>
                </>
              )}

              {authMode === 'recover' && (
                <>
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-1.5">
                    <div className="font-extrabold text-amber-950 dark:text-amber-200">
                      Forgot Your Email or Password? Recover with Your Secondary Passcode
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Enter your Name, Telegram `@username`, Store Owner ID (`OWN-...`), or Email along with your secondary Recovery Passcode to unlock your account and set a new password.
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Name, Telegram `@username`, Store Owner ID (`OWN-...`), or Email
                    </label>
                    <input
                      type="text"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. Hana Tadesse, @hana_tomoca, or OWN-HAN-204881"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Your Secondary Recovery Passcode
                      </label>
                      <input
                        type="password"
                        value={authRecoveryPasscode}
                        onChange={(e) => setAuthRecoveryPasscode(e.target.value)}
                        placeholder="e.g. 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Set New Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={authRecoverNewPassword}
                        onChange={(e) => setAuthRecoverNewPassword(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-3d-dark w-full py-3 rounded-xl text-white font-extrabold">
                    Verify Recovery Passcode & Restore Account →
                  </button>
                </>
              )}
            </form>
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
                className="btn-3d-white px-3 py-1.5 rounded-xl font-bold"
              >
                Close
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
                <form onSubmit={handleChangePassword} className="card-3d rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
                  <div>
                    <h4 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">
                      Change Account Password
                    </h4>
                    <p className="text-slate-500">Update your login password at any time.</p>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Current Password (optional in demo)</label>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">New Password (minimum 6 characters)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
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

      {/* SECURITY PASSCODE LOCK SCREEN OVERLAY */}
      {isPasscodeLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleUnlockPasscode}
            className="card-3d bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 text-center"
          >
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
