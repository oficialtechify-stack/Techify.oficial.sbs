import React, { useState, useEffect } from 'react';
import { 
  Shield, Calendar, Clock, Briefcase, Users, User, Handshake, 
  Mail, Phone, Instagram, CheckCircle2, XCircle, Send, 
  Plus, Trash2, Check, RefreshCw, ExternalLink, KeyRound, LogOut,
  Linkedin, Globe, FileText, Download, Edit, X, MapPin, UserCheck, UserPlus, Award,
  Copy, CheckCheck, FileSpreadsheet, Inbox, AtSign, Search, Sparkles,
  Image as ImageIcon, Layers, CreditCard, AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminAuth } from '../lib/adminAuth';
import { Job, Project, TechifyApp, DiagnosticoLead } from '../types';
import AdminPortfolioTab from './AdminPortfolioTab';
import AdminSiteEditorTab from './AdminSiteEditorTab';
import AdminAppsTab from './AdminAppsTab';
import AdminPackagesTab from './AdminPackagesTab';
import { INITIAL_PORTFOLIO_SITES } from '../data/portfolioData';
import { toast } from './Toast';

export interface NewsletterItem {
  id: string;
  email: string;
  origem?: string;
  status: 'ativo' | 'descadastrado';
  createdAt?: string;
}

interface ConsultaItem {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  servico: string;
  data: string;
  horario?: string;
  resumo?: string;
  status: 'pendente' | 'concluido' | 'recusado';
  createdAt?: string;
}

interface CandidaturaItem {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento?: string;
  vaga: string;
  linkedin?: string;
  instagram?: string;
  portfolio?: string;
  curriculo?: {
    nomeArquivo: string;
    tipoArquivo: string;
    tamanho: string;
    conteudoBase64: string;
  };
  experiencia?: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  arquivado?: boolean;
  dataAprovacao?: string;
  createdAt?: string;
}

export interface ContratadoItem {
  id: string;
  nome: string;
  cargo: string;
  tipoContratacao: string; // 'Estagiário', 'Freelancer', 'CLT', 'PJ', etc.
  vagaOrigem?: string;
  email: string;
  telefone?: string;
  linkedin?: string;
  instagram?: string;
  portfolio?: string;
  curriculo?: {
    nomeArquivo: string;
    tipoArquivo: string;
    tamanho: string;
    conteudoBase64: string;
  };
  experiencia?: string;
  dataContratacao: string;
  createdAt?: string;
  candidaturaId?: string;
}

interface LeadItem {
  id: string;
  nome: string;
  segmento: string;
  email: string;
  telefone: string;
  instagram: string;
  interesses: string;
  status: string;
  emailsEnviados: number;
  dataEnvio: string;
  createdAt?: string;
}

interface ParceiroItem {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  categoria: string;
  status: string;
  createdAt?: string;
}

