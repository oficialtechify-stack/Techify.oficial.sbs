import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Search, 
  Globe, 
  ExternalLink, 
  Zap, 
  Filter,
  Plus,
  X,
  Upload,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';
import { Project } from '../types';
import GlassButton, { GlassEffect } from './GlassButton';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminAuth } from '../lib/adminAuth';
import { INITIAL_PORTFOLIO_SITES, PORTFOLIO_PRESET_IMAGES } from '../data/portfolioData';
import { compressImageFile } from '../lib/imageUtils';

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

interface PortfolioSectionProps {
  onBackToHome?: () => void;
  onLaunchDemo?: (projectId: string) => void;
  onOpenConsultation?: (serviceName?: string) => void;
}

// Helper function to guarantee secure HTTPS protocol on all external links
const formatHttpsUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('demo:')) return trimmed;
  if (trimmed.startsWith('http://')) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('mailto:') && !trimmed.startsWith('tel:') && !trimmed.startsWith('#')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export default function PortfolioSection({ onLaunchDemo }: PortfolioSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>(() => INITIAL_PORTFOLIO_SITES.map((item, idx) => ({
    id: `initial-${idx}`,
    title: item.title,
    category: item.category,
    description: item.description,
    imageUrl: item.imageUrl,
    liveUrl: item.liveUrl,
    demoId: item.demoId,
    tags: item.tags,
    certified: item.certified
  })));

  // Framer Motion Scroll Parallax Transforms
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yOrbTopRight = useTransform(scrollYProgress, [0, 1], [-60, 220]);
  const yOrbMidLeft = useTransform(scrollYProgress, [0, 1], [100, -200]);
  const yOrbBottomRight = useTransform(scrollYProgress, [0, 1], [-40, 160]);
  const rotateTechRing = useTransform(scrollYProgress, [0, 1], [0, 55]);
  const rotateTechRing2 = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const scaleOrb = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.2, 0.95]);
  const opacityOrb = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.35, 0.2]);

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Admin Auth State
  const { isAdmin } = useAdminAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Add/Edit Site Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form inputs matching screenshots 2 & 3
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Landing Page');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // File input reference for photo selection directly from device gallery
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Firestore sync for Portfolio
  useEffect(() => {
    // Only seed once if portfolio collection is totally empty
    const checkAndSeedInitialPortfolio = async () => {
      try {
        const snap = await getDocs(collection(db, "portfolio"));
        if (snap.empty) {
          for (const item of INITIAL_PORTFOLIO_SITES) {
            const docId = item.id || (item.demoId || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            await setDoc(doc(db, "portfolio", docId), {
              ...item,
              createdAt: item.createdAt || new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn("Portfolio initial seed check:", err);
      }
    };

    checkAndSeedInitialPortfolio();

    const unsub = onSnapshot(collection(db, "portfolio"), (snapshot) => {
      const fetched: Project[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          title: data.title || '',
          category: data.category || 'Landing Page',
          description: data.description || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
          liveUrl: data.liveUrl || '',
          demoId: data.demoId || (data.liveUrl?.startsWith('demo:') ? data.liveUrl.replace('demo:', '') : ''),
          tags: Array.isArray(data.tags) ? data.tags : [data.category || 'Site'],
          certified: data.certified !== false
        });
      });

      setProjects(fetched);
    }, (err) => {
      console.warn('Firestore portfolio listener offline/error:', err.message);
    });

    const handleLocalUpdate = (e: Event) => {
      try {
        const customEvt = e as CustomEvent<{ id: string; imageUrl: string; title?: string }>;
        const detail = customEvt.detail;
        if (detail && detail.imageUrl) {
          setProjects(prev => prev.map(p => {
            if (p.id === detail.id || (detail.title && p.title.toLowerCase() === detail.title.toLowerCase()) || (p.demoId && p.demoId === detail.id)) {
              return { ...p, imageUrl: detail.imageUrl };
            }
            return p;
          }));
        }
      } catch (err) {
        console.warn(err);
      }
    };

    window.addEventListener('techify-portfolio-updated', handleLocalUpdate);

    return () => {
      unsub();
      window.removeEventListener('techify-portfolio-updated', handleLocalUpdate);
    };
  }, []);

  // Filter projects by search and category
  const filteredProjects = projects.filter((proj) => {
    const matchesCategory = 
      selectedCategory === 'Todos' || 
      proj.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Open Modal for adding a new site
  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setEditingProjectId(null);
    setTitleInput('');
    setUrlInput('');
    setImageUrlInput('');
    setCategoryInput('Landing Page');
    setDescriptionInput('');
    setIsModalOpen(true);
  };

  // Open Modal for editing an existing site
  const handleOpenEditModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(proj.id);
    setTitleInput(proj.title);
    setUrlInput(proj.liveUrl || '');
    setImageUrlInput(proj.imageUrl);
    setCategoryInput(proj.category || 'Landing Page');
    setDescriptionInput(proj.description);
    setIsModalOpen(true);
  };

  // Request delete (opens custom modal)
  const handleDeleteProject = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setProjectToDelete(proj);
  };

  // Open Site or Interactive Demo
  const handleOpenSite = (proj: Project, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Determine target demo ID if applicable
    let targetDemo = proj.demoId;
    if (!targetDemo && proj.liveUrl) {
      if (proj.liveUrl.startsWith('demo:')) {
        targetDemo = proj.liveUrl.replace('demo:', '');
      } else if (proj.liveUrl.includes('mugsys-mugs')) {
        targetDemo = 'mugsys-mugs';
      } else if (proj.liveUrl.includes('mindloop')) {
        targetDemo = 'mindloop';
      } else if (proj.liveUrl.includes('yuffie') || proj.liveUrl.includes('epic-designer')) {
        targetDemo = 'yuffie';
      } else if (proj.liveUrl.includes('wandr') || proj.liveUrl.includes('kaldi')) {
        targetDemo = 'wandr';
      } else if (proj.liveUrl.includes('asme')) {
        targetDemo = 'asme';
      } else if (proj.liveUrl.includes('toonhub')) {
        targetDemo = 'toonhub';
      }
    }

    if (targetDemo && onLaunchDemo) {
      onLaunchDemo(targetDemo);
    } else if (proj.liveUrl) {
      const secureUrl = formatHttpsUrl(proj.liveUrl);
      if (secureUrl.startsWith('https://') || secureUrl.startsWith('http://')) {
        window.open(secureUrl, '_blank', 'noopener,noreferrer');
      } else {
        setSelectedProject(proj);
      }
    } else {
      setSelectedProject(proj);
    }
  };

  // Confirm and execute delete
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const targetId = projectToDelete.id;

    // Immediately update local state
    setProjects(prev => prev.filter(p => p.id !== targetId));
    if (selectedProject?.id === targetId) {
      setSelectedProject(null);
    }

    // Clean local cache
    try {
      const cached = JSON.parse(localStorage.getItem('techify_custom_portfolio_images') || '{}');
      delete cached[targetId];
      delete cached[projectToDelete.title];
      if (projectToDelete.demoId) delete cached[projectToDelete.demoId];
      localStorage.setItem('techify_custom_portfolio_images', JSON.stringify(cached));
    } catch (e) {
      console.warn('Cache clean error:', e);
    }

    setProjectToDelete(null);

    // Delete from Firestore
    try {
      if (targetId) {
        await deleteDoc(doc(db, "portfolio", targetId));
      }
    } catch (err) {
      console.error("Error deleting project from Firestore:", err);
    }
  };

  // Handle Photo selection directly from Device Gallery / File Explorer with smart compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImageFile(file);
        setImageUrlInput(compressedDataUrl);
      } catch (err) {
        console.error("Error compressing selected image file:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImageUrlInput(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Generate description with AI
  const handleGenerateAiDescription = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const generated = `${titleInput || 'Projeto'} é um site ${categoryInput.toLowerCase()} moderno e responsivo, desenvolvido com alta performance, design atraente e foco na experiência do usuário.`;
      setDescriptionInput(generated);
      setIsAiGenerating(false);
    }, 600);
  };

  // Save (Create / Update) project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    setIsSaving(true);
    const finalImage = imageUrlInput.trim() || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
    const finalDescription = descriptionInput.trim() || `${titleInput} é um projeto desenvolvido com excelência visual e código limpo.`;
    const finalLiveUrl = formatHttpsUrl(urlInput);

    try {
      const targetDocId = editingProjectId && !editingProjectId.startsWith('initial-fallback-') && !editingProjectId.startsWith('initial-')
        ? editingProjectId
        : (titleInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'));

      await setDoc(doc(db, "portfolio", targetDocId), {
        title: titleInput.trim(),
        category: categoryInput,
        description: finalDescription,
        imageUrl: finalImage,
        liveUrl: finalLiveUrl,
        tags: [categoryInput, "Web Design", "Techify"],
        certified: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      try {
        const cached = JSON.parse(localStorage.getItem('techify_custom_portfolio_images') || '{}');
        cached[targetDocId] = finalImage;
        cached[titleInput.trim()] = finalImage;
        localStorage.setItem('techify_custom_portfolio_images', JSON.stringify(cached));
        window.dispatchEvent(new CustomEvent('techify-portfolio-updated', {
          detail: { id: targetDocId, title: titleInput.trim(), imageUrl: finalImage }
        }));
      } catch (cacheErr) {
        console.warn(cacheErr);
      }

      setIsSaving(false);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving portfolio project:", err);
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden bg-[#030303] bg-nebula pb-24 pt-12 text-white">
      {/* Background Parallax Ambient Aura & Geometric Accents */}
      <motion.div 
        style={{ y: yOrbTopRight, scale: scaleOrb, opacity: opacityOrb }}
        className="pointer-events-none absolute -top-24 right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.18),transparent_70%)] blur-[100px] z-0"
      />
      <motion.div 
        style={{ y: yOrbMidLeft }}
        className="pointer-events-none absolute top-[35%] left-[-15%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_70%)] blur-[120px] z-0"
      />
      <motion.div 
        style={{ y: yOrbBottomRight }}
        className="pointer-events-none absolute bottom-10 right-[-5%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_70%)] blur-[100px] z-0"
      />

      {/* Floating Parallax Cyber Rings */}
      <motion.div
        style={{ y: yOrbTopRight, rotate: rotateTechRing }}
        className="pointer-events-none absolute top-12 right-12 sm:right-36 w-64 h-64 rounded-full border border-[#a3e635]/15 opacity-30 [border-dasharray:10px] z-0"
      />
      <motion.div
        style={{ y: yOrbMidLeft, rotate: rotateTechRing2 }}
        className="pointer-events-none absolute top-[45%] left-8 sm:left-24 w-80 h-80 rounded-full border border-purple-500/15 opacity-25 [border-dasharray:12px] z-0"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header matching Screenshot 1 with Entrance Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-neutral-900"
        >
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Portfólio de <span className="text-[#a3e635]">Sites</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 font-sans">
              Projetos desenvolvidos com excelência
            </p>
          </div>

          {/* Green "Adicionar Site" Button (Only visible for Admin) */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <GlassButton
                onClick={handleOpenAddModal}
                variant="lime"
                size="md"
                className="rounded-xl px-6 py-3.5 text-sm font-extrabold"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" />
                <span>Adicionar Site</span>
              </GlassButton>
            </motion.div>
          )}
        </motion.div>

        {/* Filter Controls & Category Selector with Entrance Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 space-y-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 transition-all focus:border-[#a3e635] focus:bg-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
              <Filter className="h-4 w-4 text-[#a3e635]" />
              <span>CATEGORIA</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <GlassEffect
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={isActive ? "lime" : "dark"}
                  className={`rounded-full px-4 py-2 text-xs font-bold cursor-pointer whitespace-nowrap ${
                    isActive ? "text-[#a3e635]" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat}
                </GlassEffect>
              );
            })}
          </div>
        </motion.div>

        {/* PROJECTS GRID MATCHING SCREENSHOT 1 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-neutral-900 bg-[#0d0e0d] py-16 text-center p-8">
              <Globe className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
              <h3 className="font-display text-lg font-bold text-neutral-300">
                Nenhum site encontrado
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-neutral-500">
                Clique no botão "Adicionar Site" para cadastrar um novo projeto no seu portfólio.
              </p>
            </div>
          ) : (
            filteredProjects.map((proj, idx) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)', scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                viewport={{ once: false, amount: 0.12 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800/90 bg-[#121312] hover:border-[#a3e635]/40 transition-all duration-300 shadow-xl"
              >
                {/* Image Header matching screenshot 1 */}
                <div className="relative h-52 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121312] via-transparent to-black/20" />

                  {/* Quick Actions: Edit & Delete (Admin Only) */}
                  {isAdmin && (
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md rounded-lg p-1 border border-neutral-800 opacity-90 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => handleOpenEditModal(proj, e)}
                        className="text-neutral-300 hover:text-[#a3e635] p-1.5 transition-colors cursor-pointer"
                        title="Editar projeto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(proj, e)}
                        className="text-neutral-300 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                        title="Excluir projeto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* External Link Icon matching screenshot 1 top right */}
                  <button
                    onClick={(e) => handleOpenSite(proj, e)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/80 border border-neutral-800 text-neutral-300 hover:text-[#a3e635] hover:border-[#a3e635]/50 transition-all cursor-pointer z-10"
                    title="Abrir site/demo"
                  >
                    <ExternalLink className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Card Content Body matching screenshot 1 */}
                <div 
                  onClick={(e) => handleOpenSite(proj, e)}
                  className="p-6 flex-1 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Title & External Icon Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="font-extrabold text-xl text-white tracking-tight uppercase group-hover:text-[#a3e635] transition-colors">
                        {proj.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-[#a3e635] shrink-0" />
                    </div>

                    {/* Category Tag Badge matching screenshot 1 (e.g. landing-page, corporativo) */}
                    <div className="mb-3">
                      <span className="inline-block bg-[#2a133a]/90 border border-[#a855f7]/40 text-[#d8b4fe] text-[11px] font-semibold px-3 py-1 rounded-full lowercase">
                        {proj.category.toLowerCase()}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 mb-4">
                      {proj.description}
                    </p>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-4 border-t border-neutral-800/60 mt-4">
                    <GlassButton
                      onClick={(e) => handleOpenSite(proj, e)}
                      variant="dark"
                      size="sm"
                      className="w-full rounded-xl py-2.5 text-xs font-bold text-white hover:text-[#a3e635]"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{proj.demoId || proj.liveUrl?.startsWith('demo:') ? 'Abrir Site Interativo' : 'Visitar Website'}</span>
                    </GlassButton>
                  </div>

                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>

      {/* MODAL "ADICIONAR NOVO SITE" / "EDITAR SITE" MATCHING SCREENSHOTS 2 & 3 */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header matching Screenshot 2 */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
                <h2 className="text-xl font-bold text-white font-sans">
                  {editingProjectId ? 'Editar Site' : 'Adicionar Novo Site'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body matching Screenshots 2 & 3 */}
              <form onSubmit={handleSaveProject} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                
                {/* 1. Nome do Projeto */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Projeto</label>
                  <input
                    required
                    type="text"
                    placeholder="Digite o nome do projeto"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                {/* 2. URL do Site */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">URL do Site</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                {/* 3. Imagem do Site (Gallery upload + URL fallback) matching Screenshot 2 */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Imagem do Site</label>
                  
                  {/* File Upload Box directly from gallery */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#a3e635]/50 bg-[#0a0a0a] p-6 text-center hover:border-[#a3e635] hover:bg-neutral-900/50 transition-all cursor-pointer"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {imageUrlInput ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-neutral-800">
                        <img
                          src={imageUrlInput}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold text-white bg-black/80 px-3 py-1.5 rounded-lg border border-neutral-700">
                            Trocar Imagem
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 text-[#a3e635]">
                          <Upload className="h-8 w-8 stroke-[1.8]" />
                        </div>
                        <p className="text-xs font-bold text-neutral-300">
                          Clique para adicionar foto da galeria
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          PNG, JPG ou WEBP do seu dispositivo
                        </p>
                      </>
                    )}
                  </div>

                  {/* Or paste image URL */}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem aqui..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2 px-3 text-[11px] text-neutral-400 placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Categoria Select matching Screenshot 3 */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Categoria</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none cursor-pointer"
                  >
                    <option value="E-commerce">E-commerce</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Blog">Blog</option>
                    <option value="Portfólio">Portfólio</option>
                    <option value="Plataforma">Plataforma</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {/* 5. Descrição + IA automatic generator matching Screenshot 2 & 3 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-300">Descrição</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={isAiGenerating}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a3e635] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isAiGenerating ? 'Gerando...' : 'Gerar com IA'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Digite a descrição do projeto..."
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none resize-none"
                  />

                  {/* AI Banner Box matching Screenshot 2 */}
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#a3e635]/30 bg-[#a3e635]/10 p-2.5 text-xs text-[#a3e635]">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span className="text-[11px]">A descrição será gerada automaticamente por IA se deixada em branco.</span>
                  </div>
                </div>

                {/* Bottom Buttons matching Screenshot 2 & 3 */}
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
                    {isSaving ? 'Salvando...' : (editingProjectId ? 'Salvar Alterações' : 'Adicionar')}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#121312] p-6 shadow-2xl text-white z-10"
            >
              <div className="relative h-60 w-full overflow-hidden rounded-xl border border-neutral-800">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute right-3 top-3 rounded-full bg-black/80 border border-neutral-800 p-1.5 text-white hover:bg-neutral-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#2a133a] border border-[#a855f7]/40 text-[#d8b4fe] text-[10px] font-semibold px-2.5 py-0.5 rounded-full lowercase">
                    {selectedProject.category}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white">{selectedProject.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{selectedProject.description}</p>

                <div className="pt-4 border-t border-neutral-800 flex gap-3">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-bold text-neutral-300 hover:text-white"
                  >
                    Fechar
                  </button>
                  {selectedProject.liveUrl && (
                    <a
                      href={formatHttpsUrl(selectedProject.liveUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs py-2.5"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Visitar Website</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/30">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Excluir Projeto</h3>
              <p className="text-xs text-neutral-400 mt-2 mb-6 leading-relaxed">
                Tem certeza que deseja excluir o site <strong className="text-white">"{projectToDelete.title}"</strong> do portfólio? Esta ação não pode ser desfeita.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProject}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 text-xs shadow-lg transition-colors cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
