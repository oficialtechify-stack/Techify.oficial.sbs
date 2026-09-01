import React, { useState, useRef } from 'react';
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
import heroBgOriginalLogo from '../assets/images/techify_logo_original_1786362412096.jpg';
import { toast } from './Toast';

interface HeroBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroData: HomeHeroData;
  onSaveBackground: (updatedBgSettings: Partial<HomeHeroData>) => Promise<void>;
}

// Preset backgrounds
const PRESET_BACKGROUNDS = [
  {
    id: 'original-logo-3d',
    title: 'Logo 3D Techify Metálico (Oficial)',
    type: 'image' as const,
    url: '', // empty means original asset heroBgOriginalLogo
    thumbnail: heroBgOriginalLogo,
    badge: 'Oficial Techify',
    brightness: 75,
    opacity: 65,
    blur: 0
  },
  {
    id: 'cyber-video-cinematic',
    title: 'Vídeo Cyber Cinematográfico',
    type: 'video' as const,
    url: 'https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/cinematic.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    badge: 'Vídeo Dinâmico',
    brightness: 80,
    opacity: 70,
    blur: 0
  },
  {
    id: 'neon-matrix-grid',
    title: 'Tech Grid Neon Dark',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    badge: 'Matrix Tech',
    brightness: 60,
    opacity: 80,
    blur: 0
  },
  {
    id: 'deep-space-luxury',
    title: 'Deep Abstract Green & Black',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    badge: 'Minimalista',
    brightness: 70,
    opacity: 75,
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
  const [videoUrl, setVideoUrl] = useState<string>(heroData.videoUrl || 'https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/cinematic.mp4');
  
  const [brightness, setBrightness] = useState<number>(heroData.backgroundBrightness ?? 75);
  const [darkOpacity, setDarkOpacity] = useState<number>(heroData.backgroundOpacity ?? 65);
  const [blurAmount, setBlurAmount] = useState<number>(heroData.backgroundBlur ?? 0);
  const [showGrid, setShowGrid] = useState<boolean>(heroData.showGridEffect ?? false);

  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Compress & read image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Formato Inválido', 'Por favor envie uma imagem (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        setIsProcessingFile(false);
        return;
      }

      // Create image in memory to downscale if larger than 1920px for optimal performance
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setImageUrl(compressedDataUrl);
          setBgType('image');
          toast.success('Imagem Carregada!', 'A imagem foi importada com sucesso.');
        } else {
          setImageUrl(src);
          setBgType('image');
        }
        setIsProcessingFile(false);
      };
      img.onerror = () => {
        setImageUrl(src);
        setBgType('image');
        setIsProcessingFile(false);
      };
      img.src = src;
    };

    reader.onerror = () => {
      toast.error('Erro de Leitura', 'Não foi possível ler a imagem selecionada.');
      setIsProcessingFile(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_BACKGROUNDS[0]) => {
    setBgType(preset.type);
    if (preset.type === 'image') {
      setImageUrl(preset.url);
    } else {
      setVideoUrl(preset.url);
    }
    setBrightness(preset.brightness);
    setDarkOpacity(preset.opacity);
    setBlurAmount(preset.blur);
    toast.info('Preset Selecionado', preset.title);
  };

  const handleResetToDefault = () => {
    setImageUrl('');
    setBgType('image');
    setBrightness(75);
    setDarkOpacity(65);
    setBlurAmount(0);
    setShowGrid(false);
    toast.info('Fundo Restaurado', 'Restaurado para o Logo 3D Oficial Techify.');
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

  // Preview URL to render
  const currentPreviewImage = imageUrl || heroBgOriginalLogo;

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
                  {bgType === 'video' ? 'Vídeo em reprodução' : imageUrl ? 'Imagem Personalizada' : 'Logo 3D Oficial'}
                </span>
              </div>

              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center text-center">
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
                ) : (
                  <img
                    src={currentPreviewImage}
                    alt="Hero Preview"
                    className="w-full h-full object-cover object-center transition-all duration-200"
                    style={{
                      filter: `brightness(${brightness}%) blur(${blurAmount}px)`,
                    }}
                  />
                )}

                {/* Overlays */}
                <div 
                  className="absolute inset-0 bg-black transition-opacity duration-200 pointer-events-none"
                  style={{ opacity: darkOpacity / 100 }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black pointer-events-none" />

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

                {/* Simulated text on top */}
                <div className="relative z-10 p-4 max-w-sm mx-auto">
                  <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest block mb-1">
                    {heroData.eyebrow || 'A Solução Definitiva'}
                  </span>
                  <h4 className="font-display text-sm sm:text-base font-black text-[#4ade80] uppercase tracking-tight">
                    {heroData.headline1 || 'ESTRUTURA COMPLETA'}
                  </h4>
                  <p className="text-[10px] text-neutral-300 line-clamp-2 mt-1">
                    {heroData.description || 'Unimos sites, sistemas e design de alto impacto.'}
                  </p>
                </div>
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
                  className="border-2 border-dashed border-neutral-700 hover:border-[#22c55e] bg-neutral-900/50 hover:bg-neutral-900/90 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                >
                  <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] group-hover:scale-110 transition-transform">
                    {isProcessingFile ? (
                      <div className="h-5 w-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    Clique aqui para carregar sua imagem do computador ou celular
                  </h4>
                  <p className="text-xs text-neutral-400 mb-2">
                    Suporta PNG, JPG, WebP de alta qualidade
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
                      onClick={() => setImageUrl('')}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
                      title="Remover e voltar para a oficial"
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
                  onClick={handleResetToDefault}
                  className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Restaurar Padrão
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
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                Cancelar
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
                    <span>Salvar & Publicar Fundo no Site</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
