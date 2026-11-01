import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../i18n/translations';

interface StorefrontProps {
  slug: string;
  mode?: 'embedded_preview' | 'full_storefront';
  onOrderCreated?: () => void;
  onClose?: () => void;
}

type StoreTab = 'home' | 'catalog' | 'bookings' | 'support' | 'about';

const formatMoney = (amount: number | string, currency = 'ETB') =>
  Number(amount || 0).toLocaleString() + ' ' + (currency || 'ETB');

const parseJsonArray = (value: string | undefined, fallback: string[] = []) => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export function ProductVisualCard({
  imageType,
  title,
  accentColor,
}: {
  imageType: string;
  title: string;
  accentColor: string;
}) {
  const palettes: Record<string, string> = {
    coffee: 'from-amber-950 via-stone-800 to-orange-950',
    ceramic: 'from-slate-800 via-zinc-700 to-stone-800',
    leather: 'from-stone-950 via-amber-950 to-orange-950',
    coldbrew: 'from-sky-950 via-indigo-900 to-slate-900',
    hotel: 'from-teal-950 via-emerald-900 to-slate-900',
    salon: 'from-rose-950 via-fuchsia-950 to-stone-900',
  };
  const background = palettes[imageType] || 'from-slate-900 via-indigo-950 to-slate-800';

  return (
    <div className={'telebiz-product-art relative flex aspect-[1.42/1] w-full items-center justify-center overflow-hidden bg-gradient-to-br ' + background}>
      <div className="telebiz-art-orb pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border border-white/10" />
      <div className="telebiz-art-orb pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur">
        <Sparkles className="h-3 w-3" />
        Featured
      </div>
      <div className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/20 bg-white/10 text-2xl font-bold tracking-tight text-white shadow-2xl backdrop-blur-sm" style={{ boxShadow: '0 18px 50px rgba(0,0,0,.24)', borderColor: accentColor + '88' }}>
        {String(title || 'Item').slice(0, 2).toUpperCase()}
      </div>
      <div className="absolute bottom-4 left-4 right-4 truncate text-[11px] font-medium text-white/85">
        {title}
      </div>
    </div>
  );
}

