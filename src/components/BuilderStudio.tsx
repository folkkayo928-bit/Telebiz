import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Wrench,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  CheckCheck,
  Plus,
  Trash2,
  Palette,
  Type,
  LayoutGrid,
  Sliders,
  Check,
  Moon,
  Sun,
  Crown,
  Gem,
  ShoppingBag,
  Coffee,
  Sparkle,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../i18n/translations';
import { MiniAppStorefront } from './MiniAppStorefront';

export type BuilderWizardStep = 'taste' | 'background' | 'typography' | 'seating' | 'sections' | 'review';

export const BUILDER_WIZARD_STEPS: Array<{ id: BuilderWizardStep; label: string; number: number; subtitle: string }> = [
  { id: 'taste', number: 1, label: 'Taste & Styles', subtitle: 'Aesthetic presets' },
  { id: 'background', number: 2, label: 'Atmosphere & Textures', subtitle: 'Colors & textures' },
  { id: 'typography', number: 3, label: 'Typography', subtitle: 'Fonts & headings' },
  { id: 'seating', number: 4, label: 'Product Seating', subtitle: 'Card style & grid' },
  { id: 'sections', number: 5, label: 'Page Sections', subtitle: 'Order & visual mockup' },
  { id: 'review', number: 6, label: 'Review & Publish', subtitle: 'Save & live verification' },
];

interface BuilderStudioProps {
  business: any;
  businesses?: any[];
  versions: any[];
  authToken: string;
  onRefresh: () => void;
  onSelectBusiness?: (businessId: string) => void;
  onOpenFullPreview?: () => void;
}

export const TASTE_PRESETS = [
  {
    id: 'arabian_heritage',
    name: 'Arabian Culture & Royal Wear',
    subtitle: 'Thobes, Bishts, Agals, Oud & Gold Zari',
    icon: '👑',
    category: 'retail',
    primaryColor: '#0F382A',
    accentColor: '#C69C6D',
    backgroundType: 'warm_sand',
    backgroundColor: '#FAF7F0',
    backgroundPattern: 'islamic_geometry',
    pageDarkness: 'light',
    fontFamily: 'Playfair Display',
    headingTransform: 'capitalize',
    productCardStyle: 'arabian_heritage',
    productGridColumns: '2_cols',
    productAspectRatio: 'aspect-[1/1.08]',
    cardRadius: '22px',
    cardBackgroundStyle: 'white',
    headerStyle: 'royal_crest',
    buttonStyle: '3d',
  },
  {
    id: 'jewelry_luxury',
    name: 'Chains, Necklaces & Luxury Jewelry',
    subtitle: '18K Cuban Chains, Solitaire Diamonds, Signets & Watches',
    icon: '💎',
    category: 'retail',
    primaryColor: '#D4AF37',
    accentColor: '#F5D77F',
    backgroundType: 'obsidian_velvet',
    backgroundColor: '#0B0C10',
    backgroundPattern: 'gold_dust',
    pageDarkness: 'dark',
    fontFamily: 'Cinzel',
    headingTransform: 'uppercase',
    productCardStyle: 'jewelry_pedestal',
    productGridColumns: '2_cols',
    productAspectRatio: 'aspect-[1/1.15]',
    cardRadius: '16px',
    cardBackgroundStyle: 'dark_surface',
    headerStyle: 'royal_crest',
    buttonStyle: 'sharp',
  },
  {
    id: 'streetwear_baggy',
    name: 'Baggy Fashion & Streetwear Drops',
    subtitle: 'Heavy 420GSM Hoodies, Baggy Cargo, Boxy Tees & Denim',
    icon: '🛹',
    category: 'retail',
    primaryColor: '#FF5500',
    accentColor: '#FFFFFF',
    backgroundType: 'street_concrete',
    backgroundColor: '#121316',
    backgroundPattern: 'concrete_grain',
    pageDarkness: 'dark',
    fontFamily: 'Space Grotesk',
    headingTransform: 'uppercase',
    productCardStyle: 'streetwear_lookbook',
    productGridColumns: '2_cols',
    productAspectRatio: 'aspect-[3/4.2]',
    cardRadius: '0px',
    cardBackgroundStyle: 'bordered_clear',
    headerStyle: 'street_banner',
    buttonStyle: 'sharp',
  },
  {
    id: 'gourmet_food',
    name: 'Gourmet Food, Coffee & Storage',
    subtitle: 'Airtight Glass Canisters, Micro-Lots, Honey & Spices',
    icon: '☕',
    category: 'coffee_shop',
    primaryColor: '#2D1810',
    accentColor: '#C86432',
    backgroundType: 'craft_paper',
    backgroundColor: '#F6F2EB',
    backgroundPattern: 'craft_fibers',
    pageDarkness: 'light',
    fontFamily: 'Fraunces',
    headingTransform: 'capitalize',
    productCardStyle: 'artisan_craft',
    productGridColumns: '2_cols',
    productAspectRatio: 'aspect-[1/1]',
    cardRadius: '18px',
    cardBackgroundStyle: 'craft_beige',
    headerStyle: 'artisan_minimal',
    buttonStyle: 'pill',
  },
  {
    id: 'minimal_boutique',
    name: 'Modern Minimalist Boutique',
    subtitle: 'Clean Geometric Lines, Subtle Borders & Spacious Airy Grid',
    icon: '🕊️',
    category: 'retail',
    primaryColor: '#09090B',
    accentColor: '#2563EB',
    backgroundType: 'clean_studio',
    backgroundColor: '#FAFAFA',
    backgroundPattern: 'subtle_grid',
    pageDarkness: 'light',
    fontFamily: 'Plus Jakarta Sans',
    headingTransform: 'none',
    productCardStyle: 'minimal_editorial',
    productGridColumns: '2_cols',
    productAspectRatio: 'aspect-[1/1.05]',
    cardRadius: '14px',
    cardBackgroundStyle: 'white',
    headerStyle: 'modern_clean',
    buttonStyle: 'pill',
  },
];

