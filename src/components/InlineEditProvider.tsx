import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Pencil, 
  Upload, 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  Shield, 
  Rocket, 
  Target, 
  TrendingUp, 
  Code, 
  Globe, 
  Users, 
  Award, 
  CheckCircle2, 
  Flame, 
  Star, 
  Cpu, 
  Smartphone, 
  Layers, 
  Lock, 
  Compass, 
  Heart, 
  Monitor, 
  Layout, 
  FileCode, 
  BarChart3, 
  Database, 
  Headphones, 
  MessageSquare, 
  Clock, 
  ArrowUpRight, 
  Search,
  Camera,
  Hash,
  Type
} from 'lucide-react';
import { useAdminAuth } from '../lib/adminAuth';
import { 
  InlineOverrides, 
  getCachedInlineOverrides, 
  initInlineOverridesListener,
  saveInlineText,
  saveInlineNumber,
  saveInlineIcon,
  saveInlineImage
} from '../lib/inlineEditorStore';
import { compressImageFile } from '../lib/imageUtils';
import { toast } from './Toast';

export const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Zap,
  Shield,
  Rocket,
  Target,
  TrendingUp,
  Code,
  Globe,
  Users,
  Award,
  CheckCircle2,
  Flame,
  Star,
  Cpu,
  Smartphone,
  Layers,
  Lock,
  Compass,
  Heart,
  Monitor,
  Layout,
  FileCode,
  BarChart3,
  Database,
  Headphones,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Search
};

interface InlineEditContextType {
  overrides: InlineOverrides;
  isAdmin: boolean;
  openTextEditor: (id: string, currentText: string, title?: string, isMultiline?: boolean) => void;
  openNumberEditor: (id: string, currentVal: number | string, prefix?: string, suffix?: string, label?: string) => void;
  openIconEditor: (id: string, currentIconName: string, title?: string) => void;
  openImageEditor: (id: string, currentImageUrl: string, title?: string) => void;
}

const InlineEditContext = createContext<InlineEditContextType | null>(null);

export function useInlineEdit() {
  const ctx = useContext(InlineEditContext);
  if (!ctx) {
    return {
      overrides: { texts: {}, numbers: {}, icons: {}, images: {} },
      isAdmin: false,
      openTextEditor: () => {},
      openNumberEditor: () => {},
      openIconEditor: () => {},
      openImageEditor: () => {}
    };
  }
  return ctx;
}

