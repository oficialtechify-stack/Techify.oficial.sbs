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
  // Logo & Emblem settings
  logoSettings?: LogoSettings;
}

export interface LogoSettings {
  imageUrl: string;
  zoom: number; // percentage (e.g. 100)
  offsetX: number; // percentage (e.g. 0)
  offsetY: number; // percentage (e.g. 0)
  rotation: number; // degrees (e.g. 0)
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius: number; // percentage (e.g. 50 = full circle)
  showCenterDot: boolean;
  centerDotColor: string;
  centerDotSize: number; // px (e.g. 6)
  showDividerLines: boolean;
  dividerColor: string;
  dividerWidth: number; // px (e.g. 1)
  showOuterRing: boolean;
  outerRingColor: string;
  outerRingBorderWidth: number; // px (e.g. 1.5)
  backgroundColor: string; // e.g. '#000000'
  glowEffect: boolean;
  glowColor: string;
}

import tobyAvatar from '../assets/images/character_toby_1781368530741.jpg';
import lilyAvatar from '../assets/images/character_lily_1781368515823.jpg';

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
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 'lucas-ferreira',
    name: "Lucas Ferreira",
    role: "COO (Diretor de Operações)",
    description: "Gestão operacional de processos, qualidade de entrega e sincronização ágil de times.",
    linkedin: "https://linkedin.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
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
  try {
    localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  window.dispatchEvent(new CustomEvent('techify-feedbacks-updated', { detail: sanitized }));
  
  try {
    await setDoc(doc(db, "site_content", "feedbacks"), {
      feedbacks: sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore saveFeedbacks error:", err);
  }
}

export function getCachedTeamMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(TEAM_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }
  return DEFAULT_TEAM_MEMBERS;
}

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  imageUrl: '', // empty means use original techify logo
  zoom: 100,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  objectFit: 'cover',
  borderRadius: 50,
  showCenterDot: true,
  centerDotColor: '#ffffff',
  centerDotSize: 6,
  showDividerLines: true,
  dividerColor: '#ffffff',
  dividerWidth: 1,
  showOuterRing: true,
  outerRingColor: '#ffffff',
  outerRingBorderWidth: 1.5,
  backgroundColor: '#000000',
  glowEffect: false,
  glowColor: '#22c55e'
};

const LOGO_CACHE_KEY = 'techify_cached_logo_settings';

export function getCachedLogoSettings(): LogoSettings {
  try {
    const raw = localStorage.getItem(LOGO_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_LOGO_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn(err);
  }
  return DEFAULT_LOGO_SETTINGS;
}

export async function saveLogoSettingsToFirestore(settings: Partial<LogoSettings>): Promise<void> {
  const current = getCachedLogoSettings();
  const updated = { ...current, ...settings };
  const sanitized = JSON.parse(JSON.stringify(updated));
  try {
    localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  window.dispatchEvent(new CustomEvent('techify-logo-settings-updated', { detail: sanitized }));

  try {
    await setDoc(doc(db, "site_content", "logo_settings"), {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore saveLogoSettings error:", err);
  }
}

export function initLogoSettingsListener(callback: (settings: LogoSettings) => void): () => void {
  // 1. Initial cached value
  callback(getCachedLogoSettings());

  // 2. Custom event listener (instant local update)
  const handleCustomEvent = (e: Event) => {
    const customEvt = e as CustomEvent<LogoSettings>;
    if (customEvt.detail) {
      callback(customEvt.detail);
    }
  };
  window.addEventListener('techify-logo-settings-updated', handleCustomEvent);

  // 3. Firestore onSnapshot (remote real-time sync)
  const unsubscribe = onSnapshot(doc(db, "site_content", "logo_settings"), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Partial<LogoSettings>;
      const merged = { ...DEFAULT_LOGO_SETTINGS, ...data };
      try {
        localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      callback(merged);
    }
  }, (err) => console.warn('Firestore logo settings offline:', err.message));

  return () => {
    window.removeEventListener('techify-logo-settings-updated', handleCustomEvent);
    unsubscribe();
  };
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
  try {
    localStorage.setItem(TEAM_CACHE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  window.dispatchEvent(new CustomEvent('techify-team-updated', { detail: sanitized }));
  
  try {
    await setDoc(doc(db, "site_content", "team"), {
      members: sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore saveTeam error:", err);
  }
}

export async function saveGeneralContentToFirestore(content: Partial<SiteGeneralContent>): Promise<void> {
  const current = getCachedGeneralContent();
  const updated = { ...current, ...content };
  const sanitized = JSON.parse(JSON.stringify(updated));
  try {
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  window.dispatchEvent(new CustomEvent('techify-content-updated', { detail: sanitized }));

  try {
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
      await setDoc(doc(db, "site_content", "inline_overrides"), {
        texts: inlineUpdates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.error("Firestore saveGeneral error:", err);
  }
}
