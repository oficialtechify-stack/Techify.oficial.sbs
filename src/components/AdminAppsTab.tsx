import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Search, 
  X, 
  Upload, 
  Check, 
  Loader2, 
  AlertCircle, 
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  Copy,
  CheckCheck
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TechifyApp } from '../types';
import { toast } from './Toast';

interface AdminAppsTabProps {
  apps: TechifyApp[];
}

export default function AdminAppsTab({ apps }: AdminAppsTabProps) {
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
  const [formLinkUrl, setFormLinkUrl] = useState('https://');
  const [formCategory, setFormCategory] = useState('SaaS / IA');
  const [formStatus, setFormStatus] = useState<'ativo' | 'beta' | 'em-breve'>('ativo');
  const [formTags, setFormTags] = useState('');

  // Delete State
  const [deletingApp, setDeletingApp] = useState<TechifyApp | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Todos', 'SaaS / IA', 'Web App 3D', 'UI/UX', 'E-commerce', 'Mobile App', 'Criativo', 'SaaS / Gestão', 'Outros'];

  // Open Add Modal
  const handleOpenAdd = () => {
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
  const handleOpenEdit = (app: TechifyApp) => {
    setEditingApp(app);
    setFormTitle(app.title || '');
    setFormSubtitle(app.subtitle || '');
    setFormDescription(app.description || '');
    setFormImageUrl(app.imageUrl || '');
    setFormLinkUrl(app.linkUrl || 'https://');
    setFormCategory(app.category || 'SaaS / IA');
    setFormStatus(app.status || 'ativo');
    setFormTags(app.tags ? app.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  // Image Upload helper
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

  // Save App
  const handleSubmit = async (e: React.FormEvent) => {
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
        await updateDoc(doc(db, 'apps', editingApp.id), appData);
        toast.success(`Aplicativo "${formTitle}" atualizado com sucesso!`);
      } else {
        await addDoc(collection(db, 'apps'), {
          ...appData,
          createdAt: serverTimestamp()
        });
        toast.success(`Aplicativo "${formTitle}" publicado com sucesso!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving app in admin tab:', err);
      toast.error('Falha ao salvar o aplicativo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete single app
  const handleDeleteApp = async () => {
    if (!deletingApp) return;
    setIsDeleting(true);
    try {
      if (deletingApp.id) {
        await deleteDoc(doc(db, 'apps', deletingApp.id));
      }
      toast.success(`Aplicativo "${deletingApp.title}" removido com sucesso.`);
      setDeletingApp(null);
    } catch (err) {
      console.error('Error deleting app:', err);
      toast.error('Falha ao excluir o aplicativo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete all apps
  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const snap = await getDocs(collection(db, 'apps'));
      const promises = snap.docs.map((d) => deleteDoc(doc(db, 'apps', d.id)));
      await Promise.all(promises);
      toast.success('Todos os aplicativos foram excluídos com sucesso.');
      setIsDeleteAllModalOpen(false);
    } catch (err) {
      console.error('Error wiping apps:', err);
      toast.error('Falha ao limpar os aplicativos.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesCat = selectedCategory === 'Todos' || app.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      app.title.toLowerCase().includes(q) ||
      app.subtitle.toLowerCase().includes(q) ||
      (app.tags && app.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      {/* Header Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121312] border border-neutral-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#a3e635]" />
            <span>Gerenciador de Aplicativos Techify</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Cadastre, edite, altere legendas, links, fotos e exclua os aplicativos exibidos na aba pública "Apps".
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {apps.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-900/50 bg-red-950/30 hover:bg-red-900/50 text-red-300 font-bold px-3.5 py-2.5 text-xs transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Apagar Todos</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold px-4 py-2.5 text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Novo Aplicativo</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      {apps.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121312] border border-neutral-800/80 rounded-2xl p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por app, legenda, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#a3e635] text-black'
                    : 'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Apps Table / List */}
      {apps.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400 shadow-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 mb-3">
            <Layers className="h-7 w-7" />
          </div>
          <p className="text-base font-bold text-white">Nenhum aplicativo cadastrado</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
            Todos os aplicativos mock foram removidos. Clique em "+ Novo Aplicativo" para cadastrar seu primeiro app com imagem, link e legenda personalizada.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold px-5 py-2.5 text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Cadastrar Primeiro App</span>
          </button>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-10 text-center text-neutral-400">
          <p className="text-sm font-bold text-white">Nenhum app encontrado para esta busca.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
            }}
            className="mt-2 text-xs text-[#a3e635] hover:underline"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-[#101210] hover:border-neutral-700 overflow-hidden shadow-lg transition-all"
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950 border-b border-neutral-850">
                <img
                  src={app.imageUrl}
                  alt={app.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">
                    {app.category}
                  </span>
                  <span className="rounded-lg bg-[#a3e635]/20 backdrop-blur-sm border border-[#a3e635]/40 px-2 py-0.5 text-[10px] font-bold text-[#a3e635] uppercase">
                    {app.status || 'Ativo'}
                  </span>
                </div>

                {/* Direct Action buttons */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(app)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors shadow-md cursor-pointer"
                    title="Editar"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingApp(app)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 transition-colors shadow-md cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-white">{app.title}</h4>
                  <p className="text-xs text-neutral-300 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    {app.subtitle}
                  </p>
                  {app.linkUrl && (
                    <a
                      href={app.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#a3e635] hover:underline font-mono truncate max-w-full"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{app.linkUrl}</span>
                    </a>
                  )}
                </div>

                {/* Footer buttons on card */}
                <div className="pt-2 border-t border-neutral-850 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(app)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold py-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => setDeletingApp(app)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-950 bg-red-950/40 hover:bg-red-900 text-red-300 text-xs font-bold py-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Adicionar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#a3e635]" />
                <h3 className="text-base font-bold text-white">
                  {editingApp ? 'Editar Aplicativo' : 'Novo Aplicativo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nome do App *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mindloop Neural, Wandr 3D..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Legenda do App (Subtítulo) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Plataforma para inteligência de dados em tempo real"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Link de Acesso (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://seuapp.com"
                  value={formLinkUrl}
                  onChange={(e) => setFormLinkUrl(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  Imagem / Mockup do App *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL direta da imagem..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2.5 text-xs font-bold text-white cursor-pointer transition-colors shrink-0">
                    <Upload className="h-3.5 w-3.5 text-[#a3e635]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
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
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  >
                    <option value="ativo">🟢 Ativo</option>
                    <option value="beta">🟡 Beta</option>
                    <option value="em-breve">🔵 Em Breve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: SaaS, IA, React"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-2.5 text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Aplicativo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Modal */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-red-900/60 bg-[#120707] p-6 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-950 text-red-400 border border-red-800">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Excluir Aplicativo?</h4>
              <p className="text-xs text-neutral-300 mt-1">
                Deseja remover <strong>"{deletingApp.title}"</strong> permanentemente?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteApp}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 text-xs transition-colors shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-red-900/60 bg-[#120707] p-6 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-950 text-red-400 border border-red-800">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Apagar TODOS os Aplicativos?</h4>
              <p className="text-xs text-neutral-300 mt-1">
                Esta ação removerá todos os {apps.length} aplicativos do sistema.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={handleDeleteAll}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 text-xs transition-colors shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isDeletingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Limpeza'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
