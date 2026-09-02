import React, { useState } from 'react';
import { Home, Globe, Briefcase, Shield, LogOut, Users, Menu, X, Layers, Sparkles, Sliders } from 'lucide-react';
import { TechifyIcon } from './TechifyLogo';
import { useAdminAuth } from '../lib/adminAuth';
import { motion, AnimatePresence } from 'motion/react';
import LogoCustomizerModal from './LogoCustomizerModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConsultation: (plan?: string) => void;
  onOpenAdminLogin: () => void;
}

export default function Header({ activeTab, setActiveTab, onOpenConsultation, onOpenAdminLogin }: HeaderProps) {
  const { isAdmin, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const baseNavItems = [
    { id: 'inicio', label: 'INÍCIO', icon: Home },
    { id: 'sobre-nos', label: 'SOBRE NÓS', icon: Users },
    { id: 'academia', label: 'PORTFÓLIO', icon: Sparkles },
    { id: 'carreiras', label: 'CARREIRAS', icon: Briefcase },
  ];

  const navItems = isAdmin 
    ? [...baseNavItems, { id: 'admin', label: 'ADMIN', icon: Shield }]
    : baseNavItems;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-black/90 backdrop-blur-md">
      <div className="w-full flex items-center justify-between px-3 sm:px-6 md:px-8 py-2.5 sm:py-3">
        
        {/* Logo Container and Brand Name (Aligned to Corner) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div 
            className="group relative flex cursor-pointer items-center gap-2 sm:gap-3 transition-opacity hover:opacity-95 select-none shrink-0"
            onClick={() => handleNavClick('inicio')}
            title="Techify - Início"
          >
            {/* Pure Circular Techify Logo Emblem */}
            <TechifyIcon />
            <div className="flex flex-col text-left">
              <span className="font-display text-base sm:text-lg font-black tracking-tight text-white leading-none">
                Techify
              </span>
            </div>
          </div>

          {/* Admin Quick Logo & Image Customizer Button */}
          {isAdmin && (
            <button
              onClick={() => setIsLogoModalOpen(true)}
              title="Trocar / Ajustar Imagem Interna do Logo"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-[#4ade80] transition-colors cursor-pointer text-xs font-semibold"
            >
              <Sliders className="h-3.5 w-3.5 text-[#4ade80]" />
              <span className="hidden sm:inline text-[10px] text-neutral-300">Ajustar</span>
            </button>
          )}
        </div>

        {/* Desktop Navigation Actions */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer select-none ${
                  isActive
                    ? 'border border-[#22c55e]/50 bg-[#051c05]/80 text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.18)]'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/50 border border-transparent'
                }`}
              >
                <IconComponent className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#4ade80]' : 'text-neutral-400'}`} />
                <span className="font-semibold">{item.label}</span>
                
                {/* Visual badge for APPS (Novo) */}
                {'isNew' in item && item.isNew && (
                  <span className="ml-0.5 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 px-1.5 py-0.2 text-[9px] font-extrabold text-[#4ade80]">
                    NOVO
                  </span>
                )}

                {/* Active bottom highlight bar */}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]" />
                )}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => {
                logout();
                if (activeTab === 'admin') handleNavClick('inicio');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors cursor-pointer ml-1"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Sair</span>
            </button>
          )}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center h-9 w-9 rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-t border-neutral-900 bg-black/95 px-4 py-4 backdrop-blur-xl"
          >
            <div className="flex flex-col space-y-1.5">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'border border-[#22c55e]/50 bg-[#06200a] text-[#4ade80]'
                        : 'text-neutral-300 hover:bg-neutral-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-4 w-4 ${isActive ? 'text-[#4ade80]' : 'text-neutral-400'}`} />
                      <span>{item.label}</span>
                      {'isNew' in item && item.isNew && (
                        <span className="rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 px-2 py-0.5 text-[10px] font-extrabold text-[#4ade80]">
                          NOVO
                        </span>
                      )}
                    </div>
                    {isActive && <div className="h-2 w-2 rounded-full bg-[#22c55e]" />}
                  </button>
                );
              })}

              {isAdmin && (
                <div className="pt-3 mt-2 border-t border-neutral-900 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      logout();
                      handleNavClick('inicio');
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sair do Painel Admin</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Logo Customizer Modal */}
      <LogoCustomizerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </header>
  );
}
