import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Search, Filter, AlertCircle, ArrowUpRight, MapPin, Clock, 
  DollarSign, ChevronDown, ChevronUp, Send, CheckCircle, ArrowRight,
  Plus, X, Shield, Trash2, ChevronRight, Linkedin, Instagram, Globe,
  FileText, Paperclip, Phone, Calendar, User, Mail, UploadCloud, Edit,
  Share2, Copy, Check, MessageCircle, ExternalLink, Sparkles
} from 'lucide-react';
import { toast } from './Toast';
import { Job } from '../types';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminAuth } from '../lib/adminAuth';
import { ShaderBackground } from './ShaderBackground';
import GlassButton, { GlassEffect } from './GlassButton';

const INITIAL_JOBS = [
  {
    title: "VENHA FAZER PARTE DA FAMÍLIA TECHIFY",
    category: "Outro",
    type: "Tempo Integral",
    location: "Recife, SP, RJ, BA, e outros lugares",
    description: "Vem fazer parte da família Techify, design, DEV, Programador, e outros.",
    requirements: ["Paixão por tecnologia", "Trabalho em equipe", "Vontade de aprender"],
    benefits: ["Ambiente dinâmico", "Projetos inovadores", "Horário flexível"],
    salary: "A combinar",
    createdAt: new Date().toISOString()
  },
  {
    title: "DESIGNER",
    category: "Design",
    type: "Estágio",
    location: "RECIFE",
    description: "PRECISAMOS DE DESIGNER PRA NOSSA EQUIPE.",
    requirements: ["Figma / Photoshop", "Criatividade", "Noção de UI/UX"],
    benefits: ["Bolsa auxílio", "Mentoria", "Oportunidade de efetivação"],
    salary: "R$ 1.500 / mês",
    createdAt: new Date().toISOString()
  },
  {
    title: "API DESIGNER",
    category: "Desenvolvimento",
    type: "Tempo Integral",
    location: "Remoto",
    description: "Arquitetura e design de APIs intuitivas e escaláveis — REST, GraphQL e especificações OpenAPI 3.1.",
    requirements: ["REST & GraphQL", "OAuth 2.0 / JWT", "OpenAPI 3.1", "Node.js / TypeScript"],
    benefits: ["100% Remoto", "Plano de Saúde", "Budget para Cursos"],
    salary: "R$ 14.000 - R$ 18.000 / mês",
    createdAt: new Date().toISOString()
  }
];