export default function AdminPanel() {
  const { isAdmin, login, logout } = useAdminAuth();
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState<'andamento' | 'historico' | 'candidaturas' | 'contratados' | 'vagas' | 'leads' | 'parceiros' | 'newsletter' | 'apps' | 'planos' | 'site_editor'>('andamento');

  const [consultas, setConsultas] = useState<ConsultaItem[]>([]);
  const [candidaturas, setCandidaturas] = useState<CandidaturaItem[]>([]);
  const [contratados, setContratados] = useState<ContratadoItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoLead[]>([]);
  const [leadsSubTab, setLeadsSubTab] = useState<'leads' | 'diagnosticos'>('diagnosticos');
  const [candidaturasSubTab, setCandidaturasSubTab] = useState<'pendentes' | 'arquivadas'>('pendentes');
  const [parceiros, setParceiros] = useState<ParceiroItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newsletterEmails, setNewsletterEmails] = useState<NewsletterItem[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<Project[]>([]);
  const [appsList, setAppsList] = useState<TechifyApp[]>([]);
  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  // Modal para aprovar e contratar candidato
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidaturaItem | null>(null);
  const [hireForm, setHireForm] = useState({
    cargo: '',
    tipoContratacao: 'Estagiário',
    observacoes: '',
  });
  const [isSubmittingHire, setIsSubmittingHire] = useState(false);

  // Modal para adicionar contratado direto
  const [isManualHireModalOpen, setIsManualHireModalOpen] = useState(false);
  const [manualHireForm, setManualHireForm] = useState({
    nome: '',
    cargo: '',
    tipoContratacao: 'Estagiário',
    email: '',
    telefone: '',
    linkedin: '',
    instagram: '',
    resumo: '',
  });

  // Job management state in AdminPanel
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    category: 'Design',
    type: 'Tempo Integral',
    location: '',
    description: '',
    salary: '',
  });
  const [jobReqInput, setJobReqInput] = useState('');
  const [jobReqList, setJobReqList] = useState<string[]>([]);
  const [jobBenInput, setJobBenInput] = useState('');
  const [jobBenList, setJobBenList] = useState<string[]>([]);
  const [isSubmittingJobAdmin, setIsSubmittingJobAdmin] = useState(false);

  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    nome: '',
    segmento: 'Roupas',
    email: '',
    telefone: '',
    instagram: '',
    interesses: 'Site',
  });

  // Purge/Cleanup Modal state
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Automatic clean up of mock/test records from previous seedings
  useEffect(() => {
    const cleanupMockRecords = async () => {
      try {
        // Clean mock consultas
        const consultasSnap = await getDocs(collection(db, "consultas"));
        consultasSnap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (
            data.nome === "Lucas Mendes" ||
            data.nome === "Gabriel Santos" ||
            data.nome === "Letícia Carla Araújo da Silva" ||
            data.nome === "Cliente Corporativo Techify" ||
            data.nome === "Techify Parcerias" ||
            data.email === "lucas.mendes@gmail.com" ||
            data.email === "gabriel.santos@gmail.com" ||
            data.email === "leticiacarla0826@gmail.com"
          ) {
            await deleteDoc(doc(db, "consultas", docSnap.id));
          }
        });

        // Clean mock leads
        const leadsSnap = await getDocs(collection(db, "leads"));
        leadsSnap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (
            data.nome === "Rickzinxx" ||
            data.nome === "BRENDA EVELYN" ||
            data.nome === "Marcos paulo De souza" ||
            data.nome === "Lucas Mendes" ||
            data.nome === "Mariana Costa" ||
            data.email === "aigerakabane81983521523@gmail.com" ||
            data.email === "brendaevelyn2023@gmail.com" ||
            data.email === "dmarcospaulo893@gmail.com" ||
            data.email === "mariana.costa@beleza.com"
          ) {
            await deleteDoc(doc(db, "leads", docSnap.id));
          }
        });

        // Clean mock candidaturas
        const candidaturasSnap = await getDocs(collection(db, "candidaturas"));
        candidaturasSnap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (
            data.email === "gabriel.santos@gmail.com" ||
            data.email === "ana.lima@design.com" ||
            data.nome === "Gabriel Santos" ||
            data.nome === "Ana Paula Lima"
          ) {
            await deleteDoc(doc(db, "candidaturas", docSnap.id));
          }
        });

        // Clean mock parceiros
        const parceirosSnap = await getDocs(collection(db, "parceiros"));
        parceirosSnap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (
            data.nome === "Rodrigo Mendes" ||
            data.nome === "Juliana Costa" ||
            data.email === "rodrigo@apexcloud.com.br" ||
            data.email === "juliana@vortex.com.br"
          ) {
            await deleteDoc(doc(db, "parceiros", docSnap.id));
          }
        });

        // Clean mock vagas (test vacancies)
        const vagasSnap = await getDocs(collection(db, "vagas"));
        vagasSnap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (
            data.title === "VENHA FAZER PARTE DA FAMÍLIA TECHIFY" ||
            data.title === "DESIGNER" ||
            data.title === "API DESIGNER"
          ) {
            await deleteDoc(doc(db, "vagas", docSnap.id));
          }
        });
      } catch (err) {
        console.warn("Cleaned test data check:", err);
      }
    };

    cleanupMockRecords();
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubConsultas = onSnapshot(collection(db, "consultas"), (snapshot) => {
      const docs: ConsultaItem[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as ConsultaItem);
      });
      setConsultas(docs);
    }, (err) => console.warn('Firestore consultas offline/error:', err.message));

    const unsubCandidaturas = onSnapshot(collection(db, "candidaturas"), (snapshot) => {
      const docs: CandidaturaItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.email !== "gabriel.santos@gmail.com" &&
          data.email !== "ana.lima@design.com" &&
          data.nome !== "Gabriel Santos" &&
          data.nome !== "Ana Paula Lima"
        ) {
          docs.push({ id: docSnap.id, ...data } as CandidaturaItem);
        }
      });
      setCandidaturas(docs);
    }, (err) => console.warn('Firestore candidaturas offline/error:', err.message));

    const unsubLeads = onSnapshot(collection(db, "leads"), (snapshot) => {
      const docs: LeadItem[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as LeadItem);
      });
      setLeads(docs);
    }, (err) => console.warn('Firestore leads offline/error:', err.message));

    const unsubParceiros = onSnapshot(collection(db, "parceiros"), (snapshot) => {
      const docs: ParceiroItem[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as ParceiroItem);
      });
      setParceiros(docs);
    }, (err) => console.warn('Firestore parceiros offline/error:', err.message));

    const unsubContratados = onSnapshot(collection(db, "contratados"), (snapshot) => {
      const docs: ContratadoItem[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as ContratadoItem);
      });
      setContratados(docs);
    }, (err) => console.warn('Firestore contratados offline/error:', err.message));

    const unsubVagas = onSnapshot(collection(db, "vagas"), (snapshot) => {
      const docs: Job[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        docs.push({
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
      setJobs(docs);
    }, (err) => console.warn('Firestore vagas offline/error:', err.message));

    const unsubNewsletter = onSnapshot(collection(db, "newsletter"), (snapshot) => {
      const docs: NewsletterItem[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as NewsletterItem);
      });
      docs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setNewsletterEmails(docs);
    }, (err) => console.warn('Firestore newsletter offline/error:', err.message));

    const unsubPortfolio = onSnapshot(collection(db, "portfolio"), (snapshot) => {
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
          demoId: data.demoId || '',
          tags: Array.isArray(data.tags) ? data.tags : [data.category || 'Site'],
          certified: data.certified !== false
        });
      });

      setPortfolioProjects(fetched);
    }, (err) => console.warn('Firestore portfolio offline/error:', err.message));

    const unsubApps = onSnapshot(collection(db, 'apps'), (snapshot) => {
      const fetched: TechifyApp[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<TechifyApp, 'id'>)
      }));
      setAppsList(fetched);
    }, (err) => console.warn('Firestore apps error:', err.message));

    const unsubDiagnosticos = onSnapshot(collection(db, 'diagnosticos'), (snapshot) => {
      const docs: DiagnosticoLead[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...(docSnap.data() as Omit<DiagnosticoLead, 'id'>) });
      });
      docs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setDiagnosticos(docs);
    }, (err) => console.warn('Firestore diagnosticos error:', err.message));

    return () => {
      unsubConsultas();
      unsubCandidaturas();
      unsubLeads();
      unsubDiagnosticos();
      unsubParceiros();
      unsubContratados();
      unsubVagas();
      unsubNewsletter();
      unsubPortfolio();
      unsubApps();
    };
  }, []);

  // Job management handlers
  const handleOpenNewJobAdmin = () => {
    setEditingJobId(null);
    setJobForm({
      title: '',
      category: 'Design',
      type: 'Tempo Integral',
      location: '',
      description: '',
      salary: '',
    });
    setJobReqList([]);
    setJobBenList([]);
    setIsJobModalOpen(true);
  };

  const handleOpenEditJobAdmin = (job: Job) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || '',
      category: job.category || 'Design',
      type: job.type || 'Tempo Integral',
      location: job.location || '',
      description: job.description || '',
      salary: job.salary || '',
    });
    setJobReqList(job.requirements || []);
    setJobBenList(job.benefits || []);
    setIsJobModalOpen(true);
  };

  const handleSaveJobAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.location || !jobForm.description) {
      toast.warning('Campos Obrigatórios', 'Preencha o título, localização e descrição da vaga.');
      return;
    }
    setIsSubmittingJobAdmin(true);

    try {
      const payload = {
        title: jobForm.title,
        category: jobForm.category,
        type: jobForm.type,
        location: jobForm.location,
        description: jobForm.description,
        requirements: jobReqList.length > 0 ? jobReqList : ["Experiência na área"],
        benefits: jobBenList.length > 0 ? jobBenList : ["Flexibilidade"],
        salary: jobForm.salary || 'A combinar',
        updatedAt: new Date().toISOString()
      };

      if (editingJobId) {
        await updateDoc(doc(db, "vagas", editingJobId), payload);
        toast.success('Vaga Atualizada', `A oportunidade "${jobForm.title}" foi editada com sucesso.`);
      } else {
        await addDoc(collection(db, "vagas"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success('Vaga Publicada', `A oportunidade "${jobForm.title}" agora está visível no site.`);
      }

      setIsSubmittingJobAdmin(false);
      setIsJobModalOpen(false);
      setEditingJobId(null);
    } catch (err) {
      console.error("Error saving job in AdminPanel:", err);
      toast.error('Erro ao Salvar Vaga', 'Ocorreu uma falha ao salvar a oportunidade.');
      setIsSubmittingJobAdmin(false);
    }
  };

  const handleDeleteJobAdmin = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, "vagas", jobId));
      toast.info('Vaga Removida', 'A oportunidade de carreira foi excluída do sistema.');
    } catch (err) {
      console.error("Error deleting job in AdminPanel:", err);
      toast.error('Erro ao Excluir', 'Não foi possível remover a vaga.');
    }
  };

  // Filtered lists
  const emAndamentoList = consultas.filter(c => c.status === 'pendente');
  const historicoList = consultas.filter(c => c.status === 'concluido' || c.status === 'recusado');

  const candidaturasPendentes = candidaturas.filter(c => c.status !== 'aprovado' && c.status !== 'recusado' && !c.arquivado);
  const candidaturasArquivadas = candidaturas.filter(c => c.status === 'aprovado' || c.status === 'recusado' || c.arquivado);

  // Status Handlers
  const handleUpdateConsultaStatus = async (id: string, newStatus: 'concluido' | 'recusado') => {
    try {
      await updateDoc(doc(db, "consultas", id), { status: newStatus });
      if (newStatus === 'concluido') {
        toast.success('Consulta Concluída', 'O atendimento foi marcado como concluído e movido ao histórico.');
      } else {
        toast.info('Consulta Recusada', 'O status do atendimento foi alterado.');
      }
    } catch (err) {
      console.error("Error updating consulta status:", err);
      toast.error('Erro ao Atualizar', 'Não foi possível atualizar o status da consulta.');
    }
  };

  const handleDeleteConsulta = async (id: string) => {
    try {
      await deleteDoc(doc(db, "consultas", id));
      toast.info('Consulta Excluída', 'O registro foi removido com sucesso.');
    } catch (err) {
      console.error("Error deleting consulta:", err);
      toast.error('Erro ao Excluir', 'Não foi possível remover a consulta.');
    }
  };

  const handleUpdateCandidaturaStatus = async (id: string, newStatus: 'aprovado' | 'recusado') => {
    try {
      await updateDoc(doc(db, "candidaturas", id), { 
        status: newStatus,
        arquivado: true,
        updatedAt: new Date().toISOString()
      });
      if (newStatus === 'recusado') {
        toast.info('Candidatura Recusada', 'A candidatura foi recusada e arquivada.');
      } else {
        toast.success('Candidatura Aprovada', 'O candidato foi aprovado e arquivado.');
      }
    } catch (err) {
      console.error("Error updating candidatura status:", err);
      toast.error('Erro ao Atualizar', 'Não foi possível atualizar a candidatura.');
    }
  };

  const handleRestoreCandidatura = async (id: string) => {
    try {
      await updateDoc(doc(db, "candidaturas", id), { 
        status: 'pendente',
        arquivado: false,
        updatedAt: new Date().toISOString()
      });
      toast.success('Candidatura Restaurada', 'O candidato retornou para a lista de Pendentes / Em Análise.');
    } catch (err) {
      console.error("Error restoring candidatura:", err);
      toast.error('Erro ao Restaurar', 'Não foi possível mover a candidatura para pendente.');
    }
  };

  const handleOpenHireModal = (candidate: CandidaturaItem) => {
    setSelectedCandidate(candidate);
    setHireForm({
      cargo: candidate.vaga || 'Designer / Programador',
      tipoContratacao: 'Estagiário',
      observacoes: candidate.experiencia || ''
    });
    setIsHireModalOpen(true);
  };

  const handleConfirmHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIsSubmittingHire(true);
    try {
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      
      // 1. Grava ou atualiza no banco de dados na coleção 'contratados'
      const existingContratado = contratados.find(c => 
        (c.candidaturaId && c.candidaturaId === selectedCandidate.id) ||
        (c.email && c.email.toLowerCase() === selectedCandidate.email.toLowerCase())
      );

      if (!existingContratado) {
        await addDoc(collection(db, 'contratados'), {
          nome: selectedCandidate.nome,
          cargo: hireForm.cargo || selectedCandidate.vaga || 'Profissional Techify',
          tipoContratacao: hireForm.tipoContratacao || 'Estagiário',
          vagaOrigem: selectedCandidate.vaga || '',
          email: selectedCandidate.email,
          telefone: selectedCandidate.telefone || '',
          linkedin: selectedCandidate.linkedin || '',
          instagram: selectedCandidate.instagram || '',
          portfolio: selectedCandidate.portfolio || '',
          curriculo: selectedCandidate.curriculo || null,
          experiencia: hireForm.observacoes || selectedCandidate.experiencia || '',
          dataContratacao: dataAtual,
          createdAt: new Date().toISOString(),
          candidaturaId: selectedCandidate.id
        });
      }

      // 2. Atualiza status da candidatura para 'aprovado' e arquiva
      await updateDoc(doc(db, 'candidaturas', selectedCandidate.id), {
        status: 'aprovado',
        arquivado: true,
        dataAprovacao: new Date().toISOString()
      });

      toast.success(
        'Contratação Confirmada!', 
        `${selectedCandidate.nome} foi aprovado(a), arquivado(a) e adicionado(a) à área de Contratados.`
      );
      setIsHireModalOpen(false);
      setSelectedCandidate(null);
      // Redireciona direto para a área de contratados conforme solicitado
      setActiveTab('contratados');
    } catch (err) {
      console.error('Erro ao aprovar e contratar candidato:', err);
      toast.error('Erro na Contratação', 'Não foi possível registrar o profissional contratado.');
    } finally {
      setIsSubmittingHire(false);
    }
  };

  const handleQuickApproveAndHire = async (candidate: CandidaturaItem) => {
    try {
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      
      // Adiciona na coleção contratados se não existir
      const existingContratado = contratados.find(c => 
        (c.candidaturaId && c.candidaturaId === candidate.id) ||
        (c.email && c.email.toLowerCase() === candidate.email.toLowerCase())
      );

      if (!existingContratado) {
        await addDoc(collection(db, 'contratados'), {
          nome: candidate.nome,
          cargo: candidate.vaga || 'Profissional Techify',
          tipoContratacao: 'Estagiário',
          vagaOrigem: candidate.vaga || '',
          email: candidate.email,
          telefone: candidate.telefone || '',
          linkedin: candidate.linkedin || '',
          instagram: candidate.instagram || '',
          portfolio: candidate.portfolio || '',
          curriculo: candidate.curriculo || null,
          experiencia: candidate.experiencia || '',
          dataContratacao: dataAtual,
          createdAt: new Date().toISOString(),
          candidaturaId: candidate.id
        });
      }

      // Atualiza e arquiva
      await updateDoc(doc(db, 'candidaturas', candidate.id), {
        status: 'aprovado',
        arquivado: true,
        dataAprovacao: new Date().toISOString()
      });

      toast.success('Contratado com Sucesso', `${candidate.nome} foi aprovado(a), arquivado(a) e adicionado(a) aos Contratados.`);
      setActiveTab('contratados');
    } catch (err) {
      console.error('Erro na aprovação rápida:', err);
      toast.error('Erro ao Aprovar', 'Não foi possível concluir a aprovação.');
    }
  };

  const handleOpenManualHire = () => {
    setManualHireForm({
      nome: '',
      cargo: '',
      tipoContratacao: 'Estagiário',
      email: '',
      telefone: '',
      linkedin: '',
      instagram: '',
      resumo: '',
    });
    setIsManualHireModalOpen(true);
  };

  const handleConfirmManualHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHireForm.nome || !manualHireForm.cargo) {
      toast.warning('Campos Obrigatórios', 'Informe o nome e o cargo do colaborador.');
      return;
    }

    try {
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      await addDoc(collection(db, 'contratados'), {
        nome: manualHireForm.nome,
        cargo: manualHireForm.cargo,
        tipoContratacao: manualHireForm.tipoContratacao || 'Estagiário',
        vagaOrigem: manualHireForm.cargo,
        email: manualHireForm.email || '',
        telefone: manualHireForm.telefone || '',
        linkedin: manualHireForm.linkedin || '',
        instagram: manualHireForm.instagram || '',
        experiencia: manualHireForm.resumo || '',
        dataContratacao: dataAtual,
        createdAt: new Date().toISOString(),
      });
      toast.success('Contratado Adicionado', `${manualHireForm.nome} foi cadastrado com sucesso.`);
      setIsManualHireModalOpen(false);
      setActiveTab('contratados');
    } catch (err) {
      console.error('Erro ao cadastrar contratado manual:', err);
      toast.error('Erro ao Cadastrar', 'Não foi possível salvar o colaborador.');
    }
  };

  const handleDeleteContratado = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contratados', id));
      toast.info('Colaborador Removido', 'O registro foi excluído da lista de contratados.');
    } catch (err) {
      console.error('Erro ao remover contratado:', err);
      toast.error('Erro ao Excluir', 'Não foi possível remover o registro.');
    }
  };

  const handleDeleteCandidatura = async (id: string) => {
    try {
      await deleteDoc(doc(db, "candidaturas", id));
      toast.info('Candidatura Removida', 'A ficha do candidato foi excluída.');
    } catch (err) {
      console.error("Error deleting candidatura:", err);
      toast.error('Erro ao Excluir', 'Não foi possível excluir a candidatura.');
    }
  };

  const handleSendEmailLead = async (lead: LeadItem) => {
    try {
      await updateDoc(doc(db, "leads", lead.id), {
        emailsEnviados: (lead.emailsEnviados || 0) + 1,
        dataEnvio: new Date().toLocaleDateString('pt-BR')
      });
      toast.info('Abrindo E-mail', `Iniciando mensagem para ${lead.nome}...`);
      const companyEmail = "oficialtechify@gmail.com";
      const subject = encodeURIComponent(`Atendimento Techify - Projeto ${lead.interesses || 'Digital'}`);
      const body = encodeURIComponent(`Olá ${lead.nome},\n\nEntramos em contato através da Techify em relação ao seu projeto de ${lead.interesses || 'solução digital'}.\n\nCaso tenha dúvidas, você pode nos responder através do e-mail oficial da empresa (${companyEmail}) ou pelo WhatsApp comercial.\n\nAtenciosamente,\nEquipe Techify\nE-mail Oficial: ${companyEmail}`);
      window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
    } catch (err) {
      console.error("Error sending email to lead:", err);
      toast.error('Erro ao Registrar', 'Não foi possível registrar o envio do e-mail.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteDoc(doc(db, "leads", id));
      toast.info('Lead Removido', 'O contato de oportunidade foi excluído.');
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error('Erro ao Excluir', 'Não foi possível remover o lead.');
    }
  };

  const handleUpdateDiagnosticoStatus = async (id: string, status: 'Novo' | 'Em Atendimento' | 'Concluído') => {
    try {
      await updateDoc(doc(db, "diagnosticos", id), { status });
      toast.success('Status Atualizado', `Diagnóstico marcado como "${status}".`);
    } catch (err) {
      console.error("Error updating diagnostico status:", err);
      toast.error('Erro ao Atualizar', 'Não foi possível atualizar o status.');
    }
  };

  const handleDeleteDiagnostico = async (id: string) => {
    try {
      await deleteDoc(doc(db, "diagnosticos", id));
      toast.info('Diagnóstico Removido', 'A resposta de diagnóstico foi excluída.');
    } catch (err) {
      console.error("Error deleting diagnostico:", err);
      toast.error('Erro ao Excluir', 'Não foi possível remover o diagnóstico.');
    }
  };

  const handleDeleteParceiro = async (id: string) => {
    try {
      await deleteDoc(doc(db, "parceiros", id));
      toast.info('Parceiro Removido', 'A solicitação de parceria foi excluída.');
    } catch (err) {
      console.error("Error deleting parceiro:", err);
      toast.error('Erro ao Excluir', 'Não foi possível remover o parceiro.');
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    try {
      await deleteDoc(doc(db, "newsletter", id));
      toast.info('Inscrição Removida', 'O e-mail foi descadastrado da newsletter.');
    } catch (err) {
      console.error("Error deleting newsletter subscriber:", err);
      toast.error('Erro ao Excluir', 'Não foi possível descadastrar o e-mail.');
    }
  };

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    toast.success('E-mail Copiado', `${email} copiado para a área de transferência.`);
    setTimeout(() => setCopiedEmailId(null), 2500);
  };

  const handleCopyAllNewsletterEmails = () => {
    if (newsletterEmails.length === 0) return;
    const list = newsletterEmails.map(item => item.email).join(', ');
    navigator.clipboard.writeText(list);
    setAllCopied(true);
    toast.success('Lista Copiada', `${newsletterEmails.length} e-mails copiados para a área de transferência.`);
    setTimeout(() => setAllCopied(false), 3000);
  };

  const handleExportNewsletterCSV = () => {
    if (newsletterEmails.length === 0) return;
    const header = "Email,Origem,Status,Data de Cadastro\n";
    const rows = newsletterEmails.map(item => {
      const dataFormatted = item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'N/A';
      return `"${item.email}","${item.origem || 'Rodapé'}","${item.status || 'ativo'}","${dataFormatted}"`;
    }).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter_techify_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exportação Concluída', 'Arquivo CSV gerado e descarregado com sucesso.');
  };

  const handlePurgeAllMockData = async () => {
    setIsPurging(true);
    try {
      // 1. Delete all consultas
      const consultasSnap = await getDocs(collection(db, "consultas"));
      const cDeletions = consultasSnap.docs.map(d => deleteDoc(doc(db, "consultas", d.id)));

      // 2. Delete all leads
      const leadsSnap = await getDocs(collection(db, "leads"));
      const lDeletions = leadsSnap.docs.map(d => deleteDoc(doc(db, "leads", d.id)));

      // 3. Delete all candidaturas
      const candSnap = await getDocs(collection(db, "candidaturas"));
      const candDeletions = candSnap.docs.map(d => deleteDoc(doc(db, "candidaturas", d.id)));

      // 4. Delete all parceiros
      const parcSnap = await getDocs(collection(db, "parceiros"));
      const parcDeletions = parcSnap.docs.map(d => deleteDoc(doc(db, "parceiros", d.id)));

      // 5. Delete all vagas
      const vagasSnap = await getDocs(collection(db, "vagas"));
      const vDeletions = vagasSnap.docs.map(d => deleteDoc(doc(db, "vagas", d.id)));

      // 6. Delete all diagnosticos
      const diagSnap = await getDocs(collection(db, "diagnosticos"));
      const dDeletions = diagSnap.docs.map(d => deleteDoc(doc(db, "diagnosticos", d.id)));

      await Promise.all([
        ...cDeletions,
        ...lDeletions,
        ...candDeletions,
        ...parcDeletions,
        ...vDeletions,
        ...dDeletions
      ]);

      toast.success('Banco de Dados Limpo!', 'Todos os registros de teste e demonstração foram excluídos. O sistema está 100% pronto para clientes e candidatos reais.');
      setIsPurgeModalOpen(false);
    } catch (err) {
      console.error('Error purging database:', err);
      toast.error('Erro ao Limpar Banco', 'Ocorreu um erro ao excluir alguns registros de teste.');
    } finally {
      setIsPurging(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.nome || !newLeadForm.email) {
      toast.warning('Campos Obrigatórios', 'Preencha o nome e o e-mail do lead.');
      return;
    }

    try {
      await addDoc(collection(db, "leads"), {
        nome: newLeadForm.nome,
        segmento: newLeadForm.segmento || 'Geral',
        email: newLeadForm.email,
        telefone: newLeadForm.telefone || 'N/A',
        instagram: newLeadForm.instagram ? newLeadForm.instagram.replace('@', '') : 'N/A',
        interesses: newLeadForm.interesses || 'Site',
        status: 'Completo',
        emailsEnviados: 0,
        dataEnvio: new Date().toLocaleDateString('pt-BR'),
        createdAt: new Date().toISOString()
      });
      toast.success('Lead Cadastrado', `Lead "${newLeadForm.nome}" adicionado com sucesso.`);
      setIsNewLeadModalOpen(false);
      setNewLeadForm({ nome: '', segmento: 'Roupas', email: '', telefone: '', instagram: '', interesses: 'Site' });
    } catch (err) {
      console.error("Error adding new lead:", err);
      toast.error('Erro ao Cadastrar', 'Não foi possível cadastrar o lead.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-[#070807] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#121312] p-6 shadow-2xl text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30 shadow-[0_0_20px_rgba(163,230,53,0.15)]">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-black text-white">Acesso do Administrador</h2>
          <p className="text-xs text-neutral-400 mt-1 mb-5">
            Área restrita. Insira a senha de administrador da Techify para desbloquear o painel.
          </p>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const ok = await login(passwordInput);
            if (!ok) {
              setPasswordError('Senha incorreta.');
              toast.error('Chave Incorreta', 'Senha de administrador não confere.');
            } else {
              setPasswordError('');
              toast.success('Acesso Liberado', 'Bem-vindo ao painel administrativo da Techify.');
            }
          }} className="space-y-3">
            <input
              type="password"
              placeholder="Digite a senha..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              autoFocus
              className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-3 px-4 text-xs text-white text-center focus:border-[#a3e635] focus:outline-none font-mono tracking-wider"
            />
            {passwordError && (
              <p className="text-xs text-red-400 font-medium">{passwordError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-3 text-xs cursor-pointer shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#070807] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header exact match to screenshots */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635] shadow-[0_0_20px_rgba(163,230,53,0.15)]">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Painel <span className="text-[#a3e635]">Admin</span>
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm font-sans mt-0.5">
                Gerencie consultas agendadas e candidaturas às vagas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'contratados' && (
              <button
                onClick={handleOpenManualHire}
                className="flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs px-4 py-2.5 transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Adicionar Contratado</span>
              </button>
            )}

            {activeTab === 'vagas' && (
              <button
                onClick={handleOpenNewJobAdmin}
                className="flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs px-4 py-2.5 transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Publicar Nova Vaga</span>
              </button>
            )}

            {activeTab === 'leads' && (
              <button
                onClick={() => setIsNewLeadModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs px-4 py-2.5 transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Cadastrar Lead</span>
              </button>
            )}

            <button
              onClick={() => setIsPurgeModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs px-3.5 py-2.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              title="Limpar todos os dados de teste e deixar o banco zerado para receber usuários de verdade"
            >
              <Trash2 className="h-4 w-4 text-amber-400" />
              <span>Limpar Dados de Teste</span>
            </button>

            <button
              onClick={() => {
                logout();
                toast.info('Sessão Finalizada', 'Você encerrou o acesso administrativo com segurança.');
              }}
              className="flex items-center gap-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs px-3.5 py-2.5 transition-all cursor-pointer"
              title="Sair do Modo Admin"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair do Admin</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="mt-8 rounded-2xl border border-neutral-800/80 bg-[#0e0f0e] p-1.5 flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setActiveTab('andamento')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'andamento'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Em Andamento ({emAndamentoList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'historico'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Histórico ({historicoList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('candidaturas')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'candidaturas'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Candidaturas ({candidaturasPendentes.length})</span>
            {candidaturasPendentes.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'candidaturas' ? 'bg-black text-[#a3e635]' : 'bg-[#a3e635] text-black'
              }`}>
                {candidaturasPendentes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contratados')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'contratados'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <UserCheck className="h-4 w-4 text-[#a3e635]" />
            <span>Contratados ({contratados.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vagas')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vagas'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Briefcase className="h-4 w-4 text-[#a3e635]" />
            <span>Vagas ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Leads & Diagnósticos ({leads.length + diagnosticos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parceiros')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'parceiros'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Handshake className="h-4 w-4" />
            <span>Parceiros ({parceiros.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'newsletter'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Newsletter ({newsletterEmails.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'apps'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <Layers className="h-4 w-4 text-[#a3e635]" />
            <span>Apps Techify ({appsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('planos')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'planos'
                ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                : 'text-[#4ade80] hover:text-white hover:bg-[#22c55e]/15 border border-[#22c55e]/30'
            }`}
          >
            <CreditCard className="h-4 w-4 text-[#22c55e]" />
            <span>Planos & Preços</span>
          </button>

          <button
            onClick={() => setActiveTab('site_editor')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'site_editor'
                ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-[#a3e635] hover:text-white hover:bg-[#a3e635]/10 border border-[#a3e635]/30'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#a3e635]" />
            <span>Editor do Site (Equipe & Textos)</span>
          </button>

        </div>

        {/* TAB CONTENT PANELS */}

        {/* 1. EM ANDAMENTO TAB */}
        {activeTab === 'andamento' && (
          <div className="mt-6">
            {emAndamentoList.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                <Calendar className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                <p className="text-base font-bold text-white">Nenhum agendamento em andamento</p>
                <p className="text-xs text-neutral-500 mt-1">Novas solicitações de consulta enviadas no site aparecerão aqui em tempo real.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {emAndamentoList.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Name Header */}
                      <h3 className="font-bold text-white text-lg font-sans tracking-tight">
                        {item.nome}
                      </h3>

                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                        <span className="bg-[#451a03]/60 border border-[#f59e0b]/40 text-[#f59e0b] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          pendente
                        </span>
                        <span className="bg-[#4c1d95]/50 border border-[#a855f7]/40 text-[#d8b4fe] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          {item.servico}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 text-xs text-neutral-300">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <a 
                            href={`mailto:${item.email}?subject=${encodeURIComponent("Atendimento Techify - Consulta Agendada")}&body=${encodeURIComponent("Olá " + item.nome + ",\n\nEntramos em contato através da Techify em relação à sua solicitação de " + item.servico + ".\n\nAtenciosamente,\nEquipe Techify\nE-mail oficial: oficialtechify@gmail.com")}`}
                            className="hover:underline truncate text-neutral-300"
                          >
                            {item.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Phone className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <span>{item.whatsapp}</span>
                        </div>
                        {item.data && (
                          <div className="flex items-center gap-2 text-neutral-400 pt-1">
                            <Clock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            <span>{item.data} {item.horario ? `às ${item.horario}` : ''}</span>
                          </div>
                        )}
                        {item.resumo && (
                          <div className="bg-[#0b0c0b] p-3 rounded-xl border border-neutral-800/60 mt-3 text-xs text-neutral-400 leading-relaxed">
                            "{item.resumo}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-neutral-800/50">
                      <button
                        onClick={() => handleUpdateConsultaStatus(item.id, 'concluido')}
                        className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 shadow-[0_2px_10px_rgba(34,197,94,0.2)] cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Aceitar</span>
                      </button>

                      <button
                        onClick={() => handleUpdateConsultaStatus(item.id, 'recusado')}
                        className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 shadow-[0_2px_10px_rgba(239,68,68,0.2)] cursor-pointer"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Recusar</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. HISTÓRICO TAB */}
        {activeTab === 'historico' && (
          <div className="mt-6">
            {historicoList.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                <Clock className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                <p className="text-base font-bold text-white">Nenhum histórico registrado</p>
                <p className="text-xs text-neutral-500 mt-1">Consultas aceitas ou recusadas aparecerão neste arquivo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {historicoList.map((item) => {
                  const isConcluido = item.status === 'concluido';
                  return (
                    <div 
                      key={item.id}
                      className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-white text-base uppercase font-sans tracking-tight">
                            {item.nome}
                          </h3>
                          <span className="bg-[#4c1d95]/50 border border-[#a855f7]/40 text-[#d8b4fe] text-[11px] font-bold px-2.5 py-0.5 rounded-md shrink-0">
                            {item.servico}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="my-2">
                          {isConcluido ? (
                            <span className="bg-[#4c1d95]/60 border border-[#a855f7]/50 text-[#d8b4fe] text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block">
                              concluido
                            </span>
                          ) : (
                            <span className="bg-[#7f1d1d]/60 border border-[#ef4444]/50 text-[#fca5a5] text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block">
                              recusado
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="space-y-2 text-xs text-neutral-400 mt-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </div>
                          {item.data && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <span>{item.data}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 mt-4 border-t border-neutral-800/50">
                        <button
                          onClick={() => handleDeleteConsulta(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                          title="Remover do Histórico"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. CANDIDATURAS TAB */}
        {activeTab === 'candidaturas' && (
          <div className="mt-6">
            {/* Sub-tabs header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-[#111211] p-3 rounded-2xl border border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCandidaturasSubTab('pendentes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    candidaturasSubTab === 'pendentes'
                      ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Pendentes / Em Análise</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    candidaturasSubTab === 'pendentes' ? 'bg-black text-[#a3e635]' : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    {candidaturasPendentes.length}
                  </span>
                </button>

                <button
                  onClick={() => setCandidaturasSubTab('arquivadas')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    candidaturasSubTab === 'arquivadas'
                      ? 'bg-[#a3e635] text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Arquivadas / Processadas</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    candidaturasSubTab === 'arquivadas' ? 'bg-black text-[#a3e635]' : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    {candidaturasArquivadas.length}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 bg-neutral-900/80 px-3 py-1.5 rounded-xl border border-neutral-800">
                <Sparkles className="h-3.5 w-3.5 text-[#a3e635]" />
                <span>Ao aprovar, o candidato é <strong>arquivado</strong> e movido para <strong>Contratados</strong>.</span>
              </div>
            </div>

            {/* PENDENTES VIEW */}
            {candidaturasSubTab === 'pendentes' && (
              <>
                {candidaturasPendentes.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-[#a3e635] mb-3" />
                    <p className="text-base font-bold text-white">Nenhuma candidatura pendente</p>
                    <p className="text-xs text-neutral-500 mt-1 mb-4">
                      Todas as candidaturas foram avaliadas! Os profissionais contratados estão na área de Contratados.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => setActiveTab('contratados')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Ver Contratados ({contratados.length})</span>
                      </button>
                      {candidaturasArquivadas.length > 0 && (
                        <button
                          onClick={() => setCandidaturasSubTab('arquivadas')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          <Clock className="h-4 w-4" />
                          <span>Ver Histórico Arquivado ({candidaturasArquivadas.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {candidaturasPendentes.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden"
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-white text-lg font-sans">
                                {item.nome}
                              </h3>
                              {item.dataNascimento && (
                                <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-3 w-3 text-neutral-500" />
                                  <span>Nasc: {item.dataNascimento}</span>
                                </p>
                              )}
                            </div>
                            <span className="bg-[#1e293b] border border-[#3b82f6]/40 text-[#93c5fd] text-[11px] font-bold px-2.5 py-0.5 rounded-md shrink-0">
                              {item.vaga}
                            </span>
                          </div>

                          {/* Contact & Social Info */}
                          <div className="space-y-2 text-xs text-neutral-300 mt-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <a 
                                href={`mailto:${item.email}?subject=${encodeURIComponent("Seleção Techify - Vaga de " + item.vaga)}&body=${encodeURIComponent("Olá " + item.nome + ",\n\nAgradecemos seu interesse em fazer parte da equipe Techify para a vaga de " + item.vaga + ".\n\nAtenciosamente,\nEquipe de RH - Techify\nE-mail oficial: oficialtechify@gmail.com")}`} 
                                className="hover:underline truncate text-neutral-300"
                              >
                                {item.email}
                              </a>
                            </div>

                            {item.telefone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-[#a3e635] shrink-0" />
                                <a 
                                  href={`https://wa.me/55${item.telefone.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#a3e635] hover:underline font-semibold"
                                >
                                  {item.telefone} (WhatsApp)
                                </a>
                              </div>
                            )}

                            {/* Separate LinkedIn */}
                            {item.linkedin && (
                              <div className="flex items-center gap-2 pt-0.5">
                                <Linkedin className="h-3.5 w-3.5 text-[#0a66c2] shrink-0" />
                                <a 
                                  href={item.linkedin.startsWith('http') ? item.linkedin : `https://${item.linkedin}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#60a5fa] hover:underline truncate"
                                >
                                  {item.linkedin}
                                </a>
                              </div>
                            )}

                            {/* Separate Instagram */}
                            {item.instagram && (
                              <div className="flex items-center gap-2">
                                <Instagram className="h-3.5 w-3.5 text-[#e1306c] shrink-0" />
                                <a 
                                  href={item.instagram.startsWith('http') ? item.instagram : `https://instagram.com/${item.instagram.replace('@', '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#f472b6] hover:underline truncate"
                                >
                                  {item.instagram}
                                </a>
                              </div>
                            )}

                            {/* Separate Portfolio */}
                            {item.portfolio && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                <a 
                                  href={item.portfolio.startsWith('http') ? item.portfolio : `https://${item.portfolio}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-neutral-300 hover:underline truncate"
                                >
                                  {item.portfolio}
                                </a>
                              </div>
                            )}

                            {/* Currículo Anexado */}
                            {item.curriculo && (
                              <div className="bg-[#090a09] border border-[#a3e635]/30 rounded-xl p-3 mt-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-4 w-4 text-[#a3e635] shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-bold text-white text-[11px] truncate">{item.curriculo.nomeArquivo}</p>
                                    <p className="text-[10px] text-neutral-400">{item.curriculo.tamanho}</p>
                                  </div>
                                </div>
                                <a
                                  href={item.curriculo.conteudoBase64}
                                  download={item.curriculo.nomeArquivo}
                                  className="bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Baixar</span>
                                </a>
                              </div>
                            )}

                            {/* Experience summary */}
                            {item.experiencia && (
                              <div className="bg-[#0b0c0b] p-3 rounded-xl border border-neutral-800/60 mt-3 text-xs text-neutral-300 leading-relaxed">
                                <p className="font-semibold text-[10px] text-neutral-500 uppercase mb-1">Resumo Profissional:</p>
                                {item.experiencia}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/50">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenHireModal(item)}
                              className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)] hover:scale-105"
                              title="Aprovar e mover para Contratados"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Aprovar & Contratar</span>
                            </button>

                            <button
                              onClick={() => handleUpdateCandidaturaStatus(item.id, 'recusado')}
                              className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                              title="Recusar e arquivar candidatura"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Recusar</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteCandidatura(item.id)}
                            className="text-neutral-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                            title="Excluir Candidatura"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ARQUIVADAS / PROCESSADAS VIEW */}
            {candidaturasSubTab === 'arquivadas' && (
              <>
                {candidaturasArquivadas.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                    <Clock className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                    <p className="text-base font-bold text-white">Nenhuma candidatura arquivada</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Candidaturas aprovadas ou recusadas ficarão registradas aqui para consulta.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {candidaturasArquivadas.map((item) => {
                      const isApproved = item.status === 'aprovado';
                      return (
                        <div 
                          key={item.id}
                          className={`bg-[#131414] border rounded-2xl p-5 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden ${
                            isApproved 
                              ? 'border-emerald-500/40 hover:border-emerald-500/70' 
                              : 'border-red-500/30 hover:border-red-500/50 opacity-90'
                          }`}
                        >
                          {/* Status Highlight Banner */}
                          <div className={`text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 -mt-5 -mx-5 mb-4 flex items-center justify-between ${
                            isApproved 
                              ? 'bg-emerald-500/20 text-emerald-400 border-b border-emerald-500/30' 
                              : 'bg-red-500/20 text-red-400 border-b border-red-500/30'
                          }`}>
                            <span className="flex items-center gap-1.5">
                              {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {isApproved ? 'Aprovado & Na Equipe' : 'Candidatura Recusada'}
                            </span>
                            {item.dataAprovacao && (
                              <span className="text-[9px] text-neutral-400 lowercase font-normal">
                                {new Date(item.dataAprovacao).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>

                          <div>
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-white text-lg font-sans">
                                  {item.nome}
                                </h3>
                                {item.dataNascimento && (
                                  <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                    <Calendar className="h-3 w-3 text-neutral-500" />
                                    <span>Nasc: {item.dataNascimento}</span>
                                  </p>
                                )}
                              </div>
                              <span className="bg-[#1e293b] border border-[#3b82f6]/40 text-[#93c5fd] text-[11px] font-bold px-2.5 py-0.5 rounded-md shrink-0">
                                {item.vaga}
                              </span>
                            </div>

                            {/* Contact & Social Info */}
                            <div className="space-y-2 text-xs text-neutral-300 mt-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                                <a 
                                  href={`mailto:${item.email}?subject=${encodeURIComponent("Seleção Techify - Vaga de " + item.vaga)}&body=${encodeURIComponent("Olá " + item.nome + ",\n\nAtenciosamente,\nEquipe Techify")}`} 
                                  className="hover:underline truncate text-neutral-300"
                                >
                                  {item.email}
                                </a>
                              </div>

                              {item.telefone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-[#a3e635] shrink-0" />
                                  <a 
                                    href={`https://wa.me/55${item.telefone.replace(/\D/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#a3e635] hover:underline font-semibold"
                                  >
                                    {item.telefone} (WhatsApp)
                                  </a>
                                </div>
                              )}

                              {item.linkedin && (
                                <div className="flex items-center gap-2 pt-0.5">
                                  <Linkedin className="h-3.5 w-3.5 text-[#0a66c2] shrink-0" />
                                  <a 
                                    href={item.linkedin.startsWith('http') ? item.linkedin : `https://${item.linkedin}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#60a5fa] hover:underline truncate"
                                  >
                                    {item.linkedin}
                                  </a>
                                </div>
                              )}

                              {item.instagram && (
                                <div className="flex items-center gap-2">
                                  <Instagram className="h-3.5 w-3.5 text-[#e1306c] shrink-0" />
                                  <a 
                                    href={item.instagram.startsWith('http') ? item.instagram : `https://instagram.com/${item.instagram.replace('@', '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#f472b6] hover:underline truncate"
                                  >
                                    {item.instagram}
                                  </a>
                                </div>
                              )}

                              {/* Currículo Anexado */}
                              {item.curriculo && (
                                <div className="bg-[#090a09] border border-[#a3e635]/30 rounded-xl p-3 mt-3 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-[#a3e635] shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-bold text-white text-[11px] truncate">{item.curriculo.nomeArquivo}</p>
                                      <p className="text-[10px] text-neutral-400">{item.curriculo.tamanho}</p>
                                    </div>
                                  </div>
                                  <a
                                    href={item.curriculo.conteudoBase64}
                                    download={item.curriculo.nomeArquivo}
                                    className="bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Baixar</span>
                                  </a>
                                </div>
                              )}

                              {item.experiencia && (
                                <div className="bg-[#0b0c0b] p-3 rounded-xl border border-neutral-800/60 mt-3 text-xs text-neutral-300 leading-relaxed">
                                  <p className="font-semibold text-[10px] text-neutral-500 uppercase mb-1">Resumo Profissional:</p>
                                  {item.experiencia}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/50">
                            <div className="flex items-center gap-2">
                              {isApproved ? (
                                <button
                                  onClick={() => setActiveTab('contratados')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  <span>Ver nos Contratados ↗</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenHireModal(item)}
                                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Aprovar & Contratar</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleRestoreCandidatura(item.id)}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                title="Desarquivar e retornar para lista de Pendentes"
                              >
                                Restaurar
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteCandidatura(item.id)}
                              className="text-neutral-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                              title="Excluir Registro"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CONTRATADOS TAB */}
        {activeTab === 'contratados' && (
          <div className="mt-6">
            {contratados.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                <UserCheck className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                <p className="text-base font-bold text-white">Nenhum profissional contratado ainda</p>
                <p className="text-xs text-neutral-500 mt-1 mb-4">Aprove candidaturas na aba "Candidaturas" para mover profissionais para cá, ou adicione manualmente.</p>
                <button
                  onClick={handleOpenManualHire}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs px-4 py-2.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(163,230,53,0.3)]"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Adicionar Primeiro Contratado</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {contratados.map((item) => {
                  const isEstagio = item.tipoContratacao?.toLowerCase().includes('estag') || item.tipoContratacao?.toLowerCase().includes('estagiário');
                  const isFreela = item.tipoContratacao?.toLowerCase().includes('freel');
                  const isCLT = item.tipoContratacao?.toLowerCase().includes('clt');
                  
                  let badgeStyle = 'bg-neutral-800 text-neutral-300 border-neutral-700';
                  if (isEstagio) badgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
                  else if (isFreela) badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                  else if (isCLT) badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                  else badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                  return (
                    <div 
                      key={item.id}
                      className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden"
                    >
                      {/* Top highlight bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a3e635] via-emerald-400 to-cyan-400" />

                      <div>
                        {/* Header with Name & Badges */}
                        <div className="flex items-start justify-between gap-2 mt-1">
                          <div>
                            <h3 className="font-bold text-white text-lg font-sans">
                              {item.nome}
                            </h3>
                            <p className="text-xs font-bold text-[#a3e635] mt-0.5 flex items-center gap-1">
                              <Award className="h-3.5 w-3.5 shrink-0" />
                              <span>{item.cargo}</span>
                            </p>
                          </div>
                          <span className={`border text-[11px] font-extrabold px-2.5 py-1 rounded-lg shrink-0 ${badgeStyle}`}>
                            {item.tipoContratacao}
                          </span>
                        </div>

                        {/* Origem da vaga & Data de contratação */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-800/40">
                          {item.vagaOrigem && (
                            <span className="truncate">Vaga: <strong className="text-neutral-300">{item.vagaOrigem}</strong></span>
                          )}
                          {item.dataContratacao && (
                            <span className="text-neutral-500 shrink-0">Início: {item.dataContratacao}</span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="space-y-2 text-xs text-neutral-300 mt-3">
                          {item.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <a 
                                href={`mailto:${item.email}?subject=${encodeURIComponent("Techify - Comunicação Interna")}&body=${encodeURIComponent("Olá " + item.nome + ",\n\nEntramos em contato sobre as demandas da sua função (" + item.cargo + ").\n\nAtenciosamente,\nEquipe Techify")}`} 
                                className="hover:underline truncate text-neutral-300"
                              >
                                {item.email}
                              </a>
                            </div>
                          )}

                          {item.telefone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-[#a3e635] shrink-0" />
                              <a 
                                href={`https://wa.me/55${item.telefone.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[#a3e635] hover:underline font-semibold"
                              >
                                {item.telefone} (WhatsApp)
                              </a>
                            </div>
                          )}

                          {item.linkedin && (
                            <div className="flex items-center gap-2 pt-0.5">
                              <Linkedin className="h-3.5 w-3.5 text-[#0a66c2] shrink-0" />
                              <a 
                                href={item.linkedin.startsWith('http') ? item.linkedin : `https://${item.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[#60a5fa] hover:underline truncate"
                              >
                                {item.linkedin}
                              </a>
                            </div>
                          )}

                          {item.instagram && (
                            <div className="flex items-center gap-2">
                              <Instagram className="h-3.5 w-3.5 text-[#e1306c] shrink-0" />
                              <a 
                                href={item.instagram.startsWith('http') ? item.instagram : `https://instagram.com/${item.instagram.replace('@', '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[#f472b6] hover:underline truncate"
                              >
                                {item.instagram}
                              </a>
                            </div>
                          )}

                          {item.curriculo && (
                            <div className="bg-[#090a09] border border-[#a3e635]/30 rounded-xl p-3 mt-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 text-[#a3e635] shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold text-white text-[11px] truncate">{item.curriculo.nomeArquivo}</p>
                                  <p className="text-[10px] text-neutral-400">{item.curriculo.tamanho}</p>
                                </div>
                              </div>
                              <a
                                href={item.curriculo.conteudoBase64}
                                download={item.curriculo.nomeArquivo}
                                className="bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Baixar</span>
                              </a>
                            </div>
                          )}

                          {item.experiencia && (
                            <div className="bg-[#0b0c0b] p-3 rounded-xl border border-neutral-800/60 mt-3 text-xs text-neutral-300 leading-relaxed">
                              <p className="font-semibold text-[10px] text-neutral-500 uppercase mb-1">Anotações / Experiência:</p>
                              {item.experiencia}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/50">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Ativo no Time
                        </span>

                        <button
                          onClick={() => handleDeleteContratado(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                          title="Remover do Time de Contratados"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3.5 VAGAS TAB */}
        {activeTab === 'vagas' && (
          <div className="mt-6">
            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                <Briefcase className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                <p className="text-base font-bold text-white mb-2">Nenhuma vaga cadastrada</p>
                <button
                  onClick={handleOpenNewJobAdmin}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs px-4 py-2.5 transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publicar Primeira Vaga</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map((job) => (
                  <div 
                    key={job.id}
                    className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-base uppercase font-sans tracking-tight">
                          {job.title}
                        </h3>
                        <span className="bg-[#1e293b] border border-[#3b82f6]/40 text-[#93c5fd] text-[11px] font-bold px-2.5 py-0.5 rounded-md shrink-0">
                          {job.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 my-3">
                        <span className="bg-[#14532d]/60 border border-[#22c55e]/50 text-[#4ade80] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          {job.type}
                        </span>
                        <span className="bg-neutral-800 text-neutral-300 text-[11px] px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#a3e635]" />
                          <span>{job.location}</span>
                        </span>
                        {job.salary && (
                          <span className="bg-neutral-800 text-neutral-300 text-[11px] px-2.5 py-0.5 rounded-md">
                            {job.salary}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed mb-3">
                        {job.description}
                      </p>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="space-y-1 my-2">
                          <p className="text-[10px] font-bold text-neutral-500 uppercase">Requisitos:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.requirements.map((req, i) => (
                              <span key={i} className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] px-2 py-0.5 rounded">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/50">
                      <button
                        onClick={() => handleOpenEditJobAdmin(job)}
                        className="bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Editar Vaga</span>
                      </button>

                      <button
                        onClick={() => handleDeleteJobAdmin(job.id)}
                        className="text-neutral-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Excluir Vaga"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. LEADS & DIAGNÓSTICOS TAB */}
        {activeTab === 'leads' && (
          <div className="mt-6">
            {/* Subtab Switcher */}
            <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-3">
              <button
                type="button"
                onClick={() => setLeadsSubTab('diagnosticos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  leadsSubTab === 'diagnosticos'
                    ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Diagnósticos do Site ({diagnosticos.length})</span>
                {diagnosticos.filter(d => d.status === 'Novo').length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setLeadsSubTab('leads')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  leadsSubTab === 'leads'
                    ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Leads Manuais ({leads.length})</span>
              </button>
            </div>

            {/* DIAGNÓSTICOS DO SITE VIEW */}
            {leadsSubTab === 'diagnosticos' && (
              <div>
                {diagnosticos.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                    <Sparkles className="mx-auto h-10 w-10 text-[#a3e635] mb-3" />
                    <p className="text-base font-bold text-white">Nenhum diagnóstico registrado ainda</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Assim que um visitante responder à pergunta "Está perdendo cliente por qual desses três?" no site, a resposta aparecerá aqui em tempo real.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {diagnosticos.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-[#a3e635]/40 transition-all flex flex-col justify-between shadow-lg"
                      >
                        <div>
                          {/* Header: Option Tag & Status */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="bg-[#a3e635]/15 border border-[#a3e635]/40 text-[#a3e635] text-xs font-bold px-3 py-1 rounded-lg">
                              {item.opcaoTitulo}
                            </span>
                            
                            <select
                              value={item.status || 'Novo'}
                              onChange={(e) => item.id && handleUpdateDiagnosticoStatus(item.id, e.target.value as 'Novo' | 'Em Atendimento' | 'Concluído')}
                              className="bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-300 rounded-lg px-2 py-1 focus:border-[#a3e635] focus:outline-none cursor-pointer"
                            >
                              <option value="Novo">🔴 Novo</option>
                              <option value="Em Atendimento">🟡 Em Atendimento</option>
                              <option value="Concluído">🟢 Concluído</option>
                            </select>
                          </div>

                          {/* Contact Info (if submitted) */}
                          {item.whatsapp && (
                            <div className="mt-3 p-3 rounded-xl bg-black/60 border border-neutral-800">
                              <p className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                                <User className="h-3.5 w-3.5 text-[#a3e635]" />
                                <span>{item.nome || 'Cliente Interessado'}</span>
                              </p>
                              <p className="text-xs text-neutral-300 flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                <span>{item.whatsapp}</span>
                              </p>
                            </div>
                          )}

                          {/* Problem summary */}
                          <div className="mt-3 bg-[#0a0c0a] p-3 rounded-xl border border-neutral-800/70">
                            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                              Gargalo Marcado:
                            </p>
                            <p className="text-xs text-neutral-300 leading-relaxed">
                              {item.problema}
                            </p>
                          </div>

                          {/* Solution Proposed */}
                          <div className="mt-2 text-xs text-neutral-400">
                            <span className="text-neutral-500 font-semibold">Solução apresentada: </span>
                            <span className="text-neutral-200">{item.solucaoResumo}</span>
                          </div>

                          {/* Date Footer */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-4 pt-2 border-t border-neutral-800/50">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.data}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-neutral-800/50 flex items-center gap-2">
                          {item.whatsapp ? (
                            <a
                              href={`https://api.whatsapp.com/send?phone=55${item.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá ${item.nome || ''}! Vimos que você respondeu ao diagnóstico no site da Techify com a opção ${item.opcaoTitulo}. Como podemos ajudar com sua estrutura digital?`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold py-2 rounded-xl flex items-center justify-center gap-2 text-xs flex-1 transition-all shadow-[0_0_12px_rgba(34,197,94,0.25)] cursor-pointer"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Falar no WhatsApp</span>
                            </a>
                          ) : (
                            <div className="text-[11px] text-neutral-500 italic py-1 flex-1">
                              Resposta anônima do visitante
                            </div>
                          )}

                          <button
                            onClick={() => item.id && handleDeleteDiagnostico(item.id)}
                            className="bg-neutral-900 border border-neutral-800/80 hover:bg-red-500/20 hover:border-red-500/50 text-neutral-400 hover:text-red-400 p-2.5 rounded-xl transition-all cursor-pointer"
                            title="Excluir Diagnóstico"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LEADS MANUAIS VIEW */}
            {leadsSubTab === 'leads' && (
              <div>
                {leads.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                    <Users className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                    <p className="text-base font-bold text-white">Nenhum lead cadastrado</p>
                    <p className="text-xs text-neutral-500 mt-1">Clique em 'Cadastrar Lead' para adicionar um novo cliente em potencial.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {leads.map((lead) => (
                      <div 
                        key={lead.id}
                        className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-lg"
                      >
                        <div>
                          {/* Name & Completo Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-white text-lg font-sans">
                              {lead.nome}
                            </h3>
                            <span className="bg-[#14532d]/50 border border-[#22c55e]/50 text-[#4ade80] text-[11px] font-bold px-2.5 py-0.5 rounded-md shrink-0">
                              {lead.status || 'Completo'}
                            </span>
                          </div>

                          {/* Segment sub-label */}
                          <p className="text-neutral-400 text-xs my-1 font-medium">
                            {lead.segmento}
                          </p>

                          {/* Info lines */}
                          <div className="space-y-2 text-xs text-neutral-400 mt-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <span>{lead.telefone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Instagram className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <span>@{lead.instagram.replace('@', '')}</span>
                            </div>
                          </div>

                          {/* Interesses dark box */}
                          <div className="bg-[#0c0d0d] p-3 rounded-xl border border-neutral-800/80 my-3">
                            <div className="text-[#a3e635] text-xs font-bold flex items-center gap-1.5 mb-1">
                              <span className="inline-block h-2 w-2 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />
                              <span>Interesses</span>
                            </div>
                            <p className="text-white text-xs font-medium">
                              {lead.interesses}
                            </p>
                          </div>

                          {/* Footer Row */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                            <span>Emails enviados: {lead.emailsEnviados || 0}</span>
                            <span>{lead.dataEnvio}</span>
                          </div>
                        </div>

                        {/* Bright Green Email Action Button */}
                        <div className="mt-4 pt-3 border-t border-neutral-800/50 flex items-center gap-2">
                          <button
                            onClick={() => handleSendEmailLead(lead)}
                            className="bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs flex-1 transition-all shadow-[0_0_12px_rgba(163,230,53,0.25)] cursor-pointer active:scale-98"
                          >
                            <Send className="h-4 w-4" />
                            <span>Enviar Email</span>
                          </button>

                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="bg-neutral-900 border border-neutral-800/80 hover:bg-red-500/20 hover:border-red-500/50 text-neutral-400 hover:text-red-400 p-2.5 rounded-xl transition-all cursor-pointer"
                            title="Excluir Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. PARCEIROS TAB */}
        {activeTab === 'parceiros' && (
          <div className="mt-6">
            {parceiros.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400">
                <Handshake className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                <p className="text-base font-bold text-white">Nenhum parceiro cadastrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {parceiros.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-[#131414] border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-lg font-sans">
                          {item.empresa}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#14532d]/50 border border-[#22c55e]/50 text-[#4ade80] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                            {item.status}
                          </span>
                          <button
                            onClick={() => handleDeleteParceiro(item.id)}
                            className="text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Excluir Parceiro"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-xs my-1 font-medium">
                        Contato: {item.nome}
                      </p>

                      <div className="space-y-2 text-xs text-neutral-400 mt-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <a 
                            href={`mailto:${item.email}?subject=${encodeURIComponent("Parceria Techify - " + item.empresa)}&body=${encodeURIComponent("Olá " + item.nome + ",\n\nEntramos em contato através da Techify em relação à nossa parceria corporativa.\n\nAtenciosamente,\nEquipe Techify\nE-mail oficial: oficialtechify@gmail.com")}`}
                            className="hover:underline truncate text-neutral-300"
                          >
                            {item.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <span>{item.telefone}</span>
                        </div>
                      </div>

                      <div className="bg-[#0c0d0d] p-3 rounded-xl border border-neutral-800/80 my-3 text-xs text-brand-lime">
                        Categoria: {item.categoria}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. NEWSLETTER / E-MAILS TAB */}
        {activeTab === 'newsletter' && (
          <div className="mt-6 space-y-6">
            
            {/* Header Metrics & Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total de Inscritos</p>
                  <p className="text-2xl font-black text-white mt-0.5">{newsletterEmails.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20">
                  <AtSign className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Status da Lista</p>
                  <p className="text-2xl font-black text-emerald-400 mt-0.5">100% Ativos</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Último Cadastro</p>
                  <p className="text-xs font-semibold text-neutral-200 mt-1 truncate max-w-[150px]">
                    {newsletterEmails.length > 0 && newsletterEmails[0].createdAt 
                      ? new Date(newsletterEmails[0].createdAt).toLocaleDateString('pt-BR') 
                      : 'Nenhum ainda'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Search & Export Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121312] border border-neutral-800/80 rounded-2xl p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar por e-mail ou origem..."
                  value={newsletterSearch}
                  onChange={(e) => setNewsletterSearch(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAllNewsletterEmails}
                  disabled={newsletterEmails.length === 0}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    allCopied
                      ? 'border-[#a3e635] bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                      : 'border-neutral-700 bg-neutral-800/80 text-neutral-200 hover:border-[#a3e635] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                  title="Copiar todos os e-mails separados por vírgula"
                >
                  {allCopied ? (
                    <>
                      <CheckCheck className="h-4 w-4 text-black" />
                      <span>Copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-[#a3e635]" />
                      <span>Copiar Todos</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportNewsletterCSV}
                  disabled={newsletterEmails.length === 0}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:border-emerald-500 px-3.5 py-2 text-xs font-bold text-neutral-200 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Baixar lista em formato Excel / CSV"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <span>Exportar CSV</span>
                </button>

                {newsletterEmails.length > 0 && (
                  <a
                    href={`mailto:?bcc=${encodeURIComponent(newsletterEmails.map(i => i.email).join(','))}&subject=${encodeURIComponent("Novidades Exclusivas Techify")}&body=${encodeURIComponent("Olá,\n\nTemos novidades exclusivas para você diretamente da Techify!\n\nAtenciosamente,\nEquipe Techify\noficialtechify@gmail.com")}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] px-4 py-2 text-xs font-black text-black transition-all shadow-[0_0_15px_rgba(163,230,53,0.2)] cursor-pointer"
                    title="Abrir cliente de e-mail com todos os inscritos em Cco"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Disparar Campanha</span>
                  </a>
                )}
              </div>
            </div>

            {/* List / Table of Subscribers */}
            {newsletterEmails.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] p-12 text-center text-neutral-400 shadow-md">
                <Inbox className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
                <p className="text-base font-bold text-white">Nenhum e-mail de newsletter cadastrado ainda</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Quando os visitantes digitarem o e-mail no campo do rodapé e clicarem em "Enviar", eles serão salvos aqui automaticamente em tempo real.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-800 bg-[#121312] overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="border-b border-neutral-800 bg-[#0e0f0e] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      <tr>
                        <th scope="col" className="px-5 py-3.5">E-mail do Assinante</th>
                        <th scope="col" className="px-5 py-3.5">Origem</th>
                        <th scope="col" className="px-5 py-3.5">Data de Inscrição</th>
                        <th scope="col" className="px-5 py-3.5">Status</th>
                        <th scope="col" className="px-5 py-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {newsletterEmails
                        .filter(item => 
                          !newsletterSearch || 
                          item.email.toLowerCase().includes(newsletterSearch.toLowerCase()) ||
                          (item.origem && item.origem.toLowerCase().includes(newsletterSearch.toLowerCase()))
                        )
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-900/50 transition-colors group">
                            <td className="px-5 py-4 font-medium text-white flex items-center gap-2">
                              <Mail className="h-4 w-4 text-[#a3e635] shrink-0" />
                              <span className="font-mono text-xs">{item.email}</span>
                            </td>
                            <td className="px-5 py-4 text-neutral-400">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                                {item.origem || 'Rodapé - Site'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-neutral-400">
                              {item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'N/A'}
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {item.status || 'Ativo'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleCopyEmail(item.email, item.id)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    copiedEmailId === item.id 
                                      ? 'border-[#a3e635] bg-[#a3e635]/20 text-[#a3e635]' 
                                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'
                                  }`}
                                  title="Copiar e-mail"
                                >
                                  {copiedEmailId === item.id ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-[#a3e635]" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                <a
                                  href={`mailto:${item.email}?subject=${encodeURIComponent("Contato Techify")}&body=${encodeURIComponent("Olá,\n\nEntramos em contato através da Techify.\n\nAtenciosamente,\nEquipe Techify\noficialtechify@gmail.com")}`}
                                  className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-[#a3e635] hover:border-neutral-700 transition-all"
                                  title="Enviar e-mail direto"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </a>

                                <button
                                  onClick={() => handleDeleteNewsletter(item.id)}
                                  className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-500 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                                  title="Excluir da lista"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 8. APPS MANAGEMENT TAB */}
        {activeTab === 'apps' && (
          <AdminAppsTab apps={appsList} />
        )}

        {/* 9. PACKAGES / PLANS MANAGEMENT TAB */}
        {activeTab === 'planos' && (
          <AdminPackagesTab />
        )}

        {/* 10. SITE CONTENT & TEAM EDITOR TAB */}
        {activeTab === 'site_editor' && (
          <AdminSiteEditorTab />
        )}

      </div>

      {/* New Lead Modal */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800/80">
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Lead</h3>
              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Nome *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: João Silva"
                  value={newLeadForm.nome}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, nome: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">E-mail *</label>
                  <input
                    required
                    type="email"
                    placeholder="joao@email.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="81999998888"
                    value={newLeadForm.telefone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, telefone: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Instagram</label>
                  <input
                    type="text"
                    placeholder="joao_oficial"
                    value={newLeadForm.instagram}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, instagram: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Segmento</label>
                  <input
                    type="text"
                    placeholder="Roupas, Serviços..."
                    value={newLeadForm.segmento}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, segmento: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Interesses</label>
                <input
                  type="text"
                  placeholder="Logo, Site, E-commerce..."
                  value={newLeadForm.interesses}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, interesses: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="flex-1 rounded-xl border border-neutral-800 py-2.5 text-xs text-neutral-300 hover:bg-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-2.5 text-xs"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Create/Edit Modal in AdminPanel */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-[#121312] p-6 text-white shadow-2xl my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
              <h3 className="text-lg font-bold text-white">
                {editingJobId ? 'Editar Vaga' : 'Publicar Nova Vaga'}
              </h3>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJobAdmin} className="space-y-4 pt-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Título da Vaga *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Engenheiro Frontend Senior"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Categoria / Área</label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
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
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Tipo de Contrato</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3 text-xs text-white focus:border-[#a3e635] focus:outline-none cursor-pointer"
                  >
                    <option value="Tempo Integral">Tempo Integral</option>
                    <option value="Meio Período">Meio Período</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Estágio">Estágio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Localização *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Remoto, São Paulo - SP"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Descrição *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva as responsabilidades da vaga..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Requisitos</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite um requisito"
                    value={jobReqInput}
                    onChange={(e) => setJobReqInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (jobReqInput.trim()) {
                          setJobReqList([...jobReqList, jobReqInput.trim()]);
                          setJobReqInput('');
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (jobReqInput.trim()) {
                        setJobReqList([...jobReqList, jobReqInput.trim()]);
                        setJobReqInput('');
                      }
                    }}
                    className="rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black p-2.5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
                {jobReqList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {jobReqList.map((req, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 px-2.5 py-1 rounded-lg">
                        <span>{req}</span>
                        <button type="button" onClick={() => setJobReqList(jobReqList.filter((_, i) => i !== idx))} className="text-neutral-500 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Benefícios</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite um benefício"
                    value={jobBenInput}
                    onChange={(e) => setJobBenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (jobBenInput.trim()) {
                          setJobBenList([...jobBenList, jobBenInput.trim()]);
                          setJobBenInput('');
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (jobBenInput.trim()) {
                        setJobBenList([...jobBenList, jobBenInput.trim()]);
                        setJobBenInput('');
                      }
                    }}
                    className="rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black p-2.5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
                {jobBenList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {jobBenList.map((ben, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 px-2.5 py-1 rounded-lg">
                        <span>{ben}</span>
                        <button type="button" onClick={() => setJobBenList(jobBenList.filter((_, i) => i !== idx))} className="text-neutral-500 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Faixa Salarial</label>
                <input
                  type="text"
                  placeholder="Ex: R$ 5.000 - R$ 8.000"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="flex-1 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold py-3 text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJobAdmin}
                  className="flex-1 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-3 text-xs transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingJobAdmin 
                    ? (editingJobId ? 'Salvando...' : 'Publicando...') 
                    : (editingJobId ? 'Salvar Alterações' : 'Publicar Vaga')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: APROVAR E CONTRATAR CANDIDATO */}
      {isHireModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121312] border border-neutral-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsHireModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#4ade80]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Contratar Profissional</h3>
                <p className="text-xs text-neutral-400">Aprovar e adicionar ao banco de contratados</p>
              </div>
            </div>

            <div className="bg-[#1a1c1a] border border-neutral-800 rounded-xl p-3 my-4">
              <p className="text-xs font-bold text-white">{selectedCandidate.nome}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{selectedCandidate.email} • Vaga originária: <span className="text-[#a3e635] font-semibold">{selectedCandidate.vaga}</span></p>
            </div>

            <form onSubmit={handleConfirmHire} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nome do Cargo / Função *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Designer UI/UX, Estagiário de Dev, Freelancer..."
                  value={hireForm.cargo}
                  onChange={(e) => setHireForm({ ...hireForm, cargo: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tipo de Contratação *
                </label>
                <select
                  value={hireForm.tipoContratacao}
                  onChange={(e) => setHireForm({ ...hireForm, tipoContratacao: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                >
                  <option value="Estagiário">Estagiário</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="Temporário">Temporário</option>
                  <option value="Trainee">Trainee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Observações / Anotações
                </label>
                <textarea
                  rows={3}
                  placeholder="Anotações internas sobre a contratação..."
                  value={hireForm.observacoes}
                  onChange={(e) => setHireForm({ ...hireForm, observacoes: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsHireModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHire}
                  className="flex-1 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold py-2.5 text-xs transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingHire ? 'Salvando...' : 'Confirmar Contratação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADICIONAR CONTRATADO DIRETO */}
      {isManualHireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121312] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsManualHireModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635]">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Cadastrar Novo Contratado</h3>
                <p className="text-xs text-neutral-400">Adicione um estagiário, freelancer ou funcionário diretamente</p>
              </div>
            </div>

            <form onSubmit={handleConfirmManualHire} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do profissional"
                  value={manualHireForm.nome}
                  onChange={(e) => setManualHireForm({ ...manualHireForm, nome: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Cargo / Função *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Designer UI/UX"
                    value={manualHireForm.cargo}
                    onChange={(e) => setManualHireForm({ ...manualHireForm, cargo: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Tipo de Contratação *
                  </label>
                  <select
                    value={manualHireForm.tipoContratacao}
                    onChange={(e) => setManualHireForm({ ...manualHireForm, tipoContratacao: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                  >
                    <option value="Estagiário">Estagiário</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Temporário">Temporário</option>
                    <option value="Trainee">Trainee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={manualHireForm.email}
                    onChange={(e) => setManualHireForm({ ...manualHireForm, email: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="81999998888"
                    value={manualHireForm.telefone}
                    onChange={(e) => setManualHireForm({ ...manualHireForm, telefone: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/perfil"
                    value={manualHireForm.linkedin}
                    onChange={(e) => setManualHireForm({ ...manualHireForm, linkedin: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Instagram</label>
                  <input
                    type="text"
                    placeholder="@usuario"
                    value={manualHireForm.instagram}
                    onChange={(e) => setManualHireForm({ ...manualHireForm, instagram: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Anotações / Resumo</label>
                <textarea
                  rows={2}
                  placeholder="Anotações e detalhes adicionais..."
                  value={manualHireForm.resumo}
                  onChange={(e) => setManualHireForm({ ...manualHireForm, resumo: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] py-2.5 px-3.5 text-xs text-white placeholder-neutral-600 focus:border-[#a3e635] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualHireModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold py-2.5 text-xs transition-colors shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer"
                >
                  Cadastrar no Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURGE / RESET CONFIRMATION MODAL */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#121312] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">Limpar Dados de Demonstração</h3>
                  <p className="text-[11px] text-neutral-400">Preparar o sistema para usuários reais</p>
                </div>
              </div>
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-neutral-300">
              <p className="leading-relaxed">
                Esta ação irá <strong className="text-white">excluir todos os registros de teste e demonstração</strong> salvos no banco de dados, incluindo:
              </p>
              
              <ul className="space-y-1.5 pl-3 border-l-2 border-amber-500/50 text-neutral-400">
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Consultas e Agendamentos de teste</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Leads e Diagnósticos simulados</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Candidaturas de teste</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Parceiros de demonstração</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Vagas de teste antigas</span>
                </li>
              </ul>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300">
                ✨ Após a limpeza, o sistema ficará 100% pronto para receber clientes, agendamentos e candidaturas de verdade através do site.
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex gap-2.5">
              <button
                type="button"
                disabled={isPurging}
                onClick={() => setIsPurgeModalOpen(false)}
                className="flex-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handlePurgeAllMockData}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 text-xs transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Limpando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Limpar Tudo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
