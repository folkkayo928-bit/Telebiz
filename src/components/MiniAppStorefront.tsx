import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Heart,
  LayoutGrid,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../i18n/translations';

interface StorefrontProps {
  slug: string;
  mode?: 'embedded_preview' | 'full_storefront';
  overrideTheme?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    buttonStyle?: string;
    cardRadius?: string;
  };
  canQuickEdit?: boolean;
  authToken?: string;
  onOpenBuilder?: () => void;
  onOpenCatalog?: () => void;
  onOrderCreated?: () => void;
  onClose?: () => void;
}

type StoreTab = 'home' | 'catalog' | 'wishlist' | 'bookings' | 'support' | 'about';

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

const PRODUCT_SWATCHES: Record<string, Array<{ name: string; hex: string }>> = {
  thobe_white: [
    { name: 'Pure Ivory', hex: '#F8F7F4' },
    { name: 'Obsidian Black', hex: '#1C1D21' },
    { name: 'Royal Navy', hex: '#1E293B' },
    { name: 'Warm Sand', hex: '#D6C4A8' },
  ],
  thobe_black: [
    { name: 'Obsidian Gold', hex: '#18181B' },
    { name: 'Midnight Navy', hex: '#1E293B' },
    { name: 'Charcoal', hex: '#52525B' },
    { name: 'Sand', hex: '#D4C3A3' },
  ],
  thobe_set: [
    { name: 'Classic White + Red Ghutra', hex: '#F8FAFC' },
    { name: 'Cream + Gold Agal', hex: '#E6D7B8' },
    { name: 'Navy Set', hex: '#1E3A8A' },
  ],
  thobe_gray: [
    { name: 'Charcoal Slate', hex: '#4B5563' },
    { name: 'Obsidian', hex: '#18181B' },
    { name: 'Warm Taupe', hex: '#A89F91' },
  ],
  bisht_gold: [
    { name: 'Black & Gold Zari', hex: '#1C1917' },
    { name: 'Camel & Gold Zari', hex: '#C29B61' },
    { name: 'Cream & Gold Zari', hex: '#F5EFE6' },
  ],
  default: [
    { name: 'Signature', hex: '#0F382A' },
    { name: 'Warm Sand', hex: '#C69C6D' },
    { name: 'Obsidian', hex: '#1E293B' },
    { name: 'Alabaster', hex: '#F5F2EB' },
  ],
};

