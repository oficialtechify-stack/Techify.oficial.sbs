import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Plus, 
  ExternalLink, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Check, 
  Copy, 
  Upload, 
  X, 
  Loader2, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlertCircle,
  FolderX
} from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminAuth } from '../lib/adminAuth';
import { TechifyApp } from '../types';
import { toast } from './Toast';

// Empty default list - no placeholder/mock apps! The user will add their own.
const INITIAL_APPS: TechifyApp[] = [];

const CATEGORIES = ['Todos', 'SaaS / IA', 'Web App 3D', 'UI/UX', 'E-commerce', 'Mobile App', 'Criativo', 'SaaS / Gestão', 'Outros'];

interface AppsSectionProps {
  onOpenConsultation?: () => void;
}

export default function AppsSection({ onOpenConsultation }: AppsSectionProps) {
  const { isAdmin } = useAdminAuth();
  const [apps, setApps] = useState<TechifyApp[]>(INITIAL_APPS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<TechifyApp | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formCategory, setFormCategory] = useState('SaaS / IA');
  const [formStatus, setFormStatus] = useState<'ativo' | 'beta' | 'em-breve'>('ativo');
  const [formTags, setFormTags] = useState('');

  // Delete Individual Modal State
  const [deletingApp, setDeletingApp] = useState<TechifyApp | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete All Modal State
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Copy Feedback
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  // Realtime Firestore Subscription
  useEffect(() => {
    try {
      const q = collection(db, 'apps');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetchedApps: TechifyApp[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<TechifyApp, 'id'>)
            }));
            setApps(fetchedApps);
          } else {
            setApps([]);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore apps subscription error:', error);
          setApps([]);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to attach listener:', err);
      setApps([]);
      setLoading(false);
    }
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('');
    setFormImageUrl('');
    setFormLinkUrl('https://');
    setFormCategory('SaaS / IA');
    setFormStatus('ativo');
    setFormTags('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (app: TechifyApp) => {
    setEditingApp(app);
    setFormTitle(app.title || '');
    setFormSubtitle(app.subtitle || '');
    setFormDescription(app.description || '');
    setFormImageUrl(app.imageUrl || '');
    setFormLinkUrl(app.linkUrl || '');
    setFormCategory(app.category || 'SaaS / IA');
    setFormStatus(app.status || 'ativo');
    setFormTags(app.tags ? app.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  // Image File Upload Helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit App Form (Add or Edit)
  const handleSubmitApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Informe o nome do aplicativo.');
      return;
    }
    if (!formSubtitle.trim()) {
      toast.error('Informe a legenda do aplicativo.');
      return;
    }
    if (!formLinkUrl.trim() || formLinkUrl === 'https://') {
      toast.error('Informe o link do aplicativo.');
      return;
    }

    setIsSubmitting(true);

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const appData = {
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      linkUrl: formLinkUrl.trim(),
      category: formCategory.trim(),
      status: formStatus,
      tags: parsedTags,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingApp && editingApp.id) {
        // Update existing Firestore doc
        const appRef = doc(db, 'apps', editingApp.id);
        await updateDoc(appRef, appData);
        toast.success(`Aplicativo "${formTitle.trim()}" atualizado com sucesso!`);
      } else {
        // Create new Firestore doc
        await addDoc(collection(db, 'apps'), {
          ...appData,
          createdAt: serverTimestamp()
        });
        toast.success(`Aplicativo "${formTitle.trim()}" adicionado com sucesso!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving app:', err);
      toast.error('Erro ao salvar o aplicativo no banco de dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Single App
  const handleDeleteSingleApp = async () => {
    if (!deletingApp) return;
    setIsDeleting(true);
    try {
      if (deletingApp.id) {
        await deleteDoc(doc(db, 'apps', deletingApp.id));
      }
      // Optimistic update
      setApps((prev) => prev.filter((a) => a.id !== deletingApp.id));
      toast.success(`Aplicativo "${deletingApp.title}" excluído com sucesso!`);
      setDeletingApp(null);
    } catch (err) {
      console.error('Error deleting app:', err);
      toast.error('Erro ao excluir o aplicativo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete All Apps (Bulk Clear for Admin)
  const handleDeleteAllApps = async () => {
    setIsDeletingAll(true);
    try {
      const snap = await getDocs(collection(db, 'apps'));
      const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, 'apps', d.id)));
      await Promise.all(deletePromises);
      setApps([]);
      toast.success('Todos os aplicativos foram removidos com sucesso!');
      setIsDeleteAllModalOpen(false);
    } catch (err) {
      console.error('Error deleting all apps:', err);
      toast.error('Erro ao limpar os aplicativos.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Copy App Link
  const handleCopyLink = (app: TechifyApp) => {
    const url = app.linkUrl.startsWith('http') ? app.linkUrl : `https://${app.linkUrl}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedAppId(app.id);
        toast.success(`Link copiado!`);
        setTimeout(() => setCopiedAppId(null), 2500);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedAppId(app.id);
      toast.success(`Link copiado!`);
      setTimeout(() => setCopiedAppId(null), 2500);
    }
  };

  // Filtered Apps List
  const filteredApps = apps.filter((app) => {
    const matchesCategory = selectedCategory === 'Todos' || app.category === selectedCategory;
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      app.title.toLowerCase().includes(queryLower) ||
      app.subtitle.toLowerCase().includes(queryLower) ||
      (app.category && app.category.toLowerCase().includes(queryLower)) ||
      (app.tags && app.tags.some((tag) => tag.toLowerCase().includes(queryLower)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-[#22c55e]/30 selection:text-white pt-10 pb-24">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-[#22c55e]/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-950/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. SECTION HEADER & ADMIN ACTIONS                                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-900">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1 text-xs font-bold text-[#4ade80]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ECOSSISTEMA DIGITAL</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Apps & Soluções <span className="text-[#4ade80]">Techify</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
              Explore os aplicativos, plataformas e ferramentas desenvolvidas pela Techify.
            </p>
          </div>

          {/* Admin Action Buttons */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {apps.length > 0 && (
                <button
                  onClick={() => setIsDeleteAllModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-red-900/50 bg-red-950/30 hover:bg-red-900/50 text-red-300 font-bold px-4 py-3 text-xs transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Apagar Todos os Apps</span>
                </button>
              )}

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold px-5 py-3 text-xs transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Adicionar Novo App</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH AND CATEGORY FILTER BAR (Shown when there are apps)             */}
        {/* ========================================================================= */}
        {apps.length > 0 && (
          <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por app, legenda, categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-[#0a0c0a] pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                        : 'border border-neutral-800 bg-[#0d0f0d] text-neutral-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. APPS GRID / EMPTY STATE                                                */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#22c55e]" />
            <p className="mt-3 text-xs text-neutral-500 font-medium">Carregando aplicativos...</p>
          </div>
        ) : apps.length === 0 ? (
          /* Clean Empty State when no apps have been added yet */
          <div className="mt-16 rounded-3xl border border-neutral-900 bg-gradient-to-b from-[#090b09] to-[#040504] p-10 sm:p-16 text-center max-w-xl mx-auto shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#4ade80] mx-auto mb-6 shadow-[0_0_25px_rgba(34,197,94,0.15)]">
              <Layers className="h-8 w-8" />
            </div>
            
            <h3 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              Nenhum aplicativo cadastrado ainda
            </h3>
            
            <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
              {isAdmin 
                ? 'Todos os aplicativos anteriores foram removidos. Como administrador, você pode cadastrar seus novos aplicativos com imagem, link e legenda abaixo.'
                : 'Nenhum aplicativo disponível no momento. Novos lançamentos serão exibidos aqui em breve.'}
            </p>

            {isAdmin && (
              <div className="mt-8">
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold px-6 py-3.5 text-xs transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Adicionar Primeiro Aplicativo</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredApps.length === 0 ? (
          /* Search results empty */
          <div className="mt-16 rounded-3xl border border-neutral-900 bg-[#070907] p-12 text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-neutral-500 mx-auto mb-4">
              <FolderX className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Nenhum aplicativo encontrado na busca</h3>
            <p className="mt-1.5 text-xs text-neutral-400">
              Tente buscar com outros termos ou selecione a categoria "Todos".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="mt-4 text-xs text-[#4ade80] hover:underline font-bold"
            >
              Limpar filtros de busca
            </button>
          </div>
        ) : (
          /* App Cards Grid */
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app, index) => {
              const hasExternalLink = app.linkUrl && app.linkUrl.startsWith('http');
              return (
                <motion.div
                  key={app.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-800/90 bg-gradient-to-b from-[#0a0d0a] to-[#040604] hover:border-[#22c55e]/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.12)] transition-all duration-300"
                >
                  {/* Top Image Box */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950 border-b border-neutral-850">
                    <img
                      src={app.imageUrl}
                      alt={app.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0a] via-black/20 to-transparent pointer-events-none" />

                    {/* Category & Status Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <span className="rounded-lg bg-black/85 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider">
                        {app.category}
                      </span>
                      {app.status === 'ativo' && (
                        <span className="flex items-center gap-1 rounded-lg bg-[#22c55e]/25 backdrop-blur-md border border-[#22c55e]/40 px-2 py-0.8 text-[10px] font-bold text-[#4ade80]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                          <span>ATIVO</span>
                        </span>
                      )}
                      {app.status === 'beta' && (
                        <span className="rounded-lg bg-amber-500/25 backdrop-blur-md border border-amber-500/40 px-2 py-0.8 text-[10px] font-bold text-amber-300">
                          BETA
                        </span>
                      )}
                      {app.status === 'em-breve' && (
                        <span className="rounded-lg bg-neutral-800/90 backdrop-blur-md border border-neutral-700 px-2 py-0.8 text-[10px] font-semibold text-neutral-300">
                          EM BREVE
                        </span>
                      )}
                    </div>

                    {/* Admin Action Buttons on Top Right of Card */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(app);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors shadow-lg cursor-pointer"
                          title="Editar App"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingApp(app);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-850 transition-colors shadow-lg cursor-pointer"
                          title="Excluir App Permanentemente"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-[#4ade80] transition-colors">
                        {app.title}
                      </h3>

                      {/* Legenda do App (Highlighted Container) */}
                      <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed bg-[#060806] border border-neutral-850 p-3 rounded-xl">
                        {app.subtitle}
                      </p>

                      {/* Description if present */}
                      {app.description && (
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                          {app.description}
                        </p>
                      )}

                      {/* Tags */}
                      {app.tags && app.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {app.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="rounded-md bg-neutral-900/90 border border-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-3 border-t border-neutral-900 flex items-center gap-2">
                      <a
                        href={app.linkUrl}
                        target={hasExternalLink ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-2.5 px-3 text-xs transition-all shadow-[0_0_15px_rgba(34,197,94,0.25)] cursor-pointer"
                      >
                        <span>Acessar App</span>
                        <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(app)}
                        className="flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:text-white text-neutral-400 p-2.5 transition-colors cursor-pointer"
                        title="Copiar link do app"
                      >
                        {copiedAppId === app.id ? (
                          <Check className="h-4 w-4 text-[#22c55e] stroke-[3]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => setDeletingApp(app)}
                          className="flex items-center justify-center rounded-xl border border-red-950 bg-red-950/30 hover:bg-red-900 text-red-400 hover:text-white p-2.5 transition-colors cursor-pointer"
                          title="Apagar este aplicativo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: ADICIONAR / EDITAR APP (ADMIN)                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-800 bg-[#0d0f0d] p-6 sm:p-8 shadow-2xl z-10 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-white">
                      {editingApp ? 'Editar Aplicativo' : 'Adicionar Novo Aplicativo'}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Configure a imagem, link e legenda para exibição no ecossistema
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitApp} className="space-y-4">
                
                {/* Nome do App */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Nome do Aplicativo <span className="text-[#22c55e]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mindloop Neural, Wandr 3D, Sistema Comercial..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors"
                  />
                </div>

                {/* Legenda do App */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Legenda / Subtítulo Curto <span className="text-[#22c55e]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Plataforma cognitiva para automação e gestão de dados em tempo real"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors"
                  />
                </div>

                {/* Link do App */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Link do Aplicativo (URL) <span className="text-[#22c55e]">*</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                    <input
                      type="text"
                      required
                      placeholder="https://seuapp.com ou link do WhatsApp/Web"
                      value={formLinkUrl}
                      onChange={(e) => setFormLinkUrl(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Imagem do App */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-300">
                    Imagem de Capa / Mockup do App <span className="text-[#22c55e]">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    {/* Image Preview Box */}
                    <div className="relative h-28 w-full sm:w-44 rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shrink-0 flex items-center justify-center">
                      {formImageUrl ? (
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-neutral-600">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-[10px]">Sem Imagem</span>
                        </div>
                      )}
                    </div>

                    {/* Upload button & URL input */}
                    <div className="flex-1 w-full space-y-2">
                      <label className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 px-4 py-2.5 text-xs font-bold text-neutral-200 cursor-pointer transition-colors">
                        <Upload className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>Fazer Upload da Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>

                      <div className="relative">
                        <input
                          type="url"
                          placeholder="Ou cole o link direto da imagem..."
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categoria e Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">Categoria</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-[#22c55e] focus:outline-none transition-colors"
                    >
                      <option value="SaaS / IA">SaaS / IA</option>
                      <option value="Web App 3D">Web App 3D</option>
                      <option value="UI/UX">UI/UX</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Criativo">Criativo</option>
                      <option value="SaaS / Gestão">SaaS / Gestão</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-[#22c55e] focus:outline-none transition-colors"
                    >
                      <option value="ativo">🟢 Ativo / Disponível</option>
                      <option value="beta">🟡 Versão Beta</option>
                      <option value="em-breve">🔵 Em Desenvolvimento</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Inteligência Artificial, React, Automação"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors"
                  />
                </div>

                {/* Descrição Detalhada (Opcional) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Descrição Detalhada (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes adicionais sobre os recursos e arquitetura do app..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 border-t border-neutral-800 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold py-3 text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-3 text-xs transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>{editingApp ? 'Salvar Alterações' : 'Publicar App'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. MODAL DE CONFIRMAÇÃO: EXCLUIR UM APLICATIVO ESPECÍFICO                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deletingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingApp(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl border border-red-900/50 bg-[#0d0707] p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-950 text-red-400 border border-red-800/40">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Excluir Aplicativo?</h4>
                <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                  Tem certeza que deseja apagar o app <strong className="text-white font-bold">"{deletingApp.title}"</strong>? Esta ação é irreversível.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingApp(null)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteSingleApp}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Sim, Excluir</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. MODAL DE CONFIRMAÇÃO: APAGAR TODOS OS APLICATIVOS (LIMPAR TUDO)         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteAllModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl border border-red-900/60 bg-[#0e0606] p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950 text-red-400 border border-red-800">
                <Trash2 className="h-7 w-7 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Apagar TODOS os Aplicativos?</h4>
                <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                  Esta ação removerá todos os <strong className="text-white">{apps.length} aplicativos</strong> cadastrados. A lista ficará completamente vazia para novos cadastros.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeletingAll}
                  onClick={handleDeleteAllApps}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 text-xs transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {isDeletingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Limpeza'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
