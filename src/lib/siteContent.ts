import { collection, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  linkedin?: string;
  instagram?: string;
}

export interface FeedbackImage {
  id: string;
  imageUrl: string;
  clientName?: string;
  projectName?: string;
  comment?: string;
  rating?: number;
  date?: string;
  createdAt: string;
}

export interface SiteGeneralContent {
  // Hero
  heroBadge: string;
  heroHeadline1: string;
  heroHeadline2: string;
  heroDescription: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  
  // Sobre Nós
  aboutBadge: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutBannerTitle: string;
  aboutBannerSubtitle: string;
  aboutBannerCta: string;
  
  // Contato / Redes
  whatsapp: string;
  email: string;
  phone: string;
  instagram: string;
  linkedin: string;
  address: string;
  copyright: string;
}

import tobyAvatar from '../assets/images/character_toby_1781368530741.jpg';
import lilyAvatar from '../assets/images/character_lily_1781368515823.jpg';
import chessAvatar from '../assets/images/chess_techify_1781363479208.jpg';
import statueAvatar from '../assets/images/statue_techify_1781363466541.jpg';

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'marcos-henrique',
    name: "MARCOS HENRIQUE",
    role: "CEO (Diretor Executivo)",
    description: "Liderança executiva, visão estratégica e expansão de produtos digitais de alto impacto.",
    linkedin: "https://linkedin.com",
    avatar: tobyAvatar
  },
  {
    id: 'vitoria-ellen',
    name: "Vitória Ellen",
    role: "Designer (Head de UI/UX & Brand)",
    description: "Design de interfaces de alta conversão, identidade visual marcante e experiência fluida.",
    linkedin: "https://linkedin.com",
    avatar: lilyAvatar
  },
  {
    id: 'gabriel-rocha',
    name: "Gabriel Rocha",
    role: "CTO (Diretor de Tecnologia)",
    description: "Arquitetura de sistemas em nuvem, engenharia de software e inteligência computacional.",
    linkedin: "https://linkedin.com",
    avatar: chessAvatar
  },
  {
    id: 'lucas-ferreira',
    name: "Lucas Ferreira",
    role: "COO (Diretor de Operações)",
    description: "Gestão operacional de processos, qualidade de entrega e sincronização ágil de times.",
    linkedin: "https://linkedin.com",
    avatar: statueAvatar
  }
];

export const DEFAULT_SITE_CONTENT: SiteGeneralContent = {
  heroBadge: "Tecnologia & Performance sob Medida",
  heroHeadline1: "A Solução Definitiva",
  heroHeadline2: "ESTRUTURA COMPLETA PARA SUA EMPRESA CRESCER",
  heroDescription: "Unimos desenvolvimento de sites e sistemas, design de alto impacto e marketing estratégico. Uma experiência completa conduzida por um time pronto para acelerar seus resultados. Nossa equipe de especialistas cuida de toda a sua estratégia digital para o seu negócio escalar.",
  heroCtaPrimary: "FALAR COM ENGENHEIRO",
  heroCtaSecondary: "VER O QUE JÁ FIZEMOS",
  aboutBadge: "Sobre nós",
  aboutTitle: "A empresa digital dedicada a criar sistemas, sites e marketing sob medida",
  aboutDescription: "A Techify nasceu para simplificar a engenharia digital. Entregamos soluções de alto impacto com prazo garantido e excelência técnica.",
  aboutBannerTitle: "Enquanto você decide,",
  aboutBannerSubtitle: "o cliente compra do concorrente",
  aboutBannerCta: "QUERO APARECER PRIMEIRO",
  whatsapp: "(11) 99999-9999",
  email: "oficialtechify@gmail.com",
  phone: "(11) 99999-9999",
  instagram: "@oficialtechify",
  linkedin: "techify-oficial",
  address: "São Paulo - SP, Brasil",
  copyright: "© 2026 Techify. Todos os direitos reservados."
};

const TEAM_CACHE_KEY = 'techify_cached_team_members';
const CONTENT_CACHE_KEY = 'techify_cached_general_content';
const FEEDBACK_CACHE_KEY = 'techify_cached_feedback_images';

export const DEFAULT_FEEDBACKS: FeedbackImage[] = [];

export function getCachedFeedbacks(): FeedbackImage[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }
  return DEFAULT_FEEDBACKS;
}

export async function saveFeedbacksToFirestore(feedbacks: FeedbackImage[]): Promise<void> {
  const sanitized = JSON.parse(JSON.stringify(feedbacks));
  localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new CustomEvent('techify-feedbacks-updated', { detail: sanitized }));
  
  await setDoc(doc(db, "site_content", "feedbacks"), {
    feedbacks: sanitized,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export function getCachedTeamMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(TEAM_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }
  return DEFAULT_TEAM_MEMBERS;
}

export function getCachedGeneralContent(): SiteGeneralContent {
  try {
    const raw = localStorage.getItem(CONTENT_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_CONTENT, ...parsed };
    }
  } catch (err) {
    console.warn(err);
  }
  return DEFAULT_SITE_CONTENT;
}

export async function saveTeamMembersToFirestore(members: TeamMember[]): Promise<void> {
  const sanitized = JSON.parse(JSON.stringify(members));
  localStorage.setItem(TEAM_CACHE_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new CustomEvent('techify-team-updated', { detail: sanitized }));
  
  await setDoc(doc(db, "site_content", "team"), {
    members: sanitized,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function saveGeneralContentToFirestore(content: Partial<SiteGeneralContent>): Promise<void> {
  const current = getCachedGeneralContent();
  const updated = { ...current, ...content };
  const sanitized = JSON.parse(JSON.stringify(updated));
  localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new CustomEvent('techify-content-updated', { detail: sanitized }));

  // Save to general document
  await setDoc(doc(db, "site_content", "general"), {
    ...sanitized,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // Keep inline_overrides texts in sync with general fields
  const inlineUpdates: Record<string, string> = {};
  if (content.heroHeadline1 !== undefined) inlineUpdates.hero_title_1 = content.heroHeadline1;
  if (content.heroHeadline2 !== undefined) inlineUpdates.hero_title_2 = content.heroHeadline2;
  if (content.heroDescription !== undefined) inlineUpdates.hero_description_main = content.heroDescription;
  if (content.heroCtaPrimary !== undefined) inlineUpdates.hero_cta_primary = content.heroCtaPrimary;
  if (content.heroCtaSecondary !== undefined) inlineUpdates.hero_cta_secondary = content.heroCtaSecondary;

  if (Object.keys(inlineUpdates).length > 0) {
    try {
      await setDoc(doc(db, "site_content", "inline_overrides"), {
        texts: inlineUpdates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Could not sync inline_overrides:", err);
    }
  }
}