const COLOR_PRESETS = [
  { id: 'gold_vault', name: '24K Gold & Obsidian', primary: '#D4AF37', accent: '#F5D77F' },
  { id: 'emerald', name: 'Botanical Emerald & Gold', primary: '#0F382A', accent: '#C69C6D' },
  { id: 'street_orange', name: 'Cyber Neon & Slate', primary: '#FF5500', accent: '#FFFFFF' },
  { id: 'espresso', name: 'Espresso & Terracotta', primary: '#2D1810', accent: '#C86432' },
  { id: 'indigo', name: 'Royal Indigo', primary: '#1E1B4B', accent: '#4F46E5' },
  { id: 'ocean', name: 'Midnight Sky', primary: '#0F172A', accent: '#0284C7' },
  { id: 'rose', name: 'Velvet Rose', primary: '#18181B', accent: '#E11D48' },
  { id: 'monochrome', name: 'Monolith Black', primary: '#09090B', accent: '#2563EB' },
];

const FONT_OPTIONS = [
  { id: 'Playfair Display', label: 'Playfair Display', style: 'Royal Editorial Serif (Heritage/Thobes)', sample: 'Timeless Elegance' },
  { id: 'Cinzel', label: 'Cinzel', style: 'Imperial Gold Serif (Chains/Jewelry)', sample: 'ROYAL CHAINS' },
  { id: 'Space Grotesk', label: 'Space Grotesk', style: 'Kinetic Grotesk (Streetwear/Baggy)', sample: 'OVERSIZED-92' },
  { id: 'Syne', label: 'Syne', style: 'High Fashion Avant-Garde', sample: 'AVANT COUTURE' },
  { id: 'Fraunces', label: 'Fraunces', style: 'Warm Artisan Serif (Gourmet Food/Coffee)', sample: 'Crafted & Warm' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', style: 'Clean Geometric Sans', sample: 'Clean & Crisp' },
  { id: 'Outfit', label: 'Outfit', style: 'Contemporary Smooth Sans', sample: 'Smooth & Bold' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono', style: 'Technical Drop Monospace', sample: 'DROP-EDITION' },
];

export const BuilderStudio: React.FC<BuilderStudioProps> = ({
  business,
  businesses = [],
  versions,
  authToken,
  onRefresh,
  onSelectBusiness,
  onOpenFullPreview,
}) => {
  const [mode, setMode] = useState<'visual' | 'ai' | 'dfy'>(
    business.creation_method === 'done_for_you'
      ? 'dfy'
      : business.creation_method === 'ai_builder'
      ? 'ai'
      : 'visual'
  );
  const [builderWorkspaceTab, setBuilderWorkspaceTab] = useState<'editor' | 'preview'>('editor');

  const latestVer = versions[0];
  const parsedLatestTheme = (() => {
    try {
      return latestVer ? JSON.parse(latestVer.theme_json || '{}') : {};
    } catch {
      return {};
    }
  })();

  const [sections, setSections] = useState<any[]>(() => {
    try {
      return latestVer ? JSON.parse(latestVer.layout_json) : [];
    } catch {
      return [];
    }
  });

  // Comprehensive Editable Theme & Taste States
  const [tastePreset, setTastePreset] = useState<string>(parsedLatestTheme.tastePreset || 'arabian_heritage');
  const [primaryColor, setPrimaryColor] = useState(business.primary_color || parsedLatestTheme.primaryColor || '#0F382A');
  const [accentColor, setAccentColor] = useState(business.accent_color || parsedLatestTheme.accentColor || '#C69C6D');
  
  // Background Customizer States
  const [backgroundType, setBackgroundType] = useState<string>(parsedLatestTheme.backgroundType || 'warm_sand');
  const [backgroundColor, setBackgroundColor] = useState<string>(parsedLatestTheme.backgroundColor || '#FAF7F0');
  const [backgroundPattern, setBackgroundPattern] = useState<string>(parsedLatestTheme.backgroundPattern || 'islamic_geometry');
  const [pageDarkness, setPageDarkness] = useState<'light' | 'dark' | 'auto'>(parsedLatestTheme.pageDarkness || 'light');

  // Font & Typography States
  const [fontFamily, setFontFamily] = useState(business.font_family || parsedLatestTheme.fontFamily || 'Playfair Display');
  const [headingTransform, setHeadingTransform] = useState<'none' | 'uppercase' | 'capitalize'>(parsedLatestTheme.headingTransform || 'capitalize');

  // Product Seating & Layout States ("How products are seated")
  const [productCardStyle, setProductCardStyle] = useState<string>(parsedLatestTheme.productCardStyle || 'arabian_heritage');
  const [productGridColumns, setProductGridColumns] = useState<string>(parsedLatestTheme.productGridColumns || '2_cols');
  const [productAspectRatio, setProductAspectRatio] = useState<string>(parsedLatestTheme.productAspectRatio || 'aspect-[1/1.08]');
  const [cardRadius, setCardRadius] = useState(parsedLatestTheme.cardRadius || '22px');
  const [cardBackgroundStyle, setCardBackgroundStyle] = useState<string>(parsedLatestTheme.cardBackgroundStyle || 'white');
  const [headerStyle, setHeaderStyle] = useState<string>(parsedLatestTheme.headerStyle || 'royal_crest');
  const [buttonStyle, setButtonStyle] = useState<'3d' | 'pill' | 'sharp'>(parsedLatestTheme.buttonStyle || '3d');
  const [showStockBadges, setShowStockBadges] = useState<boolean>(parsedLatestTheme.showStockBadges !== false);
  const [showStarRatings, setShowStarRatings] = useState<boolean>(parsedLatestTheme.showStarRatings !== false);

  // 6-Step Guided Wizard State for Store Edition
  const [wizardStep, setWizardStep] = useState<BuilderWizardStep>('taste');

  const [versionNote, setVersionNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [restoringVersionId, setRestoringVersionId] = useState('');
  const [dfySaving, setDfySaving] = useState(false);

  // AI Builder State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiNotice, setAiNotice] = useState('');
  const [aiGenerationsUsed, setAiGenerationsUsed] = useState(Number(business.ai_generations_used || 0));

  // DFY State
  const [dfyNotes, setDfyNotes] = useState(business.dfy_notes || '');
  const [dfyStatus, setDfyStatus] = useState(business.dfy_status || 'requested');

  useEffect(() => {
    const v = versions[0];
    let themeObj: any = {};
    if (v) {
      try {
        setSections(JSON.parse(v.layout_json));
      } catch {
        // ignore
      }
      try {
        themeObj = JSON.parse(v.theme_json || '{}');
      } catch {
        themeObj = {};
      }
    }
    setTastePreset(themeObj.tastePreset || 'arabian_heritage');
    setPrimaryColor(business.primary_color || themeObj.primaryColor || '#0F382A');
    setAccentColor(business.accent_color || themeObj.accentColor || '#C69C6D');
    setBackgroundType(themeObj.backgroundType || 'warm_sand');
    setBackgroundColor(themeObj.backgroundColor || '#FAF7F0');
    setBackgroundPattern(themeObj.backgroundPattern || 'islamic_geometry');
    setPageDarkness(themeObj.pageDarkness || 'light');
    setFontFamily(business.font_family || themeObj.fontFamily || 'Playfair Display');
    setHeadingTransform(themeObj.headingTransform || 'capitalize');
    setProductCardStyle(themeObj.productCardStyle || 'arabian_heritage');
    setProductGridColumns(themeObj.productGridColumns || '2_cols');
    setProductAspectRatio(themeObj.productAspectRatio || 'aspect-[1/1.08]');
    setCardRadius(themeObj.cardRadius || '22px');
    setCardBackgroundStyle(themeObj.cardBackgroundStyle || 'white');
    setHeaderStyle(themeObj.headerStyle || 'royal_crest');
    setButtonStyle(themeObj.buttonStyle || '3d');
    setShowStockBadges(themeObj.showStockBadges !== false);
    setShowStarRatings(themeObj.showStarRatings !== false);
    setDfyNotes(business.dfy_notes || '');
    setDfyStatus(business.dfy_status || 'requested');
    setAiGenerationsUsed(Number(business.ai_generations_used || 0));
  }, [business.id, versions]);

  const applyTastePreset = (presetId: string) => {
    const p = TASTE_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setTastePreset(p.id);
    setPrimaryColor(p.primaryColor);
    setAccentColor(p.accentColor);
    setBackgroundType(p.backgroundType);
    setBackgroundColor(p.backgroundColor);
    setBackgroundPattern(p.backgroundPattern);
    setPageDarkness(p.pageDarkness as any);
    setFontFamily(p.fontFamily);
    setHeadingTransform(p.headingTransform as any);
    setProductCardStyle(p.productCardStyle);
    setProductGridColumns(p.productGridColumns);
    setProductAspectRatio(p.productAspectRatio);
    setCardRadius(p.cardRadius);
    setCardBackgroundStyle(p.cardBackgroundStyle);
    setHeaderStyle(p.headerStyle);
    setButtonStyle(p.buttonStyle as any);
  };

  const currentThemeObject = {
    tastePreset,
    primaryColor,
    accentColor,
    backgroundType,
    backgroundColor,
    backgroundPattern,
    pageDarkness,
    fontFamily,
    headingTransform,
    productCardStyle,
    productGridColumns,
    productAspectRatio,
    cardRadius,
    cardBackgroundStyle,
    headerStyle,
    buttonStyle,
    showStockBadges,
    showStarRatings,
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setSections(copy);
  };

  const toggleSectionVisibility = (index: number) => {
    setSections((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, visible: s.visible === false ? true : false } : s))
    );
  };

  const updateSectionField = (index: number, field: string, value: string) => {
    setSections((prev) => prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s)));
  };

  const addSection = (type: string) => {
    const labels: Record<string, { title: string; subtitle: string }> = {
      hero: { title: `Welcome to ${business.name}`, subtitle: 'Direct ordering and booking via Telegram & Web.' },
      featured_products: { title: 'Featured Highlights', subtitle: 'Curated selections from our catalog.' },
      product_grid: { title: 'Complete Catalog', subtitle: 'Browse by category and variation.' },
      booking_widget: { title: 'Book an Appointment', subtitle: 'Instant slot confirmation.' },
      promo_banner: { title: 'Special Telegram Member Offer', subtitle: 'Apply your discount code at checkout.' },
      business_info: { title: 'Branches, Hours & Contact', subtitle: business.address },
    };
    const meta = labels[type] || labels.hero;
    setSections((prev) => [
      ...prev,
      {
        id: 'sec_' + Date.now(),
        type,
        title: meta.title,
        subtitle: meta.subtitle,
        ctaText: 'Explore',
        visible: true,
      },
    ]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, idx) => idx !== index));
  };

  const applyTemplateCategory = (catId: string) => {
    const cat = BUSINESS_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;
    setAccentColor(cat.defaultAccent);
    const nextSections: any[] = [
      {
        id: 'sec_hero',
        type: 'hero',
        title: `${business.name} — ${cat.label.replace(/^\d+\.\s*/, '')}`,
        subtitle: cat.description,
        ctaText: cat.supportsProducts ? 'Shop Catalog' : 'Book Now',
        visible: true,
      },
    ];
    if (cat.supportsProducts) {
      nextSections.push({
        id: 'sec_catalog',
        type: 'product_grid',
        title: 'Storefront Offerings',
        subtitle: 'Verified stock & variations',
        visible: true,
      });
    }
    if (cat.supportsBookings) {
      nextSections.push({
        id: 'sec_bookings',
        type: 'booking_widget',
        title: 'Online Reservations & Scheduling',
        subtitle: 'Select your preferred date and time slot',
        visible: true,
      });
    }
    nextSections.push({
      id: 'sec_about',
      type: 'business_info',
      title: 'Locations & Working Hours',
      subtitle: business.address,
      visible: true,
    });
    setSections(nextSections);
  };

  const handleSaveVersion = async (status: 'draft' | 'published') => {
    setSaving(true);
    setSaveMessage('');
    setActionError('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/builder/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          layout: sections,
          theme: currentThemeObject,
          pages: [
            { slug: 'home', title: 'Storefront', enabled: true },
            { slug: 'catalog', title: 'Products', enabled: true },
            { slug: 'bookings', title: 'Bookings', enabled: true },
            { slug: 'about', title: 'About', enabled: true },
          ],
          status,
          note: versionNote || (status === 'published' ? 'Published via Visual Builder' : 'Saved Draft'),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(json.error || 'We could not save these changes. Please try again.');
        return;
      }
      setSaveMessage(
        status === 'published'
          ? `Published version v${json.versionNumber ?? ''} to Telegram & Web.`.trim()
          : `Saved draft version v${json.versionNumber ?? ''}.`.trim()
      );
      setVersionNote('');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Network error. Your changes have not been saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    setRestoringVersionId(versionId);
    setSaveMessage('');
    setActionError('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/builder/restore/${versionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(json.error || 'This version could not be restored. Please try again.');
        return;
      }
      setSaveMessage('The selected version has been restored and published.');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Network error. The version was not restored.');
    } finally {
      setRestoringVersionId('');
    }
  };

  const handleRunAiBuilder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    setAiSummary('');
    setAiNotice('');
    setActionError('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/ai-builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentLayout: sections,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAiError(json.error || 'AI generation failed. Please try again.');
      } else {
        if (json.aiResult?.sections?.length) {
          setSections(json.aiResult.sections);
        }
        if (json.aiResult?.theme?.primaryColor) {
          setPrimaryColor(json.aiResult.theme.primaryColor);
        }
        if (json.aiResult?.theme?.accentColor) {
          setAccentColor(json.aiResult.theme.accentColor);
        }
        if (json.ai_generations_used !== undefined) {
          setAiGenerationsUsed(Number(json.ai_generations_used));
        }
        setAiNotice(json.notice || '');
        setAiSummary(json.aiResult?.summary || 'Generated an updated Mini App layout.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Network error. Your layout has not been changed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdateDfyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dfySaving) return;
    setDfySaving(true);
    setSaveMessage('');
    setActionError('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          dfy_status: dfyStatus,
          dfy_notes: dfyNotes,
          mini_app_published: dfyStatus === 'published' ? 1 : business.mini_app_published,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(json.error || 'We could not update the project brief. Please try again.');
        return;
      }
      setSaveMessage('Done-for-you project brief updated.');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Network error. Your project brief was not updated.');
    } finally {
      setDfySaving(false);
    }
  };

  return (
    <div className="telebiz-builder space-y-6">
      {/* Creation method selector */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">TeleBiz Studio</div>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[28px]">
              Build & Style: {business.name}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Customize colors, fonts, 3D tactile buttons, and page sections—then save a draft or publish live.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {business.name} · {fontFamily}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => setMode('visual')} aria-pressed={mode === 'visual'}
            className={`group rounded-2xl border p-4 text-left transition-all ${mode === 'visual' ? 'card-3d border-indigo-600 ring-2 ring-indigo-600/15' : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50'}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${mode === 'visual' ? 'btn-3d-primary' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Layers className="h-4 w-4" /></span>
              {mode === 'visual' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            </div>
            <div className="mt-3 text-sm font-bold text-slate-950 dark:text-white">1. Visual & Theme Builder</div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Choose custom colors, fonts, 3D styles, and section order.</p>
          </button>
          <button type="button" onClick={() => setMode('ai')} aria-pressed={mode === 'ai'}
            className={`group rounded-2xl border p-4 text-left transition-all ${mode === 'ai' ? 'card-3d border-indigo-600 ring-2 ring-indigo-600/15' : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50'}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${mode === 'ai' ? 'btn-3d-primary' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Sparkles className="h-4 w-4" /></span>
              <span className="text-[10px] font-bold tabular-nums text-slate-400">{aiGenerationsUsed}/{business.ai_generations_limit ?? 0} uses</span>
            </div>
            <div className="mt-3 text-sm font-bold text-slate-950 dark:text-white">2. AI Storefront Architect</div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Describe what you need and generate a tailored layout.</p>
          </button>
          <button type="button" onClick={() => setMode('dfy')} aria-pressed={mode === 'dfy'}
            className={`group rounded-2xl border p-4 text-left transition-all ${mode === 'dfy' ? 'card-3d border-indigo-600 ring-2 ring-indigo-600/15' : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50'}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${mode === 'dfy' ? 'btn-3d-primary' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Wrench className="h-4 w-4" /></span>
              {business.dfy_status && business.dfy_status !== 'not_applicable' && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{String(business.dfy_status).replace(/_/g, ' ')}</span>}
            </div>
            <div className="mt-3 text-sm font-bold text-slate-950 dark:text-white">3. Done-For-You Service</div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Send your brief to the TeleBiz team for full concierge setup.</p>
          </button>
        </div>
      </section>

      {saveMessage || actionError ? (
        <div role="status" className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-semibold ${actionError ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200' : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>
          <span>{actionError || saveMessage}</span>
          <button type="button" onClick={() => { setSaveMessage(''); setActionError(''); }} className="shrink-0 text-current underline-offset-2 hover:underline">Dismiss</button>
        </div>
      ) : null}

      {/* SEPARATED WORKSPACE SWITCHER: STORE EDITION vs. STORE PREVIEW */}
      <div className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Structured Workspace Mode
          </div>
          <h3 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">
            {builderWorkspaceTab === 'editor'
              ? `1. Store Edition Studio — Editing ${business.name}`
              : `2. Dedicated Customer Storefront Preview — ${business.name}`}
          </h3>
          <p className="text-xs text-slate-500">
            Store Editing and Store Preview are cleanly separated so your workspace stays uncluttered and focused.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setBuilderWorkspaceTab('editor')}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                builderWorkspaceTab === 'editor'
                  ? 'bg-slate-950 text-white shadow-sm dark:bg-indigo-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              1. Store Edition Controls
            </button>
            <button
              type="button"
              onClick={() => setBuilderWorkspaceTab('preview')}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                builderWorkspaceTab === 'preview'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              2. Dedicated Store Preview
            </button>
          </div>
          {onOpenFullPreview && (
            <button
              type="button"
              onClick={onOpenFullPreview}
              className="btn-3d-white px-3.5 py-2 rounded-xl text-xs font-bold"
            >
              Full-Screen Customer View ↗
            </button>
          )}
        </div>
      </div>

      {builderWorkspaceTab === 'preview' ? (
        <div className="space-y-4">
          <div className="card-3d p-4 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Dedicated Storefront Preview Mode
              </div>
              <h3 className="mt-0.5 text-base font-display font-extrabold text-slate-950 dark:text-white">
                {business.name} — Live Customer Experience
              </h3>
              <p className="text-xs text-slate-500">
                Previewing with <span className="font-mono font-semibold">{primaryColor}</span> / <span className="font-mono font-semibold">{accentColor}</span> and <span className="font-semibold">{fontFamily}</span> typography.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBuilderWorkspaceTab('editor')}
                className="btn-3d-white rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                Back to Store Edition Controls
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveVersion('published')}
                className="btn-3d-emerald rounded-xl px-4 py-2 text-xs font-extrabold text-white flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Publishing...' : 'Publish Store Changes'}
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <MiniAppStorefront
              slug={business.slug}
              mode="embedded_preview"
              overrideTheme={currentThemeObject}
              onOrderCreated={onRefresh}
            />
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Builder Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* METHOD B: SELF-SERVICE VISUAL BUILDER */}
          {mode === 'visual' && (
            <div className="space-y-6">
              {/* Wizard Step Progress Indicator */}
              <div className="card-3d rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-3 px-1">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      Step-by-Step Store Builder Wizard
                    </span>
                    <h3 className="text-sm font-display font-extrabold text-slate-950 dark:text-white">
                      {BUILDER_WIZARD_STEPS.find((s) => s.id === wizardStep)?.number}. {BUILDER_WIZARD_STEPS.find((s) => s.id === wizardStep)?.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Step {BUILDER_WIZARD_STEPS.findIndex((s) => s.id === wizardStep) + 1} of 6
                  </span>
                </div>

                {/* Step tabs (scrollable horizontally on mobile) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {BUILDER_WIZARD_STEPS.map((step, idx) => {
                    const currentIdx = BUILDER_WIZARD_STEPS.findIndex((s) => s.id === wizardStep);
                    const isCurrent = step.id === wizardStep;
                    const isPassed = idx < currentIdx;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setWizardStep(step.id)}
                        className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition shrink-0 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-white text-indigo-700'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isPassed ? <Check className="w-3 h-3" /> : step.number}
                        </span>
                        <span className="truncate">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: TASTE & STYLE PRESETS */}
              {wizardStep === 'taste' && (
                <div className="space-y-5">
                  <div className="card-3d p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                      Tailored Industry Aesthetics
                    </div>
                    <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                      1-Click Store Taste & Style Presets
                    </h3>
                    <p className="text-xs text-slate-500">
                      Different stores require different aesthetics—jewelry chains need obsidian & gold, baggy fashion needs street concrete & tall lookbooks, Arabian wear needs sand & royal green, and food needs warm craft storage.
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    Active: {TASTE_PRESETS.find((t) => t.id === tastePreset)?.name.split('&')[0] || 'Custom'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TASTE_PRESETS.map((preset) => {
                    const isActive = tastePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyTastePreset(preset.id)}
                        className={`group relative rounded-2xl border p-4 text-left transition-all ${
                          isActive
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{preset.icon}</span>
                          <span className="flex items-center -space-x-1">
                            <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: preset.primaryColor }} />
                            <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: preset.accentColor }} />
                            <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: preset.backgroundColor }} />
                          </span>
                        </div>
                        <div className="mt-2.5 text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600">
                          {preset.name}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {preset.subtitle}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-medium text-slate-600 dark:text-slate-300" style={{ fontFamily: preset.fontFamily }}>
                            {preset.fontFamily}
                          </span>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                            {preset.productCardStyle.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wizard Step 1 Navigation Footer */}
              <div className="card-3d p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Step 1 of 6 · Taste preset selected
                </span>
                <button
                  type="button"
                  onClick={() => setWizardStep('background')}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <span>Next: Atmosphere & Textures</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BACKGROUND, ATMOSPHERE & TEXTURES */}
          {wizardStep === 'background' && (
            <div className="space-y-5">
              {/* 2. BACKGROUND & SURFACE CUSTOMIZER (Fully Editable) */}
              <div className="card-3d p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                      Store Atmosphere
                    </div>
                    <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                      Background, Atmosphere & Textures
                    </h3>
                    <p className="text-xs text-slate-500">
                      Store owners can choose light desert sand, deep obsidian velvet, street concrete, or organic craft paper.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-6 w-6 rounded-lg border border-slate-300 shadow-inner" style={{ backgroundColor }} />
                  </div>
                </div>

                {/* Preset Background Atmosphere Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'warm_sand', name: 'Desert Sand', color: '#FAF7F0', pattern: 'islamic_geometry', dark: 'light' },
                    { id: 'obsidian_velvet', name: 'Obsidian Velvet', color: '#0B0C10', pattern: 'gold_dust', dark: 'dark' },
                    { id: 'street_concrete', name: 'Raw Concrete', color: '#121316', pattern: 'concrete_grain', dark: 'dark' },
                    { id: 'craft_paper', name: 'Craft Paper', color: '#F6F2EB', pattern: 'craft_fibers', dark: 'light' },
                    { id: 'clean_studio', name: 'Studio White', color: '#FAFAFA', pattern: 'subtle_grid', dark: 'light' },
                  ].map((bg) => {
                    const active = backgroundType === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => {
                          setBackgroundType(bg.id);
                          setBackgroundColor(bg.color);
                          setBackgroundPattern(bg.pattern);
                          setPageDarkness(bg.dark as any);
                        }}
                        className={`rounded-xl border p-2.5 text-left transition ${
                          active
                            ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                        }`}
                      >
                        <div className="h-7 w-full rounded-lg border border-slate-200/50 shadow-inner flex items-center justify-center" style={{ backgroundColor: bg.color }}>
                          {bg.dark === 'dark' ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white truncate">{bg.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{bg.color}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Hex Color & Background Tone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Store Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value);
                          setBackgroundType('custom_color');
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer shadow-sm"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value);
                          setBackgroundType('custom_color');
                        }}
                        className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Background Subtle Texture
                    </label>
                    <select
                      value={backgroundPattern}
                      onChange={(e) => setBackgroundPattern(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="none">Flat Solid (No Pattern)</option>
                      <option value="islamic_geometry">Islamic Star Geometry (Heritage)</option>
                      <option value="gold_dust">Gold Stardust (Jewelry & Chains)</option>
                      <option value="concrete_grain">Concrete Grain (Streetwear)</option>
                      <option value="craft_fibers">Craft Fibers (Food & Roastery)</option>
                      <option value="subtle_grid">Subtle Blueprint Grid (Minimal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Store Dark / Light Tone
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPageDarkness('light')}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 ${
                          pageDarkness === 'light'
                            ? 'btn-3d-white'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Tone
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageDarkness('dark')}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 ${
                          pageDarkness === 'dark'
                            ? 'btn-3d-dark'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark Tone
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary & Interactive Accent Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Header / Primary Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer shadow-sm"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Buttons & Interactive Gold / Highlight Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer shadow-sm"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Wizard Step 2 Navigation Footer */}
              <div className="card-3d p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep('taste')}
                  className="btn-3d-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Taste & Styles</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep('typography')}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <span>Next: Typography & Headings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TYPOGRAPHY & HEADING TRANSFORM */}
          {wizardStep === 'typography' && (
            <div className="space-y-5">
              {/* 3. TYPOGRAPHY & FONT CUSTOMIZER (Fully Editable) */}
              <div className="card-3d p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                      Storefront Typography
                    </div>
                    <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                      Curated Font Families & Heading Transform
                    </h3>
                    <p className="text-xs text-slate-500">
                      Every font brings a distinct taste: Cinzel for Royal Jewelry, Space Grotesk for Baggy Fashion, Playfair for Traditional Wear, and Fraunces for Gourmet Coffee.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200" style={{ fontFamily }}>
                    Active: {fontFamily}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {FONT_OPTIONS.map((f) => {
                    const selected = fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontFamily(f.id)}
                        className={`rounded-xl border p-3 text-left transition ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 dark:bg-indigo-950/50'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{f.label}</div>
                        <div className="mt-0.5 text-[10px] text-slate-500 truncate">{f.style}</div>
                        <div className="mt-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate" style={{ fontFamily: f.id }}>
                          {f.sample}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Heading Transform Options */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Heading Lettering:</span>
                  {[
                    { id: 'capitalize', label: 'Title Case (Elegance)' },
                    { id: 'uppercase', label: 'UPPERCASE (Streetwear / Jewelry)' },
                    { id: 'none', label: 'Natural Lowercase' },
                  ].map((ht) => (
                    <button
                      key={ht.id}
                      type="button"
                      onClick={() => setHeadingTransform(ht.id as any)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                        headingTransform === ht.id
                          ? 'btn-3d-dark'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ht.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wizard Step 3 Navigation Footer */}
              <div className="card-3d p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep('background')}
                  className="btn-3d-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Atmosphere</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep('seating')}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <span>Next: Product Seating & Cards</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PRODUCT SEATING & CARD STYLER */}
          {wizardStep === 'seating' && (
            <div className="space-y-5">
              {/* 4. PRODUCT SEATING & CARD STYLER ("How products are seated") */}
              <div className="card-3d p-5 sm:p-6 space-y-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                    Product Presentation
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    How Products Are Seated & Displayed
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customize the card frame, aspect ratio, corner curve, hallmark badges, and button styling so products fit their category perfectly.
                  </p>
                </div>

                {/* Product Card Style Presets */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Card Presentation Style
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'arabian_heritage',
                        title: 'Arabian Heritage Frame',
                        desc: 'Framed ivory cards with deep green & gold badges',
                      },
                      {
                        id: 'jewelry_pedestal',
                        title: 'Jewelry Gold Pedestal',
                        desc: 'Dark obsidian card with 18K gold hallmark tags',
                      },
                      {
                        id: 'streetwear_lookbook',
                        title: 'Streetwear Tall Lookbook',
                        desc: 'Tall 3:4.2 proportion, sharp 0px corners & drop stencils',
                      },
                      {
                        id: 'artisan_craft',
                        title: 'Artisan Food & Storage Craft',
                        desc: 'Warm craft paper card with airtight & freshness pills',
                      },
                      {
                        id: 'minimal_editorial',
                        title: 'Clean Minimalist Grid',
                        desc: 'Airy borders, crisp geometry & spacious margins',
                      },
                    ].map((style) => {
                      const active = productCardStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setProductCardStyle(style.id)}
                          className={`rounded-xl border p-3 text-left transition ${
                            active
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 dark:bg-indigo-950/40'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{style.title}</div>
                          <div className="mt-1 text-[11px] text-slate-500 leading-snug">{style.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio & Corner Softness */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Product Photo Aspect Ratio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'aspect-[1/1.08]', label: '1:1.08 Classic Boutique' },
                        { id: 'aspect-[3/4.2]', label: '3:4.2 Tall Lookbook (Baggy)' },
                        { id: 'aspect-[1/1]', label: '1:1 Square Balanced' },
                        { id: 'aspect-[1/1.15]', label: '1:1.15 Jewelry Pedestal' },
                      ].map((ar) => (
                        <button
                          key={ar.id}
                          type="button"
                          onClick={() => setProductAspectRatio(ar.id)}
                          className={`p-2 rounded-xl border text-left text-xs font-semibold ${
                            productAspectRatio === ar.id
                              ? 'btn-3d-dark'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Card Corner Softness
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: '0px', label: '0px Sharp Stencil' },
                        { id: '8px', label: '8px Crisp' },
                        { id: '16px', label: '16px Modern' },
                        { id: '22px', label: '22px Sculpted' },
                        { id: '32px', label: '32px Organic Pill' },
                      ].map((cr) => (
                        <button
                          key={cr.id}
                          type="button"
                          onClick={() => setCardRadius(cr.id)}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center ${
                            cardRadius === cr.id
                              ? 'btn-3d-primary'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {cr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Background Surface & Button Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Card Surface Style
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'white', label: 'White Surface' },
                        { id: 'dark_surface', label: 'Obsidian Velvet' },
                        { id: 'craft_beige', label: 'Craft Beige' },
                        { id: 'glass', label: 'Frosted Glass' },
                        { id: 'bordered_clear', label: 'Raw Clear' },
                      ].map((cs) => (
                        <button
                          key={cs.id}
                          type="button"
                          onClick={() => setCardBackgroundStyle(cs.id)}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center ${
                            cardBackgroundStyle === cs.id
                              ? 'btn-3d-dark'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {cs.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Interactive Button Feel
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: '3d', label: '3D Tactile' },
                        { id: 'pill', label: 'Rounded Pill' },
                        { id: 'sharp', label: 'Sharp Crisp' },
                      ].map((bs) => (
                        <button
                          key={bs.id}
                          type="button"
                          onClick={() => setButtonStyle(bs.id as any)}
                          className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center ${
                            buttonStyle === bs.id
                              ? 'btn-3d-primary'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {bs.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Badges & Indicators Toggles */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={showStockBadges}
                      onChange={(e) => setShowStockBadges(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Show Stock & Bestseller Badges</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={showStarRatings}
                      onChange={(e) => setShowStarRatings(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Show Customer Star Ratings (4.8 ★)</span>
                  </label>
                </div>
              </div>

              {/* Wizard Step 4 Navigation Footer */}
              <div className="card-3d p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep('typography')}
                  className="btn-3d-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Typography</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep('sections')}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <span>Next: Page Sections & Mockup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PAGE SECTIONS & LAYOUT ORDER + WIREFRAME MOCKUP */}
          {wizardStep === 'sections' && (
            <div className="space-y-5">
              {/* Ready-Made 9 Category Templates */}
              <div className="card-3d p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white">
                    Ready-Made Industry Templates (9 Categories)
                  </h3>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Active: {business.category}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => applyTemplateCategory(cat.id)}
                      className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors space-y-1"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{cat.label}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{cat.sampleModules.join(' · ')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Section & Page Manager */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    Page Sections & Layout Order ({sections.length})
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => addSection('promo_banner')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium hover:bg-slate-200 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Promo Banner
                    </button>
                    <button
                      type="button"
                      onClick={() => addSection('booking_widget')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium hover:bg-slate-200 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Booking Section
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {sections.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                      <Layers className="mx-auto h-5 w-5 text-slate-400" />
                      <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">Your page is ready to design</p>
                      <p className="mt-1 text-[11px] text-slate-500">Choose an industry template or add a section to get started.</p>
                    </div>
                  )}
                  {sections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                          0{idx + 1}. {sec.type.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(idx, 1)}
                            disabled={idx === sections.length - 1}
                            className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(idx)}
                            className="p-1 rounded border border-slate-200 dark:border-slate-700"
                            title="Toggle Visibility"
                          >
                            {sec.visible === false ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-sky-600" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSection(idx)}
                            className="p-1 rounded border border-slate-200 dark:border-slate-700 text-rose-600"
                            title="Remove Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={sec.title || ''}
                          onChange={(e) => updateSectionField(idx, 'title', e.target.value)}
                          placeholder="Section Headline"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={sec.subtitle || ''}
                          onChange={(e) => updateSectionField(idx, 'subtitle', e.target.value)}
                          placeholder="Section Subtitle"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Draft / Publish Controls */}
              </div>

              {/* Live Mini Wireframe Layout Mockup */}
              <div className="card-3d p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      Live Storefront Wireframe Mockup
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Visual Section Stacking ({sections.filter((s) => s.visible !== false).length} visible blocks)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Auto-Synchronized
                  </span>
                </div>

                <div
                  className="mx-auto max-w-[320px] rounded-[28px] p-4 shadow-lg border-4 border-slate-800 space-y-2 transition-all"
                  style={{ backgroundColor }}
                >
                  <div className="h-3 w-20 bg-slate-800 rounded-full mx-auto mb-2" />
                  <div className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 shadow-xs flex items-center justify-between">
                    <span className="text-xs font-extrabold truncate" style={{ fontFamily }}>
                      {business.name}
                    </span>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {sections
                      .filter((s) => s.visible !== false)
                      .map((s, idx) => (
                        <div
                          key={s.id || idx}
                          className="p-2.5 rounded-xl border text-left shadow-xs transition-all"
                          style={{
                            borderColor: `${accentColor}30`,
                            backgroundColor: cardBackgroundStyle === 'dark_surface' ? '#18181b' : '#ffffff',
                            borderRadius: cardRadius === '0px' ? '0px' : '10px',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: primaryColor }}>
                              {s.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">#{idx + 1}</span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5" style={{ fontFamily, textTransform: headingTransform }}>
                            {s.title || 'Section Headline'}
                          </div>
                          <div className="h-1 w-10 rounded-full mt-1.5" style={{ backgroundColor: primaryColor }} />
                        </div>
                      ))}
                  </div>
                  <div className="h-1 w-16 bg-slate-400 rounded-full mx-auto mt-2" />
                </div>
              </div>

              {/* Wizard Step 5 Navigation Footer */}
              <div className="card-3d p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep('seating')}
                  className="btn-3d-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Product Seating</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep('review')}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <span>Next: Review & Publish Live</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW SUMMARY, SAVE DRAFT & PUBLISH LIVE */}
          {wizardStep === 'review' && (
            <div className="space-y-5">
              <div className="card-3d p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                    Step 6 · Review & Final Verification
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    Review Your Store Aesthetics & Launch Live
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confirm your customized taste preset, typography, colors, and section order before publishing live to Telegram Mini App & Web.
                  </p>
                </div>

                {/* Summary Matrix Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Industry Taste</div>
                    <div className="mt-1 font-extrabold text-slate-900 dark:text-white truncate">
                      {TASTE_PRESETS.find((t) => t.id === tastePreset)?.name.split('&')[0] || 'Custom'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Typography</div>
                    <div className="mt-1 font-extrabold text-slate-900 dark:text-white truncate" style={{ fontFamily }}>
                      {fontFamily}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Atmosphere</div>
                    <div className="mt-1 font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full border" style={{ backgroundColor }} />
                      <span className="capitalize">{backgroundType.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Active Sections</div>
                    <div className="mt-1 font-extrabold text-indigo-600 dark:text-indigo-400">
                      {sections.filter((s) => s.visible !== false).length} of {sections.length} blocks
                    </div>
                  </div>
                </div>

                {/* Version Release Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Release Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="e.g. Published updated autumn catalog & bespoke jewelry pedestal layout"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                {/* Two Clear Primary Action Buttons: Save Draft vs Publish Live */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={saving || restoringVersionId !== ''}
                    onClick={() => handleSaveVersion('draft')}
                    className="btn-3d-white py-3.5 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{saving ? 'Saving Draft...' : 'Save as Draft Version'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving || restoringVersionId !== ''}
                    onClick={() => handleSaveVersion('published')}
                    className="btn-3d-emerald py-3.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving
                        ? 'Publishing Live...'
                        : `Publish Live to Telegram & Web (v${(versions[0]?.version_number || 1) + 1})`}
                    </span>
                  </button>
                </div>

                {/* Dedicated Storefront Preview Shortcut */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Want to test customer purchasing with full cart & payment?
                  </span>
                  <button
                    type="button"
                    onClick={() => setBuilderWorkspaceTab('preview')}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    Open Full Dedicated Preview →
                  </button>
                </div>
              </div>

              {/* Version History & One-Click Rollback */}
              <div className="card-3d p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                  Version History & Rollback ({versions.length} Revisions)
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {versions.length === 0 && (
                    <p className="py-4 text-center text-xs text-slate-500">No previous versions recorded yet.</p>
                  )}
                  {versions.map((v) => (
                    <div key={v.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          v{v.version_number}
                        </span>
                        <span className="mx-2 text-slate-400">·</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{v.note}</span>
                        <span className="mx-2 text-slate-400">·</span>
                        <span className="text-slate-500 capitalize">
                          {v.status} by {v.created_by}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(v.id)}
                        className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" /> {restoringVersionId === v.id ? 'Restoring...' : 'Restore'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wizard Step 6 Navigation Footer */}
              <div className="card-3d p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep('sections')}
                  className="btn-3d-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Page Sections</span>
                </button>
                <span className="text-xs text-emerald-600 font-bold">
                  Ready to Publish Live
                </span>
              </div>
            </div>
          )}
        </div>
      )}

          {/* METHOD C: AI-POWERED MINI APP BUILDER */}
          {mode === 'ai' && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    AI-Powered Mini App Architect
                  </h3>
                  <p className="text-xs text-slate-500">
                    Describe your business goals or desired changes. Strictly grounded in your real catalog—never fabricates prices or fake metrics.
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                  Quota: {aiGenerationsUsed} / {business.ai_generations_limit ?? 0} runs
                </div>
              </div>

              {aiError && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                  {aiError}
                </div>
              )}

              {aiNotice && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <span className="font-semibold">Provider notice:</span> {aiNotice}
                </div>
              )}

              {aiSummary && (
                <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2 text-xs">
                  <div className="font-semibold text-sky-950 dark:text-sky-200">Your AI layout is ready to review</div>
                  <p className="text-sky-800 dark:text-sky-300">{aiSummary}</p>
                  <p className="text-sky-700/80 dark:text-sky-300/80">The generated sections and theme are loaded into the editor. Review them before saving a draft or publishing.</p>
                  <button
                    type="button"
                    onClick={() => handleSaveVersion('published')}
                    disabled={saving || restoringVersionId !== ''}
                    className="px-3.5 py-2 rounded-lg bg-slate-950 text-white font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                  >
                    {saving ? 'Publishing...' : 'Publish this layout'}
                  </button>
                </div>
              )}

              <form onSubmit={handleRunAiBuilder} className="space-y-3">
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Highlight our fresh Tuesday coffee roast at the top, add a private tasting booking section, and include a promotional banner for first-time Telegram Mini App buyers."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setAiPrompt(
                          'Create a high-conversion layout featuring our top micro-lot products, an express Telegram checkout banner, and a tasting reservation widget.'
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      + High-Conversion Retail Layout
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAiPrompt(
                          'Prioritize appointment scheduling and VIP concierge support for mobile Telegram users.'
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      + Booking-First Layout
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiLoading ? 'Generating Layout...' : 'Generate & Preview Layout'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* METHOD A: DONE-FOR-YOU CREATION SERVICE */}
          {mode === 'dfy' && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                  Done-For-You (DFY) Concierge Creation & Maintenance Service
                </h3>
                <p className="text-xs text-slate-500">
                  Our platform engineering team builds your custom Telegram Mini App, uploads your product/booking catalog, connects @BotFather webhooks, and publishes it for you.
                </p>
              </div>

              {/* 5-Stage DFY Pipeline Progress */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'requested', label: '1. Requested' },
                  { id: 'in_review', label: '2. In Review' },
                  { id: 'configuring', label: '3. Configuring' },
                  { id: 'ready_for_preview', label: '4. Ready to Preview' },
                  { id: 'published', label: '5. Live & Published' },
                ].map((st) => {
                  const isCurrent = dfyStatus === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setDfyStatus(st.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        isCurrent
                          ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleUpdateDfyRequest} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Done-For-You Specification, Branding & Custom Integration Notes
                  </label>
                  <textarea
                    rows={4}
                    value={dfyNotes}
                    onChange={(e) => setDfyNotes(e.target.value)}
                    placeholder="Specify your menu/product list, preferred brand colors, Telegram bot username, and custom workflow requests for our platform specialists..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={dfySaving}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" />
                  {dfySaving ? 'Saving brief...' : 'Save project brief'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column in Editor Mode: Clean Theme & Structure Summary Card (No cramped inline storefront) */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-5">
          <div className="card-3d p-5 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  Active Store Blueprint
                </div>
                <h3 className="mt-0.5 text-base font-display font-extrabold text-slate-950 dark:text-white">
                  {business.name}
                </h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${business.mini_app_published ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                {business.mini_app_published ? `Live v${business.mini_app_version}` : 'Draft'}
              </span>
            </div>

            {/* Live Swatch & Typography Card */}
            <div
              className="rounded-2xl p-4 text-white shadow-md space-y-2 transition-all"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                fontFamily,
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                Theme & Typography Swatch
              </div>
              <div className="text-lg font-extrabold leading-tight">
                {business.name}
              </div>
              <div className="text-xs opacity-90">
                Font: {fontFamily} · Style: {buttonStyle.toUpperCase()} · Radius: {cardRadius}
              </div>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white text-slate-900 text-[11px] font-extrabold shadow-xs">
                  Shop Now →
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/25 text-white text-[10px] font-mono">
                  {primaryColor} / {accentColor}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Layout Sections</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {sections.filter((s) => s.visible !== false).length} visible / {sections.length} total
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Storefront Slug</span>
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  /{business.slug}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Owner Unique ID</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {business.owner_uid || 'OWN-ASSIGNED'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setBuilderWorkspaceTab('preview')}
                className="btn-3d-emerald w-full py-3 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Switch to Dedicated Store Preview
              </button>
              {onOpenFullPreview && (
                <button
                  type="button"
                  onClick={onOpenFullPreview}
                  className="btn-3d-white w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  Open Full-Screen Customer View ↗
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
};
