import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { 
  Globe, 
  Palette, 
  Monitor, 
  Zap, 
  Sparkles, 
  Smartphone, 
  Bot, 
  BarChart3, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ShieldCheck, 
  Code2, 
  Cpu, 
  Layers, 
  Eye, 
  TrendingUp, 
  Rocket, 
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  Laptop,
  Edit3,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Pencil,
  CheckCheck,
  Flame,
  Shield,
  Briefcase,
  Database,
  Server
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import ClientsSliderSection from './ClientsSliderSection';
import PackagesSection from './PackagesSection';
import { useAdminAuth } from '../lib/adminAuth';
import { cn } from '../lib/utils';
import { 
  HomePageContent, 
  DEFAULT_HOME_PAGE_CONTENT, 
  getCachedHomePageContent, 
  initHomePageListener, 
  saveHomePageContentToFirestore,
  HomeServiceItem,
  HomePlanItem,
  HomeFaqItem,
  HomePillarItem
} from '../lib/homeContent';
import { toast } from './Toast';
import heroBgImage from '../assets/images/techify_logo_original_1786362412096.jpg';

// Helper to parse price strings into currency symbol, number amount and suffix for NumberFlow
function parsePriceData(val: string | number | undefined) {
  if (val === undefined || val === null) {
    return { symbol: 'R$ ', amount: 0, suffix: '', hasNumber: false, raw: '' };
  }
  if (typeof val === 'number') {
    return { symbol: '$ ', amount: val, suffix: '', hasNumber: true, raw: String(val) };
  }
  const str = String(val).trim();
  const match = str.match(/^([^\d]*?)\s*([\d]+(?:[.,]\d+)?)\s*(.*)$/);
  if (match) {
    const symbol = match[1] || '';
    const numClean = match[2].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(numClean);
    if (!isNaN(num)) {
      return {
        symbol: symbol ? (symbol.endsWith(' ') ? symbol : `${symbol} `) : '',
        amount: num,
        suffix: match[3] || '',
        hasNumber: true,
        raw: str
      };
    }
  }
  return { symbol: '', amount: 0, suffix: '', hasNumber: false, raw: str };
}

// Interactive Pricing Toggle Switch with layoutId animation
const PricingSwitch = ({
  isYearly,
  onToggle,
  className,
}: {
  isYearly: boolean;
  onToggle: (yearly: boolean) => void;
  className?: string;
}) => {
  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-neutral-800 p-1">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={cn(
            "relative z-10 w-fit sm:h-12 cursor-pointer h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 text-xs sm:text-sm font-semibold transition-colors",
            !isYearly ? "text-white" : "text-neutral-400 hover:text-white"
          )}
        >
          {!isYearly && (
            <motion.span
              layoutId="pricing-switch-bubble"
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-2 border-neutral-700 bg-gradient-to-t from-neutral-800 via-neutral-750 to-neutral-700 shadow-md"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Mensal</span>
        </button>

        <button
          type="button"
          onClick={() => onToggle(true)}
          className={cn(
            "relative z-10 w-fit cursor-pointer sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 text-xs sm:text-sm font-semibold transition-colors",
            isYearly ? "text-white" : "text-neutral-400 hover:text-white"
          )}
        >
          {isYearly && (
            <motion.span
              layoutId="pricing-switch-bubble"
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-2 border-neutral-700 bg-gradient-to-t from-neutral-800 via-neutral-750 to-neutral-700 shadow-md"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Anual
            <span className="rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-[#4ade80]">
              Economize 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

// Mapping for dynamic icons
const ICON_LOOKUP: Record<string, React.ElementType> = {
  Globe,
  Palette,
  Monitor,
  Zap,
  Sparkles,
  Smartphone,
  Bot,
  BarChart3,
  Code2,
  Cpu,
  Layers,
  Eye,
  TrendingUp,
  Rocket,
  Shield,
  Flame
};

interface HomeSectionProps {
  onNavigate?: (tab: string) => void;
  onOpenConsultation?: (serviceName?: string) => void;
}

export default function HomeSection({ onNavigate, onOpenConsultation }: HomeSectionProps) {
  const { isAdmin } = useAdminAuth();
  const [content, setContent] = useState<HomePageContent>(getCachedHomePageContent);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Billing Cycle for Plans (Monthly vs Annual with discount)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // State for active capability pillar tab
  const [activePillarId, setActivePillarId] = useState<string>('engenharia');
  
  // State for selected service filter hover
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // State for FAQ accordions
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // ==========================================
  // MODAL STATES FOR EDITING CMS ITEMS
  // ==========================================
  // 1. Text/Field Generic Editor
  const [textModal, setTextModal] = useState<{
    isOpen: boolean;
    title: string;
    fieldKey: string;
    subKey?: string;
    value: string;
    isMultiline?: boolean;
  }>({
    isOpen: false,
    title: '',
    fieldKey: '',
    value: '',
    isMultiline: false
  });

  // 2. Service Modal Editor
  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    service: HomeServiceItem;
  }>({
    isOpen: false,
    isNew: false,
    service: {
      id: '',
      name: '',
      subtitle: '',
      description: '',
      iconName: 'Globe',
      tag: 'Tech',
      highlight: false,
      deliverables: []
    }
  });

  // 3. Plan Modal Editor
  const [planModal, setPlanModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    plan: HomePlanItem;
  }>({
    isOpen: false,
    isNew: false,
    plan: {
      id: '',
      name: '',
      badge: '',
      popular: false,
      monthlyPrice: '',
      annualPrice: '',
      periodText: '',
      description: '',
      features: [],
      ctaText: '',
      whatsappMessage: ''
    }
  });

  // 4. FAQ Modal Editor
  const [faqModal, setFaqModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    faq: HomeFaqItem;
  }>({
    isOpen: false,
    isNew: false,
    faq: {
      id: '',
      question: '',
      answer: ''
    }
  });

  // Sync with Firestore real-time
  useEffect(() => {
    const unsub = initHomePageListener((newContent) => {
      setContent(newContent);
    });
    return () => unsub();
  }, []);

  const handleStartConsultation = (serviceName: string = 'Consultoria Techify') => {
    if (onOpenConsultation) {
      onOpenConsultation(serviceName);
    } else if (onNavigate) {
      onNavigate('apps');
    }
  };

  // ==========================================
  // SAVE / SYNC ACTIONS
  // ==========================================
  const handleSaveAllToDatabase = async () => {
    setIsSaving(true);
    try {
      await saveHomePageContentToFirestore(content);
      setHasUnsavedChanges(false);
      toast.success('Página Salva no Banco de Dados', 'Todas as alterações foram publicadas e sincronizadas com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao Salvar', 'Não foi possível gravar as alterações no Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    setContent(DEFAULT_HOME_PAGE_CONTENT);
    setHasUnsavedChanges(true);
    await saveHomePageContentToFirestore(DEFAULT_HOME_PAGE_CONTENT);
    toast.info('Conteúdo Restaurado', 'A página inicial voltou para a configuração padrão.');
  };

  // ==========================================
  // GENERIC TEXT MODAL SUBMIT
  // ==========================================
  const handleSaveTextModal = (e: React.FormEvent) => {
    e.preventDefault();
    const { fieldKey, subKey, value } = textModal;
    
    setContent(prev => {
      const updated = { ...prev };
      if (subKey) {
        (updated as any)[fieldKey] = {
          ...(updated as any)[fieldKey],
          [subKey]: value
        };
      } else {
        (updated as any)[fieldKey] = value;
      }
      return updated;
    });

    setHasUnsavedChanges(true);
    setTextModal(prev => ({ ...prev, isOpen: false }));
    toast.success('Texto Atualizado', 'Alteração salva localmente. Clique em "Salvar Página" para persistir no banco.');
  };

  // ==========================================
  // SERVICES ACTIONS (ADD, EDIT, DELETE)
  // ==========================================
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const current = serviceModal.service;
    if (!current.name.trim()) {
      toast.error('Campo Obrigatório', 'Informe o nome do serviço.');
      return;
    }

    setContent(prev => {
      const existing = [...prev.services];
      if (serviceModal.isNew) {
        const newService: HomeServiceItem = {
          ...current,
          id: current.id || `service_${Date.now()}`
        };
        return { ...prev, services: [...existing, newService] };
      } else {
        const index = existing.findIndex(s => s.id === current.id);
        if (index !== -1) {
          existing[index] = current;
        }
        return { ...prev, services: existing };
      }
    });

    setHasUnsavedChanges(true);
    setServiceModal(prev => ({ ...prev, isOpen: false }));
    toast.success(serviceModal.isNew ? 'Serviço Criado' : 'Serviço Atualizado', 'Clique em "Salvar Página" no topo para gravar no banco.');
  };

  const handleDeleteService = (serviceId: string, name: string) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
    setHasUnsavedChanges(true);
    toast.info('Serviço Removido', `O serviço "${name}" foi excluído da lista.`);
  };

  // ==========================================
  // PLANS ACTIONS (ADD, EDIT, DELETE)
  // ==========================================
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = planModal.plan;
    if (!current.name.trim()) {
      toast.error('Campo Obrigatório', 'Informe o nome do plano.');
      return;
    }

    let updatedPlans: HomePlanItem[] = [];
    setContent(prev => {
      const existing = [...prev.plans];
      if (planModal.isNew) {
        const newPlan: HomePlanItem = {
          ...current,
          id: current.id || `plan_${Date.now()}`
        };
        updatedPlans = [...existing, newPlan];
      } else {
        const index = existing.findIndex(p => p.id === current.id);
        if (index !== -1) {
          existing[index] = current;
        } else {
          existing.push(current);
        }
        updatedPlans = existing;
      }
      return { ...prev, plans: updatedPlans };
    });

    setHasUnsavedChanges(true);
    setPlanModal(prev => ({ ...prev, isOpen: false }));
    toast.success(planModal.isNew ? 'Plano Criado' : 'Plano Atualizado', 'Alterações salvas com sucesso!');

    // Auto-save to Firestore
    try {
      await saveHomePageContentToFirestore({
        ...content,
        plans: updatedPlans
      });
    } catch (err) {
      console.warn('Auto-save plan error:', err);
    }
  };

  const handleDeletePlan = async (planId: string, name: string) => {
    const newPlans = content.plans.filter(p => p.id !== planId);
    setContent(prev => ({
      ...prev,
      plans: newPlans
    }));
    setHasUnsavedChanges(true);
    toast.info('Plano Removido', `O plano "${name}" foi excluído.`);

    try {
      await saveHomePageContentToFirestore({
        ...content,
        plans: newPlans
      });
    } catch (err) {
      console.warn(err);
    }
  };

  // ==========================================
  // FAQ ACTIONS (ADD, EDIT, DELETE)
  // ==========================================
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    const current = faqModal.faq;
    if (!current.question.trim() || !current.answer.trim()) {
      toast.error('Campos Obrigatórios', 'Preencha a pergunta e a resposta.');
      return;
    }

    setContent(prev => {
      const existing = [...prev.faqs];
      if (faqModal.isNew) {
        const newFaq: HomeFaqItem = {
          ...current,
          id: current.id || `faq_${Date.now()}`
        };
        return { ...prev, faqs: [...existing, newFaq] };
      } else {
        const index = existing.findIndex(f => f.id === current.id);
        if (index !== -1) {
          existing[index] = current;
        }
        return { ...prev, faqs: existing };
      }
    });

    setHasUnsavedChanges(true);
    setFaqModal(prev => ({ ...prev, isOpen: false }));
    toast.success(faqModal.isNew ? 'Dúvida Criada' : 'Dúvida Atualizada', 'Lembre-se de salvar para sincronizar com o banco.');
  };

  const handleDeleteFaq = (faqId: string) => {
    setContent(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== faqId)
    }));
    setHasUnsavedChanges(true);
    toast.info('FAQ Removido', 'A pergunta foi removida da lista.');
  };

  return (
    <div className="relative w-full overflow-hidden bg-black text-white selection:bg-[#22c55e]/30 selection:text-white">
      
      {/* Background Subtle Gradient Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#22c55e]/12 via-[#22c55e]/4 to-transparent blur-[130px] -z-10" />

      {/* ========================================================================= */}
      {/* FLOATING ADMIN LIVE-EDIT TOOLBAR */}
      {/* ========================================================================= */}
      {isAdmin && (
        <div className="sticky top-20 z-50 mx-auto max-w-5xl px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#22c55e]/50 bg-black/95 px-4 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isEditMode ? 'bg-[#22c55e] animate-pulse' : 'bg-neutral-600'}`} />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Painel do Editor Techify
              </span>
              {hasUnsavedChanges && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/40">
                  Alterações Pendentes
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isEditMode 
                    ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditMode ? 'Modo Edição Ativo' : 'Ativar Edição Visual'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAllToDatabase}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] px-4 py-1.5 text-xs font-black text-black shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Página'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-[11px] font-bold text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
                title="Restaurar conteúdo original"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restaurar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Techify 3D Metallic Background)                          */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center items-center px-4 pt-20 pb-20 sm:pt-28 sm:pb-28 text-center bg-[#050905]">
        
        {/* Full-width Background Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <img
            src={heroBgImage}
            alt="Techify Background"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.75] contrast-[1.1]"
          />
          {/* Dark Radial & Gradient Overlays for perfect contrast and visual depth */}
          <div className="absolute inset-0 bg-radial from-black/20 via-black/50 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
        </div>

        {/* Bottom Blur Overlay for smooth transition */}
        <div 
          className="absolute inset-0 pointer-events-none z-[1] bottom-blur-mask backdrop-blur-sm"
          style={{
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 40%)',
            maskImage: 'linear-gradient(to top, black 0%, transparent 40%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          {/* Top Eyebrow Heading: "A Solução Definitiva" */}
          <div className="animate-blur-fade-up relative inline-block mb-3 sm:mb-4 group" style={{ animationDelay: '150ms' }}>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Bricolage_Grotesque','Plus_Jakarta_Sans',sans-serif]">
              {content.hero.eyebrow}
            </h2>
            {isEditMode && (
              <button
                onClick={() => setTextModal({
                  isOpen: true,
                  title: 'Editar Título Superior do Hero',
                  fieldKey: 'hero',
                  subKey: 'eyebrow',
                  value: content.hero.eyebrow,
                  isMultiline: false
                })}
                className="absolute -top-2 -right-8 p-1.5 rounded-lg bg-[#22c55e] text-black shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Editar Texto"
              >
                <Pencil className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Main Punch Headline */}
          <div className="animate-blur-fade-up relative inline-block max-w-5xl mx-auto group" style={{ animationDelay: '300ms' }}>
            <h1 className="font-['Bricolage_Grotesque','Syne',sans-serif] text-4xl sm:text-6xl lg:text-7xl xl:text-[80px] font-black uppercase tracking-tight text-[#4ade80] sm:leading-[1.08] drop-shadow-[0_0_35px_rgba(74,222,128,0.35)]">
              {content.hero.headline1} <br />
              {content.hero.headline2} <br />
              {content.hero.headline3}
            </h1>
            {isEditMode && (
              <button
                onClick={() => setTextModal({
                  isOpen: true,
                  title: 'Editar Frase Principal (Linha 1)',
                  fieldKey: 'hero',
                  subKey: 'headline1',
                  value: content.hero.headline1,
                  isMultiline: false
                })}
                className="absolute top-2 -right-8 p-1.5 rounded-lg bg-[#22c55e] text-black shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Editar Headline"
              >
                <Pencil className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Hero Subtitle */}
          <div className="animate-blur-fade-up relative inline-block max-w-3xl mx-auto group mt-7" style={{ animationDelay: '450ms' }}>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-300 leading-relaxed font-normal">
              {content.hero.description}
            </p>
            {isEditMode && (
              <button
                onClick={() => setTextModal({
                  isOpen: true,
                  title: 'Editar Descrição do Hero',
                  fieldKey: 'hero',
                  subKey: 'description',
                  value: content.hero.description,
                  isMultiline: true
                })}
                className="absolute -top-2 -right-8 p-1.5 rounded-lg bg-[#22c55e] text-black shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Editar Descrição"
              >
                <Pencil className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Hero Action Buttons */}
          <div className="animate-blur-fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 max-w-lg mx-auto w-full" style={{ animationDelay: '600ms' }}>
            {/* Secondary Action with Liquid Glass */}
            <button 
              id="hero-portfolio-btn"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('apps');
                } else {
                  const el = document.getElementById('servicos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full liquid-glass hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider px-8 py-4 transition-all cursor-pointer select-none active:scale-[0.98] shadow-lg"
            >
              <span>{content.hero.ctaSecondary}</span>
            </button>

            {/* Primary Action */}
            <button 
              id="hero-engineer-cta"
              onClick={() => handleStartConsultation('Falar com Engenheiro Techify')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#a3e635] hover:bg-[#84cc16] text-black font-black text-xs uppercase tracking-wider px-8 py-4 shadow-[0_0_30px_rgba(163,230,53,0.4)] hover:shadow-[0_0_40px_rgba(163,230,53,0.6)] transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              <span>{content.hero.ctaPrimary}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 font-bold">
                ↗
              </span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="animate-blur-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs sm:text-sm font-medium text-neutral-300" style={{ animationDelay: '750ms' }}>
            {content.hero.trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                <Check className="h-4 w-4 text-[#22c55e]" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. CLIENT TICKER MARQUEE SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full py-5 bg-[#050805] border-y border-neutral-900 overflow-hidden select-none">
        <div className="flex items-center">
          <div className="flex shrink-0 animate-marquee items-center gap-8 whitespace-nowrap">
            {content.clientTicker.concat(content.clientTicker).map((brand, i) => (
              <span key={i} className="flex items-center gap-6 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-neutral-400 hover:text-[#4ade80] transition-colors">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                <span>{brand}</span>
              </span>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. COMPETITOR / GOOGLE BANNER SECTION (Clean Typography Matching Screenshot 1) */}
      {/* ========================================================================= */}
      <ScrollReveal threshold={0.15} yOffset={24} duration={0.6} once={true}>
        <section className="relative mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
          
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_70%)] blur-[90px] -z-10" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* Headlines matching screenshot 1 */}
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Seu concorrente aparece no <br />
              <span className="text-white">Google.</span> <br />
              <span className="text-neutral-400">E o seu negócio?</span>
            </h2>

            {/* Description */}
            <p className="mt-6 text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl font-normal leading-relaxed">
              Se o cliente não encontra a sua empresa na internet, ele compra de quem ele encontra. A <strong className="text-white font-bold">Techify</strong> faz o site, o sistema de gestão e a estratégia que colocam o seu negócio na frente.
            </p>

            {/* CTA Button */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleStartConsultation('Aparecer Primeiro no Google')}
                className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] hover:bg-[#16a34a] px-8 py-3.5 text-xs sm:text-sm font-black text-black uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] cursor-pointer select-none active:scale-[0.98]"
              >
                <span>{content.competitor.ctaText || "QUERO APARECER PRIMEIRO"}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/15 font-bold">
                  ↗
                </span>
              </button>

              {isEditMode && (
                <button
                  onClick={() => setTextModal({
                    isOpen: true,
                    title: 'Editar Seção Concorrente no Google',
                    fieldKey: 'competitor',
                    subKey: 'description',
                    value: content.competitor.description,
                    isMultiline: true
                  })}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Editar Texto</span>
                </button>
              )}
            </div>

          </div>
        </section>
      </ScrollReveal>


      {/* ========================================================================= */}
      {/* 4. CLIENTS SLIDER SHOWCASE (Laptop mockups of delivered websites) */}
      {/* ========================================================================= */}
      <ClientsSliderSection 
        onOpenConsultation={() => handleStartConsultation('Quero um site no padrão')}
        onNavigatePortfolio={() => onNavigate && onNavigate('apps')}
      />


      {/* ========================================================================= */}
      {/* 5. SECTION: O QUE A TECHIFY FAZ (SERVIÇOS & ESPECIALIDADES) */}
      {/* ========================================================================= */}
      <section id="servicos" className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24 border-t border-neutral-900/80">
        
        <ScrollReveal threshold={0.2} yOffset={20} once={true}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between max-w-6xl mx-auto mb-12 sm:mb-16 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                O QUE FAZEMOS
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Engenharia e design para elevar o nível da sua empresa
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl">
                Soluções completas integradas sob um mesmo teto para construir, acelerar e proteger a presença digital do seu negócio.
              </p>
            </div>

            {isEditMode && (
              <button
                onClick={() => setServiceModal({
                  isOpen: true,
                  isNew: true,
                  service: {
                    id: `service_${Date.now()}`,
                    name: '',
                    subtitle: '',
                    description: '',
                    iconName: 'Globe',
                    tag: 'Novo',
                    highlight: false,
                    deliverables: ['Recurso 1', 'Recurso 2']
                  }
                })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#22c55e] px-4 py-2 text-xs font-bold text-black shadow-md cursor-pointer hover:bg-[#16a34a] shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Serviço</span>
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* Grid of Techify Services with CMS Edit Controls - Compact Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {content.services.map((service, index) => {
            const IconComponent = ICON_LOOKUP[service.iconName] || Globe;
            return (
              <ScrollReveal key={service.id} delay={index * 0.06} duration={0.4} once={true}>
                <div
                  onMouseEnter={() => setSelectedServiceId(service.id)}
                  onMouseLeave={() => setSelectedServiceId(null)}
                  className={`relative flex flex-col justify-between p-4.5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 h-full ${
                    service.highlight
                      ? 'bg-[#06170a]/95 border-[#22c55e]/50 shadow-[0_0_25px_rgba(34,197,94,0.12)]'
                      : 'bg-[#090a09] border-neutral-800/90 hover:border-neutral-700 hover:bg-[#0e100e]'
                  }`}
                >
                  {/* Admin Fast Edit Bar */}
                  {isEditMode && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setServiceModal({
                            isOpen: true,
                            isNew: false,
                            service: { ...service }
                          });
                        }}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-[#22c55e] text-white hover:text-black transition-colors"
                        title="Editar Serviço"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service.id, service.name);
                        }}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-600 text-white transition-colors"
                        title="Excluir Serviço"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Header with Icon and Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`p-2.5 rounded-xl border ${
                        service.highlight
                          ? 'bg-[#113819] border-[#22c55e]/40 text-[#4ade80]'
                          : 'bg-neutral-900 border-neutral-800 text-[#22c55e]'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                        {service.tag}
                      </span>
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#22c55e] uppercase tracking-wider block">
                      {service.subtitle}
                    </span>
                    
                    <h3 className="mt-1 text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
                      {service.name}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Bullet points of deliverables */}
                    <div className="mt-3.5 pt-3 border-t border-neutral-800/80 space-y-1.5">
                      {service.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                          <Check className="h-3.5 w-3.5 text-[#22c55e] shrink-0 stroke-[2.5]" />
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/60">
                    <button
                      onClick={() => handleStartConsultation(`Serviço: ${service.name}`)}
                      className="w-full flex items-center justify-between text-xs font-bold text-neutral-300 hover:text-[#4ade80] transition-colors group cursor-pointer"
                    >
                      <span>Quero esta solução</span>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-[#4ade80] group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Interactive Consultation Banner */}
        <ScrollReveal threshold={0.2} yOffset={20} once={true}>
          <div className="mt-10 rounded-3xl border border-[#22c55e]/40 bg-gradient-to-r from-[#061c0a]/90 via-[#0a2612]/90 to-[#061c0a]/90 p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_35px_rgba(34,197,94,0.15)]">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-extrabold text-[#4ade80] uppercase tracking-wider mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Precisa de um projeto sob medida?</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white">
                Agende um diagnóstico técnico gratuito com nossos engenheiros
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
                Analisamos a sua estrutura atual, desenhamos a arquitetura ideal e entregamos um plano claro de execução.
              </p>
            </div>

            <button
              onClick={() => handleStartConsultation('Diagnóstico Técnico Gratuito')}
              className="shrink-0 px-8 py-4 rounded-full bg-[#22c55e] hover:bg-[#1eb354] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              Solicitar Diagnóstico
            </button>
          </div>
        </ScrollReveal>
      </section>


      {/* ========================================================================= */}
      {/* 6. SECTION: COMPARAÇÃO (TRADICIONAL VS TECHIFY) */}
      {/* ========================================================================= */}
      <ScrollReveal threshold={0.2} yOffset={20} once={true}>
        <section className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24 border-t border-neutral-900/80">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
              COMPARAÇÃO DIRETA
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {content.comparison.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-400">
              {content.comparison.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card Left: Agências Tradicionais / Freelancers */}
            <div className="rounded-3xl border border-red-950/60 bg-[#0d0707] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-red-400 font-bold text-base mb-6">
                  <div className="h-7 w-7 rounded-full bg-red-950/80 border border-red-800/60 flex items-center justify-center">
                    <X className="h-4 w-4 text-red-400" />
                  </div>
                  <span>Agências Tradicionais &amp; Amadores</span>
                </div>

                <div className="space-y-4 text-sm text-neutral-400">
                  {content.comparison.badPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Right: Com a Techify */}
            <div className="rounded-3xl border border-[#22c55e]/50 bg-[#06170a] p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              <div>
                <div className="flex items-center gap-2.5 text-[#4ade80] font-bold text-base mb-6">
                  <div className="h-7 w-7 rounded-full bg-[#113819] border border-[#22c55e]/60 flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#22c55e] stroke-[3]" />
                  </div>
                  <span>Com a Techify</span>
                </div>

                <div className="space-y-4 text-sm text-neutral-200">
                  {content.comparison.goodPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </section>
      </ScrollReveal>


      {/* ========================================================================= */}
      {/* 8. SECTION: PLANOS & PREÇOS (CONECTADO EM TEMPO REAL AO FIRESTORE & ADMIN) */}
      {/* ========================================================================= */}
      <PackagesSection 
        onOpenConsultation={onOpenConsultation} 
        onOpenAdminPackages={() => onNavigate && onNavigate('admin')} 
      />


      {/* ========================================================================= */}
      {/* 9. SECTION: PERGUNTAS FREQUENTES (FAQ COM CMS EDIT) */}
      {/* ========================================================================= */}
      <section id="faq" className="relative mx-auto max-w-4xl px-4 py-16 sm:py-24 border-t border-neutral-900/80">
        
        <ScrollReveal threshold={0.2} yOffset={20} once={true}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                DÚVIDAS FREQUENTES
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Perguntas Frequentes sobre a Techify
              </h2>
            </div>

            {isEditMode && (
              <button
                onClick={() => setFaqModal({
                  isOpen: true,
                  isNew: true,
                  faq: {
                    id: `faq_${Date.now()}`,
                    question: '',
                    answer: ''
                  }
                })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#22c55e] px-4 py-2 text-xs font-bold text-black shadow-md cursor-pointer hover:bg-[#16a34a] shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Pergunta</span>
              </button>
            )}
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {content.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <ScrollReveal key={faq.id} delay={idx * 0.05} duration={0.4} once={true}>
                <div 
                  className="relative rounded-2xl border border-neutral-800/90 bg-[#090a09] overflow-hidden transition-colors hover:border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white cursor-pointer select-none"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#22c55e]' : ''
                      }`} />
                    </button>

                    {/* Admin Edit / Delete Actions */}
                    {isEditMode && (
                      <div className="flex items-center gap-1 pr-4">
                        <button
                          onClick={() => setFaqModal({
                            isOpen: true,
                            isNew: false,
                            faq: { ...faq }
                          })}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-[#22c55e] text-white hover:text-black transition-colors"
                          title="Editar Pergunta"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-600 text-white transition-colors"
                          title="Excluir Pergunta"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/50"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 10. SECTION: BOTTOM CTA */}
      {/* ========================================================================= */}
      <ScrollReveal threshold={0.2} yOffset={20} once={true}>
        <section className="relative mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center border-t border-neutral-900/80">
          
          {/* Glowing Green Hexagon / Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b2812] border border-[#22c55e]/50 text-[#22c55e] shadow-[0_0_30px_rgba(34,197,94,0.3)] mb-6">
            <Zap className="h-7 w-7 fill-[#22c55e] text-[#22c55e]" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {content.bottomCta.headline}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            {content.bottomCta.description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleStartConsultation('CTA Final - Falar com Engenheiro')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#a3e635] hover:bg-[#84cc16] text-black font-black text-xs uppercase tracking-wider px-9 py-4 shadow-[0_0_35px_rgba(163,230,53,0.4)] transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              <span>{content.bottomCta.ctaPrimary}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 font-bold">
                ↗
              </span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('apps')}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-neutral-700/80 bg-neutral-900/90 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-8 py-4 transition-all cursor-pointer select-none"
            >
              <span>{content.bottomCta.ctaSecondary}</span>
            </button>
          </div>

        </section>
      </ScrollReveal>


      {/* ========================================================================= */}
      {/* MODAL 1: GENERIC TEXT EDITOR */}
      {/* ========================================================================= */}
      {textModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#0c0f0c] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <h3 className="font-display font-bold text-white text-base">
                {textModal.title}
              </h3>
              <button
                onClick={() => setTextModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTextModal}>
              {textModal.isMultiline ? (
                <textarea
                  rows={4}
                  value={textModal.value}
                  onChange={(e) => setTextModal(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={textModal.value}
                  onChange={(e) => setTextModal(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                />
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTextModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-xs font-extrabold text-black hover:bg-[#16a34a]"
                >
                  Aplicar Mudança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* MODAL 2: SERVICE EDITOR (ADD / EDIT) */}
      {/* ========================================================================= */}
      {serviceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-[#0c0f0c] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <h3 className="font-display font-bold text-white text-base">
                {serviceModal.isNew ? 'Adicionar Novo Serviço' : 'Editar Serviço'}
              </h3>
              <button
                onClick={() => setServiceModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  value={serviceModal.service.name}
                  onChange={(e) => setServiceModal(prev => ({
                    ...prev,
                    service: { ...prev.service, name: e.target.value }
                  }))}
                  placeholder="Ex: Sites & Sistemas Web"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Subtítulo / Chamada</label>
                  <input
                    type="text"
                    value={serviceModal.service.subtitle}
                    onChange={(e) => setServiceModal(prev => ({
                      ...prev,
                      service: { ...prev.service, subtitle: e.target.value }
                    }))}
                    placeholder="Ex: Engenharia de alta velocidade"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Etiqueta (Tag)</label>
                  <input
                    type="text"
                    value={serviceModal.service.tag}
                    onChange={(e) => setServiceModal(prev => ({
                      ...prev,
                      service: { ...prev.service, tag: e.target.value }
                    }))}
                    placeholder="Ex: Core Tech"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  value={serviceModal.service.description}
                  onChange={(e) => setServiceModal(prev => ({
                    ...prev,
                    service: { ...prev.service, description: e.target.value }
                  }))}
                  placeholder="Explique o que este serviço entrega para o cliente..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Ícone</label>
                <select
                  value={serviceModal.service.iconName}
                  onChange={(e) => setServiceModal(prev => ({
                    ...prev,
                    service: { ...prev.service, iconName: e.target.value }
                  }))}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                >
                  <option value="Globe">Globo (Web / Sites)</option>
                  <option value="Palette">Paleta (Design / UI)</option>
                  <option value="BarChart3">Gráfico (Marketing / Vendas)</option>
                  <option value="Bot">Robô (IA / Automações)</option>
                  <option value="Smartphone">Celular (Apps Mobile)</option>
                  <option value="Zap">Raio (Performance / SEO)</option>
                  <option value="Code2">Código (Engenharia)</option>
                  <option value="Cpu">Processador (Cloud / Back-end)</option>
                  <option value="Shield">Escudo (Segurança)</option>
                  <option value="Flame">Fogo (Destaque)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Entregáveis (1 por linha)</label>
                <textarea
                  rows={3}
                  value={serviceModal.service.deliverables.join('\n')}
                  onChange={(e) => setServiceModal(prev => ({
                    ...prev,
                    service: {
                      ...prev.service,
                      deliverables: e.target.value.split('\n').filter(Boolean)
                    }
                  }))}
                  placeholder="Item 1&#10;Item 2&#10;Item 3"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="service-highlight"
                  checked={serviceModal.service.highlight || false}
                  onChange={(e) => setServiceModal(prev => ({
                    ...prev,
                    service: { ...prev.service, highlight: e.target.checked }
                  }))}
                  className="h-4 w-4 rounded border-neutral-700 accent-[#22c55e]"
                />
                <label htmlFor="service-highlight" className="text-xs text-neutral-300 font-medium">
                  Destacar este card com borda verde brilhante
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setServiceModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-xs font-extrabold text-black hover:bg-[#16a34a]"
                >
                  {serviceModal.isNew ? 'Criar Serviço' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* MODAL 3: PLAN EDITOR (ADD / EDIT) */}
      {/* ========================================================================= */}
      {planModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-[#0c0f0c] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <h3 className="font-display font-bold text-white text-base">
                {planModal.isNew ? 'Adicionar Novo Plano' : 'Editar Plano'}
              </h3>
              <button
                onClick={() => setPlanModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  value={planModal.plan.name}
                  onChange={(e) => setPlanModal(prev => ({
                    ...prev,
                    plan: { ...prev.plan, name: e.target.value }
                  }))}
                  placeholder="Ex: Pro • Full Growth 360°"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Preço Mensal</label>
                  <input
                    type="text"
                    value={planModal.plan.monthlyPrice}
                    onChange={(e) => setPlanModal(prev => ({
                      ...prev,
                      plan: { ...prev.plan, monthlyPrice: e.target.value }
                    }))}
                    placeholder="Ex: R$ 497 ou 48"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Preço Anual (c/ desconto)</label>
                  <input
                    type="text"
                    value={planModal.plan.annualPrice}
                    onChange={(e) => setPlanModal(prev => ({
                      ...prev,
                      plan: { ...prev.plan, annualPrice: e.target.value }
                    }))}
                    placeholder="Ex: R$ 397 ou 399"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Período / Sufixo</label>
                  <input
                    type="text"
                    value={planModal.plan.periodText || 'mês'}
                    onChange={(e) => setPlanModal(prev => ({
                      ...prev,
                      plan: { ...prev.plan, periodText: e.target.value }
                    }))}
                    placeholder="Ex: mês, ano, sob medida"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Etiqueta Superior (Badge)</label>
                  <input
                    type="text"
                    value={planModal.plan.badge || ''}
                    onChange={(e) => setPlanModal(prev => ({
                      ...prev,
                      plan: { ...prev.plan, badge: e.target.value }
                    }))}
                    placeholder="Ex: MAIS POPULAR, ENTRADA RÁPIDA"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Título dos Inclusos</label>
                  <input
                    type="text"
                    value={planModal.plan.includesHeader || ''}
                    onChange={(e) => setPlanModal(prev => ({
                      ...prev,
                      plan: { ...prev.plan, includesHeader: e.target.value }
                    }))}
                    placeholder="Ex: Tudo do Starter, mais: ou Inclusos:"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={planModal.plan.ctaText}
                    onChange={(e) => setPlanModal(prev => ({
                      ...prev,
                      plan: { ...prev.plan, ctaText: e.target.value }
                    }))}
                    placeholder="Ex: GARANTIR PLANO PRO"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Estilo do Botão</label>
                  <select
                    value={planModal.plan.buttonVariant || (planModal.plan.popular ? 'default' : 'outline')}
                    onChange={(e) => setPlanModal(prev => ({
                      ...prev,
                      plan: { ...prev.plan, buttonVariant: e.target.value as 'default' | 'outline' }
                    }))}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  >
                    <option value="outline">Escuro com Borda (Outline / Standard)</option>
                    <option value="default">Verde Techify Vibrante (Destaque)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Mensagem do WhatsApp (ao clicar no botão)</label>
                <input
                  type="text"
                  value={planModal.plan.whatsappMessage || ''}
                  onChange={(e) => setPlanModal(prev => ({
                    ...prev,
                    plan: { ...prev.plan, whatsappMessage: e.target.value }
                  }))}
                  placeholder="Ex: Olá! Tenho interesse no plano Pro e gostaria de uma proposta."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={planModal.plan.description}
                  onChange={(e) => setPlanModal(prev => ({
                    ...prev,
                    plan: { ...prev.plan, description: e.target.value }
                  }))}
                  placeholder="Resumo das vantagens..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Recursos Inclusos (1 por linha)</label>
                <textarea
                  rows={4}
                  value={planModal.plan.features.join('\n')}
                  onChange={(e) => setPlanModal(prev => ({
                    ...prev,
                    plan: {
                      ...prev.plan,
                      features: e.target.value.split('\n').filter(Boolean)
                    }
                  }))}
                  placeholder="Recurso 1&#10;Recurso 2&#10;Recurso 3"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="plan-popular"
                  checked={planModal.plan.popular || false}
                  onChange={(e) => setPlanModal(prev => ({
                    ...prev,
                    plan: { ...prev.plan, popular: e.target.checked }
                  }))}
                  className="h-4 w-4 rounded border-neutral-700 accent-[#22c55e]"
                />
                <label htmlFor="plan-popular" className="text-xs text-neutral-300 font-medium">
                  Marcar como "Mais Popular / Destaque Central"
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPlanModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-xs font-extrabold text-black hover:bg-[#16a34a]"
                >
                  {planModal.isNew ? 'Criar Plano' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* MODAL 4: FAQ EDITOR (ADD / EDIT) */}
      {/* ========================================================================= */}
      {faqModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#0c0f0c] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <h3 className="font-display font-bold text-white text-base">
                {faqModal.isNew ? 'Adicionar Pergunta ao FAQ' : 'Editar Pergunta'}
              </h3>
              <button
                onClick={() => setFaqModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Pergunta</label>
                <input
                  type="text"
                  value={faqModal.faq.question}
                  onChange={(e) => setFaqModal(prev => ({
                    ...prev,
                    faq: { ...prev.faq, question: e.target.value }
                  }))}
                  placeholder="Ex: Quanto tempo leva para desenvolver um projeto?"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Resposta</label>
                <textarea
                  rows={4}
                  value={faqModal.faq.answer}
                  onChange={(e) => setFaqModal(prev => ({
                    ...prev,
                    faq: { ...prev.faq, answer: e.target.value }
                  }))}
                  placeholder="Digite a resposta explicativa..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setFaqModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-xs font-extrabold text-black hover:bg-[#16a34a]"
                >
                  {faqModal.isNew ? 'Adicionar Pergunta' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
