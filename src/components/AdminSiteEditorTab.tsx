import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Sparkles, 
  Upload, 
  Trash2, 
  Plus, 
  Edit, 
  Check, 
  Save, 
  Globe, 
  MessageSquare, 
  Info, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Linkedin, 
  Instagram, 
  Phone, 
  Mail, 
  MapPin, 
  RotateCcw,
  CheckCircle2,
  X,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { 
  TeamMember, 
  SiteGeneralContent,
  FeedbackImage,
  DEFAULT_TEAM_MEMBERS, 
  DEFAULT_SITE_CONTENT,
  DEFAULT_FEEDBACKS,
  getCachedTeamMembers,
  getCachedGeneralContent,
  getCachedFeedbacks,
  saveTeamMembersToFirestore,
  saveGeneralContentToFirestore,
  saveFeedbacksToFirestore
} from '../lib/siteContent';
import {
  HomePageContent,
  getCachedHomePageContent,
  initHomePageListener,
  saveHomePageContentToFirestore,
  HomeHeroData
} from '../lib/homeContent';
import HeroBackgroundModal from './HeroBackgroundModal';
import LogoCustomizerModal from './LogoCustomizerModal';
import { CircleEmblemDivider, TechifyIcon } from './TechifyLogo';
import heroBgOriginalLogo from '../assets/images/techify_logo_original_1786362412096.jpg';
import { compressImageFile } from '../lib/imageUtils';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from './Toast';

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
];

