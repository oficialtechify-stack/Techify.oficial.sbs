import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ShoppingBag, 
  Zap, 
  Layers, 
  Monitor,
  Eye,
  SlidersHorizontal,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Import authentic project deliverables images
import cr7StoryImg from '../assets/images/loja_esportiva_cr7_1786736678642.jpg';
import nikeBannerImg from '../assets/images/banner_nike_sneaker_1786736687582.jpg';
import lvBannerImg from '../assets/images/banners_louis_vuitton_1786736697092.jpg';
import camagliImg from '../assets/images/loja_camagli_frete_1786736704977.jpg';
import geekStoreImg from '../assets/images/loja_mundo_geek_1786736713447.jpg';

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  storyBadge: {
    text: string;
    bgColor: string;
    textColor: string;
    subBadge?: string;
  };
  image: string;
  details: string[];
  metrics: string;
  clientType: string;
  description: string;
}

export const SHOWCASE_DELIVERIES: ShowcaseItem[] = [
  {
    id: 'loja-cr7-sporty',
    title: 'Hype Sporty - Camisas & Artigos Esportivos',
    subtitle: 'Demonstração de Loja Finalizada com Catálogo Completo',
    category: 'E-Commerce Esportivo',
    storyBadge: {
      text: 'Demonstração Loja Finalizada !',
      bgColor: 'from-purple-600 to-indigo-600',
      textColor: 'text-white',
    },
    image: cr7StoryImg,
    details: [
      'Banner dinâmico com Cristiano Ronaldo & Lançamentos',
      'Categorias em carrossel circular: Brasileirão, Premier League, La Liga e Seleções',
      'Seção de pronta entrega regional + frete expresso gratuito',
      'Checkout transparente com Pix automatizado e rastreio de pedido'
    ],
    metrics: '+340% em conversão mobile no primeiro mês',
    clientType: 'Moda Esportiva & Camisas de Time',
    description: 'Estruturação de e-commerce esportivo completo com catálogo categorizado, integração de frete e checkout de alta conversão.'
  },
  {
    id: 'banner-nike-air-force',
    title: 'Nike Air Force - Banner Promocional & Visual Identity',
    subtitle: 'Composição Cinematográfica em Dark Luxury',
    category: 'Design & Banners',
    storyBadge: {
      text: 'SEJA MUITO BEM VINDO',
      bgColor: 'from-amber-600 to-yellow-500',
      textColor: 'text-black',
    },
    image: nikeBannerImg,
    details: [
      'Render 3D de alta definição com iluminação volumétrica',
      'Tipografia de impacto e contraste dark luxury com efeito glow dourado',
      'Otimizado para banners de topo em lojas Shopify, WooCommerce e Nuvemshop',
      'Formatos adaptados para desktop, tablet e stories do Instagram'
    ],
    metrics: 'Banner principal de alta retenção visual',
    clientType: 'Sneakers & Calçados Premium',
    description: 'Criação de identidade visual e banner de topo para loja de calçados premium, elevando a percepção de valor dos produtos.'
  },
  {
    id: 'louis-vuitton-trainer',
    title: 'Louis Vuitton LV Trainer - Banners de Grife',
    subtitle: 'Grid Estratégico para Coleções de Luxo & Artigos Exclusivos',
    category: 'Banners de Luxo',
    storyBadge: {
      text: 'CRIAÇÃO DE LOJAS • BANNERS',
      bgColor: 'from-neutral-900 to-neutral-800',
      textColor: 'text-[#d4af37]',
      subBadge: 'TÊNIS LOUIS VUITTON LV'
    },
    image: lvBannerImg,
    details: [
      'Showcase de modelos exclusivos: Skate Bege & White Black Edition',
      'Banners com chamadas estratégicas "BUY NOW" para conversão imediata',
      'Texturas marmorizadas e iluminação dourada de alta sofisticação',
      'Composição balanceada entre produto, texto e botões de compra'
    ],
    metrics: 'Layout focado em produtos de alto ticket',
    clientType: 'Artigos de Luxo & Grife',
    description: 'Conjunto completo de banners promocionais e catálogo visual para loja de artigos de luxo com detalhes minuciosos.'
  },
  {
    id: 'loja-camagli-frete-gratis',
    title: 'Camagli Express - E-Commerce Profissional',
    subtitle: 'Estruturação Multidepartamental com Frete Grátis',
    category: 'Loja Profissional',
    storyBadge: {
      text: 'Loja profissional ! Montamos e te entregamos a loja como você sempre sonhou !',
      bgColor: 'from-sky-600 to-blue-700',
      textColor: 'text-white',
    },
    image: camagliImg,
    details: [
      'Banner com caminhão 3D e selos de Frete Grátis para todo o Brasil',
      'Categorias circulares ilustradas: Ferramentas, Roupas, Beleza, Casa, Automotivo, etc.',
      'Header limpo com busca rápida, área de rastreio de pedido e suporte',
      'Seção de "Os mais vendidos" com prova social e avaliações'
    ],
    metrics: '100% pronta para faturar no primeiro dia',
    clientType: 'Loja Multi-Nicho & Dropshipping',
    description: 'Montagem completa de loja virtual pronta para vendas, incluindo configuração de frete, design personalizado e catálogo categorizado.'
  },
  {
    id: 'loja-mundo-geek-primos',
    title: 'Primos Store - Mundo Geek & Animes',
    subtitle: 'Visual Inovador com Personagens Épicos',
    category: 'E-Commerce Geek',
    storyBadge: {
      text: 'Mundo Geek • Imagina ter uma loja com visual inovador dessa forma !',
      bgColor: 'from-cyan-600 to-teal-700',
      textColor: 'text-white',
      subBadge: 'VEGETA SUPER SAIYAN BLUE'
    },
    image: geekStoreImg,
    details: [
      'Banner épico do Vegeta Super Saiyan Blue e colecionáveis oficiais',
      'Navegação por personagens: Dragon Ball, Naruto, Demon Slayer, Jujutsu, One Piece',
      'Condições de parcelamento em 12x e frete grátis destacados no topo',
      'Identidade visual personalizada para o público jovem e entusiasta'
    ],
    metrics: '+85% de tempo de permanência no site',
    clientType: 'Cultura Pop & Colecionáveis',
    description: 'Loja virtual temática desenvolvida com design imersivo e layout focado no público geek com catálogo por personagens.'
  }
];

