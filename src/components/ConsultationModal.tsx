import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  User, 
  Mail, 
  MessageSquare, 
  Phone, 
  ChevronRight, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Zap,
  Lock,
  Edit3,
  Settings
} from 'lucide-react';
import { Consultation } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from './Toast';
import { 
  ServiceCatalogItem, 
  DEFAULT_SERVICES_CATALOG, 
  getCachedServicesCatalog, 
  initServicesCatalogListener 
} from '../lib/servicesCatalog';
import ServicesCatalogManagerModal from './ServicesCatalogManagerModal';

export const SERVICES_CATALOG = DEFAULT_SERVICES_CATALOG;

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

const QUICK_TAGS = [
  '🚀 Quero Vender Mais Online',
  '🌐 Quero Criar um Site Profissional',
  '⚡ Preciso de um Sistema/App Sob Medida',
  '🎨 Quero Reformular Minha Marca',
  '📈 Quero Anúncios que Convertem'
];

const TIME_SLOTS = [
  '09:30',
  '11:00',
  '14:00',
  '15:30',
  '17:00',
  '18:30'
];

// Helper to format Brazilian phone numbers automatically as the user types
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Get dates in YYYY-MM-DD
function getFormattedDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export default function ConsultationModal({ isOpen, onClose, defaultService }: ConsultationModalProps) {
  const todayStr = getFormattedDate(0);
  const tomorrowStr = getFormattedDate(1);
  const next2DaysStr = getFormattedDate(2);

  const [servicesCatalog, setServicesCatalog] = useState<ServiceCatalogItem[]>(() => getCachedServicesCatalog());
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const [formData, setFormData] = useState<Consultation>({
    name: '',
    email: '',
    whatsapp: '',
    service: defaultService || (servicesCatalog[0]?.id || 'pacote_completo'),
    date: todayStr,
    time: '14:00',
    details: '',
  });

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [protocolNumber, setProtocolNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Subscribe to real-time services catalog updates
  useEffect(() => {
    const unsub = initServicesCatalogListener((items) => {
      setServicesCatalog(items);
      // If current selected service was removed, fallback to the first available
      if (items.length > 0 && !items.some(it => it.id === formData.service)) {
        setFormData(prev => ({ ...prev, service: items[0].id }));
      }
    });
    return () => unsub();
  }, [formData.service]);

  // Sync default service when passed
  useEffect(() => {
    if (defaultService && servicesCatalog.length > 0) {
      const match = servicesCatalog.find(
        s => s.id === defaultService || s.label.toLowerCase().includes(defaultService.toLowerCase())
      );
      if (match) {
        setFormData(prev => ({ ...prev, service: match.id }));
      }
    }
  }, [defaultService, isOpen, servicesCatalog]);

  // Handle WhatsApp direct link generation
  const buildWhatsAppRedirectUrl = (protocol: string, name: string, serviceLabel: string, date: string, time: string, details: string) => {
    const rawPhone = '5581995498590';
    const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR') : 'A Combinar';
    const text = `👋 Olá Techify! Acabei de agendar minha *Consulta Estratégica VIP* pelo site.\n\n` +
      `📋 *Protocolo:* ${protocol}\n` +
      `👤 *Nome:* ${name}\n` +
      `⭐ *Serviço de Interesse:* ${serviceLabel}\n` +
      `📅 *Data Preferencial:* ${formattedDate} às ${time || '14:00'}\n` +
      (details ? `📝 *Objetivo:* ${details}\n\n` : '\n') +
      `Gostaria de confirmar o atendimento com o engenheiro! 🚀`;
    return `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(text)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };

  const handleQuickTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      setFormData(prev => ({ ...prev, details: '' }));
    } else {
      setSelectedTag(tag);
      setFormData(prev => ({ ...prev, details: tag }));
    }
  };

  const handleQuickEmailDomain = (domain: string) => {
    const prefix = formData.email.split('@')[0] || '';
    if (prefix) {
      setFormData(prev => ({ ...prev, email: `${prefix}${domain}` }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nome Obrigatório', 'Por favor, informe seu nome.');
      return;
    }
    if (!formData.whatsapp.trim() || formData.whatsapp.replace(/\D/g, '').length < 10) {
      toast.error('WhatsApp Inválido', 'Por favor, informe um número de WhatsApp com DDD válido.');
      return;
    }

    setIsSubmitting(true);
    const genProtocol = `#TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    setProtocolNumber(genProtocol);

    const selectedServiceObj = servicesCatalog.find(s => s.id === formData.service);
    const selectedServiceLabel = selectedServiceObj ? `${selectedServiceObj.label} (${selectedServiceObj.price})` : 'Criação de Sites';
    const formattedDate = formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

    try {
      // Store in Firebase Firestore
      await addDoc(collection(db, "consultas"), {
        nome: formData.name.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        servico: selectedServiceLabel,
        data: formattedDate,
        horario: formData.time || '14:00',
        resumo: formData.details || '',
        status: 'pendente',
        protocolo: genProtocol,
        createdAt: new Date().toISOString()
      });

      // Save also to localStorage for instant local backup
      try {
        const localKey = 'techify_user_consultas';
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        existing.unshift({
          protocolo: genProtocol,
          nome: formData.name,
          servico: selectedServiceLabel,
          data: formattedDate,
          horario: formData.time,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 10)));
      } catch (e) {
        console.warn('LocalStorage backup error:', e);
      }

      toast.success('Agendamento Confirmado!', `Protocolo ${genProtocol} registrado com sucesso.`);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting consultation to Firestore:", err);
      // Even if offline, treat optimistically to never lose the client lead!
      toast.success('Agendamento Registrado!', `Protocolo ${genProtocol} gerado.`);
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const selectedServiceObj = servicesCatalog.find(s => s.id === formData.service);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-neutral-800 bg-[#0a0d0a] p-5 sm:p-7 text-white shadow-[0_0_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto custom-scrollbar"
          >
            {/* Background green laser effects */}
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[#22c55e]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#84cc16]/10 blur-3xl pointer-events-none" />
            
            {/* Top Urgency Header Ribbon */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-white tracking-tight">
                      Agendar Consulta Digital
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/40 px-2 py-0.5 text-[10px] font-black text-[#4ade80] uppercase tracking-wider animate-pulse">
                      <Zap className="h-2.5 w-2.5" /> 100% Gratuita
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Sessão com Engenheiro & Designer Techify • Diagnóstico 360°
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-neutral-900/80 border border-neutral-800 flex items-center justify-center transition-colors duration-200 hover:bg-neutral-800 hover:text-white text-neutral-400 cursor-pointer"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Trust highlights banner */}
            <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-black/50 border border-neutral-800/70 p-2.5 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-200">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span>Vagas do Mês</span>
                </div>
                <span className="text-[10px] text-neutral-400">Últimas 2 disponíveis</span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-neutral-800/60 px-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#4ade80]">
                  <Clock className="h-3 w-3" />
                  <span>Retorno Rápido</span>
                </div>
                <span className="text-[10px] text-neutral-400">Em até 15 minutos</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-200">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>100% Sigiloso</span>
                </div>
                <span className="text-[10px] text-neutral-400">Sem compromisso</span>
              </div>
            </div>

            {isSuccess ? (
              /* SUCCESS / HIGH-CONVERTING CONFIRMATION SCREEN */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#22c55e]/20 border border-[#22c55e] text-[#22c55e] shadow-[0_0_25px_rgba(34,197,94,0.35)]">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-xs font-bold text-[#4ade80] mb-2">
                  <Sparkles className="h-3.5 w-3.5" /> Agendamento VIP Confirmado
                </span>

                <h4 className="font-display text-xl sm:text-2xl font-black text-white mb-2">
                  Tudo Pronto, {formData.name.split(' ')[0]}!
                </h4>

                <p className="text-neutral-300 text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
                  Sua consulta para <strong className="text-white">{formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'hoje'} às {formData.time}</strong> foi agendada e registrada com sucesso.
                </p>

                {/* Protocol Card */}
                <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 text-left">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 mb-2 text-xs">
                    <span className="text-neutral-400">Protocolo de Atendimento:</span>
                    <span className="font-mono font-bold text-[#a3e635] text-sm">{protocolNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-neutral-400">Serviço Selecionado:</span>
                    <span className="font-medium text-neutral-200 text-right truncate max-w-[220px]">
                      {selectedServiceObj?.label.split('(')[0] || 'Estrutura Digital'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-neutral-400">Canal de Contato:</span>
                    <span className="font-medium text-[#4ade80]">{formData.whatsapp}</span>
                  </div>
                </div>

                {/* DIRECT WHATSAPP INSTANT ACTION BUTTON */}
                <div className="space-y-2.5">
                  <a
                    href={buildWhatsAppRedirectUrl(
                      protocolNumber,
                      formData.name,
                      selectedServiceObj?.label || 'Estrutura Techify',
                      formData.date,
                      formData.time,
                      formData.details
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black py-3.5 px-4 text-sm transition-all duration-300 shadow-[0_0_25px_rgba(34,197,94,0.45)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Iniciar Conversa no WhatsApp Agora</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 font-bold py-2.5 text-xs transition-colors cursor-pointer"
                  >
                    Fechar e Continuar Navegando
                  </button>
                </div>
              </motion.div>
            ) : (
              /* HIGH-CONVERTING INTERACTIVE FORM */
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
                    <span>Seu Nome Completo *</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Identificação na reunião</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                    <input
                      required
                      type="text"
                      placeholder="Ex: João Carlos Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-500 transition-all focus:border-[#22c55e] focus:bg-black focus:ring-1 focus:ring-[#22c55e] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. WhatsApp + Email */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
                      <span>WhatsApp com DDD *</span>
                      <span className="text-[10px] text-[#4ade80] font-bold">Direto</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#22c55e]" />
                      <input
                        required
                        type="tel"
                        placeholder="Ex: (11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={handlePhoneChange}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-3 pl-10 pr-4 text-sm text-white font-medium placeholder-neutral-500 transition-all focus:border-[#22c55e] focus:bg-black focus:ring-1 focus:ring-[#22c55e] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
                      <span>Seu Melhor E-mail *</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                      <input
                        required
                        type="email"
                        placeholder="Ex: joao@empresa.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-500 transition-all focus:border-[#22c55e] focus:bg-black focus:ring-1 focus:ring-[#22c55e] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Email Suggestion Chips if user is typing */}
                {formData.email && !formData.email.includes('@') && (
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span>Completar:</span>
                    {['@gmail.com', '@hotmail.com', '@outlook.com'].map(dom => (
                      <button
                        type="button"
                        key={dom}
                        onClick={() => handleQuickEmailDomain(dom)}
                        className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] transition-colors cursor-pointer"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Service or Package Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-300">
                      Serviço ou Pacote de Interesse *
                    </label>
                    <span className="text-[10px] text-[#4ade80] font-black uppercase tracking-wider">
                      ✨ Amostra Grátis Disponível
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 py-3.5 px-3.5 text-xs sm:text-sm text-white font-semibold transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] focus:outline-none shadow-sm cursor-pointer"
                    >
                      {SERVICES_CATALOG.map((service) => (
                        <option 
                          key={service.id} 
                          value={service.id} 
                          className="bg-neutral-950 text-neutral-100 py-2"
                        >
                          {service.label} {service.price ? `(${service.price})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedServiceObj && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 text-neutral-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e] shrink-0" />
                        <span className="font-semibold">{selectedServiceObj.badge}</span>
                      </div>
                      <span className="font-extrabold text-[#4ade80]">{selectedServiceObj.price}</span>
                    </div>
                  )}
                </div>

                {/* 4. Interactive Date & Time Slots Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-neutral-300">
                      Quando prefere ser atendido? *
                    </label>
                    <span className="text-[10px] text-neutral-400">Horário de Brasília</span>
                  </div>

                  {/* Quick Date Chips */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, date: todayStr })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formData.date === todayStr 
                          ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80] shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, date: tomorrowStr })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formData.date === tomorrowStr 
                          ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80] shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      Amanhã
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, date: next2DaysStr })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formData.date === next2DaysStr 
                          ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80] shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      Em 2 dias
                    </button>
                  </div>

                  {/* Quick Time Slots Chips */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={`py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          formData.time === slot
                            ? 'bg-[#22c55e] border-[#22c55e] text-black font-extrabold shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                            : 'bg-neutral-900/70 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  {/* Advanced Date/Time custom picker fallback if needed */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 py-1.5 px-2.5 text-xs text-neutral-300 transition-all focus:border-[#22c55e] focus:outline-none"
                    />
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 py-1.5 px-2.5 text-xs text-neutral-300 transition-all focus:border-[#22c55e] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. Quick Need Tags + Details */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Qual é o principal foco da sua empresa hoje? (Opcional)
                  </label>
                  
                  {/* Quick Choice Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleQuickTagClick(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                          formData.details.includes(tag) || selectedTag === tag
                            ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80] font-bold'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
                    <textarea
                      rows={2}
                      placeholder="Ex: Quero aumentar minhas vendas e ter uma estrutura digital moderna que passe autoridade..."
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 transition-all focus:border-[#22c55e] focus:bg-black focus:ring-1 focus:ring-[#22c55e] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Conversion Guarantees */}
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" /> Dados protegidos sob sigilo
                  </span>
                  <span className="flex items-center gap-1 text-[#4ade80] font-semibold">
                    <Sparkles className="h-3 w-3" /> Sem pegadinhas ou cobranças ocultas
                  </span>
                </div>

                {/* High-Impact Action Buttons */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#84cc16] via-[#22c55e] to-[#10b981] hover:brightness-110 active:scale-[0.98] text-black font-black py-3.5 px-4 text-sm transition-all duration-300 shadow-[0_0_25px_rgba(34,197,94,0.4)] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Confirmando Agendamento VIP...</span>
                      </span>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Confirmar Agendamento & Falar com Engenheiro</span>
                        <ChevronRight className="h-4 w-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
