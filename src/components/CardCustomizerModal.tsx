import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  X, 
  RotateCcw, 
  Save, 
  Eye, 
  Layout, 
  Type, 
  Palette, 
  Layers, 
  Check, 
  Sparkles,
  Maximize2,
  Minimize2,
  Edit3
} from 'lucide-react';
import { 
  CardCustomizerSettings, 
  DEFAULT_CARD_SETTINGS, 
  getCachedCardSettings, 
  saveCardSettings 
} from '../lib/cardStyles';
import { ArticleCard } from './ui/ArticleCard';

interface CardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardCustomizerModal: React.FC<CardCustomizerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<CardCustomizerSettings>(getCachedCardSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'dimensions' | 'typography' | 'colors' | 'content'>('dimensions');

  // Sample card editable contents
  const [sampleHeadline, setSampleHeadline] = useState("Landing Page Futurista & Alta Conversão");
  const [sampleExcerpt, setSampleExcerpt] = useState("Desenvolvemos experiências digitais completas com motion design, velocidade extrema e foco em aquisição de clientes.");
  const [sampleTag, setSampleTag] = useState("Engenharia 360°");
  const [sampleWriter, setSampleWriter] = useState("Techify Digital");
  const [sampleReadTime, setSampleReadTime] = useState(120);

  useEffect(() => {
    if (isOpen) {
      setSettings(getCachedCardSettings());
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleUpdate = (key: keyof CardCustomizerSettings, value: any) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      // Save locally immediately for live feedback
      saveCardSettings(next);
      return next;
    });
  };

  const handleSaveToFirebase = async () => {
    await saveCardSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = async () => {
    setSettings(DEFAULT_CARD_SETTINGS);
    await saveCardSettings(DEFAULT_CARD_SETTINGS);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl rounded-3xl border border-neutral-800 bg-[#0d0f11] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-[#111417]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Ferramenta de Estilo & Tamanhos dos Cards</h3>
              <p className="text-xs text-neutral-400">Personalize largura, altura do vídeo, espaçamentos, tipografia e cores com sincronização no Firebase</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-850 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              title="Redefinir para os valores padrão recomendados"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Redefinir Padrão</span>
            </button>
            <button
              onClick={handleSaveToFirebase}
              className="flex items-center gap-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] px-4 py-2 text-xs font-bold text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer"
            >
              {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{isSaved ? "Salvo no Firebase!" : "Salvar no Firebase"}</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Controls (Tabs) & Right Live Interactive Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-800 bg-[#0d0f11] overflow-y-auto p-6 space-y-6">
            
            {/* Tabs Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900 border border-neutral-800">
              {[
                { id: 'dimensions', label: 'Dimensões & Espaços', icon: Layout },
                { id: 'typography', label: 'Tipografia & Linhas', icon: Type },
                { id: 'colors', label: 'Cores & Temas', icon: Palette },
                { id: 'content', label: 'Editar Conteúdo', icon: Edit3 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#22c55e] text-black font-bold shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: DIMENSIONS */}
            {activeTab === 'dimensions' && (
              <div className="space-y-5">
                
                {/* Card Max Width Slider */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Largura Máxima do Card (Width)</span>
                    <span className="font-mono text-[#4ade80]">{settings.cardMaxWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={260}
                    max={520}
                    step={4}
                    value={settings.cardMaxWidth}
                    onChange={(e) => handleUpdate('cardMaxWidth', Number(e.target.value))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                  <p className="text-[11px] text-neutral-400">Controla a amplitude horizontal do card para caber perfeitamente na grade sem espremer o texto.</p>
                </div>

                {/* Cover / Video Height Slider */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Altura da Imagem / Vídeo (Cover Height)</span>
                    <span className="font-mono text-[#4ade80]">{settings.coverHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min={140}
                    max={360}
                    step={4}
                    value={settings.coverHeight}
                    onChange={(e) => handleUpdate('coverHeight', Number(e.target.value))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                  <p className="text-[11px] text-neutral-400">Ajuste fino da proporção vertical da mídia para evitar que o card fique comprido demais.</p>
                </div>

                {/* Internal Padding Slider */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Espaçamento Interno (Padding)</span>
                    <span className="font-mono text-[#4ade80]">{settings.cardPadding}px</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={28}
                    step={2}
                    value={settings.cardPadding}
                    onChange={(e) => handleUpdate('cardPadding', Number(e.target.value))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Gap Slider */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Distância entre Elementos (Gap)</span>
                    <span className="font-mono text-[#4ade80]">{settings.elementsGap}px</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    step={2}
                    value={settings.elementsGap}
                    onChange={(e) => handleUpdate('elementsGap', Number(e.target.value))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Corner Radii Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>Arredondamento do Card</span>
                      <span className="font-mono text-[#4ade80]">{settings.cardBorderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={36}
                      step={2}
                      value={settings.cardBorderRadius}
                      onChange={(e) => handleUpdate('cardBorderRadius', Number(e.target.value))}
                      className="w-full accent-[#22c55e] cursor-pointer"
                    />
                  </div>

                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>Arredondamento da Mídia</span>
                      <span className="font-mono text-[#4ade80]">{settings.coverBorderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={28}
                      step={2}
                      value={settings.coverBorderRadius}
                      onChange={(e) => handleUpdate('coverBorderRadius', Number(e.target.value))}
                      className="w-full accent-[#22c55e] cursor-pointer"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: TYPOGRAPHY */}
            {activeTab === 'typography' && (
              <div className="space-y-5">
                
                {/* Headline Font Size Slider */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Tamanho do Título (Headline Font Size)</span>
                    <span className="font-mono text-[#4ade80]">{settings.headlineFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={32}
                    step={1}
                    value={settings.headlineFontSize}
                    onChange={(e) => handleUpdate('headlineFontSize', Number(e.target.value))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Excerpt Font Size Slider */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Tamanho do Texto / Legenda</span>
                    <span className="font-mono text-[#4ade80]">{settings.excerptFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={11}
                    max={18}
                    step={0.5}
                    value={settings.excerptFontSize}
                    onChange={(e) => handleUpdate('excerptFontSize', Number(e.target.value))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Line Height Slider */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Entrelinha (Line Height)</span>
                    <span className="font-mono text-[#4ade80]">{settings.lineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min={1.15}
                    max={1.85}
                    step={0.05}
                    value={settings.lineHeight}
                    onChange={(e) => handleUpdate('lineHeight', Number(e.target.value))}
                    className="w-full accent-[#22c55e] cursor-pointer"
                  />
                </div>

                {/* Line Clamp Selector */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
                    <span>Limite de Linhas de Texto (Clamp Lines)</span>
                    <span className="font-mono text-[#4ade80]">
                      {settings.clampLines === 0 ? "Sem Limite" : `${settings.clampLines} linhas`}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleUpdate('clampLines', num)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          settings.clampLines === num
                            ? 'bg-[#22c55e] text-black border-[#22c55e]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {num === 0 ? 'Livre' : `${num}x`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <span className="text-xs font-semibold text-white block mb-2">Alinhamento do Texto</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => handleUpdate('textAlign', align)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize border transition-colors cursor-pointer ${
                          settings.textAlign === align
                            ? 'bg-[#22c55e] text-black border-[#22c55e]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: COLORS & THEMES */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                
                {/* Background & Border Color Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <label className="text-xs font-semibold text-white block">Fundo do Card</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.cardBgColor}
                        onChange={(e) => handleUpdate('cardBgColor', e.target.value)}
                        className="h-9 w-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settings.cardBgColor}
                        onChange={(e) => handleUpdate('cardBgColor', e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <label className="text-xs font-semibold text-white block">Cor da Borda</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.borderColor}
                        onChange={(e) => handleUpdate('borderColor', e.target.value)}
                        className="h-9 w-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settings.borderColor}
                        onChange={(e) => handleUpdate('borderColor', e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <label className="text-xs font-semibold text-white block">Cor do Título</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => handleUpdate('textColor', e.target.value)}
                        className="h-9 w-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settings.textColor}
                        onChange={(e) => handleUpdate('textColor', e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <label className="text-xs font-semibold text-white block">Cor da Descrição</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.excerptColor}
                        onChange={(e) => handleUpdate('excerptColor', e.target.value)}
                        className="h-9 w-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settings.excerptColor}
                        onChange={(e) => handleUpdate('excerptColor', e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Toggle Elements */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-3">
                  <span className="text-xs font-semibold text-white block">Exibição de Seções</span>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
                      <span>Exibir Tag / Badge da Categoria</span>
                      <input
                        type="checkbox"
                        checked={settings.showBadge}
                        onChange={(e) => handleUpdate('showBadge', e.target.checked)}
                        className="rounded accent-[#22c55e] h-4 w-4 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
                      <span>Exibir Tempo de Leitura</span>
                      <input
                        type="checkbox"
                        checked={settings.showReadingTime}
                        onChange={(e) => handleUpdate('showReadingTime', e.target.checked)}
                        className="rounded accent-[#22c55e] h-4 w-4 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
                      <span>Exibir Rodapé do Card (Autor & Status)</span>
                      <input
                        type="checkbox"
                        checked={settings.showFooter}
                        onChange={(e) => handleUpdate('showFooter', e.target.checked)}
                        className="rounded accent-[#22c55e] h-4 w-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: DIRECT CONTENT EDITING */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <label className="text-xs font-semibold text-white block">Título Principal (Headline)</label>
                  <input
                    type="text"
                    value={sampleHeadline}
                    onChange={(e) => setSampleHeadline(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                    placeholder="Digite o título do card..."
                  />
                </div>

                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                  <label className="text-xs font-semibold text-white block">Texto / Descrição (Excerpt)</label>
                  <textarea
                    rows={3}
                    value={sampleExcerpt}
                    onChange={(e) => setSampleExcerpt(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-sm text-white focus:border-[#22c55e] focus:outline-none"
                    placeholder="Digite a descrição..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <label className="text-xs font-semibold text-white block">Tag / Categoria</label>
                    <input
                      type="text"
                      value={sampleTag}
                      onChange={(e) => setSampleTag(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-4 space-y-2">
                    <label className="text-xs font-semibold text-white block">Autor / Criador</label>
                    <input
                      type="text"
                      value={sampleWriter}
                      onChange={(e) => setSampleWriter(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 bg-black/70 p-6 flex flex-col items-center justify-center overflow-y-auto border-t lg:border-t-0">
            
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-[#22c55e]" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Visualização ao Vivo em Tempo Real
              </span>
            </div>

            {/* Rendered Live Card using Dynamic Settings */}
            <div 
              style={{
                width: '100%',
                maxWidth: `${settings.cardMaxWidth}px`,
                backgroundColor: settings.cardBgColor,
                borderColor: settings.borderColor,
                borderRadius: `${settings.cardBorderRadius}px`,
                padding: `${settings.cardPadding}px`,
                gap: `${settings.elementsGap}px`,
              }}
              className="flex flex-col border shadow-2xl transition-all duration-200 select-none overflow-hidden"
            >
              {/* Media Cover */}
              <div 
                style={{
                  height: `${settings.coverHeight}px`,
                  borderRadius: `${settings.coverBorderRadius}px`,
                }}
                className="relative w-full overflow-hidden bg-neutral-950"
              >
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                  alt="Live Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-white font-mono backdrop-blur-sm">
                  {settings.coverHeight}px
                </div>
              </div>

              {/* Card Body */}
              <div 
                style={{
                  textAlign: settings.textAlign,
                }}
                className="flex-grow p-2 space-y-2.5"
              >
                {/* Meta */}
                {(settings.showBadge || settings.showReadingTime) && (
                  <div 
                    style={{
                      justifyContent: settings.textAlign === 'center' ? 'center' : settings.textAlign === 'right' ? 'flex-end' : 'flex-start'
                    }}
                    className="flex items-center text-xs text-neutral-400"
                  >
                    {settings.showBadge && (
                      <span 
                        style={{
                          backgroundColor: settings.badgeBgColor,
                          color: settings.badgeTextColor,
                        }}
                        className="rounded-full border border-neutral-700/80 px-2.5 py-0.5 text-xs font-semibold"
                      >
                        {sampleTag}
                      </span>
                    )}
                    {settings.showBadge && settings.showReadingTime && <span className="mx-2 text-neutral-500">•</span>}
                    {settings.showReadingTime && <span>2 min read</span>}
                  </div>
                )}

                {/* Headline */}
                <h2 
                  style={{
                    fontSize: `${settings.headlineFontSize}px`,
                    color: settings.textColor,
                    lineHeight: 1.25,
                  }}
                  className="font-bold tracking-tight"
                >
                  {sampleHeadline}
                </h2>

                {/* Excerpt */}
                <p 
                  style={{
                    fontSize: `${settings.excerptFontSize}px`,
                    color: settings.excerptColor,
                    lineHeight: settings.lineHeight,
                    WebkitLineClamp: settings.clampLines > 0 ? settings.clampLines : undefined,
                    display: settings.clampLines > 0 ? '-webkit-box' : 'block',
                    WebkitBoxOrient: 'vertical',
                    overflow: settings.clampLines > 0 ? 'hidden' : 'visible',
                  }}
                >
                  {sampleExcerpt}
                </p>
              </div>

              {/* Footer */}
              {settings.showFooter && (
                <div 
                  style={{
                    borderTop: `1px solid ${settings.borderColor}`,
                  }}
                  className="flex items-center justify-between p-2 pt-2.5 mt-1"
                >
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">By</p>
                    <p className="text-xs font-semibold text-neutral-300">{sampleWriter}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Status</p>
                    <p className="text-xs font-semibold text-[#22c55e]">Online</p>
                  </div>
                </div>
              )}

            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-neutral-500 font-mono">
                Largura: {settings.cardMaxWidth}px | Altura Capa: {settings.coverHeight}px | Padding: {settings.cardPadding}px
              </span>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default CardCustomizerModal;
