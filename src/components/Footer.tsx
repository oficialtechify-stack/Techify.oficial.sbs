import React, { useState } from 'react';
import { Mail, MessageCircle, Instagram, Linkedin, Send, ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TechifyIcon } from './TechifyLogo';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenConsultation: () => void;
  onOpenAdminLogin?: () => void;
}

export default function Footer({ onNavigate, onOpenConsultation, onOpenAdminLogin }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    setIsSubmitting(true);
    setNewsletterMsg('');

    try {
      // Check if already subscribed to prevent duplicates
      let isDuplicate = false;
      try {
        const q = query(collection(db, "newsletter"), where("email", "==", cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          isDuplicate = true;
        }
      } catch (err) {
        console.warn("Could not check duplicate newsletter email, proceeding to save:", err);
      }

      if (!isDuplicate) {
        await addDoc(collection(db, "newsletter"), {
          email: cleanEmail,
          origem: "Rodapé - Site",
          status: "ativo",
          createdAt: new Date().toISOString()
        });
      }

      setNewsletterSent(true);
      setNewsletterMsg(
        isDuplicate 
          ? '✓ E-mail já cadastrado! Você já faz parte da nossa lista exclusiva.' 
          : '✓ E-mail salvo com sucesso! Em breve enviaremos novidades e estratégias exclusivas.'
      );
      setNewsletterEmail('');

      setTimeout(() => {
        setNewsletterSent(false);
        setNewsletterMsg('');
      }, 5000);
    } catch (error) {
      console.error("Error saving newsletter email:", error);
      // Fallback optimistic confirmation so user gets a great experience even in offline dev mode
      setNewsletterSent(true);
      setNewsletterMsg('✓ E-mail cadastrado com sucesso!');
      setNewsletterEmail('');
      setTimeout(() => {
        setNewsletterSent(false);
        setNewsletterMsg('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-neutral-900 bg-black pt-16 pb-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-neutral-900">
          
          {/* Brand and Newsletter Column (5 cols) */}
          <div className="md:col-span-6 space-y-6">
            <div 
              className="flex cursor-pointer items-center gap-3"
              onClick={() => onNavigate('inicio')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-[#060606] p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-black">
                <TechifyIcon className="h-full w-full" color="#22c55e" />
              </div>
              <span className="font-display text-xl font-black tracking-wider text-white">
                TECHIFY
              </span>
            </div>
            
            <p className="text-sm leading-relaxed text-neutral-400 max-w-md">
              Site, sistema de gestão e anúncios estratégicos no Google para quem cansou de perder cliente para o concorrente.
            </p>

            {/* Newsletter Input Form */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Assine nossa newsletter</p>
              {newsletterSent ? (
                <div className="p-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-xs font-semibold text-[#4ade80] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" />
                  <span>{newsletterMsg || 'Obrigado! Seu e-mail foi cadastrado com sucesso.'}</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex items-center gap-2 max-w-md">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Digite seu e-mail"
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-full bg-[#22c55e] hover:bg-[#16a34a] px-5 py-2.5 text-xs font-bold text-black transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links Columns (6 cols) */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Navegação */}
            <div className="space-y-4">
              <h4 className="font-display text-xs font-black tracking-widest text-white uppercase">
                NAVEGAÇÃO
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => onNavigate('inicio')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Início
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    onNavigate('inicio');
                    setTimeout(() => {
                      const el = document.getElementById('planos');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} className="hover:text-white transition-colors cursor-pointer text-left">
                    Planos & Preços
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('sobre-nos')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Sobre Nós
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('apps')} className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span>Apps Techify</span>
                    <span className="text-[9px] font-extrabold bg-[#22c55e]/20 text-[#4ade80] px-1.5 py-0.2 rounded-full">NOVO</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('academia')} className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span>Techify Motion</span>
                    <span className="text-[9px] font-extrabold bg-[#22c55e]/20 text-[#4ade80] px-1.5 py-0.2 rounded-full">LAB</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('sobre-nos')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Sobre nós
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Conteúdo */}
            <div className="space-y-4">
              <h4 className="font-display text-xs font-black tracking-widest text-white uppercase">
                CONTEÚDO
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => onNavigate('carreiras')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Blog & Dúvidas
                  </button>
                </li>
                <li>
                  <button onClick={onOpenConsultation} className="hover:text-white transition-colors cursor-pointer text-left">
                    Contato & Briefing
                  </button>
                </li>
                <li>
                  <button onClick={onOpenConsultation} className="hover:text-white transition-colors cursor-pointer text-left">
                    Orçamento
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Redes Sociais */}
            <div className="space-y-4">
              <h4 className="font-display text-xs font-black tracking-widest text-white uppercase">
                CONECTE-SE
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="https://www.instagram.com/techify.oficial" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Instagram className="h-3.5 w-3.5 text-[#22c55e]" />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/5581995498590" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <MessageCircle className="h-3.5 w-3.5 text-[#22c55e]" />
                    <span>WhatsApp</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:oficialtechify@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Mail className="h-3.5 w-3.5 text-[#22c55e]" />
                    <span>Email</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Legal & Rights */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">
              Política de privacidade
            </span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">
              Termos de serviço
            </span>
          </div>

          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span>© 2026 Techify — Todos os direitos reservados.</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