export default function CareersSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);

  // Admin protection state
  const { isAdmin } = useAdminAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Modal "Publicar / Editar Vaga" state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    category: 'Design',
    type: 'Tempo Integral',
    location: '',
    description: '',
    salary: '',
  });
  
  // Tag inputs inside publish modal
  const [reqInput, setReqInput] = useState('');
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  
  const [benInput, setBenInput] = useState('');
  const [benefitsList, setBenefitsList] = useState<string[]>([]);

  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Social Share Job state
  const [sharingJobModal, setSharingJobModal] = useState<Job | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  // Helper to generate precise deep-link for a job
  const getJobShareUrl = (job: Job): string => {
    if (typeof window === 'undefined') return `https://www.techify.sbs/?tab=carreiras&vaga=${job.id}#vaga-${job.id}`;
    const isCustomDomain = window.location.hostname.includes('techify.sbs');
    const base = isCustomDomain ? 'https://www.techify.sbs' : window.location.origin;
    return `${base}${window.location.pathname}?tab=carreiras&vaga=${encodeURIComponent(job.id)}#vaga-${encodeURIComponent(job.id)}`;
  };

  // Helper to copy job link with feedback
  const handleCopyJobLink = async (job: Job) => {
    const url = getJobShareUrl(job);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedJobId(job.id || 'copied');
      toast.success('Link Copiado!', 'O link direto desta vaga foi copiado com sucesso.');
      setTimeout(() => setCopiedJobId(null), 2500);
    } catch (err) {
      console.error('Error copying job link:', err);
      toast.info('Link da vaga', url);
    }
  };

  // Helper to share job natively or open modal
  const handleShareJob = (job: Job) => {
    setSharingJobModal(job);
  };

  // Apply form state
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    linkedin: '',
    instagram: '',
    portfolio: '',
    experience: ''
  });

  const [curriculoFile, setCurriculoFile] = useState<{
    nomeArquivo: string;
    tipoArquivo: string;
    tamanho: string;
    conteudoBase64: string;
  } | null>(null);

  const [fileError, setFileError] = useState<string>('');
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('O arquivo de currículo deve ter no máximo 5MB.');
      return;
    }

    setFileError('');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCurriculoFile({
        nomeArquivo: file.name,
        tipoArquivo: file.type,
        tamanho: `${(file.size / 1024).toFixed(1)} KB`,
        conteudoBase64: base64
      });
    };
    reader.readAsDataURL(file);
  };

  // Real-time Firestore Listeners & Initial Seed
  useEffect(() => {
    const seedAndListen = async () => {
      try {
        const snap = await getDocs(collection(db, "vagas"));
        if (snap.empty) {
          for (const item of INITIAL_JOBS) {
            await addDoc(collection(db, "vagas"), item);
          }
        }
      } catch (err) {
        console.error("Error seeding initial jobs:", err);
      }
    };

    seedAndListen();

    const unsub = onSnapshot(collection(db, "vagas"), (snapshot) => {
      const fetched: Job[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          title: data.title || '',
          category: data.category || 'Outro',
          type: data.type || 'Tempo Integral',
          location: data.location || 'Remoto',
          description: data.description || '',
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          benefits: Array.isArray(data.benefits) ? data.benefits : [],
          salary: data.salary || '',
          createdAt: data.createdAt || ''
        });
      });
      setJobs(fetched);
    }, (err) => console.warn('Firestore vagas listener offline/error:', err.message));

    return () => unsub();
  }, []);

  // Detect direct deep-linked job from URL (?vaga=ID or #vaga-ID) and scroll/highlight immediately
  useEffect(() => {
    if (jobs.length === 0) return;

    const detectAndScrollToJob = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const vagaParam = searchParams.get('vaga') || searchParams.get('job') || searchParams.get('id');
        let targetId = vagaParam;

        if (!targetId && window.location.hash) {
          const cleanHash = window.location.hash.replace('#vaga-', '').replace('#', '');
          if (cleanHash && cleanHash !== 'carreiras' && cleanHash !== 'vagas') {
            targetId = cleanHash;
          }
        }

        if (targetId) {
          const cleanTarget = targetId.trim().toLowerCase();
          const matchedJob = jobs.find(
            (j) =>
              j.id === targetId ||
              j.id.toLowerCase() === cleanTarget ||
              j.title.toLowerCase().replace(/\s+/g, '-').includes(cleanTarget)
          );

          if (matchedJob) {
            setSelectedRole('Todos');
            setSearchQuery('');
            setExpandedJobId(matchedJob.id);
            setHighlightedJobId(matchedJob.id);

            setTimeout(() => {
              const el = document.getElementById(`vaga-${matchedJob.id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);

            const timer = setTimeout(() => {
              setHighlightedJobId(null);
            }, 7000);

            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.warn('Error detecting deep-linked job:', err);
      }
    };

    detectAndScrollToJob();

    window.addEventListener('hashchange', detectAndScrollToJob);
    window.addEventListener('popstate', detectAndScrollToJob);

    return () => {
      window.removeEventListener('hashchange', detectAndScrollToJob);
      window.removeEventListener('popstate', detectAndScrollToJob);
    };
  }, [jobs]);

  // Filter roles dynamically
  const MOCK_ROLES = ['Todos', 'Design', 'Desenvolvimento', 'Marketing', 'Vendas', 'Outro'];

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = 
      selectedRole === 'Todos' || 
      job.category.toLowerCase() === selectedRole.toLowerCase();

    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleOpenPublishModal = () => {
    if (!isAdmin) return;
    setEditingJobId(null);
    setNewJobForm({
      title: '',
      category: 'Design',
      type: 'Tempo Integral',
      location: '',
      description: '',
      salary: '',
    });
    setRequirementsList([]);
    setBenefitsList([]);
    setIsPublishModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAdmin) return;
    setEditingJobId(job.id);
    setNewJobForm({
      title: job.title || '',
      category: job.category || 'Design',
      type: job.type || 'Tempo Integral',
      location: job.location || '',
      description: job.description || '',
      salary: job.salary || '',
    });
    setRequirementsList(job.requirements || []);
    setBenefitsList(job.benefits || []);
    setIsPublishModalOpen(true);
  };

  // Add tag handlers
  const handleAddRequirement = () => {
    if (reqInput.trim()) {
      setRequirementsList([...requirementsList, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirementsList(requirementsList.filter((_, i) => i !== index));
  };

  const handleAddBenefit = () => {
    if (benInput.trim()) {
      setBenefitsList([...benefitsList, benInput.trim()]);
      setBenInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefitsList(benefitsList.filter((_, i) => i !== index));
  };

  // Submit (Create or Update) job in Firestore
  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title || !newJobForm.location || !newJobForm.description) return;

    setIsSubmittingJob(true);
    try {
      const payload = {
        title: newJobForm.title,
        category: newJobForm.category,
        type: newJobForm.type,
        location: newJobForm.location,
        description: newJobForm.description,
        requirements: requirementsList.length > 0 ? requirementsList : ["Experiência na área"],
        benefits: benefitsList.length > 0 ? benefitsList : ["Flexibilidade"],
        salary: newJobForm.salary || 'A combinar',
        updatedAt: new Date().toISOString()
      };

      if (editingJobId) {
        await updateDoc(doc(db, "vagas", editingJobId), payload);
      } else {
        await addDoc(collection(db, "vagas"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
      }

      setIsSubmittingJob(false);
      setIsPublishModalOpen(false);
      setEditingJobId(null);
      // Reset form
      setNewJobForm({
        title: '',
        category: 'Design',
        type: 'Tempo Integral',
        location: '',
        description: '',
        salary: '',
      });
      setRequirementsList([]);
      setBenefitsList([]);
    } catch (err) {
      console.error("Error publishing/updating job in Firestore:", err);
      setIsSubmittingJob(false);
    }
  };

  // Delete Job handler
  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    e.preventDefault();

    // Immediately update state
    setJobs(prev => prev.filter(j => j.id !== jobId));

    // Delete from Firestore
    try {
      if (jobId) {
        await deleteDoc(doc(db, "vagas", jobId));
      }
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  // Candidatura submit
  const handleApplySubmit = async (e: React.FormEvent, jobTitle: string) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "candidaturas"), {
        nome: applyForm.name,
        email: applyForm.email,
        telefone: applyForm.telefone,
        dataNascimento: applyForm.dataNascimento || '',
        vaga: jobTitle,
        linkedin: applyForm.linkedin || '',
        instagram: applyForm.instagram || '',
        portfolio: applyForm.portfolio || '',
        curriculo: curriculoFile || null,
        experiencia: applyForm.experience || '',
        status: 'pendente',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error saving candidatura to Firestore:", err);
    }

    setAppliedSuccessfully(true);
    setTimeout(() => {
      setAppliedSuccessfully(false);
      setApplyingJobId(null);
      setApplyForm({
        name: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        linkedin: '',
        instagram: '',
        portfolio: '',
        experience: ''
      });
      setCurriculoFile(null);
      setFileError('');
    }, 4000);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#030303] pb-24 pt-12 text-white">
      {/* Dynamic Shader Background */}
      <ShaderBackground className="absolute inset-0 z-0 opacity-80 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Top Title with Motion Entrance */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className="font-display text-4xl font-black tracking-tight text-white sm:text-6xl leading-tight">
            Junte-se ao <span className="text-[#a3e635]">Time Techify</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-center text-sm sm:text-base leading-relaxed text-neutral-400 font-sans">
            Construa o futuro do design digital conosco. Estamos procurando talentos apaixonados por criar experiências incríveis.
          </p>

          {/* GREEN "PUBLICAR VAGA" BUTTON (Admin Only) */}
          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-8 flex justify-center"
            >
              <GlassButton
                onClick={handleOpenPublishModal}
                variant="lime"
                size="md"
                className="rounded-xl px-6 py-3.5 text-sm font-extrabold"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" />
                <span>Publicar Vaga</span>
              </GlassButton>
            </motion.div>
          )}
        </motion.div>

        {/* Filter controls and Search Bar with Motion Entrance */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 space-y-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-900 pb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar vagas por título, stack ou requisitos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 transition-all focus:border-[#a3e635] focus:bg-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
              <Filter className="h-4 w-4 text-[#a3e635]" />
              <span>DEPARTAMENTO</span>
            </div>
          </div>

          {/* Department Selectors */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
            {MOCK_ROLES.map((role) => {
              const isActive = selectedRole === role;
              return (
                <GlassEffect
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setApplyingJobId(null);
                  }}
                  variant={isActive ? "lime" : "dark"}
                  className={`rounded-full px-5 py-2 text-xs font-black tracking-wide cursor-pointer whitespace-nowrap ${
                    isActive ? 'text-[#a3e635]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {role}
                </GlassEffect>
              );
            })}
          </div>
        </motion.div>

        {/* JOB CARDS GRID (Exact match to screenshot 1 design) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-neutral-900 bg-[#0d0e0d] py-16 text-center p-8">
              <Briefcase className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
              <h3 className="font-display text-xl font-bold text-neutral-300">
                Nenhuma vaga encontrada
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-neutral-500">
                Clique no botão "+ Publicar Vaga" para cadastrar uma nova oportunidade.
              </p>
            </div>
          ) : (
            filteredJobs.map((job, idx) => {
              const isExpanded = expandedJobId === job.id;
              const isApplying = applyingJobId === job.id;
              const isHighlighted = highlightedJobId === job.id;

              return (
                <motion.div
                  key={job.id}
                  id={`vaga-${job.id}`}
                  initial={{ opacity: 0, y: 30, filter: 'blur(10px)', scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                  viewport={{ once: false, amount: 0.12 }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden p-6 flex flex-col justify-between shadow-lg ${
                    isHighlighted
                      ? 'border-[#a3e635] bg-[#131a11] ring-2 ring-[#a3e635] shadow-[0_0_35px_rgba(163,230,53,0.3)]'
                      : 'border-neutral-800/90 bg-[#121312] hover:border-[#a3e635]/40'
                  }`}
                >
                  <div>
                    {/* Deep link direct highlight badge */}
                    {isHighlighted && (
                      <div className="mb-4 flex items-center justify-between rounded-xl bg-[#a3e635]/20 border border-[#a3e635]/50 px-3.5 py-2 text-xs text-[#a3e635] font-bold">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
                          <span>Vaga acessada via link direto</span>
                        </div>
                        <span className="text-[10px] text-neutral-300 font-medium">Visualizando detalhes</span>
                      </div>
                    )}

                    {/* Top Row: Title + Chevron / Admin Delete */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h2 
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="font-bold text-lg sm:text-xl text-white uppercase tracking-tight group-hover:text-[#a3e635] transition-colors cursor-pointer flex-1"
                      >
                        {job.title}
                      </h2>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Share Job Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareJob(job);
                          }}
                          className="text-neutral-400 hover:text-[#a3e635] hover:bg-[#a3e635]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Compartilhar vaga nas redes sociais"
                          aria-label="Compartilhar vaga"
                        >
                          <Share2 className="h-4.5 w-4.5" />
                        </button>

                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleOpenEditModal(e, job)}
                              className="text-neutral-500 hover:text-[#a3e635] hover:bg-[#a3e635]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Editar vaga"
                            >
                              <Edit className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteJob(e, job.id)}
                              className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Excluir vaga"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          className="text-neutral-400 group-hover:text-white p-1 transition-colors cursor-pointer"
                        >
                          <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-[#a3e635]' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Tag Badges matching screenshot 1 */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {/* Department Tag */}
                      <span className="bg-[#262626] border border-neutral-700/60 text-neutral-300 text-[11px] font-medium px-2.5 py-0.5 rounded-md lowercase">
                        {job.category.toLowerCase()}
                      </span>

                      {/* Type Tag */}
                      <span className="bg-[#14532d]/60 border border-[#22c55e]/50 text-[#4ade80] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                        {job.type}
                      </span>

                      {job.salary && (
                        <span className="bg-neutral-900 border border-neutral-800 text-[#a3e635] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                          {job.salary}
                        </span>
                      )}
                    </div>

                    {/* Location Row */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
                      <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                      <span className="uppercase text-[11px] tracking-wide">{job.location}</span>
                    </div>

                    {/* Short description */}
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  {/* Expand / Share / Apply CTA Bottom Row */}
                  <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes completos'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareJob(job);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
                        title="Compartilhar vaga"
                      >
                        <Share2 className="h-3.5 w-3.5 text-[#a3e635]" />
                        <span className="hidden sm:inline">Compartilhar</span>
                      </button>

                      <GlassButton
                        onClick={() => {
                          setApplyingJobId(isApplying ? null : job.id);
                          setExpandedJobId(job.id);
                        }}
                        variant="lime"
                        size="sm"
                        className="px-4 py-2 rounded-xl text-xs font-extrabold"
                      >
                        Candidatar-se
                      </GlassButton>
                    </div>
                  </div>

                  {/* Expanded Content Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-neutral-800/80 space-y-4 text-xs"
                      >
                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                          <div>
                            <h4 className="font-bold text-[#a3e635] mb-2 uppercase text-[10px] tracking-wider">Requisitos:</h4>
                            <ul className="space-y-1 text-neutral-300">
                              {job.requirements.map((req, rid) => (
                                <li key={rid} className="flex items-start gap-2">
                                  <span className="text-[#a3e635] font-bold">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Benefits */}
                        {job.benefits && job.benefits.length > 0 && (
                          <div>
                            <h4 className="font-bold text-[#a3e635] mb-2 uppercase text-[10px] tracking-wider">Benefícios:</h4>
                            <ul className="space-y-1 text-neutral-300">
                              {job.benefits.map((ben, bid) => (
                                <li key={bid} className="flex items-start gap-2">
                                  <span className="text-[#a3e635] font-bold">•</span>
                                  <span>{ben}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Social Share Callout Box */}
                        <div className="rounded-xl border border-neutral-800 bg-[#0d0e0d] p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-[11px] font-bold text-neutral-200 flex items-center gap-1.5">
                              <Share2 className="h-3.5 w-3.5 text-[#a3e635]" />
                              Divulgar esta vaga na sua rede:
                            </span>
                            <span className="text-[10px] text-neutral-500">Ajude outras pessoas a encontrarem esta vaga</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {/* WhatsApp Direct */}
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🔥 Vaga na Techify: *${job.title}*\n📍 Local: ${job.location}\n💼 Regime: ${job.type}${job.salary ? `\n💰 Salário: ${job.salary}` : ''}\n\nCandidate-se ou saiba mais no link oficial:\n${getJobShareUrl(job)}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#4ade80] text-xs font-semibold transition-all hover:scale-105"
                            >
                              <MessageCircle className="h-3.5 w-3.5 fill-current" />
                              <span>WhatsApp</span>
                            </a>

                            {/* LinkedIn Direct */}
                            <a
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getJobShareUrl(job))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 border border-[#0A66C2]/30 text-[#38bdf8] text-xs font-semibold transition-all hover:scale-105"
                            >
                              <Linkedin className="h-3.5 w-3.5 fill-current" />
                              <span>LinkedIn</span>
                            </a>

                            {/* Twitter / X */}
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vaga aberta na @techify: ${job.title} (${job.location}) 🚀 Candidate-se:`)}&url=${encodeURIComponent(getJobShareUrl(job))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-semibold transition-all hover:scale-105"
                            >
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              <span>X / Twitter</span>
                            </a>

                            {/* Telegram */}
                            <a
                              href={`https://t.me/share/url?url=${encodeURIComponent(getJobShareUrl(job))}&text=${encodeURIComponent(`🔥 Vaga aberta na Techify: ${job.title} (${job.location})`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-[#38bdf8] text-xs font-semibold transition-all hover:scale-105"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>Telegram</span>
                            </a>

                            {/* Copy Link Button */}
                            <button
                              type="button"
                              onClick={() => handleCopyJobLink(job)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer ml-auto"
                            >
                              {copiedJobId === job.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-[#a3e635]" />
                                  <span className="text-[#a3e635]">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 text-neutral-400" />
                                  <span>Copiar Link</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Apply Form nested inside */}
                        {isApplying && (
                          <div className="mt-4 p-5 rounded-2xl bg-[#0d0e0d] border border-neutral-800 shadow-xl">
                            {appliedSuccessfully ? (
                              <div className="text-center py-6 space-y-3">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30">
                                  <CheckCircle className="h-6 w-6" />
                                </div>
                                <p className="font-bold text-white text-base font-sans">Candidatura enviada com sucesso!</p>
                                <p className="text-neutral-400 text-xs max-w-sm mx-auto leading-relaxed">
                                  Agradecemos pelo interesse em fazer parte do time Techify. Analisaremos suas informações e entraremos em contato.
                                </p>
                              </div>
                            ) : (
                              <form onSubmit={(e) => handleApplySubmit(e, job.title)} className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-[#a3e635]" />
                                    <span>Candidatar-se para <span className="text-[#a3e635] font-extrabold">{job.title}</span></span>
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => setApplyingJobId(null)}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                                    title="Fechar formulário"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* 1. Dados Pessoais */}
                                <div className="space-y-3">
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Dados Pessoais</p>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Nome Completo */}
                                    <div>
                                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Nome Completo *</label>
                                      <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                        <input
                                          required
                                          type="text"
                                          placeholder="Seu nome completo"
                                          value={applyForm.name}
                                          onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                                          className="w-full rounded-xl border border-neutral-800 bg-[#050505] py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    {/* E-mail */}
                                    <div>
                                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">E-mail *</label>
                                      <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                        <input
                                          required
                                          type="email"
                                          placeholder="seu.email@exemplo.com"
                                          value={applyForm.email}
                                          onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                                          className="w-full rounded-xl border border-neutral-800 bg-[#050505] py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Telefone / WhatsApp * (Obrigatório) */}
                                    <div>
                                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Telefone / WhatsApp *</label>
                                      <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-[#a3e635]" />
                                        <input
                                          required
                                          type="tel"
                                          placeholder="(00) 90000-0000"
                                          value={applyForm.telefone}
                                          onChange={(e) => setApplyForm({ ...applyForm, telefone: e.target.value })}
                                          className="w-full rounded-xl border border-neutral-800 bg-[#050505] py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    {/* Data de Nascimento * (Escolher no calendário ou digitar) */}
                                    <div>
                                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Data de Nascimento *</label>
                                      <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
                                        <input
                                          required
                                          type="date"
                                          value={applyForm.dataNascimento}
                                          onChange={(e) => setApplyForm({ ...applyForm, dataNascimento: e.target.value })}
                                          className="w-full rounded-xl border border-neutral-800 bg-[#050505] py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none cursor-pointer [color-scheme:dark]"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Redes & Portfólio (Campos separados) */}
                                <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Redes & Portfólio</p>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* LinkedIn */}
                                    <div>
                                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">LinkedIn</label>
                                      <div className="relative">
                                        <Linkedin className="absolute left-3 top-3 h-4 w-4 text-[#0a66c2]" />
                                        <input
                                          type="text"
                                          placeholder="linkedin.com/in/seu-perfil"
                                          value={applyForm.linkedin}
                                          onChange={(e) => setApplyForm({ ...applyForm, linkedin: e.target.value })}
                                          className="w-full rounded-xl border border-neutral-800 bg-[#050505] py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    {/* Instagram */}
                                    <div>
                                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Instagram</label>
                                      <div className="relative">
                                        <Instagram className="absolute left-3 top-3 h-4 w-4 text-[#e1306c]" />
                                        <input
                                          type="text"
                                          placeholder="@seu.perfil"
                                          value={applyForm.instagram}
                                          onChange={(e) => setApplyForm({ ...applyForm, instagram: e.target.value })}
                                          className="w-full rounded-xl border border-neutral-800 bg-[#050505] py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    {/* Portfólio / Website */}
                                    <div>
                                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Portfólio / Site</label>
                                      <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-[#a3e635]" />
                                        <input
                                          type="text"
                                          placeholder="https://seuportfolio.com"
                                          value={applyForm.portfolio}
                                          onChange={(e) => setApplyForm({ ...applyForm, portfolio: e.target.value })}
                                          className="w-full rounded-xl border border-neutral-800 bg-[#050505] py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Anexar Currículo */}
                                <div className="space-y-2 pt-3 border-t border-neutral-800/80">
                                  <label className="block text-[11px] font-semibold text-neutral-300">Anexar Currículo (PDF, DOC, DOCX)</label>
                                  
                                  {!curriculoFile ? (
                                    <div className="relative border-2 border-dashed border-neutral-800 hover:border-[#a3e635]/70 bg-[#050505] hover:bg-[#090a09] transition-all rounded-xl p-4 text-center cursor-pointer group">
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      />
                                      <UploadCloud className="mx-auto h-6 w-6 text-neutral-500 group-hover:text-[#a3e635] transition-colors mb-1.5" />
                                      <p className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">
                                        Clique ou arraste seu arquivo aqui
                                      </p>
                                      <p className="text-[10px] text-neutral-500 mt-0.5">Suporta PDF, DOC, DOCX até 5MB</p>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between bg-[#080908] border border-[#a3e635]/40 rounded-xl p-3 text-xs">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <FileText className="h-5 w-5 text-[#a3e635] shrink-0" />
                                        <div className="min-w-0">
                                          <p className="font-bold text-white truncate text-xs">{curriculoFile.nomeArquivo}</p>
                                          <p className="text-[10px] text-neutral-400">{curriculoFile.tamanho}</p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setCurriculoFile(null)}
                                        className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                                        title="Remover arquivo"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                  {fileError && <p className="text-[11px] text-red-400 mt-1">{fileError}</p>}
                                </div>

                                {/* 4. Resumo de experiência */}
                                <div className="pt-3 border-t border-neutral-800/80">
                                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Resumo Profissional</label>
                                  <textarea
                                    rows={3}
                                    placeholder="Resuma sua trajetória, experiências recentes e motivações para esta vaga..."
                                    value={applyForm.experience}
                                    onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-[#050505] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none resize-none"
                                  />
                                </div>

                                {/* Bottom action buttons */}
                                <div className="flex gap-2.5 pt-2">
                                  <GlassButton
                                    type="button"
                                    onClick={() => setApplyingJobId(null)}
                                    variant="dark"
                                    size="sm"
                                    className="flex-1 py-2.5 text-xs font-bold text-neutral-400 hover:text-white rounded-xl"
                                  >
                                    Cancelar
                                  </GlassButton>
                                  <GlassButton
                                    type="submit"
                                    variant="lime"
                                    size="sm"
                                    className="flex-1 rounded-xl py-2.5 text-xs font-extrabold"
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Enviar Candidatura</span>
                                  </GlassButton>
                                </div>
                              </form>
                            )}
                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick info notes */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-neutral-500 max-w-xl mx-auto text-center">
          <AlertCircle className="h-4 w-4 text-[#a3e635] shrink-0" />
          <span>Vagas de estágio e novos cargos abrem periodicamente. Cadastre-se ou envie seu portfólio.</span>
        </div>

      </div>

      {/* MODAL "PUBLICAR NOVA VAGA" - EXACT MATCH TO SCREENSHOTS 2, 3 & 4 */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
                <h2 className="text-xl font-bold text-white font-sans">
                  {editingJobId ? 'Editar Vaga' : 'Publicar Nova Vaga'}
                </h2>
                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handlePublishJob} className="mt-4 space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                
                {/* 1. Título da Vaga */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Título da Vaga</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Designer Gráfico Sênior"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                {/* 2. Departamento & Tipo Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Departamento</label>
                    <select
                      value={newJobForm.category}
                      onChange={(e) => setNewJobForm({ ...newJobForm, category: e.target.value })}
                      className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none cursor-pointer"
                    >
                      <option value="Design">Design</option>
                      <option value="Desenvolvimento">Desenvolvimento</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Vendas">Vendas</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Tipo</label>
                    <select
                      value={newJobForm.type}
                      onChange={(e) => setNewJobForm({ ...newJobForm, type: e.target.value })}
                      className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none cursor-pointer"
                    >
                      <option value="Tempo Integral">Tempo Integral</option>
                      <option value="Meio Período">Meio Período</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Estágio">Estágio</option>
                    </select>
                  </div>
                </div>

                {/* 3. Localização */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Localização</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Remoto, São Paulo - SP"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                {/* 4. Descrição */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Descrição</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Descreva as responsabilidades da vaga..."
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none resize-none"
                  />
                </div>

                {/* 5. Requisitos with + button */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Requisitos</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite um requisito"
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRequirement();
                        }
                      }}
                      className="flex-1 rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black p-2.5 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* List of requirements tags */}
                  {requirementsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {requirementsList.map((req, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 px-2.5 py-1 rounded-lg">
                          <span>{req}</span>
                          <button type="button" onClick={() => handleRemoveRequirement(idx)} className="text-neutral-500 hover:text-red-400">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Benefícios with + button */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Benefícios</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite um benefício"
                      value={benInput}
                      onChange={(e) => setBenInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBenefit();
                        }
                      }}
                      className="flex-1 rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black p-2.5 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* List of benefits tags */}
                  {benefitsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {benefitsList.map((ben, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 px-2.5 py-1 rounded-lg">
                          <span>{ben}</span>
                          <button type="button" onClick={() => handleRemoveBenefit(idx)} className="text-neutral-500 hover:text-red-400">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. Faixa Salarial (opcional) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Faixa Salarial (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 5.000 - R$ 8.000"
                    value={newJobForm.salary}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salary: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                {/* Bottom Action Buttons matching screenshot */}
                <div className="pt-4 border-t border-neutral-800/80 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="flex-1 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold py-3 text-xs transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingJob}
                    className="flex-1 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-3 text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingJob 
                      ? (editingJobId ? 'Salvando...' : 'Publicando...') 
                      : (editingJobId ? 'Salvar Alterações' : 'Publicar Vaga')
                    }
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL COMPARTILHAR VAGA NAS REDES SOCIAIS */}
      <AnimatePresence>
        {sharingJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSharingJobModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#0f100f] p-6 shadow-2xl z-10 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Compartilhar Vaga</h3>
                    <p className="text-xs text-neutral-400">Divulgue esta oportunidade na sua rede</p>
                  </div>
                </div>
                <button
                  onClick={() => setSharingJobModal(null)}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Vaga Preview */}
              <div className="rounded-xl border border-neutral-800 bg-[#070807] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#14532d]/80 text-[#4ade80] border border-[#22c55e]/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    {sharingJobModal.type}
                  </span>
                  <span className="bg-neutral-800 text-neutral-300 text-[10px] font-medium px-2 py-0.5 rounded">
                    {sharingJobModal.category}
                  </span>
                  {sharingJobModal.salary && (
                    <span className="text-[#a3e635] text-[10px] font-bold">
                      {sharingJobModal.salary}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white text-base">{sharingJobModal.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{sharingJobModal.location}</span>
                </div>
              </div>

              {/* Redes Sociais Grid */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-neutral-300">Escolha onde deseja compartilhar:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🔥 Vaga na Techify: *${sharingJobModal.title}*\n📍 Local: ${sharingJobModal.location}\n💼 Regime: ${sharingJobModal.type}${sharingJobModal.salary ? `\n💰 Salário: ${sharingJobModal.salary}` : ''}\n\nCandidate-se ou saiba mais no link oficial:\n${getJobShareUrl(sharingJobModal)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#4ade80] transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5 fill-current" />
                    <span className="text-xs font-bold">WhatsApp</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getJobShareUrl(sharingJobModal))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#38bdf8] transition-all hover:scale-[1.02]"
                  >
                    <Linkedin className="h-5 w-5 fill-current" />
                    <span className="text-xs font-bold">LinkedIn</span>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vaga aberta na @techify: ${sharingJobModal.title} (${sharingJobModal.location}) 🚀 Candidate-se:`)}&url=${encodeURIComponent(getJobShareUrl(sharingJobModal))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white transition-all hover:scale-[1.02]"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-xs font-bold">X / Twitter</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(getJobShareUrl(sharingJobModal))}&text=${encodeURIComponent(`🔥 Vaga aberta na Techify: ${sharingJobModal.title} (${sharingJobModal.location})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#38bdf8] transition-all hover:scale-[1.02]"
                  >
                    <Send className="h-5 w-5" />
                    <span className="text-xs font-bold">Telegram</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getJobShareUrl(sharingJobModal))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#60a5fa] transition-all hover:scale-[1.02]"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-xs font-bold">Facebook</span>
                  </a>

                  {/* Native Web Share */}
                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: `Vaga Techify: ${sharingJobModal.title}`,
                            text: `Confira a vaga de ${sharingJobModal.title} na Techify!`,
                            url: getJobShareUrl(sharingJobModal),
                          });
                        } catch (err) {
                          // user cancelled or share failed
                        }
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#a3e635]/10 hover:bg-[#a3e635]/20 border border-[#a3e635]/30 text-[#a3e635] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span className="text-xs font-bold">Mais Opções</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Link direto para copiar */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <label className="block text-xs font-semibold text-neutral-300">Link direto da vaga:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://www.techify.sbs/?tab=carreiras#vaga-${sharingJobModal.id || ''}`}
                    className="flex-1 rounded-xl border border-neutral-800 bg-[#070807] py-2.5 px-3 text-xs text-neutral-300 focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyJobLink(sharingJobModal)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.3)] shrink-0"
                  >
                    {copiedJobId === sharingJobModal.id ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 stroke-[2.5]" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Fechar botão */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSharingJobModal(null)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