export function InlineEditProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdminAuth();
  const [overrides, setOverrides] = useState<InlineOverrides>(getCachedInlineOverrides);

  // Active Modals state
  const [textModal, setTextModal] = useState<{ isOpen: boolean; id: string; text: string; title?: string; isMultiline?: boolean }>({
    isOpen: false,
    id: '',
    text: '',
    title: '',
    isMultiline: false
  });

  const [numberModal, setNumberModal] = useState<{ isOpen: boolean; id: string; value: string; prefix: string; suffix: string; label: string }>({
    isOpen: false,
    id: '',
    value: '',
    prefix: '',
    suffix: '',
    label: ''
  });

  const [iconModal, setIconModal] = useState<{ isOpen: boolean; id: string; currentIcon: string; title?: string; search: string }>({
    isOpen: false,
    id: '',
    currentIcon: 'Sparkles',
    title: '',
    search: ''
  });

  const [imageModal, setImageModal] = useState<{ isOpen: boolean; id: string; currentUrl: string; title?: string; isUploading: boolean }>({
    isOpen: false,
    id: '',
    currentUrl: '',
    title: '',
    isUploading: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = initInlineOverridesListener((newOverrides) => {
      setOverrides({ ...newOverrides });
    });
    return () => unsub();
  }, []);

  const openTextEditor = (id: string, currentText: string, title?: string, isMultiline?: boolean) => {
    const actualText = overrides.texts[id] ?? currentText;
    setTextModal({
      isOpen: true,
      id,
      text: actualText,
      title: title || 'Editar Texto',
      isMultiline: isMultiline ?? (actualText.length > 60 || actualText.includes('\n'))
    });
  };

  const openNumberEditor = (id: string, currentVal: number | string, prefix = '', suffix = '', label = '') => {
    const stored = overrides.numbers[id];
    setNumberModal({
      isOpen: true,
      id,
      value: String(stored?.value ?? currentVal),
      prefix: stored?.prefix ?? prefix,
      suffix: stored?.suffix ?? suffix,
      label: stored?.label ?? label
    });
  };

  const openIconEditor = (id: string, currentIconName: string, title?: string) => {
    const actualIcon = overrides.icons[id] ?? currentIconName;
    setIconModal({
      isOpen: true,
      id,
      currentIcon: actualIcon,
      title: title || 'Selecionar Ícone',
      search: ''
    });
  };

  const openImageEditor = (id: string, currentImageUrl: string, title?: string) => {
    const actualUrl = overrides.images[id] ?? currentImageUrl;
    setImageModal({
      isOpen: true,
      id,
      currentUrl: actualUrl,
      title: title || 'Trocar Imagem',
      isUploading: false
    });
  };

  // Handlers for saving
  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textModal.id) return;
    await saveInlineText(textModal.id, textModal.text);
    setTextModal(prev => ({ ...prev, isOpen: false }));
    toast.success('Texto Salvo', 'O conteúdo foi atualizado e sincronizado em tempo real.');
  };

  const handleSaveNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numberModal.id) return;
    await saveInlineNumber(numberModal.id, {
      value: numberModal.value,
      prefix: numberModal.prefix,
      suffix: numberModal.suffix,
      label: numberModal.label
    });
    setNumberModal(prev => ({ ...prev, isOpen: false }));
    toast.success('Métrica Atualizada', 'O contador e rótulo foram gravados com sucesso.');
  };

  const handleSelectIcon = async (iconName: string) => {
    if (!iconModal.id) return;
    await saveInlineIcon(iconModal.id, iconName);
    setIconModal(prev => ({ ...prev, isOpen: false }));
    toast.success('Ícone Alterado', `O ícone foi atualizado para "${iconName}".`);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageModal.id) return;
    setImageModal(prev => ({ ...prev, isUploading: true }));
    try {
      const base64 = await compressImageFile(file, 1200, 1200, 0.85);
      setImageModal(prev => ({ ...prev, currentUrl: base64, isUploading: false }));
      toast.info('Imagem Carregada', 'Prévia pronta. Clique em "Salvar Imagem" para publicar.');
    } catch (err) {
      console.error(err);
      setImageModal(prev => ({ ...prev, isUploading: false }));
      toast.error('Erro ao Carregar', 'Não foi possível processar o arquivo de imagem selecionado.');
    }
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageModal.id || !imageModal.currentUrl) return;
    await saveInlineImage(imageModal.id, imageModal.currentUrl);
    setImageModal(prev => ({ ...prev, isOpen: false }));
    toast.success('Imagem Salva', 'A nova imagem de exibição foi gravada com sucesso.');
  };

  return (
    <InlineEditContext.Provider value={{
      overrides,
      isAdmin,
      openTextEditor,
      openNumberEditor,
      openIconEditor,
      openImageEditor
    }}>
      {children}

      {/* 1. TEXT EDIT MODAL */}
      {textModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#111411] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center">
                  <Type className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  {textModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setTextModal(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveText} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Conteúdo do Texto
                </label>
                {textModal.isMultiline ? (
                  <textarea
                    rows={4}
                    value={textModal.text}
                    onChange={(e) => setTextModal(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm text-white focus:border-[#a3e635] focus:outline-none leading-relaxed"
                    placeholder="Digite o texto..."
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={textModal.text}
                    onChange={(e) => setTextModal(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm text-white focus:border-[#a3e635] focus:outline-none"
                    placeholder="Digite o texto..."
                    autoFocus
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                <span className="text-[11px] text-neutral-500">ID: {textModal.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTextModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salvar Texto</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. NUMBER / STATS EDIT MODAL */}
      {numberModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-[#111411] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center">
                  <Hash className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  Editar Métrica & Número
                </h3>
              </div>
              <button 
                onClick={() => setNumberModal(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNumber} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Prefixo (Ex: + ou R$)</label>
                  <input
                    type="text"
                    value={numberModal.prefix}
                    onChange={(e) => setNumberModal(prev => ({ ...prev, prefix: e.target.value }))}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white focus:border-[#a3e635] focus:outline-none text-center"
                    placeholder="+"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Valor *</label>
                  <input
                    type="text"
                    required
                    value={numberModal.value}
                    onChange={(e) => setNumberModal(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm font-bold text-[#a3e635] focus:border-[#a3e635] focus:outline-none text-center"
                    placeholder="150"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Sufixo (Ex: % ou M)</label>
                  <input
                    type="text"
                    value={numberModal.suffix}
                    onChange={(e) => setNumberModal(prev => ({ ...prev, suffix: e.target.value }))}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white focus:border-[#a3e635] focus:outline-none text-center"
                    placeholder="%"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Descrição / Rótulo da Métrica</label>
                <input
                  type="text"
                  value={numberModal.label}
                  onChange={(e) => setNumberModal(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm text-white focus:border-[#a3e635] focus:outline-none"
                  placeholder="Ex: Projetos entregues com sucesso"
                />
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-neutral-800 bg-black/40 p-4 text-center">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold block mb-1">Prévia do Número:</span>
                <div className="text-3xl font-black text-white">
                  <span className="text-neutral-400">{numberModal.prefix}</span>
                  <span className="text-[#a3e635]">{numberModal.value || '0'}</span>
                  <span className="text-[#a3e635]">{numberModal.suffix}</span>
                </div>
                {numberModal.label && (
                  <p className="text-xs text-neutral-400 mt-1">{numberModal.label}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setNumberModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Salvar Métrica</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ICON PICKER MODAL */}
      {iconModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#111411] p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  {iconModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setIconModal(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="mt-3 relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Pesquisar ícone por nome..."
                value={iconModal.search}
                onChange={(e) => setIconModal(prev => ({ ...prev, search: e.target.value }))}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 pl-9 pr-4 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                autoFocus
              />
            </div>

            {/* Icon Grid */}
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2.5 overflow-y-auto pr-1 py-1 flex-1">
              {Object.keys(ICON_MAP)
                .filter(name => name.toLowerCase().includes(iconModal.search.toLowerCase()))
                .map((name) => {
                  const IconComp = ICON_MAP[name];
                  const isSelected = iconModal.currentIcon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectIcon(name)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#a3e635]/20 border-[#a3e635] text-[#a3e635] shadow-[0_0_10px_rgba(163,230,53,0.3)]' 
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-800'
                      }`}
                    >
                      <IconComp className="h-6 w-6" />
                      <span className="text-[10px] font-semibold truncate w-full text-center">{name}</span>
                    </button>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-neutral-500">Ícone atual: <b>{iconModal.currentIcon}</b></span>
              <button
                type="button"
                onClick={() => setIconModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-1.5 rounded-xl border border-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. IMAGE UPLOAD & CHANGER MODAL */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#111411] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center">
                  <Camera className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  {imageModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImage} className="mt-4 flex flex-col gap-4">
              {/* Preview */}
              <div className="relative h-48 w-full rounded-xl bg-neutral-900 border-2 border-dashed border-neutral-700 overflow-hidden flex items-center justify-center group">
                {imageModal.currentUrl ? (
                  <img 
                    src={imageModal.currentUrl} 
                    alt="Preview" 
                    className="h-full w-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">Nenhuma imagem selecionada</p>
                  </div>
                )}

                {imageModal.isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#a3e635] animate-pulse">Compactando e processando foto...</span>
                  </div>
                )}
              </div>

              {/* Upload file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileUpload}
              />

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageModal.isUploading}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Escolher do Computador</span>
                </button>

                <span className="text-xs text-neutral-500 font-bold">OU</span>

                <input
                  type="url"
                  placeholder="Colar URL da Imagem..."
                  value={imageModal.currentUrl}
                  onChange={(e) => setImageModal(prev => ({ ...prev, currentUrl: e.target.value }))}
                  className="w-full sm:w-1/2 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white focus:border-[#a3e635] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!imageModal.currentUrl}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>Salvar Imagem</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </InlineEditContext.Provider>
  );
}

// -------------------------------------------------------------
// CONVENIENCE INLINE EDITABLE COMPONENTS
// -------------------------------------------------------------

export function EditableText({
  id,
  defaultText,
  className = '',
  title,
  isMultiline,
  as: Component = 'span'
}: {
  id: string;
  defaultText: string;
  className?: string;
  title?: string;
  isMultiline?: boolean;
  as?: any;
}) {
  const { overrides, isAdmin, openTextEditor } = useInlineEdit();
  const text = overrides.texts[id] ?? defaultText;

  if (!isAdmin) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <span className="relative group/edit inline-flex items-center flex-wrap gap-1">
      <Component className={className}>{text}</Component>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openTextEditor(id, defaultText, title, isMultiline);
        }}
        className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-[#a3e635]/90 hover:bg-[#a3e635] text-black shadow-[0_0_8px_rgba(163,230,53,0.6)] cursor-pointer transition-transform hover:scale-110 ml-1 shrink-0 z-10"
        title={`Editar: ${title || defaultText}`}
      >
        <Pencil className="h-2.5 w-2.5 stroke-[2.5]" />
      </button>
    </span>
  );
}

export function EditableNumber({
  id,
  defaultValue,
  defaultPrefix = '',
  defaultSuffix = '',
  defaultLabel = '',
  className = ''
}: {
  id: string;
  defaultValue: number | string;
  defaultPrefix?: string;
  defaultSuffix?: string;
  defaultLabel?: string;
  className?: string;
}) {
  const { overrides, isAdmin, openNumberEditor } = useInlineEdit();
  const stored = overrides.numbers[id];
  const value = stored?.value ?? defaultValue;
  const prefix = stored?.prefix ?? defaultPrefix;
  const suffix = stored?.suffix ?? defaultSuffix;
  const label = stored?.label ?? defaultLabel;

  if (!isAdmin) {
    return (
      <div className={className}>
        <div className="flex items-baseline text-4xl sm:text-5xl font-black text-white tracking-tight">
          {prefix && <span className="text-neutral-400 mr-0.5">{prefix}</span>}
          <span>{value}</span>
          {suffix && <span className="text-[#a3e635] ml-0.5">{suffix}</span>}
        </div>
        {label && <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-400 leading-snug">{label}</p>}
      </div>
    );
  }

  return (
    <div className={`relative group/edit ${className}`}>
      <div className="flex items-baseline text-4xl sm:text-5xl font-black text-white tracking-tight">
        {prefix && <span className="text-neutral-400 mr-0.5">{prefix}</span>}
        <span>{value}</span>
        {suffix && <span className="text-[#a3e635] ml-0.5">{suffix}</span>}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openNumberEditor(id, defaultValue, defaultPrefix, defaultSuffix, defaultLabel);
          }}
          className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-lg bg-[#a3e635] text-black shadow-[0_0_8px_rgba(163,230,53,0.6)] cursor-pointer hover:scale-110 transition-transform"
          title="Editar Métrica/Número"
        >
          <Pencil className="h-3 w-3 stroke-[2.5]" />
        </button>
      </div>
      {label && <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-400 leading-snug">{label}</p>}
    </div>
  );
}

export function EditableIcon({
  id,
  defaultIcon: DefaultIcon,
  defaultName = 'Sparkles',
  className = 'h-5 w-5 text-[#a3e635]',
  title
}: {
  id: string;
  defaultIcon?: React.ElementType;
  defaultName?: string;
  className?: string;
  title?: string;
}) {
  const { overrides, isAdmin, openIconEditor } = useInlineEdit();
  const iconName = overrides.icons[id] ?? defaultName;
  const ResolvedIcon = ICON_MAP[iconName] || DefaultIcon || Sparkles;

  if (!isAdmin) {
    return <ResolvedIcon className={className} />;
  }

  return (
    <span className="relative group/icon inline-flex items-center">
      <ResolvedIcon className={className} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openIconEditor(id, iconName, title);
        }}
        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#a3e635] text-black flex items-center justify-center shadow-md cursor-pointer hover:scale-125 transition-transform z-10"
        title="Trocar Ícone"
      >
        <Pencil className="h-2 w-2 stroke-[2.5]" />
      </button>
    </span>
  );
}

export function EditableImage({
  id,
  defaultSrc,
  alt = 'Image',
  className = 'h-full w-full object-cover',
  title
}: {
  id: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
  title?: string;
}) {
  const { overrides, isAdmin, openImageEditor } = useInlineEdit();
  const src = overrides.images[id] ?? defaultSrc;

  if (!isAdmin) {
    return <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />;
  }

  return (
    <div className="relative group/img h-full w-full">
      <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openImageEditor(id, defaultSrc, title);
        }}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 hover:bg-[#a3e635] text-white hover:text-black border border-[#a3e635]/60 text-[10px] font-bold backdrop-blur-sm shadow-lg cursor-pointer transition-all hover:scale-105 z-10"
        title="Trocar Imagem"
      >
        <Camera className="h-3 w-3" />
        <span>Mudar</span>
      </button>
    </div>
  );
}
