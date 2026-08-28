import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Layers, 
  Sparkles, 
  Film, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Flame,
  Gauge
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export interface ProductionStep {
  number: string;
  stepLabel: string;
  tag: string;
  title: string;
  description: string;
  focusLabel: string;
  focusValue: string;
  icon: React.ElementType;
  badgeColor: string;
  metrics: { label: string; value: string };
  deliverables: string[];
}

export const PRODUCTION_STEPS: ProductionStep[] = [
  {
    number: '01',
    stepLabel: 'ETAPA 1/5',
    tag: 'PRÉ-PRODUÇÃO ESTRATÉGICA',
    title: 'Roteiro & Storyboard',
    description: 'Mapeamos o objetivo comercial, redigimos o roteiro persuasivo e desenhamos o storyboard quadro a quadro para garantir narrativa clara e retenção máxima.',
    focusLabel: 'Foco Principal:',
    focusValue: 'Estratégia de Conversão & Storytelling',
    icon: FileText,
    badgeColor: '#22c55e',
    metrics: { label: 'Retenção Estimada', value: '+85%' },
    deliverables: ['Briefing Estratégico', 'Copy Persuasiva', 'Storyboard Quadro a Quadro']
  },
  {
    number: '02',
    stepLabel: 'ETAPA 2/5',
    tag: 'DESIGN & MODELAGEM',
    title: 'Criação de Assets',
    description: 'Desenvolvimento de ilustrações vetoriais exclusivas, modelagem 3D com malhas limpas, tipografias customizadas e curadoria de materiais de alto padrão.',
    focusLabel: 'Foco Principal:',
    focusValue: 'Estética Autoral & Resolução 4K',
    icon: Layers,
    badgeColor: '#4ade80',
    metrics: { label: 'Fidelidade Visual', value: '4K Ultra HD' },
    deliverables: ['Modelagem Vetorial/3D', 'Paleta & Shaders', 'Tipografia Custom']
  },
  {
    number: '03',
    stepLabel: 'ETAPA 3/5',
    tag: 'CINEMÁTICA & FÍSICA',
    title: 'Animação & Rigging',
    description: 'Aplicação de princípios clássicos de animação adaptados para UI moderna: easing suave, gravidade, inércia, deformação elástica e timing milimétrico.',
    focusLabel: 'Foco Principal:',
    focusValue: '60 FPS Fluido & Naturalidade',
    icon: Sparkles,
    badgeColor: '#a3e635',
    metrics: { label: 'Taxa de Quadros', value: '60 FPS Nativo' },
    deliverables: ['Rigging Avançado', 'Curvas de Easing', 'Física de Inércia']
  },
  {
    number: '04',
    stepLabel: 'ETAPA 4/5',
    tag: 'PÓS-PRODUÇÃO & SFX',
    title: 'Compositing & Audio',
    description: 'Tratamento de luz, lens flares sutis, profundidade de campo, color grading cinematográfico e sound design com efeitos sonoros que estimulam o toque.',
    focusLabel: 'Foco Principal:',
    focusValue: 'Imersão Sensorial Completa',
    icon: Film,
    badgeColor: '#22c55e',
    metrics: { label: 'Impacto Perceptivo', value: 'Cinematográfico' },
    deliverables: ['Color Grading', 'Sound Design SFX', 'Iluminação & Flare']
  },
  {
    number: '05',
    stepLabel: 'ETAPA 5/5',
    tag: 'ENGENHARIA DE ENTREGA',
    title: 'Entrega & Integração',
    description: 'Exportação nos formatos ideais (Lottie JSON, Rive .riv, WebM transparente, ProRes 4444 e MP4 H.265) prontos para colar no seu site, app ou campanha.',
    focusLabel: 'Foco Principal:',
    focusValue: 'Zero Perda de Qualidade & Performance',
    icon: Cpu,
    badgeColor: '#4ade80',
    metrics: { label: 'Tempo de Carregamento', value: '<0.3s Leve' },
    deliverables: ['Lottie / Rive / WebM', 'ProRes 4444 & H.265', 'Integração Web Pronta']
  }
];

