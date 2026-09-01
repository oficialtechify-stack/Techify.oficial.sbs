import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Flame, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  RotateCcw, 
  X,
  Layers,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { 
  PackageOffer, 
  DEFAULT_PACKAGES, 
  getCachedPackages, 
  initPackagesListener, 
  savePackagesToFirestore 
} from '../lib/homeContent';
import { toast } from './Toast';

export default function AdminPackagesTab() {
  const [packages, setPackages] = useState<PackageOffer[]>(() => getCachedPackages());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageOffer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingPkg, setDeletingPkg] = useState<PackageOffer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formPopular, setFormPopular] = useState(false);
  const [formCurrentPrice, setFormCurrentPrice] = useState('');
  const [formMonthlyPrice, setFormMonthlyPrice] = useState('');
  const [formAnnualPrice, setFormAnnualPrice] = useState('');
  const [formPeriodText, setFormPeriodText] = useState('');
  const [formAnnualPeriodText, setFormAnnualPeriodText] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFeaturesHeader, setFormFeaturesHeader] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [formCtaText, setFormCtaText] = useState('');
  const [formWhatsappMessage, setFormWhatsappMessage] = useState('');
  const [formAnnualWhatsappMessage, setFormAnnualWhatsappMessage] = useState('');
  const [formMonthlyCheckoutUrl, setFormMonthlyCheckoutUrl] = useState('');
  const [formAnnualCheckoutUrl, setFormAnnualCheckoutUrl] = useState('');

  // Subscribe to real-time packages
  useEffect(() => {
    const unsub = initPackagesListener((updated) => {
      setPackages(updated);
    });
    return () => unsub();
  }, []);

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingPkg(null);
    setFormTitle('');
    setFormBadge('');
    setFormPopular(false);
    setFormCurrentPrice('R$ 297');
    setFormMonthlyPrice('R$ 297');
    setFormAnnualPrice('R$ 237');
    setFormPeriodText('/mês (ou sob medida)');
    setFormAnnualPeriodText('/mês no plano anual (economize 20%)');
    setFormOriginalPrice('');
    setFormDescription('');
    setFormFeaturesHeader('INCLUSO NO PLANO:');
    setFormFeatures([
      'Landing Page ou Site Institucional de Ultra Velocidade',
      'Design Responsivo adaptado para Smartphones e Desktops',
      'Botão Direto para Conversão no WhatsApp',
      'Suporte Técnico Dedicado via WhatsApp'
    ]);
    setNewFeatureInput('');
    setFormCtaText('QUERO ESSE PLANO');
    setFormWhatsappMessage('Olá Techify! Gostaria de contratar este plano no formato mensal.');
    setFormAnnualWhatsappMessage('Olá Techify! Gostaria de contratar este plano no plano anual com desconto.');
    setFormMonthlyCheckoutUrl('');
    setFormAnnualCheckoutUrl('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pkg: PackageOffer) => {
    setEditingPkg(pkg);
    setFormTitle(pkg.title || '');
    setFormBadge(pkg.badge || '');
    setFormPopular(!!pkg.popular);
    setFormCurrentPrice(pkg.currentPrice || pkg.monthlyPrice || '');
    setFormMonthlyPrice(pkg.monthlyPrice || pkg.currentPrice || '');
    setFormAnnualPrice(pkg.annualPrice || '');
    setFormPeriodText(pkg.periodText || '/mês');
    setFormAnnualPeriodText(pkg.annualPeriodText || '/mês no plano anual');
    setFormOriginalPrice(pkg.originalPrice || '');
    setFormDescription(pkg.description || '');
    setFormFeaturesHeader(pkg.featuresHeader || 'INCLUSO NO PLANO:');
    setFormFeatures(Array.isArray(pkg.features) ? [...pkg.features] : []);
    setNewFeatureInput('');
    setFormCtaText(pkg.ctaText || 'CONTRATAR AGORA');
    setFormWhatsappMessage(pkg.whatsappMessage || `Olá Techify! Gostaria de contratar o plano ${pkg.title}.`);
    setFormAnnualWhatsappMessage(pkg.annualWhatsappMessage || `Olá Techify! Gostaria de contratar o plano ${pkg.title} no plano anual com desconto.`);
    setFormMonthlyCheckoutUrl(pkg.monthlyCheckoutUrl || pkg.checkoutUrl || (pkg.id === 'starter-tracao-vendas' || (pkg.title && pkg.title.toLowerCase().includes('starter')) ? 'https://pay.cakto.com.br/uumvcze_1077792' : ''));
    setFormAnnualCheckoutUrl(pkg.annualCheckoutUrl || '');
    setIsModalOpen(true);
  };

  // Add Feature to form
  const handleAddFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (!trimmed) return;
    setFormFeatures(prev => [...prev, trimmed]);
    setNewFeatureInput('');
  };

  // Remove Feature from form
  const handleRemoveFeature = (index: number) => {
    setFormFeatures(prev => prev.filter((_, idx) => idx !== index));
  };

  // Move Feature up/down in form
  const handleMoveFeature = (index: number, direction: 'up' | 'down') => {
    setFormFeatures(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Save Plan (Create or Update)
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyVal = formCurrentPrice.trim() || formMonthlyPrice.trim();
    if (!formTitle.trim() || !monthlyVal) {
      toast.error('Título e Valor Mensal são obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      const planData: PackageOffer = {
        id: editingPkg ? editingPkg.id : `plano-${Date.now()}`,
        title: formTitle.trim(),
        badge: formBadge.trim() || '',
        popular: Boolean(formPopular),
        currentPrice: monthlyVal,
        monthlyPrice: monthlyVal,
        annualPrice: formAnnualPrice.trim() || '',
        periodText: formPeriodText.trim() || '/mês',
        annualPeriodText: formAnnualPeriodText.trim() || '/mês no plano anual',
        originalPrice: formOriginalPrice.trim() || '',
        description: formDescription.trim(),
        featuresHeader: formFeaturesHeader.trim() || 'O QUE ESTÁ INCLUSO:',
        features: formFeatures.length > 0 ? formFeatures : ['Atendimento prioritário'],
        ctaText: formCtaText.trim() || 'CONTRATAR PLANO',
        whatsappMessage: formWhatsappMessage.trim() || `Olá Techify! Gostaria de contratar o plano ${formTitle.trim()} no mensal.`,
        annualWhatsappMessage: formAnnualWhatsappMessage.trim() || `Olá Techify! Gostaria de contratar o plano ${formTitle.trim()} no plano anual com desconto.`,
        checkoutUrl: formMonthlyCheckoutUrl.trim() || undefined,
        monthlyCheckoutUrl: formMonthlyCheckoutUrl.trim() || undefined,
        annualCheckoutUrl: formAnnualCheckoutUrl.trim() || undefined
      };

      let updatedList: PackageOffer[];
      if (editingPkg) {
        updatedList = packages.map(p => p.id === editingPkg.id ? planData : p);
      } else {
        updatedList = [...packages, planData];
      }

      await savePackagesToFirestore(updatedList);
      setPackages(updatedList);
      setIsModalOpen(false);
      toast.success(editingPkg ? 'Plano atualizado com sucesso!' : 'Novo plano adicionado!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao salvar plano: ' + (err.message || 'Tente novamente'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Plan
  const handleDeletePlan = async () => {
    if (!deletingPkg) return;
    try {
      setIsDeleting(true);
      const updatedList = packages.filter(p => p.id !== deletingPkg.id);
      await savePackagesToFirestore(updatedList);
      setPackages(updatedList);
      setDeletingPkg(null);
      toast.success('Plano excluído com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao excluir: ' + (err.message || ''));
    } finally {
      setIsDeleting(false);
    }
  };

  // Duplicate Plan
  const handleDuplicatePlan = async (pkg: PackageOffer) => {
    try {
      const duplicated: PackageOffer = {
        ...pkg,
        id: `plano-${Date.now()}`,
        title: `${pkg.title} (Cópia)`,
        popular: false
      };
      const updatedList = [...packages, duplicated];
      await savePackagesToFirestore(updatedList);
      setPackages(updatedList);
      toast.success(`Cópia criada: ${duplicated.title}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao duplicar plano');
    }
  };

  // Reorder Plan
  const handleMovePlan = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= packages.length) return;

    try {
      const copy = [...packages];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      
      setPackages(copy);
      await savePackagesToFirestore(copy);
      toast.success('Ordem dos planos atualizada!');
    } catch (err) {
      console.error(err);
    }
  };

  // Reset to Defaults (the 3 modern plans: Starter, Pro, Scale)
  const handleResetToDefaults = async () => {
    try {
      setIsResetting(true);
      await savePackagesToFirestore(DEFAULT_PACKAGES);
      setPackages(DEFAULT_PACKAGES);
      setIsResetModalOpen(false);
      toast.success('Planos restaurados para o padrão original (Starter, Pro e Scale)!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao restaurar planos');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141615] border border-neutral-800/80 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#22c55e]" />
            <h2 className="text-xl font-bold text-white font-sans tracking-tight">
              Gerenciar Planos & Preços
            </h2>
            <span className="bg-[#22c55e]/15 text-[#86efac] border border-[#22c55e]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {packages.length} {packages.length === 1 ? 'plano' : 'planos'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Edite valores, nomes dos planos, listas de benefícios inclusos, adicione novos planos ou exclua os existentes em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-all cursor-pointer"
            title="Restaura os 3 planos oficiais da Techify (Starter, Pro, Scale)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Adicionar Novo Plano</span>
          </button>
        </div>
      </div>

      {/* Plans List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg, idx) => (
          <div
            key={pkg.id}
            className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all shadow-xl ${
              pkg.popular
                ? 'bg-gradient-to-b from-[#091a0d] via-[#0b140d] to-[#0a0c0a] border-2 border-[#22c55e] shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                : 'bg-[#121413] border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {/* Top Badge & Controls */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                {pkg.badge ? (
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    pkg.popular
                      ? 'bg-[#22c55e] text-black shadow-sm flex items-center gap-1'
                      : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  }`}>
                    {pkg.popular && <Flame className="h-2.5 w-2.5 fill-black" />}
                    {pkg.badge}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    Plano #{idx + 1}
                  </span>
                )}

                {/* Quick Ordering & Actions */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMovePlan(idx, 'up')}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors"
                    title="Mover para a esquerda/cima"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={idx === packages.length - 1}
                    onClick={() => handleMovePlan(idx, 'down')}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors"
                    title="Mover para a direita/baixo"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-black text-white font-sans">
                {pkg.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {pkg.description}
              </p>

              {/* Price Tag Box */}
              <div className="my-4 p-3 rounded-xl bg-black/60 border border-neutral-800/80 space-y-1.5">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs text-neutral-400 font-bold">Mensal:</span>
                  <span className="text-xl font-black text-white font-display tracking-tight">
                    {pkg.currentPrice || pkg.monthlyPrice}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {pkg.periodText || '/mês'}
                  </span>
                </div>
                {pkg.annualPrice && (
                  <div className="flex items-baseline gap-1.5 flex-wrap pt-1 border-t border-neutral-900">
                    <span className="text-xs text-[#22c55e] font-bold">Anual (-20%):</span>
                    <span className="text-base font-black text-[#22c55e] font-display">
                      {pkg.annualPrice}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {pkg.annualPeriodText || '/mês no anual'}
                    </span>
                  </div>
                )}
                {pkg.originalPrice && (
                  <p className="text-[11px] text-neutral-500 line-through">
                    De: {pkg.originalPrice}
                  </p>
                )}
              </div>

              {/* Features Summary */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  {pkg.featuresHeader || 'Incluso:'} ({pkg.features?.length || 0} itens)
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-[11px] text-neutral-300">
                  {pkg.features?.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-1.5">
                      <Check className={`h-3 w-3 shrink-0 mt-0.5 ${pkg.popular ? 'text-[#22c55e]' : 'text-neutral-400'}`} />
                      <span className="line-clamp-1 leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEdit(pkg)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>Editar Plano</span>
              </button>

              <button
                onClick={() => handleDuplicatePlan(pkg)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs transition-colors"
                title="Duplicar plano"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setDeletingPkg(pkg)}
                className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs border border-red-900/40 transition-colors"
                title="Excluir plano"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT PLAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#121413] border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingPkg ? 'Editar Plano / Pacote' : 'Adicionar Novo Plano'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Defina os detalhes de preço, nome, benefícios e ações do WhatsApp.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              
              {/* Row 1: Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Starter • Tração & Vendas"
                    className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Selo / Badge Superior
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Ex: MAIS POPULAR • RECOMENDADO"
                    className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              {/* Popular Checkbox */}
              <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/50 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="popular-checkbox"
                  checked={formPopular}
                  onChange={(e) => setFormPopular(e.target.checked)}
                  className="h-4 w-4 rounded bg-neutral-800 border-neutral-700 text-[#22c55e] focus:ring-[#22c55e]"
                />
                <label htmlFor="popular-checkbox" className="text-xs text-neutral-200 font-bold cursor-pointer select-none">
                  Destacar este plano como o Principal (borda verde brilhante e botão em destaque)
                </label>
              </div>

              {/* Row 2: Prices - Monthly & Annual */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <span className="text-xs font-bold text-[#22c55e] uppercase tracking-wider block">
                  Configuração de Preços (Mensal & Anual)
                </span>

                {/* Monthly Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Preço Mensal Regular *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCurrentPrice}
                      onChange={(e) => {
                        setFormCurrentPrice(e.target.value);
                        setFormMonthlyPrice(e.target.value);
                      }}
                      placeholder="Ex: R$ 497"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Sufixo Mensal
                    </label>
                    <input
                      type="text"
                      value={formPeriodText}
                      onChange={(e) => setFormPeriodText(e.target.value)}
                      placeholder="Ex: /mês (ou pacote fechado)"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Annual Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
                  <div>
                    <label className="block text-xs font-bold text-[#4ade80] mb-1">
                      Preço no Plano Anual (com desconto)
                    </label>
                    <input
                      type="text"
                      value={formAnnualPrice}
                      onChange={(e) => setFormAnnualPrice(e.target.value)}
                      placeholder="Ex: R$ 397"
                      className="w-full bg-neutral-900 border border-[#22c55e]/40 rounded-xl px-3.5 py-2 text-sm font-bold text-[#22c55e] focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Sufixo Anual
                    </label>
                    <input
                      type="text"
                      value={formAnnualPeriodText}
                      onChange={(e) => setFormAnnualPeriodText(e.target.value)}
                      placeholder="Ex: /mês no plano anual"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Optional Original Price */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <label className="block text-xs font-bold text-neutral-400 mb-1">
                    Valor Original "De:" (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="Ex: R$ 890"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-neutral-400 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Descrição do Plano
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: A solução digital definitiva: Desenvolvimento completo + Design cinematográfico..."
                  className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              {/* Features List Section */}
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Título da Seção de Benefícios
                  </label>
                  <input
                    type="text"
                    value={formFeaturesHeader}
                    onChange={(e) => setFormFeaturesHeader(e.target.value)}
                    placeholder="Ex: TUDO DO PLANO STARTER, MAIS:"
                    className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white sm:w-64 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                {/* Add new feature input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Escreva um novo benefício e clique em adicionar..."
                    className="flex-1 bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#22c55e] text-black text-xs font-bold hover:bg-[#16a34a] transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Features Reorder/Delete List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formFeatures.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-200 group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Check className="h-3.5 w-3.5 text-[#22c55e] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={fIdx === 0}
                          onClick={() => handleMoveFeature(fIdx, 'up')}
                          className="p-1 text-neutral-500 hover:text-white disabled:opacity-20"
                          title="Subir"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={fIdx === formFeatures.length - 1}
                          onClick={() => handleMoveFeature(fIdx, 'down')}
                          className="p-1 text-neutral-500 hover:text-white disabled:opacity-20"
                          title="Descer"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(fIdx)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded"
                          title="Remover benefício"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formFeatures.length === 0 && (
                    <p className="text-xs text-neutral-500 text-center py-2">
                      Nenhum benefício listado. Adicione pelo menos um no campo acima.
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Button CTA & WhatsApp Messages */}
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="Ex: GARANTIR PLANO PRO"
                    className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Link de Checkout / Pagamento Direto (Plano Mensal)
                    </label>
                    <input
                      type="url"
                      value={formMonthlyCheckoutUrl}
                      onChange={(e) => setFormMonthlyCheckoutUrl(e.target.value)}
                      placeholder="Ex: https://pay.cakto.com.br/uumvcze_1077792"
                      className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Se preenchido, o botão abrirá o checkout diretamente (ex: Cakto / Stripe). Se vazio, abre o WhatsApp.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4ade80] uppercase tracking-wider mb-1.5">
                      Link de Checkout / Pagamento Direto (Plano Anual)
                    </label>
                    <input
                      type="url"
                      value={formAnnualCheckoutUrl}
                      onChange={(e) => setFormAnnualCheckoutUrl(e.target.value)}
                      placeholder="Ex: https://pay.cakto.com.br/anual_xyz"
                      className="w-full bg-neutral-900/90 border border-[#22c55e]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Opcional: link do checkout do plano anual com desconto.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Mensagem WhatsApp (Plano Mensal)
                    </label>
                    <input
                      type="text"
                      value={formWhatsappMessage}
                      onChange={(e) => setFormWhatsappMessage(e.target.value)}
                      placeholder="Ex: Olá Techify! Quero o plano no mensal..."
                      className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4ade80] uppercase tracking-wider mb-1.5">
                      Mensagem WhatsApp (Plano Anual)
                    </label>
                    <input
                      type="text"
                      value={formAnnualWhatsappMessage}
                      onChange={(e) => setFormAnnualWhatsappMessage(e.target.value)}
                      placeholder="Ex: Olá Techify! Quero o plano no anual com desconto..."
                      className="w-full bg-neutral-900/90 border border-[#22c55e]/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>Salvar Plano</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121413] border border-red-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Excluir Plano?</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              Tem certeza que deseja excluir o plano <strong className="text-white">"{deletingPkg.title}"</strong>? Esta alteração será refletida no site imediatamente.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingPkg(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Confirmar Exclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET TO DEFAULTS */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121413] border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <RotateCcw className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Restaurar Planos Padrão?</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              Isso restaurará a lista de planos para os 3 planos oficiais completos: <strong className="text-white">Starter (R$197)</strong>, <strong className="text-[#22c55e]">Pro (R$497)</strong> e <strong className="text-white">Scale (R$997)</strong>.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetToDefaults}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-bold transition-all shadow-lg disabled:opacity-50"
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Confirmar Restauração</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
