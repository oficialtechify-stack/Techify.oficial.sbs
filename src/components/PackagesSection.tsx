import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Gift, 
  Layers, 
  Globe, 
  Share2, 
  BarChart3, 
  Palette,
  MessageCircle,
  Clock,
  Flame,
  HelpCircle
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export interface PackageOffer {
  id: string;
  badge?: string;
  popular?: boolean;
  title: string;
  subtitle: string;
  originalPrice?: string;
  currentPrice: string;
  periodText?: string;
  description: string;
  features: string[];
  designStyleHighlight?: string;
  ctaText: string;
  whatsappMessage: string;
}

export const TECHIFY_PACKAGES: PackageOffer[] = [
  {
    id: 'pacote-completo-360',
    popular: true,
    badge: 'OFERTA COMPLETA • MAIS VENDIDO',
    title: 'Pacote Full Growth 360°',
    subtitle: 'Site + Qualquer Estilo de Design + Marketing + Redes Sociais',
    originalPrice: 'R$ 2.300',
    currentPrice: 'R$ 580',
    periodText: 'pagamento único / condição especial',
    description: 'A solução digital definitiva para posicionar sua marca com autoridade imediata, design personalizado e fluxo contínuo de clientes.',
    features: [
      'Site Profissional ou Landing Page de Ultra Performance',
      'Design Exclusivo em qualquer estilo visual desejado (Dark Luxury, Minimalista, Cyber, B2B Corporativo, etc.)',
      'Estratégia & Configuração de Marketing Digital para Captação',
      'Gestão & Criação de Conteúdo para Redes Sociais',
      'Otimização SEO para destaque nos mecanismos de busca',
      'Botões inteligentes de conversão direta para o WhatsApp',
      'Painel intuitivo para controle e atualização de conteúdo',
      'Garantia de Teste Gratuito de Design antes da entrega final'
    ],
    designStyleHighlight: 'Design 100% customizado no estilo da sua preferência',
    ctaText: 'GARANTIR PACOTE COMPLETO',
    whatsappMessage: 'Olá Techify! Quero aproveitar o Pacote Full Growth 360° (Site + Design + Marketing + Redes Sociais) de R$ 2.300 por apenas R$ 580.'
  },
  {
    id: 'pacote-site-marketing',
    popular: false,
    badge: 'ALTA CONVERSÃO',
    title: 'Pacote Tração & Vendas',
    subtitle: 'Site Profissional + Estratégia de Marketing',
    originalPrice: 'R$ 890',
    currentPrice: 'R$ 350',
    periodText: 'pagamento único',
    description: 'Estrutura ágil e focada em resultados para quem deseja uma presença online elegante com geração ativa de oportunidades comerciais.',
    features: [
      'Site Institucional de Alta Velocidade e Responsivo (Mobile & Desktop)',
      'Configuração Estratégica de Marketing & Tráfego de Entrada',
      'Layout moderno com identidade visual profissional',
      'Integração direta com WhatsApp e canais de atendimento',
      'Carregamento instantâneo com infraestrutura moderna',
      'Amostra Gratuita inicial para validação de estilo'
    ],
    designStyleHighlight: 'Estrutura otimizada para geração imediata de contatos',
    ctaText: 'QUERO SITE + MARKETING',
    whatsappMessage: 'Olá Techify! Gostaria de contratar o Pacote Tração & Vendas (Site + Marketing) por R$ 350.'
  }
];

interface PackagesSectionProps {
  onOpenConsultation?: (defaultService?: string) => void;
}

