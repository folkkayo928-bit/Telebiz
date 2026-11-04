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
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../i18n/translations';

interface StorefrontProps {
  slug: string;
  mode?: 'embedded_preview' | 'full_storefront';
  overrideTheme?: {
    tastePreset?: string;
    primaryColor?: string;
    accentColor?: string;
    backgroundType?: string;
    backgroundColor?: string;
    backgroundPattern?: string;
    pageDarkness?: 'light' | 'dark' | 'auto';
    fontFamily?: string;
    headingTransform?: 'none' | 'uppercase' | 'capitalize';
    productCardStyle?: string;
    productGridColumns?: string;
    productAspectRatio?: string;
    cardRadius?: string;
    cardBackgroundStyle?: string;
    headerStyle?: string;
    buttonStyle?: '3d' | 'pill' | 'sharp';
    showStockBadges?: boolean;
    showStarRatings?: boolean;
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
  jewelry_chain: [
    { name: '18K Yellow Gold', hex: '#D4AF37' },
    { name: '18K Rose Gold', hex: '#B76E79' },
    { name: 'White Gold / Platinum', hex: '#E5E7EB' },
  ],
  jewelry_necklace: [
    { name: '18K Yellow Gold', hex: '#D4AF37' },
    { name: '18K White Gold', hex: '#E5E7EB' },
    { name: 'Rose Gold', hex: '#B76E79' },
  ],
  streetwear_hoodie: [
    { name: 'Washed Charcoal', hex: '#1C1D22' },
    { name: 'Bone White', hex: '#F0ECE1' },
    { name: 'Cyber Orange', hex: '#FF5500' },
    { name: 'Military Olive', hex: '#4B5320' },
  ],
  streetwear_cargo: [
    { name: 'Stealth Black', hex: '#141518' },
    { name: 'Vintage Olive', hex: '#3B443B' },
    { name: 'Sand Khaki', hex: '#C2B280' },
    { name: 'Concrete Gray', hex: '#71797E' },
  ],
  default: [
    { name: 'Signature', hex: '#0F382A' },
    { name: 'Warm Sand', hex: '#C69C6D' },
    { name: 'Obsidian', hex: '#1E293B' },
    { name: 'Alabaster', hex: '#F5F2EB' },
  ],
};

export function ProductVisualCard({
  imageType = 'default',
  imageUrl,
  galleryUrls = [],
  title,
  accentColor,
  aspectClass = 'aspect-[1/1.05]',
  variantIndex = 0,
}: {
  imageType?: string;
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
  const bgGradient = studioBackdrops[imageType] || 'from-slate-100 via-slate-200 to-slate-300';
  const isDarkStudio = imageType === 'bisht_gold' || imageType === 'accessories_gold';

  const renderIllustration = () => {
    if (
      (imageType?.startsWith('thobe') || imageType === 'jalabiya_sand' || imageType === 'bisht_gold') &&
      (title?.toLowerCase().includes('thobe') ||
        title?.toLowerCase().includes('bisht') ||
        title?.toLowerCase().includes('jalabiya') ||
        title?.toLowerCase().includes('saudi') ||
        title?.toLowerCase().includes('arabian') ||
        title?.toLowerCase().includes('traditional'))
    ) {
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

    if (
      imageType === 'digital_game' ||
      imageType === 'gaming' ||
      imageType === 'digital_product' ||
      imageType === 'digital_menu' ||
      imageType === 'electronics' ||
      imageType === 'tech'
    ) {
      return (
        <svg
          viewBox="0 0 180 180"
          className="h-[82%] w-[82%] drop-shadow-[0_16px_32px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
        >
          {/* Futuristic Gaming Controller / Tech Badge */}
          <rect x="22" y="44" width="136" height="92" rx="34" fill="#090D16" stroke={accentColor || '#6366F1'} strokeWidth="3" />
          <path d="M46,90 L76,90 M61,75 L61,105" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <circle cx="126" cy="80" r="5.5" fill="#EF4444" />
          <circle cx="138" cy="90" r="5.5" fill="#3B82F6" />
          <circle cx="114" cy="90" r="5.5" fill="#10B981" />
          <circle cx="126" cy="100" r="5.5" fill="#F59E0B" />
          <rect x="78" y="86" width="24" height="6" rx="3" fill="#64748B" />
          <circle cx="90" cy="62" r="4" fill={accentColor || '#6366F1'} opacity="0.9" />
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

    if (imageType === 'jewelry_chain' || imageType === 'jewelry_necklace') {
      return (
        <svg viewBox="0 0 180 200" className="h-[84%] w-[84%] drop-shadow-[0_16px_32px_rgba(212,175,55,0.25)] transition-transform duration-300 group-hover:scale-108">
          {/* Black velvet jewelry bust silhouette */}
          <path d="M50,190 L58,95 Q90,118 122,95 L130,190 Z" fill="#141418" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
          {/* Cuban Link / Gold Chain drape */}
          <path d="M60,65 Q90,150 120,65" fill="none" stroke="#D4AF37" strokeWidth="7" strokeLinecap="round" strokeDasharray="4 2" />
          <path d="M62,65 Q90,150 118,65" fill="none" stroke="#FFF0BA" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 2" />
          {/* Solitaire Diamond Pendant if necklace */}
          {imageType === 'jewelry_necklace' && (
            <g transform="translate(90, 142)">
              <polygon points="0,-12 12,0 0,12 -12,0" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" />
              <polygon points="0,-6 6,0 0,6 -6,0" fill="#E0F2FE" />
              <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
            </g>
          )}
          {/* Hallmark 18K / 24K Vault Badge */}
          <rect x="68" y="170" width="44" height="15" rx="3" fill="#D4AF37" opacity="0.9" />
          <text x="90" y="181" fill="#0A0A0C" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">18K SOLID</text>
        </svg>
      );
    }

    if (imageType === 'jewelry_ring' || imageType === 'jewelry_watch') {
      return (
        <svg viewBox="0 0 180 180" className="h-[80%] w-[80%] drop-shadow-[0_16px_28px_rgba(212,175,55,0.3)] transition-transform duration-300 group-hover:scale-105">
          {imageType === 'jewelry_watch' ? (
            <g>
              {/* Watch Strap */}
              <rect x="70" y="15" width="40" height="150" rx="4" fill="#D4AF37" stroke="#9A7B1C" strokeWidth="1.5" strokeDasharray="2 3" />
              {/* Watch Bezel */}
              <circle cx="90" cy="90" r="42" fill="#0C0D12" stroke="#D4AF37" strokeWidth="5" />
              <circle cx="90" cy="90" r="34" fill="#141722" stroke="#F5D77F" strokeWidth="1" />
              {/* Watch Hands */}
              <line x1="90" y1="90" x2="90" y2="68" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="90" y1="90" x2="108" y2="90" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <circle cx="90" cy="90" r="3.5" fill="#D4AF37" />
            </g>
          ) : (
            <g>
              {/* Solid Signet Ring */}
              <ellipse cx="90" cy="115" rx="42" ry="18" fill="none" stroke="#D4AF37" strokeWidth="10" />
              <polygon points="62,75 118,75 128,95 52,95" fill="#D4AF37" stroke="#9A7B1C" strokeWidth="1.5" />
              <polygon points="66,78 114,78 122,92 58,92" fill="#0C0D12" />
              <text x="90" y="88" fill="#D4AF37" fontSize="10" fontWeight="bold" textAnchor="middle">♛</text>
            </g>
          )}
        </svg>
      );
    }

    if (imageType === 'streetwear_hoodie' || imageType === 'streetwear_cargo' || imageType === 'streetwear_tee') {
      return (
        <svg viewBox="0 0 180 200" className="h-[84%] w-[84%] drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105">
          {imageType === 'streetwear_cargo' ? (
            <g>
              {/* Baggy Cargo Pants Silhouette */}
              <path d="M50,30 L130,30 L138,180 L102,180 L90,85 L78,180 L42,180 Z" fill="#1C1F26" stroke="#FF5500" strokeWidth="1.5" />
              <rect x="36" y="80" width="18" height="32" rx="2" fill="#282C37" stroke="#FF5500" strokeWidth="1" />
              <rect x="126" y="80" width="18" height="32" rx="2" fill="#282C37" stroke="#FF5500" strokeWidth="1" />
              <line x1="50" y1="52" x2="130" y2="52" stroke="#374151" strokeWidth="2" />
              <rect x="68" y="34" width="44" height="12" rx="2" fill="#FF5500" />
              <text x="90" y="43" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">WIDE-LEG</text>
            </g>
          ) : (
            <g>
              {/* Boxy Oversized Streetwear Hoodie or Tee */}
              <path d="M42,45 L68,26 L112,26 L138,45 L158,110 L134,116 L124,78 L126,175 L54,175 L56,78 L46,116 L22,110 Z" fill="#181B22" stroke="#FF5500" strokeWidth="1.5" />
              {/* Drop Shoulder Seams */}
              <line x1="52" y1="62" x2="68" y2="66" stroke="#374151" strokeWidth="2" />
              <line x1="128" y1="62" x2="112" y2="66" stroke="#374151" strokeWidth="2" />
              {/* Double-layer hood drape */}
              <path d="M68,26 Q90,46 112,26 L106,12 Q90,8 74,12 Z" fill="#232733" stroke="#FF5500" strokeWidth="1" />
              {/* Chest Stencil Graphic */}
              <rect x="65" y="85" width="50" height="24" rx="2" fill="#FF5500" opacity="0.9" />
              <text x="90" y="100" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1.5">DISTRICT</text>
              <text x="90" y="125" fill="#9CA3AF" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="2">420 GSM</text>
            </g>
          )}
        </svg>
      );
    }

    if (imageType === 'food_canister') {
      return (
        <svg viewBox="0 0 180 200" className="h-[82%] w-[82%] drop-shadow-[0_16px_26px_rgba(62,39,35,0.2)] transition-transform duration-300 group-hover:scale-105">
          {/* Acacia Wood Lid */}
          <rect x="52" y="22" width="76" height="18" rx="5" fill="#8D5B3A" stroke="#5C381E" strokeWidth="1.5" />
          <ellipse cx="90" cy="22" rx="38" ry="8" fill="#A47148" />
          {/* Borosilicate Glass Cylinder Container */}
          <rect x="54" y="40" width="72" height="130" rx="10" fill="#FFFFFF" opacity="0.88" stroke="#8D5B3A" strokeWidth="2" />
          {/* Storage Content Fill (Roasted coffee beans / pantry grains) */}
          <rect x="58" y="70" width="64" height="95" rx="6" fill="#3E2723" opacity="0.85" />
          {/* Coffee beans texture dots inside canister */}
          <circle cx="75" cy="90" r="4" fill="#6D4C41" />
          <circle cx="95" cy="98" r="4.5" fill="#5D4037" />
          <circle cx="85" cy="120" r="4" fill="#6D4C41" />
          <circle cx="105" cy="135" r="4.5" fill="#5D4037" />
          {/* Airtight Seal Badge */}
          <rect x="66" y="52" width="48" height="14" rx="3" fill="#C86432" />
          <text x="90" y="62" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" textAnchor="middle">AIRTIGHT CO2</text>
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

  // Manual payment transfer proof state
  const [customerTxRef, setCustomerTxRef] = useState('');
  const [customerPaymentNote, setCustomerPaymentNote] = useState('');
  const [submittingPaymentProof, setSubmittingPaymentProof] = useState(false);
  const [paymentProofNotice, setPaymentProofNotice] = useState('');
  const [paymentProofError, setPaymentProofError] = useState('');

  // Support state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportReplyNotice, setSupportReplyNotice] = useState<any>(null);
  const [supportError, setSupportError] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  // Customer 1-to-5 Star Review state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewProduct, setReviewProduct] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

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
      const res = await fetch('/api/storefront/' + slug, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    const finalName = (reviewName || customerName || '').trim();
    const finalComment = reviewComment.trim();
    if (!finalName) {
      setReviewError('Please enter your name so the store knows who left the review.');
      return;
    }
    if (!finalComment || finalComment.length < 3) {
      setReviewError('Please write a short comment sharing your experience.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/storefront/' + slug + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: finalName,
          rating: reviewRating,
          comment: finalComment,
          product_name: reviewProduct,
          order_number: orderResult?.orderNumber || '',
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setReviewError(json.error || 'Could not submit your review.');
      } else {
        setReviewSuccess(`Thank you! Your ${reviewRating}-star review has been shared with this store.`);
        setReviewComment('');
        setShowReviewForm(false);
        setData((prev: any) =>
          prev
            ? {
                ...prev,
                reviews: json.reviews || prev.reviews || [],
                reviewStats: json.reviewStats || prev.reviewStats,
              }
            : prev
        );
      }
    } catch (err: any) {
      setReviewError(err.message || 'Network error while submitting review.');
    } finally {
      setSubmittingReview(false);
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
      if (tgUser) {
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        if (fullName) setCustomerName(fullName);
        if (tgUser.username) setTelegramUsername(`@${tgUser.username}`);
      }
      fetch('/api/storefront/' + slug + '/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_fingerprint: fp,
          initData: (window as any)?.Telegram?.WebApp?.initData || '',
          source: detectedSource,
        }),
      })
        .then((r) => r.json())
        .then((ident) => {
          if (ident?.identified) {
            setCustomerIdentity(ident);
            if (ident.telegram_handle && !telegramUsername) {
              setTelegramUsername(ident.telegram_handle);
            }
            if (ident.name && !customerName) {
              setCustomerName(ident.name);
            }
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }, [slug, mode, authToken]);

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

  const {
    business,
    version,
    products = [],
    services = [],
    branches = [],
    promotions = [],
    faqs = [],
    paymentMethods = [],
    reviews = [],
    reviewStats = { totalReviews: 0, averageRating: 5.0 },
  } = data;
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
  const primaryColor = livePrimary || overrideTheme?.primaryColor || versionTheme?.primaryColor || business.primary_color || '#0F172A';
  const accentColor = liveAccent || overrideTheme?.accentColor || versionTheme?.accentColor || business.accent_color || '#6366F1';
  const storeFontFamily = liveFont || overrideTheme?.fontFamily || versionTheme?.fontFamily || business.font_family || 'Plus Jakarta Sans';

  // Dynamic Taste, Atmosphere, Typography & Product Seating Resolution
  const tastePreset = overrideTheme?.tastePreset || versionTheme?.tastePreset || (business.category === 'jewelry' ? 'jewelry_luxury' : business.category === 'streetwear_baggy' || business.category === 'clothing' ? 'streetwear_baggy' : business.category === 'coffee_shop' || business.category === 'gourmet_food' ? 'gourmet_food' : business.category === 'arabian_heritage' ? 'arabian_heritage' : 'clean_modern');
  const backgroundType = overrideTheme?.backgroundType || versionTheme?.backgroundType || (tastePreset === 'jewelry_luxury' ? 'obsidian_velvet' : tastePreset === 'streetwear_baggy' ? 'street_concrete' : tastePreset === 'gourmet_food' ? 'craft_paper' : tastePreset === 'arabian_heritage' ? 'warm_sand' : 'clean_studio');
  const backgroundColor = overrideTheme?.backgroundColor || versionTheme?.backgroundColor || (backgroundType === 'obsidian_velvet' ? '#0B0C10' : backgroundType === 'street_concrete' ? '#121316' : backgroundType === 'craft_paper' ? '#F6F2EB' : backgroundType === 'warm_sand' ? '#FAF7F0' : '#FAFAFA');
  const backgroundPattern = overrideTheme?.backgroundPattern || versionTheme?.backgroundPattern || (tastePreset === 'jewelry_luxury' ? 'gold_dust' : tastePreset === 'streetwear_baggy' ? 'concrete_grain' : tastePreset === 'gourmet_food' ? 'craft_fibers' : tastePreset === 'arabian_heritage' ? 'islamic_geometry' : 'subtle_grid');
  const isDarkTheme = (overrideTheme?.pageDarkness || versionTheme?.pageDarkness) === 'dark' || ((overrideTheme?.pageDarkness || versionTheme?.pageDarkness) !== 'light' && (backgroundColor === '#0B0C10' || backgroundColor === '#121316' || backgroundColor === '#09090B' || backgroundColor === '#18181B' || backgroundColor === '#000000' || backgroundColor === '#180707' || backgroundColor === '#1C0606'));
  const headingTransform = overrideTheme?.headingTransform || versionTheme?.headingTransform || (tastePreset === 'streetwear_baggy' || tastePreset === 'jewelry_luxury' ? 'uppercase' : 'capitalize');
  const productCardStyle = overrideTheme?.productCardStyle || versionTheme?.productCardStyle || (tastePreset === 'jewelry_luxury' ? 'jewelry_pedestal' : tastePreset === 'streetwear_baggy' ? 'streetwear_lookbook' : tastePreset === 'gourmet_food' ? 'artisan_craft' : tastePreset === 'arabian_heritage' ? 'arabian_heritage' : 'modern_clean');
  const productAspectRatio = overrideTheme?.productAspectRatio || versionTheme?.productAspectRatio || (productCardStyle === 'streetwear_lookbook' ? 'aspect-[3/4.2]' : productCardStyle === 'jewelry_pedestal' ? 'aspect-[1/1.15]' : productCardStyle === 'artisan_craft' ? 'aspect-[1/1]' : 'aspect-[1/1.08]');
  const cardRadius = overrideTheme?.cardRadius || versionTheme?.cardRadius || (productCardStyle === 'streetwear_lookbook' ? '0px' : productCardStyle === 'jewelry_pedestal' ? '16px' : productCardStyle === 'artisan_craft' ? '18px' : '20px');
  const cardBackgroundStyle = overrideTheme?.cardBackgroundStyle || versionTheme?.cardBackgroundStyle || (isDarkTheme ? 'dark_surface' : productCardStyle === 'artisan_craft' ? 'craft_beige' : 'white');
  const headerStyle = overrideTheme?.headerStyle || versionTheme?.headerStyle || (tastePreset === 'streetwear_baggy' ? 'street_banner' : tastePreset === 'gourmet_food' ? 'artisan_minimal' : tastePreset === 'arabian_heritage' || tastePreset === 'jewelry_luxury' ? 'royal_crest' : 'modern_clean');
  const buttonStyle = (overrideTheme?.buttonStyle || versionTheme?.buttonStyle || (productCardStyle === 'streetwear_lookbook' ? 'sharp' : '3d')) as '3d' | 'pill' | 'sharp';
  const showStockBadges = overrideTheme?.showStockBadges ?? versionTheme?.showStockBadges ?? true;
  const showStarRatings = overrideTheme?.showStarRatings ?? versionTheme?.showStarRatings ?? true;

  const getBackgroundPatternStyle = () => {
    if (backgroundPattern === 'islamic_geometry') {
      return {
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(198, 156, 109, 0.08) 2px, transparent 2px), radial-gradient(circle at 0% 0%, rgba(198, 156, 109, 0.06) 2px, transparent 2px)`,
        backgroundSize: '24px 24px',
      };
    }
    if (backgroundPattern === 'gold_dust') {
      return {
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.14) 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, rgba(245, 215, 127, 0.1) 2px, transparent 2px)`,
        backgroundSize: '36px 36px',
      };
    }
    if (backgroundPattern === 'concrete_grain') {
      return {
        backgroundImage: `radial-gradient(rgba(255, 85, 0, 0.06) 1.2px, transparent 0)`,
        backgroundSize: '16px 16px',
      };
    }
    if (backgroundPattern === 'craft_fibers') {
      return {
        backgroundImage: `radial-gradient(rgba(141, 91, 58, 0.09) 1.5px, transparent 0)`,
        backgroundSize: '22px 22px',
      };
    }
    if (backgroundPattern === 'subtle_grid') {
      return {
        backgroundImage: `linear-gradient(to right, rgba(100, 116, 139, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.07) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      };
    }
    return {};
  };

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
    if (!authToken || !business?.id || quickSaving) return;
    setQuickSaving(true);
    setQuickNotice('');
    try {
      const settingsRes = await fetch(`/api/businesses/${business.id}/settings`, {
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
      const settingsJson = await settingsRes.json().catch(() => ({}));
      if (!settingsRes.ok) throw new Error(settingsJson.error || 'Store appearance could not be saved.');

      if (quickAddCat.trim()) {
        const categoryRes = await fetch(`/api/businesses/${business.id}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ category_name: quickAddCat.trim() }),
        });
        const categoryJson = await categoryRes.json().catch(() => ({}));
        if (!categoryRes.ok) throw new Error(categoryJson.error || 'The new category could not be saved.');
        setQuickAddCat('');
      }
      await loadStorefront();
      setQuickNotice('Store appearance saved successfully.');
      if (onOrderCreated) onOrderCreated();
    } catch (err: any) {
      setQuickNotice(err?.message || 'Could not save quick edits.');
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
          customer_tx_ref: customerTxRef.trim(),
          customer_note: customerPaymentNote.trim(),
          source: channelSource,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOrderError(json.error || 'Your order could not be submitted. Please try again.');
        return;
      }
      setOrderResult(json);
      setPaymentProofNotice(
        customerTxRef.trim()
          ? `Transfer reference ${customerTxRef.trim()} submitted for seller verification.`
          : ''
      );
      setPaymentProofError('');
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

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderResult?.orderId) return;
    if (!customerTxRef.trim()) {
      setPaymentProofError('Please enter your transfer reference or transaction ID.');
      return;
    }
    setPaymentProofError('');
    setPaymentProofNotice('');
    setSubmittingPaymentProof(true);
    try {
      const res = await fetch(`/api/storefront/${slug}/orders/${orderResult.orderId}/submit-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_tx_ref: customerTxRef.trim(),
          customer_note: customerPaymentNote.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPaymentProofError(json.error || 'Could not submit payment proof.');
        return;
      }
      setOrderResult((prev: any) =>
        prev
          ? {
              ...prev,
              paymentStatus: json.paymentStatus || 'pending_verification',
              customerTxRef: json.customerTxRef || customerTxRef.trim(),
            }
          : prev
      );
      setPaymentProofNotice('Payment proof submitted! The store owner has been notified to verify your transfer.');
      if (onOrderCreated) onOrderCreated();
    } catch {
      setPaymentProofError('Network error while submitting payment proof.');
    } finally {
      setSubmittingPaymentProof(false);
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

    const cardSurfaceClasses = (() => {
      if (cardBackgroundStyle === 'dark_surface' || (isDarkTheme && cardBackgroundStyle !== 'white')) {
        return 'bg-[#12131A] border-[#252736] text-white shadow-[0_12px_32px_rgba(0,0,0,0.5)]';
      }
      if (cardBackgroundStyle === 'craft_beige') {
        return 'bg-[#F4EFE6] border-[#DED3C4] text-[#2D1810] shadow-[0_8px_24px_rgba(45,24,16,0.06)]';
      }
      if (cardBackgroundStyle === 'bordered_clear') {
        return 'bg-transparent border-2 border-slate-700/80 text-white shadow-none';
      }
      if (cardBackgroundStyle === 'glass') {
        return isDarkTheme
          ? 'bg-slate-900/70 backdrop-blur-md border-slate-700 text-white'
          : 'bg-white/80 backdrop-blur-md border-stone-200 text-slate-900';
      }
      return 'bg-white border-[#EBE5DA] text-slate-900 shadow-[0_8px_26px_rgba(15,23,42,0.05)]';
    })();

    const buttonClass = (() => {
      if (buttonStyle === 'sharp') return 'rounded-none shadow-none';
      if (buttonStyle === 'pill') return 'rounded-full shadow-sm';
      return 'rounded-xl shadow-[0_3px_0_rgba(15,23,42,0.28)]';
    })();

    return (
      <article
        key={prod.id}
        onClick={() => openProductDetail(prod)}
        className={`group relative flex cursor-pointer flex-col overflow-hidden border p-2.5 transition-all duration-200 hover:-translate-y-1 ${cardSurfaceClasses}`}
        style={{
          borderRadius: cardRadius,
          fontFamily: storeFontFamily,
        }}
      >
        {/* Framed Product Studio Image (Uploaded Photo or Studio Illustration) */}
        <div className="relative overflow-hidden" style={{ borderRadius: cardRadius === '0px' ? '0px' : '14px' }}>
          <ProductVisualCard
            imageType={prod.image_type}
            imageUrl={prod.image_url}
            galleryUrls={galleryUrls}
            title={prod.name}
            accentColor={primaryColor}
            aspectClass={productAspectRatio}
          />

          {/* Domain-Specific Seating Badges (Jewelry Hallmarks, Streetwear Stencils, Food Airtight Seals) */}
          {productCardStyle === 'jewelry_pedestal' && (
            <span className="absolute left-2.5 top-2.5 rounded border border-[#D4AF37]/60 bg-black/80 px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase backdrop-blur-xs">
              18K SOLID GOLD
            </span>
          )}
          {productCardStyle === 'streetwear_lookbook' && (
            <span className="absolute left-2 top-2 bg-black px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-[#FF5500]">
              DROP 04 // 420 GSM
            </span>
          )}
          {productCardStyle === 'artisan_craft' && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-[#4E342E] px-2.5 py-0.5 text-[8px] font-bold tracking-wide text-amber-200 shadow-xs">
              AIRTIGHT · CO2 VALVE
            </span>
          )}

          {showStockBadges && badgeLabel && productCardStyle !== 'jewelry_pedestal' && productCardStyle !== 'streetwear_lookbook' && (
            <span
              className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm"
              style={{
                backgroundColor: badgeLabel === 'Bestseller' ? accentColor : primaryColor,
              }}
            >
              {badgeLabel}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => handleToggleWishlist(prod.id, e)}
            aria-label={'Save ' + prod.name}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/40"
          >
            <Heart className={'h-4 w-4 ' + (isLiked ? 'fill-rose-500 text-rose-500' : 'text-white')} />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between px-1 pt-3 pb-1">
          <div>
            <h4
              className={`line-clamp-1 text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}
              style={{
                textTransform: headingTransform,
                fontFamily: storeFontFamily,
              }}
            >
              {prod.name}
            </h4>
            <p className={`mt-0.5 line-clamp-1 text-[11px] ${isDarkTheme ? 'text-slate-400' : 'text-stone-500'}`}>
              {prod.category_name || 'Signature Offering'}
            </p>

            {/* Price, Compare Price, Discount Pill & Star Rating */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-sm font-extrabold tabular-nums ${
                    productCardStyle === 'jewelry_pedestal'
                      ? 'text-[#D4AF37] font-serif font-black'
                      : isDarkTheme
                      ? 'text-white'
                      : 'text-slate-950'
                  }`}
                >
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
              ) : showStarRatings ? (
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                  {ratingVal} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
              ) : null}
            </div>
          </div>

          {/* Full-Width Add to Cart Button */}
          <div className="mt-3 space-y-2.5" onClick={(e) => e.stopPropagation()}>
            {inBagItem ? (
              <div
                className={`flex items-center justify-between border-2 px-2 py-1 ${buttonClass}`}
                style={{ borderColor: primaryColor }}
              >
                <button
                  type="button"
                  onClick={() => handleAdjustCartQty(prod.id, -1)}
                  className={`flex h-7 w-7 items-center justify-center font-bold ${isDarkTheme ? 'bg-slate-800 text-white' : 'bg-stone-100 text-slate-900'} ${buttonClass}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className={`text-xs font-extrabold tabular-nums ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  {inBagItem.qty} in cart
                </span>
                <button
                  type="button"
                  onClick={() => handleAddToCart(prod, activeVar, activeSwatch)}
                  className={`flex h-7 w-7 items-center justify-center font-bold text-white ${buttonClass}`}
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
                className={`flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:translate-y-0.5 disabled:opacity-40 ${buttonClass}`}
                style={{
                  backgroundColor: primaryColor,
                  color: productCardStyle === 'jewelry_pedestal' ? '#0A0A0A' : '#FFFFFF',
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
                <span className={`text-[10px] font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-stone-400'}`}>
                  +{Math.max(1, variations.length - 1)}
                </span>
              </div>
              <span className={`text-[10px] font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-stone-400'}`}>{activeVar}</span>
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
        `telebiz-storefront relative mx-auto flex w-full max-w-[1280px] flex-col overflow-hidden rounded-[32px] border transition-colors ${
          isDarkTheme ? 'border-slate-800 text-white' : 'border-[#E6DFD3] text-slate-900'
        } shadow-[0_24px_80px_rgba(15,23,42,0.12)] ` +
        (mode === 'full_storefront' ? 'my-2 min-h-[min(920px,calc(100vh-24px))]' : 'min-h-[680px]')
      }
      style={{
        ['--store-primary' as any]: primaryColor,
        ['--store-accent' as any]: accentColor,
        backgroundColor,
        fontFamily: `'${storeFontFamily}', sans-serif`,
        ...getBackgroundPatternStyle(),
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
            <div
              className={`flex flex-col overflow-hidden rounded-[38px] border-[6px] border-white shadow-2xl transition-colors ${
                isDarkTheme ? 'text-white' : 'text-slate-900'
              }`}
              style={{ backgroundColor }}
            >
              <div className={`flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                <span>9:41</span>
                <span className="text-[10px] uppercase tracking-widest opacity-60">Screen 1 · Home</span>
              </div>
              {/* Brand Crest Header */}
              <div className="flex items-center justify-between px-4 py-2">
                <button type="button" onClick={() => setActiveTab('catalog')} className={`p-1.5 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                  <Menu className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <div className="mx-auto mb-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ color: accentColor }}>
                    {headerStyle === 'royal_crest' ? '♛' : headerStyle === 'artisan_minimal' ? '☕' : '✦'}
                  </div>
                  <div
                    className="text-base font-bold leading-none tracking-tight"
                    style={{
                      color: isDarkTheme ? '#FFFFFF' : primaryColor,
                      fontFamily: `'${storeFontFamily}', serif`,
                      textTransform: headingTransform,
                    }}
                  >
                    {business.name.split(' ')[0]}
                  </div>
                  <div className={`mt-0.5 text-[8px] font-bold uppercase tracking-[0.22em] ${isDarkTheme ? 'text-slate-400' : 'text-stone-500'}`}>
                    {String(catMeta.label || business.category).replace(/^\d+\.\s*/, '')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className={`relative p-1.5 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}
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
                <div
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs ${
                    isDarkTheme ? 'bg-white/10 text-slate-300' : 'bg-[#F1ECE2] text-stone-600'
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${business.name}...`}
                    className={`w-full bg-transparent text-[11px] outline-none ${isDarkTheme ? 'text-white placeholder:text-slate-400' : 'text-slate-800'}`}
                  />
                  <SlidersHorizontal className={`h-3.5 w-3.5 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`} />
                </div>
              </div>

              {/* Dynamic Styled Hero Card */}
              <div className="px-4 py-2">
                <div
                  className="relative overflow-hidden rounded-[22px] p-4 shadow-sm"
                  style={{
                    background: isDarkTheme
                      ? `linear-gradient(135deg, ${primaryColor} 0%, #0B0F17 100%)`
                      : `linear-gradient(135deg, ${primaryColor}14 0%, ${accentColor}25 100%)`,
                    border: `1px solid ${accentColor}40`,
                  }}
                >
                  <div className="relative z-10 max-w-[62%] space-y-2">
                    <span
                      className="inline-block text-[9px] font-extrabold uppercase tracking-wider"
                      style={{ color: isDarkTheme ? accentColor : primaryColor }}
                    >
                      {String(catMeta.label || business.category || 'Featured').replace(/^\d+\.\s*/, '')}
                    </span>
                    <h3
                      className={`text-lg font-bold leading-snug ${isDarkTheme ? 'text-white' : 'text-slate-950'}`}
                      style={{
                        fontFamily: `'${storeFontFamily}', serif`,
                        textTransform: headingTransform,
                      }}
                    >
                      {heroSection?.title || business.name}
                    </h3>
                    <p className={`line-clamp-2 text-[10px] ${isDarkTheme ? 'text-slate-300' : 'text-stone-700'}`}>
                      {heroSection?.subtitle || business.description || 'Welcome to our store. Browse catalog below.'}
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
                  <div className="absolute right-1 bottom-0 top-1 w-32 flex items-center justify-center">
                    {products[0]?.image_url ? (
                      <ProductVisualCard
                        imageUrl={products[0]?.image_url}
                        title={business.name}
                        accentColor={primaryColor}
                        aspectClass="h-full"
                      />
                    ) : products[0]?.image_type && !products[0]?.image_type.startsWith('thobe') ? (
                      <ProductVisualCard
                        imageType={products[0]?.image_type}
                        title={business.name}
                        accentColor={primaryColor}
                        aspectClass="h-full"
                      />
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center rounded-2xl p-3 text-center shadow-md backdrop-blur-md"
                        style={{
                          backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                          border: `1px solid ${accentColor}40`,
                        }}
                      >
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl font-extrabold text-base shadow-xs"
                          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                        >
                          {String(business.logo_text || business.name || 'ST').slice(0, 2).toUpperCase()}
                        </div>
                        <span
                          className="mt-1.5 block max-w-[80px] truncate text-[8px] font-extrabold uppercase tracking-wider opacity-85"
                          style={{ color: isDarkTheme ? '#FFFFFF' : '#0F172A' }}
                        >
                          {String(catMeta.label || business.category || 'Store').replace(/^\d+\.\s*/, '')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4-Icon Trust Row */}
              <div
                className={`mx-4 my-1.5 grid grid-cols-4 divide-x rounded-2xl py-2.5 text-center shadow-xs ${
                  isDarkTheme
                    ? 'border border-white/10 bg-white/5 divide-white/10 text-white'
                    : 'divide-stone-200 bg-white text-slate-800'
                }`}
              >
                {[
                  { icon: ShieldCheck, label: 'Premium\nQuality' },
                  { icon: CreditCard, label: 'Secure\nPayment' },
                  { icon: Truck, label: 'Fast\nDelivery' },
                  { icon: ShoppingBag, label: 'Easy\nReturns' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 px-1">
                      <Icon className={`h-4 w-4 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`} />
                      <span className={`whitespace-pre-line text-[9px] font-semibold leading-tight ${isDarkTheme ? 'text-slate-300' : 'text-stone-600'}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Shop By Category */}
              <div className="px-4 py-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-xs font-extrabold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>Shop By Category</span>
                  <span className="text-[10px] font-semibold opacity-60">View All →</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {productCategories.slice(1, 5).map((cat, idx) => {
                    const catProd = products.find((p: any) => p.category_name === cat) || products[idx];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className="group text-center"
                      >
                        <div className="overflow-hidden rounded-xl">
                          {catProd?.image_url ? (
                            <ProductVisualCard
                              imageUrl={catProd.image_url}
                              title={cat}
                              accentColor={primaryColor}
                              aspectClass="aspect-square"
                            />
                          ) : (
                            <div
                              className="flex aspect-square w-full items-center justify-center rounded-xl border transition group-hover:scale-105"
                              style={{
                                background: isDarkTheme
                                  ? `linear-gradient(135deg, ${primaryColor}40, rgba(255,255,255,0.06))`
                                  : `linear-gradient(135deg, ${primaryColor}12, ${accentColor}20)`,
                                borderColor: `${accentColor}30`,
                              }}
                            >
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg shadow-2xs"
                                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                              >
                                {idx % 4 === 0 ? (
                                  <ShoppingBag className="h-4 w-4" />
                                ) : idx % 4 === 1 ? (
                                  <Sparkles className="h-4 w-4" />
                                ) : idx % 4 === 2 ? (
                                  <Tag className="h-4 w-4" />
                                ) : (
                                  <Package className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className={`mt-1 block truncate text-[10px] font-bold ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>
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
          <header
            className={`relative z-10 border-b transition-colors px-4 py-3.5 sm:px-8 ${
              isDarkTheme
                ? 'border-slate-800 bg-[#121319]/90 text-white shadow-md'
                : 'border-[#EBE4D8] bg-[#FAF8F5]/90 text-slate-900 shadow-2xs'
            } backdrop-blur-md`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left: Menu / Category Drawer Trigger & Channel Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo(activeTab === 'catalog' ? 'home' : 'catalog')}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-2xs transition ${
                    isDarkTheme
                      ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800'
                      : 'border-[#E5DEC9] bg-white text-slate-800 hover:bg-stone-50'
                  }`}
                  aria-label="Browse categories"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div
                  className={`hidden items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
                    isDarkTheme ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-[#E5DEC9] bg-white text-stone-600'
                  }`}
                >
                  <span>{String(catMeta.label || business.category).replace(/^\d+\.\s*/, '')}</span>
                  {business.telegram_bot_username && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-[10px] text-indigo-400">{business.telegram_bot_username}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Center: Dynamic Brand Header based on headerStyle */}
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="group flex flex-col items-center text-center"
              >
                {headerStyle === 'royal_crest' && (
                  <span className="flex h-5 w-5 items-center justify-center text-xs font-bold transition group-hover:scale-110" style={{ color: accentColor }}>
                    ♛
                  </span>
                )}
                {headerStyle === 'artisan_minimal' && (
                  <span className="flex h-5 w-5 items-center justify-center text-xs transition group-hover:scale-110">
                    ☕
                  </span>
                )}
                {headerStyle === 'street_banner' && (
                  <span className="font-mono text-[9px] font-black tracking-widest text-[#FF5500] uppercase">
                    EST. 2026 // DROP STUDIO
                  </span>
                )}
                <span
                  className={`text-xl font-bold tracking-tight sm:text-2xl ${
                    headerStyle === 'street_banner' ? 'font-mono font-black uppercase' : ''
                  }`}
                  style={{
                    color: isDarkTheme ? (headerStyle === 'royal_crest' ? '#F5D77F' : '#FFFFFF') : (headerStyle === 'royal_crest' ? '#7A542E' : '#1C1917'),
                    fontFamily: headerStyle === 'street_banner' ? 'Space Grotesk, sans-serif' : `'${storeFontFamily}', serif`,
                    textTransform: headingTransform,
                  }}
                >
                  {business.name}
                </span>
                <span className={`mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.24em] ${isDarkTheme ? 'text-slate-400' : 'text-stone-500'}`}>
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
              <div
                className={`flex flex-1 items-center gap-2.5 rounded-full border px-4 py-2.5 transition focus-within:ring-2 focus-within:ring-indigo-500/20 ${
                  isDarkTheme
                    ? 'border-slate-700 bg-slate-900 text-white focus-within:border-slate-500'
                    : 'border-[#E5DEC9] bg-[#F2EDE3] text-slate-900 focus-within:border-stone-400 focus-within:bg-white'
                }`}
              >
                <Search className={`h-4 w-4 shrink-0 ${isDarkTheme ? 'text-slate-400' : 'text-stone-500'}`} />
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
                  className={`w-full bg-transparent text-xs outline-none ${
                    isDarkTheme ? 'text-white placeholder:text-slate-400' : 'text-slate-900 placeholder:text-stone-500'
                  }`}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen((prev) => !prev)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
                  isDarkTheme
                    ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800'
                    : 'border-[#E5DEC9] bg-[#F2EDE3] text-slate-800 hover:bg-white'
                }`}
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

                {/* I Have Paid — Submit / Update Manual Transfer Reference */}
                <form
                  onSubmit={handleSubmitPaymentProof}
                  className="mt-3 rounded-xl border border-emerald-200 bg-white p-3 text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-slate-900">
                      Submit Transfer Proof (&quot;I Have Paid&quot;)
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      Status: {String(orderResult.paymentStatus || 'pending_verification').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={customerTxRef}
                      onChange={(e) => setCustomerTxRef(e.target.value)}
                      placeholder="Transfer Ref / FT / SMS ID *"
                      className="rounded-lg border border-stone-200 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={customerPaymentNote}
                      onChange={(e) => setCustomerPaymentNote(e.target.value)}
                      placeholder="Sender name or note (optional)"
                      className="rounded-lg border border-stone-200 bg-[#FAF8F5] px-3 py-2 text-xs text-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={submittingPaymentProof}
                      className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {submittingPaymentProof ? 'Submitting...' : 'I Have Paid — Submit Ref'}
                    </button>
                  </div>
                  {paymentProofNotice && (
                    <div className="text-[11px] font-bold text-emerald-700">{paymentProofNotice}</div>
                  )}
                  {paymentProofError && (
                    <div className="text-[11px] font-bold text-rose-700">{paymentProofError}</div>
                  )}
                </form>

                {/* Post-Purchase 1-to-5 Star Quick Review Prompt */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-600">★★★★★</span>
                    <span className="font-bold">Bought from {business.name}? Rate your experience (1 to 5 stars)!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('home');
                      setSelectedProductForDetail(null);
                      setShowReviewForm(true);
                    }}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-amber-400 transition"
                  >
                    Leave 1–5 Star Review
                  </button>
                </div>
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
                    {/* Dynamic Split Hero Banner Card */}
                    <section
                      className="relative overflow-hidden rounded-[28px] border shadow-sm"
                      style={{
                        background: isDarkTheme
                          ? `linear-gradient(135deg, ${primaryColor} 0%, #0B0F17 100%)`
                          : `linear-gradient(135deg, ${primaryColor}14 0%, ${accentColor}25 100%)`,
                        borderColor: `${accentColor}40`,
                      }}
                    >
                      <div className="grid grid-cols-1 items-center lg:grid-cols-12">
                        <div className="space-y-4 p-6 sm:p-10 lg:col-span-7">
                          <span
                            className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em]"
                            style={{ color: isDarkTheme ? accentColor : primaryColor }}
                          >
                            {String(catMeta.label || business.category).replace(/^\d+\.\s*/, '')}
                          </span>
                          <h2
                            className={`text-3xl font-bold leading-tight tracking-tight sm:text-5xl ${
                              isDarkTheme ? 'text-white' : 'text-slate-950'
                            }`}
                            style={{
                              fontFamily: `'${storeFontFamily}', serif`,
                              textTransform: headingTransform,
                            }}
                          >
                            {heroSection?.title || business.name}
                          </h2>
                          <p className={`max-w-lg text-sm leading-6 ${isDarkTheme ? 'text-slate-300' : 'text-stone-700'}`}>
                            {heroSection?.subtitle ||
                              business.description ||
                              'Welcome to our store. Browse catalog below.'}
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

                        <div className="relative h-64 overflow-hidden sm:h-80 lg:col-span-5 lg:h-full flex items-center justify-center">
                          {products[0]?.image_url ? (
                            <ProductVisualCard
                              imageUrl={products[0]?.image_url}
                              title={business.name}
                              accentColor={primaryColor}
                              aspectClass="h-full w-full"
                            />
                          ) : products[0]?.image_type && !products[0]?.image_type.startsWith('thobe') ? (
                            <ProductVisualCard
                              imageType={products[0]?.image_type}
                              title={business.name}
                              accentColor={primaryColor}
                              aspectClass="h-full w-full"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center p-6">
                              <div
                                className="flex flex-col items-center justify-center rounded-3xl p-8 text-center shadow-xl backdrop-blur-md"
                                style={{
                                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
                                  border: `1px solid ${accentColor}40`,
                                }}
                              >
                                <div
                                  className="flex h-20 w-20 items-center justify-center rounded-2xl font-extrabold text-3xl shadow-sm"
                                  style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                                >
                                  {String(business.logo_text || business.name || 'ST').slice(0, 2).toUpperCase()}
                                </div>
                                <div
                                  className="mt-3 font-display font-bold text-base"
                                  style={{ color: isDarkTheme ? '#FFFFFF' : '#0F172A' }}
                                >
                                  {business.name}
                                </div>
                                <span
                                  className="mt-1.5 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                                  style={{
                                    backgroundColor: `${accentColor}25`,
                                    color: isDarkTheme ? accentColor : primaryColor,
                                  }}
                                >
                                  {String(catMeta.label || business.category || 'Official Storefront').replace(/^\d+\.\s*/, '')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* 4-Column Trust & Guarantee Bar */}
                    <section
                      className={`grid grid-cols-2 divide-y rounded-[22px] border p-4 shadow-2xs sm:grid-cols-4 sm:divide-x sm:divide-y-0 ${
                        isDarkTheme
                          ? 'border-white/10 bg-white/5 divide-white/10 text-white'
                          : 'border-[#E8E1D5] bg-white divide-stone-200/80 text-slate-900'
                      }`}
                    >
                      {[
                        { icon: ShieldCheck, title: 'Premium Quality', sub: 'Authentic materials' },
                        { icon: CreditCard, title: 'Secure Payment', sub: 'Verified bank & wallet' },
                        { icon: Truck, title: 'Fast Delivery', sub: 'Express local dispatch' },
                        { icon: RotateCcw, title: 'Easy Returns', sub: 'Hassle-free exchange' },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="flex flex-col items-center justify-center p-2 text-center">
                            <Icon className={`h-5 w-5 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`} />
                            <div className={`mt-1.5 text-xs font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                              {item.title}
                            </div>
                            <div className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-stone-500'}`}>
                              {item.sub}
                            </div>
                          </div>
                        );
                      })}
                    </section>

                    {/* Shop By Category Visual Row */}
                    {catMeta.supportsProducts && productCategories.length > 1 && (
                      <section className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-lg font-bold sm:text-xl ${isDarkTheme ? 'text-white' : 'text-slate-950'}`}
                            style={{ fontFamily: `'${storeFontFamily}', serif` }}
                          >
                            Shop By Category
                          </h3>
                          <button
                            type="button"
                            onClick={() => navigateTo('catalog')}
                            className="inline-flex items-center gap-1 text-xs font-bold opacity-75 hover:opacity-100"
                          >
                            View All <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                          {productCategories.slice(1, 6).map((cat, idx) => {
                            const sampleProd =
                              products.find((p: any) => p.category_name === cat) || products[idx];
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  navigateTo('catalog');
                                }}
                                className={`group flex flex-col items-center rounded-[20px] border p-2.5 text-center shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md ${
                                  isDarkTheme
                                    ? 'border-white/10 bg-white/5 text-white'
                                    : 'border-[#E8E1D5] bg-white text-slate-900'
                                }`}
                              >
                                <div className="w-full overflow-hidden rounded-[14px]">
                                  {sampleProd?.image_url ? (
                                    <ProductVisualCard
                                      imageUrl={sampleProd.image_url}
                                      title={cat}
                                      accentColor={primaryColor}
                                      aspectClass="aspect-[1/0.95]"
                                    />
                                  ) : (
                                    <div
                                      className="flex aspect-[1/0.95] w-full items-center justify-center rounded-[14px] transition group-hover:scale-105"
                                      style={{
                                        background: isDarkTheme
                                          ? `linear-gradient(135deg, ${primaryColor}40, rgba(255,255,255,0.06))`
                                          : `linear-gradient(135deg, ${primaryColor}12, ${accentColor}20)`,
                                        borderColor: `${accentColor}30`,
                                      }}
                                    >
                                      <div
                                        className="flex h-12 w-12 items-center justify-center rounded-xl shadow-xs"
                                        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                                      >
                                        {idx % 4 === 0 ? (
                                          <ShoppingBag className="h-6 w-6" />
                                        ) : idx % 4 === 1 ? (
                                          <Sparkles className="h-6 w-6" />
                                        ) : idx % 4 === 2 ? (
                                          <Tag className="h-6 w-6" />
                                        ) : (
                                          <Package className="h-6 w-6" />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <span className={`mt-2.5 text-xs font-bold truncate max-w-full ${isDarkTheme ? 'text-slate-200 group-hover:text-white' : 'text-slate-900 group-hover:text-indigo-950'}`}>
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

                    {/* Customer Reviews Section (1 to 5 Stars) */}
                    <section
                      className={`rounded-[26px] border p-5 sm:p-7 space-y-5 shadow-xs ${
                        isDarkTheme
                          ? 'border-white/10 bg-white/5 text-white'
                          : 'border-[#E8E1D5] bg-white text-slate-900'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/70 dark:border-white/10 pb-4">
                        <div>
                          <div className="inline-flex items-center gap-2">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((st) => (
                                <Star
                                  key={st}
                                  className={`h-4 w-4 ${
                                    st <= Math.round(Number(reviewStats?.averageRating || 5))
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-extrabold">
                              {Number(reviewStats?.averageRating || 5).toFixed(1)} / 5.0
                            </span>
                            <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-stone-500'}`}>
                              ({reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                          <h3
                            className={`mt-1 text-lg font-bold sm:text-xl ${
                              isDarkTheme ? 'text-white' : 'text-slate-950'
                            }`}
                            style={{ fontFamily: `'${storeFontFamily}', 'Playfair Display', serif` }}
                          >
                            Customer Reviews &amp; Ratings (1 to 5 Stars)
                          </h3>
                          <p className={`text-xs ${isDarkTheme ? 'text-slate-300' : 'text-stone-500'}`}>
                            Bought something from {business.name}? Share your 1 to 5 star rating below.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewForm((prev) => !prev);
                            setReviewError('');
                            setReviewSuccess('');
                          }}
                          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                          <span>{showReviewForm ? 'Close Review Form' : 'Write a Review (1–5 ★)'}</span>
                        </button>
                      </div>

                      {reviewSuccess && (
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 flex items-center justify-between">
                          <span>{reviewSuccess}</span>
                          <button
                            type="button"
                            onClick={() => setReviewSuccess('')}
                            className="text-emerald-700 hover:text-emerald-950"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {showReviewForm && (
                        <form
                          onSubmit={handleSubmitReview}
                          className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                            isDarkTheme
                              ? 'border-white/15 bg-slate-900/80 text-white'
                              : 'border-stone-200 bg-[#FAF8F5] text-slate-900'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider">
                              Select Your Star Rating (1 to 5 Stars)
                            </span>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((starVal) => (
                                <button
                                  key={starVal}
                                  type="button"
                                  onClick={() => setReviewRating(starVal)}
                                  className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                                    reviewRating >= starVal
                                      ? 'border-amber-400 bg-amber-400/20 text-amber-600 dark:text-amber-300'
                                      : 'border-stone-300 bg-white/60 text-stone-400 dark:border-white/10 dark:bg-white/5'
                                  }`}
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      reviewRating >= starVal ? 'fill-amber-400 text-amber-400' : 'text-stone-400'
                                    }`}
                                  />
                                  <span>{starVal}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold mb-1">Your Name *</label>
                              <input
                                type="text"
                                value={reviewName || customerName}
                                onChange={(e) => setReviewName(e.target.value)}
                                placeholder="e.g. Alex M."
                                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold mb-1">Item Purchased (Optional)</label>
                              <select
                                value={reviewProduct}
                                onChange={(e) => setReviewProduct(e.target.value)}
                                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">General Storefront Experience</option>
                                {products.map((p: any) => (
                                  <option key={p.id} value={p.name}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold mb-1">Your Review *</label>
                            <textarea
                              rows={3}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Share what you loved about the product, quality, or fast Telegram service..."
                              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                            />
                          </div>

                          {reviewError && (
                            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                              {reviewError}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowReviewForm(false)}
                              className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="rounded-xl px-5 py-2 text-xs font-extrabold text-white shadow-sm disabled:opacity-50"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {submittingReview ? 'Submitting...' : `Post ${reviewRating}-Star Review`}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        {reviews.map((rev: any) => (
                          <div
                            key={rev.id}
                            className={`rounded-2xl border p-4 space-y-2 ${
                              isDarkTheme
                                ? 'border-white/10 bg-white/5 text-white'
                                : 'border-stone-200/80 bg-[#FAF8F5] text-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-3.5 w-3.5 ${
                                      s <= Number(rev.rating || 5)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-stone-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {rev.verified_purchase ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                  <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                                </span>
                              ) : null}
                            </div>
                            <p className={`text-xs leading-relaxed ${isDarkTheme ? 'text-slate-200' : 'text-stone-700'}`}>
                              “{rev.comment}”
                            </p>
                            <div className="flex items-center justify-between pt-1 text-[11px]">
                              <span className="font-bold">{rev.customer_name}</span>
                              {rev.product_name ? (
                                <span className={`truncate max-w-[180px] ${isDarkTheme ? 'text-slate-400' : 'text-stone-500'}`}>
                                  Item: {rev.product_name}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
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

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Choose Payment Account
                        </label>
                        <span className="text-[10px] text-stone-500 font-medium">
                          Transfer directly & confirm
                        </span>
                      </div>

                      {paymentMethods.length === 0 ? (
                        <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-3 text-xs text-stone-600">
                          Direct Cash on Delivery / Store Pickup
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-2">
                            {paymentMethods.map((pm: any) => {
                              const isSelected = selectedPaymentMethodId === pm.id;
                              return (
                                <button
                                  key={pm.id}
                                  type="button"
                                  onClick={() => setSelectedPaymentMethodId(pm.id)}
                                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                                      : 'border-stone-200 bg-[#FAF8F5] hover:border-stone-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-stone-200 text-stone-700'
                                      }`}
                                    >
                                      {pm.method_name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-slate-900 truncate">
                                        {pm.method_name}
                                      </div>
                                      <div className="text-[11px] text-stone-500 truncate">
                                        {pm.account_name}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-mono text-xs font-bold text-slate-800">
                                      {pm.account_number.slice(0, 4)}...{pm.account_number.slice(-4)}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Payment Method Interactive Detail Box with 1-Click Copy */}
                          {(() => {
                            const activeMethod = paymentMethods.find((m: any) => m.id === selectedPaymentMethodId) || paymentMethods[0];
                            if (!activeMethod) return null;
                            return (
                              <div className="rounded-2xl border border-indigo-200 bg-white p-3.5 space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-extrabold text-indigo-950">
                                    Send Payment to: {activeMethod.method_name}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                                    Owner Verified
                                  </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Account Holder</div>
                                    <div className="font-bold text-xs text-slate-900 truncate">{activeMethod.account_name}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Account / Phone Number</div>
                                    <div className="font-mono font-extrabold text-sm text-indigo-700 select-all tracking-wide">
                                      {activeMethod.account_number}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPaymentText('Account Number', activeMethod.account_number)}
                                    className="btn-3d-white px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 shrink-0 inline-flex items-center gap-1.5"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{copyFeedback.includes('Account Number') ? 'Copied!' : 'Copy Number'}</span>
                                  </button>
                                </div>
                                <p className="text-[11px] leading-4 text-stone-500">
                                  After transferring, enter your transfer reference below and click <strong>&quot;I Have Transferred & Paid&quot;</strong>. The store owner will verify your payment before fulfillment.
                                </p>
                                <div className="grid grid-cols-1 gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={customerTxRef}
                                    onChange={(e) => setCustomerTxRef(e.target.value)}
                                    placeholder="Transfer Reference / Transaction ID (Optional at checkout)"
                                    className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-slate-900"
                                  />
                                  <input
                                    type="text"
                                    value={customerPaymentNote}
                                    onChange={(e) => setCustomerPaymentNote(e.target.value)}
                                    placeholder="Payment note or sender account name (Optional)"
                                    className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-3 py-2 text-xs text-slate-900"
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-sm font-extrabold">
                      <span>Total Amount to Pay</span>
                      <span className="text-base text-indigo-700">{formatMoney(cartSubtotal)}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="w-full rounded-2xl py-3.5 text-xs font-extrabold text-white shadow-md transition hover:brightness-110 active:translate-y-0.5"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {submittingOrder ? 'Submitting Payment Request...' : `I Have Transferred & Paid (${formatMoney(cartSubtotal)}) →`}
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
