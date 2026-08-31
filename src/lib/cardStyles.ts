import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CardCustomizerSettings {
  cardMaxWidth: number; // in px, e.g. 384
  coverHeight: number; // in px, e.g. 224
  cardPadding: number; // in px, e.g. 12
  elementsGap: number; // in px, e.g. 12
  cardBorderRadius: number; // in px, e.g. 24
  coverBorderRadius: number; // in px, e.g. 16
  headlineFontSize: number; // in px, e.g. 22
  excerptFontSize: number; // in px, e.g. 14
  lineHeight: number; // e.g. 1.45
  clampLines: number; // 0 = no clamp, 1, 2, 3, 4
  textAlign: 'left' | 'center' | 'right';
  cardBgColor: string; // e.g. '#121316'
  borderColor: string; // e.g. '#262626'
  textColor: string; // e.g. '#ffffff'
  excerptColor: string; // e.g. '#a3a3a3'
  badgeBgColor: string; // e.g. '#262626'
  badgeTextColor: string; // e.g. '#d4d4d4'
  showBadge: boolean;
  showReadingTime: boolean;
  showFooter: boolean;
}

export const DEFAULT_CARD_SETTINGS: CardCustomizerSettings = {
  cardMaxWidth: 384,
  coverHeight: 224,
  cardPadding: 12,
  elementsGap: 12,
  cardBorderRadius: 24,
  coverBorderRadius: 16,
  headlineFontSize: 22,
  excerptFontSize: 14,
  lineHeight: 1.45,
  clampLines: 3,
  textAlign: 'left',
  cardBgColor: '#121316',
  borderColor: '#262626',
  textColor: '#ffffff',
  excerptColor: '#a3a3a3',
  badgeBgColor: '#262626',
  badgeTextColor: '#d4d4d4',
  showBadge: true,
  showReadingTime: true,
  showFooter: true,
};

const CARD_SETTINGS_KEY = 'techify_card_customizer_settings';

export function getCachedCardSettings(): CardCustomizerSettings {
  try {
    const raw = localStorage.getItem(CARD_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CARD_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Error reading cached card settings:', err);
  }
  return DEFAULT_CARD_SETTINGS;
}

export async function saveCardSettings(settings: CardCustomizerSettings): Promise<void> {
  const sanitized = JSON.parse(JSON.stringify(settings));
  localStorage.setItem(CARD_SETTINGS_KEY, JSON.stringify(sanitized));
  
  // Broadcast local update
  window.dispatchEvent(new CustomEvent('techify-card-settings-updated', { detail: sanitized }));
  
  // Save to Firebase Firestore
  try {
    await setDoc(doc(db, 'site_content', 'card_styles'), {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Could not save card styles to Firestore:', err);
  }
}

export function subscribeToCardSettings(callback: (settings: CardCustomizerSettings) => void) {
  // 1. Initial callback with local cache
  callback(getCachedCardSettings());

  // 2. Listen to Firestore real-time changes
  const unsubscribeFirestore = onSnapshot(doc(db, 'site_content', 'card_styles'), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Partial<CardCustomizerSettings>;
      const merged = { ...DEFAULT_CARD_SETTINGS, ...data };
      localStorage.setItem(CARD_SETTINGS_KEY, JSON.stringify(merged));
      callback(merged);
    }
  }, (err) => {
    console.warn('Firestore card_styles offline:', err.message);
  });

  // 3. Listen to local events
  const handleLocalUpdate = (e: Event) => {
    const customEvt = e as CustomEvent<CardCustomizerSettings>;
    if (customEvt.detail) {
      callback(customEvt.detail);
    }
  };
  window.addEventListener('techify-card-settings-updated', handleLocalUpdate);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener('techify-card-settings-updated', handleLocalUpdate);
  };
}