export default function AdminSiteEditorTab() {
  const [subTab, setSubTab] = useState<'feedbacks' | 'team' | 'hero' | 'about' | 'contact' | 'logo'>('feedbacks');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(getCachedTeamMembers);
  const [generalContent, setGeneralContent] = useState<SiteGeneralContent>(getCachedGeneralContent);
  const [feedbacks, setFeedbacks] = useState<FeedbackImage[]>(getCachedFeedbacks);
  const [homeContent, setHomeContent] = useState<HomePageContent>(getCachedHomePageContent);
  const [isHeroBgModalOpen, setIsHeroBgModalOpen] = useState(false);
  const [isLogoCustomizerOpen, setIsLogoCustomizerOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation Modals State
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const [isRestoreDefaultTeamModalOpen, setIsRestoreDefaultTeamModalOpen] = useState(false);

  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [feedbackImageUrl, setFeedbackImageUrl] = useState('');
  const [feedbackClientName, setFeedbackClientName] = useState('');
  const [feedbackProjectName, setFeedbackProjectName] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackDate, setFeedbackDate] = useState('');
  const [isUploadingFeedbackImage, setIsUploadingFeedbackImage] = useState(false);
  const feedbackFileInputRef = useRef<HTMLInputElement>(null);

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberDescription, setMemberDescription] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('');
  const [memberLinkedin, setMemberLinkedin] = useState('');
  const [memberInstagram, setMemberInstagram] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick photo upload ref for cards directly
  const [quickTargetMemberId, setQuickTargetMemberId] = useState<string | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // Sync from Firestore real-time
  useEffect(() => {
    const unsubTeam = onSnapshot(doc(db, "site_content", "team"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.members)) {
          setTeamMembers(data.members);
        }
      }
    }, (err) => console.warn('Firestore team offline:', err.message));

    const unsubFeedbacks = onSnapshot(doc(db, "site_content", "feedbacks"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.feedbacks)) {
          setFeedbacks(data.feedbacks);
        }
      }
    }, (err) => console.warn('Firestore feedbacks offline:', err.message));

    const unsubGeneral = onSnapshot(doc(db, "site_content", "general"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteGeneralContent>;
        setGeneralContent(prev => ({ ...prev, ...data }));
      }
    }, (err) => console.warn('Firestore content offline:', err.message));

    const unsubHome = initHomePageListener((data) => {
      setHomeContent(data);
    });

    return () => {
      unsubTeam();
      unsubFeedbacks();
      unsubGeneral();
      unsubHome();
    };
  }, []);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Open feedback modal
  const handleOpenFeedbackModal = (fb?: FeedbackImage) => {
    if (fb) {
      setEditingFeedbackId(fb.id);
      setFeedbackImageUrl(fb.imageUrl);
      setFeedbackClientName(fb.clientName || '');
      setFeedbackProjectName(fb.projectName || '');
      setFeedbackComment(fb.comment || '');
      setFeedbackRating(fb.rating || 5);
      setFeedbackDate(fb.date || '');
    } else {
      setEditingFeedbackId(null);
      setFeedbackImageUrl('');
      setFeedbackClientName('');
      setFeedbackProjectName('');
      setFeedbackComment('');
      setFeedbackRating(5);
      setFeedbackDate(new Date().toLocaleDateString('pt-BR'));
    }
    setIsFeedbackModalOpen(true);
  };

  // Upload feedback image from device
  const handleFeedbackImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFeedbackImage(true);
    try {
      const base64 = await compressImageFile(file, 1200, 1200, 0.88);
      setFeedbackImageUrl(base64);
      toast.success("Print Carregado", "Imagem pronta para salvar.");
    } catch (err) {
      console.error('Error compressing feedback image:', err);
      toast.error("Erro no Upload", "Não foi possível carregar a imagem.");
    } finally {
      setIsUploadingFeedbackImage(false);
    }
  };

  // Save feedback
  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackImageUrl.trim()) {
      toast.warning("Imagem Obrigatória", "Por favor selecione ou insira a URL da imagem/print.");
      return;
    }

    setIsSaving(true);
    try {
      let updated: FeedbackImage[];
      if (editingFeedbackId) {
        updated = feedbacks.map(item => 
          item.id === editingFeedbackId 
            ? {
                ...item,
                imageUrl: feedbackImageUrl.trim(),
                clientName: feedbackClientName.trim(),
                projectName: feedbackProjectName.trim(),
                comment: feedbackComment.trim(),
                rating: feedbackRating,
                date: feedbackDate.trim()
              }
            : item
        );
        toast.success("Print Atualizado", "As alterações no feedback foram salvas.");
      } else {
        const newFeedback: FeedbackImage = {
          id: 'fb-' + Date.now(),
          imageUrl: feedbackImageUrl.trim(),
          clientName: feedbackClientName.trim() || 'Cliente Satisfeito',
          projectName: feedbackProjectName.trim(),
          comment: feedbackComment.trim(),
          rating: feedbackRating,
          date: feedbackDate.trim() || new Date().toLocaleDateString('pt-BR'),
          createdAt: new Date().toISOString()
        };
        updated = [newFeedback, ...feedbacks];
        toast.success("Novo Print Publicado", "O feedback real foi publicado no site com sucesso.");
      }

      setFeedbacks(updated);
      await saveFeedbacksToFirestore(updated);
      setIsFeedbackModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao Salvar", "Não foi possível salvar o feedback.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete feedback trigger & execution
  const handleDeleteFeedback = (id: string) => {
    setFeedbackToDelete(id);
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    try {
      const updated = feedbacks.filter(fb => fb.id !== feedbackToDelete);
      setFeedbacks(updated);
      await saveFeedbacksToFirestore(updated);
      toast.info("Feedback Removido", "O print foi removido com sucesso.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao Excluir", "Não foi possível remover o print.");
    } finally {
      setFeedbackToDelete(null);
    }
  };

  // Open member modal for edit or new
  const handleOpenMemberModal = (member?: TeamMember) => {
    if (member) {
      setEditingMemberId(member.id);
      setMemberName(member.name);
      setMemberRole(member.role);
      setMemberDescription(member.description);
      setMemberAvatar(member.avatar);
      setMemberLinkedin(member.linkedin || '');
      setMemberInstagram(member.instagram || '');
    } else {
      setEditingMemberId(null);
      setMemberName('');
      setMemberRole('');
      setMemberDescription('');
      setMemberAvatar(PRESET_AVATARS[0]);
      setMemberLinkedin('https://linkedin.com');
      setMemberInstagram('');
    }
    setIsMemberModalOpen(true);
  };

  // Upload image from file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const base64 = await compressImageFile(file, 600, 600, 0.85);
      setMemberAvatar(base64);
    } catch (err) {
      console.error('Error compressing avatar:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Quick photo upload directly from card
  const handleQuickCardPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickTargetMemberId) return;

    try {
      const base64 = await compressImageFile(file, 600, 600, 0.85);
      const updated = teamMembers.map(m => m.id === quickTargetMemberId ? { ...m, avatar: base64 } : m);
      setTeamMembers(updated);
      await saveTeamMembersToFirestore(updated);
      toast.success("Foto Atualizada", "A nova foto do membro foi salva e publicada.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao Salvar", "Não foi possível atualizar a foto.");
    } finally {
      setQuickTargetMemberId(null);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  // Save member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) {
      toast.warning("Campos Obrigatórios", "Preencha o nome e o cargo do colaborador.");
      return;
    }

    setIsSaving(true);
    try {
      let updated: TeamMember[];
      if (editingMemberId) {
        updated = teamMembers.map(m => m.id === editingMemberId ? {
          ...m,
          name: memberName.trim(),
          role: memberRole.trim(),
          description: memberDescription.trim() || 'Profissional especialista da Techify.',
          avatar: memberAvatar.trim() || PRESET_AVATARS[0],
          linkedin: memberLinkedin.trim(),
          instagram: memberInstagram.trim()
        } : m);
        toast.success("Membro Atualizado", `Os dados de "${memberName}" foram atualizados com sucesso.`);
      } else {
        const newMember: TeamMember = {
          id: `member-${Date.now()}`,
          name: memberName.trim(),
          role: memberRole.trim(),
          description: memberDescription.trim() || 'Profissional especialista da Techify.',
          avatar: memberAvatar.trim() || PRESET_AVATARS[0],
          linkedin: memberLinkedin.trim(),
          instagram: memberInstagram.trim()
        };
        updated = [...teamMembers, newMember];
        toast.success("Novo Membro Adicionado", `"${memberName}" agora faz parte da equipe no site.`);
      }

      setTeamMembers(updated);
      await saveTeamMembersToFirestore(updated);
      setIsMemberModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao Salvar", "Ocorreu um erro ao salvar o membro.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete member trigger & execution
  const handleDeleteMember = (id: string, name: string) => {
    setMemberToDelete({ id, name });
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    const { id, name } = memberToDelete;
    try {
      const updated = teamMembers.filter(m => m.id !== id);
      setTeamMembers(updated);
      await saveTeamMembersToFirestore(updated);
      toast.info("Membro Removido", `"${name}" foi excluído da lista de equipe.`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao Excluir", "Não foi possível remover o membro.");
    } finally {
      setMemberToDelete(null);
    }
  };

  // Restore default team trigger & execution
  const handleRestoreDefaultTeam = () => {
    setIsRestoreDefaultTeamModalOpen(true);
  };

  const confirmRestoreDefaultTeam = async () => {
    try {
      setTeamMembers(DEFAULT_TEAM_MEMBERS);
      await saveTeamMembersToFirestore(DEFAULT_TEAM_MEMBERS);
      toast.info("Equipe Restaurada", "A formação padrão da equipe foi recarregada.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao Restaurar", "Não foi possível restaurar a equipe padrão.");
    } finally {
      setIsRestoreDefaultTeamModalOpen(false);
    }
  };

  // Save general texts (Hero, About, Contact)
  const handleSaveGeneralContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveGeneralContentToFirestore(generalContent);
      toast.success("Textos Salvos", "O conteúdo do site foi sincronizado em tempo real.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao Salvar", "Não foi possível gravar as alterações de texto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Hidden Quick File Input */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleQuickCardPhotoUpload}
      />

      {/* Header Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-[#121412] via-[#0d120d] to-[#121412] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" /> CMS Visual do Site
            </span>
          </div>
          <h2 className="font-display text-2xl font-black text-white">
            Editor Completo do Site
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
            Altere fotos de membros da equipe, títulos, textos, links e contatos. Todas as mudanças refletem imediatamente no site público.
          </p>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-xs font-bold text-emerald-400 animate-pulse">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800/80 pb-3">
        <button
          onClick={() => setSubTab('feedbacks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'feedbacks'
              ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Feedbacks & Prints Reais ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setSubTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'team'
              ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Equipe & Sócios ({teamMembers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'hero'
              ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Hero & Cabeçalho</span>
        </button>

        <button
          onClick={() => setSubTab('about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'about'
              ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Sobre Nós & Manifesto</span>
        </button>

        <button
          onClick={() => setSubTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'contact'
              ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Phone className="h-4 w-4" />
          <span>Contatos & Redes Sociais</span>
        </button>

        <button
          onClick={() => setSubTab('logo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'logo'
              ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Logo & Emblema Circular</span>
        </button>
      </div>

      {/* 0. FEEDBACKS & PRINTS REAIS TAB */}
      {subTab === 'feedbacks' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#a3e635]" />
                Prints de Feedbacks & Avaliações Reais
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Faça upload de prints reais do WhatsApp, avaliações do Google ou fotos de feedback enviadas pelos clientes para exibir no site.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleOpenFeedbackModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Print de Feedback</span>
              </button>
            </div>
          </div>

          {feedbacks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#0d100d] p-12 text-center flex flex-col items-center justify-center">
              <div className="h-14 w-14 rounded-2xl bg-[#a3e635]/10 border border-[#a3e635]/20 flex items-center justify-center text-[#a3e635] mb-4">
                <ImageIcon className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Nenhum print de feedback cadastrado
              </h4>
              <p className="text-xs text-neutral-400 max-w-md mb-5">
                Suba capturas de tela reais de clientes satisfeitos no WhatsApp ou Google para gerar credibilidade instantânea.
              </p>
              <button
                onClick={() => handleOpenFeedbackModal()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.25)]"
              >
                <Upload className="h-4 w-4" />
                <span>Subir Primeiro Print Real</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="rounded-2xl border border-neutral-800 bg-[#0c0e0c] hover:border-neutral-700 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden border-b border-neutral-800">
                    <img
                      src={fb.imageUrl}
                      alt={fb.clientName || 'Feedback'}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-700 text-[11px] font-bold text-[#a3e635]">
                      <Check className="h-3 w-3" />
                      <span>Autêntico</span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-[#facc15]">
                          {[...Array(fb.rating || 5)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        {fb.date && (
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {fb.date}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white">
                        {fb.clientName || 'Cliente'}
                      </h4>
                      {fb.projectName && (
                        <p className="text-[11px] text-[#a3e635] mt-0.5">
                          {fb.projectName}
                        </p>
                      )}

                      {fb.comment && (
                        <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2 italic">
                          "{fb.comment}"
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenFeedbackModal(fb)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 bg-neutral-800 text-[11px] font-bold text-neutral-200 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 text-[11px] font-bold transition-colors cursor-pointer"
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
        </div>
      )}

      {/* 1. TEAM TAB */}
      {subTab === 'team' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-[#a3e635]" />
                Membros da Equipe & Liderança
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Clique em <b>"Trocar Foto"</b> em qualquer card para subir a foto direto do seu dispositivo, ou clique em <b>"Editar"</b> para mudar nome, cargo e bio.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRestoreDefaultTeam}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/80 text-neutral-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title="Restaurar padrão"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restaurar Padrão</span>
              </button>

              <button
                onClick={() => handleOpenMemberModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Membro</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id || index}
                className="group relative rounded-2xl border border-neutral-800 bg-[#0d0f0d] p-5 flex flex-col justify-between hover:border-[#a3e635]/50 transition-all shadow-lg"
              >
                <div>
                  {/* Avatar + Quick Actions */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative h-16 w-16 rounded-2xl bg-neutral-900 border border-neutral-700 overflow-hidden shadow-md shrink-0">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => {
                          setQuickTargetMemberId(member.id);
                          quickFileInputRef.current?.click();
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer flex-col gap-0.5 backdrop-blur-[2px]"
                        title="Trocar Foto"
                      >
                        <Camera className="h-4 w-4 text-[#a3e635]" />
                        <span>Mudar</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenMemberModal(member)}
                        className="h-8 w-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Editar Dados"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="h-8 w-8 rounded-xl bg-neutral-900 hover:bg-red-500/20 border border-neutral-800 hover:border-red-500/30 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setQuickTargetMemberId(member.id);
                      quickFileInputRef.current?.click();
                    }}
                    className="w-full mb-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-[#a3e635]/10 border border-neutral-800 hover:border-[#a3e635]/30 text-[#a3e635] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload de Foto Manual</span>
                  </button>

                  <h4 className="font-display text-base font-bold text-white">
                    {member.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#a3e635] mt-0.5">
                    {member.role}
                  </p>

                  <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed line-clamp-3">
                    {member.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>Posição #{index + 1}</span>
                  {member.linkedin && (
                    <span className="text-neutral-400 hover:text-white flex items-center gap-1">
                      <Linkedin className="h-3 w-3" /> Conectado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. HERO TAB */}
      {subTab === 'hero' && (
        <div className="space-y-6">
          {/* HERO BACKGROUND MANAGEMENT CARD */}
          <div className="rounded-2xl border border-neutral-800 bg-[#0d0f0d] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mb-5">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#a3e635]" /> Imagem & Vídeo de Fundo da Seção Hero
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Troque a imagem de fundo pelo seu próprio arquivo, cole um link ou escolha um preset oficial
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHeroBgModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a3e635] to-[#84cc16] hover:brightness-110 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Trocar Imagem de Fundo</span>
              </button>
            </div>

            {/* Current Background Status Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/60 rounded-xl p-4 border border-neutral-800/80">
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-neutral-700 bg-black">
                {homeContent.hero.backgroundType === 'video' && homeContent.hero.videoUrl ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{
                      filter: `brightness(${homeContent.hero.backgroundBrightness ?? 75}%) blur(${homeContent.hero.backgroundBlur ?? 0}px)`
                    }}
                  >
                    <source src={homeContent.hero.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={homeContent.hero.backgroundImageUrl || heroBgOriginalLogo}
                    alt="Fundo Atual"
                    className="w-full h-full object-cover object-center"
                    style={{
                      filter: `brightness(${homeContent.hero.backgroundBrightness ?? 75}%) blur(${homeContent.hero.backgroundBlur ?? 0}px)`
                    }}
                  />
                )}
                <div 
                  className="absolute inset-0 bg-black pointer-events-none"
                  style={{ opacity: (homeContent.hero.backgroundOpacity ?? 65) / 100 }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white border border-white/10 backdrop-blur-sm">
                  {homeContent.hero.backgroundType === 'video' ? 'Vídeo Ativo' : homeContent.hero.backgroundImageUrl ? 'Imagem Personalizada' : 'Logo 3D Oficial'}
                </span>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                    Brilho: <strong className="text-white">{homeContent.hero.backgroundBrightness ?? 75}%</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                    Escurecimento: <strong className="text-white">{homeContent.hero.backgroundOpacity ?? 65}%</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                    Desfoque: <strong className="text-white">{homeContent.hero.backgroundBlur ?? 0}px</strong>
                  </span>
                  {homeContent.hero.showGridEffect && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-bold">
                      Grade Holográfica Ativa
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  Clique no botão acima para carregar uma imagem direto do seu computador ou celular, ou para colar um link da web.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveGeneralContent} className="rounded-2xl border border-neutral-800 bg-[#0d0f0d] p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#a3e635]" /> Textos da Seção Hero (Página Inicial)
              </h3>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">Selo / Badge Superior</label>
                <input
                  type="text"
                  value={generalContent.heroBadge}
                  onChange={(e) => setGeneralContent(prev => ({ ...prev, heroBadge: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">Título Linha 1</label>
                <input
                  type="text"
                  value={generalContent.heroHeadline1}
                  onChange={(e) => setGeneralContent(prev => ({ ...prev, heroHeadline1: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">Título Linha 2 (Destaque)</label>
                <input
                  type="text"
                  value={generalContent.heroHeadline2}
                  onChange={(e) => setGeneralContent(prev => ({ ...prev, heroHeadline2: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">Botão Principal (CTA)</label>
                <input
                  type="text"
                  value={generalContent.heroCtaPrimary}
                  onChange={(e) => setGeneralContent(prev => ({ ...prev, heroCtaPrimary: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">Descrição Principal</label>
                <textarea
                  rows={3}
                  value={generalContent.heroDescription}
                  onChange={(e) => setGeneralContent(prev => ({ ...prev, heroDescription: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. ABOUT TAB */}
      {subTab === 'about' && (
        <form onSubmit={handleSaveGeneralContent} className="rounded-2xl border border-neutral-800 bg-[#0d0f0d] p-6 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-[#a3e635]" /> Textos da Seção Sobre Nós & Manifesto
            </h3>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Selo / Badge</label>
              <input
                type="text"
                value={generalContent.aboutBadge}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, aboutBadge: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Título do Manifesto</label>
              <input
                type="text"
                value={generalContent.aboutTitle}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, aboutTitle: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Descrição do Manifesto</label>
              <textarea
                rows={3}
                value={generalContent.aboutDescription}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, aboutDescription: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Banner Final - Título</label>
              <input
                type="text"
                value={generalContent.aboutBannerTitle}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, aboutBannerTitle: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Banner Final - Subtítulo</label>
              <input
                type="text"
                value={generalContent.aboutBannerSubtitle}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, aboutBannerSubtitle: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* 4. CONTACT TAB */}
      {subTab === 'contact' && (
        <form onSubmit={handleSaveGeneralContent} className="rounded-2xl border border-neutral-800 bg-[#0d0f0d] p-6 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#a3e635]" /> Contatos Oficiais & Rodapé
            </h3>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">E-mail Oficial</label>
              <input
                type="email"
                value={generalContent.email}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">WhatsApp Oficial</label>
              <input
                type="text"
                value={generalContent.whatsapp}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Instagram Oficial</label>
              <input
                type="text"
                value={generalContent.instagram}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, instagram: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">LinkedIn Oficial</label>
              <input
                type="text"
                value={generalContent.linkedin}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, linkedin: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">Texto de Copyright / Rodapé</label>
              <input
                type="text"
                value={generalContent.copyright}
                onChange={(e) => setGeneralContent(prev => ({ ...prev, copyright: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* 5. LOGO & EMBLEMA CIRCULAR TAB */}
      {subTab === 'logo' && (
        <div className="rounded-2xl border border-neutral-800 bg-[#0d0f0d] p-6 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#a3e635]" /> Identidade Visual: Logo & Emblema Circular
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Insira sua imagem manualmente, ajuste zoom, posição (X/Y), rotação, ponto central e linhas de divisão em tempo real.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoCustomizerOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(163,230,53,0.35)] cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Abrir Ajustador de Imagem</span>
            </button>
          </div>

          {/* Interactive Preview Showcase Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-black/40 border border-neutral-800/80 rounded-2xl p-6">
            <div className="flex flex-col items-center justify-center p-6 bg-[#070907] border border-neutral-800 rounded-xl relative overflow-hidden">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-4">
                Visualização do Emblema Circular & Linhas
              </span>
              <CircleEmblemDivider size={60} onOpenCustomizer={() => setIsLogoCustomizerOpen(true)} />
              <p className="text-[11px] text-neutral-400 mt-4 text-center">
                Clique no botão acima ou no emblema para ajustar imagem, escala, posição ou linhas
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Recursos do Editor de Emblema:</h4>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#a3e635] shrink-0 mt-0.5" />
                  <span><strong>Upload Manual</strong>: Carregue qualquer imagem do computador ou cole um link direto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#a3e635] shrink-0 mt-0.5" />
                  <span><strong>Ajustes Precisos</strong>: Controle de Zoom (20% a 350%), Posição X/Y com arraste de mouse e Rotação.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#a3e635] shrink-0 mt-0.5" />
                  <span><strong>Emblema Minimalista</strong>: Ative ou desative o anel externo, ponto central e linhas horizontais.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#a3e635] shrink-0 mt-0.5" />
                  <span><strong>Sincronização Automática</strong>: As alterações são propagadas instantaneamente no Header, Footer e Loading.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER EDIT / CREATE MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#121412] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-display text-lg font-bold text-white">
                {editingMemberId ? 'Editar Membro da Equipe' : 'Adicionar Novo Membro'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="mt-4 flex flex-col gap-4">
              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-2">Foto do Membro</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-2xl bg-neutral-900 border-2 border-[#a3e635]/40 overflow-hidden shadow-md shrink-0">
                    <img 
                      src={memberAvatar || PRESET_AVATARS[0]} 
                      alt="Avatar" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{isUploadingPhoto ? 'Compactando...' : 'Selecionar do Computador'}</span>
                    </button>

                    <input
                      type="url"
                      placeholder="Ou cole a URL da imagem..."
                      value={memberAvatar}
                      onChange={(e) => setMemberAvatar(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preset Avatars quick select */}
                <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] text-neutral-500 font-semibold whitespace-nowrap">Sugestões:</span>
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMemberAvatar(url)}
                      className={`h-7 w-7 rounded-full overflow-hidden border transition-transform shrink-0 ${
                        memberAvatar === url ? 'border-[#a3e635] scale-110' : 'border-neutral-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="Preset" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcos Henrique"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Cargo / Especialidade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CEO (Diretor Executivo)"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Biografia Resumida</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Liderança executiva, visão estratégica e expansão de produtos digitais de alto impacto."
                  value={memberDescription}
                  onChange={(e) => setMemberDescription(e.target.value)}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">LinkedIn (URL)</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={memberLinkedin}
                    onChange={(e) => setMemberLinkedin(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    placeholder="@usuario"
                    value={memberInstagram}
                    onChange={(e) => setMemberInstagram(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK IMAGE MODAL */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#0d100d] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#a3e635]" />
                {editingFeedbackId ? 'Editar Print de Feedback' : 'Cadastrar Novo Print de Feedback'}
              </h3>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="h-7 w-7 rounded-lg border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedback} className="flex flex-col gap-4">
              {/* Image Preview & Upload */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">Imagem / Print da Conversa *</label>
                
                {feedbackImageUrl ? (
                  <div className="relative w-full aspect-[4/3] rounded-xl border border-neutral-800 overflow-hidden bg-neutral-900 mb-2">
                    <img
                      src={feedbackImageUrl}
                      alt="Feedback Preview"
                      className="w-full h-full object-cover object-top"
                    />
                    <button
                      type="button"
                      onClick={() => setFeedbackImageUrl('')}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-[11px] font-bold backdrop-blur-sm cursor-pointer"
                    >
                      Trocar Imagem
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      ref={feedbackFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFeedbackImageUpload}
                    />

                    <div
                      onClick={() => feedbackFileInputRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-neutral-800 hover:border-[#a3e635]/60 bg-neutral-900/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <Upload className="h-7 w-7 text-[#a3e635] mb-2" />
                      <span className="text-xs font-bold text-white">
                        {isUploadingFeedbackImage ? 'Comprimindo imagem...' : 'Clique para selecionar print do dispositivo'}
                      </span>
                      <span className="text-[11px] text-neutral-500 mt-0.5">
                        PNG, JPG, WebP (otimização automática)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-px bg-neutral-800 flex-1" />
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">ou use URL direta</span>
                      <div className="h-px bg-neutral-800 flex-1" />
                    </div>

                    <input
                      type="url"
                      placeholder="https://exemplo.com/print-whatsapp.jpg"
                      value={feedbackImageUrl}
                      onChange={(e) => setFeedbackImageUrl(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Client & Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Nome do Cliente / Empresa</label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Mariana Costa"
                    value={feedbackClientName}
                    onChange={(e) => setFeedbackClientName(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Tipo de Serviço / Projeto</label>
                  <input
                    type="text"
                    placeholder="Ex: Landing Page + Tráfego Pago"
                    value={feedbackProjectName}
                    onChange={(e) => setFeedbackProjectName(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
              </div>

              {/* Comment / Snippet */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Comentário / Trecho do Print</label>
                <textarea
                  rows={2}
                  placeholder="Ex: O site ficou perfeito e já fechamos 4 clientes na primeira semana de anúncios!"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              {/* Rating & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Avaliação</label>
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  >
                    <option value={5}>★★★★★ (5 Estrelas)</option>
                    <option value={4}>★★★★☆ (4 Estrelas)</option>
                    <option value={3}>★★★☆☆ (3 Estrelas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Data / Período</label>
                  <input
                    type="text"
                    placeholder="Ex: Março/2025"
                    value={feedbackDate}
                    onChange={(e) => setFeedbackDate(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploadingFeedbackImage}
                  className="px-5 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Publicando...' : 'Salvar e Publicar Print'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MEMBER MODAL */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0d100d] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">Excluir Membro da Equipe</h3>
                <p className="text-xs text-neutral-400">Esta ação atualizará o site imediatamente.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-6 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 leading-relaxed">
              Tem certeza que deseja remover <strong className="text-white">"{memberToDelete.name}"</strong> da equipe? O card deste membro deixará de aparecer no site.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer"
              >
                Sim, Excluir Membro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESTORE TEAM MODAL */}
      {isRestoreDefaultTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0d100d] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/20 text-[#a3e635] flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">Restaurar Equipe Padrão</h3>
                <p className="text-xs text-neutral-400">Recarregar os 4 membros originais</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-6 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 leading-relaxed">
              Deseja restaurar a formação padrão da equipe (Marcos Henrique, Vitória Ellen, Gabriel Rocha e Lucas Ferreira)? As fotos e descrições personalizadas serão substituídas.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRestoreDefaultTeamModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRestoreDefaultTeam}
                className="px-4 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
              >
                Confirmar e Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE FEEDBACK MODAL */}
      {feedbackToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0d100d] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">Remover Print de Feedback</h3>
                <p className="text-xs text-neutral-400">Esta ação removerá o print do site.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-6 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 leading-relaxed">
              Tem certeza que deseja excluir este print de feedback do cliente do site?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setFeedbackToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteFeedback}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer"
              >
                Sim, Remover Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO BACKGROUND MODAL */}
      <HeroBackgroundModal
        isOpen={isHeroBgModalOpen}
        onClose={() => setIsHeroBgModalOpen(false)}
        heroData={homeContent.hero}
        onSaveBackground={async (updatedBg: Partial<HomeHeroData>) => {
          const updatedHero = {
            ...homeContent.hero,
            ...updatedBg
          };
          const newContent = {
            ...homeContent,
            hero: updatedHero
          };
          setHomeContent(newContent);
          await saveHomePageContentToFirestore(newContent);
        }}
      />

      {/* LOGO & EMBLEM CUSTOMIZER MODAL */}
      <LogoCustomizerModal
        isOpen={isLogoCustomizerOpen}
        onClose={() => setIsLogoCustomizerOpen(false)}
      />
    </div>
  );
}
