import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface InlineOverrides {
  texts: Record<string, string>;
  numbers: Record<string, { value: number | string; prefix?: string; suffix?: string; label?: string }>;
  icons: Record<string, string>; // icon name, e.g. "Zap", "Rocket", "Shield"
  images: Record<string, string>; // base64 or URL
}

const INLINE_CACHE_KEY = 'techify_inline_overrides_cache';

export const DEFAULT_OVERRIDES: InlineOverrides = {
  texts: {},
  numbers: {},
  icons: {},
  images: {}
};

export function getCachedInlineOverrides(): InlineOverrides {
  try {
    const raw = localStorage.getItem(INLINE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        texts: parsed.texts || {},
        numbers: parsed.numbers || {},
        icons: parsed.icons || {},
        images: parsed.images || {}
      };
    }
  } catch (err) {
    console.warn(err);
  }
  return DEFAULT_OVERRIDES;
}

let activeOverrides: InlineOverrides = getCachedInlineOverrides();

export function getInlineOverride(type: 'text' | 'icon' | 'image' | 'number', id: string, fallback: any) {
  if (type === 'text') return activeOverrides.texts?.[id] ?? fallback;
  if (type === 'icon') return activeOverrides.icons?.[id] ?? fallback;
  if (type === 'image') return activeOverrides.images?.[id] ?? fallback;
  if (type === 'number') return activeOverrides.numbers?.[id] ?? fallback;
  return fallback;
}

export async function saveInlineText(id: string, text: string): Promise<void> {
  activeOverrides.texts[id] = text;
  persistLocally();
  notifySubscribers();
  try {
    await setDoc(doc(db, "site_content", "inline_overrides"), {
      texts: activeOverrides.texts,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving inline text to firestore:', err);
  }

  // Also sync common hero keys with general content if applicable
  if (id === 'hero_title_1' || id === 'hero_title_2' || id === 'hero_description_main') {
    try {
      const fieldMap: Record<string, string> = {
        hero_title_1: 'heroHeadline1',
        hero_title_2: 'heroHeadline2',
        hero_description_main: 'heroDescription'
      };
      const generalField = fieldMap[id];
      if (generalField) {
        await setDoc(doc(db, "site_content", "general"), {
          [generalField]: text,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Sync to general content notice:', err);
    }
  }
}

export async function saveInlineNumber(id: string, data: { value: number | string; prefix?: string; suffix?: string; label?: string }): Promise<void> {
  activeOverrides.numbers[id] = data;
  persistLocally();
  notifySubscribers();
  try {
    await setDoc(doc(db, "site_content", "inline_overrides"), {
      numbers: activeOverrides.numbers,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving inline number to firestore:', err);
  }
}

export async function saveInlineIcon(id: string, iconName: string): Promise<void> {
  activeOverrides.icons[id] = iconName;
  persistLocally();
  notifySubscribers();
  try {
    await setDoc(doc(db, "site_content", "inline_overrides"), {
      icons: activeOverrides.icons,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving inline icon to firestore:', err);
  }
}

export async function saveInlineImage(id: string, imageUrl: string): Promise<void> {
  activeOverrides.images[id] = imageUrl;
  persistLocally();
  notifySubscribers();
  try {
    await setDoc(doc(db, "site_content", "inline_overrides"), {
      images: activeOverrides.images,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving inline image to firestore:', err);
  }
}

function persistLocally() {
  try {
    localStorage.setItem(INLINE_CACHE_KEY, JSON.stringify(activeOverrides));
  } catch (err) {
    console.warn(err);
  }
}

function notifySubscribers() {
  window.dispatchEvent(new CustomEvent('techify-inline-updated', { detail: activeOverrides }));
}

// Global listener to sync Firestore in real-time
export function initInlineOverridesListener(callback: (overrides: InlineOverrides) => void) {
  const unsub = onSnapshot(doc(db, "site_content", "inline_overrides"), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const texts: Record<string, string> = { ...(data.texts || {}) };
      const numbers: Record<string, any> = { ...(data.numbers || {}) };
      const icons: Record<string, string> = { ...(data.icons || {}) };
      const images: Record<string, string> = { ...(data.images || {}) };

      // Parse any flat keys (e.g. "texts.hero_title_1") for backwards compatibility
      Object.keys(data).forEach((k) => {
        if (k.startsWith('texts.')) {
          texts[k.replace('texts.', '')] = data[k];
        } else if (k.startsWith('numbers.')) {
          numbers[k.replace('numbers.', '')] = data[k];
        } else if (k.startsWith('icons.')) {
          icons[k.replace('icons.', '')] = data[k];
        } else if (k.startsWith('images.')) {
          images[k.replace('images.', '')] = data[k];
        }
      });
      
      activeOverrides = {
        texts: { ...activeOverrides.texts, ...texts },
        numbers: { ...activeOverrides.numbers, ...numbers },
        icons: { ...activeOverrides.icons, ...icons },
        images: { ...activeOverrides.images, ...images }
      };
      persistLocally();
      callback({ ...activeOverrides });
    }
  }, (err) => {
    console.warn('Inline overrides snapshot offline fallback:', err.message);
  });

  const handleCustomEvent = (e: Event) => {
    const customEvt = e as CustomEvent<InlineOverrides>;
    if (customEvt.detail) {
      activeOverrides = customEvt.detail;
      callback({ ...activeOverrides });
    }
  };

  window.addEventListener('techify-inline-updated', handleCustomEvent);

  return () => {
    unsub();
    window.removeEventListener('techify-inline-updated', handleCustomEvent);
  };
}