export function ProductVisualCard({
  imageType,
  imageUrl,
  galleryUrls = [],
  title,
  accentColor,
  aspectClass = 'aspect-[1/1.05]',
  variantIndex = 0,
}: {
  imageType: string;
  imageUrl?: string;
  galleryUrls?: string[];
  title: string;
  accentColor: string;
  aspectClass?: string;
  variantIndex?: number;
}) {
  const resolvedPhotos = [
    ...(Array.isArray(galleryUrls) ? galleryUrls.filter(Boolean) : []),
    ...(imageUrl ? [imageUrl] : []),
  ];
  const uniquePhotos = Array.from(new Set(resolvedPhotos));
  const chosenPhoto = uniquePhotos.length > 0 ? uniquePhotos[variantIndex % uniquePhotos.length] : '';

  if (chosenPhoto) {
    return (
      <div
        className={`telebiz-product-art relative flex ${aspectClass} w-full items-center justify-center overflow-hidden bg-[#EFE7DA]`}
      >
        <img
          src={chosenPhoto}
          alt={title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{
            transform:
              uniquePhotos.length === 1 && variantIndex > 0
                ? `scale(${1 + variantIndex * 0.06})`
                : undefined,
          }}
        />
      </div>
    );
  }
  const studioBackdrops: Record<string, string> = {
    thobe_white: 'from-[#EDE4D3] via-[#E4D8C4] to-[#D5C4AA]',
    thobe_black: 'from-[#E8DEC9] via-[#DDD0B8] to-[#CBB899]',
    thobe_set: 'from-[#EFE6D8] via-[#E5D7C1] to-[#D4C2A6]',
    thobe_gray: 'from-[#E6DDD0] via-[#DACGB8] to-[#C8B89E]',
    bisht_gold: 'from-[#29221C] via-[#3A2E23] to-[#1F1915]',
    agal_black: 'from-[#EFE8DC] via-[#E4DAC8] to-[#D2C3AB]',
    jalabiya_sand: 'from-[#F0E7D8] via-[#E5D8C3] to-[#D5C3A8]',
    accessories_gold: 'from-[#231F1C] via-[#332B24] to-[#171412]',
    coffee: 'from-[#EFE7DA] via-[#E4D6C3] to-[#D4C0A5]',
    ceramic: 'from-[#ECEAE4] via-[#DFDCD4] to-[#CECAC0]',
    leather: 'from-[#EDE0D1] via-[#DFCCB6] to-[#CCAFA0]',
    coldbrew: 'from-[#E4ECEF] via-[#D2E0E6] to-[#BBD0D9]',
    hotel: 'from-[#E4EFEA] via-[#CFE2DA] to-[#B5D0C5]',
    salon: 'from-[#F3E5E8] via-[#E8D2D7] to-[#D9B8C0]',
  };
  const bgGradient = studioBackdrops[imageType] || 'from-[#EFE7DA] via-[#E3D6C2] to-[#D4C2A7]';
  const isDarkStudio = imageType === 'bisht_gold' || imageType === 'accessories_gold';

  const renderIllustration = () => {
    if (imageType?.startsWith('thobe') || imageType === 'jalabiya_sand' || imageType === 'bisht_gold') {
      const garmentFill =
        imageType === 'thobe_black' || imageType === 'bisht_gold'
          ? '#18181B'
          : imageType === 'thobe_gray'
          ? '#52525B'
          : imageType === 'jalabiya_sand'
          ? '#D6C1A3'
          : '#FFFFFF';
      const trimStroke =
        imageType === 'thobe_black' || imageType === 'bisht_gold' || imageType === 'jalabiya_sand'
          ? '#D4AF37'
          : '#CBD5E1';

      return (
        <svg
          viewBox="0 0 180 210"
          className="h-[82%] w-[82%] drop-shadow-[0_16px_24px_rgba(15,23,42,0.18)] transition-transform duration-300 group-hover:scale-105"
          style={{ transform: variantIndex ? `scale(${1 + variantIndex * 0.04})` : undefined }}
        >
          {/* Decorative indoor palm leaf silhouette in corner like reference photo */}
          <g opacity="0.22" fill="#15432E">
            <path d="M0,45 Q32,38 48,15 Q25,22 0,30 Z" />
            <path d="M0,65 Q38,55 58,34 Q30,42 0,50 Z" />
            <path d="M0,85 Q35,78 52,60 Q28,66 0,72 Z" />
          </g>
          {/* Wooden Hanger */}
          <path d="M72,22 Q90,10 108,22" fill="none" stroke="#5C4033" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M90,10 L90,16" fill="none" stroke="#94A3B8" strokeWidth="2.5" />
          {/* Tailored Thobe / Bisht Silhouette */}
          <path
            d="M58,28 L74,21 L106,21 L122,28 L142,108 L125,112 L114,56 L118,194 L62,194 L66,56 L55,112 L38,108 Z"
            fill={garmentFill}
            stroke={trimStroke}
            strokeWidth="1.5"
          />
          {/* Mandarin Collar & Placket */}
          <path d="M75,21 Q90,29 105,21 L105,30 Q90,37 75,30 Z" fill={garmentFill} stroke={trimStroke} strokeWidth="1.5" />
          <rect x="87" y="32" width="6" height="58" rx="2" fill={garmentFill} stroke={trimStroke} strokeWidth="1.5" />
          {/* Gold Embroidery for Embroidered / Bisht */}
          {(imageType === 'thobe_black' || imageType === 'bisht_gold') && (
            <g stroke="#D4AF37" strokeWidth="2" fill="none">
              <rect x="83" y="31" width="14" height="62" rx="3" strokeDasharray="3 2" />
              <line x1="40" y1="102" x2="56" y2="106" />
              <line x1="140" y1="102" x2="124" y2="106" />
            </g>
          )}
          {/* Red & White Ghutra Scarf drape for Thobe Set */}
          {imageType === 'thobe_set' && (
            <g>
              <path d="M68,22 Q90,36 112,22 L118,68 Q90,54 62,68 Z" fill="#DC2626" opacity="0.85" />
              <ellipse cx="90" cy="21" rx="18" ry="5" fill="#111827" />
            </g>
          )}
        </svg>
      );
    }

    if (imageType === 'agal_black' || imageType === 'accessories_gold') {
      return (
        <svg viewBox="0 0 180 180" className="h-[76%] w-[76%] drop-shadow-[0_14px_22px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:scale-105">
          <circle cx="90" cy="88" r="46" fill="none" stroke="#18181B" strokeWidth="12" />
          <circle cx="90" cy="82" r="46" fill="none" stroke="#27272A" strokeWidth="10" />
          <circle cx="90" cy="82" r="46" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M78,128 L72,162 M102,128 L108,162" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    }

    if (imageType === 'coffee' || imageType === 'coldbrew') {
      return (
        <svg viewBox="0 0 180 190" className="h-[78%] w-[78%] drop-shadow-[0_16px_24px_rgba(15,23,42,0.18)] transition-transform duration-300 group-hover:scale-105">
          <rect x="48" y="28" width="84" height="134" rx="14" fill="#1E1B18" stroke="#D4AF37" strokeWidth="1.5" />
          <path d="M48,48 L132,48" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
          <rect x="60" y="64" width="60" height="62" rx="6" fill="#FAF8F5" />
          <circle cx="90" cy="84" r="10" fill={accentColor || '#B45309'} opacity="0.9" />
          <rect x="68" y="102" width="44" height="5" rx="2.5" fill="#1E293B" />
          <rect x="74" y="112" width="32" height="4" rx="2" fill="#94A3B8" />
        </svg>
      );
    }

    // Default luxury package / hospitality / beauty studio silhouette
    return (
      <div className="relative flex flex-col items-center justify-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/50 bg-white/85 text-2xl font-display font-bold shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105"
          style={{ color: accentColor || '#0F382A' }}
        >
          {String(title || 'TB').slice(0, 2).toUpperCase()}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`telebiz-product-art relative flex ${aspectClass} w-full items-center justify-center overflow-hidden bg-gradient-to-br ${bgGradient}`}
    >
      {/* Subtle studio lighting vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.45),transparent_70%)]" />
      {renderIllustration()}
      {isDarkStudio && (
        <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 truncate text-center text-[10px] font-medium tracking-wider uppercase text-amber-200/80">
          Royal Reserve
        </div>
      )}
    </div>
  );
}

export const MiniAppStorefront: React.FC<StorefrontProps> = ({
  slug,
  mode = 'embedded_preview',
  overrideTheme,
  canQuickEdit = false,
  authToken = '',
  onOpenBuilder,
  onOpenCatalog,
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
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

  // Product Detail View (Screen 3 from Reference Photo) + 3-Screen Showcase Mode
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<any>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [showcaseLayout, setShowcaseLayout] = useState<'interactive' | 'three_screen'>('interactive');
  const [shareFeedback, setShareFeedback] = useState('');

  // 24/7 Automatic Customer Identification State (No Account Required for Customers)
  const [customerIdentity, setCustomerIdentity] = useState<any>(null);

  // Quick Edit-in-Preview state (kept minimal; full editing is in the dedicated Builder Studio)
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [livePrimary, setLivePrimary] = useState('');
  const [liveAccent, setLiveAccent] = useState('');
  const [liveFont, setLiveFont] = useState('');
  const [quickAddCat, setQuickAddCat] = useState('');
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickNotice, setQuickNotice] = useState('');

  // Cart & checkout state
  const [cart, setCart] = useState<Array<{ productId: string; name: string; price: number; qty: number; variation: string; color?: string }>>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

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

  const recordFunnelEvent = async (eventType: string, pageName: string = activeTab, productId?: string, sourceOverride?: 'telegram' | 'web') => {
    try {
      await fetch('/api/storefront/' + slug + '/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          page_name: pageName,
          product_id: productId || null,
          source: sourceOverride || channelSource,
          device_type: (sourceOverride || channelSource) === 'telegram' ? 'mobile_tg' : 'desktop_web',
          session_id: sessionId,
        }),
      });
    } catch {
      // ignore optional telemetry error
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
        const methods = Array.isArray(json.paymentMethods) ? json.paymentMethods : [];
        setSelectedPaymentMethodId((current) =>
          methods.some((method: any) => method.id === current) ? current : (methods[0]?.id || '')
        );
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
    const telegramWebApp = typeof window !== 'undefined' && Boolean((window as any).Telegram?.WebApp?.initData);
    const detectedSource = telegramWebApp ? 'telegram' : 'web';
    setChannelSource(detectedSource);
    setSelectedProductForDetail(null);
    setSelectedCategory('All');
    loadStorefront();
    recordFunnelEvent('app_visit', 'home', undefined, detectedSource);

    // 24/7 Automatic Customer Identification & Store Owner Attribution Handshake
    try {
      let fp = localStorage.getItem('telebiz_visitor_fp');
      if (!fp) {
        fp = 'fp_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('telebiz_visitor_fp', fp);
      }
      const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
      fetch('/api/storefront/' + slug + '/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_fingerprint: fp,
          telegram_id: tgUser?.id ? String(tgUser.id) : '',
          telegram_username: tgUser?.username ? `@${tgUser.username}` : '',
          source: detectedSource,
        }),
      })
        .then((r) => r.json())
        .then((ident) => {
          if (ident?.identified) {
            setCustomerIdentity(ident);
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }, [slug, mode]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-5 rounded-[32px] border border-stone-200 bg-[#FAF8F5] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-stone-200" />
          <div className="h-8 w-40 animate-pulse rounded-xl bg-stone-200" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-stone-200" />
        </div>
        <div className="h-56 animate-pulse rounded-3xl bg-stone-200/70" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="h-52 animate-pulse rounded-2xl bg-stone-200/70" />
          <div className="h-52 animate-pulse rounded-2xl bg-stone-200/70" />
          <div className="hidden h-52 animate-pulse rounded-2xl bg-stone-200/70 sm:block" />
          <div className="hidden h-52 animate-pulse rounded-2xl bg-stone-200/70 sm:block" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-80 w-full max-w-2xl flex-col items-center justify-center rounded-[28px] border border-rose-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Store className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-950">This store is unavailable</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{error || 'We could not load this business right now.'}</p>
        <button type="button" onClick={loadStorefront} className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  const { business, version, products = [], services = [], branches = [], promotions = [], faqs = [], paymentMethods = [] } = data;
  const catMeta = BUSINESS_CATEGORIES.find((c) => c.id === business.category) || BUSINESS_CATEGORIES[0];
  const layoutSections: any[] = parseJsonArray(version?.layout_json, []);
  const versionTheme = (() => {
    try {
      return version?.theme_json ? JSON.parse(version.theme_json) : {};
    } catch {
      return {};
    }
  })();

  const customCats = parseJsonArray(business.categories_json, []);
  const productCategories = [
    'All',
    ...(Array.from(
      new Set([
        ...customCats,
        ...products.map((p: any) => p.category_name).filter(Boolean),
      ])
    ) as string[]),
  ];

  const filteredProducts = [...products]
    .filter((p: any) => {
      const matchesCat = selectedCategory === 'All' || p.category_name === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.category_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'rating') return Number(b.likes_count || 0) - Number(a.likes_count || 0);
      return Number(b.featured || 0) - Number(a.featured || 0);
    });

  const wishlistedProducts = products.filter((p: any) => wishlistedIds.includes(p.id));
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const primaryColor = livePrimary || overrideTheme?.primaryColor || business.primary_color || '#0F382A';
  const accentColor = liveAccent || overrideTheme?.accentColor || business.accent_color || '#C69C6D';
  const storeFontFamily = liveFont || overrideTheme?.fontFamily || business.font_family || versionTheme?.fontFamily || 'Playfair Display';
  const selectedService = services.find((service: any) => service.id === selectedServiceId) || services[0];
  const availableTimes = parseJsonArray(selectedService?.available_slots_json, ['09:30', '11:00', '14:30', '16:30']);
  const heroSection = layoutSections.find((section) => section.type === 'hero' && section.visible !== false);

  // Active product for Screen 3 (Product Detail View)
  const detailProduct = selectedProductForDetail || products[0] || null;

  const navigateTo = (tab: StoreTab) => {
    setSelectedProductForDetail(null);
    setActiveTab(tab);
    recordFunnelEvent('page_view', tab);
  };

  const openProductDetail = (prod: any) => {
    setSelectedProductForDetail(prod);
    setActiveGalleryIdx(0);
    recordFunnelEvent('product_view', 'product_detail', prod.id);
  };

  const handleAddToCart = (prod: any, variationOverride?: string, colorOverride?: string) => {
    recordFunnelEvent('buy_click', activeTab, prod.id);
    const variations = parseJsonArray(prod.variations_json, ['Standard']);
    const chosenVar = variationOverride || selectedVariations[prod.id] || variations[0] || 'Standard';
    const swatches = PRODUCT_SWATCHES[prod.image_type] || PRODUCT_SWATCHES.default;
    const chosenColor = colorOverride || selectedColors[prod.id] || swatches[0]?.name || 'Signature';
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === prod.id && item.variation === chosenVar);
      if (existing) {
        return prev.map((item) =>
          item.productId === prod.id && item.variation === chosenVar
            ? { ...item, qty: item.qty + 1, color: chosenColor }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          price: Number(prod.price),
          qty: 1,
          variation: chosenVar,
          color: chosenColor,
        },
      ];
    });
  };

  const handleBuyNow = (prod: any, variationOverride?: string, colorOverride?: string) => {
    handleAddToCart(prod, variationOverride, colorOverride);
    setCheckoutOpen(true);
    setOrderError('');
    recordFunnelEvent('checkout_init', 'checkout', prod.id);
  };

  const handleAdjustCartQty = (prodId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.productId === prodId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const handleToggleWishlist = async (prodId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlistedIds((prev) => (prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]));
    await recordFunnelEvent('product_like', activeTab, prodId);
    loadStorefront();
  };

  const handleShareProduct = async (prod: any) => {
    const shareUrl = `${window.location.origin}/?store=${slug}&item=${prod.sku || prod.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareFeedback('Store link copied!');
      setTimeout(() => setShareFeedback(''), 2500);
    } catch {
      setShareFeedback('Ready to share');
    }
  };

  const handleSaveQuickEditInPreview = async () => {
    if (!authToken || !business?.id) return;
    setQuickSaving(true);
    setQuickNotice('');
    try {
      await fetch(`/api/businesses/${business.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          primary_color: primaryColor,
          accent_color: accentColor,
          font_family: storeFontFamily,
        }),
      });
      if (quickAddCat.trim()) {
        await fetch(`/api/businesses/${business.id}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ category_name: quickAddCat.trim() }),
        });
        setQuickAddCat('');
      }
      setQuickNotice('Saved live store appearance & category changes!');
      await loadStorefront();
      if (onOrderCreated) onOrderCreated();
    } catch {
      setQuickNotice('Could not save quick edits.');
    } finally {
      setQuickSaving(false);
    }
  };

  const handleCopyPaymentText = async (label: string, value: string) => {
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopyFeedback(label + ' copied.');
    } catch {
      setCopyFeedback('Select and copy the details above.');
    }
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
          payment_method_id: selectedPaymentMethodId,
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
        setBookingError(json.error || 'Your booking request could not be submitted.');
        return;
      }
      setBookingResult(json);
      if (onOrderCreated) onOrderCreated();
    } catch {
      setBookingError('We could not reach the business. Please try again.');
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
        setSupportError(json.error || 'Your message could not be sent.');
        return;
      }
      setSupportReplyNotice(json);
      setSupportMessage('');
      setSupportSubject('');
      if (onOrderCreated) onOrderCreated();
    } catch {
      setSupportError('We could not reach the support team.');
    } finally {
      setSubmittingSupport(false);
    }
  };

  // Helper to render a Boutique Product Card (matches Screen 2 of Reference Photo)
  const renderBoutiqueProductCard = (prod: any, index = 0) => {
    const variations = parseJsonArray(prod.variations_json, ['S', 'M', 'L', 'XL']);
    const activeVar = selectedVariations[prod.id] || variations[0] || 'Standard';
    const swatches = PRODUCT_SWATCHES[prod.image_type] || PRODUCT_SWATCHES.default;
    const activeSwatch = selectedColors[prod.id] || swatches[0]?.name;
    const inBagItem = cart.find((item) => item.productId === prod.id);
    const isLiked = wishlistedIds.includes(prod.id);

    const hasDiscount = prod.compare_at_price && Number(prod.compare_at_price) > Number(prod.price);
    const discountPct = prod.discount_percent && Number(prod.discount_percent) > 0
      ? Number(prod.discount_percent)
      : hasDiscount
      ? Math.round(((Number(prod.compare_at_price) - Number(prod.price)) / Number(prod.compare_at_price)) * 100)
      : 0;
    const badgeLabel = index === 0 ? 'New' : index === 1 ? 'Bestseller' : prod.featured ? 'Popular' : '';
    const ratingVal = (4.7 + ((index * 7) % 3) * 0.1).toFixed(1);
    const galleryUrls = parseJsonArray(prod.gallery_json, []);

    return (
      <article
        key={prod.id}
        onClick={() => openProductDetail(prod)}
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[#EBE5DA] bg-white p-2.5 shadow-[0_8px_26px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
      >
        {/* Framed Product Studio Image (Uploaded Photo or Studio Illustration) */}
        <div className="relative overflow-hidden rounded-[16px]">
          <ProductVisualCard
            imageType={prod.image_type}
            imageUrl={prod.image_url}
            galleryUrls={galleryUrls}
            title={prod.name}
            accentColor={primaryColor}
            aspectClass="aspect-[1/1.08]"
          />
          {badgeLabel && (
            <span
              className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm"
              style={{
                backgroundColor: badgeLabel === 'Bestseller' ? '#C69C6D' : primaryColor,
              }}
            >
              {badgeLabel}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => handleToggleWishlist(prod.id, e)}
            aria-label={'Save ' + prod.name}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/35"
          >
            <Heart className={'h-4 w-4 ' + (isLiked ? 'fill-rose-500 text-rose-500' : 'text-white')} />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between px-1 pt-3 pb-1">
          <div>
            <h4 className="line-clamp-1 text-sm font-bold text-slate-900">{prod.name}</h4>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">
              {prod.category_name || 'Premium Selection'}
            </p>

            {/* Price, Compare Price, Discount Pill & Star Rating */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold tabular-nums text-slate-950">
                  {formatMoney(prod.price, prod.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] tabular-nums text-stone-400 line-through">
                    {formatMoney(prod.compare_at_price, prod.currency)}
                  </span>
                )}
              </div>
              {hasDiscount ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {discountPct}% OFF
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-700">
                  {ratingVal} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
              )}
            </div>
          </div>

          {/* Full-Width Deep Emerald / Brand Add to Cart Button */}
          <div className="mt-3 space-y-2.5" onClick={(e) => e.stopPropagation()}>
            {inBagItem ? (
              <div
                className="flex items-center justify-between rounded-xl border-2 px-2 py-1"
                style={{ borderColor: primaryColor }}
              >
                <button
                  type="button"
                  onClick={() => handleAdjustCartQty(prod.id, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 font-bold text-slate-900"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-extrabold tabular-nums text-slate-900">
                  {inBagItem.qty} in cart
                </span>
                <button
                  type="button"
                  onClick={() => handleAddToCart(prod, activeVar, activeSwatch)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={Number(prod.stock) <= 0}
                onClick={() => handleAddToCart(prod, activeVar, activeSwatch)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:translate-y-0.5 disabled:opacity-40"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: '0 3px 0 rgba(15, 23, 42, 0.28)',
                }}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{Number(prod.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            )}

            {/* Color Swatches & Size Indicator Row */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                {swatches.slice(0, 3).map((sw) => {
                  const selected = activeSwatch === sw.name;
                  return (
                    <button
                      key={sw.name}
                      type="button"
                      title={sw.name}
                      onClick={() => setSelectedColors((prev) => ({ ...prev, [prod.id]: sw.name }))}
                      className={
                        'h-3.5 w-3.5 rounded-full border transition ' +
                        (selected ? 'ring-2 ring-slate-900 ring-offset-1' : 'border-stone-300')
                      }
                      style={{ backgroundColor: sw.hex }}
                    />
                  );
                })}
                <span className="text-[10px] font-semibold text-stone-400">
                  +{Math.max(1, variations.length - 1)}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-stone-400">{activeVar}</span>
            </div>
          </div>
        </div>
      </article>
    );
  };

  // Helper to render Screen 3: Product Detail View (PDP)
  const renderProductDetailView = (prod: any, isCompactColumn = false) => {
    if (!prod) return null;
    const variations = parseJsonArray(prod.variations_json, ['S', 'M', 'L', 'XL', 'XXL']);
    const activeVar = selectedVariations[prod.id] || variations[Math.min(2, variations.length - 1)] || variations[0];
    const swatches = PRODUCT_SWATCHES[prod.image_type] || PRODUCT_SWATCHES.default;
    const activeSwatch = selectedColors[prod.id] || swatches[0]?.name;
    const isLiked = wishlistedIds.includes(prod.id);
    const hasDiscount = prod.compare_at_price && Number(prod.compare_at_price) > Number(prod.price);
    const discountPct = prod.discount_percent && Number(prod.discount_percent) > 0
      ? Number(prod.discount_percent)
      : hasDiscount
      ? Math.round(((Number(prod.compare_at_price) - Number(prod.price)) / Number(prod.compare_at_price)) * 100)
      : 20;
    const galleryUrls = parseJsonArray(prod.gallery_json, []);

    return (
      <div className="overflow-hidden rounded-[28px] border border-[#E8E2D5] bg-white shadow-sm">
        <div className={isCompactColumn ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-12'}>
          {/* Left / Top: Hero Product Image + Vertical Thumbnail Strip on Right (Matches Screen 3) */}
          <div className={isCompactColumn ? 'relative' : 'relative lg:col-span-6'}>
            <ProductVisualCard
              imageType={prod.image_type}
              imageUrl={prod.image_url}
              galleryUrls={galleryUrls}
              title={prod.name}
              accentColor={primaryColor}
              aspectClass={isCompactColumn ? 'aspect-[1/1.05]' : 'aspect-[1/1] lg:h-full'}
              variantIndex={activeGalleryIdx}
            />

            {/* Top Overlay Controls: Back, Share, Wishlist */}
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedProductForDetail(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition hover:bg-black/40"
                aria-label="Back to products"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareProduct(prod)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition hover:bg-black/40"
                  aria-label="Share product"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleToggleWishlist(prod.id, e)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition hover:bg-black/40"
                  aria-label="Add to wishlist"
                >
                  <Heart className={'h-4 w-4 ' + (isLiked ? 'fill-rose-500 text-rose-500' : 'text-white')} />
                </button>
              </div>
            </div>

            {/* Vertical Thumbnail Gallery Strip on Right Side (Just like Reference Screen 3) */}
            <div className="absolute right-3.5 top-16 flex flex-col gap-2">
              {[0, 1, 2, 3].map((thumbIdx) => (
                <button
                  key={thumbIdx}
                  type="button"
                  onClick={() => setActiveGalleryIdx(thumbIdx)}
                  className={
                    'h-12 w-12 overflow-hidden rounded-xl border-2 bg-[#EFE7DA] shadow-md transition ' +
                    (activeGalleryIdx === thumbIdx ? 'border-white scale-105 ring-2 ring-slate-900/40' : 'border-white/70 opacity-85')
                  }
                >
                  <ProductVisualCard
                    imageType={prod.image_type}
                    imageUrl={prod.image_url}
                    galleryUrls={galleryUrls}
                    title={prod.name}
                    accentColor={primaryColor}
                    aspectClass="aspect-square"
                    variantIndex={thumbIdx}
                  />
                </button>
              ))}
              <span className="mt-0.5 rounded-full bg-black/55 px-2 py-0.5 text-center text-[10px] font-bold text-white backdrop-blur-xs">
                {activeGalleryIdx + 1}/4
              </span>
            </div>

            {shareFeedback && (
              <div className="absolute bottom-4 left-4 rounded-xl bg-slate-950/85 px-3 py-1.5 text-[11px] font-bold text-white">
                {shareFeedback}
              </div>
            )}
          </div>

          {/* Right / Bottom: Contiguous Purchase Module (Matches Screen 3) */}
          <div className={(isCompactColumn ? 'p-5' : 'p-6 sm:p-8 lg:col-span-6') + ' flex flex-col justify-between space-y-5 bg-white'}>
            <div className="space-y-4">
              <div>
                <h2
                  className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
                  style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                >
                  {prod.name}
                </h2>
                <p className="mt-1 text-xs font-medium text-stone-500">
                  {prod.category_name} · Classic Fit · {prod.sku || 'Verified Authentic'}
                </p>

                {/* Rating & Reviews */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-slate-900">4.8</span>
                  <span className="text-stone-400">({Math.max(24, Number(prod.likes_count || 42))} reviews)</span>
                </div>
              </div>

              {/* Price + Compare Price + 25% OFF Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-extrabold tabular-nums text-slate-950">
                  {formatMoney(prod.price, prod.currency)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm tabular-nums text-stone-400 line-through">
                      {formatMoney(prod.compare_at_price, prod.currency)}
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-extrabold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>

              {prod.description && (
                <p className="text-xs leading-5 text-stone-600">{prod.description}</p>
              )}

              {/* Select Size / Variation */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Select Size / Option</span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1 font-semibold text-stone-500 hover:text-slate-900"
                  >
                    Size guide <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                {sizeGuideOpen && (
                  <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-3 text-[11px] text-stone-600">
                    <strong>Tailored Fit Guide:</strong> S (52) · M (54) · L (56) · XL (58) · XXL (60). Free exchanges within 7 days.
                  </div>
                )}
                <div className="grid grid-cols-5 gap-2">
                  {variations.map((v: string) => {
                    const active = activeVar === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSelectedVariations((prev) => ({ ...prev, [prod.id]: v }))}
                        className={
                          'rounded-xl border py-2.5 text-center text-xs font-bold transition ' +
                          (active
                            ? 'border-transparent text-white shadow-sm'
                            : 'border-stone-200 bg-white text-slate-800 hover:border-stone-400')
                        }
                        style={active ? { backgroundColor: primaryColor } : undefined}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Color Swatches */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Select Color</span>
                  <span className="text-[11px] font-medium text-stone-500">{activeSwatch}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {swatches.map((sw) => {
                    const active = activeSwatch === sw.name;
                    return (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() => setSelectedColors((prev) => ({ ...prev, [prod.id]: sw.name }))}
                        title={sw.name}
                        className={
                          'h-7 w-7 rounded-full border transition ' +
                          (active ? 'ring-2 ring-slate-950 ring-offset-2 scale-105' : 'border-stone-300')
                        }
                        style={{ backgroundColor: sw.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dual Action Row: Outlined "Add to Cart" + Solid "Buy Now" */}
            <div className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(prod, activeVar, activeSwatch)}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-white py-3.5 text-xs font-extrabold text-slate-950 transition hover:bg-stone-50 active:translate-y-0.5"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyNow(prod, activeVar, activeSwatch)}
                  className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold text-white shadow-md transition hover:brightness-110 active:translate-y-0.5"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: '0 4px 0 rgba(15, 23, 42, 0.3)',
                  }}
                >
                  Buy Now
                </button>
              </div>

              {/* 2-Column Guarantee Footer Strip */}
              <div className="grid grid-cols-2 divide-x divide-stone-200 rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-3 text-[11px]">
                <div className="flex items-center gap-2.5 pr-2">
                  <Truck className="h-4 w-4 shrink-0 text-slate-800" />
                  <div>
                    <div className="font-bold text-slate-900">Express Delivery</div>
                    <div className="text-[10px] text-stone-500">Same-day in Addis Ababa</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 pl-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-slate-800" />
                  <div>
                    <div className="font-bold text-slate-900">Quality Guarantee</div>
                    <div className="text-[10px] text-stone-500">Verified merchant support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        'telebiz-storefront relative mx-auto flex w-full max-w-[1280px] flex-col overflow-hidden rounded-[32px] border border-[#E6DFD3] bg-[#FAF8F5] text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ' +
        (mode === 'full_storefront' ? 'my-2 min-h-[min(920px,calc(100vh-24px))]' : 'min-h-[680px]')
      }
      style={{
        ['--store-primary' as any]: primaryColor,
        ['--store-accent' as any]: accentColor,
      }}
    >
      {/* Minimal Customer Preview Bar */}
      {canQuickEdit && (
        <div className="border-b border-stone-200 bg-white px-4 py-2 text-xs text-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100 p-0.5">
              <button
                type="button"
                onClick={() => setShowcaseLayout('interactive')}
                className={
                  'rounded-lg px-2.5 py-1 text-[11px] font-bold transition ' +
                  (showcaseLayout === 'interactive' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900')
                }
              >
                Interactive Storefront
              </button>
              <button
                type="button"
                onClick={() => setShowcaseLayout('three_screen')}
                className={
                  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ' +
                  (showcaseLayout === 'three_screen' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900')
                }
              >
                <Smartphone className="h-3 w-3" />
                3-Screen Mobile View
              </button>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-800 hover:bg-stone-50"
              >
                ← Back to Workspace
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODE B: 3-SCREEN SIDE-BY-SIDE MOBILE SHOWCASE (LIKE REFERENCE PHOTO)
         ===================================================================== */}
      {showcaseLayout === 'three_screen' ? (
        <div className="flex-1 overflow-x-auto bg-[#EDEAE4] p-4 sm:p-6">
          <div className="mx-auto grid min-w-[980px] max-w-[1220px] grid-cols-3 gap-6">
            {/* PHONE 1: HOME SCREEN */}
            <div className="flex flex-col overflow-hidden rounded-[38px] border-[6px] border-white bg-[#FAF8F5] shadow-2xl">
              <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-bold text-slate-900">
                <span>9:41</span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Screen 1 · Home</span>
              </div>
              {/* Brand Crest Header */}
              <div className="flex items-center justify-between px-4 py-2">
                <button type="button" onClick={() => setActiveTab('catalog')} className="p-1.5 text-slate-800">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <div className="mx-auto mb-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ color: accentColor }}>
                    ♛
                  </div>
                  <div
                    className="text-base font-bold leading-none tracking-tight"
                    style={{ color: '#8C6239', fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                  >
                    {business.name.split(' ')[0]}
                  </div>
                  <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.22em] text-stone-500">
                    {String(catMeta.label || business.category).replace(/^\d+\.\s*/, '')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="relative p-1.5 text-slate-800"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartCount}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-4 py-1.5">
                <div className="flex items-center gap-2 rounded-full bg-[#F1ECE2] px-3.5 py-2 text-xs text-stone-500">
                  <Search className="h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${business.name}...`}
                    className="w-full bg-transparent text-[11px] text-slate-800 outline-none"
                  />
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-700" />
                </div>
              </div>

              {/* Hero Card */}
              <div className="px-4 py-2">
                <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#EFE6D5] via-[#E6D7BE] to-[#D6C1A0] p-4">
                  <div className="relative z-10 max-w-[62%] space-y-2">
                    <h3
                      className="text-lg font-bold leading-snug text-slate-950"
                      style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                    >
                      {heroSection?.title || 'Timeless Royal Elegance'}
                    </h3>
                    <p className="line-clamp-2 text-[10px] text-stone-700">
                      {heroSection?.subtitle || 'Traditional craftsmanship, modern lifestyle.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowcaseLayout('interactive')}
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Shop Now <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="absolute right-1 bottom-0 top-1 w-32 opacity-95">
                    <ProductVisualCard
                      imageType={products[0]?.image_type || 'thobe_set'}
                      imageUrl={products[0]?.image_url}
                      title={business.name}
                      accentColor={primaryColor}
                      aspectClass="h-full"
                    />
                  </div>
                </div>
              </div>

              {/* 4-Icon Trust Row */}
              <div className="mx-4 my-1.5 grid grid-cols-4 divide-x divide-stone-200 rounded-2xl bg-white py-2.5 text-center shadow-xs">
                {[
                  { icon: ShieldCheck, label: 'Premium\nQuality' },
                  { icon: CreditCard, label: 'Secure\nPayment' },
                  { icon: Truck, label: 'Fast\nDelivery' },
                  { icon: ShoppingBag, label: 'Easy\nReturns' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 px-1">
                      <Icon className="h-4 w-4 text-slate-800" />
                      <span className="whitespace-pre-line text-[9px] font-semibold leading-tight text-stone-600">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Shop By Category */}
              <div className="px-4 py-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Shop By Category</span>
                  <span className="text-[10px] font-semibold text-stone-500">View All →</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {productCategories.slice(1, 5).map((cat, idx) => {
                    const catProd = products.find((p: any) => p.category_name === cat) || products[idx] || products[0];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className="group text-center"
                      >
                        <div className="overflow-hidden rounded-xl border border-stone-200">
                          <ProductVisualCard
                            imageType={catProd?.image_type || 'thobe_white'}
                            imageUrl={catProd?.image_url}
                            title={cat}
                            accentColor={primaryColor}
                            aspectClass="aspect-square"
                          />
                        </div>
                        <span className="mt-1 block truncate text-[10px] font-bold text-slate-800">
                          {cat}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Best Sellers */}
              <div className="flex-1 px-4 py-1.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Best Sellers</span>
                  <span className="text-[10px] font-semibold text-stone-500">View All →</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {products.slice(0, 3).map((p: any) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductForDetail(p)}
                      className="overflow-hidden rounded-xl border border-stone-200 bg-white p-1 text-left"
                    >
                      <div className="overflow-hidden rounded-lg">
                        <ProductVisualCard
                          imageType={p.image_type}
                          imageUrl={p.image_url}
                          title={p.name}
                          accentColor={primaryColor}
                          aspectClass="aspect-square"
                        />
                      </div>
                      <div className="mt-1 truncate text-[9px] font-bold text-slate-800">{p.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PHONE 2: CATEGORY COLLECTION GRID */}
            <div className="flex flex-col overflow-hidden rounded-[38px] border-[6px] border-white bg-[#FAF8F5] shadow-2xl">
              <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-bold text-slate-900">
                <span>9:41</span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Screen 2 · Category Grid</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2">
                <ArrowLeft className="h-4 w-4 text-slate-800" />
                <h3
                  className="text-base font-bold text-slate-950"
                  style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                >
                  {selectedCategory === 'All' ? productCategories[1] || business.name : selectedCategory}
                </h3>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-800" />
                  <SlidersHorizontal className="h-4 w-4 text-slate-800" />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto px-4 py-2">
                {productCategories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={
                        'shrink-0 rounded-full px-3 py-1 text-[10px] font-bold transition ' +
                        (active ? 'text-white shadow-xs' : 'bg-[#F1ECE2] text-stone-700')
                      }
                      style={active ? { backgroundColor: primaryColor } : undefined}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* 2-Column Product Grid */}
              <div className="grid flex-1 grid-cols-2 gap-2.5 overflow-y-auto p-3.5">
                {filteredProducts.slice(0, 4).map((prod: any, idx: number) => renderBoutiqueProductCard(prod, idx))}
              </div>
            </div>

            {/* PHONE 3: PRODUCT DETAIL & BUY NOW */}
            <div className="flex flex-col overflow-hidden rounded-[38px] border-[6px] border-white bg-white shadow-2xl">
              <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-bold text-slate-900">
                <span>9:41</span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Screen 3 · Product Detail</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {renderProductDetailView(detailProduct, true)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =====================================================================
           MODE A: FULL INTERACTIVE BOUTIQUE STOREFRONT (CUSTOMER & OWNER VIEW)
           ===================================================================== */
        <>
          {/* Centered Luxury Crest & Brand Header (Matches Reference Photo) */}
          <header className="relative z-10 border-b border-[#EBE4D8] bg-[#FAF8F5] px-4 py-3.5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Menu / Category Drawer Trigger & Channel Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo(activeTab === 'catalog' ? 'home' : 'catalog')}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5DEC9] bg-white text-slate-800 shadow-2xs transition hover:bg-stone-50"
                  aria-label="Browse categories"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden items-center gap-1 rounded-full border border-[#E5DEC9] bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-600 sm:inline-flex">
                  <span>{String(catMeta.label || business.category).replace(/^\d+\.\s*/, '')}</span>
                  {business.telegram_bot_username && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-[10px] text-slate-800">{business.telegram_bot_username}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Center: Royal Crest Emblem + Serif Brand Title + Subtitle */}
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="group flex flex-col items-center text-center"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition group-hover:scale-110"
                  style={{ color: '#9C6F38' }}
                >
                  ♛
                </span>
                <span
                  className="text-xl font-bold tracking-tight sm:text-2xl"
                  style={{
                    color: '#7A542E',
                    fontFamily: `'${storeFontFamily}', 'Playfair Display', Georgia, serif`,
                  }}
                >
                  {business.name}
                </span>
                <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.24em] text-stone-500">
                  {String(catMeta.label || business.category || 'Official Storefront').replace(/^\d+\.\s*/, '')}
                </span>
              </button>

              {/* Right: Wishlist & Shopping Bag with Emerald Counter Badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('wishlist')}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5DEC9] bg-white text-slate-800 shadow-2xs transition hover:bg-stone-50"
                  aria-label="Wishlist"
                >
                  <Heart className={'h-4 w-4 ' + (wishlistedIds.length > 0 ? 'fill-rose-500 text-rose-500' : '')} />
                  {wishlistedIds.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                      {wishlistedIds.length}
                    </span>
                  )}
                </button>

                {catMeta.supportsProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(true);
                      setOrderError('');
                      recordFunnelEvent('checkout_init', 'checkout');
                    }}
                    className="relative flex h-10 items-center gap-2 rounded-xl border border-[#E5DEC9] bg-white px-3.5 text-xs font-bold text-slate-900 shadow-2xs transition hover:bg-stone-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline">Bag</span>
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold text-white tabular-nums"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {cartCount}
                    </span>
                  </button>
                )}

                {onClose && !canQuickEdit && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5DEC9] bg-white text-slate-600"
                    aria-label="Close storefront"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Pill Search Bar + Filter Sliders Button (Matches Reference Photo) */}
            <div className="mx-auto mt-3.5 flex max-w-2xl items-center gap-2">
              <div className="flex flex-1 items-center gap-2.5 rounded-full border border-[#E5DEC9] bg-[#F2EDE3] px-4 py-2.5 transition focus-within:border-stone-400 focus-within:bg-white">
                <Search className="h-4 w-4 shrink-0 text-stone-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'catalog' && e.target.value.trim()) {
                      setActiveTab('catalog');
                      setSelectedProductForDetail(null);
                    }
                  }}
                  placeholder={`Search for ${productCategories.slice(1, 4).join(', ').toLowerCase() || 'products'}...`}
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-stone-500 outline-none"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-slate-800">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen((prev) => !prev)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5DEC9] bg-[#F2EDE3] text-slate-800 transition hover:bg-white"
                aria-label="Sort and filter products"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {filterDrawerOpen && (
              <div className="mx-auto mt-2.5 flex max-w-2xl flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E5DEC9] bg-white px-4 py-2.5 text-xs shadow-sm">
                <span className="font-bold text-stone-600">Sort Collection By:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'featured', label: 'Featured & Best Selling' },
                    { id: 'price_asc', label: 'Price: Low to High' },
                    { id: 'price_desc', label: 'Price: High to Low' },
                    { id: 'rating', label: 'Most Loved' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSortBy(s.id as any)}
                      className={
                        'rounded-full px-3 py-1 text-[11px] font-bold transition ' +
                        (sortBy === s.id ? 'text-white' : 'bg-[#F2EDE3] text-stone-700 hover:bg-stone-200')
                      }
                      style={sortBy === s.id ? { backgroundColor: primaryColor } : undefined}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </header>

          {/* Order Confirmation Banner with 1-Click Copy Payment Instructions */}
          {orderResult && (
            <div className="mx-4 mt-4 sm:mx-8">
              <section className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold">
                      Order #{orderResult.orderNumber} Confirmed — Awaiting Transfer Verification
                    </p>
                    <p className="mt-1 text-xs">
                      Total: <strong>{formatMoney(orderResult.total)}</strong> · Reference:{' '}
                      <span className="font-mono font-bold">{orderResult.referenceCode}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderResult(null)}
                    className="rounded-lg p-1 text-emerald-800 hover:bg-emerald-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {orderResult.paymentMethod && (
                  <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-emerald-200 bg-white p-3 text-xs sm:grid-cols-3">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400">Method</span>
                      <div className="font-bold text-slate-900">{orderResult.paymentMethod.methodName}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-stone-400">Account Holder</span>
                      <div className="font-bold text-slate-900">{orderResult.paymentMethod.accountName}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase text-stone-400">Account Number</span>
                        <div className="font-mono font-extrabold text-slate-950">
                          {orderResult.paymentMethod.accountNumber}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyPaymentText('Account number', orderResult.paymentMethod.accountNumber)
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold text-white"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    {copyFeedback && (
                      <div className="text-[11px] font-bold text-emerald-700 sm:col-span-3">{copyFeedback}</div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Main Storefront Content */}
          <main className="flex-1 space-y-8 px-4 pb-24 pt-5 sm:px-8">
            {/* If a Product is clicked, show Screen 3: Product Detail View */}
            {selectedProductForDetail ? (
              <div className="space-y-6">
                {renderProductDetailView(selectedProductForDetail, false)}

                {/* Related Products below PDP */}
                {products.length > 1 && (
                  <section className="space-y-3">
                    <h3
                      className="text-lg font-bold text-slate-950"
                      style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                    >
                      You May Also Like
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {products
                        .filter((p: any) => p.id !== selectedProductForDetail.id)
                        .slice(0, 4)
                        .map((p: any, idx: number) => renderBoutiqueProductCard(p, idx))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <>
                {/* TAB 1: HOME (Matches Screen 1 of Reference Photo) */}
                {activeTab === 'home' && (
                  <div className="space-y-7">
                    {/* Warm Split Hero Banner Card */}
                    <section className="relative overflow-hidden rounded-[28px] border border-[#E5DAC6] bg-gradient-to-r from-[#F2E9DA] via-[#E8DBC5] to-[#D9C5A6] shadow-sm">
                      <div className="grid grid-cols-1 items-center lg:grid-cols-12">
                        <div className="space-y-4 p-6 sm:p-10 lg:col-span-7">
                          <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7A542E]">
                            {String(catMeta.label || business.category).replace(/^\d+\.\s*/, '')}
                          </span>
                          <h2
                            className="text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl"
                            style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', Georgia, serif` }}
                          >
                            {heroSection?.title || 'Timeless Elegance'}
                          </h2>
                          <p className="max-w-lg text-sm leading-6 text-stone-700">
                            {heroSection?.subtitle ||
                              business.description ||
                              'Traditional craftsmanship, modern lifestyle.'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => navigateTo('catalog')}
                              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
                              style={{
                                backgroundColor: primaryColor,
                                boxShadow: '0 4px 0 rgba(15, 23, 42, 0.3)',
                              }}
                            >
                              <span>{heroSection?.ctaText || 'Shop Now'}</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                            {catMeta.supportsBookings && services.length > 0 && (
                              <button
                                type="button"
                                onClick={() => navigateTo('bookings')}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-900/20 bg-white/80 px-5 py-3 text-xs font-bold text-slate-900 backdrop-blur-xs transition hover:bg-white"
                              >
                                <Calendar className="h-4 w-4" />
                                <span>Book Appointment</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="relative h-64 overflow-hidden sm:h-80 lg:col-span-5 lg:h-full">
                          <ProductVisualCard
                            imageType={products[0]?.image_type || 'thobe_set'}
                            imageUrl={products[0]?.image_url}
                            title={business.name}
                            accentColor={primaryColor}
                            aspectClass="h-full w-full"
                          />
                        </div>
                      </div>
                    </section>

                    {/* 4-Column Trust & Guarantee Bar (Matches Reference Photo) */}
                    <section className="grid grid-cols-2 divide-y divide-stone-200/80 rounded-[22px] border border-[#E8E1D5] bg-white p-4 shadow-2xs sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                      {[
                        { icon: ShieldCheck, title: 'Premium Quality', sub: 'Authentic materials' },
                        { icon: CreditCard, title: 'Secure Payment', sub: 'Verified bank & wallet' },
                        { icon: Truck, title: 'Fast Delivery', sub: 'Express local dispatch' },
                        { icon: RotateCcw, title: 'Easy Returns', sub: 'Hassle-free exchange' },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="flex flex-col items-center justify-center p-2 text-center">
                            <Icon className="h-5 w-5 text-slate-900" />
                            <div className="mt-1.5 text-xs font-bold text-slate-900">{item.title}</div>
                            <div className="text-[10px] text-stone-500">{item.sub}</div>
                          </div>
                        );
                      })}
                    </section>

                    {/* Shop By Category Visual Row (Matches Reference Photo) */}
                    {catMeta.supportsProducts && productCategories.length > 1 && (
                      <section className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <h3
                            className="text-lg font-bold text-slate-950 sm:text-xl"
                            style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                          >
                            Shop By Category
                          </h3>
                          <button
                            type="button"
                            onClick={() => navigateTo('catalog')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-slate-950"
                          >
                            View All <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                          {productCategories.slice(1, 6).map((cat, idx) => {
                            const sampleProd =
                              products.find((p: any) => p.category_name === cat) || products[idx] || products[0];
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  navigateTo('catalog');
                                }}
                                className="group flex flex-col items-center rounded-[20px] border border-[#E8E1D5] bg-white p-2.5 text-center shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md"
                              >
                                <div className="w-full overflow-hidden rounded-[14px]">
                                  <ProductVisualCard
                                    imageType={sampleProd?.image_type || 'thobe_white'}
                                    imageUrl={sampleProd?.image_url}
                                    title={cat}
                                    accentColor={primaryColor}
                                    aspectClass="aspect-[1/0.95]"
                                  />
                                </div>
                                <span className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-950">
                                  {cat}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {/* Best Sellers Grid (Matches Reference Photo) */}
                    {catMeta.supportsProducts && (
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3
                              className="text-lg font-bold text-slate-950 sm:text-xl"
                              style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                            >
                              Best Sellers
                            </h3>
                            <p className="text-xs text-stone-500">
                              Click any item to view full details, sizes, and colors
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigateTo('catalog')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-slate-950"
                          >
                            View All <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                          {products.slice(0, 4).map((prod: any, idx: number) => renderBoutiqueProductCard(prod, idx))}
                        </div>
                      </section>
                    )}

                    {/* Promo Banner if configured */}
                    {promotions.length > 0 && (
                      <section className="flex flex-col items-center justify-between gap-3 rounded-[22px] border border-[#DFD3BE] bg-[#F3ECE0] px-6 py-4 sm:flex-row">
                        <div>
                          <div className="text-xs font-extrabold uppercase tracking-wider text-[#7A542E]">
                            Special Storefront Offer
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-slate-900">
                            {promotions[0].name} — Use code{' '}
                            <span className="rounded bg-white px-2 py-0.5 font-mono text-xs font-extrabold">
                              {promotions[0].code}
                            </span>{' '}
                            at checkout
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountCode(promotions[0].code);
                            navigateTo('catalog');
                          }}
                          className="rounded-full px-4 py-2 text-xs font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Apply Offer
                        </button>
                      </section>
                    )}
                  </div>
                )}

                {/* TAB 2: CATEGORIES / COLLECTION GRID (Matches Screen 2 of Reference Photo) */}
                {activeTab === 'catalog' && (
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigateTo('home')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-slate-950"
                      >
                        <ArrowLeft className="h-4 w-4" /> Home
                      </button>
                      <h2
                        className="text-xl font-bold text-slate-950 sm:text-2xl"
                        style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                      >
                        {selectedCategory === 'All' ? 'All Collections' : selectedCategory}
                      </h2>
                      <span className="text-xs font-semibold text-stone-500">
                        {filteredProducts.length} items
                      </span>
                    </div>

                    {/* Horizontal Category Pills (Matches Screen 2) */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {productCategories.map((category) => {
                        const active = selectedCategory === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={
                              'shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ' +
                              (active
                                ? 'text-white shadow-sm'
                                : 'border border-[#E5DEC9] bg-[#F2EDE3] text-stone-700 hover:bg-white')
                            }
                            style={active ? { backgroundColor: primaryColor } : undefined}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
                        <Package className="mx-auto h-7 w-7 text-stone-400" />
                        <p className="mt-2 text-sm font-bold text-slate-800">No items match this filter</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('All');
                            setSearchQuery('');
                          }}
                          className="mt-3 text-xs font-bold underline"
                          style={{ color: primaryColor }}
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {filteredProducts.map((prod: any, idx: number) => renderBoutiqueProductCard(prod, idx))}
                      </div>
                    )}
                  </section>
                )}

                {/* TAB 3: WISHLIST */}
                {activeTab === 'wishlist' && (
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h2
                        className="text-xl font-bold text-slate-950"
                        style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                      >
                        Saved Wishlist ({wishlistedProducts.length})
                      </h2>
                      <button
                        type="button"
                        onClick={() => navigateTo('catalog')}
                        className="text-xs font-bold underline"
                        style={{ color: primaryColor }}
                      >
                        Continue Shopping
                      </button>
                    </div>
                    {wishlistedProducts.length === 0 ? (
                      <div className="rounded-2xl border border-[#E8E1D5] bg-white p-10 text-center">
                        <Heart className="mx-auto h-8 w-8 text-stone-300" />
                        <p className="mt-2 text-sm font-bold text-slate-800">Your wishlist is empty</p>
                        <p className="mt-1 text-xs text-stone-500">
                          Tap the heart icon on any product to save it here for quick ordering.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {wishlistedProducts.map((prod: any, idx: number) => renderBoutiqueProductCard(prod, idx))}
                      </div>
                    )}
                  </section>
                )}

                {/* TAB 4: BOOKINGS & APPOINTMENTS */}
                {activeTab === 'bookings' && (
                  <section className="grid items-start gap-5 lg:grid-cols-12">
                    <div
                      className="rounded-[26px] p-6 text-white lg:col-span-5"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Calendar className="h-7 w-7 text-amber-300" />
                      <h2
                        className="mt-4 text-2xl font-bold"
                        style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                      >
                        Schedule an Appointment or Fitting
                      </h2>
                      <p className="mt-2 text-xs leading-5 text-white/80">
                        Select your preferred service, date, and time. Our team confirms every reservation directly via Telegram or phone.
                      </p>
                      {selectedService && (
                        <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
                          <div className="text-[10px] uppercase tracking-wider text-white/60">Selected Service</div>
                          <div className="mt-1 text-sm font-bold">{selectedService.name}</div>
                          <div className="mt-1 text-xs text-amber-200">
                            {formatMoney(selectedService.price, selectedService.currency)} · {selectedService.duration_mins} mins
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[26px] border border-[#E8E1D5] bg-white p-6 shadow-xs lg:col-span-7">
                      <h3 className="text-base font-bold text-slate-950">Reservation Details</h3>
                      {bookingResult && (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
                          <strong>Booking #{bookingResult.bookingNumber} Received!</strong> Scheduled for{' '}
                          {bookingResult.bookingDate} at {bookingResult.bookingTime}.
                        </div>
                      )}
                      {bookingError && (
                        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{bookingError}</div>
                      )}
                      <form onSubmit={handleSubmitBooking} className="mt-4 space-y-3.5 text-xs">
                        <div>
                          <label className="mb-1 block font-bold text-slate-700">Service</label>
                          <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5 font-semibold"
                          >
                            {services.map((s: any) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({formatMoney(s.price, s.currency)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block font-bold text-slate-700">Preferred Date</label>
                            <input
                              type="date"
                              required
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block font-bold text-slate-700">Preferred Time</label>
                            <select
                              required
                              value={bookingTime}
                              onChange={(e) => setBookingTime(e.target.value)}
                              className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5"
                            >
                              <option value="">Select time</option>
                              {availableTimes.map((t: string) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block font-bold text-slate-700">Your Name</label>
                            <input
                              type="text"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Full name"
                              className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block font-bold text-slate-700">Phone Number</label>
                            <input
                              type="tel"
                              required
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+251 ..."
                              className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={submittingBooking}
                          className="w-full rounded-xl py-3 text-xs font-extrabold text-white shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {submittingBooking ? 'Submitting...' : 'Confirm Booking Request'}
                        </button>
                      </form>
                    </div>
                  </section>
                )}

                {/* TAB 5: SUPPORT & STORE INFO */}
                {(activeTab === 'support' || activeTab === 'about') && (
                  <section className="grid gap-5 lg:grid-cols-12">
                    <div className="space-y-4 rounded-[26px] border border-[#E8E1D5] bg-white p-6 lg:col-span-5">
                      <h3
                        className="text-lg font-bold text-slate-950"
                        style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                      >
                        About {business.name}
                      </h3>
                      <p className="text-xs leading-6 text-stone-600">
                        {business.about_text || business.description}
                      </p>
                      <div className="space-y-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-800" />
                          <span>{business.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-800" />
                          <span>{business.contact_phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-[#E8E1D5] bg-white p-6 lg:col-span-7">
                      <h3 className="text-base font-bold text-slate-950">Direct Customer Concierge</h3>
                      {supportReplyNotice && (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                          <strong>Message received!</strong> Our team will reply shortly.
                        </div>
                      )}
                      <form onSubmit={handleSendSupport} className="mt-4 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Your name"
                            className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5"
                          />
                          <input
                            type="text"
                            required
                            value={supportSubject}
                            onChange={(e) => setSupportSubject(e.target.value)}
                            placeholder="Subject or Order #"
                            className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5"
                          />
                        </div>
                        <textarea
                          rows={3}
                          required
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="How can we help you today?"
                          className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2.5"
                        />
                        <button
                          type="submit"
                          disabled={submittingSupport}
                          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>{submittingSupport ? 'Sending...' : 'Send Message'}</span>
                        </button>
                      </form>
                    </div>
                  </section>
                )}
              </>
            )}
          </main>

          {/* Clean 5-Tab Bottom Navigation Bar (Matches Reference Photo) */}
          <nav
            className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-[#E8E1D5] bg-white/95 px-2 py-2 backdrop-blur-md"
            aria-label="Store bottom navigation"
          >
            {[
              { id: 'home', label: 'Home', icon: Store },
              { id: 'catalog', label: 'Categories', icon: LayoutGrid },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'bookings', label: services.length > 0 ? 'Bookings' : 'Orders', icon: Package },
              { id: 'support', label: 'Account & Help', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id && !selectedProductForDetail;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id as StoreTab)}
                  className="flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-bold transition"
                  style={{ color: active ? primaryColor : '#78716C' }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </>
      )}

      {/* =====================================================================
          SLIDE-OVER SHOPPING BAG & SIMPLE 1-STEP CUSTOMER CHECKOUT DRAWER
         ===================================================================== */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto bg-[#FAF8F5] p-6 text-xs shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3
                    className="text-lg font-bold text-slate-950"
                    style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                  >
                    Your Shopping Bag ({cartCount})
                  </h3>
                  <p className="text-[11px] text-stone-500">Simple, fast checkout for {business.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white p-2 text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
                  <ShoppingBag className="mx-auto h-7 w-7 text-stone-400" />
                  <p className="mt-2 font-bold text-slate-800">Your bag is empty</p>
                  <p className="mt-1 text-stone-500">Add items from the collection to place your order.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.productId}-${idx}`}
                        className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3.5"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-stone-500">
                            Size/Option: <strong>{item.variation}</strong>
                            {item.color ? ` · ${item.color}` : ''}
                          </div>
                          <div className="mt-1 font-extrabold text-slate-950">
                            {formatMoney(item.price * item.qty)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdjustCartQty(item.productId, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 font-bold"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold tabular-nums">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleAdjustCartQty(item.productId, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 font-bold"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {orderError && (
                    <div className="rounded-xl bg-rose-50 p-3 text-rose-700 font-semibold">{orderError}</div>
                  )}

                  <form onSubmit={handleSubmitOrder} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                      Customer Delivery & Payment
                    </div>
                    <div>
                      <label className="mb-1 block font-bold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Abebe Kebede"
                        className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-bold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+251 911 223 344"
                        className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-bold text-slate-700">Delivery Address</label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Neighborhood, street, or building"
                        className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block font-bold text-slate-700">Telegram @ (Optional)</label>
                        <input
                          type="text"
                          value={telegramUsername}
                          onChange={(e) => setTelegramUsername(e.target.value)}
                          placeholder="@username"
                          className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-bold text-slate-700">Promo Code</label>
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="ROYAL25"
                          className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2 font-mono uppercase"
                        />
                      </div>
                    </div>

                    {paymentMethods.length > 0 && (
                      <div>
                        <label className="mb-1 block font-bold text-slate-700">Select Payment Method</label>
                        <select
                          value={selectedPaymentMethodId}
                          onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2 font-semibold"
                        >
                          {paymentMethods.map((pm: any) => (
                            <option key={pm.id} value={pm.id}>
                              {pm.method_name} — {pm.account_name} ({pm.account_number})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-sm font-extrabold">
                      <span>Total Due</span>
                      <span>{formatMoney(cartSubtotal)}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="w-full rounded-xl py-3.5 text-xs font-extrabold text-white shadow-md transition hover:brightness-110"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {submittingOrder ? 'Placing Order...' : `Complete Order (${formatMoney(cartSubtotal)})`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
