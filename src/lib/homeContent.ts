import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface HomeHeroData {
  eyebrow: string;
  headline1: string;
  headline2: string;
  headline3: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustBadges: string[];
  videoUrl?: string;
}

export interface HomeCompetitorData {
  badge: string;
  headline1: string;
  headline2: string;
  description: string;
  ctaText: string;
}

export interface HomeServiceItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  tag: string;
  highlight?: boolean;
  deliverables: string[];
}

export interface HomePillarItem {
  id: string;
  label: string;
  iconName: string;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  metrics: {
    label1: string;
    val1: string;
    sub1: string;
    label2: string;
    val2: string;
    sub2: string;
    label3: string;
    val3: string;
    sub3: string;
    label4: string;
    val4: string;
    sub4: string;
  };
}

export interface HomePlanItem {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  monthlyPrice: string;
  annualPrice: string;
  periodText: string;
  description: string;
  includesHeader?: string;
  features: string[];
  ctaText: string;
  buttonVariant?: 'default' | 'outline';
  whatsappMessage: string;
}

export interface HomeFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface HomeComparisonData {
  title: string;
  subtitle: string;
  badPoints: string[];
  goodPoints: string[];
}

export interface HomeBottomCtaData {
  headline: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface HomePageContent {
  hero: HomeHeroData;
  clientTicker: string[];
  competitor: HomeCompetitorData;
  services: HomeServiceItem[];
  pillars: HomePillarItem[];
  comparison: HomeComparisonData;
  plans: HomePlanItem[];
  faqs: HomeFaqItem[];
  bottomCta: HomeBottomCtaData;
}

export const DEFAULT_HOME_PAGE_CONTENT: HomePageContent = {
  hero: {
    eyebrow: "A Solução Definitiva",
    headline1: "ESTRUTURA COMPLETA",
    headline2: "PARA SUA EMPRESA",
    headline3: "CRESCER",
    description: "Unimos desenvolvimento de sites e sistemas, design de alto impacto e marketing estratégico. Uma experiência completa conduzida por um time pronto para acelerar seus resultados. Nossa equipe de especialistas cuida de toda a sua estratégia digital para o seu negócio escalar.",
    ctaPrimary: "FALAR COM ENGENHEIRO",
    ctaSecondary: "VER O QUE JÁ FIZEMOS",
    trustBadges: [
      "Sites & Sistemas Sob Medida",
      "Design de Alto Impacto",
      "Marketing & Performance",
      "Inteligência Artificial"
    ],
    videoUrl: "https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/cinematic.mp4"
  },
  clientTicker: [
    "ASME AI",
    "MUGSYS MUGS",
    "EPIC DESIGNER",
    "AGENCYOS",
    "KALDI",
    "HYPE SPORTY",
    "TOONHUB",
    "WANDR",
    "YUFFIE",
    "MARIA EDUARDA",
    "MATTEONI"
  ],
  competitor: {
    badge: "Presença Digital Estratégica",
    headline1: "Seu concorrente aparece no Google.",
    headline2: "E o seu negócio?",
    description: "Se o cliente não encontra a sua empresa na internet, ele compra de quem ele encontra. A Techify faz o site, o sistema de gestão e a estratégia que colocam o seu negócio na frente.",
    ctaText: "QUERO APARECER PRIMEIRO"
  },
  services: [
    {
      id: 'sites_sistemas',
      name: 'Sites & Sistemas Web',
      subtitle: 'Engenharia de alta velocidade',
      description: 'Plataformas web modernas, web apps, e-commerces e sistemas sob medida com React, TypeScript e arquitetura serverless.',
      iconName: 'Globe',
      tag: 'Core Tech',
      highlight: true,
      deliverables: ['Landing pages de alta conversão', 'Sistemas e painéis administrativos', 'Código 100% limpo e responsivo']
    },
    {
      id: 'design_uiux',
      name: 'Design de Alto Impacto & UI/UX',
      subtitle: 'Visual e experiência cinematográfica',
      description: 'Design systems exclusivos, interfaces cinéticas, protótipos de alta fidelidade e micro-interações que elevam a percepção de valor da sua marca.',
      iconName: 'Palette',
      tag: 'Visual Lab',
      deliverables: ['Identidade visual & branding', 'Prototipagem interativa no Figma', 'Design System escalável']
    },
    {
      id: 'marketing_performance',
      name: 'Marketing Estratégico & Tráfego',
      subtitle: 'Escala e vendas previsíveis',
      description: 'Gestão de tráfego pago (Meta Ads e Google Ads), funis de aquisição de clientes e otimização contínua de taxa de conversão (CRO).',
      iconName: 'BarChart3',
      tag: 'Crescimento',
      deliverables: ['Gestão de campanhas Meta & Google', 'Estruturação de funis de vendas', 'Dashboards de ROI em tempo real']
    },
    {
      id: 'ia_automacoes',
      name: 'IA & Automações Inteligentes',
      subtitle: 'Inteligência Artificial aplicada',
      description: 'Integração de agentes autônomos, assistentes com RAG sobre dados da sua empresa e automações de atendimento e processos.',
      iconName: 'Bot',
      tag: 'Inovação',
      highlight: true,
      deliverables: ['Agentes de IA e assistentes 24/7', 'Automação de workflows complexos', 'Pipelines de dados e scrapers']
    },
    {
      id: 'apps_mobile',
      name: 'Aplicativos Mobile',
      subtitle: 'iOS & Android sob medida',
      description: 'Aplicativos móveis fluidos, rápidos e intuitivos com sincronização em nuvem e notificações em tempo real.',
      iconName: 'Smartphone',
      tag: 'Mobile First',
      deliverables: ['Apps nativos e multiplataforma', 'Notificações push e offline-first', 'Integração com gateways e APIs']
    },
    {
      id: 'performance_seo',
      name: 'Otimização Extrema & SEO',
      subtitle: 'Velocidade e topo do Google',
      description: 'Carregamento sub-segundo, Core Web Vitals nota 100 e arquitetura técnica preparada para indexação e autoridade orgânica.',
      iconName: 'Zap',
      tag: 'Performance',
      deliverables: ['Google PageSpeed nota 95+', 'SEO semântico e estruturado', 'Criptografia e segurança reforçada']
    }
  ],
  pillars: [
    {
      id: 'engenharia',
      label: 'Engenharia de Software',
      iconName: 'Code2',
      badge: 'Desenvolvimento Web & Cloud',
      title: 'Aplicações robustas, rápidas e preparadas para milhões de acessos',
      description: 'Construímos produtos digitais com as tecnologias mais modernas do mercado. Do banco de dados ao front-end, tudo é projetado para máxima performance, segurança e escalabilidade sem gargalos.',
      bullets: [
        'Stack moderna com React, TypeScript, Tailwind e Node.js',
        'Arquitetura em nuvem com alta disponibilidade (99.99% SLA)',
        'Bancos de dados otimizados com consultas em milissegundos'
      ],
      metrics: {
        label1: 'TEMPO DE LOAD',
        val1: '< 0.4s',
        sub1: '↗ Ultra-rápido',
        label2: 'UPTIME SLA',
        val2: '99.99%',
        sub2: '↗ Alta estabilidade',
        label3: 'CORE WEB VITALS',
        val3: '100/100',
        sub3: '↗ Nota máxima Google',
        label4: 'SEGURANÇA',
        val4: 'AES-256',
        sub4: '↗ Criptografia ponta a ponta'
      }
    },
    {
      id: 'design',
      label: 'Design & Motion Lab',
      iconName: 'Palette',
      badge: 'Identidade Visual & UI/UX',
      title: 'Interfaces memoráveis que transformam visitantes casuais em clientes fiéis',
      description: 'Unimos psicologia visual, tipografia refinada e micro-interações cinéticas para criar experiências digitais que se destacam e comunicam autoridade imediata no seu mercado.',
      bullets: [
        'Prototipagem navegável em alta fidelidade',
        'Laboratório de animações e física interativa (Motion Lab)',
        'Design responsivo impecável em celulares, tablets e desktops'
      ],
      metrics: {
        label1: 'TAXA DE RETENÇÃO',
        val1: '+42%',
        sub1: '↗ Tempo na página',
        label2: 'SATISFAÇÃO UI/UX',
        val2: '98.7%',
        sub2: '↗ Avaliação positiva',
        label3: 'FRAMES POR SEG',
        val3: '60 FPS',
        sub3: '↗ Fluidez máxima',
        label4: 'CONVERSÃO VISUAL',
        val4: '3.4x',
        sub4: '↗ Mais leads gerados'
      }
    },
    {
      id: 'marketing',
      label: 'Marketing & Performance',
      iconName: 'TrendingUp',
      badge: 'Aquisição & Tráfego Estratégico',
      title: 'Estratégias de vendas digitais validadas para acelerar seu faturamento',
      description: 'Não basta ter um site bonito: é preciso atrair o público certo e converter visitantes em contratos fechados. Gerenciamos suas campanhas de tráfego com foco obsessivo em ROI positivo.',
      bullets: [
        'Campanhas orientadas por dados em Meta Ads e Google Ads',
        'Testes A/B constantes de copy, criativos e páginas de captura',
        'Rastreamento preciso de conversões com CAPI e Google Tag Manager'
      ],
      metrics: {
        label1: 'ROAS MÉDIO',
        val1: '4.8x',
        sub1: '↗ Retorno sobre ads',
        label2: 'LEADS QUALIFICADOS',
        val2: '+180%',
        sub2: '↗ Crescimento mensal',
        label3: 'CPA REDUZIDO',
        val3: '-34%',
        sub3: '↘ Custo por aquisição',
        label4: 'DASHBOARD',
        val4: 'Real-time',
        sub4: '↗ Métricas transparentes'
      }
    },
    {
      id: 'ia',
      label: 'IA & Automações',
      iconName: 'Bot',
      badge: 'Inteligência Artificial Proprietária',
      title: 'Transforme seus processos manuais em fluxos autônomos e inteligentes',
      description: 'Desenvolvemos assistentes de inteligência artificial personalizados e automações corporativas integradas ao seu banco de dados, CRM e WhatsApp para operar 24 horas por dia.',
      bullets: [
        'Modelos de IA integrados com a base de conhecimento da sua empresa',
        'Automações de atendimento e qualificação de leads',
        'Sistemas de extração de dados e alertas automáticos'
      ],
      metrics: {
        label1: 'DISPONIBILIDADE',
        val1: '24/7/365',
        sub1: '↗ Atendimento sem pausa',
        label2: 'TEMPO RESPOSTA',
        val2: '< 1.2s',
        sub2: '↗ Instantâneo',
        label3: 'ECONOMIA TEMPO',
        val3: '65%',
        sub3: '↘ Redução operacional',
        label4: 'PRECISÃO RAG',
        val4: '99.2%',
        sub4: '↗ Contexto seguro'
      }
    }
  ],
  comparison: {
    title: "Por que escolher a Techify como sua parceira de tecnologia?",
    subtitle: "Veja o abismo entre o desenvolvimento amador e o padrão de engenharia profissional da Techify.",
    badPoints: [
      "Templates genéricos de WordPress lentos e cheios de plugins vulneráveis.",
      "Sites pesados que demoram mais de 4 segundos para carregar no celular.",
      "Falta de alinhamento entre o design e a estratégia real de conversão em vendas.",
      "Suporte demorado, código ilegível e dependência eterna de terceiros."
    ],
    goodPoints: [
      "Código proprietário, moderno e sem gambiarras com React, TypeScript e Cloud.",
      "Carregamento sub-segundo com nota máxima nos testes do Google PageSpeed.",
      "Design visual cinematográfico pensado estrategicamente para converter visitantes em clientes.",
      "Engenheiros de software dedicados, prazos rigorosos e suporte contínuo de verdade."
    ]
  },
  plans: [
    {
      id: 'starter',
      name: 'Starter • Tração & Vendas',
      badge: 'ENTRADA RÁPIDA',
      popular: false,
      monthlyPrice: 'R$ 197',
      annualPrice: 'R$ 157',
      periodText: 'mês (ou sob medida)',
      description: 'Ideal para profissionais liberais, clínicas e pequenos negócios que precisam de presença online de alto impacto e agendamentos diretos.',
      includesHeader: 'Incluso no Starter:',
      buttonVariant: 'outline',
      features: [
        'Landing Page ou Site Institucional de Ultra Velocidade',
        'Design Responsivo adaptado para Smartphones e Desktops',
        'Botão Direto para Conversão no WhatsApp & Rastreamento de Leads',
        'Otimização SEO Básica no Google Maps & Busca',
        'Hospedagem em Nuvem de Alta Disponibilidade',
        'Suporte Técnico Dedicado via WhatsApp'
      ],
      ctaText: 'COMEÇAR NO STARTER',
      whatsappMessage: 'Olá Techify! Gostaria de contratar o Plano Starter (Tração & Vendas).'
    },
    {
      id: 'pro-growth',
      name: 'Pro • Full Growth 360°',
      badge: 'MAIS POPULAR • RECOMENDADO',
      popular: true,
      monthlyPrice: 'R$ 497',
      annualPrice: 'R$ 397',
      periodText: 'mês (ou pacote fechado)',
      description: 'A solução digital definitiva: Desenvolvimento completo + Design cinematográfico + Gestão de Tráfego e Redes Sociais.',
      includesHeader: 'Tudo do Plano Starter, mais:',
      buttonVariant: 'default',
      features: [
        'Site Multi-Páginas ou E-Commerce com Catálogo Completo',
        'Design System Exclusivo & Motion Lab Cinematográfico',
        'Gestão e Otimização de Tráfego Pago (Meta Ads & Google Ads)',
        'Painel Administrativo Customizado para Edição de Conteúdo',
        'Integração de Agente Inteligente / Bot de Atendimento 24/7',
        'Garantia de Teste Gratuito de Design antes da entrega final'
      ],
      ctaText: 'GARANTIR PLANO PRO',
      whatsappMessage: 'Olá Techify! Quero contratar o Plano Pro • Full Growth 360° com todas as vantagens.'
    },
    {
      id: 'enterprise-lab',
      name: 'Scale • Enterprise Lab',
      badge: 'ESCALA MÁXIMA',
      popular: false,
      monthlyPrice: 'R$ 997',
      annualPrice: 'R$ 797',
      periodText: 'mês (ou projeto corporativo)',
      description: 'Engenharia de software sob medida, web apps complexos, aplicativos mobile para iOS/Android e arquiteturas com múltiplos servidores.',
      includesHeader: 'Tudo do Plano Pro, mais:',
      buttonVariant: 'outline',
      features: [
        'Desenvolvimento de Web App / Plataforma SaaS ou App Mobile Nativo',
        'Arquitetura Cloud Serverless com Banco de Dados em Tempo Real',
        'Pipelines de Automação com Modelos de Inteligência Artificial RAG',
        'Dashboard de Métricas Executivas e Relatórios em Tempo Real',
        'Squad de Engenharia Dedicado com Reuniões Semanais de Sprint',
        'SLA Prioritário 24/7 com Resposta em Menos de 1 Hora'
      ],
      ctaText: 'FALAR COM ESPECIALISTA',
      whatsappMessage: 'Olá Techify! Tenho interesse no Plano Scale • Enterprise Lab para um projeto de grande porte.'
    }
  ],
  faqs: [
    {
      id: 'faq_1',
      question: 'O que a Techify faz exatamente?',
      answer: 'A Techify é um estúdio de engenharia de software e design digital de alto impacto. Nós cuidamos de toda a sua presença e infraestrutura na internet: desenvolvimento de sites e sistemas web, criação de aplicativos, design de UI/UX, gestão de tráfego pago, inteligência artificial e automação de processos.'
    },
    {
      id: 'faq_2',
      question: 'Quanto tempo leva para desenvolver um projeto?',
      answer: 'O prazo varia de acordo com o escopo: landing pages e sites institucionais de alta conversão levam geralmente de 5 a 12 dias úteis. Projetos de sistemas complexos, web apps e aplicativos mobile personalizados levam em média de 3 a 6 semanas com entregas contínuas em sprints.'
    },
    {
      id: 'faq_3',
      question: 'Qual é a tecnologia utilizada nos projetos da Techify?',
      answer: 'Utilizamos tecnologias de ponta adotadas pelas maiores empresas de tecnologia do mundo: React, TypeScript, Tailwind CSS, Next.js, Node.js, arquitetura Cloud Serverless, bancos de dados em tempo real e integração com as APIs de inteligência artificial mais avançadas (Google Gemini, OpenAI, Claude).'
    },
    {
      id: 'faq_4',
      question: 'A Techify também cuida do tráfego pago e marketing da minha empresa?',
      answer: 'Sim! Unimos a engenharia de páginas ultra-rápidas com a gestão estratégica de tráfego pago em Meta Ads (Instagram/Facebook) e Google Ads, garantindo que o seu público-alvo chegue até o seu negócio e encontre uma experiência de compra irresistível.'
    },
    {
      id: 'faq_5',
      question: 'Como funciona o suporte e manutenção após o lançamento?',
      answer: 'Todos os projetos contam com garantia técnica, monitoramento contínuo de estabilidade, backups automáticos e suporte direto com a nossa equipe de engenharia via canal prioritário no WhatsApp e painel de atendimento.'
    },
    {
      id: 'faq_6',
      question: 'Como posso solicitar um orçamento ou falar com um engenheiro?',
      answer: 'Basta clicar no botão "Falar com Engenheiro" nesta página ou abrir a área de atendimento. Você será direcionado para uma consultoria diagnóstica gratuita para entender as necessidades exatas do seu negócio.'
    }
  ],
  bottomCta: {
    headline: "Pronto para construir o futuro da sua empresa?",
    description: "Fale diretamente com os nossos engenheiros e inicie o desenvolvimento da sua plataforma com quem entende de alta performance.",
    ctaPrimary: "FALAR COM ENGENHEIRO",
    ctaSecondary: "VER NOSSO PORTFÓLIO"
  }
};

const HOME_CACHE_KEY = 'techify_home_page_content_cache';

export function getCachedHomePageContent(): HomePageContent {
  try {
    const raw = localStorage.getItem(HOME_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_HOME_PAGE_CONTENT,
        ...parsed,
        hero: { ...DEFAULT_HOME_PAGE_CONTENT.hero, ...(parsed.hero || {}) },
        competitor: { ...DEFAULT_HOME_PAGE_CONTENT.competitor, ...(parsed.competitor || {}) },
        comparison: { ...DEFAULT_HOME_PAGE_CONTENT.comparison, ...(parsed.comparison || {}) },
        bottomCta: { ...DEFAULT_HOME_PAGE_CONTENT.bottomCta, ...(parsed.bottomCta || {}) },
        clientTicker: Array.isArray(parsed.clientTicker) && parsed.clientTicker.length > 0 ? parsed.clientTicker : DEFAULT_HOME_PAGE_CONTENT.clientTicker,
        services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : DEFAULT_HOME_PAGE_CONTENT.services,
        pillars: Array.isArray(parsed.pillars) && parsed.pillars.length > 0 ? parsed.pillars : DEFAULT_HOME_PAGE_CONTENT.pillars,
        plans: Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : DEFAULT_HOME_PAGE_CONTENT.plans,
        faqs: Array.isArray(parsed.faqs) && parsed.faqs.length > 0 ? parsed.faqs : DEFAULT_HOME_PAGE_CONTENT.faqs
      };
    }
  } catch (err) {
    console.warn('Error reading home page cached content:', err);
  }
  return DEFAULT_HOME_PAGE_CONTENT;
}

