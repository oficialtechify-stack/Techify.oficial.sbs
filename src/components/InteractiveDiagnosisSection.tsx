import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Database, 
  Zap, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ArrowUpRight, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Check, 
  Send,
  Phone,
  User,
  AlertTriangle
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from './Toast';
import { DiagnosticoLead } from '../types';

interface OptionData {
  id: 'sem_site' | 'sem_sistema' | 'sem_anuncio' | 'todos_3';
  badge: string;
  title: string;
  subtitle: string;
  problemSummary: string;
  solutionTitle: string;
  solutionDescription: string;
  techifyDeliverables: string[];
  metricsHighlight: { label: string; value: string };
  ctaText: string;
  whatsappMessage: string;
  icon: React.ElementType;
}

const DIAGNOSIS_OPTIONS: OptionData[] = [
  {
    id: 'sem_site',
    badge: 'Visibilidade & Credibilidade',
    title: '1. Sem Site',
    subtitle: 'O cliente procura na internet e não me encontra',
    problemSummary: 'Sem site, o cliente não te acha. Ele pesquisa no Google ou Instagram, não vê sua empresa com autoridade e acaba comprando do seu concorrente que apareceu primeiro.',
    solutionTitle: 'Site & Landing Page de Alta Conversão',
    solutionDescription: 'Desenvolvemos sites ultrarrápidos, 100% responsivos e otimizados para os primeiros lugares do Google (SEO). Cada elemento é pensado para transformar visitantes em mensagens diretas no seu WhatsApp.',
    techifyDeliverables: [
      'Posicionamento de destaque no Google (SEO Técnico)',
      'Design profissional e de alta autoridade para sua marca',
      'Carregamento instantâneo em celulares e computadores',
      'Botões inteligentes de WhatsApp e captação de clientes'
    ],
    metricsHighlight: { label: 'Aumento médio de contatos', value: '+300%' },
    ctaText: 'QUERO MEU SITE PROFISSIONAL',
    whatsappMessage: 'Olá Techify! Fiz o diagnóstico no site e marquei que minha empresa está perdendo clientes por estar SEM SITE. Gostaria de falar com um especialista.',
    icon: Globe
  },
  {
    id: 'sem_sistema',
    badge: 'Eficiência & Controle',
    title: '2. Sem Sistema',
    subtitle: 'Perco tempo e dinheiro no controle manual e planilhas',
    problemSummary: 'Sem sistema, você perde tempo e dinheiro no controle manual. Planilhas desorganizadas, atrasos em cobranças, falhas no estoque e retrabalho sobrecarregam sua equipe diariamente.',
    solutionTitle: 'Sistema de Gestão & Automação Sob Medida',
    solutionDescription: 'Criamos softwares web e plataformas customizadas que automatizam suas rotinas de vendas, financeiro, estoque e atendimento. Tudo sincronizado em tempo real na nuvem com relatórios claros.',
    techifyDeliverables: [
      'Painéis de controle personalizados para seu fluxo de trabalho',
      'Cobranças e notificações automatizadas de clientes',
      'Controle centralizado de vendas, clientes e produtos',
      'Acesso seguro e em tempo real de qualquer dispositivo'
    ],
    metricsHighlight: { label: 'Horas operacionais economizadas/mês', value: '+40h' },
    ctaText: 'QUERO MEU SISTEMA SOB MEDIDA',
    whatsappMessage: 'Olá Techify! Fiz o diagnóstico no site e marquei que minha empresa está perdendo tempo e dinheiro por estar SEM SISTEMA. Gostaria de falar com um engenheiro.',
    icon: Database
  },
  {
    id: 'sem_anuncio',
    badge: 'Atração & Escala',
    title: '3. Sem Anúncio',
    subtitle: 'Ninguém sabe que a minha empresa existe / poucas vendas',
    problemSummary: 'Sem anúncio, ninguém sabe que a sua empresa existe. Depender só de indicação ou posts sem alcance limita o crescimento do seu faturamento mês a mês.',
    solutionTitle: 'Tráfego Pago & Campanhas Estratégicas',
    solutionDescription: 'Planejamos e gerenciamos seus anúncios no Google, Instagram e Facebook segmentados diretamente para clientes com intenção real de compra na sua região ou em todo o Brasil.',
    techifyDeliverables: [
      'Anúncios no topo das buscas do Google para quem já quer comprar',
      'Campanhas visuais de alto impacto no Instagram e Facebook',
      'Otimização contínua de investimento e custo por lead (CPL)',
      'Relatórios transparentes semanais com retorno sobre investimento'
    ],
    metricsHighlight: { label: 'Novos clientes em potencial por semana', value: 'Diários' },
    ctaText: 'QUERO ANÚNCIOS QUE VENDEM',
    whatsappMessage: 'Olá Techify! Fiz o diagnóstico no site e marquei que minha empresa precisa de ANÚNCIOS E TRÁFEGO PAGO para vender mais. Gostaria de falar com um estrategista.',
    icon: Zap
  },
  {
    id: 'todos_3',
    badge: 'Estrutura Completa 360°',
    title: '4. Todos os Três',
    subtitle: 'Preciso de site, sistema e anúncios integrados',
    problemSummary: 'Sua empresa precisa de uma transformação digital completa: ser encontrada na internet, automatizar as operações internas e receber um fluxo diário e previsível de novos clientes.',
    solutionTitle: 'Ecossistema Digital Completo Techify',
    solutionDescription: 'Unimos site de alta conversão + sistema de gestão automatizado + campanhas ativas de atração em uma única estrutura sólida, conduzida pelo time de engenharia e marketing da Techify.',
    techifyDeliverables: [
      'Site institucional e Landing Pages de vendas integradas',
      'Sistema de controle e CRM sob medida para seu nicho',
      'Gestão de tráfego pago no Google e redes sociais',
      'Suporte técnico contínuo e acompanhamento pós-entrega'
    ],
    metricsHighlight: { label: 'Crescimento e maturidade digital', value: '100%' },
    ctaText: 'QUERO A ESTRUTURA COMPLETA',
    whatsappMessage: 'Olá Techify! Fiz o diagnóstico no site e selecionei que preciso da ESTRUTURA COMPLETA (Site + Sistema + Anúncios). Gostaria de agendar uma conversa com um engenheiro.',
    icon: Layers
  }
];

