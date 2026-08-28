import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { soundFX } from '../lib/soundFx';

interface MotionLabSectionProps {
  onNavigate?: (tab: string) => void;
  onOpenConsultation?: (serviceName?: string) => void;
}

export const MotionLabSection: React.FC<MotionLabSectionProps> = ({
  onNavigate,
  onOpenConsultation
}) => {
  const [iframeKey, setIframeKey] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parent-child postMessage communication bridge
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'TECHIFY_OPEN_CONSULTATION') {
        soundFX.playClick();
        onOpenConsultation?.(event.data.service || 'Techify Motion');
      } else if (event.data.type === 'TECHIFY_NAVIGATE') {
        soundFX.playClick();
        onNavigate?.(event.data.tab || 'inicio');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate, onOpenConsultation]);

  // Subtle pupil tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    setMousePos({ x, y });
  };

  const handleToggleMenu = () => {
    soundFX.playClick();
    setIsMenuOpen(prev => !prev);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'TECHIFY_TOGGLE_MENU' }, '*');
    }
  };

  return (
    <div
      id="techify-motion-lab-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[calc(100vh-61px)] sm:h-[calc(100vh-65px)] bg-[#0c0b0b] text-white flex flex-col overflow-hidden select-none"
    >
      {/* Top Header with Back Arrow, Animated Eyes, Techify Badge and Menu Button */}
      <header className="shrink-0 z-40 w-full bg-[#0c0b0b] border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between transition-all">
        {/* Left Side: Back Arrow + Animated Eyes + Techify Badge */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Back Arrow Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate?.('inicio');
            }}
            className="flex items-center justify-center p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Voltar para a página inicial"
            aria-label="Voltar para o início"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Interactive Animated Eyes */}
          <div className="flex items-center -space-x-0.5">
            {/* Left Eye */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/90 bg-[#0c0b0b] flex items-center justify-center relative overflow-hidden shadow-sm">
              <div
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                  clipPath: 'polygon(100% 50%, 45% 0%, 0% 0%, 0% 100%, 45% 100%)'
                }}
              />
            </div>
            {/* Right Eye */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/90 bg-[#0c0b0b] flex items-center justify-center relative overflow-hidden shadow-sm">
              <div
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                  clipPath: 'polygon(100% 50%, 45% 0%, 0% 0%, 0% 100%, 45% 100%)'
                }}
              />
            </div>
          </div>

          {/* Techify Pill Badge */}
          <div className="px-3.5 sm:px-4 py-1 rounded-full border border-white/90 bg-[#0c0b0b] text-white text-xs sm:text-sm font-normal tracking-tight flex items-center justify-center shadow-sm">
            techify
          </div>
        </div>

        {/* Right Side: Menu Pill Button */}
        <button
          onClick={handleToggleMenu}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-white/90 bg-[#0c0b0b] hover:bg-white hover:text-black text-white text-xs sm:text-sm font-normal tracking-tight transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
          title="Abrir Menu de Aulas & Navegação"
          aria-label="Abrir Menu"
        >
          <span>{isMenuOpen ? 'Fechar' : 'Menu'}</span>
          <div className="flex flex-col gap-0.5 justify-center items-center w-3 h-3">
            <span className="w-3 h-[1.5px] bg-current rounded-full" />
            <span className="w-3 h-[1.5px] bg-current rounded-full" />
          </div>
        </button>
      </header>

      {/* Full Interactive Frame */}
      <main className="flex-1 w-full h-full relative bg-[#0c0b0b] overflow-hidden">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src="/motion-lab.html"
          title="Techify Motion Lab - Interactive Experience"
          className="w-full h-full border-0 opacity-100 block"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#0c0b0b'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </main>
    </div>
  );
};

export default MotionLabSection;