interface ProductionProcessSectionProps {
  onOpenConsultation?: (serviceName?: string) => void;
}

export default function ProductionProcessSection({ onOpenConsultation }: ProductionProcessSectionProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Auto-cycle through steps if user hasn't actively locked onto one
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % PRODUCTION_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentStep = PRODUCTION_STEPS[activeStepIndex];

  return (
    <section 
      id="como-funciona-producao" 
      className="relative w-full py-24 sm:py-32 bg-black border-y border-neutral-900/90 overflow-hidden"
    >
      {/* Background Animated Tech Grid & Ambient Flares */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1118110a_1px,transparent_1px),linear-gradient(to_bottom,#1118110a_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 pointer-events-none" />
      
      {/* Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_70%)] blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.05),transparent_70%)] blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal threshold={0.15}>
          <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white max-w-4xl tracking-tight leading-[1.15]">
              Como Funciona Nossa Produção
            </h2>
            <p className="mt-4 max-w-3xl text-sm sm:text-base md:text-lg text-neutral-400 leading-relaxed font-normal">
              Do roteiro à exportação pronta para os navegadores: processo transparente com validações constantes para zero refação e máximo impacto.
            </p>

            {/* Interactive Progress Bar across 5 steps */}
            <div className="mt-10 flex items-center justify-center gap-2 sm:gap-4 w-full max-w-2xl px-2">
              {PRODUCTION_STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isPassed = activeStepIndex > idx;
                return (
                  <button
                    key={step.number}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setIsAutoPlaying(false);
                    }}
                    aria-label={`Ir para etapa ${step.number}`}
                    className="group relative flex-1 flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden relative mb-2">
                      {isActive && (
                        <motion.div
                          layoutId="activeProgressBar"
                          className="h-full bg-gradient-to-r from-[#22c55e] to-[#a3e635] rounded-full shadow-[0_0_12px_#22c55e]"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: isAutoPlaying ? 4.5 : 0.4, ease: 'linear' }}
                        />
                      )}
                      {isPassed && (
                        <div className="h-full w-full bg-[#22c55e]/60 rounded-full" />
                      )}
                    </div>
                    <span className={`text-[10px] font-mono font-bold transition-colors ${
                      isActive ? 'text-[#4ade80]' : isPassed ? 'text-neutral-400' : 'text-neutral-600'
                    }`}>
                      {step.number}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* 5-Card Production Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {PRODUCTION_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const StepIcon = step.icon;

            return (
              <ScrollReveal key={step.number} delay={idx * 0.08} yOffset={25}>
                <div
                  onClick={() => {
                    setActiveStepIndex(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 cursor-pointer h-full select-none ${
                    isActive 
                      ? 'border-[#22c55e] bg-[#071308]/90 shadow-[0_0_35px_rgba(34,197,94,0.22)] ring-1 ring-[#22c55e]/40' 
                      : 'border-neutral-850 bg-[#080a08]/80 hover:border-neutral-700 hover:bg-[#0b0f0b]'
                  }`}
                >
                  {/* Top Neon Step Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`h-8 px-3 rounded-lg flex items-center justify-center font-mono text-xs font-black transition-all ${
                      isActive
                        ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.6)]'
                        : 'bg-neutral-900/90 text-neutral-300 border border-neutral-800 group-hover:border-neutral-700'
                    }`}>
                      {step.number}
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      isActive ? 'text-[#4ade80]' : 'text-neutral-500'
                    }`}>
                      {step.stepLabel}
                    </span>
                  </div>

                  {/* Tag & Title */}
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#a3e635] block mb-1">
                      {step.tag}
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-white group-hover:text-[#4ade80] transition-colors leading-tight mb-3">
                      {step.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Focus Box */}
                  <div className="mt-6 pt-4 border-t border-neutral-900/90">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block">
                      {step.focusLabel}
                    </span>
                    <p className="text-xs font-bold text-neutral-200 mt-0.5 leading-snug">
                      {step.focusValue}
                    </p>
                  </div>

                  {/* Active Indicator Glow Corner */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e] animate-ping" />
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
