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
  Maximize2,
  Smartphone,
  Monitor
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

// Preset backgrounds
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
  const fileDesktopInputRef = useRef<HTMLInputElement>(null);
  const fileMobileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [bgType, setBgType] = useState<'image' | 'video' | 'default'>(heroData.backgroundType || 'image');
  const [imageUrl, setImageUrl] = useState<string>(heroData.backgroundImageUrl || '');
  const [imageUrlMobile, setImageUrlMobile] = useState<string>(heroData.backgroundImageUrlMobile || '');
  const [videoUrl, setVideoUrl] = useState<string>(heroData.videoUrl || '');
  
  const [brightness, setBrightness] = useState<number>(heroData.backgroundBrightness ?? 100);
  const [darkOpacity, setDarkOpacity] = useState<number>(heroData.backgroundOpacity ?? 0);
  const [blurAmount, setBlurAmount] = useState<number>(heroData.backgroundBlur ?? 0);
  const [showGrid, setShowGrid] = useState<boolean>(heroData.showGridEffect ?? false);

  const [isProcessingDesktop, setIsProcessingDesktop] = useState(false);
  const [isProcessingMobile, setIsProcessingMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever modal opens or heroData changes
  useEffect(() => {
    if (isOpen) {
      setBgType(heroData.backgroundType || 'image');
      setImageUrl(heroData.backgroundImageUrl || '');
      setImageUrlMobile(heroData.backgroundImageUrlMobile || '');
      setVideoUrl(heroData.videoUrl || '');
      setBrightness(heroData.backgroundBrightness ?? 100);
      setDarkOpacity(heroData.backgroundOpacity ?? 0);
      setBlurAmount(heroData.backgroundBlur ?? 0);
      setShowGrid(heroData.showGridEffect ?? false);
    }
  }, [isOpen, heroData]);

  // Compress & read desktop image file (1920x1080)
  const processDesktopImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Formato Inválido', 'Por favor envie uma imagem (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingDesktop(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1920, 1080, 0.85);
      setImageUrl(compressedDataUrl);
      setBgType('image');
      setBrightness(100);
      setDarkOpacity(0);
      setBlurAmount(0);

      // Auto-apply immediately to the page
      await onSaveBackground({
        backgroundImageUrl: compressedDataUrl,
        backgroundImageUrlMobile: imageUrlMobile,
        backgroundType: 'image',
        backgroundBrightness: 100,
        backgroundOpacity: 0,
        backgroundBlur: 0
      });
      toast.success('Banner Desktop Aplicado!', 'A imagem foi atualizada para computadores e telas grandes.');
    } catch (err) {
      console.error(err);
      toast.error('Erro de Leitura', 'Não foi possível ler a imagem selecionada.');
    } finally {
      setIsProcessingDesktop(false);
    }
  };

  // Compress & read mobile image file (1080x1920 vertical)
  const processMobileImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Formato Inválido', 'Por favor envie uma imagem (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingMobile(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1080, 1920, 0.85);
      setImageUrlMobile(compressedDataUrl);
      setPreviewDevice('mobile'); // switch preview to mobile to see it immediately!
      setBrightness(100);
      setDarkOpacity(0);
      setBlurAmount(0);

      // Auto-apply immediately to the page
      await onSaveBackground({
        backgroundImageUrl: imageUrl,
        backgroundImageUrlMobile: compressedDataUrl,
        backgroundBrightness: 100,
        backgroundOpacity: 0,
        backgroundBlur: 0
      });
      toast.success('Banner Mobile Aplicado!', 'A imagem vertical para celulares foi atualizada.');
    } catch (err) {
      console.error(err);
      toast.error('Erro de Leitura', 'Não foi possível ler a imagem mobile.');
    } finally {
      setIsProcessingMobile(false);
    }
  };

  const handleDesktopFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processDesktopImageFile(file);
    }
  };

  const handleMobileFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processMobileImageFile(file);
    }
  };

  const handleRemoveDesktop = async () => {
    setImageUrl('');
    await onSaveBackground({
      backgroundImageUrl: '',
      backgroundImageUrlMobile: imageUrlMobile
    });
    toast.info('Banner Desktop Removido', 'A imagem para desktop foi limpa.');
  };

  const handleRemoveMobile = async () => {
    setImageUrlMobile('');
    await onSaveBackground({
      backgroundImageUrl: imageUrl,
      backgroundImageUrlMobile: ''
    });
    toast.info('Banner Mobile Removido', 'O site voltará a usar o banner desktop adaptado no celular.');
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
      backgroundImageUrlMobile: imageUrlMobile,
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
    setImageUrlMobile('');
    setVideoUrl('');
    setBgType('image');
    setBrightness(100);
    setDarkOpacity(0);
    setBlurAmount(0);
    setShowGrid(false);
    await onSaveBackground({
      backgroundImageUrl: '',
      backgroundImageUrlMobile: '',
      backgroundType: 'image',
      videoUrl: '',
      backgroundBrightness: 100,
      backgroundOpacity: 0,
      backgroundBlur: 0,
      showGridEffect: false
    });
    toast.info('Fundo Removido', 'Todos os fundos (Desktop e Mobile) foram limpos.');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveBackground({
        backgroundImageUrl: imageUrl,
        backgroundImageUrlMobile: imageUrlMobile,
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

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#4ade80]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-black text-white">
                    Personalizar Fundo do Hero
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Defina banners independentes para Desktop e Mobile (celular)
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

            {/* LIVE PREVIEW BOX WITH DEVICE TOGGLE */}
            <div className="mb-6 rounded-2xl border border-neutral-800 bg-black/60 p-3">
              <div className="flex items-center justify-between mb-2 px-1 text-xs">
                <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-[#22c55e]" /> Pré-visualização em Tempo Real
                </span>
                <div className="flex items-center gap-1 bg-neutral-900/90 p-0.5 rounded-lg border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-[#22c55e] text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="h-3 w-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-[#a3e635] text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {previewDevice === 'desktop' ? (
                /* DESKTOP PREVIEW */
                <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-neutral-800 bg-[#070b07] flex items-center justify-center text-center">
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
                      alt="Hero Desktop Preview"
                      className="w-full h-full object-cover object-center transition-all duration-200"
                      style={{
                        filter: `brightness(${brightness}%) blur(${blurAmount}px)`,
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                      <div className="h-10 w-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-2 text-neutral-600">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-neutral-300">Nenhum banner desktop definido</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Envie uma imagem horizontal (1920x1080) na aba abaixo</p>
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

                  {imageUrl && (
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 border border-white/10 text-[10px] font-bold text-neutral-200 backdrop-blur-md">
                        <Monitor className="h-3 w-3 text-[#22c55e]" /> Banner Desktop Ativo
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* MOBILE PREVIEW (Smartphone frame simulator) */
                <div className="py-2 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-56 rounded-2xl border-2 border-neutral-700 bg-[#070b07] overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                    {/* Notch indicator */}
                    <div className="absolute top-1.5 z-20 w-12 h-1 bg-neutral-700 rounded-full" />

                    {imageUrlMobile || imageUrl ? (
                      <img
                        src={imageUrlMobile || imageUrl}
                        alt="Hero Mobile Preview"
                        className="w-full h-full object-cover object-center transition-all duration-200"
                        style={{
                          filter: `brightness(${brightness}%) blur(${blurAmount}px)`,
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-3 text-neutral-500">
                        <Smartphone className="h-6 w-6 mb-1 text-neutral-600" />
                        <span className="text-[10px] font-bold text-neutral-400">Sem banner mobile</span>
                        <span className="text-[9px] text-neutral-600">Tela limpa</span>
                      </div>
                    )}

                    {/* Darkening layer */}
                    {(imageUrlMobile || imageUrl) && (
                      <div 
                        className="absolute inset-0 bg-black transition-opacity duration-200 pointer-events-none"
                        style={{ opacity: darkOpacity / 100 }}
                      />
                    )}

                    {/* Badge */}
                    <div className="absolute bottom-2 left-2 right-2 z-10 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold shadow ${
                        imageUrlMobile ? 'bg-[#a3e635] text-black' : 'bg-black/80 text-neutral-300 border border-white/10'
                      }`}>
                        {imageUrlMobile ? '📱 Banner Mobile Ativo' : '🖥️ Adaptando Desktop'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-2 text-center">
                    {imageUrlMobile 
                      ? 'Exibindo imagem vertical personalizada para celulares'
                      : 'Sem imagem mobile dedicada. O banner desktop é adaptado automaticamente.'}
                  </p>
                </div>
              )}
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800/80 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#22c55e] text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload de Arquivo (PC & Mobile)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-[#22c55e] text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Link Externo / URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-[#22c55e] text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Modelos Prontos</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. UPLOAD (DUAL CARDS: DESKTOP & MOBILE) */}
            {activeTab === 'upload' && (
              <div className="space-y-4 mb-6 animate-in fade-in duration-200">
                <input
                  ref={fileDesktopInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleDesktopFileUpload}
                  className="hidden"
                />

                <input
                  ref={fileMobileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleMobileFileUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CARD 1: BANNER DESKTOP */}
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Monitor className="h-4 w-4 text-[#22c55e]" /> Banner Desktop (PC)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                          1920 × 1080
                        </span>
                      </div>

                      {imageUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-black aspect-video mb-3 group">
                          <img src={imageUrl} alt="Desktop Thumbnail" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => fileDesktopInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-lg bg-[#22c55e] text-black text-[11px] font-bold hover:brightness-110 cursor-pointer"
                            >
                              Trocar
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveDesktop}
                              className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-600 cursor-pointer"
                              title="Remover banner desktop"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileDesktopInputRef.current?.click()}
                          className="border-2 border-dashed border-neutral-700 hover:border-[#22c55e] rounded-xl p-4 text-center cursor-pointer transition-all bg-black/30 hover:bg-black/60 aspect-video flex flex-col items-center justify-center mb-3 group"
                        >
                          {isProcessingDesktop ? (
                            <div className="h-5 w-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Monitor className="h-6 w-6 text-[#22c55e] group-hover:scale-110 transition-transform mb-1.5" />
                              <span className="text-xs font-bold text-white">Carregar Imagem Desktop</span>
                              <span className="text-[10px] text-neutral-400">Horizontal (16:9)</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileDesktopInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#22c55e]" />
                      <span>{imageUrl ? 'Trocar Imagem Desktop' : 'Escolher Imagem Desktop'}</span>
                    </button>
                  </div>

                  {/* CARD 2: BANNER MOBILE */}
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Smartphone className="h-4 w-4 text-[#a3e635]" /> Banner Mobile (Celular)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 font-semibold">
                          1080 × 1920
                        </span>
                      </div>

                      {imageUrlMobile ? (
                        <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-black aspect-video mb-3 group flex items-center justify-center">
                          <img src={imageUrlMobile} alt="Mobile Thumbnail" className="h-full w-auto object-cover rounded" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => fileMobileInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-lg bg-[#a3e635] text-black text-[11px] font-bold hover:brightness-110 cursor-pointer"
                            >
                              Trocar
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveMobile}
                              className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-600 cursor-pointer"
                              title="Remover banner mobile"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileMobileInputRef.current?.click()}
                          className="border-2 border-dashed border-neutral-700 hover:border-[#a3e635] rounded-xl p-4 text-center cursor-pointer transition-all bg-black/30 hover:bg-black/60 aspect-video flex flex-col items-center justify-center mb-3 group"
                        >
                          {isProcessingMobile ? (
                            <div className="h-5 w-5 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Smartphone className="h-6 w-6 text-[#a3e635] group-hover:scale-110 transition-transform mb-1.5" />
                              <span className="text-xs font-bold text-white">Carregar Imagem Mobile</span>
                              <span className="text-[10px] text-neutral-400">Vertical (9:16)</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileMobileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#a3e635]" />
                      <span>{imageUrlMobile ? 'Trocar Imagem Mobile' : 'Escolher Imagem Mobile'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 leading-relaxed">
                  💡 <strong>Dica de responsividade:</strong> O banner Desktop será exibido em computadores, notebooks e tablets horizontais. O banner Mobile será exibido automaticamente para visitantes acessando pelo smartphone.
                </p>
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
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-[#22c55e]" /> URL da Imagem Desktop (PC)
                      </label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/fundo-desktop.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 px-3.5 text-xs text-white placeholder-neutral-500 focus:border-[#22c55e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-[#a3e635]" /> URL da Imagem Mobile (Celular - Opcional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/fundo-mobile-vertical.jpg"
                        value={imageUrlMobile}
                        onChange={(e) => setImageUrlMobile(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 px-3.5 text-xs text-white placeholder-neutral-500 focus:border-[#a3e635] focus:outline-none"
                      />
                    </div>
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
                    <p className="text-[10px] text-neutral-500 mt-1">
                      O vídeo deve estar em formato .mp4 direto (hospedado no Supabase, Cloudflare, AWS S3, etc).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-3 mb-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRESET_BACKGROUNDS.map((preset) => {
                    const isSelected = (preset.type === 'image' && imageUrl === preset.url) ||
                                       (preset.type === 'video' && videoUrl === preset.url);

                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`group relative overflow-hidden rounded-2xl border text-left transition-all cursor-pointer p-2.5 flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                            : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900'
                        }`}
                      >
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-2 bg-black">
                          <img
                            src={preset.thumbnail}
                            alt={preset.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-black/80 text-[#4ade80] border border-[#22c55e]/30">
                            {preset.badge}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-[#22c55e] flex items-center justify-center text-black shadow">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-white leading-snug line-clamp-1">
                            {preset.title}
                          </h4>
                          <span className="text-[10px] text-neutral-400 capitalize">
                            {preset.type === 'video' ? 'Vídeo Loop' : 'Imagem'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTROLS & SLIDERS (EXPANDABLE/ALWAYS ACCESSIBLE) */}
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/70 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#22c55e]" /> Ajustes Visuais Finos
                </span>
                <button
                  type="button"
                  onClick={handleResetSliders}
                  className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Restaurar Ajustes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">Brilho</span>
                    <span className="font-bold text-white">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                  />
                </div>

                {/* Dark Opacity */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">Escurecimento (Overlay)</span>
                    <span className="font-bold text-white">{darkOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={darkOpacity}
                    onChange={(e) => setDarkOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">Desfoque (Blur)</span>
                    <span className="font-bold text-white">{blurAmount}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={blurAmount}
                    onChange={(e) => setBlurAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                  />
                </div>

                {/* Holographic Grid toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Grid className="h-4 w-4 text-[#4ade80]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Grade Holográfica</span>
                      <span className="text-[10px] text-neutral-400">Efeito matrix sutil</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                      showGrid ? 'bg-[#22c55e]' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showGrid ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleClearBackground}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Limpar Todos os Fundos</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 text-black text-xs font-extrabold shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Salvar & Publicar</span>
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