// Helper to check match between a showcase item and a Firestore doc / title / id
function matchShowcaseItem(item: ShowcaseItem, docId: string, title: string, demoId?: string): boolean {
  const normItemId = item.id.toLowerCase();
  const normDocId = docId.toLowerCase();
  const normTitle = title.toLowerCase();
  const normItemTitle = item.title.toLowerCase();
  const normDemoId = (demoId || '').toLowerCase();

  if (normItemId === normDocId || normItemId === normDemoId) return true;
  if (normDocId.includes('cr7') || normDocId.includes('sporty') || normTitle.includes('cr7') || normTitle.includes('hype sporty') || normTitle.includes('camisas & artigos esportivos')) {
    return normItemId.includes('cr7') || normItemId.includes('sporty');
  }
  if (normDocId.includes('nike') || normTitle.includes('nike') || normTitle.includes('air force')) {
    return normItemId.includes('nike');
  }
  if (normDocId.includes('louis') || normDocId.includes('vuitton') || normDocId.includes('trainer') || normTitle.includes('louis vuitton') || normTitle.includes('lv trainer')) {
    return normItemId.includes('louis') || normItemId.includes('trainer');
  }
  if (normDocId.includes('camagli') || normTitle.includes('camagli')) {
    return normItemId.includes('camagli');
  }
  if (normDocId.includes('geek') || normDocId.includes('primos') || normTitle.includes('primos') || normTitle.includes('mundo geek')) {
    return normItemId.includes('geek') || normItemId.includes('primos');
  }
  return false;
}

function getInitialShowcaseItems(): ShowcaseItem[] {
  try {
    const cachedStr = localStorage.getItem('techify_custom_portfolio_images');
    if (cachedStr) {
      const cached = JSON.parse(cachedStr) as Record<string, string>;
      return SHOWCASE_DELIVERIES.map(item => {
        const foundKey = Object.keys(cached).find(k => matchShowcaseItem(item, k, k));
        if (foundKey && cached[foundKey]) {
          return { ...item, image: cached[foundKey] };
        }
        return item;
      });
    }
  } catch (err) {
    console.warn('Error reading showcase cache:', err);
  }
  return SHOWCASE_DELIVERIES;
}

interface ShowcaseCarouselProps {
  onOpenConsultation?: () => void;
}

