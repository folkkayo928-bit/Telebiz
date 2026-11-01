import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Wrench,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../i18n/translations';
import { MiniAppStorefront } from './MiniAppStorefront';

interface BuilderStudioProps {
  business: any;
  versions: any[];
  authToken: string;
  onRefresh: () => void;
}

export const BuilderStudio: React.FC<BuilderStudioProps> = ({
  business,
  versions,
  authToken,
  onRefresh,
}) => {
  const [mode, setMode] = useState<'visual' | 'ai' | 'dfy'>(
    business.creation_method === 'done_for_you'
      ? 'dfy'
      : business.creation_method === 'ai_builder'
      ? 'ai'
      : 'visual'
  );

  const latestVer = versions[0];
  const [sections, setSections] = useState<any[]>(() => {
    try {
      return latestVer ? JSON.parse(latestVer.layout_json) : [];
    } catch {
      return [];
    }
  });
  const [primaryColor, setPrimaryColor] = useState(business.primary_color || '#0F172A');
  const [accentColor, setAccentColor] = useState(business.accent_color || '#0284C7');
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
    if (v) {
      try {
        setSections(JSON.parse(v.layout_json));
      } catch {
        // ignore
      }
    }
    setPrimaryColor(business.primary_color || '#0F172A');
    setAccentColor(business.accent_color || '#0284C7');
    setDfyNotes(business.dfy_notes || '');
    setDfyStatus(business.dfy_status || 'requested');
    setAiGenerationsUsed(Number(business.ai_generations_used || 0));
  }, [business.id, versions]);

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
          theme: { primaryColor, accentColor, cardRadius: '12px' },
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
              Build your storefront
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Shape your customer experience, then save a draft or publish when it is ready.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {business.name}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button type="button" onClick={() => setMode('visual')} aria-pressed={mode === 'visual'}
            className={`group rounded-2xl border p-4 text-left transition-all ${mode === 'visual' ? 'border-slate-950 bg-white shadow-md ring-1 ring-slate-950/5 dark:border-white dark:bg-slate-900 dark:ring-white/10' : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${mode === 'visual' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Layers className="h-4 w-4" /></span>
              {mode === 'visual' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">Visual builder</div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Arrange sections, choose a template, and refine your brand.</p>
          </button>
          <button type="button" onClick={() => setMode('ai')} aria-pressed={mode === 'ai'}
            className={`group rounded-2xl border p-4 text-left transition-all ${mode === 'ai' ? 'border-slate-950 bg-white shadow-md ring-1 ring-slate-950/5 dark:border-white dark:bg-slate-900 dark:ring-white/10' : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${mode === 'ai' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Sparkles className="h-4 w-4" /></span>
              <span className="text-[10px] font-medium tabular-nums text-slate-400">{aiGenerationsUsed}/{business.ai_generations_limit ?? 0} uses</span>
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">AI builder</div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Describe what you need and get a tailored layout to review.</p>
          </button>
          <button type="button" onClick={() => setMode('dfy')} aria-pressed={mode === 'dfy'}
            className={`group rounded-2xl border p-4 text-left transition-all ${mode === 'dfy' ? 'border-slate-950 bg-white shadow-md ring-1 ring-slate-950/5 dark:border-white dark:bg-slate-900 dark:ring-white/10' : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${mode === 'dfy' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Wrench className="h-4 w-4" /></span>
              {business.dfy_status && business.dfy_status !== 'not_applicable' && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{String(business.dfy_status).replace(/_/g, ' ')}</span>}
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">Done for you</div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Send your brief to the TeleBiz team for assisted setup.</p>
          </button>
        </div>
      </section>

      {saveMessage || actionError ? (
        <div role="status" className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-medium ${actionError ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200' : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>
          <span>{actionError || saveMessage}</span>
          <button type="button" onClick={() => { setSaveMessage(''); setActionError(''); }} className="shrink-0 text-current underline-offset-2 hover:underline">Dismiss</button>
        </div>
      ) : null}

      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <span>{saveMessage}</span>
          <button type="button" onClick={() => setSaveMessage('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Builder Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* METHOD B: SELF-SERVICE VISUAL BUILDER */}
          {mode === 'visual' && (
            <div className="space-y-6">
              {/* Ready-Made 9 Category Templates */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    Ready-Made Industry Templates (9 Categories)
                  </h3>
                  <span className="text-xs text-slate-500">Active category: {business.category}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => applyTemplateCategory(cat.id)}
                      className="p-2.5 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors space-y-1"
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{cat.label}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{cat.sampleModules.join(' · ')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Branding & Color Customization */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                  Branding & Color Palette
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Header / Primary Surface Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-9 h-9 rounded border border-slate-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Interactive CTA / Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-9 h-9 rounded border border-slate-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
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
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
                  <input
                    type="text"
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="Version release note (e.g., Added weekend promotion section)"
                    className="flex-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={saving || restoringVersionId !== ''}
                      onClick={() => handleSaveVersion('draft')}
                      className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 whitespace-nowrap"
                    >
                      {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                      type="button"
                      disabled={saving || restoringVersionId !== ''}
                      onClick={() => handleSaveVersion('published')}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Publishing...' : `Publish live (v${(versions[0]?.version_number || 1) + 1})`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Version History & One-Click Restore */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                  Version History & Rollback ({versions.length} Revisions)
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {versions.length === 0 && (
                    <p className="py-5 text-center text-xs text-slate-500">No saved versions yet. Save a draft to create your first revision.</p>
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
                        <span className="text-slate-500">
                          {v.status.toUpperCase()} by {v.created_by}
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

        {/* Customer-facing storefront: current published version */}
        <aside className="space-y-3 lg:sticky lg:top-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Customer view</div>
                <h3 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">Published storefront</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${business.mini_app_published ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                {business.mini_app_published ? 'Live' : 'Not published'}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              This is the latest published customer experience. Your edits stay private until you publish them.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <MiniAppStorefront slug={business.slug} mode="embedded_preview" onOrderCreated={onRefresh} />
          </div>
        </aside>
      </div>
    </div>
  );
};
