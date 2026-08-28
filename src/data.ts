import { Project, Service, Course, Job } from './types';

export const SERVICES: Service[] = [
  {
    id: 'sites',
    title: 'CRIAÇÃO DE SITES',
    iconName: 'Globe',
    description: 'Websites modernos, responsivos e otizados para conversão que geram resultados reais.',
    color: '#06b6d4' // blue/cyan info
  },
  {
    id: 'design',
    title: 'DESIGN GRÁFICO',
    iconName: 'Palette',
    description: 'Identidade visual única, logos, banners e materiais gráficos que representam sua marca.',
    color: '#f97316' // orange
  },
  {
    id: 'dev',
    title: 'DESENVOLVIMENTO',
    iconName: 'Monitor',
    description: 'Código limpo, performático e escalável para qualquer tipo de projeto digital.',
    color: '#94a3b8' // white/silver
  },
  {
    id: 'seo',
    title: 'OTIMIZAÇÃO & SEO',
    iconName: 'Zap',
    description: 'Performance máxima e visibilidade no Google para seu site aparecer na frente.',
    color: '#22c55e' // green
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'mindloop',
    title: 'Mindloop Hub',
    category: 'Plataforma',
    description: 'Landing page conceitual dark monochrome para a Mindloop. Uma plataforma de conteúdo e newsletter futurista, integrando animações fluidas staggereadas do Framer Motion, reveal progressivo de palavras orientado por scroll e reprodução responsiva de HLS live streaming.',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'Framer Motion', 'hls.js', 'Monochrome design', 'Scroll word reveal'],
    certified: true
  },
  {
    id: 'yuffie',
    title: 'Yuffie Kinetic Interface',
    category: 'Portfólio',
    description: 'Uma belíssima interface cinética interativa japonesa de alta fidelidade visual (v4). Possui fluxo contínuo de pétalas fluidas orientais reagindo ao mouse, reprodutor premium de áudio integrado com barra de progresso, e efeito parallax responsivo de movimentação gradual de multicamadas.',
    imageUrl: 'https://u.cubeupload.com/zmonochrome/tumblr8b1866a9355004.jpg',
    tags: ['React', 'Interactive Particle Canvas', 'HTML5 Audio Engine', 'Smooth Parallax LERP'],
    certified: true
  },
  {
    id: 'wandr',
    title: 'Wandr. Beach Shoreline',
    category: 'Portfólio',
    description: 'Uma belíssima e inovadora landing page conceitual de viagem com reveal dinâmico de areia e mar de alta fidelidade baseada em scroll físico. Utiliza física de partículas vetoriais em tempo real no foam-spray, curvas senoidais interativas no foam-band, paralelismo de multicamadas com suavização LERP e paleta costeira orgânica.',
    imageUrl: 'https://cdn.corenexis.com/files/c/1878763720.jpg',
    tags: ['React', 'GSAP & ScrollTrigger', 'Fluid SVG Waveforms', 'Interactive Parallax LERP', 'Interactive Grain Overlay'],
    certified: true
  },
  {
    id: 'mugsys-mugs',
    title: "Mugsy's Mugs",
    category: 'Landing Page',
    description: 'E-commerce premium e disruptivo projetado para coleções limitadas de canecas. Apresenta carrinho de compras interativo, transições de swipe contínuas, filtro de categoria dinâmico e modal de descrição de produtos de altíssima fidelidade estética.',
    imageUrl: 'https://i.postimg.cc/1zN0rTcN/img-1.jpg',
    tags: ['React', 'Interactive Cart Engine', 'Double Swipe Animations', 'Tailwind v4'],
    certified: true
  }
];

export const COURSES: Course[] = [
  {
    id: 'acad-techify',
    title: 'Academia Techify',
    category: 'Desenvolvimento',
    description: 'Cursos gratuitos de programação, design, idiomas, massagem e muito mais. IA gera aulas personalizadas pra você!',
    badge: { text: 'GRÁTIS', type: 'free' },
    duration: '40-120h',
    lessonsCount: 24
  },
  {
    id: 'idiomas',
    title: 'Aprenda Idiomas',
    category: 'Idiomas',
    description: 'Inglês americano, Português de Portugal, Espanhol, Japonês, Francês... com gírias e imersão cultural real!',
    badge: { text: 'MULTI-LÍNGUAS', type: 'languages' },
    duration: '60h por idioma',
    lessonsCount: 15
  },
  {
    id: 'ia-tutor',
    title: 'IA Tutora 24/7',
    category: 'Inteligência Artificial',
    description: 'Techify IA responde suas dúvidas, explica conceitos e te guia com voz, chat e trilhas personalizadas em tempo real.',
    badge: { text: 'IA', type: 'primary' },
    duration: 'Ilimitado',
    lessonsCount: 100
  }
];

export const JOBS: Job[] = [
  {
    id: 'api-designer',
    title: 'API Designer',
    category: 'Desenvolvimento',
    location: 'Remoto',
    type: 'Tempo Integral',
    description: 'Designs intuitive, scalable API architectures — REST and GraphQL endpoint design, OpenAPI specifications, authentication patterns, versioning strategies, and developer experience optimization. Analyzes business domain models and client requirements, then designs APIs following API-first principles: resource-oriented architecture, proper HTTP semantics, consistent naming, and comprehensive OpenAPI 3.1 specifications.',
    salary: 'R$ 14.000 - R$ 18.000 / mês',
    requirements: [
      'Proven expertise in REST and GraphQL architectures following API-first principles',
      'Design of secure authentication flows: OAuth 2.0, JWT, and API keys validation',
      'Advanced versioning strategies (URI, HTTP headers, content-type) and cursor-based pagination',
      'Comprehensive specs compilation inside complete OpenAPI 3.1 or GraphQL type system schema structures',
      'GraphQL proficiency on mutation patterns, federation protocols, subscriptions, and sub-queries complexity management'
    ]
  }
];
export const MOCK_ROLES = ['Todos', 'Design', 'Desenvolvimento', 'Marketing', 'Vendas', 'Outro'];
export const PORTFOLIO_CATEGORIES = ['Todos', 'Landing Page', 'Corporativo', 'E-commerce', 'Blog', 'Portfólio', 'Plataforma', 'Outro'];