export function initHomePageListener(callback: (content: HomePageContent) => void): () => void {
  const unsub = onSnapshot(doc(db, "site_content", "home_page"), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Partial<HomePageContent>;
      const merged: HomePageContent = {
        ...DEFAULT_HOME_PAGE_CONTENT,
        ...data,
        hero: { ...DEFAULT_HOME_PAGE_CONTENT.hero, ...(data.hero || {}) },
        competitor: { ...DEFAULT_HOME_PAGE_CONTENT.competitor, ...(data.competitor || {}) },
        comparison: { ...DEFAULT_HOME_PAGE_CONTENT.comparison, ...(data.comparison || {}) },
        bottomCta: { ...DEFAULT_HOME_PAGE_CONTENT.bottomCta, ...(data.bottomCta || {}) },
        clientTicker: Array.isArray(data.clientTicker) && data.clientTicker.length > 0 ? data.clientTicker : DEFAULT_HOME_PAGE_CONTENT.clientTicker,
        services: Array.isArray(data.services) && data.services.length > 0 ? data.services : DEFAULT_HOME_PAGE_CONTENT.services,
        pillars: Array.isArray(data.pillars) && data.pillars.length > 0 ? data.pillars : DEFAULT_HOME_PAGE_CONTENT.pillars,
        plans: Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : DEFAULT_HOME_PAGE_CONTENT.plans,
        faqs: Array.isArray(data.faqs) && data.faqs.length > 0 ? data.faqs : DEFAULT_HOME_PAGE_CONTENT.faqs
      };
      localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(merged));
      callback(merged);
    }
  }, (err) => {
    console.warn('Home page content listener offline:', err.message);
  });

  const handleCustomUpdate = (e: Event) => {
    try {
      const customEvt = e as CustomEvent<HomePageContent>;
      if (customEvt.detail) {
        callback(customEvt.detail);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  window.addEventListener('techify-home-content-updated', handleCustomUpdate);

  return () => {
    unsub();
    window.removeEventListener('techify-home-content-updated', handleCustomUpdate);
  };
}

export async function saveHomePageContentToFirestore(content: HomePageContent): Promise<void> {
  localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent('techify-home-content-updated', { detail: content }));

  await setDoc(doc(db, "site_content", "home_page"), {
    ...content,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // Also sync hero to general
  try {
    await setDoc(doc(db, "site_content", "general"), {
      heroHeadline1: content.hero.headline1,
      heroHeadline2: `${content.hero.headline2} ${content.hero.headline3}`,
      heroDescription: content.hero.description,
      heroCtaPrimary: content.hero.ctaPrimary,
      heroCtaSecondary: content.hero.ctaSecondary,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Sync to general skipped:', err);
  }
}

export interface PackageOffer {
  id: string;
  badge?: string;
  popular?: boolean;
  title: string;
  subtitle: string;
  originalPrice?: string;
  currentPrice: string;
  periodText?: string;
  description: string;
  features: string[];
  designStyleHighlight?: string;
  ctaText: string;
  whatsappMessage: string;
}

export const DEFAULT_PACKAGES: PackageOffer[] = [
  {
    id: 'pacote-completo-360',
    popular: true,
    badge: 'OFERTA COMPLETA • MAIS VENDIDO',
    title: 'Pacote Full Growth 360°',
    subtitle: 'Site + Qualquer Estilo de Design + Marketing + Redes Sociais',
    originalPrice: 'R$ 2.300',
    currentPrice: 'R$ 580',
    periodText: 'pagamento único / condição especial',
    description: 'A solução digital definitiva para posicionar sua marca com autoridade imediata, design personalizado e fluxo contínuo de clientes.',
    features: [
      'Site Profissional ou Landing Page de Ultra Performance',
      'Design Exclusivo em qualquer estilo visual desejado (Dark Luxury, Minimalista, Cyber, B2B Corporativo, etc.)',
      'Estratégia & Configuração de Marketing Digital para Captação',
      'Gestão & Criação de Conteúdo para Redes Sociais',
      'Otimização SEO para destaque nos mecanismos de busca',
      'Botões inteligentes de conversão direta para o WhatsApp',
      'Painel intuitivo para controle e atualização de conteúdo',
      'Garantia de Teste Gratuito de Design antes da entrega final'
    ],
    designStyleHighlight: 'Design 100% customizado no estilo da sua preferência',
    ctaText: 'GARANTIR PACOTE COMPLETO',
    whatsappMessage: 'Olá Techify! Quero aproveitar o Pacote Full Growth 360° (Site + Design + Marketing + Redes Sociais) de R$ 2.300 por apenas R$ 580.'
  },
  {
    id: 'pacote-site-marketing',
    popular: false,
    badge: 'ALTA CONVERSÃO',
    title: 'Pacote Tração & Vendas',
    subtitle: 'Site Profissional + Estratégia de Marketing',
    originalPrice: 'R$ 890',
    currentPrice: 'R$ 350',
    periodText: 'pagamento único',
    description: 'Estrutura ágil e focada em resultados para quem deseja uma presença online elegante com geração ativa de oportunidades comerciais.',
    features: [
      'Site Institucional de Alta Velocidade e Responsivo (Mobile & Desktop)',
      'Configuração Estratégica de Marketing & Tráfego de Entrada',
      'Layout moderno com identidade visual profissional',
      'Integração direta com WhatsApp e canais de atendimento',
      'Carregamento instantâneo com infraestrutura moderna',
      'Amostra Gratuita inicial para validação de estilo'
    ],
    designStyleHighlight: 'Estrutura otimizada para geração imediata de contatos',
    ctaText: 'QUERO SITE + MARKETING',
    whatsappMessage: 'Olá Techify! Gostaria de contratar o Pacote Tração & Vendas (Site + Marketing) por R$ 350.'
  }
];

const PACKAGES_CACHE_KEY = 'techify_packages_cache';

export function getCachedPackages(): PackageOffer[] {
  try {
    const raw = localStorage.getItem(PACKAGES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Error reading packages cache:', err);
  }
  return DEFAULT_PACKAGES;
}

export function initPackagesListener(callback: (packages: PackageOffer[]) => void): () => void {
  const unsub = onSnapshot(doc(db, "site_content", "packages"), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.packages) && data.packages.length > 0) {
        localStorage.setItem(PACKAGES_CACHE_KEY, JSON.stringify(data.packages));
        callback(data.packages);
      }
    }
  }, (err) => {
    console.warn('Packages listener offline:', err.message);
  });

  const handleCustomEvent = (e: Event) => {
    try {
      const customEvt = e as CustomEvent<PackageOffer[]>;
      if (customEvt.detail) {
        callback(customEvt.detail);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  window.addEventListener('techify-packages-updated', handleCustomEvent);

  return () => {
    unsub();
    window.removeEventListener('techify-packages-updated', handleCustomEvent);
  };
}

export async function savePackagesToFirestore(packages: PackageOffer[]): Promise<void> {
  localStorage.setItem(PACKAGES_CACHE_KEY, JSON.stringify(packages));
  window.dispatchEvent(new CustomEvent('techify-packages-updated', { detail: packages }));

  await setDoc(doc(db, "site_content", "packages"), {
    packages,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}
