import { Project } from '../types';

import cr7StoryImg from '../assets/images/loja_esportiva_cr7_1786736678642.jpg';
import nikeBannerImg from '../assets/images/banner_nike_sneaker_1786736687582.jpg';
import lvBannerImg from '../assets/images/banners_louis_vuitton_1786736697092.jpg';
import camagliImg from '../assets/images/loja_camagli_frete_1786736704977.jpg';
import geekStoreImg from '../assets/images/loja_mundo_geek_1786736713447.jpg';

export interface PortfolioInitialItem {
  id?: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  liveUrl?: string;
  demoId?: string;
  tags: string[];
  certified: boolean;
  createdAt?: string;
}

export const INITIAL_PORTFOLIO_SITES: PortfolioInitialItem[] = [
  {
    id: 'loja-cr7-sporty',
    title: "Hype Sporty - Camisas & Artigos Esportivos",
    category: "E-commerce",
    description: "Demonstração de Loja Finalizada — E-commerce completo com catálogo de clubes, seleções, pronta entrega e checkout integrado.",
    imageUrl: cr7StoryImg,
    liveUrl: "https://techify.com.br",
    tags: ["E-commerce", "Dropshipping", "Esportes"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner-nike-air-force',
    title: "Nike Air Force - Banner Promocional High-End",
    category: "Portfólio",
    description: "Criação de identidade visual e banner cinematográfico dark luxury com iluminação volumétrica dourada e render 3D.",
    imageUrl: nikeBannerImg,
    liveUrl: "https://techify.com.br",
    tags: ["Design Gráfico", "Banner 3D", "Sneakers"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'louis-vuitton-trainer',
    title: "Louis Vuitton LV Trainer - Banners de Luxo",
    category: "E-commerce",
    description: "Criação de lojas e banners exclusivos para calçados de grife com call-to-actions estratégicos e grid de luxo.",
    imageUrl: lvBannerImg,
    liveUrl: "https://techify.com.br",
    tags: ["Luxo", "Banners", "E-commerce"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'loja-camagli-express',
    title: "Camagli Express - Loja Profissional",
    category: "E-commerce",
    description: "Montagem completa de loja virtual com frete grátis, categorias circulares e catálogo multi-departamental.",
    imageUrl: camagliImg,
    liveUrl: "https://techify.com.br",
    tags: ["E-commerce", "Varejo", "Entrega"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'loja-primos-geek',
    title: "Primos Store - Mundo Geek & Animes",
    category: "E-commerce",
    description: "Loja virtual temática com visual inovador, banner do Vegeta Super Saiyan Blue e catálogo por animes.",
    imageUrl: geekStoreImg,
    liveUrl: "https://techify.com.br",
    tags: ["Geek", "Anime", "Action Figures"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-mugsys-mugs',
    title: "Mugsy's Mugs",
    category: "Landing Page",
    description: "Ver projeto interativo — E-commerce premium e disruptivo projetado para coleções limitadas de canecas com carrinho interativo e catálogo.",
    imageUrl: "https://i.postimg.cc/1zN0rTcN/img-1.jpg",
    liveUrl: "demo:mugsys-mugs",
    demoId: "mugsys-mugs",
    tags: ["Landing Page", "E-commerce", "Interativo"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-mindloop',
    title: "Mindloop Hub",
    category: "Plataforma",
    description: "Plataforma de conteúdo e newsletter futurista com animações fluidas, reveal progressivo e streaming em tempo real.",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    liveUrl: "demo:mindloop",
    demoId: "mindloop",
    tags: ["React", "Framer Motion", "Streaming"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-epic-designer',
    title: "EPIC DESIGNER",
    category: "Landing Page",
    description: "Branding, design gráfico de elite, cardápios digitais e experiência cinética e interativa para o setor gastronômico.",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
    liveUrl: "demo:yuffie",
    demoId: "yuffie",
    tags: ["Design Gráfico", "Cardápios", "Interface Cinética"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-wandr',
    title: "Wandr Travel",
    category: "Corporativo",
    description: "Portal de viagens e expedições com física de partículas na praia, animações fluidas e mapas dinâmicos.",
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    liveUrl: "demo:wandr",
    demoId: "wandr",
    tags: ["Corporativo", "Viagens", "Física de Partículas"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-asme',
    title: "Asme AI",
    category: "Landing Page",
    description: "Landing page futurista com vídeo responsivo em background, captura de e-mails instantânea e tipografia Instrument Serif.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    liveUrl: "demo:asme",
    demoId: "asme",
    tags: ["AI", "Landing Page", "Vídeo Reativo"],
    certified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-toonhub',
    title: "ToonHub 3D",
    category: "Plataforma",
    description: "Galeria e vitrine 3D interativa de colecionáveis e personagens cartoon com troca dinâmica de cores e navegação por gesto/swipe.",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    liveUrl: "demo:toonhub",
    demoId: "toonhub",
    tags: ["3D", "Personagens", "Navegação Swipe"],
    certified: true,
    createdAt: new Date().toISOString()
  }
];

export const PORTFOLIO_PRESET_IMAGES = [
  { label: 'Maria Eduarda - Estética Integrativa', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_maria_eduarda-1.png' },
  { label: 'Matteoni - Personal Trainer', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_matteoni.png' },
  { label: 'Brigada Garra - Treinamento & Segurança', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_brigada_garra.png' },
  { label: 'Dowell - Equipamentos Industriais', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_dowell.png' },
  { label: 'Top Trip - Agência de Viagens', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_top_trip.png' },
  { label: 'Desapega Peças - Autopeças', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_desapega_pecas.png' },
  { label: 'Fast Limp - Higienização Profissional', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_fast_limp.png' },
  { label: 'Dolls Tale - Moda & Brinquedos', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_dolls_tale.png' },
  { label: 'Flor de Liz - Vestuário & Moda', url: 'https://brainsistemas.com.br/wp-content/uploads/2024/01/brain_flor_de_liz.png' },
  { label: 'E-commerce Esportivo / CR7', url: cr7StoryImg },
  { label: 'Banner Sneaker Dark Luxury', url: nikeBannerImg },
  { label: 'Louis Vuitton LV Trainer', url: lvBannerImg },
  { label: 'Camagli Frete Expresso', url: camagliImg },
  { label: 'Primos Geek & Animes', url: geekStoreImg },
  { label: 'Tech & Dashboard Dark', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
  { label: 'Modern Studio Landing Page', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Design Gráfico Minimalista', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80' },
];
