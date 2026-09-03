import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  User, 
  Mail, 
  MessageSquare, 
  Phone, 
  Check, 
  Clock, 
  ArrowRight,
  Send,
  Edit3
} from 'lucide-react';
import { Consultation } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from './Toast';
import { useAdminAuth } from '../lib/adminAuth';
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

const TIME_OPTIONS = [
  '09:00',
  '10:30',
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

function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export default function ConsultationModal({ isOpen, onClose, defaultService }: ConsultationModalProps) {
  const { isAdmin } = useAdminAuth();
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

  const [protocolNumber, setProtocolNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Subscribe to real-time services catalog updates
  useEffect(() => {
    const unsub = initServicesCatalogListener((items) => {
      setServicesCatalog(items);
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
    const text = `Olá Techify! Agendei uma reunião pelo site.\n\n` +
      `📌 *Protocolo:* ${protocol}\n` +
      `👤 *Nome:* ${name}\n` +
      `💼 *Serviço de Interesse:* ${serviceLabel}\n` +
      `📅 *Data e Horário:* ${formattedDate} às ${time || '14:00'}\n` +
      (details ? `📝 *Detalhes:* ${details}\n\n` : '\n') +
      `Gostaria de confirmar o agendamento!`;
    return `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(text)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
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

      toast.success('Reunião Agendada!', `Protocolo ${genProtocol} registrado com sucesso.`);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting consultation to Firestore:", err);
      toast.success('Reunião Agendada!', `Protocolo ${genProtocol} gerado.`);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            data-lenis-prevent
            className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-[#0f1110] p-6 sm:p-7 text-white shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white tracking-tight">
                    Marcar Reunião
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Escolha a melhor data e horário para conversar com nossa equipe.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center transition-colors hover:bg-neutral-800 hover:text-white text-neutral-400 cursor-pointer"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isSuccess ? (
              /* SUCCESS SCREEN */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e]">
                  <Check className="h-7 w-7 stroke-[2.5]" />
                </div>

                <h4 className="font-display text-xl font-bold text-white mb-2">
                  Reunião Agendada!
                </h4>

                <p className="text-neutral-300 text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                  Recebemos sua solicitação para o dia <strong className="text-white">{formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'hoje'} às {formData.time}</strong>.
                </p>

                {/* Protocol Card */}
                <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">Protocolo:</span>
                    <span className="font-mono font-bold text-[#22c55e] text-sm">{protocolNumber}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-neutral-400">Serviço:</span>
                    <span className="font-medium text-neutral-200 text-right truncate max-w-[200px]">
                      {selectedServiceObj?.label || 'Desenvolvimento'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-400">Contato:</span>
                    <span className="font-medium text-neutral-200">{formData.whatsapp}</span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-2">
                  <a
                    href={buildWhatsAppRedirectUrl(
                      protocolNumber,
                      formData.name,
                      selectedServiceObj?.label || 'Techify Digital',
                      formData.date,
                      formData.time,
                      formData.details
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 px-4 text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Confirmar no WhatsApp</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium py-2.5 text-xs transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            ) : (
              /* CLEAN & PROFESSIONAL FORM */
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Nome */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                    <input
                      required
                      type="text"
                      placeholder="Ex: João Carlos Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#22c55e] focus:bg-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. WhatsApp + E-mail */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      WhatsApp com DDD *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                      <input
                        required
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={handlePhoneChange}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#22c55e] focus:bg-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                      <input
                        required
                        type="email"
                        placeholder="joao@empresa.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#22c55e] focus:bg-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Serviço de Interesse */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-300">
                      Serviço de Interesse *
                    </label>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsManagerOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-[#22c55e] transition-colors cursor-pointer"
                        title="Gerenciar opções de serviços (Admin)"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Gerenciar lista</span>
                      </button>
                    )}
                  </div>

                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2.5 px-3 text-sm text-white transition-colors focus:border-[#22c55e] focus:bg-black focus:outline-none cursor-pointer"
                  >
                    {servicesCatalog.map((service) => (
                      <option 
                        key={service.id} 
                        value={service.id} 
                        className="bg-neutral-950 text-neutral-100"
                      >
                        {service.label} {service.price ? `— ${service.price}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. SEÇÃO: MARCAR REUNIÃO (Clean, streamlined Date & Time) */}
                <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#22c55e]" />
                      <label className="block text-xs font-bold text-white tracking-wide">
                        Marcar Reunião *
                      </label>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Horário de Brasília (BRT)
                    </span>
                  </div>

                  {/* Date & Time Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Data Preferencial
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 py-2 px-3 text-xs sm:text-sm text-white focus:border-[#22c55e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Horário Preferencial
                      </label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 py-2 px-3 text-xs sm:text-sm text-white focus:border-[#22c55e] focus:outline-none cursor-pointer"
                      >
                        {TIME_OPTIONS.map((timeSlot) => (
                          <option key={timeSlot} value={timeSlot} className="bg-neutral-950">
                            {timeSlot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clean Shortcut Presets */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-neutral-500 font-medium">Atalhos rápidos:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, date: todayStr })}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        formData.date === todayStr
                          ? 'bg-[#22c55e]/20 text-[#22c55e] font-bold border border-[#22c55e]/40'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, date: tomorrowStr })}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        formData.date === tomorrowStr
                          ? 'bg-[#22c55e]/20 text-[#22c55e] font-bold border border-[#22c55e]/40'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      Amanhã
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, date: next2DaysStr })}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        formData.date === next2DaysStr
                          ? 'bg-[#22c55e]/20 text-[#22c55e] font-bold border border-[#22c55e]/40'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      Em 2 dias
                    </button>
                  </div>
                </div>

                {/* 5. Detalhes / Mensagem (Opcional) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Detalhes do Projeto (Opcional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
                    <textarea
                      rows={2}
                      placeholder="Descreva resumidamente suas necessidades ou objetivos..."
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#22c55e] focus:bg-black focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-black font-bold py-3 px-4 text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Agendando Reunião...</span>
                      </span>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        <span>Marcar Reunião</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Services and Packages Catalog Manager Modal */}
      <ServicesCatalogManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        catalog={servicesCatalog}
      />
    </AnimatePresence>
  );
}
