import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  Users, 
  Globe, 
  Code, 
  Layers, 
  Sparkles, 
  Check, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
  Monitor,
  Camera,
  Pencil,
  Clock,
  Zap,
  Target,
  Award,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Lock,
  Headphones,
  FileCheck
} from 'lucide-react';
import { TechifyIcon } from './TechifyLogo';
import { 
  TeamMember, 
  SiteGeneralContent, 
  DEFAULT_TEAM_MEMBERS, 
  DEFAULT_SITE_CONTENT,
  getCachedTeamMembers,
  getCachedGeneralContent
} from '../lib/siteContent';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EditableText, EditableImage } from './InlineEditProvider';
import ScrollReveal from './ScrollReveal';

interface AboutSectionProps {
  onNavigate?: (tab: string) => void;
  onOpenConsultation?: (serviceName?: string) => void;
}

export default function AboutSection({ onNavigate, onOpenConsultation }: AboutSectionProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(getCachedTeamMembers);
  const [generalContent, setGeneralContent] = useState<SiteGeneralContent>(getCachedGeneralContent);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubTeam = onSnapshot(doc(db, "site_content", "team"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.members) && data.members.length > 0) {
          setTeamMembers(data.members);
        }
      }
    }, (err) => console.warn('Firestore team offline:', err.message));

    const unsubGeneral = onSnapshot(doc(db, "site_content", "general"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteGeneralContent>;
        setGeneralContent(prev => ({ ...prev, ...data }));
      }
    }, (err) => console.warn('Firestore content offline:', err.message));

    const handleTeamUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<TeamMember[]>;
      if (customEvt.detail) setTeamMembers(customEvt.detail);
    };

    const handleContentUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<SiteGeneralContent>;
      if (customEvt.detail) setGeneralContent(customEvt.detail);
    };

    window.addEventListener('techify-team-updated', handleTeamUpdate);
    window.addEventListener('techify-content-updated', handleContentUpdate);

    return () => {
      unsubTeam();
      unsubGeneral();
      window.removeEventListener('techify-team-updated', handleTeamUpdate);
      window.removeEventListener('techify-content-updated', handleContentUpdate);
    };
  }, []);

  const corePillars = [
    {
      icon: MessageCircle,
      title: "Zero Termo Técnico",
      description: "Falamos a língua do seu negócio. Traduzimos código, infraestrutura e métricas em termos de lucro, vendas e processos claros.",
      tag: "Comunicação Clara"
    },
    {
      icon: FileCheck,
      title: "Preço Fechado & Prazo por Escrito",
      description: "Sem surpresas no orçamento ou adiamentos indeterminados. Cada etapa é documentada e entregue com cronograma rigoroso.",
      tag: "Compromisso Real"
    },
    {
      icon: Cpu,
      title: "Engenharia 360° Autoral",
      description: "Sites ultrarrápidos, sistemas escaláveis e anúncios de conversão criados sob medida para o seu público, sem templates genéricos.",
      tag: "Alta Performance"
    },
    {
      icon: Headphones,
      title: "Suporte com Quem Fez",
      description: "Quando precisar de ajustes ou tirar dúvidas, você fala diretamente com nosso time sênior de engenharia e design, de prontidão.",
      tag: "Prontidão Total"
    }
  ];

  const methodologySteps = [
    {
      number: "01",
      title: "Diagnóstico & Raio-X Comercial",
      description: "Mapeamos exatamente o gargalo que está travando o crescimento da sua empresa: se é falta de presença, processo manual ou tráfego ineficiente.",
      badge: "Estratégia"
    },
    {
      number: "02",
      title: "Prototipagem & Validação Visual",
      description: "Desenhamos as interfaces, fluxo de usuário e esteiras de conversão. Você aprova visualmente cada detalhe antes do desenvolvimento.",
      badge: "Design & UX"
    },
    {
      number: "03",
      title: "Engenharia Ágil & Integrações",
      description: "Construção com as tecnologias mais modernas da atualidade, segurança em nuvem, integrações de pagamento e SEO técnico avançado.",
      badge: "Desenvolvimento"
    },
    {
      number: "04",
      title: "Go-Live, Treinamento & Escala",
      description: "Publicação assistida, entrega dos acessos integrais, treinamento completo para seu time e monitoramento contínuo das métricas.",
      badge: "Lançamento"
    }
  ];

  const faqs = [
    {
      question: "Como a Techify garante o cumprimento dos prazos?",
      answer: "Trabalhamos com metodologia de sprints curtas e cronograma contratual com datas fixas de validação. Antes de iniciar qualquer projeto, definimos o escopo fechado e as entregas parciais por escrito."
    },
    {
      question: "Quem é o dono do código, domínio e acessos após a entrega?",
      answer: "Você tem 100% de propriedade sobre o código, banco de dados, domínio e campanhas. Não prendemos nossos clientes em contratos com pegadinhas ou códigos proprietários fechados."
    },
    {
      question: "Vocês atendem empresas de qualquer tamanho ou segmento?",
      answer: "Sim. Nossas soluções são modulares e personalizadas, atendendo desde profissionais liberais e negócios locais que precisam dominar o Google até empresas em franca expansão que precisam de sistemas complexos."
    },
    {
      question: "Como funciona o suporte e manutenção após o lançamento?",
      answer: "Oferecemos garantia pós-entrega inclusa em todos os projetos e planos de acompanhamento contínuo para manter seu site, sistema ou anúncios sempre atualizados, rápidos e seguros."
    },
    {
      question: "Qual o diferencial da Techify em relação a agências tradicionais?",
      answer: "Unificamos o ciclo completo: enquanto a maioria das agências terceiriza o desenvolvimento ou o tráfego gerando desencontro de informações, a Techify entrega design, tecnologia e marketing em um único time sênior integrado."
    }
  ];

  return (
    <div className="relative w-full overflow-hidden bg-black text-white selection:bg-[#22c55e]/30 selection:text-white">
      
      {/* Background Ambient Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1118110a_1px,transparent_1px),linear-gradient(to_bottom,#1118110a_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_70%)] blur-[100px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. HERO SPLIT SECTION (Visual de Alto Impacto com Mockups Holográficos)     */}
      {/* ========================================================================= */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 sm:pt-14 sm:pb-24">
        
        {/* Navigation Breadcrumb / Top Tag */}
        <div className="flex items-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-bold text-neutral-300">
            <div className="h-1.5 w-1.5 rounded-sm bg-[#22c55e] animate-pulse" />
            <span>Sobre a Techify</span>
          </div>
          <span className="text-xs text-neutral-500 font-mono">/ Engenharia & Design de Alta Conversão</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column (6 cols): Copy, Proposta de Valor & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#090d09] to-[#050805] border border-neutral-800/90 p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl">
            
            {/* Ambient subtle glow */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.15] tracking-tight"
              >
                Você não precisa entender de tecnologia. <br className="hidden sm:block" />
                <span className="text-[#4ade80]">Precisa de resultado.</span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 text-sm sm:text-base text-neutral-300 leading-relaxed font-normal max-w-lg"
              >
                A gente traduz. Você diz o que está travando o seu negócio e a gente resolve com site, sistema ou anúncio, explicando cada passo sem termo técnico e com foco obsessivo em vendas.
              </motion.p>

              {/* Quality Checklist Badges */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-neutral-900">
                {[
                  "Prazo garantido por contrato",
                  "Código limpo sem travar",
                  "Design 100% autoral",
                  "Apareça no topo do Google"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                    <div className="h-4 w-4 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => onOpenConsultation?.('sobre_nos')}
                className="group relative inline-flex items-center gap-3 rounded-full bg-[#22c55e] hover:bg-[#16a34a] px-7 py-3.5 text-xs sm:text-sm font-black tracking-wide text-black transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] cursor-pointer"
              >
                <span>QUERO APARECER PRIMEIRO</span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              </button>

              <button
                onClick={() => {
                  const target = document.getElementById('nossos-pilares');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer"
              >
                <span>CONHECER NOSSO MÉTODO</span>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>
            </motion.div>

          </div>

          {/* Right Column (6 cols): Office Photo with Floating 3D Holographic UI Cards */}
          <div className="lg:col-span-6 relative min-h-[440px] sm:min-h-[500px] rounded-3xl overflow-hidden border border-neutral-800/90 shadow-2xl bg-neutral-950 flex flex-col justify-end">
            
            {/* Background Office Photo */}
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
              alt="Equipe Techify em Reunião" 
              className="absolute inset-0 h-full w-full object-cover brightness-[0.80] contrast-[1.05]"
            />
            
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none" />

            {/* Floating Glassmorphic 3D Card: Especialidade (Top Left) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-8 left-6 sm:left-8 rounded-2xl bg-black/85 backdrop-blur-xl border border-neutral-700/80 p-4 shadow-2xl max-w-[210px] select-none"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-white">Especialidade 360°</span>
                <div className="h-4 w-4 rounded-full bg-[#22c55e] flex items-center justify-center text-[9px] text-black font-black">
                  ✓
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 leading-snug">
                União de <strong className="text-white">Estratégia</strong>, <strong className="text-white">Design Autoral</strong> e <strong className="text-[#4ade80]">Tecnologia</strong> de ponta.
              </p>
            </motion.div>

            {/* Floating Glassmorphic 3D Card: Cobrança Mensal R$ 4.900 / R$ 10.000 (Bottom Right) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-10 m-6 sm:m-8 rounded-2xl bg-neutral-950/95 text-white backdrop-blur-xl border border-neutral-700/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-sm select-none"
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="font-semibold text-neutral-300">Cobrança mensal automatizada</span>
                <span className="text-[#22c55e] font-mono font-bold">R$ 4.900 / R$ 10.000</span>
              </div>

              {/* Progress */}
              <div className="w-full h-2 rounded-full bg-neutral-850 overflow-hidden mb-3.5">
                <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#a3e635] rounded-full w-[49%] shadow-[0_0_10px_#22c55e]" />
              </div>

              {/* Mini entries */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                    <span className="font-bold text-white">Plano Pro Anual</span>
                  </div>
                  <span className="font-mono font-bold text-[#4ade80]">R$ 1.200</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                    <span className="font-bold text-white">Licença Corporativa</span>
                  </div>
                  <span className="font-mono font-bold text-[#4ade80]">R$ 2.450</span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. STATS COUNTER STRIP (Números de Impacto e Autoridade)                  */}
      {/* ========================================================================= */}
      <section className="relative w-full py-12 border-y border-neutral-900 bg-[#060806]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { val: "120+", label: "Projetos Entregues", sub: "100% validados e no ar", icon: Award },
              { val: "100%", label: "Cumprimento de Prazo", sub: "Garantia formal por contrato", icon: Clock },
              { val: "40+", label: "Sistemas & Apps Ativos", sub: "Operando em alta escala", icon: Cpu },
              { val: "99.4%", label: "Taxa de Satisfação", sub: "Avaliações 5 estrelas", icon: Sparkles },
            ].map((stat, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.08}>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-900 hover:border-neutral-800 transition-colors">
                  <div className="h-11 w-11 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center shrink-0">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {stat.val}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-200 mt-0.5">
                      {stat.label}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {stat.sub}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. MANIFESTO HEADLINE (A empresa digital dedicada a criar...)             */}
      {/* ========================================================================= */}
      <section className="relative w-full py-20 sm:py-28 bg-[#040604] border-b border-neutral-900/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <ScrollReveal threshold={0.15}>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-bold text-neutral-300 mb-6">
              <div className="h-1.5 w-1.5 rounded-sm bg-[#22c55e]" />
              <span>Manifesto Techify</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] tracking-tight">
              A empresa digital dedicada a criar sistemas, sites{' '}
              <span className="inline-flex items-center align-middle mx-1 text-[#22c55e]">
                <span className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-[#22c55e]/20 border border-[#22c55e] inline-flex items-center justify-center text-xs">
                  ⚡
                </span>
              </span>{' '}
              e <br />
              <span className="text-[#22c55e]">marketing</span>{' '}
              <span className="inline-flex items-center align-middle mx-1">
                <span className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-[#22c55e] inline-flex items-center justify-center text-black font-bold text-xs">
                  💡
                </span>
              </span>{' '}
              sob medida
            </h2>

            <p className="mt-8 max-w-3xl text-sm sm:text-base md:text-lg text-neutral-400 leading-relaxed font-normal mx-auto">
              Nascemos para extinguir o estresse de contratar múltiplos profissionais que não se conversam. Na Techify, sua empresa tem um time unificado que cuida da concepção estratégica, da engenharia de código e da aquisição de clientes.
            </p>
          </ScrollReveal>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. NOSSOS PILARES E VALORES (4 Blocos de Diferenciais Inegociáveis)        */}
      {/* ========================================================================= */}
      <section id="nossos-pilares" className="relative w-full py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <ScrollReveal threshold={0.15}>
          <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-bold text-neutral-300 mb-4">
              <div className="h-1.5 w-1.5 rounded-sm bg-[#22c55e]" />
              <span>Cultura & Princípios</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
              Os 4 Pilares Inegociáveis da Techify
            </h2>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-400">
              O que nos diferencia de agências amadoras e desenvolvedores que somem no meio do projeto.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {corePillars.map((pillar, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.1} yOffset={25}>
              <div className="group relative rounded-3xl border border-neutral-850 bg-[#080b08]/90 p-8 flex flex-col justify-between h-full hover:border-[#22c55e]/50 hover:bg-[#0b100b] transition-all duration-300 shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <pillar.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#a3e635] bg-[#a3e635]/10 px-3 py-1 rounded-full border border-[#a3e635]/20">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-[#4ade80] transition-colors mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center gap-2 text-xs font-semibold text-[#22c55e]">
                  <span>Padrão Techify de Excelência</span>
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 5. METODOLOGIA DE ENTREGA (Como Trabalhamos Passo a Passo)                 */}
      {/* ========================================================================= */}
      <section className="relative w-full py-24 sm:py-32 bg-[#050705] border-y border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal threshold={0.15}>
            <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-bold text-neutral-300 mb-4">
                <div className="h-1.5 w-1.5 rounded-sm bg-[#22c55e]" />
                <span>Metodologia</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
                Como Transformamos Sua Ideia em Faturamento
              </h2>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-400">
                Processo estruturado com validações constantes para garantir entrega no prazo e sem retrabalho.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodologySteps.map((step, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1} yOffset={25}>
                <div className="rounded-3xl border border-neutral-850 bg-neutral-950 p-6 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#22c55e]/40 transition-all">
                  
                  {/* Step Number Watermark */}
                  <span className="absolute top-4 right-4 font-mono text-3xl font-black text-neutral-900 group-hover:text-[#22c55e]/20 transition-colors">
                    {step.number}
                  </span>

                  <div>
                    <div className="inline-block px-2.5 py-1 rounded-md bg-neutral-900 text-[#4ade80] text-[10px] font-mono font-bold uppercase mb-4 border border-neutral-800">
                      {step.badge}
                    </div>

                    <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    <span>Etapa {step.number} de 04</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. CONHEÇA NOSSO TIME (Cards dos Membros com Suporte a Edição Inline)      */}
      {/* ========================================================================= */}
      <section className="relative w-full py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-bold text-neutral-300 mb-4">
            <div className="h-1.5 w-1.5 rounded-sm bg-[#22c55e]" />
            <span>Time Executivo</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white">
                Conheça quem faz acontecer
              </h2>
              <p className="mt-2 text-sm sm:text-base text-neutral-400">
                Especialistas seniores focados em design, engenharia de sistemas e estratégias de aquisição.
              </p>
            </div>

            <button
              onClick={() => onOpenConsultation?.('time')}
              className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-6 py-3 text-xs font-bold text-white transition-all cursor-pointer w-fit shrink-0 shadow-lg"
            >
              <span>FALE COM NOSSO TIME</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e] text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
              </div>
            </button>
          </div>
        </div>

        {/* 4 Team Member Cards with Full Inline Editing & Responsive Imagery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.id || idx}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)', scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.65, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-3xl border border-neutral-850 bg-[#090b09] p-5 flex flex-col justify-between hover:border-[#22c55e]/50 hover:bg-[#0c120c] transition-all duration-300 shadow-xl"
            >
              <div>
                {/* Large Portrait Image Container */}
                <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-neutral-900 border border-neutral-800/80 overflow-hidden mb-4 shadow-lg group-hover:border-[#22c55e]/40 transition-all">
                  <EditableImage
                    id={`team_avatar_${member.id || idx}`}
                    defaultSrc={member.avatar}
                    alt={member.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    title={`Foto de ${member.name}`}
                  />
                  
                  {/* Gradient Vignette at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Corner Action Badge */}
                  <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 border border-neutral-700 text-neutral-300 backdrop-blur-sm group-hover:text-[#4ade80] group-hover:border-[#22c55e]/50 transition-all">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#4ade80] transition-colors leading-snug">
                      <EditableText
                        id={`team_name_${member.id || idx}`}
                        defaultText={member.name}
                        title={`Nome: ${member.name}`}
                      />
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-[#a3e635]">
                      <EditableText
                        id={`team_role_${member.id || idx}`}
                        defaultText={member.role}
                        title={`Cargo: ${member.name}`}
                      />
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-900/80">
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  <EditableText
                    id={`team_desc_${member.id || idx}`}
                    defaultText={member.description}
                    title={`Bio: ${member.name}`}
                    isMultiline={true}
                  />
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 7. FAQ INSTITUCIONAL SOBRE A TECHIFY                                      */}
      {/* ========================================================================= */}
      <section className="relative w-full py-20 sm:py-28 bg-[#060806] border-t border-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal threshold={0.15}>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-bold text-neutral-300 mb-4">
                <HelpCircle className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>Perguntas Frequentes</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
                Dúvidas comuns sobre como a Techify trabalha
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <ScrollReveal key={idx} delay={idx * 0.05}>
                  <div className="rounded-2xl border border-neutral-850 bg-neutral-950 overflow-hidden transition-colors hover:border-neutral-700">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    >
                      <span className="font-display text-sm sm:text-base font-bold text-white">
                        {faq.question}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-[#22c55e] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-900 pt-3">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. BANNER FINAL DE CONVERSÃO & CONTATO (Enquanto você decide...)           */}
      {/* ========================================================================= */}
      <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0a140a] via-[#050905] to-black p-8 sm:p-14 lg:p-16 shadow-2xl">
          
          {/* Decorative Glows & Grid */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,#22c55e,transparent_60%)] pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            
            <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3.5 py-1 text-xs font-bold text-[#4ade80] mb-6">
              <Zap className="h-3.5 w-3.5" />
              <span>Acelere o Crescimento do Seu Negócio</span>
            </div>

            {/* Title */}
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Enquanto você decide, <br />
              <span className="text-neutral-400">o cliente compra do concorrente</span>
            </h2>

            {/* Paragraph */}
            <p className="mt-6 text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl font-normal">
              Cada dia sem site e sem anúncio é venda indo para outro. A Techify coloca o seu negócio na frente, com preço fechado antes de começar e prazo combinado por escrito.
            </p>

            {/* CTA Buttons & Guarantees */}
            <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
              <button
                onClick={() => onOpenConsultation?.('banner_final_sobre_nos')}
                className="group inline-flex items-center gap-3 rounded-full bg-[#22c55e] hover:bg-[#16a34a] px-8 py-4 text-xs sm:text-sm font-black tracking-wide text-black transition-all shadow-[0_0_35px_rgba(34,197,94,0.45)] cursor-pointer"
              >
                <span>QUERO APARECER PRIMEIRO</span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              </button>

              <div className="flex items-center gap-4 text-xs text-neutral-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                  Contrato seguro
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#22c55e]" />
                  Prazo pontual
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
