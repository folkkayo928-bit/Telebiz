import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Calendar,
  MessageSquare,
  Heart,
  Search,
  Check,
  MapPin,
  Clock,
  Phone,
  Send,
  Sparkles,
  ExternalLink,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../i18n/translations';

interface StorefrontProps {
  slug: string;
  mode?: 'embedded_preview' | 'full_storefront';
  onOrderCreated?: () => void;
  onClose?: () => void;
}

export function ProductVisualCard({ imageType, title, accentColor }: { imageType: string; title: string; accentColor: string }) {
  const palettes: Record<string, { bg: string; label: string }> = {
    coffee: { bg: 'from-stone-900 via-stone-800 to-amber-950', label: 'Single-Origin Micro-Lot' },
    ceramic: { bg: 'from-slate-900 via-slate-800 to-zinc-800', label: 'Artisan Pour-Over Gear' },
    leather: { bg: 'from-amber-950 via-stone-900 to-neutral-900', label: 'Highland Full-Grain Leather' },
    coldbrew: { bg: 'from-sky-950 via-slate-900 to-indigo-950', label: 'Nitrogen Infused RTD' },
    hotel: { bg: 'from-teal-950 via-slate-900 to-emerald-950', label: 'Hospitality & Suite Experience' },
    salon: { bg: 'from-rose-950 via-stone-900 to-neutral-900', label: 'Botanical Clinical Formulation' },
  };
  const selected = palettes[imageType] || palettes.coffee;

  return (
    <div
      className={`relative w-full aspect-[4/3] bg-gradient-to-br ${selected.bg} overflow-hidden flex flex-col justify-between p-4 text-white select-none`}
    >
      <div className="flex items-center justify-between text-[11px] text-white/75 tracking-tight">
        <span>{selected.label}</span>
        <span className="font-mono">VERIFIED SKU</span>
      </div>
      <div className="my-auto flex items-center justify-center">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/15 bg-white/10 backdrop-blur-xs text-lg font-display font-bold"
          style={{ borderColor: accentColor }}
        >
          {title.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="text-xs font-medium text-white/90 truncate">{title}</div>
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
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'bookings' | 'support' | 'about'>('home');
  const [channelSource, setChannelSource] = useState<'telegram' | 'web'>('telegram');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart & Checkout State
  const [cart, setCart] = useState<Array<{ productId: string; name: string; price: number; qty: number; variation: string }>>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Biniyam Alemayehu');
  const [customerPhone, setCustomerPhone] = useState('+251 911 405 102');
  const [telegramUsername, setTelegramUsername] = useState('@bini_addis');
  const [deliveryAddress, setDeliveryAddress] = useState('Bole Atlas, Addis Ababa');
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'telegram_stars' | 'cbe_birr' | 'card'>('telebirr');
  const [providerTxId, setProviderTxId] = useState('');
  const [orderResult, setOrderResult] = useState<any>(null);

  // Booking State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-11-05');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingGuests, setBookingGuests] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Support State
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportReplyNotice, setSupportReplyNotice] = useState<any>(null);

  const sessionId = 'sess_' + slug;

  const recordFunnelEvent = async (eventType: string, pageName = activeTab, productId?: string) => {
    try {
      await fetch(`/api/storefront/${slug}/event`, {
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
      // silent telemetry
    }
  };

  const loadStorefront = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/storefront/${slug}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Unable to load storefront');
      } else {
        setData(json);
        if (json.services?.length > 0 && !selectedServiceId) {
          setSelectedServiceId(json.services[0].id);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorefront();
    recordFunnelEvent('app_visit', 'home');
  }, [slug]);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-xl text-center space-y-3">
        <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error || 'Storefront unavailable'}</div>
        <p className="text-xs text-slate-500">
          When a business is paused or suspended by the Platform Super Admin, public Mini App access is safely halted while preserving all historical data.
        </p>
      </div>
    );
  }

  const { business, version, products = [], services = [], branches = [], promotions = [], faqs = [] } = data;
  const catMeta = BUSINESS_CATEGORIES.find((c) => c.id === business.category) || BUSINESS_CATEGORIES[0];
  const layoutSections: any[] = version?.layout_json ? JSON.parse(version.layout_json) : [];
  const productCategories = ['All', ...Array.from(new Set(products.map((p: any) => p.category_name))) as string[]];

  const filteredProducts = products.filter((p: any) => {
    const matchesCat = selectedCategory === 'All' || p.category_name === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (prod: any) => {
    recordFunnelEvent('buy_click', activeTab, prod.id);
    const variations = JSON.parse(prod.variations_json || '["Standard"]');
    const defaultVar = variations[0] || 'Standard';
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) => (i.productId === prod.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId: prod.id, name: prod.name, price: prod.price, qty: 1, variation: defaultVar }];
    });
  };

  const handleLikeProduct = async (prodId: string) => {
    await recordFunnelEvent('product_like', activeTab, prodId);
    loadStorefront();
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/storefront/${slug}/checkout`, {
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
    if (res.ok) {
      setOrderResult(json);
      setCart([]);
      setCheckoutOpen(false);
      loadStorefront();
      if (onOrderCreated) onOrderCreated();
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/storefront/${slug}/book`, {
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
    if (res.ok) {
      setBookingResult(json);
      if (onOrderCreated) onOrderCreated();
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/storefront/${slug}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: `${customerName} (${telegramUsername})`,
        subject: supportSubject || 'Telegram Mini App Inquiry',
        message: supportMessage,
        channel: channelSource === 'telegram' ? 'telegram_bot' : 'web_chat',
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setSupportReplyNotice(json);
      setSupportMessage('');
      setSupportSubject('');
      if (onOrderCreated) onOrderCreated();
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col ${
        mode === 'full_storefront' ? 'max-w-4xl mx-auto shadow-lg my-6' : 'w-full'
      }`}
    >
      {/* Top Bar Simulating Telegram Mini App Header or Web Bar */}
      <div
        className="px-4 py-3 text-white flex items-center justify-between gap-2"
        style={{ backgroundColor: business.primary_color || '#0F172A' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs text-white shrink-0"
            style={{ backgroundColor: business.accent_color || '#0284C7' }}
          >
            {business.logo_text}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-display font-semibold truncate">{business.name}</div>
            <div className="text-[11px] text-slate-300 truncate">
              {channelSource === 'telegram'
                ? `Telegram Mini App · ${business.telegram_bot_username || '@MiniAppBot'}`
                : `Web Storefront · ${business.custom_domain || `telebiz.os/s/${business.slug}`}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-white/10 p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setChannelSource('telegram')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                channelSource === 'telegram' ? 'bg-white text-slate-900 font-semibold' : 'text-white/80 hover:text-white'
              }`}
            >
              Telegram App
            </button>
            <button
              type="button"
              onClick={() => setChannelSource('web')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                channelSource === 'web' ? 'bg-white text-slate-900 font-semibold' : 'text-white/80 hover:text-white'
              }`}
            >
              Web Access
            </button>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              title="Close Storefront"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs inside Mini App (Only relevant tabs for business category) */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              recordFunnelEvent('page_view', 'home');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Storefront
          </button>
          {catMeta.supportsProducts && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('catalog');
                recordFunnelEvent('page_view', 'catalog');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Products ({products.length})
            </button>
          )}
          {catMeta.supportsBookings && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('bookings');
                recordFunnelEvent('page_view', 'bookings');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Bookings ({services.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setActiveTab('support');
              recordFunnelEvent('page_view', 'support');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'support'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Support Chat
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('about');
              recordFunnelEvent('page_view', 'about');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Hours & Info
          </button>
        </div>

        {catMeta.supportsProducts && (
          <button
            type="button"
            onClick={() => {
              setCheckoutOpen(true);
              recordFunnelEvent('checkout_init', 'checkout');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: business.accent_color || '#0284C7' }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="tabular-nums">Cart ({cart.reduce((s, i) => s + i.qty, 0)})</span>
          </button>
        )}
      </div>

      {/* Order Confirmation Banner */}
      {orderResult && (
        <div className="m-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Order {orderResult.orderNumber} Submitted · Total: {orderResult.total.toLocaleString()} ETB
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300">
              Payment Reference: <span className="font-mono font-semibold">{orderResult.referenceCode}</span> · Status:{' '}
              <span className="font-semibold uppercase">{orderResult.paymentStatus}</span>
              {orderResult.paymentStatus === 'pending_verification' &&
                ' (Awaiting gateway/admin verification before marking order as Paid)'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOrderResult(null)}
            className="text-xs text-emerald-700 hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 space-y-5 max-h-[640px] overflow-y-auto">
        {activeTab === 'home' && (
          <div className="space-y-5">
            {/* Render Configured Builder Sections dynamically */}
            {layoutSections
              .filter((sec) => sec.visible !== false)
              .map((sec) => {
                if (sec.type === 'hero') {
                  return (
                    <div
                      key={sec.id}
                      className="p-5 rounded-xl text-white space-y-3"
                      style={{ backgroundColor: business.primary_color || '#0F172A' }}
                    >
                      <div className="text-xs text-slate-300">
                        {catMeta.label.replace(/^\d+\.\s*/, '')} · {business.address}
                      </div>
                      <h2 className="text-xl font-display font-bold leading-snug">{sec.title}</h2>
                      <p className="text-xs text-slate-300 leading-relaxed">{sec.subtitle}</p>
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        {catMeta.supportsProducts && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('catalog')}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-95"
                            style={{ backgroundColor: business.accent_color || '#0284C7' }}
                          >
                            {sec.ctaText || 'Browse Catalog'}
                          </button>
                        )}
                        {catMeta.supportsBookings && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('bookings')}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
                          >
                            Book Appointment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                if (sec.type === 'promo_banner' && promotions.length > 0) {
                  return (
                    <div
                      key={sec.id}
                      className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-semibold text-sky-950 dark:text-sky-100">{sec.title}</div>
                        <div className="text-[11px] text-sky-700 dark:text-sky-300">{sec.subtitle}</div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-sky-800 dark:text-sky-200 shrink-0">
                        {promotions[0].code}
                      </span>
                    </div>
                  );
                }

                return null;
              })}

            {/* Featured Products Preview */}
            {catMeta.supportsProducts && products.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100">
                    Featured Offerings
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className="text-xs font-medium text-sky-600 hover:underline"
                  >
                    View all ({products.length})
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.slice(0, 4).map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => recordFunnelEvent('product_view', 'home', p.id)}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col justify-between"
                    >
                      <ProductVisualCard
                        imageType={p.image_type}
                        title={p.name}
                        accentColor={business.accent_color}
                      />
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{p.category_name}</span>
                          <span className="tabular-nums">Stock: {p.stock}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {p.name}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                            {Number(p.price).toLocaleString()} {p.currency}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeProduct(p.id);
                              }}
                              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center gap-1"
                              title="Like Product"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              <span className="tabular-nums">{p.likes_count}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(p);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap"
                              style={{ backgroundColor: business.accent_color || '#0284C7' }}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Catalog Tab */}
        {activeTab === 'catalog' && catMeta.supportsProducts && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name or description..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {productCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 bg-white dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{p.category_name} · SKU: {p.sku}</span>
                      <span className="tabular-nums">{p.stock} in stock</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</div>
                    <p className="text-xs text-slate-500">{p.description}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                        {Number(p.price).toLocaleString()} {p.currency}
                      </span>
                      {p.compare_at_price && (
                        <span className="ml-2 text-xs text-slate-400 line-through tabular-nums">
                          {Number(p.compare_at_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: business.accent_color || '#0284C7' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings & Reservations Tab */}
        {activeTab === 'bookings' && catMeta.supportsBookings && (
          <div className="space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
              Schedule an Appointment or Reservation
            </h3>
            {bookingResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-200">
                Booking Confirmed! Reference <span className="font-mono font-semibold">{bookingResult.bookingNumber}</span> for{' '}
                {bookingResult.serviceName} on {bookingResult.bookingDate} at {bookingResult.bookingTime}.
              </div>
            )}
            <form onSubmit={handleSubmitBooking} className="space-y-3 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Service or Package
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration_mins} mins — {Number(s.price).toLocaleString()} {s.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="09:30">09:30</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="16:30">16:30</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Guests / Spots</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Special Requests</label>
                <input
                  type="text"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Optional dietary, stylist, or viewing preferences..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white"
                style={{ backgroundColor: business.accent_color || '#0284C7' }}
              >
                Submit Booking Request
              </button>
            </form>
          </div>
        )}

        {/* Customer Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Direct Support · {business.telegram_bot_username || 'Connected Telegram Inbox'}
              </div>
              <p className="text-[11px] text-slate-500">
                Messages sent here route directly to {business.name}&apos;s multi-agent Support Center alongside your order history.
              </p>
            </div>

            {supportReplyNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 space-y-1.5 text-xs">
                <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Message delivered to Support Inbox!
                </div>
                {supportReplyNotice.autoReplied && (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Instant Auto-Reply: </span>
                    {supportReplyNotice.autoReplyText}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendSupport} className="space-y-3 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Topic / Order #</label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="e.g., Delivery status or wholesale question"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message (Mention &quot;delivery&quot; or &quot;payment&quot; to test instant FAQ auto-reply)
                </label>
                <textarea
                  rows={3}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Write your question to the business support team..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5"
                style={{ backgroundColor: business.accent_color || '#0284C7' }}
              >
                <Send className="w-3.5 h-3.5" />
                Send Message to Support Inbox
              </button>
            </form>

            {faqs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Frequently Asked Questions</h4>
                {faqs.map((f: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">{f.title}</div>
                    <div className="text-slate-500">{f.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About, Working Hours & Branches Tab */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">About {business.name}</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{business.about_text || business.description}</p>
              <div className="pt-2 flex flex-wrap gap-4 text-slate-500 border-t border-slate-100 dark:border-slate-800">
                <span>Phone: {business.contact_phone}</span>
                <span>·</span>
                <span>Email: {business.contact_email}</span>
                <span>·</span>
                <span>Address: {business.address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">Active Branches ({branches.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {branches.map((br: any) => (
                  <div key={br.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">{br.name}</div>
                    <div className="text-slate-500">{br.address}</div>
                    <div className="text-slate-500">
                      Hours: {br.working_hours} · Manager: {br.manager_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Drawer / Modal inside Storefront */}
      {checkoutOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
              Shopping Cart & Secure Checkout
            </h3>
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Your cart is empty. Add products from the storefront to initiate checkout.
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-3">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-slate-500 tabular-nums">
                        {item.price.toLocaleString()} ETB × {item.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) =>
                            prev
                              .map((i) => (i.productId === item.productId ? { ...i, qty: i.qty - 1 } : i))
                              .filter((i) => i.qty > 0)
                          )
                        }
                        className="p-1 rounded border border-slate-200 dark:border-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-mono">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i))
                          )
                        }
                        className="p-1 rounded border border-slate-200 dark:border-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Delivery Address"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Promo Code (e.g. TELEBIZ15)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="telebirr">Telebirr SuperApp</option>
                    <option value="telegram_stars">Telegram Stars (Digital/Mini App)</option>
                    <option value="cbe_birr">CBE Birr Transfer</option>
                    <option value="card">Web Debit/Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Gateway Transaction ID (Leave blank to test Pending Verification)
                  </label>
                  <input
                    type="text"
                    value={providerTxId}
                    onChange={(e) => setProviderTxId(e.target.value)}
                    placeholder="Optional e.g. TLB20269918"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs">
                  Subtotal:{' '}
                  <span className="font-mono font-semibold text-sm tabular-nums">
                    {cartSubtotal.toLocaleString()} ETB
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: business.accent_color || '#0284C7' }}
                >
                  Submit Order
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
