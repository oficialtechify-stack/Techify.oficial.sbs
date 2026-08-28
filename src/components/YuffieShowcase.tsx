import React, { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, Play, Pause, Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface YuffieShowcaseProps {
  onBack: () => void;
}

export default function YuffieShowcase({ onBack }: YuffieShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parallax calculations
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / 25;
      const y = (clientY - innerHeight / 2) / 25;
      setParallaxOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Audio Playback management
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Audio play deferred or interrupted:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = clickX / rect.width;
    const newTime = progressPercent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = parseFloat(e.target.value);
    setVolume(nextVolume);
    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Particles Canvas Logic (Dynamic Embers/Petals)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      decay: number;
      color: string;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      decay: number;
      color: string;

      constructor() {
        const parentW = canvas ? canvas.width : window.innerWidth;
        const parentH = canvas ? canvas.height : window.innerHeight;
        this.x = Math.random() * parentW;
        this.y = parentH + Math.random() * 40;
        this.size = Math.random() * 3 + 2;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.decay = Math.random() * 0.003 + 0.001;
        this.color = Math.random() > 0.45 ? 'rgba(239, 68, 68, ' : 'rgba(245, 158, 11, '; // Red/amber embers
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `${this.color}${this.opacity})`;
        c.shadowBlur = this.size * 3;
        c.shadowColor = 'rgba(239, 68, 68, 0.4)';
        c.fill();
        c.restore();
      }
    }

    // Interactivity: spawn sparks optionally under cursor
    const handleCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      for (let i = 0; i < 2; i++) {
        if (particles.length < 150) {
          particles.push({
            x: clickX,
            y: clickY,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 3,
            speedY: -(Math.random() * 2 + 1),
            opacity: 1.0,
            decay: Math.random() * 0.015 + 0.01,
            color: 'rgba(255, 204, 51, '
          });
        }
      }
    };

    canvas.parentElement?.addEventListener('mousemove', handleCanvasMouseMove);

    const init = () => {
      for (let i = 0; i < 45; i++) {
        particles.push(new Particle());
      }
    };

    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Manage particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity -= p.decay;

        // Draw particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.3)';
        ctx.fill();
        ctx.restore();

        if (p.opacity <= 0 || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          particles.splice(i, 1);
          if (particles.length < 50) {
            particles.push(new Particle());
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.parentElement?.removeEventListener('mousemove', handleCanvasMouseMove);
    };
  }, []);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative min-h-screen w-full bg-[#060608] flex items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8 select-none">
      
      {/* Background elegant overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2b0404_0%,_#060608_100%)] pointer-events-none z-0" />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={onBack}
          className="bg-black/60 hover:bg-black/90 border border-white/10 rounded-full px-5 py-2.5 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        >
          <CornerDownLeft className="h-3.5 w-3.5 text-amber-500" />
          <span>Voltar ao Portfólio</span>
        </button>
      </div>

      {/* Core cinematic window frame container */}
      <div
        ref={containerRef}
        className="w-full max-w-[1200px] h-auto md:h-[620px] md:aspect-video border border-white/10 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-2xl grid grid-cols-1 md:grid-cols-[45%_42%_13%] bg-[url('https://u.cubeupload.com/zmonochrome/tumblr8b1866a9355004.jpg')] bg-cover bg-center z-10"
      >
        {/* Parallax / Gradient background overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_35%,_rgba(6,6,8,0.92)_100%)] pointer-events-none z-10" />
        <div 
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 15%, transparent 16%)',
            backgroundSize: '6px 6px'
          }} 
          className="absolute inset-0 pointer-events-none z-[12]" 
        />

        {/* Vintage tech scope bounds */}
        <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-white/20 pointer-events-none z-20" />
        <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-white/20 pointer-events-none z-20" />

        {/* Floating vertical nihility text backdrop */}
        <div
          style={{ fontFamily: "'Syncopate', sans-serif" }}
          className="absolute select-none pointer-events-none top-[45%] left-0 w-[400%] h-auto -translate-y-1/2 text-white/[0.02] text-8xl sm:text-[11rem] tracking-[30px] font-bold uppercase whitespace-nowrap z-[1] leading-none animate-[move-nihility_32s_linear_infinite]"
        >
          NIHILITY NIHILITY NIHILITY NIHILITY
        </div>

        {/* Ambient interactive particle overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[13]" />

        {/* --- LEFT SECTION: DIGITAL AUDIO ENGINE AND TITLE PANEL --- */}
        <div className="p-6 md:p-8 flex flex-col justify-between z-20 bg-black/90 md:bg-gradient-to-r md:from-[#060608]/98 md:via-[#460303]/60 md:to-transparent">
          
          {/* Fret Not text block badge */}
          <div className="border-l-4 border-amber-600 pl-3 leading-tight mb-8">
            <span className="block text-[11px] font-black uppercase text-slate-200 tracking-wider">Fret not! The hero Chixia has arrived!</span>
            <span className="block text-[9px] text-slate-400 font-medium tracking-wide">心配ご無用！正義 de 味方、熾霞のおおまわりだ！</span>
          </div>

          <div className="my-auto">
            <span className="text-white text-xs tracking-[6.5px] block font-black uppercase mb-1">ブレイジング・ブライト</span>
            <h1 
              style={{ textShadow: '2px 2px 0px #b5893d, 4px 4px 20px rgba(0,0,0,0.9)' }}
              className="text-6xl md:text-8xl font-black text-white select-none leading-none tracking-tight font-serif"
            >
              朝日
            </h1>
            <span className="inline-block bg-white text-black font-extrabold text-[10px] tracking-[4px] px-3.5 py-1.5 rounded-sm mt-4 shadow-lg">
              1542991141
            </span>

            {/* Custom Embedded Audio Player module */}
            <div className={`mt-8 bg-neutral-950/80 border rounded-xl p-4 backdrop-blur-xl flex flex-col gap-3.5 transition-all duration-300 ${isPlaying ? 'border-amber-600/55 shadow-[0_0_15px_rgba(181,137,61,0.2)]' : 'border-white/10'}`}>
              
              <audio
                ref={audioRef}
                src="https://www.dropbox.com/scl/fi/ersb17v6uwmcelmvapgxp/Fall-To-Hell-DOLLWAVE-Darkwave-Lyrics-visualizer.mp3?rlkey=3pfivpdswvsnwxwzqnix01wnl&st=vs1tmdms&dl=1"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />

              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate w-[160px]">
                  Fall To Hell - DOLLWAVE
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Seekable progress bar */}
              <div
                onClick={handleProgressBarClick}
                className="w-full h-1 bg-white/15 relative rounded cursor-pointer group"
              >
                <div
                  style={{ 
                    width: `${progressPercent}%`,
                    boxShadow: '0 0 8px #b5893d'
                  }}
                  className="h-full bg-gradient-to-r from-amber-600 to-white rounded transition-all duration-75 relative"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleTogglePlay}
                  className="bg-white hover:bg-slate-200 text-black px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3 w-3 fill-black text-black" />
                      <span>PAUSAR</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-black text-black" />
                      <span>OUVIR PREVIA</span>
                    </>
                  )}
                </button>

                {/* Micro vol system */}
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 rounded bg-white/10 appearance-none cursor-pointer accent-amber-600"
                  />
                </div>
              </div>

            </div>

          </div>

          <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-6">
            <span className="text-[8px] font-extrabold text-neutral-500 tracking-widest uppercase">OVERDRIVE MODE // FREQUENCY: STABLE</span>
            <span className="border border-white/40 text-slate-200 rounded px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider">BOOM BOOM!</span>
          </div>

        </div>


        {/* --- CENTER AREA: HIGH QUALITY PARALLAX CHARACTER GRAPHIC --- */}
        <div className="relative flex items-center justify-center p-4 z-15 h-80 md:h-auto">
          <div className="w-full md:w-11/12 h-full md:h-[90%] border border-white/5 rounded-2xl relative overflow-hidden backdrop-blur-[3px] bg-gradient-to-tr from-cyan-950/5 via-neutral-950/20 to-transparent">
            {/* Ambient scanning laser overlay */}
            <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-600/75 to-transparent z-[2] animate-[laser-scan_4.5s_linear_infinite]" />
            <span className="absolute top-2 left-2 text-white/[0.02] text-[15rem] font-black select-none pointer-events-none z-[1] leading-none">
              古
            </span>

            <div className="absolute right-4 top-1/4 flex flex-col items-end gap-1.5 text-white/30 text-[8px] font-mono z-10 uppercase">
              <span>STATUS: ACTIVE</span>
              <span>GLASS: JINSHI_DARK</span>
              <div className="w-10 h-0.5 bg-amber-600 animate-[bar-stretch_1s_infinite_ease-in-out]" />
            </div>
          </div>

          {/* Floating Character illustration with slow responsive parallax movement */}
          <div
            style={{
              transform: `translateX(${parallaxOffset.x}px) translateY(${parallaxOffset.y}px)`,
              transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            className="absolute bottom-4 left-[-10%] md:left-[-15%] w-[120%] md:w-[130%] h-full md:h-[110%] pointer-events-none z-20 will-change-transform"
          >
            <img
              src="https://u.cubeupload.com/zmonochrome/b00chisarenderwuthering.png"
              alt="Yuffie Chixia Kinematic original character render"
              className="w-full h-full object-contain object-bottom select-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>


        {/* --- RIGHT COLUMN: CHERRY LABELS AND TECHNICAL SPECIFICATIONS PANEL --- */}
        <div className="hidden md:flex p-6 md:p-8 flex-col justify-between items-center z-20 bg-gradient-to-l from-black/50 to-transparent border-l border-white/5">
          
          <div className="border border-white/20 select-none rounded-full px-4 py-1 text-[9px] font-extrabold uppercase tracking-widest bg-white/[0.02] text-slate-200">
            YUFFIE
          </div>

          <div className="flex flex-col items-center gap-5 my-8">
            <span style={{ writingMode: 'vertical-rl' }} className="text-3xl font-black text-white tracking-[8px] uppercase font-serif">
              朝日
            </span>
            <span style={{ writingMode: 'vertical-rl' }} className="text-[9px] tracking-[6px] text-white/50 uppercase">
              ASAHI
            </span>
            <span className="text-amber-500 font-mono text-[10px] animate-pulse">✦</span>
            <span style={{ writingMode: 'vertical-rl' }} className="text-[9px] tracking-[6px] text-white/50 uppercase">
              CREATIVE
            </span>
          </div>

          <div className="text-center">
            <span className="text-white/20 text-xs block">—</span>
            <span 
              style={{ writingMode: 'vertical-rl' }} 
              className="text-[7px] font-bold text-white/30 tracking-[3px] uppercase mt-2 transform rotate-180 inline-block"
            >
              システム起動完了
            </span>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes laser-scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes bar-stretch {
          0%, 100% { width: 10px; }
          50% { width: 35px; }
        }
        @keyframes move-nihility {
          0% { transform: translate3d(0, -50%, 0); }
          100% { transform: translate3d(-35%, -50%, 0); }
        }
      `}</style>

    </div>
  );
}