export default function ShowcaseCarousel({ onOpenConsultation }: ShowcaseCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<ShowcaseItem[]>(getInitialShowcaseItems);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Sync with Firestore in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "portfolio"), (snapshot) => {
      const docsData: Array<{ id: string; title: string; imageUrl: string; description?: string; demoId?: string }> = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.imageUrl) {
          docsData.push({
            id: docSnap.id,
            title: data.title || '',
            imageUrl: data.imageUrl,
            description: data.description || '',
            demoId: data.demoId || ''
          });
        }
      });

      if (docsData.length > 0) {
        setItems(prevItems => {
          return prevItems.map(item => {
            const matched = docsData.find(d => matchShowcaseItem(item, d.id, d.title, d.demoId));
            if (matched && matched.imageUrl) {
              return {
                ...item,
                image: matched.imageUrl,
                title: matched.title || item.title,
                description: matched.description || item.description
              };
            }
            return item;
          });
        });
      }
    }, (err) => console.warn('Showcase carousel Firestore listener offline/error:', err.message));

    // Listen to local quick-update events
    const handleLocalUpdate = (e: Event) => {
      try {
        const customEvt = e as CustomEvent<{ id: string; imageUrl: string; title?: string }>;
        const detail = customEvt.detail;
        if (detail && detail.imageUrl) {
          setItems(prev => prev.map(item => {
            if (matchShowcaseItem(item, detail.id, detail.title || detail.id)) {
              return { ...item, image: detail.imageUrl };
            }
            return item;
          }));
        }
      } catch (err) {
        console.warn(err);
      }
    };

    window.addEventListener('techify-portfolio-updated', handleLocalUpdate);

    return () => {
      unsub();
      window.removeEventListener('techify-portfolio-updated', handleLocalUpdate);
    };
  }, []);

  // Check scroll position to update arrows
  const checkScrollLimits = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollLimits();
    el.addEventListener('scroll', checkScrollLimits, { passive: true });
    window.addEventListener('resize', checkScrollLimits);
    return () => {
      el.removeEventListener('scroll', checkScrollLimits);
      window.removeEventListener('resize', checkScrollLimits);
    };
  }, [checkScrollLimits]);

  const scrollBy = (offset: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800 bg-[#070907] p-4 sm:p-7 lg:p-9 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      
      {/* Background Ambient Aura */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),transparent_70%)] blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.08),transparent_70%)] blur-[90px]" />

      {/* Top Header: Badge, Title & Side-by-Side Navigation Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#22c55e]">Nossos Trabalhos & Entregas Reais</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> {items.length} Trabalhos Lado a Lado
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
              Demonstrações & Lojas Criadas pela Techify
            </h3>
          </div>
        </div>

        {/* Action Arrows & Drag Hint */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <span className="hidden md:inline-flex text-xs text-neutral-400 font-medium items-center gap-1 mr-2">
            <span>← Arraste ou use as setas →</span>
          </span>

          <button
            onClick={() => scrollBy(-380)}
            disabled={!canScrollLeft}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
              canScrollLeft 
                ? 'border-neutral-700 bg-neutral-900 text-white hover:border-[#22c55e] hover:bg-[#22c55e]/10 cursor-pointer' 
                : 'border-neutral-800/50 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-40'
            }`}
            title="Rolar para a esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => scrollBy(380)}
            disabled={!canScrollRight}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
              canScrollRight 
                ? 'border-neutral-700 bg-neutral-900 text-white hover:border-[#22c55e] hover:bg-[#22c55e]/10 cursor-pointer' 
                : 'border-neutral-800/50 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-40'
            }`}
            title="Rolar para a direita"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL SIDE-BY-SIDE (LADO A LADO) CAROUSEL TRACK */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`relative z-10 flex gap-5 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)', scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 w-[290px] sm:w-[330px] md:w-[350px] lg:w-[370px] snap-start flex flex-col rounded-2xl border border-neutral-800 bg-[#0a0f0b] p-3 sm:p-4 hover:border-[#22c55e]/60 transition-all duration-300 group hover:shadow-[0_10px_35px_rgba(34,197,94,0.15)]"
          >
            {/* Story Phone / Monitor Mockup Container with exact proportions */}
            <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-inner">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Story Overlay Top Sticker (Authentic Look as sent by user) */}
              <div className="absolute top-3 inset-x-3 flex flex-col items-center pointer-events-none z-20">
                <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${item.storyBadge.bgColor} text-center shadow-[0_8px_20px_rgba(0,0,0,0.7)] border border-white/20 backdrop-blur-md max-w-full`}>
                  <p className={`font-display text-[11px] sm:text-xs font-black tracking-wide ${item.storyBadge.textColor} leading-tight drop-shadow`}>
                    {item.storyBadge.text}
                  </p>
                  {item.storyBadge.subBadge && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-black/40 text-[9px] font-bold text-neutral-200 uppercase tracking-wider">
                      {item.storyBadge.subBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Vignette Gradient */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />

              {/* Card Bottom Meta & Zoom Click */}
              <div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-neutral-700 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  Item {index + 1} de {items.length}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemIndex(index);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 border border-neutral-600 text-white hover:bg-[#22c55e] hover:text-black hover:border-[#22c55e] transition-all shadow-md cursor-pointer"
                  title="Ver imagem ampliada"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Card Information */}
            <div className="mt-3.5 flex flex-col flex-1 justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-medium text-neutral-400">
                    {item.clientType.split('&')[0]}
                  </span>
                </div>
                <h4 className="font-display text-sm sm:text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-[#4ade80] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                <button
                  onClick={() => setSelectedItemIndex(index)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900/90 hover:bg-neutral-800 hover:border-neutral-600 px-3 py-2 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>Ver Detalhes</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenConsultation) {
                      onOpenConsultation();
                    } else {
                      window.open(`https://wa.me/5596984180424?text=Olá,%20gostei%20do%20trabalho%20${encodeURIComponent(item.title)}%20e%20gostaria%20de%20um%20orçamento!`, '_blank');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] px-3 py-2 text-xs font-bold text-black transition-colors cursor-pointer"
                  title="Pedir modelo similar"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Summary Bar with Fast WhatsApp Direct Contact */}
      <div className="relative z-10 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-neutral-800/80 bg-neutral-950/80 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-300">
            Gostou de algum dos nossos trabalhos? <strong className="text-white">Criamos a sua loja personalizada e pronta para vendas.</strong>
          </p>
        </div>

        <button
          onClick={onOpenConsultation}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] px-5 py-2.5 text-xs font-black text-black transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] cursor-pointer shrink-0"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>SOLICITAR ORÇAMENTO DE LOJA</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedItemIndex !== null && items[selectedItemIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6 backdrop-blur-xl"
            onClick={() => setSelectedItemIndex(null)}
          >
            <div 
              className="relative max-w-4xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItemIndex(null)}
                className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer z-50"
                title="Fechar (Esc)"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Prev / Next within Lightbox */}
              <button
                onClick={() => setSelectedItemIndex((prev) => (prev! - 1 + items.length) % items.length)}
                className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 border border-neutral-700 text-white hover:border-[#22c55e] hover:text-[#22c55e] transition-colors z-50"
                title="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedItemIndex((prev) => (prev! + 1) % items.length)}
                className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 border border-neutral-700 text-white hover:border-[#22c55e] hover:text-[#22c55e] transition-colors z-50"
                title="Próximo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Lightbox Image Container */}
              <div className="relative max-h-[75vh] overflow-hidden rounded-2xl border-2 border-neutral-700 bg-black shadow-2xl">
                <img 
                  src={items[selectedItemIndex].image} 
                  alt={items[selectedItemIndex].title}
                  className="max-h-[75vh] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />

                {/* Overlay Header Sticker */}
                <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none">
                  <div className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${items[selectedItemIndex].storyBadge.bgColor} text-center shadow-2xl border border-white/20`}>
                    <p className={`font-display text-sm font-black tracking-wide ${items[selectedItemIndex].storyBadge.textColor}`}>
                      {items[selectedItemIndex].storyBadge.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lightbox Footer Info */}
              <div className="mt-4 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-neutral-950/90 border border-neutral-800 rounded-xl p-4">
                <div>
                  <h5 className="font-display text-base font-bold text-white">
                    {items[selectedItemIndex].title}
                  </h5>
                  <p className="text-xs text-[#4ade80] font-medium">
                    {items[selectedItemIndex].subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedItemIndex(null);
                      if (onOpenConsultation) onOpenConsultation();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] px-4 py-2 text-xs font-bold text-black transition-colors cursor-pointer"
                  >
                    <span>Quero Uma Loja Assim</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