export const MiniAppStorefront: React.FC<StorefrontProps> = ({
  slug,
  mode = 'embedded_preview',
  onOrderCreated,
  onClose,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StoreTab>('home');
  const [channelSource, setChannelSource] = useState<'telegram' | 'web'>('telegram');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart & checkout state
  const [cart, setCart] = useState<Array<{ productId: string; name: string; price: number; qty: number; variation: string }>>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'telegram_stars' | 'cbe_birr' | 'card'>('telebirr');
  const [providerTxId] = useState('');

  const [orderResult, setOrderResult] = useState<any>(null);
  const [orderError, setOrderError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Booking state
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingGuests, setBookingGuests] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [bookingError, setBookingError] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Support state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportReplyNotice, setSupportReplyNotice] = useState<any>(null);
  const [supportError, setSupportError] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  const sessionId = 'sess_' + slug;

  const recordFunnelEvent = async (eventType: string, pageName = activeTab, productId?: string) => {
    try {
      await fetch('/api/storefront/' + slug + '/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          page_name: pageName,
          product_id: productId || null,
          source: channelSource,
          device_type: channelSource === 'telegram' ? 'mobile_tg' : 'desktop_web',
          session_id: sessionId,
        }),
      });
    } catch {
      // Customer-facing browsing should remain available if optional analytics is unavailable.
    }
  };

  const loadStorefront = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/storefront/' + slug);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Unable to load this storefront.');
      } else {
        setData(json);
        if (json.services?.length > 0 && !selectedServiceId) {
          setSelectedServiceId(json.services[0].id);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorefront();
    recordFunnelEvent('app_visit', 'home');
  }, [slug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const telegramWebApp = Boolean((window as any).Telegram?.WebApp?.initData);
      setChannelSource(telegramWebApp ? 'telegram' : 'web');
    }
  }, [mode]);

  if (loading) {
    return (
      <div className="telebiz-storefront-loading mx-auto w-full max-w-5xl space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2"><div className="h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /><div className="h-2.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></div>
        </div>
        <div className="h-52 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800 sm:h-64" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" /><div className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" /><div className="hidden h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 sm:block" /></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-80 w-full max-w-2xl flex-col items-center justify-center rounded-[28px] border border-rose-200 bg-white px-6 py-12 text-center shadow-sm dark:border-rose-900/60 dark:bg-slate-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"><Store className="h-6 w-6" /></div>
        <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">This store is unavailable</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{error || 'We could not load this business right now.'}</p>
        <button type="button" onClick={loadStorefront} className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-600 dark:bg-indigo-500">Try again</button>
        <p className="mt-4 max-w-md text-[11px] leading-5 text-slate-400">When a business is paused or suspended, public storefront access may be stopped while its historical records remain preserved.</p>
      </div>
    );
  }

  const { business, version, products = [], services = [], branches = [], promotions = [], faqs = [] } = data;
  const catMeta = BUSINESS_CATEGORIES.find((c) => c.id === business.category) || BUSINESS_CATEGORIES[0];
  const layoutSections: any[] = parseJsonArray(version?.layout_json, []);
  const productCategories = ['All', ...Array.from(new Set(products.map((p: any) => p.category_name).filter(Boolean))) as string[]];

  const filteredProducts = products.filter((p: any) => {
    const matchesCat = selectedCategory === 'All' || p.category_name === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const primaryColor = business.primary_color || '#172554';
  const accentColor = business.accent_color || '#4f46e5';
  const selectedService = services.find((service: any) => service.id === selectedServiceId) || services[0];
  const availableTimes = parseJsonArray(selectedService?.available_slots_json, ['09:00', '10:30', '14:00', '16:00']);
  const heroSection = layoutSections.find((section) => section.type === 'hero' && section.visible !== false);
  const promoSections = layoutSections.filter((section) => section.type === 'promo_banner' && section.visible !== false);
  const navItems: Array<{ id: StoreTab; label: string; icon: React.ElementType; show: boolean }> = [
    { id: 'home', label: 'Home', icon: Store, show: true },
    { id: 'catalog', label: 'Shop', icon: Package, show: Boolean(catMeta.supportsProducts) },
    { id: 'bookings', label: 'Bookings', icon: Calendar, show: Boolean(catMeta.supportsBookings) },
    { id: 'support', label: 'Support', icon: MessageSquare, show: true },
    { id: 'about', label: 'About', icon: MapPin, show: true },
  ];
  const visibleNavItems = navItems.filter((item) => item.show);

  const navigateTo = (tab: StoreTab) => {
    setActiveTab(tab);
    recordFunnelEvent('page_view', tab);
  };

  const handleAddToCart = (prod: any) => {
    recordFunnelEvent('buy_click', activeTab, prod.id);
    const variations = parseJsonArray(prod.variations_json, ['Standard']);
    const defaultVar = variations[0] || 'Standard';
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === prod.id);
      if (existing) {
        return prev.map((item) => item.productId === prod.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { productId: prod.id, name: prod.name, price: Number(prod.price), qty: 1, variation: defaultVar }];
    });
  };

  const handleLikeProduct = async (prodId: string) => {
    await recordFunnelEvent('product_like', activeTab, prodId);
    loadStorefront();
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/storefront/' + slug + '/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          telegram_username: telegramUsername,
          delivery_address: deliveryAddress,
          items: cart,
          discount_code: discountCode,
          payment_method: paymentMethod,
          provider_tx_id: providerTxId,
          source: channelSource,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOrderError(json.error || 'Your order could not be submitted. Please try again.');
        return;
      }
      setOrderResult(json);
      setCart([]);
      setCheckoutOpen(false);
      setDiscountCode('');
      loadStorefront();
      if (onOrderCreated) onOrderCreated();
    } catch {
      setOrderError('We could not reach the store. Please check your connection and try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setSubmittingBooking(true);
    try {
      const res = await fetch('/api/storefront/' + slug + '/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedServiceId,
          customer_name: customerName,
          customer_phone: customerPhone,
          booking_date: bookingDate,
          booking_time: bookingTime,
          guests: bookingGuests,
          notes: bookingNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBookingError(json.error || 'Your booking request could not be submitted. Please try again.');
        return;
      }
      setBookingResult(json);
      if (onOrderCreated) onOrderCreated();
    } catch {
      setBookingError('We could not reach the business. Please check your connection and try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportError('');
    setSubmittingSupport(true);
    try {
      const res = await fetch('/api/storefront/' + slug + '/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName + (telegramUsername ? ' (' + telegramUsername + ')' : ''),
          subject: supportSubject || 'Storefront inquiry',
          message: supportMessage,
          channel: channelSource === 'telegram' ? 'telegram_bot' : 'web_chat',
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSupportError(json.error || 'Your message could not be sent. Please try again.');
        return;
      }
      setSupportReplyNotice(json);
      setSupportMessage('');
      setSupportSubject('');
      if (onOrderCreated) onOrderCreated();
    } catch {
      setSupportError('We could not reach the support team. Please try again.');
    } finally {
      setSubmittingSupport(false);
    }
  };

  return (
    <div
      className={'telebiz-storefront relative mx-auto flex w-full max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ' + (mode === 'full_storefront' ? 'my-4 min-h-[min(900px,calc(100vh-32px))]' : 'min-h-[620px]')}
      style={{ ['--store-primary' as any]: primaryColor, ['--store-accent' as any]: accentColor }}
    >
      <header className="telebiz-store-header relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm" style={{ backgroundColor: accentColor }}>
            {business.logo_text || String(business.name || 'B').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="max-w-[220px] truncate text-sm font-bold tracking-tight text-slate-950 dark:text-white sm:max-w-xs sm:text-base">{business.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><BadgeCheck className="h-3 w-3" /> Store</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{String(catMeta.label || business.category || 'Business').replace(/^\d+\.\s*/, '')} · {business.address || 'Online business'}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {mode === 'embedded_preview' && (
            <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-[10px] dark:border-slate-700 dark:bg-slate-900 sm:flex" aria-label="Preview traffic source">
              <span className="px-1.5 text-slate-400">Preview</span>
              <button type="button" onClick={() => setChannelSource('telegram')} className={'rounded-lg px-2.5 py-1.5 font-semibold ' + (channelSource === 'telegram' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500')}>Telegram</button>
              <button type="button" onClick={() => setChannelSource('web')} className={'rounded-lg px-2.5 py-1.5 font-semibold ' + (channelSource === 'web' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500')}>Web</button>
            </div>
          )}
          {catMeta.supportsProducts && (
            <button
              type="button"
              onClick={() => { setCheckoutOpen(true); setOrderError(''); recordFunnelEvent('checkout_init', 'checkout'); }}
              className="relative inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: accentColor }}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Your bag</span>
              <span className="tabular-nums">{cartCount}</span>
              {cartCount > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-300 dark:border-slate-950" />}
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Close storefront">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <nav className="telebiz-store-nav hidden items-center justify-between gap-3 border-y border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:flex sm:px-6" aria-label="Store navigation">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                aria-current={active ? 'page' : undefined}
                className={'inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ' + (active ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white')}
              >
                <Icon className="h-3.5 w-3.5" /> {item.label}
              </button>
            );
          })}
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 text-[10px] font-medium text-slate-400 lg:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Secure business storefront</span>
      </nav>

      {orderResult && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200 sm:mx-6">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Order request received</p>
            <p className="mt-1 text-xs leading-5">Order <span className="font-mono font-bold">{orderResult.orderNumber}</span> · {formatMoney(orderResult.total)} · Reference <span className="font-mono">{orderResult.referenceCode}</span></p>
            <p className="mt-1 text-[11px] leading-5 text-emerald-800/80 dark:text-emerald-200/80">{orderResult.paymentStatus === 'paid' ? 'The payment status has been verified.' : 'Payment is not confirmed yet. The business must verify the transaction before the order is marked as paid.'}</p>
          </div>
          <button type="button" onClick={() => setOrderResult(null)} className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/60" aria-label="Dismiss order confirmation"><X className="h-4 w-4" /></button>
        </div>
      )}

      <main className="telebiz-store-content flex-1 space-y-7 px-4 pb-6 pt-5 sm:px-6 sm:pt-7">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {heroSection ? (
              <section className="telebiz-store-hero relative overflow-hidden rounded-[26px] px-5 py-7 text-white sm:px-8 sm:py-10" style={{ backgroundColor: primaryColor }}>
                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="relative max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{String(catMeta.label || business.category || 'Welcome').replace(/^\d+\.\s*/, '')}</p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{heroSection.title || 'Welcome to ' + business.name}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">{heroSection.subtitle || business.description}</p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {catMeta.supportsProducts && <button type="button" onClick={() => navigateTo('catalog')} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5" style={{ backgroundColor: '#ffffff' }}>{heroSection.ctaText || 'Explore collection'} <ArrowRight className="h-4 w-4" /></button>}
                    {catMeta.supportsBookings && <button type="button" onClick={() => navigateTo('bookings')} className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20">Book a service <Calendar className="h-4 w-4" /></button>}
                  </div>
                </div>
              </section>
            ) : (
              <section className="telebiz-store-hero relative overflow-hidden rounded-[26px] px-5 py-7 text-white sm:px-8 sm:py-10" style={{ backgroundColor: primaryColor }}>
                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="relative max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Welcome to {business.name}</p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{business.name}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">{business.description || 'Explore our products and services, or get in touch with our team.'}</p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {catMeta.supportsProducts && <button type="button" onClick={() => navigateTo('catalog')} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5">Explore collection <ArrowRight className="h-4 w-4" /></button>}
                    {catMeta.supportsBookings && <button type="button" onClick={() => navigateTo('bookings')} className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20">Book a service <Calendar className="h-4 w-4" /></button>}
                  </div>
                </div>
              </section>
            )}

            {promoSections.length > 0 && promotions.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {promoSections.map((section: any, index: number) => {
                  const promo = promotions[index] || promotions[0];
                  return (
                    <div key={section.id || index} className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                      <div className="min-w-0"><p className="text-xs font-bold text-indigo-950 dark:text-indigo-100">{section.title || 'A little something extra'}</p><p className="mt-1 text-[11px] leading-5 text-indigo-700 dark:text-indigo-300">{section.subtitle || 'Use this offer at checkout.'}</p></div>
                      <span className="shrink-0 rounded-xl border border-indigo-200 bg-white px-3 py-2 font-mono text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">{promo.code}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {catMeta.supportsProducts && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Handpicked for you</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Featured collection</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Explore what this business has to offer.</p></div>
                  {products.length > 0 && <button type="button" onClick={() => navigateTo('catalog')} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40">View all <ChevronRight className="h-4 w-4" /></button>}
                </div>
                {products.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center dark:border-slate-700"><Package className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Nothing listed just yet</p><p className="mt-1 text-xs text-slate-500">Please check back soon or contact the business.</p></div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {products.filter((p: any) => p.featured || products.length <= 3).slice(0, 3).map((p: any) => (
                      <article key={p.id} onClick={() => recordFunnelEvent('product_view', 'home', p.id)} className="telebiz-customer-card group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <ProductVisualCard imageType={p.image_type} title={p.name} accentColor={accentColor} />
                        <div className="space-y-3 p-4">
                          <div className="flex items-center justify-between gap-2"><span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">{p.category_name}</span><span className="text-[10px] text-slate-500">{Number(p.stock) > 0 ? 'Available' : 'Out of stock'}</span></div>
                          <div><h4 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950 dark:text-white">{p.name}</h4><p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{p.description}</p></div>
                          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                            <span className="text-sm font-bold tracking-tight text-slate-950 dark:text-white">{formatMoney(p.price, p.currency)}</span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleLikeProduct(p.id); }} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:hover:border-rose-900" aria-label={'Like ' + p.name}><Heart className="h-3.5 w-3.5" /><span>{p.likes_count}</span></button>
                              <button type="button" disabled={Number(p.stock) <= 0} onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }} className="rounded-xl px-3 py-2 text-[11px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: accentColor }}>Add to bag</button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {catMeta.supportsBookings && services.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"><Calendar className="h-5 w-5" /></div><div><h3 className="text-base font-bold text-slate-950 dark:text-white">Plan your next visit</h3><p className="mt-1 max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">Choose a service and send a booking request. The business will confirm the time with you.</p></div></div>
                  <button type="button" onClick={() => navigateTo('bookings')} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white transition hover:brightness-110" style={{ backgroundColor: accentColor }}>Explore bookings <ArrowRight className="h-4 w-4" /></button>
                </div>
              </section>
            )}

            <section className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><BadgeCheck className="h-4 w-4" /></div><div><p className="text-xs font-bold text-slate-800 dark:text-slate-100">Direct from the business</p><p className="mt-0.5 text-[10px] text-slate-500">Talk to the team directly</p></div></div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"><ShoppingBag className="h-4 w-4" /></div><div><p className="text-xs font-bold text-slate-800 dark:text-slate-100">Simple ordering</p><p className="mt-0.5 text-[10px] text-slate-500">Keep your order details together</p></div></div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300"><Clock className="h-4 w-4" /></div><div><p className="text-xs font-bold text-slate-800 dark:text-slate-100">Helpful updates</p><p className="mt-0.5 text-[10px] text-slate-500">Receive order and booking updates</p></div></div>
            </section>
          </div>
        )}

        {activeTab === 'catalog' && catMeta.supportsProducts && (
          <section className="space-y-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Browse and discover</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Shop the collection</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{products.length} item{products.length === 1 ? '' : 's'} from {business.name}</p></div>
              <div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="telebiz-store-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900" aria-label="Search products" /></div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {productCategories.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={'shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold transition ' + (selectedCategory === category ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300')}>{category}</button>)}
            </div>
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center dark:border-slate-700"><Search className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">No matching products</p><p className="mt-1 text-xs text-slate-500">Try another search or choose a different category.</p><button type="button" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-300">Clear filters</button></div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product: any) => (
                  <article key={product.id} className="telebiz-customer-card overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <ProductVisualCard imageType={product.image_type} title={product.name} accentColor={accentColor} />
                    <div className="flex h-full flex-col gap-3 p-4">
                      <div className="flex items-center justify-between gap-2"><span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">{product.category_name}</span><span className={'text-[10px] font-semibold ' + (Number(product.stock) > 0 ? 'text-emerald-600' : 'text-rose-500')}>{Number(product.stock) > 0 ? 'In stock' : 'Unavailable'}</span></div>
                      <div><h3 className="text-sm font-bold leading-5 text-slate-950 dark:text-white">{product.name}</h3><p className="mt-1.5 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{product.description}</p></div>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800"><div><p className="text-sm font-bold text-slate-950 dark:text-white">{formatMoney(product.price, product.currency)}</p>{product.compare_at_price && <p className="mt-0.5 text-[10px] text-slate-400 line-through">{formatMoney(product.compare_at_price, product.currency)}</p>}</div><button type="button" disabled={Number(product.stock) <= 0} onClick={() => handleAddToCart(product)} className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: accentColor }}><Plus className="h-3.5 w-3.5" /> Add to bag</button></div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'bookings' && catMeta.supportsBookings && (
          <section className="grid items-start gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[26px] p-5 text-white sm:p-7" style={{ backgroundColor: primaryColor }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Calendar className="h-6 w-6" /></div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Appointments & reservations</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Make time for what matters.</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">Choose the service that suits you and send your preferred date and time. The business will review and confirm your request.</p>
              {selectedService && <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Selected service</p><p className="mt-1 text-sm font-bold">{selectedService.name}</p><div className="mt-2 flex flex-wrap gap-3 text-[11px] text-white/70"><span>{formatMoney(selectedService.price, selectedService.currency)}</span><span>{selectedService.duration_mins} minutes</span></div></div>}
              <div className="mt-5 flex items-center gap-2 text-[11px] text-white/60"><Clock className="h-4 w-4" /> Your request is not confirmed until the business responds.</div>
            </div>
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Booking request</p><h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Tell us what works for you</h3><p className="mt-1 text-xs leading-5 text-slate-500">We'll pass your request to the team.</p></div>
              {bookingResult && <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><div className="text-xs leading-5"><p className="font-bold">Booking request received</p><p className="mt-0.5">Reference {bookingResult.bookingNumber}. The business will confirm availability for {bookingResult.bookingDate} at {bookingResult.bookingTime}.</p></div></div>}
              {bookingError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{bookingError}</p>}
              <form onSubmit={handleSubmitBooking} className="mt-5 space-y-4">
                <div><label className="telebiz-store-label">Service or package</label><select value={selectedServiceId} onChange={(e) => { setSelectedServiceId(e.target.value); setBookingTime(''); }} className="telebiz-store-input w-full" required>{services.map((service: any) => <option key={service.id} value={service.id}>{service.name} · {formatMoney(service.price, service.currency)}</option>)}</select></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label className="telebiz-store-label">Preferred date</label><input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="telebiz-store-input w-full" required /></div>
                  <div><label className="telebiz-store-label">Preferred time</label><select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="telebiz-store-input w-full" required><option value="">Choose a time</option>{availableTimes.map((time: string) => <option key={time} value={time}>{time}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label className="telebiz-store-label">Your name</label><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" className="telebiz-store-input w-full" required /></div>
                  <div><label className="telebiz-store-label">Phone number</label><input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+251 ..." className="telebiz-store-input w-full" required /></div>
                </div>
                <div><label className="telebiz-store-label">Guests or spaces</label><input type="number" min={1} max={10} value={bookingGuests} onChange={(e) => setBookingGuests(Number(e.target.value))} className="telebiz-store-input w-full" /></div>
                <div><label className="telebiz-store-label">Additional notes <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span></label><textarea rows={3} value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} placeholder="Any preferences or special requests?" className="telebiz-store-input w-full resize-y" /></div>
                <button type="submit" disabled={submittingBooking || services.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: accentColor }}>{submittingBooking ? 'Sending request...' : 'Send booking request'} <ArrowRight className="h-4 w-4" /></button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'support' && (
          <section className="grid items-start gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[26px] p-5 text-white sm:p-7" style={{ backgroundColor: primaryColor }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><MessageSquare className="h-6 w-6" /></div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">We're here to help</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Talk to a real person.</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">Send your question to {business.name}. The team can follow up using the contact details you provide.</p>
              {business.contact_phone && <a href={'tel:' + business.contact_phone} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-xs font-semibold text-white transition hover:bg-white/15"><Phone className="h-4 w-4" /> {business.contact_phone}</a>}
              <div className="mt-6 text-[11px] leading-5 text-white/55">Support requests are saved in the business inbox. Replies may arrive through the business's connected messaging channel.</div>
            </div>
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Customer support</p><h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">How can we help?</h3><p className="mt-1 text-xs leading-5 text-slate-500">Share a little detail and we'll pass it to the right person.</p></div>
              {supportReplyNotice && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" /> Message submitted</div><p className="mt-1 leading-5">Your message is in the business support inbox.</p>{supportReplyNotice.autoReplied && <div className="mt-3 rounded-lg bg-white/80 p-3 leading-5 dark:bg-slate-900/70"><span className="font-bold">Automatic reply: </span>{supportReplyNotice.autoReplyText}</div>}</div>}
              {supportError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{supportError}</p>}
              <form onSubmit={handleSendSupport} className="mt-5 space-y-4">
                <div><label className="telebiz-store-label">Subject</label><input type="text" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="Order question, product details..." className="telebiz-store-input w-full" required /></div>
                <div><label className="telebiz-store-label">Your name</label><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" className="telebiz-store-input w-full" required /></div>
                <div><label className="telebiz-store-label">Phone number <span className="font-normal normal-case tracking-normal text-slate-400">(for a reply)</span></label><input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+251 ..." className="telebiz-store-input w-full" /></div>
                <div><label className="telebiz-store-label">Message</label><textarea rows={5} value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Write your message..." className="telebiz-store-input w-full resize-y" required /></div>
                <button type="submit" disabled={submittingSupport} className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: accentColor }}>{submittingSupport ? 'Sending message...' : 'Send to support'} <Send className="h-4 w-4" /></button>
              </form>
            </div>
            {faqs.length > 0 && <div className="space-y-3 lg:col-span-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Quick answers</p><h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Frequently asked questions</h3></div><div className="grid gap-3 sm:grid-cols-2">{faqs.map((faq: any, index: number) => <article key={faq.id || index} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h4 className="text-xs font-bold text-slate-900 dark:text-white">{faq.title}</h4><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{faq.content}</p></article>)}</div></div>}
          </section>
        )}

        {activeTab === 'about' && (
          <section className="space-y-5">
            <div className="rounded-[26px] p-5 text-white sm:p-7" style={{ backgroundColor: primaryColor }}><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Get to know us</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">About {business.name}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">{business.about_text || business.description || 'Learn more about this business and how to get in touch.'}</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white"><MapPin className="h-4 w-4 text-indigo-500" /> Find us</div><p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{business.address || 'Contact the business for its location.'}</p>{business.contact_phone && <a href={'tel:' + business.contact_phone} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300"><Phone className="h-3.5 w-3.5" /> {business.contact_phone}</a>}{business.contact_email && <a href={'mailto:' + business.contact_email} className="mt-2 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300"><Mail className="h-3.5 w-3.5" /> {business.contact_email}</a>}</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white"><Store className="h-4 w-4 text-indigo-500" /> Business details</div><p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{String(catMeta.label || business.category || 'Business').replace(/^\d+\.\s*/, '')}</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{business.description}</p></div>
            </div>
            {branches.length > 0 && <div className="space-y-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Visit us</p><h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Our locations</h3></div><div className="grid gap-3 sm:grid-cols-2">{branches.map((branch: any) => <article key={branch.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h4 className="text-sm font-bold text-slate-950 dark:text-white">{branch.name}</h4><p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {branch.address}</p>{branch.working_hours && <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {branch.working_hours}</p>}{branch.phone && <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Phone className="h-3.5 w-3.5" /> {branch.phone}</p>}</article>)}</div></div>}
          </section>
        )}
      </main>

      {catMeta.supportsProducts && cartCount > 0 && (
        <div className="telebiz-cart-summary sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
          <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{cartCount} item{cartCount === 1 ? '' : 's'} in your bag</p><p className="mt-0.5 truncate text-sm font-bold text-slate-950 dark:text-white">{formatMoney(cartSubtotal)}</p></div>
          <button type="button" onClick={() => { setCheckoutOpen(true); setOrderError(''); recordFunnelEvent('checkout_init', 'checkout'); }} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:brightness-110" style={{ backgroundColor: accentColor }}>Review bag <ArrowRight className="h-4 w-4" /></button>
        </div>
      )}

      <footer className="border-t border-slate-100 px-5 py-4 text-center dark:border-slate-800">
        <p className="text-[10px] text-slate-400">Powered by <span className="font-semibold text-slate-500 dark:text-slate-300">TeleBiz</span> · {business.name}</p>
      </footer>

      <nav className="telebiz-store-mobile-nav sticky bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1.5 pt-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:hidden" aria-label="Store sections">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button key={item.id} type="button" onClick={() => navigateTo(item.id)} aria-current={active ? 'page' : undefined} className={'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-bold transition ' + (active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}>
              <span className={'flex h-8 w-9 items-center justify-center rounded-xl ' + (active ? 'bg-indigo-50 dark:bg-indigo-950/60' : '')}><Icon className="h-4 w-4" /></span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {checkoutOpen && (
        <div className="telebiz-checkout-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setCheckoutOpen(false); }}>
          <section className="telebiz-checkout-panel max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950 sm:rounded-[28px]" role="dialog" aria-modal="true" aria-labelledby="telebiz-checkout-title">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-7">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Almost yours</p><h2 id="telebiz-checkout-title" className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Review your bag</h2></div>
              <button type="button" onClick={() => setCheckoutOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Close checkout"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              {orderError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{orderError}</p>}
              {cart.length === 0 ? (
                <div className="py-10 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">Your bag is empty</p><p className="mt-1 text-xs text-slate-500">Explore the collection and add something you love.</p><button type="button" onClick={() => { setCheckoutOpen(false); navigateTo('catalog'); }} className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-300">Browse products</button></div>
              ) : (
                <form onSubmit={handleSubmitOrder} className="space-y-5">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-800 dark:text-indigo-300"><Package className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.name}</p><p className="mt-1 text-[10px] text-slate-500">{item.variation} · {formatMoney(item.price)}</p><p className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">{formatMoney(item.price * item.qty)}</p></div></div>
                        <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => setCart((prev) => prev.map((entry) => entry.productId === item.productId ? { ...entry, qty: entry.qty - 1 } : entry).filter((entry) => entry.qty > 0))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" aria-label={'Remove one ' + item.name}><Minus className="h-3.5 w-3.5" /></button><span className="w-4 text-center text-xs font-bold tabular-nums">{item.qty}</span><button type="button" onClick={() => setCart((prev) => prev.map((entry) => entry.productId === item.productId ? { ...entry, qty: entry.qty + 1 } : entry))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" aria-label={'Add one ' + item.name}><Plus className="h-3.5 w-3.5" /></button></div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div><label className="telebiz-store-label">Full name</label><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" className="telebiz-store-input w-full" required /></div>
                    <div><label className="telebiz-store-label">Phone number</label><input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+251 ..." className="telebiz-store-input w-full" required /></div>
                    <div><label className="telebiz-store-label">Delivery or pickup address</label><input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Where should we deliver?" className="telebiz-store-input w-full" required /></div>
                    <div><label className="telebiz-store-label">Promo code <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span></label><input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Enter a code" className="telebiz-store-input w-full uppercase" /></div>
                  </div>

                  {channelSource === 'telegram' && <div><label className="telebiz-store-label">Telegram username <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span></label><input type="text" value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} placeholder="@username" className="telebiz-store-input w-full" /></div>}

                  <div><label className="telebiz-store-label">Preferred payment method</label><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="telebiz-store-input w-full"><option value="telebirr">Telebirr</option><option value="telegram_stars">Telegram Stars (digital goods)</option><option value="cbe_birr">CBE Birr</option><option value="card">Debit or credit card</option></select></div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">Submitting this form sends your order request to the business. It does not confirm that payment has been completed. The business must verify the payment before marking the order as paid.</div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Order subtotal</p><p className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{formatMoney(cartSubtotal)}</p></div><button type="submit" disabled={submittingOrder || cart.length === 0} className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: accentColor }}>{submittingOrder ? 'Sending order...' : 'Submit order request'} <ArrowRight className="h-4 w-4" /></button></div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
