import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Sparkles, 
  ArrowUpRight, 
  Activity, 
  Target,
  Layers,
  Clock,
  Shield
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { TechifyIcon } from './TechifyLogo';

interface SpecialtyBentoSectionProps {
  onOpenConsultation?: (serviceName?: string) => void;
}

export default function SpecialtyBentoSection({ onOpenConsultation }: SpecialtyBentoSectionProps) {
  // Interactive state for Bar Chart (Card 2)
  const [activeYear, setActiveYear] = useState<string>('2026');

  const chartData = [
    { year: '2021', rate: '+15%', h: '28%', desc: 'Crescimento base inicial' },
    { year: '2022', rate: '+38%', h: '42%', desc: 'Otimização de páginas' },
    { year: '2023', rate: '+65%', h: '62%', desc: 'Primeiras automações' },
    { year: '2024', rate: '+92%', h: '78%', desc: 'Tráfego unificado' },
    { year: '2025', rate: '+118%', h: '90%', desc: 'Escala acelerada' },
    { year: '2026', rate: '+142%', h: '100%', active: true, desc: 'Ecossistema Techify 360°' },
  ];

  const activeChartItem = chartData.find(d => d.year === activeYear) || chartData[5];

  // Interactive state for Pills (Card 3)
  const [hoveredPill, setHoveredPill] = useState<number | null>(null);

  const pills = [
    { title: 'Preço fechado', desc: 'Sem surpresas no orçamento' },
    { title: 'Prazo por escrito', desc: 'Entrega na data estipulada' },
    { title: 'Suporte pós-entrega', desc: 'Acompanhamento constante' },
    { title: 'Sem fidelidade', desc: 'Contratos justos e flexíveis' },
    { title: 'Aparece no Google', desc: 'SEO técnico de ponta' },
    { title: 'Sem dor de cabeça', desc: 'Gestão 100% resolutiva' }
  ];

  return (
    <section className="relative w-full py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <ScrollReveal threshold={0.2}>
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-bold text-neutral-300 mb-6">
            <div className="h-1.5 w-1.5 rounded-sm bg-[#22c55e] animate-pulse" />
            <span>Especialidade</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white max-w-4xl leading-[1.15] tracking-tight">
            Cansado de contratar um profissional para cada coisa?
          </h2>

          <p className="mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-400 leading-relaxed font-normal">
            Um faz o site, outro some com a senha, um terceiro cuida do anúncio e ninguém se entende. Na Techify é um time completo, do começo ao fim, com alguém de prontidão para te atender.
          </p>
        </div>
      </ScrollReveal>

      {/* 2x2 High-Performance Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* ========================================================================= */}
        {/* CARD 1: Menos trabalho na mão (Mockup financeiro animado com live stream)   */}
        {/* ========================================================================= */}
        <ScrollReveal delay={0.1} yOffset={30}>
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl border border-neutral-800/90 bg-[#080a08]/90 p-6 sm:p-8 flex flex-col justify-between h-full hover:border-[#22c55e]/50 hover:bg-[#0b0f0b] transition-all duration-300 shadow-2xl overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_70%)] pointer-events-none" />

            <div>
              {/* Financial Automated Card Mockup */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 mb-8 shadow-inner relative overflow-hidden group-hover:border-[#22c55e]/30 transition-all">
                
                {/* Header row */}
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                    </span>
                    <span className="font-semibold text-neutral-300">Cobrança mensal automatizada</span>
                  </div>
                  <span className="text-[#22c55e] font-mono font-bold">R$ 4.900 / R$ 10.000</span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden mb-5 relative">
                  <motion.div 
                    initial={{ width: '0%' }}
                    whileInView={{ width: '49%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#a3e635] rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)] relative"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[1px] animate-pulse" />
                  </motion.div>
                </div>

                {/* List of automated entries */}
                <div className="space-y-2.5">
                  {[
                    { name: 'Plano Pro Anual', date: 'Hoje às 14:32', val: 'R$ 1.200', tag: 'Aprovado' },
                    { name: 'Licença Corporativa', date: 'Ontem às 18:10', val: 'R$ 2.450', tag: 'Automático' },
                    { name: 'Manutenção Mensal', date: '12 de Agosto', val: 'R$ 850', tag: 'Recorrente' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 * i, duration: 0.4 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(23, 37, 24, 0.5)' }}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/60 text-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center border border-[#22c55e]/20">
                          <Check className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[10px] text-neutral-500">{item.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#4ade80] block">{item.val}</span>
                        <span className="text-[9px] font-mono text-[#a3e635]/80 uppercase">{item.tag}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                Menos trabalho na mão
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                Tarefa repetida no manual consome o dia do seu time. Automatizamos processos para sobrar tempo para o que realmente importa: vender.
              </p>
            </div>
          </motion.div>
        </ScrollReveal>


        {/* ========================================================================= */}
        {/* CARD 2: Site e loja virtual (Bar chart interativo com escala temporal)      */}
        {/* ========================================================================= */}
        <ScrollReveal delay={0.2} yOffset={30}>
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl border border-neutral-800/90 bg-[#080a08]/90 p-6 sm:p-8 flex flex-col justify-between h-full hover:border-[#22c55e]/50 hover:bg-[#0b0f0b] transition-all duration-300 shadow-2xl overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_70%)] pointer-events-none" />

            <div>
              {/* Visual Growth Chart */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 mb-8 flex flex-col justify-between min-h-[235px] relative group-hover:border-[#22c55e]/30 transition-all">
                
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Você sabe de onde vem cada venda?</span>
                    <span className="text-[10px] text-neutral-400">{activeChartItem.desc}</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#4ade80] font-mono font-bold shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    {activeChartItem.rate} conversão
                  </span>
                </div>

                {/* Bar Growth Visualization with Interactive Physics */}
                <div className="flex items-end justify-between gap-2.5 h-28 pt-4">
                  {chartData.map((bar) => {
                    const isSelected = activeYear === bar.year;
                    return (
                      <button
                        key={bar.year}
                        onClick={() => setActiveYear(bar.year)}
                        onMouseEnter={() => setActiveYear(bar.year)}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar focus:outline-none cursor-pointer"
                      >
                        <motion.div 
                          initial={{ height: '0%' }}
                          whileInView={{ height: bar.h }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`w-full rounded-lg transition-all duration-300 relative ${
                            isSelected 
                              ? 'bg-gradient-to-t from-[#15803d] to-[#22c55e] shadow-[0_0_18px_#22c55e] ring-1 ring-white/30' 
                              : 'bg-neutral-850 hover:bg-neutral-750'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
                          )}
                        </motion.div>
                        <span className={`text-[10px] font-mono transition-colors ${
                          isSelected ? 'text-[#4ade80] font-bold' : 'text-neutral-500 group-hover/bar:text-neutral-300'
                        }`}>
                          {bar.year}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 text-[11px] font-medium text-neutral-300 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80 flex items-center justify-between">
                  <span>Estratégia, Design e Tecnologia de ponta unificados.</span>
                  <Sparkles className="h-3.5 w-3.5 text-[#22c55e] shrink-0" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                Site e loja virtual
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                Sites e e-commerces que carregam instantaneamente em qualquer celular e aguentam o crescimento acelerado do seu negócio sem travar.
              </p>
            </div>
          </motion.div>
        </ScrollReveal>


        {/* ========================================================================= */}
        {/* CARD 3: Sistema de gestão sob medida (Live stats + Pills dinâmicas)         */}
        {/* ========================================================================= */}
        <ScrollReveal delay={0.1} yOffset={30}>
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl border border-neutral-800/90 bg-[#080a08]/90 p-6 sm:p-8 flex flex-col justify-between h-full hover:border-[#22c55e]/50 hover:bg-[#0b0f0b] transition-all duration-300 shadow-2xl overflow-hidden"
          >
            <div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 mb-8 group-hover:border-[#22c55e]/30 transition-all">
                
                {/* Metric Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-neutral-400 font-medium">Desempenho Geral</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl sm:text-4xl font-black text-white font-mono">+49%</p>
                      <span className="text-xs text-[#4ade80] font-bold font-mono bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20">
                        +2.5% semana
                      </span>
                    </div>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <TrendingUp className="h-6 w-6 stroke-[2.5]" />
                  </div>
                </div>

                {/* Dynamic SVG Waveform Line */}
                <div className="w-full h-8 mb-4">
                  <svg className="w-full h-full" viewBox="0 0 300 40" fill="none" preserveAspectRatio="none">
                    <path
                      d="M0 35 Q 40 25, 80 30 T 160 15 T 240 20 T 300 5"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 35 Q 40 25, 80 30 T 160 15 T 240 20 T 300 5 L 300 40 L 0 40 Z"
                      fill="url(#green_gradient_wave)"
                      opacity="0.15"
                    />
                    <defs>
                      <linearGradient id="green_gradient_wave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Tag Badges Carousel / Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {pills.map((pill, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05, borderColor: '#22c55e' }}
                      onMouseEnter={() => setHoveredPill(idx)}
                      onMouseLeave={() => setHoveredPill(null)}
                      className="rounded-full bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5 cursor-pointer transition-colors hover:text-white hover:bg-neutral-850"
                    >
                      <Check className="h-3 w-3 text-[#22c55e] stroke-[2.5]" />
                      <span>{pill.title}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                Sistema de gestão sob medida
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                Estoque, vendas, mensalidades e clientes num lugar só, feito exatamente sob medida para as necessidades do seu negócio.
              </p>
            </div>
          </motion.div>
        </ScrollReveal>


        {/* ========================================================================= */}
        {/* CARD 4: Anúncio que traz cliente (Radar Orbit 360° com feixe rotativo)      */}
        {/* ========================================================================= */}
        <ScrollReveal delay={0.2} yOffset={30}>
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl border border-neutral-800/90 bg-[#080a08]/90 p-6 sm:p-8 flex flex-col justify-between h-full hover:border-[#22c55e]/50 hover:bg-[#0b0f0b] transition-all duration-300 shadow-2xl overflow-hidden"
          >
            <div>
              {/* Orbital Radar Visual with Rotating Scanner Beam */}
              <div className="relative h-60 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 mb-8 flex items-center justify-center overflow-hidden group-hover:border-[#22c55e]/30 transition-all">
                
                {/* Tech Grid Background */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e291e_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

                {/* Concentric Rings */}
                <div className="absolute w-52 h-52 rounded-full border border-neutral-800/70" />
                <div className="absolute w-36 h-36 rounded-full border border-[#22c55e]/20" />
                <div className="absolute w-20 h-20 rounded-full border border-[#22c55e]/30" />

                {/* Rotating Radar Scanner Beam (360° Motion) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                  className="absolute w-52 h-52 pointer-events-none"
                  style={{ transformOrigin: 'center center' }}
                >
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#22c55e]/40 via-[#22c55e]/10 to-transparent rounded-tl-full" />
                </motion.div>

                {/* Center Core Logo with Pulsing Glow */}
                <div className="relative z-10 h-14 w-14 rounded-full bg-black border-2 border-[#22c55e] p-2.5 flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.5)]">
                  <TechifyIcon className="h-full w-full" />
                  <div className="absolute inset-0 rounded-full bg-[#22c55e]/20 animate-ping" />
                </div>

                {/* Floating Lead Pills with Live Micro Ping */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="absolute top-4 left-4 flex items-center gap-2 bg-neutral-900/95 border border-neutral-700/80 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-xl backdrop-blur-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                  </span>
                  <span>Alexandre H. <strong className="text-[#4ade80] font-mono">+6%</strong></span>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-4 right-4 flex items-center gap-2 bg-neutral-900/95 border border-neutral-700/80 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-xl backdrop-blur-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3e635] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a3e635]" />
                  </span>
                  <span>Raimundo P. <strong className="text-[#a3e635] font-mono">+4.5%</strong></span>
                </motion.div>

                {/* Third dynamic lead node */}
                <motion.div 
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="absolute top-6 right-6 flex items-center gap-1.5 bg-[#051a08]/90 border border-[#22c55e]/40 px-2 py-0.5 rounded-full text-[10px] font-mono text-[#86efac]"
                >
                  <Zap className="h-2.5 w-2.5 text-[#22c55e]" />
                  <span>Google Ads Live</span>
                </motion.div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                Anúncio que traz cliente
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                Anúncios estratégicos no Google e Instagram para o cliente certo achar sua empresa exatamente na hora em que está buscando comprar.
              </p>
            </div>
          </motion.div>
        </ScrollReveal>

      </div>
    </section>
  );
}
