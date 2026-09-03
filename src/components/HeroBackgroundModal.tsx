import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  Layers,
  Grid,
  Link2,
  Trash2,
  Maximize2
} from 'lucide-react';
import { HomeHeroData } from '../lib/homeContent';
import { compressImageFile } from '../lib/imageUtils';
import { toast } from './Toast';

interface HeroBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroData: HomeHeroData;
  onSaveBackground: (updatedBgSettings: Partial<HomeHeroData>) => Promise<void>;
}

// Preset backgrounds (sem presets padrão forçados)
const PRESET_BACKGROUNDS = [
  {
    id: 'cyber-video-cinematic',
    title: 'Vídeo Cyber Cinematográfico',
    type: 'video' as const,
    url: 'https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/cinematic.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    badge: 'Vídeo Dinâmico',
    brightness: 80,
    opacity: 40,
    blur: 0
  },
  {
    id: 'neon-matrix-grid',
    title: 'Tech Grid Neon Dark',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    badge: 'Matrix Tech',
    brightness: 90,
    opacity: 20,
    blur: 0
  },
  {
    id: 'deep-space-luxury',
    title: 'Deep Abstract Green & Black',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    badge: 'Minimalista',
    brightness: 90,
    opacity: 20,
    blur: 0
  }
];

export default function HeroBackgroundModal({
  isOpen,
  onClose,
  heroData,
  onSaveBackground
}: HeroBackgroundModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [bgType, setBgType] = useState<'image' | 'video' | 'default'>(heroData.backgroundType || 'image');
  const [imageUrl, setImageUrl] = useState<string>(heroData.backgroundImageUrl || '');
  const [videoUrl, setVideoUrl] = useState<string>(heroData.videoUrl || '');
  
  const [brightness, setBrightness] = useState<number>(heroData.backgroundBrightness ?? 100);
  const [darkOpacity, setDarkOpacity] = useState<number>(heroData.backgroundOpacity ?? 0);
  const [blurAmount, setBlurAmount] = useState<number>(heroData.backgroundBlur ?? 0);
  const [showGrid, setShowGrid] = useState<boolean>(heroData.showGridEffect ?? false);

  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Sync state whenever modal opens or heroData changes
  useEffect(() => {
    if (isOpen) {
      setBgType(heroData.backgroundType || 'image');
      setImageUrl(heroData.backgroundImageUrl || '');
      setVideoUrl(heroData.videoUrl || '');
      setBrightness(heroData.backgroundBrightness ?? 100);
      setDarkOpacity(heroData.backgroundOpacity ?? 0);
      setBlurAmount(heroData.backgroundBlur ?? 0);
      setShowGrid(heroData.showGridEffect ?? false);
    }
  }, [isOpen, heroData]);

  // Compress & read image file and apply immediately
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Formato Inválido', 'Por favor envie uma imagem (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingFile(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1920, 1080, 0.85);
      setImageUrl(compressedDataUrl);
      setBgType('image');
      setBrightness(100);
      setDarkOpacity(0);
      setBlurAmount(0);

      // Auto-apply immediately to the page!
      await onSaveBackground({
        backgroundImageUrl: compressedDataUrl,
        backgroundType: 'image',
        backgroundBrightness: 100,
        backgroundOpacity: 0,
        backgroundBlur: 0
      });
      toast.success('Imagem Aplicada no Fundo!', 'Sua imagem foi definida e já está visível na tela inicial.');
    } catch (err) {
      console.error(err);
      toast.error('Erro de Leitura', 'Não foi possível ler a imagem selecionada.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSelectPreset = async (preset: typeof PRESET_BACKGROUNDS[0]) => {
    setBgType(preset.type);
    let newImg = imageUrl;
    let newVid = videoUrl;
    if (preset.type === 'image') {
      newImg = preset.url;
      setImageUrl(preset.url);
    } else {
      newVid = preset.url;
      setVideoUrl(preset.url);
    }
    setBrightness(preset.brightness);
    setDarkOpacity(preset.opacity);
    setBlurAmount(preset.blur);

    await onSaveBackground({
      backgroundImageUrl: newImg,
      videoUrl: newVid,
      backgroundType: preset.type,
      backgroundBrightness: preset.brightness,
      backgroundOpacity: preset.opacity,
      backgroundBlur: preset.blur
    });
    toast.info('Preset Aplicado', preset.title);
  };

  const handleResetSliders = () => {
    setBrightness(100);
    setDarkOpacity(0);
    setBlurAmount(0);
    setShowGrid(false);
  };

  const handleClearBackground = async () => {
    setImageUrl('');
    setVideoUrl('');
    setBgType('image');
    setBrightness(100);
    setDarkOpacity(0);
    setBlurAmount(0);
    setShowGrid(false);
    await onSaveBackground({
      backgroundImageUrl: '',
      backgroundType: 'image',
      videoUrl: '',
      backgroundBrightness: 100,
      backgroundOpacity: 0,
      backgroundBlur: 0,
      showGridEffect: false
    });
    toast.info('Fundo Removido', 'Todos os fundos foram limpos. A tela está com fundo neutro.');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveBackground({
        backgroundImageUrl: imageUrl,
        videoUrl: videoUrl,
        backgroundType: bgType,
        backgroundBrightness: brightness,
        backgroundOpacity: darkOpacity,
        backgroundBlur: blurAmount,
        showGridEffect: showGrid
      });
      toast.success('Fundo Salvo com Sucesso!', 'As alterações foram publicadas e sincronizadas no site.');
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao Salvar', 'Não foi possível salvar a imagem de fundo.');
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-800 bg-[#0c100c] p-5 sm:p-7 text-white shadow-[0_0_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto custom-scrollbar"
          >
            {/* Ambient neon light */}
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#22c55e]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#a3e635]/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#4ade80]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-black text-white">
                    Personalizar Fundo do Hero (Página Inicial)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Faça upload da sua própria imagem, use URL ou escolha um preset
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="mb-6 rounded-2xl border border-neutral-800 bg-black/60 p-3">
              <div className="flex items-center justify-between mb-2 px-1 text-xs">
                <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-[#22c55e]" /> Pré-visualização em Tempo Real
                </span>
                <span className="text-[11px] text-neutral-400">
                  {bgType === 'video' && videoUrl ? 'Vídeo em reprodução' : imageUrl ? 'Imagem Ativa' : 'Fundo Limpo (Sem Imagem)'}
                </span>
              </div>

              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-neutral-800 bg-[#070b07] flex items-center justify-center text-center">
                {/* Background visual */}
                {bgType === 'video' && videoUrl ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{
                      filter: `brightness(${brightness}%) blur(${blurAmount}px)`,
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover object-center transition-all duration-200"
                    style={{
                      filter: `brightness(${brightness}%) blur(${blurAmount}px)`,
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                    <div className="h-12 w-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-2 text-neutral-600">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-neutral-300">Nenhum fundo definido</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Faça upload de uma imagem abaixo para aplicar imediatamente</p>
                  </div>
                )}

                {/* Overlays (only if image/video exists) */}
                {(imageUrl || (bgType === 'video' && videoUrl)) && (
                  <>
                    <div 
                      className="absolute inset-0 bg-black transition-opacity duration-200 pointer-events-none"
                      style={{ opacity: darkOpacity / 100 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black pointer-events-none" />
                  </>
                )}

                {/* Optional Grid */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #22c55e 1px, transparent 1px), linear-gradient(to bottom, #22c55e 1px, transparent 1px)',
                      backgroundSize: '24px 24px'
                    }}
                  />
                )}

                {/* Clean preview indicator */}
                {imageUrl && (
                  <div className="relative z-10 p-6 max-w-sm mx-auto flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 border border-white/10 text-xs font-bold text-neutral-200 backdrop-blur-md shadow-lg">
                      <Eye className="h-3.5 w-3.5 text-[#22c55e]" /> 
                      <span>Imagem Carregada</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800/80 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#22c55e] text-black shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload de Arquivo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-[#22c55e] text-black shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Link / URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-[#22c55e] text-black shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Modelos Prontos</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. UPLOAD */}
            {activeTab === 'upload' && (
              <div className="space-y-4 mb-6 animate-in fade-in duration-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      processImageFile(file);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all group ${
                    isDraggingOver
                      ? 'border-[#22c55e] bg-[#22c55e]/15 scale-[1.02]'
                      : 'border-neutral-700 hover:border-[#22c55e] bg-neutral-900/50 hover:bg-neutral-900/90'
                  }`}
                >
                  <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] group-hover:scale-110 transition-transform">
                    {isProcessingFile ? (
                      <div className="h-5 w-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    {isDraggingOver ? 'Solte a imagem aqui para aplicar' : 'Clique ou arraste sua imagem do computador ou celular'}
                  </h4>
                  <p className="text-xs text-neutral-400 mb-2">
                    Suporta PNG, JPG, WebP de alta qualidade (otimização automática)
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-[10px] font-semibold text-neutral-300 border border-neutral-700">
                    Resolução recomendada: 1920x1080
                  </span>
                </div>

                {imageUrl && (
                  <div className="flex items-center justify-between rounded-xl bg-neutral-900/80 border border-neutral-800 p-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img src={imageUrl} alt="Thumbnail" className="h-10 w-10 rounded-lg object-cover border border-neutral-700" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">Imagem Personalizada Carregada</span>
                        <span className="text-[10px] text-[#4ade80]">Pronta para aplicar</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearBackground}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
                      title="Remover fundo atual"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. URL */}
            {activeTab === 'url' && (
              <div className="space-y-4 mb-6 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Tipo de Mídia
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBgType('image')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        bgType === 'image'
                          ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80]'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Imagem Estática</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgType('video')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        bgType === 'video'
                          ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80]'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Vídeo MP4 (.mp4)</span>
                    </button>
                  </div>
                </div>

                {bgType === 'image' ? (
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      URL Direta da Imagem
                    </label>
                    <input
                      type="url"
                      placeholder="https://exemplo.com/minha-imagem-fundo.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 px-3.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Dica: Você pode usar imagens do Unsplash, Imgur, Supabase, Cloudinary, etc.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      URL Direta do Vídeo MP4
                    </label>
                    <input
                      type="url"
                      placeholder="https://exemplo.com/background.mp4"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 px-3.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. PRESETS */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 animate-in fade-in duration-200">
                {PRESET_BACKGROUNDS.map((preset) => {
                  const isSelected = 
                    preset.type === 'image' && (!preset.url ? !imageUrl : imageUrl === preset.url) ||
                    preset.type === 'video' && videoUrl === preset.url && bgType === 'video';

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative rounded-2xl overflow-hidden border p-3 cursor-pointer transition-all group ${
                        isSelected
                          ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                          : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                      }`}
                    >
                      <div className="relative h-24 w-full rounded-xl overflow-hidden mb-2 bg-black">
                        <img
                          src={preset.thumbnail}
                          alt={preset.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white backdrop-blur-sm border border-white/10">
                          {preset.badge}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-[#22c55e] text-black flex items-center justify-center shadow-lg">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-white">{preset.title}</h5>
                    </div>
                  );
                })}
              </div>
            )}

            {/* FINE-TUNING SLIDERS */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-4 space-y-3.5 mb-6">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#22c55e]" /> Ajustes Finos de Iluminação & Contraste
                </span>
                <button
                  type="button"
                  onClick={handleResetSliders}
                  className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Restaurar Ajustes
                </button>
              </div>

              {/* 1. Brightness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Brilho da Imagem:</span>
                  <span className="font-bold text-white">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={130}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
              </div>

              {/* 2. Dark Overlay Opacity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Escurecimento de Fundo (Legibilidade do Texto):</span>
                  <span className="font-bold text-white">{darkOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={darkOpacity}
                  onChange={(e) => setDarkOpacity(Number(e.target.value))}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
              </div>

              {/* 3. Blur */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Desfoque Suave (Blur):</span>
                  <span className="font-bold text-white">{blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={16}
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(Number(e.target.value))}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
              </div>

              {/* 4. Grid Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-300">Efeito de Grade Digital Holográfica</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    showGrid ? 'bg-[#22c55e]' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-black transition-transform absolute top-0.5 ${
                      showGrid ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={handleClearBackground}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer"
                title="Limpar todos os fundos e deixar a tela limpa"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Limpar / Remover Fundo</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#84cc16] via-[#22c55e] to-[#10b981] hover:brightness-110 text-black font-black text-xs transition-all shadow-[0_0_20px_rgba(34,197,94,0.35)] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Confirmar & Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
