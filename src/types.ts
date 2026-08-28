export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  tags: string[];
  certified: boolean;
  liveUrl?: string;
  demoId?: string;
}

export interface Service {
  id: string;
  title: string;
  iconName: string;
  description: string;
  color: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: {
    text: string;
    type: 'free' | 'languages' | 'primary' | 'success';
  };
  duration: string;
  lessonsCount: number;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  salary?: string;
  requirements: string[];
  benefits?: string[];
  createdAt?: string;
}

export interface Consultation {
  name: string;
  email: string;
  whatsapp: string;
  service: string;
  date: string;
  time: string;
  details?: string;
}

export interface TechifyApp {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  category: string;
  status?: 'ativo' | 'beta' | 'em-breve';
  tags?: string[];
  featured?: boolean;
  createdAt?: string;
}

export interface DiagnosticoLead {
  id?: string;
  opcaoId: 'sem_site' | 'sem_sistema' | 'sem_anuncio' | 'todos_3';
  opcaoTitulo: string;
  problema: string;
  solucaoResumo: string;
  nome?: string;
  whatsapp?: string;
  email?: string;
  status: 'Novo' | 'Em Atendimento' | 'Concluído';
  data: string;
  createdAt: string;
  userAgent?: string;
}

