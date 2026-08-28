import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Search, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Sparkles, 
  Check, 
  Layers, 
  Globe, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project } from '../types';
import { compressImageFile } from '../lib/imageUtils';
import { PORTFOLIO_PRESET_IMAGES } from '../data/portfolioData';
import { toast } from './Toast';

interface AdminPortfolioTabProps {
  portfolioProjects: Project[];
}

const CATEGORIES = [
  'Todos',
  'E-commerce',
  'Corporativo',
  'Landing Page',
  'Blog',
  'Portfólio',
  'Plataforma',
  'Outro'
];

export default function AdminPortfolioTab({ portfolioProjects }: AdminPortfolioTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Full Project Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('E-commerce');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLiveUrl, setFormLiveUrl] = useState('');
  const [formTags, setFormTags] = useState('E-commerce, Web Design, Techify');
  const [formCertified, setFormCertified] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Quick Change Image Modal
  const [isQuickImageModalOpen, setIsQuickImageModalOpen] = useState(false);
  const [quickTargetProject, setQuickTargetProject] = useState<Project | null>(null);
  const [quickImageUrl, setQuickImageUrl] = useState('');
  const [isSavingQuickImage, setIsSavingQuickImage] = useState(false);
  const [isUploadingQuickImage, setIsUploadingQuickImage] = useState(false);

  // Delete Confirmation Modal
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / Feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // File Inputs
  const fullFileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Filter projects
  const filteredProjects = portfolioProjects.filter((p) => {
    const matchesCategory = selectedCategory === 'Todos' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate Metrics
  const totalCount = portfolioProjects.length;
  const ecommerceCount = portfolioProjects.filter(p => p.category.toLowerCase().includes('e-commerce')).length;
  const landingCount = portfolioProjects.filter(p => p.category.toLowerCase().includes('landing')).length;
  const customImagesCount = portfolioProjects.filter(p => p.imageUrl && p.imageUrl.startsWith('data:')).length;

  // Open Full Add Modal
  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormCategory('E-commerce');
    setFormDescription('');
    setFormImageUrl('');
    setFormLiveUrl('');
    setFormTags('E-commerce, Web Design, Techify');
    setFormCertified(true);
    setIsModalOpen(true);
  };

  // Open Full Edit Modal
  const handleOpenEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormTitle(proj.title);
    setFormCategory(proj.category || 'Landing Page');
    setFormDescription(proj.description || '');
    setFormImageUrl(proj.imageUrl || '');
    setFormLiveUrl(proj.liveUrl || '');
    setFormTags(Array.isArray(proj.tags) ? proj.tags.join(', ') : 'Web Design, Techify');
    setFormCertified(proj.certified !== false);
    setIsModalOpen(true);
  };

  // Open Quick Image Modal
  const handleOpenQuickImageModal = (proj: Project) => {
    setQuickTargetProject(proj);
    setQuickImageUrl(proj.imageUrl || '');
    setIsQuickImageModalOpen(true);
  };

  // File Upload Handlers (Full Modal)
  const handleFullFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedDataUrl = await compressImageFile(file);
      setFormImageUrl(compressedDataUrl);
      showFeedback('Imagem carregada e comprimida com sucesso!');
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      showFeedback('Erro ao carregar imagem.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // File Upload Handlers (Quick Modal)
  const handleQuickFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingQuickImage(true);
      const compressedDataUrl = await compressImageFile(file);
      setQuickImageUrl(compressedDataUrl);
      showFeedback('Imagem selecionada pronta para salvar!');
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      showFeedback('Erro ao carregar imagem.', 'error');
    } finally {
      setIsUploadingQuickImage(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropFull = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        setIsUploading(true);
        const compressed = await compressImageFile(file);
        setFormImageUrl(compressed);
        showFeedback('Imagem solta com sucesso!');
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDropQuick = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        setIsUploadingQuickImage(true);
        const compressed = await compressImageFile(file);
        setQuickImageUrl(compressed);
        showFeedback('Nova imagem solta com sucesso!');
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingQuickImage(false);
      }
    }
  };

  // AI Description Generator
  const handleGenerateAiDescription = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const generated = `${formTitle || 'Projeto'} é um projeto ${formCategory.toLowerCase()} desenvolvido pela Techify com design arrojado, layout responsivo e alta performance focado em conversão e usabilidade.`;
      setFormDescription(generated);
      setIsAiGenerating(false);
      toast.success('Descrição Gerada', 'Texto criado com sucesso pela Inteligência Artificial.');
    }, 600);
  };

  // Save Full Project
  const handleSaveFullProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.warning('Campo Obrigatório', 'Por favor, informe o nome do projeto.');
      return;
    }

    setIsSaving(true);
    const parsedTags = formTags.split(',').map(t => t.trim()).filter(Boolean);
    const finalImage = formImageUrl.trim() || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
    const finalDesc = formDescription.trim() || `${formTitle} é um projeto desenvolvido com excelência visual e código limpo.`;

    try {
      const targetDocId = editingProject?.id && !editingProject.id.startsWith('initial-fallback-') && !editingProject.id.startsWith('initial-')
        ? editingProject.id
        : (editingProject?.demoId || formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'));

      // Use setDoc with merge so it creates or updates permanently
      await setDoc(doc(db, "portfolio", targetDocId), {
        title: formTitle.trim(),
        category: formCategory,
        description: finalDesc,
        imageUrl: finalImage,
        liveUrl: formLiveUrl.trim(),
        demoId: editingProject?.demoId || (formLiveUrl.startsWith('demo:') ? formLiveUrl.replace('demo:', '') : ''),
        tags: parsedTags.length > 0 ? parsedTags : [formCategory, "Web Design", "Techify"],
        certified: formCertified,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Immediate cache sync
      try {
        const cached = JSON.parse(localStorage.getItem('techify_custom_portfolio_images') || '{}');
        cached[targetDocId] = finalImage;
        cached[formTitle.trim()] = finalImage;
        if (editingProject?.demoId) cached[editingProject.demoId] = finalImage;
        localStorage.setItem('techify_custom_portfolio_images', JSON.stringify(cached));
        window.dispatchEvent(new CustomEvent('techify-portfolio-updated', {
          detail: { id: targetDocId, title: formTitle.trim(), imageUrl: finalImage }
        }));
      } catch (cacheErr) {
        console.warn('Cache update error:', cacheErr);
      }

      toast.success('Projeto Salvo', `"${formTitle}" foi publicado no portfólio com sucesso.`);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar projeto no Firestore:', err);
      toast.error('Erro ao Salvar', 'Não foi possível salvar o projeto no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Quick Image Change
  const handleSaveQuickImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTargetProject) return;
    if (!quickImageUrl.trim()) {
      toast.warning('Imagem Vazia', 'Selecione ou insira uma imagem válida.');
      return;
    }

    setIsSavingQuickImage(true);
    try {
      const targetDocId = quickTargetProject.id && !quickTargetProject.id.startsWith('initial-fallback-') && !quickTargetProject.id.startsWith('initial-')
        ? quickTargetProject.id
        : (quickTargetProject.demoId || quickTargetProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

      // Use setDoc with merge so it creates or updates permanently in Firestore
      await setDoc(doc(db, "portfolio", targetDocId), {
        title: quickTargetProject.title,
        category: quickTargetProject.category,
        description: quickTargetProject.description,
        imageUrl: quickImageUrl.trim(),
        liveUrl: quickTargetProject.liveUrl || '',
        demoId: quickTargetProject.demoId || '',
        tags: quickTargetProject.tags || [quickTargetProject.category],
        certified: quickTargetProject.certified !== false,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Immediate cache sync for instant display
      try {
        const cached = JSON.parse(localStorage.getItem('techify_custom_portfolio_images') || '{}');
        cached[targetDocId] = quickImageUrl.trim();
        cached[quickTargetProject.title] = quickImageUrl.trim();
        if (quickTargetProject.demoId) cached[quickTargetProject.demoId] = quickImageUrl.trim();
        localStorage.setItem('techify_custom_portfolio_images', JSON.stringify(cached));
        window.dispatchEvent(new CustomEvent('techify-portfolio-updated', {
          detail: { id: targetDocId, title: quickTargetProject.title, imageUrl: quickImageUrl.trim() }
        }));
      } catch (cacheErr) {
        console.warn('Cache update error:', cacheErr);
      }

      toast.success('Capa Atualizada', `A imagem de "${quickTargetProject.title}" foi salva.`);
      setIsQuickImageModalOpen(false);
    } catch (err) {
      console.error('Erro ao atualizar imagem:', err);
      toast.error('Erro ao Atualizar', 'Não foi possível gravar a nova imagem no banco.');
    } finally {
      setIsSavingQuickImage(false);
    }
  };

  // Delete Project
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
      if (projectToDelete.id) {
        await deleteDoc(doc(db, "portfolio", projectToDelete.id));
      }
      
      // Clean local cache
      try {
        const cached = JSON.parse(localStorage.getItem('techify_custom_portfolio_images') || '{}');
        delete cached[projectToDelete.id];
        delete cached[projectToDelete.title];
        if (projectToDelete.demoId) delete cached[projectToDelete.demoId];
        localStorage.setItem('techify_custom_portfolio_images', JSON.stringify(cached));
      } catch (e) {
        console.warn('Cache clean error:', e);
      }

      toast.info('Projeto Excluído', `"${projectToDelete.title}" foi removido do portfólio definitivamente.`);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      toast.error('Erro ao Excluir', 'Não foi possível remover o projeto.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-2xl animate-fade-in ${
          feedbackMessage.type === 'success' 
            ? 'bg-[#a3e635]/15 border-[#a3e635]/40 text-[#a3e635]' 
            : 'bg-red-500/15 border-red-500/40 text-red-400'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-neutral-400 hover:text-white p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Total de Projetos</span>
            <ImageIcon className="h-4 w-4 text-[#a3e635]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">{totalCount}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Exibidos na vitrine e carrossel</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Lojas & E-commerce</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">{ecommerceCount}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Lojas virtuais e catálogos</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Landing Pages</span>
            <Globe className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">{landingCount}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Páginas de alta conversão</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Uploads Manuais</span>
            <Upload className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">{customImagesCount}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Fotos enviadas pelo admin</p>
        </div>
      </div>

      {/* Action Bar: Search, Category Filter & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-[#121312] p-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por título, categoria ou tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
          />
        </div>

        {/* Category Filter & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs px-4 py-2.5 transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Adicionar Projeto & Imagem</span>
          </button>
        </div>
      </div>

      {/* Info Tip about Manual Upload */}
      <div className="rounded-2xl border border-[#a3e635]/20 bg-[#a3e635]/5 p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635] shrink-0 mt-0.5">
          <Upload className="h-4 w-4" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-white">Opção de Inserção Manual de Imagens Ativa</p>
          <p className="text-neutral-400 mt-0.5">
            Você pode trocar a imagem de qualquer projeto existente clicando no botão <strong className="text-[#a3e635]">"Trocar Imagem"</strong> em cada card ou adicionar um novo projeto selecionando arquivos PNG, JPG ou WEBP direto da galeria do seu computador/celular.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
          <ImageIcon className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
          <p className="text-base font-bold text-white">Nenhum projeto encontrado</p>
          <p className="text-xs text-neutral-500 mt-1">Tente ajustar seus termos de busca ou filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="group relative rounded-2xl border border-neutral-800 bg-[#121312] overflow-hidden flex flex-col transition-all hover:border-neutral-700 hover:shadow-xl"
            >
              {/* Image Preview Box with Quick Change Overlay */}
              <div className="relative h-48 w-full bg-[#0a0a0a] overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badges on Image */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#a3e635] border border-[#a3e635]/30">
                    {project.category}
                  </span>
                  {project.certified && (
                    <span className="rounded-full bg-blue-500/20 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-blue-300 border border-blue-500/30">
                      Certificado
                    </span>
                  )}
                </div>

                {/* Quick "Trocar Imagem" floating button */}
                <button
                  onClick={() => handleOpenQuickImageModal(project)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-black/85 hover:bg-[#a3e635] text-white hover:text-black font-extrabold text-[11px] px-3 py-1.5 border border-neutral-700 transition-all shadow-lg cursor-pointer"
                  title="Alterar a imagem deste card"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Trocar Imagem</span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#a3e635] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="rounded-lg bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons Footer */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenQuickImageModal(project)}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[#a3e635] hover:border-[#a3e635]/40 transition-colors cursor-pointer"
                      title="Substituir foto manualmente"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Editar todos os detalhes"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl.startsWith('http') ? project.liveUrl : `https://${project.liveUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Abrir Link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-red-500/10 border border-neutral-800 text-neutral-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                    title="Excluir projeto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADICIONAR / EDITAR PROJETO COM UPLOAD MANUAL DE IMAGEM */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {editingProject ? 'Editar Projeto do Portfólio' : 'Adicionar Novo Projeto & Imagem'}
                  </h3>
                  <p className="text-xs text-neutral-400">Insira as informações e carregue a imagem do projeto</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFullProject} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              
              {/* 1. SEÇÃO DE IMAGEM MANUAL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Imagem do Projeto (Upload Manual) *</span>
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Remover foto
                    </button>
                  )}
                </label>

                {/* Upload Box / Drag and drop */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDropFull}
                  onClick={() => fullFileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#a3e635]/50 bg-[#0a0a0a] p-5 text-center hover:border-[#a3e635] hover:bg-neutral-900/50 transition-all cursor-pointer"
                >
                  <input
                    ref={fullFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFullFileSelect}
                    className="hidden"
                  />

                  {formImageUrl ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-neutral-800">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white bg-black/85 px-3 py-1.5 rounded-xl border border-neutral-700 flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5" />
                          Clique para trocar foto do computador/celular
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a3e635]/10 text-[#a3e635]">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-white">
                        {isUploading ? 'Processando imagem...' : 'Clique para escolher foto ou arraste aqui'}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        PNG, JPG, WEBP • Otimização e compressão automática
                      </p>
                    </div>
                  )}
                </div>

                {/* Alternative: Direct URL input */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="Ou cole o link direto (URL) da imagem aqui..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2 px-3 text-[11px] text-neutral-300 placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none font-mono"
                  />
                </div>

                {/* Quick Presets */}
                <div className="mt-2">
                  <p className="text-[10px] font-semibold text-neutral-500 mb-1">Ou use um modelo pré-definido:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PORTFOLIO_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImageUrl(preset.url)}
                        className="text-[10px] rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#a3e635]/40 px-2 py-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Nome do Projeto */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Projeto / Banner *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Hype Sporty - Camisas & Artigos Esportivos"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              {/* 3. Categoria e Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none cursor-pointer"
                  >
                    <option value="E-commerce">E-commerce</option>
                    <option value="Portfólio">Portfólio</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Plataforma">Plataforma</option>
                    <option value="Blog">Blog</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">URL do Site ou Demonstração</label>
                  <input
                    type="text"
                    placeholder="https://exemplo.com ou demo:mugsys-mugs"
                    value={formLiveUrl}
                    onChange={(e) => setFormLiveUrl(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* 4. Descrição com IA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-300">Descrição do Projeto</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isAiGenerating}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a3e635] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isAiGenerating ? 'Gerando com IA...' : 'Gerar com IA'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Descreva o projeto, diferenciais e resultados..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none resize-none"
                />
              </div>

              {/* 5. Tags */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="E-commerce, Dropshipping, Esportes"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-neutral-800/80 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold py-3 text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-3 text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : (editingProject ? 'Salvar Alterações' : 'Adicionar ao Portfólio')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TROCAR IMAGEM MANUALMENTE (UPLOAD RÁPIDO) */}
      {/* ========================================================================= */}
      {isQuickImageModalOpen && quickTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635]">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Trocar Imagem Manualmente</h3>
                  <p className="text-xs text-neutral-400">{quickTargetProject.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickImageModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickImage} className="space-y-4 pt-4">
              
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDropQuick}
                onClick={() => quickFileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#a3e635]/50 bg-[#0a0a0a] p-4 text-center hover:border-[#a3e635] hover:bg-neutral-900/50 transition-all cursor-pointer"
              >
                <input
                  ref={quickFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQuickFileSelect}
                  className="hidden"
                />

                {quickImageUrl ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-neutral-800">
                    <img
                      src={quickImageUrl}
                      alt="Preview Nova Imagem"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white bg-black/85 px-3 py-1.5 rounded-xl border border-neutral-700 flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        Escolher outro arquivo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <Upload className="mx-auto h-8 w-8 text-[#a3e635] mb-2" />
                    <p className="text-xs font-bold text-white">
                      {isUploadingQuickImage ? 'Processando imagem...' : 'Clique para selecionar foto ou arraste aqui'}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      PNG, JPG ou WEBP do seu dispositivo
                    </p>
                  </div>
                )}
              </div>

              {/* Paste URL */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Ou informe a URL direta da imagem:</label>
                <input
                  type="text"
                  placeholder="https://exemplo.com/minha-imagem.jpg"
                  value={quickImageUrl}
                  onChange={(e) => setQuickImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2 px-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none font-mono"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-neutral-800/80 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuickImageModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickImage}
                  className="flex-1 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-2.5 text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSavingQuickImage ? 'Salvando...' : 'Salvar Nova Imagem'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXCLUIR PROJETO */}
      {/* ========================================================================= */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/30">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">Excluir do Portfólio</h3>
            <p className="text-xs text-neutral-400 mt-2 mb-6 leading-relaxed">
              Tem certeza que deseja remover <strong className="text-white">"{projectToDelete.title}"</strong> da vitrine de projetos?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