interface InteractiveDiagnosisSectionProps {
  onOpenConsultation?: () => void;
}

export default function InteractiveDiagnosisSection({ onOpenConsultation }: InteractiveDiagnosisSectionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<OptionData['id']>('sem_site');
  const [isSubmittingToAdmin, setIsSubmittingToAdmin] = useState(false);
  const [hasSentDiagnosis, setHasSentDiagnosis] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  // Optional lead contact follow-up
  const [contactName, setContactName] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [isSendingLeadContact, setIsSendingLeadContact] = useState(false);
  const [leadContactSent, setLeadContactSent] = useState(false);

  const selectedData = DIAGNOSIS_OPTIONS.find(opt => opt.id === selectedOptionId) || null;

  // Handle selecting an option
  const handleSelectOption = async (opt: OptionData) => {
    setSelectedOptionId(opt.id);
    setIsSubmittingToAdmin(true);

    try {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const diagnosticoPayload: DiagnosticoLead = {
        opcaoId: opt.id,
        opcaoTitulo: opt.title,
        problema: opt.problemSummary,
        solucaoResumo: opt.solutionTitle,
        status: 'Novo',
        data: dateFormatted,
        createdAt: now.toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconhecido'
      };

      // Save directly to Firestore for admin real-time sync
      const docRef = await addDoc(collection(db, 'diagnosticos'), diagnosticoPayload);
      setLastSavedId(docRef.id);
      setHasSentDiagnosis(true);
    } catch (err) {
      console.warn('Could not save diagnosis to Firestore:', err);
    } finally {
      setIsSubmittingToAdmin(false);
    }
  };

  // Handle optional quick lead submission
  const handleSendLeadContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactWhatsapp.trim()) {
      toast.error('Informe seu WhatsApp', 'Por favor digite seu número para receber o plano.');
      return;
    }

    setIsSendingLeadContact(true);
    try {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('pt-BR');

      await addDoc(collection(db, 'leads'), {
        nome: contactName.trim() || 'Cliente Diagnóstico',
        segmento: selectedData ? selectedData.badge : 'Diagnóstico Web',
        email: 'contato@diagnostico.com',
        telefone: contactWhatsapp.trim(),
        instagram: '',
        interesses: selectedData ? `${selectedData.title} - ${selectedData.solutionTitle}` : 'Diagnóstico Site',
        status: 'Novo Lead',
        emailsEnviados: 0,
        dataEnvio: dateFormatted,
        createdAt: now.toISOString()
      });

      setLeadContactSent(true);
      toast.success('Diagnóstico Enviado!', 'Nossa equipe de engenharia entrará em contato em instantes.');
    } catch (err) {
      console.error('Error saving lead contact:', err);
      toast.error('Erro ao enviar', 'Por favor tente novamente ou chame no WhatsApp.');
    } finally {
      setIsSendingLeadContact(false);
    }
  };

  const openWhatsAppAction = (msg: string) => {
    const phone = '5581995498590';
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="relative w-full py-20 sm:py-28 bg-[#040604] border-y border-neutral-900 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.07),transparent_70%)] blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#a3e635_1px,transparent_1px),linear-gradient(to_bottom,#a3e635_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white max-w-4xl leading-[1.15] tracking-tight">
            Está perdendo cliente por qual desses três?
          </h2>

          <p className="mt-5 max-w-3xl text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
            Sem site, o cliente não te acha. Sem sistema, você perde tempo e dinheiro no controle manual. Sem anúncio, ninguém sabe que a sua empresa existe. <strong className="text-white font-semibold">A Techify resolve os três.</strong>
          </p>

          <p className="mt-3 text-xs sm:text-sm text-[#a3e635] font-semibold flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#a3e635] animate-ping" />
            Toque na opção que melhor descreve seu momento para ver a solução detalhada:
          </p>
        </div>

        {/* 4 Interactive Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          {DIAGNOSIS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedOptionId === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`group relative text-left rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer border ${
                  isSelected
                    ? 'bg-[#111810] border-[#a3e635] ring-2 ring-[#a3e635]/80 shadow-[0_0_30px_rgba(163,230,53,0.25)] scale-[1.02]'
                    : 'bg-[#0a0d0a] border-neutral-800/90 hover:border-[#a3e635]/50 hover:bg-[#0f140f] hover:scale-[1.01]'
                }`}
              >
                <div>
                  {/* Top indicator row */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                      isSelected 
                        ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.5)]' 
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-300 group-hover:text-[#a3e635] group-hover:border-[#a3e635]/30'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Radio / Check status */}
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-[#a3e635] text-black' 
                        : 'border-2 border-neutral-700 group-hover:border-[#a3e635]/60'
                    }`}>
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-500 group-hover:text-[#a3e635]">{opt.id === 'todos_3' ? '4' : opt.title.split('.')[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Option Badge */}
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 ${
                    isSelected
                      ? 'bg-[#a3e635]/20 text-[#a3e635]'
                      : 'bg-neutral-900 text-neutral-400'
                  }`}>
                    {opt.badge}
                  </span>

                  {/* Title & Subtitle */}
                  <h3 className="font-display text-lg font-bold text-white mb-1.5 group-hover:text-[#a3e635] transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {opt.subtitle}
                  </p>
                </div>

                {/* Bottom interactive hint */}
                <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? 'text-[#a3e635]' : 'text-neutral-400 group-hover:text-neutral-200'}>
                    {isSelected ? 'Opção selecionada' : 'Clique para ver solução'}
                  </span>
                  <ArrowRight className={`h-3.5 w-3.5 transition-transform ${
                    isSelected ? 'text-[#a3e635] translate-x-1' : 'text-neutral-500 group-hover:translate-x-1 group-hover:text-[#a3e635]'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* REVEALED SOLUTION ACCORDION / CONTAINER (Shown only after user selects an option) */}
        <AnimatePresence mode="wait">
          {selectedData ? (
            <motion.div
              key={selectedData.id}
              initial={{ opacity: 0, y: 25, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-3xl border border-[#a3e635]/40 bg-gradient-to-b from-[#0e160e] via-[#090e09] to-[#040604] p-6 sm:p-10 shadow-[0_0_50px_rgba(163,230,53,0.12)]">
                
                {/* Header of revealed solution */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#a3e635] mb-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Diagnóstico Concluído • Solução Recomendada pela Techify</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                      {selectedData.solutionTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-right">
                      <p className="text-[10px] text-neutral-400 uppercase font-semibold">{selectedData.metricsHighlight.label}</p>
                      <p className="text-lg font-black text-[#a3e635]">{selectedData.metricsHighlight.value}</p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis body: Problem vs Techify Solution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
                  
                  {/* Left Column: The Identified Problem */}
                  <div className="lg:col-span-5 rounded-2xl bg-[#090b09] border border-neutral-800/80 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <span>O Gargalo do seu Negócio Hoje</span>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal mb-4">
                        {selectedData.problemSummary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-800/80 text-xs text-neutral-400">
                      <span className="text-neutral-300 font-semibold">Impacto direto: </span>
                      Perda diária de clientes e faturamento para concorrentes estruturados.
                    </div>
                  </div>

                  {/* Right Column: Techify Engineering Solution */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#a3e635] mb-3">
                        <Sparkles className="h-4 w-4" />
                        <span>Como a Techify Resolve</span>
                      </div>

                      <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 font-normal">
                        {selectedData.solutionDescription}
                      </p>

                      {/* Deliverables Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {selectedData.techifyDeliverables.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 border border-neutral-800/70 text-xs text-neutral-200">
                            <div className="h-4 w-4 rounded-full bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => openWhatsAppAction(selectedData.whatsappMessage)}
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#a3e635] hover:bg-[#84cc16] px-7 py-3.5 text-xs sm:text-sm font-extrabold text-black transition-all shadow-[0_0_25px_rgba(163,230,53,0.35)] cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4 fill-current" />
                        <span>{selectedData.ctaText}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>

                      {onOpenConsultation && (
                        <button
                          onClick={onOpenConsultation}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/90 hover:bg-neutral-800 px-6 py-3.5 text-xs sm:text-sm font-bold text-neutral-200 transition-all cursor-pointer"
                        >
                          <span>FALAR COM ENGENHEIRO</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Optional Fast Contact Capture Footer */}
                <div className="mt-4 pt-6 border-t border-neutral-800/80 bg-black/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#a3e635]" />
                      Quer que nosso engenheiro analise seu caso gratuitamente?
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Deixe seu WhatsApp para receber o orçamento e plano de ação detalhado.
                    </p>
                  </div>

                  {leadContactSent ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#a3e635]/20 border border-[#a3e635]/40 text-[#a3e635] text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Recebemos seus dados! Entraremos em contato em instantes.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSendLeadContact} className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                      <div className="relative w-full sm:w-44">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Seu nome"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-800 pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                        />
                      </div>

                      <div className="relative w-full sm:w-48">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                        <input
                          type="tel"
                          placeholder="WhatsApp com DDD"
                          value={contactWhatsapp}
                          onChange={(e) => setContactWhatsapp(e.target.value)}
                          required
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-800 pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingLeadContact}
                        className="w-full sm:w-auto rounded-xl bg-[#a3e635] hover:bg-[#84cc16] px-5 py-2 text-xs font-bold text-black transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {isSendingLeadContact ? 'Enviando...' : 'Receber Proposta'}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

      </div>
    </section>
  );
}
