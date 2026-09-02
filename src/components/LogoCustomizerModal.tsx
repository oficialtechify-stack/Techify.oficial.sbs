import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sliders, 
  RotateCcw, 
  Save, 
  Check, 
  Image as ImageIcon, 
  Sparkles, 
  ZoomIn, 
  Move, 
  Circle, 
  Square, 
  Eye, 
  Palette,
  Minus,
  Plus
} from 'lucide-react';
import { 
  LogoSettings, 
  DEFAULT_LOGO_SETTINGS, 
  getCachedLogoSettings, 
  saveLogoSettingsToFirestore 
} from '../lib/siteContent';
import { compressImageFile } from '../lib/imageUtils';
import defaultLogoImage from '../assets/images/techify_logo_original_1786362412096.jpg';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: LogoSettings) => void;
}

export default function LogoCustomizerModal({
  isOpen,
  onClose,
  onSaved
}: LogoCustomizerModalProps) {
  const [settings, setSettings] = useState<LogoSettings>(getCachedLogoSettings);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag pan states for interactive preview
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setSettings(getCachedLogoSettings());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processImageFile = async (file: File) => {
    setIsUploading(true);
    try {
      const compressedBase64 = await compressImageFile(file, 900, 900, 0.88);
      setSettings(prev => ({
        ...prev,
        imageUrl: compressedBase64
      }));
    } catch (err) {
      console.error('Error uploading logo image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processImageFile(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveLogoSettingsToFirestore(settings);
      setSavedSuccess(true);
      if (onSaved) onSaved(settings);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error saving logo settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_LOGO_SETTINGS);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });
    setSettings(prev => ({
      ...prev,
      offsetX: Math.max(-150, Math.min(150, prev.offsetX + dx * 0.5)),
      offsetY: Math.max(-150, Math.min(150, prev.offsetY + dy * 0.5))
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const displayImageSrc = settings.imageUrl || defaultLogoImage;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        data-lenis-prevent
        className="relative w-full max-w-4xl rounded-3xl border border-neutral-800 bg-[#090c0a] p-5 sm:p-7 text-white shadow-[0_0_60px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#4ade80]">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Ajustar Imagem & Emblema Circular
              </h2>
              <p className="text-xs text-neutral-400">
                Posicione, dê zoom, gire e personalize o logo e as linhas de divisão
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar pr-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Interactive Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                className={`w-full bg-[#050605] border rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[300px] transition-all ${
                  isDragOver 
                    ? 'border-[#22c55e] ring-2 ring-[#22c55e]/50 bg-[#22c55e]/5' 
                    : 'border-neutral-800/90'
                }`}
              >
                
                {/* Background Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />

                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest absolute top-3 left-4">
                  Pré-visualização em Tempo Real
                </span>

                {isDragOver && (
                  <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-[#4ade80] pointer-events-none">
                    <Upload className="h-10 w-10 animate-bounce mb-2" />
                    <span className="text-xs font-black uppercase tracking-wider">Solte a imagem para carregar</span>
                  </div>
                )}

                {/* Live Preview of Header Logo & Center Emblem */}
                <div className="w-full flex flex-col items-center gap-4 my-2">
                  <div className="flex items-center gap-6 bg-black/60 px-5 py-3 rounded-2xl border border-neutral-800/80">
                    <div className="text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Cabeçalho ({settings.logoSize || 42}px)</span>
                      <div 
                        className="relative overflow-hidden shrink-0 flex items-center justify-center rounded-full mx-auto"
                        style={{
                          width: `${settings.logoSize || 42}px`,
                          height: `${settings.logoSize || 42}px`,
                          borderRadius: `${settings.borderRadius}%`,
                          backgroundColor: settings.backgroundColor,
                          border: settings.showOuterRing 
                            ? `${settings.outerRingBorderWidth}px solid ${settings.outerRingColor}`
                            : 'none',
                          boxShadow: settings.glowEffect ? `0 0 15px ${settings.glowColor}80` : 'none'
                        }}
                      >
                        <img
                          src={displayImageSrc}
                          alt="Logo Preview"
                          className="w-full h-full pointer-events-none select-none"
                          style={{
                            objectFit: settings.objectFit,
                            transform: `scale(${settings.zoom / 100}) translate(${settings.offsetX}%, ${settings.offsetY}%) rotate(${settings.rotation}deg)`
                          }}
                          referrerPolicy="no-referrer"
                        />
                        {settings.showCenterDot && (
                          <div
                            className="absolute pointer-events-none rounded-full"
                            style={{
                              width: `${Math.max(2, Math.round(settings.centerDotSize * ((settings.logoSize || 42) / 50)))}px`,
                              height: `${Math.max(2, Math.round(settings.centerDotSize * ((settings.logoSize || 42) / 50)))}px`,
                              backgroundColor: settings.centerDotColor,
                              boxShadow: settings.glowEffect ? `0 0 6px ${settings.glowColor}` : 'none'
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="h-8 w-px bg-neutral-800" />

                    <div className="text-center">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Emblema Central ({settings.emblemDividerSize || 52}px)</span>
                      <div 
                        className="relative overflow-hidden shrink-0 flex items-center justify-center rounded-full mx-auto"
                        style={{
                          width: `${settings.emblemDividerSize || 52}px`,
                          height: `${settings.emblemDividerSize || 52}px`,
                          borderRadius: `${settings.borderRadius}%`,
                          backgroundColor: settings.backgroundColor,
                          border: settings.showOuterRing 
                            ? `${settings.outerRingBorderWidth}px solid ${settings.outerRingColor}`
                            : 'none',
                          boxShadow: settings.glowEffect ? `0 0 15px ${settings.glowColor}80` : 'none'
                        }}
                      >
                        <img
                          src={displayImageSrc}
                          alt="Emblem Preview"
                          className="w-full h-full pointer-events-none select-none"
                          style={{
                            objectFit: settings.objectFit,
                            transform: `scale(${settings.zoom / 100}) translate(${settings.offsetX}%, ${settings.offsetY}%) rotate(${settings.rotation}deg)`
                          }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Emblem with horizontal lines (interactive draggable canvas) */}
                <div className="relative flex items-center justify-center w-full my-4">
                  {/* Left Horizontal Line */}
                  {settings.showDividerLines && (
                    <div 
                      className="flex-1 transition-all"
                      style={{
                        height: `${settings.dividerWidth}px`,
                        backgroundColor: settings.dividerColor,
                        boxShadow: settings.glowEffect ? `0 0 8px ${settings.glowColor}` : 'none'
                      }}
                    />
                  )}

                  {/* Center Circle Container */}
                  <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="relative cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center transition-all"
                    style={{
                      width: `${Math.max(100, Math.min(160, (settings.emblemDividerSize || 52) * 1.8))}px`,
                      height: `${Math.max(100, Math.min(160, (settings.emblemDividerSize || 52) * 1.8))}px`,
                      borderRadius: `${settings.borderRadius}%`,
                      backgroundColor: settings.backgroundColor,
                      border: settings.showOuterRing 
                        ? `${settings.outerRingBorderWidth}px solid ${settings.outerRingColor}`
                        : 'none',
                      boxShadow: settings.glowEffect ? `0 0 25px ${settings.glowColor}50` : '0 4px 20px rgba(0,0,0,0.6)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* User / Default Image */}
                    <img
                      src={displayImageSrc}
                      alt="Logo Customizado"
                      className="w-full h-full pointer-events-none select-none transition-transform duration-75"
                      style={{
                        objectFit: settings.objectFit,
                        transform: `scale(${settings.zoom / 100}) translate(${settings.offsetX}%, ${settings.offsetY}%) rotate(${settings.rotation}deg)`
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Center Dot Accent */}
                    {settings.showCenterDot && (
                      <div
                        className="absolute pointer-events-none rounded-full transition-all"
                        style={{
                          width: `${settings.centerDotSize}px`,
                          height: `${settings.centerDotSize}px`,
                          backgroundColor: settings.centerDotColor,
                          boxShadow: settings.glowEffect ? `0 0 10px ${settings.glowColor}` : '0 0 4px rgba(0,0,0,0.8)'
                        }}
                      />
                    )}
                  </div>

                  {/* Right Horizontal Line */}
                  {settings.showDividerLines && (
                    <div 
                      className="flex-1 transition-all"
                      style={{
                        height: `${settings.dividerWidth}px`,
                        backgroundColor: settings.dividerColor,
                        boxShadow: settings.glowEffect ? `0 0 8px ${settings.glowColor}` : 'none'
                      }}
                    />
                  )}
                </div>

                {/* Helpful drag hint */}
                <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-2 bg-black/60 px-3 py-1 rounded-full border border-neutral-800">
                  <Move className="h-3 w-3 text-[#22c55e]" />
                  <span>Arraste com o mouse para reposicionar</span>
                </p>
              </div>

              {/* Quick Presets */}
              <div className="w-full mt-4 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Estilos Pré-definidos
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSettings(prev => ({
                        ...prev,
                        zoom: 100,
                        offsetX: 0,
                        offsetY: 0,
                        rotation: 0,
                        objectFit: 'contain',
                        borderRadius: 50,
                        showCenterDot: true,
                        centerDotColor: '#ffffff',
                        showDividerLines: true,
                        dividerColor: '#ffffff',
                        showOuterRing: true,
                        outerRingColor: '#ffffff'
                      }));
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-bold text-neutral-300 hover:text-white transition-colors text-left flex items-center gap-2"
                  >
                    <Circle className="h-3 w-3 text-[#22c55e]" />
                    <span>Clássico Minimalista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettings(prev => ({
                        ...prev,
                        zoom: 115,
                        offsetX: 0,
                        offsetY: 0,
                        rotation: 0,
                        objectFit: 'cover',
                        borderRadius: 50,
                        showCenterDot: false,
                        showDividerLines: true,
                        dividerColor: '#22c55e',
                        showOuterRing: true,
                        outerRingColor: '#22c55e',
                        glowEffect: true,
                        glowColor: '#22c55e'
                      }));
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-bold text-neutral-300 hover:text-white transition-colors text-left flex items-center gap-2"
                  >
                    <Sparkles className="h-3 w-3 text-[#22c55e]" />
                    <span>Glow Neon Techify</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Controls & Adjustments (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Image Source Selection */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                className={`border rounded-2xl p-4 space-y-3 transition-all ${
                  isDragOver 
                    ? 'bg-[#22c55e]/10 border-[#22c55e] ring-2 ring-[#22c55e]/40' 
                    : 'bg-neutral-900/40 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-[#22c55e]" />
                    <span>Inserir Imagem de Dentro Manualmente</span>
                  </span>
                  {settings.imageUrl ? (
                    <span className="text-[10px] bg-[#22c55e]/20 text-[#4ade80] px-2 py-0.5 rounded-full font-bold border border-[#22c55e]/30">
                      Imagem Personalizada
                    </span>
                  ) : (
                    <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-bold">
                      Logo Padrão
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    disabled={isUploading}
                    className="py-3 px-4 rounded-xl border border-dashed border-neutral-700 hover:border-[#22c55e] bg-neutral-900 hover:bg-neutral-850 flex items-center justify-center gap-2.5 transition-all text-xs font-bold text-neutral-200 hover:text-white cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  >
                    <Upload className="h-4 w-4 text-[#22c55e]" />
                    <span>{isUploading ? 'Otimizando Imagem...' : 'Escolher do Computador'}</span>
                  </button>

                  <div className="relative">
                    <input
                      type="url"
                      placeholder="Ou cole a URL direta da imagem..."
                      value={settings.imageUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full h-full rounded-xl bg-neutral-900 border border-neutral-700/80 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Drag and Drop notice and quick reset */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    💡 Ou arraste e solte qualquer arquivo de imagem aqui
                  </span>
                  {settings.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, imageUrl: '' }))}
                      className="text-red-400 hover:text-red-300 underline font-medium transition-colors cursor-pointer"
                    >
                      Restaurar Logo Original
                    </button>
                  )}
                </div>
              </div>

              {/* Dimensions & Size Adjustments */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 space-y-4">
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#22c55e]" />
                  <span>Tamanho & Dimensões do Logo</span>
                </span>

                {/* Header/General Logo Size */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 font-medium">Tamanho no Cabeçalho / Geral:</span>
                    <span className="text-[#4ade80] font-bold">{settings.logoSize || 42}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, logoSize: Math.max(20, (prev.logoSize || 42) - 2) }))}
                      className="h-7 w-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="range"
                      min="20"
                      max="120"
                      step="2"
                      value={settings.logoSize || 42}
                      onChange={(e) => setSettings(prev => ({ ...prev, logoSize: Number(e.target.value) }))}
                      className="flex-1 accent-[#22c55e] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, logoSize: Math.min(120, (prev.logoSize || 42) + 2) }))}
                      className="h-7 w-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Quick Preset Buttons for Logo Size */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[32, 42, 52, 64, 80].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, logoSize: sz }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          (settings.logoSize || 42) === sz
                            ? 'bg-[#22c55e] text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                            : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {sz}px {sz === 42 ? '(Padrão)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center Emblem Divider Size */}
                <div className="pt-3 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 font-medium">Tamanho do Emblema Central:</span>
                    <span className="text-[#4ade80] font-bold">{settings.emblemDividerSize || 52}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, emblemDividerSize: Math.max(30, (prev.emblemDividerSize || 52) - 2) }))}
                      className="h-7 w-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="range"
                      min="30"
                      max="160"
                      step="2"
                      value={settings.emblemDividerSize || 52}
                      onChange={(e) => setSettings(prev => ({ ...prev, emblemDividerSize: Number(e.target.value) }))}
                      className="flex-1 accent-[#22c55e] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, emblemDividerSize: Math.min(160, (prev.emblemDividerSize || 52) + 2) }))}
                      className="h-7 w-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Quick Preset Buttons for Emblem Size */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[40, 52, 64, 80, 100].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, emblemDividerSize: sz }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          (settings.emblemDividerSize || 52) === sz
                            ? 'bg-[#22c55e] text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                            : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {sz}px {sz === 52 ? '(Padrão)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sliders: Zoom, Position X, Position Y, Rotation */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 space-y-4">
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider block">
                  Ajustes Manuais de Posição & Escala
                </span>

                {/* Zoom / Scale */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 font-medium">Zoom / Escala:</span>
                    <span className="text-[#4ade80] font-bold">{settings.zoom}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, zoom: Math.max(20, prev.zoom - 5) }))}
                      className="h-7 w-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="range"
                      min="20"
                      max="350"
                      step="1"
                      value={settings.zoom}
                      onChange={(e) => setSettings(prev => ({ ...prev, zoom: Number(e.target.value) }))}
                      className="flex-1 accent-[#22c55e] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, zoom: Math.min(350, prev.zoom + 5) }))}
                      className="h-7 w-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Position X Offset */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 font-medium">Posição Horizontal (X):</span>
                    <span className="text-[#4ade80] font-bold">{settings.offsetX}%</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={settings.offsetX}
                    onChange={(e) => setSettings(prev => ({ ...prev, offsetX: Number(e.target.value) }))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Position Y Offset */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 font-medium">Posição Vertical (Y):</span>
                    <span className="text-[#4ade80] font-bold">{settings.offsetY}%</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={settings.offsetY}
                    onChange={(e) => setSettings(prev => ({ ...prev, offsetY: Number(e.target.value) }))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 font-medium">Rotação:</span>
                    <span className="text-[#4ade80] font-bold">{settings.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={settings.rotation}
                    onChange={(e) => setSettings(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Object Fit selector */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-300 font-medium">Preenchimento:</span>
                  <div className="flex items-center gap-1.5">
                    {(['cover', 'contain', 'fill'] as const).map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, objectFit: fit }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                          settings.objectFit === fit
                            ? 'bg-[#22c55e] text-black'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Elements & Lines Customization */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 space-y-3.5">
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider block">
                  Linhas, Bordas & Detalhes
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Toggle Divider Lines */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDividerLines}
                      onChange={(e) => setSettings(prev => ({ ...prev, showDividerLines: e.target.checked }))}
                      className="accent-[#22c55e] h-4 w-4 rounded"
                    />
                    <span className="font-semibold text-neutral-200">Linhas Horizontais</span>
                  </label>

                  {/* Toggle Center Dot */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showCenterDot}
                      onChange={(e) => setSettings(prev => ({ ...prev, showCenterDot: e.target.checked }))}
                      className="accent-[#22c55e] h-4 w-4 rounded"
                    />
                    <span className="font-semibold text-neutral-200">Ponto Central (Dot)</span>
                  </label>

                  {/* Toggle Outer Ring */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showOuterRing}
                      onChange={(e) => setSettings(prev => ({ ...prev, showOuterRing: e.target.checked }))}
                      className="accent-[#22c55e] h-4 w-4 rounded"
                    />
                    <span className="font-semibold text-neutral-200">Anel Externo (Borda)</span>
                  </label>

                  {/* Toggle Glow */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.glowEffect}
                      onChange={(e) => setSettings(prev => ({ ...prev, glowEffect: e.target.checked }))}
                      className="accent-[#22c55e] h-4 w-4 rounded"
                    />
                    <span className="font-semibold text-neutral-200">Efeito Neon Glow</span>
                  </label>
                </div>

                {/* Color Pickers Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800 text-xs">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Cor do Anel</label>
                    <input
                      type="color"
                      value={settings.outerRingColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, outerRingColor: e.target.value }))}
                      className="w-full h-8 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer p-0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Cor da Linha</label>
                    <input
                      type="color"
                      value={settings.dividerColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, dividerColor: e.target.value }))}
                      className="w-full h-8 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer p-0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Cor do Ponto</label>
                    <input
                      type="color"
                      value={settings.centerDotColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, centerDotColor: e.target.value }))}
                      className="w-full h-8 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer p-0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 font-bold mb-1">Fundo</label>
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-8 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-neutral-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] px-6 py-2.5 text-xs font-black text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : isSaving ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