export default function PackagesSection({ onOpenConsultation }: PackagesSectionProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSelectPackage = (pkg: PackageOffer) => {
    if (onOpenConsultation) {
      onOpenConsultation(pkg.title);
    } else {
      const url = `https://wa.me/5581995498590?text=${encodeURIComponent(pkg.whatsappMessage)}`;
      window.open(url, '_blank');
    }
  };

  const handleOpenFreeTrial = () => {
    if (onOpenConsultation) {
      onOpenConsultation('Teste de Design & Site Grátis');
    } else {
      const url = `https://wa.me/5581995498590?text=${encodeURIComponent('Olá Techify! Gostaria de solicitar o Teste Grátis de Design e Amostra do Site para a minha empresa.')}`;
      window.open(url, '_blank');
    }
  };

  return (
    <section 
      id="pacotes-techify" 
      className="relative w-full py-24 sm:py-32 bg-black overflow-hidden border-t border-neutral-900"
    >
      {/* Dynamic Background Light Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.06),transparent_70%)] blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal threshold={0.2}>
          <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
              Soluções Integradas com <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#a3e635] drop-shadow-[0_0_30px_rgba(34,197,94,0.35)]">
                Alto Retorno e Investimento Acessível
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-base md:text-lg text-neutral-400 max-w-3xl leading-relaxed font-normal">
              Contrate tudo o que sua empresa precisa em um único pacote sem burocracia: desenvolvimento de site, qualquer estilo visual sob medida, marketing e gestão de redes sociais.
            </p>

            {/* FREE SAMPLE GUARANTEE BANNER */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={handleOpenFreeTrial}
              className="mt-8 inline-flex items-center gap-3.5 rounded-2xl border border-[#22c55e]/50 bg-gradient-to-r from-[#0d2814] via-[#09170c] to-[#0d2814] p-4 sm:px-6 sm:py-3.5 text-left cursor-pointer shadow-[0_0_30px_rgba(34,197,94,0.25)] group"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#22c55e] text-black flex items-center justify-center font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
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
                  <strong>Teste de Design & Amostra do Site Grátis:</strong> Você avalia a proposta visual antes de qualquer compromisso financeiro.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-[#22c55e] shrink-0 ml-2 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </motion.div>

          </div>
        </ScrollReveal>

        {/* Pricing & Packages Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
          
          {/* PACKAGE 1: FULL GROWTH 360 (Highlight Card) */}
          <ScrollReveal delay={0.1} yOffset={35}>
            <div className="relative h-full flex flex-col justify-between rounded-2xl sm:rounded-3xl border-2 border-[#22c55e] bg-gradient-to-b from-[#091a0d] via-[#061008] to-[#040805] p-5 sm:p-8 lg:p-10 shadow-[0_0_40px_rgba(34,197,94,0.25)]">
              
              {/* Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#22c55e] text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.6)] whitespace-nowrap">
                <Flame className="h-3 w-3 fill-black" />
                <span>OFERTA COMPLETA 360°</span>
              </div>

              <div>
                {/* Header info */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#4ade80]">
                      Pacote Completo
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-3xl font-extrabold text-white">
                    {TECHIFY_PACKAGES[0].title}
                  </h3>

                  <p className="text-xs sm:text-sm font-semibold text-[#86efac]">
                    {TECHIFY_PACKAGES[0].subtitle}
                  </p>
                </div>

                {/* Price Display */}
                <div className="my-4 sm:my-6 rounded-2xl border border-[#22c55e]/30 bg-black/70 p-4 sm:p-6 backdrop-blur-md shadow-inner">
                  {/* Top line: Old price + Discount badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-neutral-400 font-medium">De:</span>
                      <span className="text-xs sm:text-base font-bold text-red-400/90 line-through whitespace-nowrap">
                        {TECHIFY_PACKAGES[0].originalPrice}
                      </span>
                      <span className="inline-flex items-center text-[9px] sm:text-[11px] font-extrabold text-[#4ade80] bg-[#22c55e]/15 border border-[#22c55e]/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Economia de R$ 1.720
                      </span>
                    </div>

                    <span className="inline-flex text-[9px] sm:text-[11px] font-semibold text-[#86efac] bg-neutral-900 border border-neutral-700/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                      Condição Especial
                    </span>
                  </div>

                  {/* Main amount line */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] sm:text-sm font-semibold uppercase tracking-wider text-neutral-400 whitespace-nowrap">
                        Por apenas
                      </span>
                      <span className="font-display text-3xl sm:text-5xl font-black text-white whitespace-nowrap tracking-tight drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                        {TECHIFY_PACKAGES[0].currentPrice}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium sm:text-right">
                      Pagamento único sem mensalidades
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal mb-4 sm:mb-6">
                  {TECHIFY_PACKAGES[0].description}
                </p>

                {/* Design Choice Highlight Badge */}
                <div className="mb-4 sm:mb-6 flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold">
                  <Palette className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Liberdade Criativa Total:</strong> Desenvolvemos no estilo que você preferir (Dark, Clean, Colorido, Minimalista).
                  </span>
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-neutral-400 block mb-1.5">
                    O que está incluso no pacote:
                  </span>
                  {TECHIFY_PACKAGES[0].features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-200">
                      <div className="h-4 w-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-sm">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#22c55e]/30 flex flex-col gap-2">
                <button
                  onClick={() => handleSelectPackage(TECHIFY_PACKAGES[0])}
                  className="w-full flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] py-3.5 sm:py-4 text-xs sm:text-sm font-black text-black transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.45)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] cursor-pointer active:scale-[0.98]"
                >
                  <span>CONTRATAR PACOTE COMPLETO POR R$ 580</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-center text-[10px] sm:text-[11px] text-neutral-400">
                  ✓ Inclui Teste Prévio Gratuito • Sem fidelidade ou mensalidades ocultas
                </p>
              </div>

            </div>
          </ScrollReveal>

          {/* PACKAGE 2: SITE + MARKETING (R$ 350) */}
          <ScrollReveal delay={0.2} yOffset={35}>
            <div className="relative h-full flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-neutral-800 bg-[#0a0c0a] p-5 sm:p-8 lg:p-10 hover:border-neutral-700 transition-colors shadow-xl">
              
              <div>
                {/* Header info */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">
                      Pacote Essencial
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-3xl font-extrabold text-white">
                    {TECHIFY_PACKAGES[1].title}
                  </h3>

                  <p className="text-xs sm:text-sm font-semibold text-neutral-300">
                    {TECHIFY_PACKAGES[1].subtitle}
                  </p>
                </div>

                {/* Price Display */}
                <div className="my-4 sm:my-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 sm:p-6 backdrop-blur-md shadow-inner">
                  {/* Top line: Old price + highlight */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-neutral-500 font-medium">Valor Regular:</span>
                      <span className="text-xs sm:text-base font-semibold text-neutral-400 line-through whitespace-nowrap">
                        {TECHIFY_PACKAGES[1].originalPrice}
                      </span>
                    </div>

                    <span className="inline-flex text-[9px] sm:text-[11px] font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                      Excelente Custo-Benefício
                    </span>
                  </div>

                  {/* Main amount line */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] sm:text-sm font-semibold uppercase tracking-wider text-neutral-400 whitespace-nowrap">
                        Por apenas
                      </span>
                      <span className="font-display text-3xl sm:text-5xl font-black text-white whitespace-nowrap tracking-tight">
                        {TECHIFY_PACKAGES[1].currentPrice}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium sm:text-right">
                      Ideal para começar a vender online
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal mb-4 sm:mb-6">
                  {TECHIFY_PACKAGES[1].description}
                </p>

                {/* Structure Highlight Badge */}
                <div className="mb-4 sm:mb-6 flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-300 text-xs font-semibold">
                  <Zap className="h-4 w-4 shrink-0 text-[#22c55e]" />
                  <span>
                    <strong>Foco em Vendas:</strong> Site veloz estruturado para converter visitantes em mensagens no seu WhatsApp.
                  </span>
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-2.5 pt-2 border-t border-neutral-800">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-neutral-500 block mb-1.5">
                    O que está incluso no pacote:
                  </span>
                  {TECHIFY_PACKAGES[1].features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                      <div className="h-4 w-4 rounded-full bg-neutral-800 text-[#4ade80] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-800 flex flex-col gap-2">
                <button
                  onClick={() => handleSelectPackage(TECHIFY_PACKAGES[1])}
                  className="w-full flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  <span>CONTRATAR SITE + MARKETING POR R$ 350</span>
                  <ArrowRight className="h-4 w-4 text-[#22c55e]" />
                </button>

                <p className="text-center text-[10px] sm:text-[11px] text-neutral-500">
                  ✓ Configuração rápida • Suporte técnico dedicado
                </p>
              </div>

            </div>
          </ScrollReveal>

        </div>

        {/* FREE TRIAL STEP CALLOUT */}
        <ScrollReveal threshold={0.2} delay={0.15}>
          <div className="mt-16 max-w-4xl mx-auto rounded-3xl border border-neutral-800 bg-gradient-to-r from-[#090e0a] via-[#050805] to-[#090e0a] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
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
