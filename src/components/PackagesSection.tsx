import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Gift, 
  Flame, 
  Edit3,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { 
  PackageOffer, 
  getCachedPackages, 
  initPackagesListener, 
  DEFAULT_PACKAGES 
} from '../lib/homeContent';
import { useAdminAuth } from '../lib/adminAuth';

interface PackagesSectionProps {
  onOpenConsultation?: (defaultService?: string) => void;
  onOpenAdminPackages?: () => void;
}

// Helper to parse price strings into currency symbol, number amount and suffix for NumberFlow
function parsePriceData(val: string | number | undefined) {
  if (val === undefined || val === null || val === '') {
    return { symbol: 'R$ ', amount: 0, suffix: '', hasNumber: false, raw: '' };
  }
  if (typeof val === 'number') {
    return { symbol: 'R$ ', amount: val, suffix: '', hasNumber: true, raw: String(val) };
  }
  const str = String(val).trim();
  const match = str.match(/^([^\d]*?)\s*([\d]+(?:[.,]\d+)?)\s*(.*)$/);
  if (match) {
    const symbol = match[1] || '';
    const numClean = match[2].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(numClean);
    if (!isNaN(num)) {
      return {
        symbol: symbol ? (symbol.endsWith(' ') ? symbol : `${symbol}`) : 'R$',
        amount: num,
        suffix: match[3] || '',
        hasNumber: true,
        raw: str
      };
    }
  }
  return { symbol: '', amount: 0, suffix: '', hasNumber: false, raw: str };
}

