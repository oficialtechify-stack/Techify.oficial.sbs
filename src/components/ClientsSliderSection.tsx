import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export interface ClientProjectSlide {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  subtitle?: string;
  tags?: string[];
}

export const CLIENT_SLIDES: ClientProjectSlide[] = [
  {
    id: 'maria-eduarda',
    title: 'Maria Eduarda - Estética Integrativa',
    category: 'Clínica & Saúde Estética',
    subtitle: 'Site institucional de alta conversão com agendamento direto pelo WhatsApp',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_maria_eduarda-1.png',
    tags: ['Landing Page', 'Estética', 'WhatsApp Integrado']
  },
  {
    id: 'matteoni-trainer',
    title: 'Matteoni - Personal Trainer',
    category: 'Fitness & Consultoria',
    subtitle: 'Plataforma moderna com apresentação de consultorias, produtos e treinos',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_matteoni.png',
    tags: ['Dark Luxury', 'Fitness', 'Alta Conversão']
  },
  {
    id: 'brigada-garra',
    title: 'Brigada Garra - Segurança & Treinamentos',
    category: 'Segurança & Cursos',
    subtitle: 'Portal corporativo com apresentação técnica e captação de alunos',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_brigada_garra.png',
    tags: ['Corporativo', 'Treinamentos', 'SEO Local']
  },
  {
    id: 'dowell-solucoes',
    title: 'Dowell - Soluções Industriais',
    category: 'Indústria & Tecnologia',
    subtitle: 'Catálogo institucional de produtos industriais e geração de orçamentos B2B',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_dowell.png',
    tags: ['B2B', 'Indústria', 'Catálogo']
  },
  {
    id: 'top-trip',
    title: 'Top Trip - Turismo & Viagens',
    category: 'Turismo & Agência',
    subtitle: 'Portal de viagens com pacotes, passeios e atendimento personalizado online',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_top_trip.png',
    tags: ['Turismo', 'Pacotes', 'Experiência']
  },
  {
    id: 'desapega-pecas',
    title: 'Desapega Peças - Autopeças & E-commerce',
    category: 'E-commerce Automotivo',
    subtitle: 'Loja virtual com catálogo categorizado de peças e checkout rápido',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_desapega_pecas.png',
    tags: ['E-commerce', 'Autopeças', 'Pix Automatizado']
  },
  {
    id: 'fast-limp',
    title: 'Fast Limp - Higienização Profissional',
    category: 'Serviços Especializados',
    subtitle: 'Landing page focada em conversão direta de orçamentos residenciais e comerciais',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_fast_limp.png',
    tags: ['Serviços', 'Agendamento', 'Google Ads']
  },
  {
    id: 'dolls-tale',
    title: 'Dolls Tale - Moda & Brinquedos',
    category: 'Loja Virtual Infantil',
    subtitle: 'E-commerce interativo com layout lúdico e estrutura de vendas completa',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_dolls_tale.png',
    tags: ['E-commerce', 'Infantil', 'Design Exclusivo']
  },
  {
    id: 'flor-de-liz',
    title: 'Flor de Liz - Moda & Vestuário',
    category: 'E-commerce de Moda',
    subtitle: 'Boutique online elegante com alta velocidade de carregamento e fotos em destaque',
    imageUrl: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_flor_de_liz.png',
    tags: ['Moda', 'Lookbook', 'Mobile First']
  }
];

interface ClientsSliderSectionProps {
  onOpenConsultation?: () => void;
  onNavigatePortfolio?: () => void;
}

export default function ClientsSliderSection({
  onOpenConsultation
}: ClientsSliderSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const totalSlides = CLIENT_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  // Autoplay functionality with smooth interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentProject = CLIENT_SLIDES[currentIndex];

  return (
    <section 
      id="clientes-satisfeitos"
      className="relative w-full py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-black via-[#060a07] to-black border-y border-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Background Banner / Wave Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[320px] sm:h-[420px] bg-gradient-to-r from-transparent via-[#22c55e]/15 to-transparent -rotate-3 blur-[60px] opacity-70" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_70%)] blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header Title with Divider Accents */}
        <ScrollReveal threshold={0.2} yOffset={20} once={true}>
          <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-1.5 text-xs font-bold text-[#4ade80] mb-4 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
              <ShieldCheck className="h-4 w-4" />
              <span>Projetos & Lojas no Ar</span>
            </div>

            {/* Main Title */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-4xl">
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-neutral-500 flex-1 hidden sm:block" />
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                JÁ SÃO MAIS DE <span className="text-[#22c55e] drop-shadow-[0_0_20px_rgba(34,197,94,0.35)]">+1000 CLIENTES</span> ATENDIDOS E SATISFEITOS
              </h2>
              <div className="h-px bg-gradient-to-l from-transparent via-neutral-700 to-neutral-500 flex-1 hidden sm:block" />
            </div>

            <p className="mt-3 text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl font-normal leading-relaxed">
              Sites institucionais de alta conversão, e-commerces completos e páginas profissionais desenvolvidas com tecnologia de ponta.
            </p>
          </div>
        </ScrollReveal>

        {/* Main Laptop Carousel Stage */}
        <div 
          className="relative max-w-5xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrow Left - Hidden on mobile */}
          <button
            onClick={prevSlide}
            aria-label="Projeto anterior"
            className="hidden sm:flex absolute -left-3 sm:-left-6 lg:-left-12 top-1/2 -translate-y-1/2 z-30 h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-neutral-700/80 bg-black/85 text-white backdrop-blur-md hover:border-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] cursor-pointer group"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Navigation Arrow Right - Hidden on mobile */}
          <button
            onClick={nextSlide}
            aria-label="Próximo projeto"
            className="hidden sm:flex absolute -right-3 sm:-right-6 lg:-right-12 top-1/2 -translate-y-1/2 z-30 h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-neutral-700/80 bg-black/85 text-white backdrop-blur-md hover:border-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] cursor-pointer group"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Slide Content Display with Strictly Locked Layout Height */}
          <div className="relative px-2 sm:px-6">
            <div className="flex flex-col items-center">
              {/* Authentic Laptop Mockup Container with Fixed Aspect Ratio & Solid Layout Lock */}
              <div className="relative w-full max-w-4xl select-none h-[220px] xs:h-[260px] sm:h-[380px] md:h-[460px] lg:h-[500px] flex items-center justify-center overflow-hidden">
                <img
                  key={currentProject.id}
                  src={currentProject.imageUrl}
                  alt={currentProject.title}
                  className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-opacity duration-300"
                  loading="eager"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

