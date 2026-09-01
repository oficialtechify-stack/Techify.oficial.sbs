import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export interface ServiceCatalogItem {
  id: string;
  label: string;
  badge: string;
  price: string;
  popular?: boolean;
  order?: number;
}

export const DEFAULT_SERVICES_CATALOG: ServiceCatalogItem[] = [
  { 
    id: 'pacote_completo', 
    label: '⭐ Pacote Full Growth 360° (Site + Design + Mkt + Redes)', 
    badge: 'Mais Escolhido • 75% OFF', 
    price: 'De R$ 2.300 por R$ 580',
    popular: true,
    order: 1
  },
  { 
    id: 'pacote_tracao', 
    label: '🚀 Pacote Tração & Vendas (Site de Alta Conversão + Marketing)', 
    badge: 'Alta Conversão', 
    price: 'R$ 350',
    popular: false,
    order: 2
  },
  { 
    id: 'teste_gratis', 
    label: '🎁 Teste de Design & Amostra de Site Grátis', 
    badge: '100% Sem Compromisso', 
    price: 'GRÁTIS',
    popular: false,
    order: 3
  },
  { 
    id: 'sites', 
    label: '🌐 Criação de Sites & Landing Pages de Alta Performance', 
    badge: 'Engenharia Sob Medida', 
    price: 'Sob Medida',
    popular: false,
    order: 4
  },
  { 
    id: 'design', 
    label: '🎨 Design Gráfico, Identidade Visual & UI/UX', 
    badge: 'Padrão Internacional', 
    price: 'Sob Medida',
    popular: false,
    order: 5
  },
  { 
    id: 'sistemas', 
    label: '⚡ Desenvolvimento de Sistemas, Aplicativos & Automações', 
    badge: 'Tecnologia Escalável', 
    price: 'Sob Medida',
    popular: false,
    order: 6
  },
  { 
    id: 'marketing', 
    label: '📈 Tráfego Pago, Gestão de Anúncios & Performance', 
    badge: 'Foco em Vendas', 
    price: 'Sob Medida',
    popular: false,
    order: 7
  },
  { 
    id: 'outro', 
    label: '🎯 Outro Projeto Personalizado', 
    badge: 'Briefing Exclusivo', 
    price: 'Consultoria',
    popular: false,
    order: 8
  },
];

const LOCAL_STORAGE_KEY = 'techify_services_catalog_cache';

export function getCachedServicesCatalog(): ServiceCatalogItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading cached services catalog:', e);
  }
  return DEFAULT_SERVICES_CATALOG;
}

export function saveCachedServicesCatalog(items: ServiceCatalogItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving cached services catalog:', e);
  }
}

export function initServicesCatalogListener(callback: (items: ServiceCatalogItem[]) => void): () => void {
  let isInitial = true;

  const unsub = onSnapshot(collection(db, 'servicos_catalogo'), async (snapshot) => {
    if (snapshot.empty && isInitial) {
      isInitial = false;
      // Seed default catalog if collection is empty
      try {
        const batch = writeBatch(db);
        for (const item of DEFAULT_SERVICES_CATALOG) {
          const docRef = doc(db, 'servicos_catalogo', item.id);
          batch.set(docRef, item);
        }
        await batch.commit();
      } catch (err) {
        console.warn('Could not seed servicos_catalogo:', err);
      }
      callback(DEFAULT_SERVICES_CATALOG);
      saveCachedServicesCatalog(DEFAULT_SERVICES_CATALOG);
      return;
    }

    isInitial = false;
    const items: ServiceCatalogItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ServiceCatalogItem;
      items.push({
        ...data,
        id: docSnap.id,
        order: data.order ?? 999
      });
    });

    // Sort by order or default order
    items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    if (items.length > 0) {
      saveCachedServicesCatalog(items);
      callback(items);
    } else {
      callback(DEFAULT_SERVICES_CATALOG);
    }
  }, (err) => {
    console.warn('Firestore servicos_catalogo listener error (using cache):', err);
    callback(getCachedServicesCatalog());
  });

  return unsub;
}

export async function saveServiceCatalogItem(item: ServiceCatalogItem): Promise<void> {
  const docId = item.id || `serv_${Date.now()}`;
  const docRef = doc(db, 'servicos_catalogo', docId);
  const dataToSave = {
    ...item,
    id: docId,
    updatedAt: new Date().toISOString()
  };
  
  await setDoc(docRef, dataToSave, { merge: true });

  // Update local cache
  const current = getCachedServicesCatalog();
  const index = current.findIndex(c => c.id === docId);
  if (index >= 0) {
    current[index] = dataToSave;
  } else {
    current.push(dataToSave);
  }
  saveCachedServicesCatalog(current);
}

export async function deleteServiceCatalogItem(id: string): Promise<void> {
  const docRef = doc(db, 'servicos_catalogo', id);
  await deleteDoc(docRef);

  // Update local cache
  const current = getCachedServicesCatalog().filter(c => c.id !== id);
  saveCachedServicesCatalog(current);
}

export async function resetServicesCatalogToDefault(): Promise<void> {
  // Delete current documents
  const snap = await getDocs(collection(db, 'servicos_catalogo'));
  const batch = writeBatch(db);
  snap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  
  // Re-add defaults
  for (const item of DEFAULT_SERVICES_CATALOG) {
    const docRef = doc(db, 'servicos_catalogo', item.id);
    batch.set(docRef, item);
  }
  
  await batch.commit();
  saveCachedServicesCatalog(DEFAULT_SERVICES_CATALOG);
}