// Interactive Pricing Toggle Switch with layoutId animation (Mensal / Anual)
const PricingSwitch = ({
  isYearly,
  onToggle,
}: {
  isYearly: boolean;
  onToggle: (yearly: boolean) => void;
}) => {
  return (
    <div className="flex justify-center my-6">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-neutral-800 p-1 shadow-2xl">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`relative z-10 w-fit sm:h-12 cursor-pointer h-10 rounded-full sm:px-6 px-4 sm:py-2 py-1 text-xs sm:text-sm font-semibold transition-colors ${
            !isYearly ? "text-white font-bold" : "text-neutral-400 hover:text-white"
          }`}
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
          className={`relative z-10 w-fit cursor-pointer sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-4 sm:py-2 py-1 text-xs sm:text-sm font-semibold transition-colors ${
            isYearly ? "text-white font-bold" : "text-neutral-400 hover:text-white"
          }`}
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

export default function PackagesSection({ onOpenConsultation, onOpenAdminPackages }: PackagesSectionProps) {
  const [packages, setPackages] = useState<PackageOffer[]>(() => getCachedPackages());
  const [isYearly, setIsYearly] = useState(false);
  const { isAdmin } = useAdminAuth();

  // Listen to Firestore real-time updates and local events
  useEffect(() => {
    const unsub = initPackagesListener((updated) => {
      if (Array.isArray(updated) && updated.length > 0) {
        setPackages(updated);
      }
    });
    return () => unsub();
  }, []);

  const handleSelectPackage = (pkg: PackageOffer) => {
    const isStarter = pkg.id === 'starter-tracao-vendas' || pkg.id === 'starter' || (pkg.title && pkg.title.toLowerCase().includes('starter'));

    // Check for direct payment checkout URL (e.g. Cakto)
    const directCheckoutUrl = !isYearly 
      ? (pkg.monthlyCheckoutUrl || (isStarter ? 'https://pay.cakto.com.br/uumvcze_1077792' : pkg.checkoutUrl))
      : (pkg.annualCheckoutUrl || (isStarter ? undefined : pkg.checkoutUrl));

    if (directCheckoutUrl) {
      window.open(directCheckoutUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const titleWithCycle = `${pkg.title} (${isYearly ? 'Plano Anual' : 'Plano Mensal'})`;
    if (onOpenConsultation) {
      onOpenConsultation(titleWithCycle);
    } else {
      const msg = isYearly 
        ? (pkg.annualWhatsappMessage || `Olá Techify! Gostaria de contratar o plano ${pkg.title} no plano anual com desconto.`)
        : (pkg.whatsappMessage || `Olá Techify! Gostaria de contratar o plano ${pkg.title}.`);
      const url = `https://wa.me/5581995498590?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenFreeTrial = () => {
    if (onOpenConsultation) {
      onOpenConsultation('Teste de Design & Amostra Grátis');
    } else {
      const url = `https://wa.me/5581995498590?text=${encodeURIComponent('Olá Techify! Gostaria de solicitar o Teste Grátis de Design e Amostra do Site para a minha empresa.')}`;
      window.open(url, '_blank');
    }
  };

  const activeList = packages.length > 0 ? packages : DEFAULT_PACKAGES;

  return (
    <section 
      id="planos" 
      className="relative w-full py-20 sm:py-28 bg-black overflow-hidden border-t border-neutral-900"
    >
      {/* Background Ambience Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.05),transparent_70%)] blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Quick Banner (If Logged In) */}
        {isAdmin && (
          <div className="mb-8 p-3.5 rounded-2xl border border-[#22c55e]/40 bg-[#091a0d]/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 text-xs text-neutral-200">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span><strong>Modo Administrador Ativo:</strong> Você pode editar valores mensais/anuais, adicionar ou excluir qualquer plano no Painel.</span>
            </div>
            {onOpenAdminPackages && (
              <button
                onClick={onOpenAdminPackages}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Gerenciar Planos no Admin</span>
              </button>
            )}
          </div>
        )}

        {/* Section Header */}
        <ScrollReveal threshold={0.2}>
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
              Soluções Integradas com <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#a3e635] drop-shadow-[0_0_30px_rgba(34,197,94,0.35)]">
                Alto Retorno e Investimento Acessível
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-400 max-w-3xl leading-relaxed font-normal">
              Contrate tudo o que sua empresa precisa em uma estrutura ágil: desenvolvimento sob medida, design cinematográfico, marketing e tecnologia.
            </p>

            {/* Annual / Monthly Toggle Switch */}
            <PricingSwitch isYearly={isYearly} onToggle={setIsYearly} />

            {/* FREE SAMPLE GUARANTEE BANNER */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={handleOpenFreeTrial}
              className="mt-3 inline-flex items-center gap-3.5 rounded-2xl border border-[#22c55e]/50 bg-gradient-to-r from-[#0d2814] via-[#09170c] to-[#0d2814] p-3.5 sm:px-6 sm:py-3 text-left cursor-pointer shadow-[0_0_30px_rgba(34,197,94,0.2)] group"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#22c55e] text-black flex items-center justify-center font-black shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black uppercase text-[#4ade80] tracking-wide">
                    Diferencial Exclusivo Techify
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/40">
                    100% Grátis
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-neutral-200 mt-0.5">
                  <strong>Teste de Design & Amostra Grátis:</strong> Você avalia a proposta visual antes de qualquer compromisso financeiro.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-[#22c55e] shrink-0 ml-2 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </motion.div>

          </div>
        </ScrollReveal>

        {/* Pricing & Packages Cards Grid */}
        <div className={`grid grid-cols-1 gap-6 max-w-6xl mx-auto items-stretch ${
          activeList.length === 1 
            ? 'max-w-md' 
            : activeList.length === 2 
              ? 'md:grid-cols-2 max-w-4xl' 
              : 'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {activeList.map((pkg, idx) => {
            const isHighlighted = !!pkg.popular;
            
            // Determine active price and period text based on monthly / yearly
            const rawPrice = isYearly 
              ? (pkg.annualPrice || pkg.currentPrice)
              : (pkg.monthlyPrice || pkg.currentPrice);
            
            const priceData = parsePriceData(rawPrice);

            const activePeriodText = isYearly
              ? (pkg.annualPeriodText || '/mês no plano anual')
              : (pkg.periodText || '/mês (ou sob medida)');

            return (
              <ScrollReveal key={pkg.id || idx} delay={idx * 0.1} yOffset={25}>
                <div 
                  className={`relative h-full flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 ${
                    isHighlighted
                      ? 'border-2 border-[#22c55e] bg-gradient-to-b from-[#08180c] via-[#050e07] to-[#030604] shadow-[0_0_40px_rgba(34,197,94,0.25)]'
                      : 'border border-neutral-800/90 bg-[#0c0e0d] hover:border-neutral-700 shadow-xl'
                  }`}
                >
                  {/* Admin Edit Shortcut on Card */}
                  {isAdmin && onOpenAdminPackages && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAdminPackages();
                      }}
                      className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800/90 hover:bg-[#22c55e] text-white hover:text-black transition-all shadow-lg border border-neutral-700 cursor-pointer z-20"
                      title="Editar este plano no painel administrativo"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}

                  {/* Top Popular or Custom Badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {pkg.badge && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                        isHighlighted
                          ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                          : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700'
                      }`}>
                        {isHighlighted && <Flame className="h-3 w-3 fill-black" />}
                        {pkg.badge}
                      </span>
                    )}

                    {isYearly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30">
                        <Tag className="h-3 w-3" />
                        Desconto Anual Ativo
                      </span>
                    )}
                  </div>

                  <div>
                    {/* Header Info */}
                    <div className="flex flex-col gap-1 mt-1">
                      <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">
                        {pkg.title}
                      </h3>
                      
                      {pkg.description && (
                        <p className="text-xs text-neutral-400 leading-relaxed font-normal mt-2">
                          {pkg.description}
                        </p>
                      )}
                    </div>

                    {/* Price Display with NumberFlow */}
                    <div className="my-5 pt-3 pb-3 border-y border-neutral-800/80">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {priceData.hasNumber ? (
                          <div className="flex items-baseline">
                            <span className={`font-display text-2xl sm:text-3xl font-black text-white ${
                              isHighlighted ? 'text-[#22c55e] drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''
                            }`}>
                              {priceData.symbol}
                            </span>
                            <NumberFlow
                              value={priceData.amount}
                              className={`font-display text-3xl sm:text-4xl font-black text-white tracking-tight ${
                                isHighlighted ? 'text-[#22c55e] drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''
                              }`}
                            />
                            {priceData.suffix && (
                              <span className="text-sm sm:text-base font-bold text-white ml-1">
                                {priceData.suffix}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={`font-display text-3xl sm:text-4xl font-black text-white tracking-tight ${
                            isHighlighted ? 'text-[#22c55e] drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''
                          }`}>
                            {priceData.raw}
                          </span>
                        )}

                        {activePeriodText && (
                          <span className="text-xs text-neutral-400 font-medium">
                            {activePeriodText}
                          </span>
                        )}
                      </div>

                      {/* Original Price / Comparison */}
                      {isYearly && pkg.monthlyPrice && pkg.annualPrice && pkg.monthlyPrice !== pkg.annualPrice ? (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-neutral-500 font-medium">Mensal regular:</span>
                          <span className="text-[11px] text-neutral-400 line-through">
                            {pkg.monthlyPrice}/mês
                          </span>
                          <span className="text-[10px] font-bold text-[#4ade80] bg-[#22c55e]/15 px-2 py-0.5 rounded-md">
                            Economia de 20%
                          </span>
                        </div>
                      ) : pkg.originalPrice ? (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-neutral-500 font-medium">De:</span>
                          <span className="text-xs text-neutral-400 line-through">
                            {pkg.originalPrice}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-neutral-400 block">
                        {pkg.featuresHeader || 'INCLUSO NO PLANO:'}
                      </span>

                      {Array.isArray(pkg.features) && pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                            isHighlighted
                              ? 'bg-[#22c55e] text-black shadow-sm'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}>
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="mt-8 pt-4 border-t border-neutral-800/80 flex flex-col gap-2">
                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                        isHighlighted
                          ? 'bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-[0_0_25px_rgba(34,197,94,0.45)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)]'
                          : 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-white shadow-md'
                      }`}
                    >
                      <span>{isYearly ? `CONTRATAR ANUAL • ${pkg.title}` : (pkg.ctaText || 'COMEÇAR AGORA')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* FREE TRIAL STEP CALLOUT */}
        <ScrollReveal threshold={0.2} delay={0.15}>
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-neutral-800 bg-gradient-to-r from-[#090e0a] via-[#050805] to-[#090e0a] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Quer ver como fica antes de pagar?
                </h4>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                  Solicite um <strong>Teste de Design & Amostra de Site 100% Gratuito</strong>. Nossa equipe prepara o conceito inicial para você avaliar sem custo.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenFreeTrial}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] px-6 py-3 text-xs sm:text-sm font-black text-black transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer whitespace-nowrap"
            >
              <Gift className="h-4 w-4" />
              <span>SOLICITAR TESTE GRÁTIS</span>
            </button>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
