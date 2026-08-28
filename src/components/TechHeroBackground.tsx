import React, { useEffect, useRef, useState } from 'react';

interface TechHeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export default function TechHeroBackground({ children, className = '' }: TechHeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // Particle nodes for high-tech constellation matrix
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      color: string;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const particleColors = [
      'rgba(163, 230, 53, ',  // lime #a3e635
      'rgba(34, 197, 94, ',   // emerald #22c55e
      'rgba(74, 222, 128, ',  // light green #4ade80
      'rgba(255, 255, 255, ', // pure white sparkle
    ];

    const particleCount = Math.min(Math.floor((width * height) / 18000), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Grid Beam lines that travel across the grid
    interface Beam {
      x: number;
      y: number;
      length: number;
      speed: number;
      horizontal: boolean;
      alpha: number;
    }

    const beams: Beam[] = [];
    for (let i = 0; i < 4; i++) {
      beams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 180 + 80,
        speed: Math.random() * 1.2 + 0.6,
        horizontal: Math.random() > 0.5,
        alpha: Math.random() * 0.25 + 0.1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;
    let currentMouseX = mousePos.targetX;
    let currentMouseY = mousePos.targetY;

    const render = () => {
      time += 0.015;

      // Smooth mouse interpolation
      currentMouseX += (mousePos.targetX - currentMouseX) * 0.05;
      currentMouseY += (mousePos.targetY - currentMouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Base dark gradient background
      const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
      baseGrad.addColorStop(0, '#020302');
      baseGrad.addColorStop(0.5, '#050805');
      baseGrad.addColorStop(1, '#000000');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Ambient Radial Spotlights (lime / emerald aura)
      // Top Center Glow
      const centerGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.15,
        0,
        width * 0.5,
        height * 0.15,
        width * 0.5
      );
      centerGlow.addColorStop(0, 'rgba(163, 230, 53, 0.08)');
      centerGlow.addColorStop(0.4, 'rgba(34, 197, 94, 0.04)');
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // Top Right Aura
      const rightAura = ctx.createRadialGradient(
        width * 0.85,
        height * 0.3,
        0,
        width * 0.85,
        height * 0.3,
        width * 0.4
      );
      rightAura.addColorStop(0, 'rgba(74, 222, 128, 0.06)');
      rightAura.addColorStop(0.6, 'rgba(34, 197, 94, 0.02)');
      rightAura.addColorStop(1, 'transparent');
      ctx.fillStyle = rightAura;
      ctx.fillRect(0, 0, width, height);

      // Interactive Cursor Spotlight
      if (currentMouseX > 0 && currentMouseY > 0) {
        const mouseGlow = ctx.createRadialGradient(
          currentMouseX,
          currentMouseY,
          0,
          currentMouseX,
          currentMouseY,
          260
        );
        mouseGlow.addColorStop(0, 'rgba(163, 230, 53, 0.09)');
        mouseGlow.addColorStop(0.5, 'rgba(34, 197, 94, 0.03)');
        mouseGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Subtle Cyber Dot Matrix
      const dotSpacing = 36;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          // Distance from center for radial mask fade
          const dx = x - width * 0.5;
          const dy = y - height * 0.35;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.max(width, height) * 0.65;
          const fade = Math.max(0, 1 - dist / maxDist);

          if (fade > 0.05) {
            // Distance from mouse
            const mdx = x - currentMouseX;
            const mdy = y - currentMouseY;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            const mouseFactor = Math.max(0, 1 - mdist / 200);

            const dotAlpha = 0.03 * fade + mouseFactor * 0.08;
            ctx.fillStyle = `rgba(163, 230, 53, ${dotAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 0.75 + mouseFactor * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Moving Grid Laser Beams
      beams.forEach((beam) => {
        if (beam.horizontal) {
          beam.x += beam.speed;
          if (beam.x - beam.length > width) {
            beam.x = -beam.length;
            beam.y = Math.random() * height;
          }

          const grad = ctx.createLinearGradient(beam.x, beam.y, beam.x + beam.length, beam.y);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(0.5, `rgba(163, 230, 53, ${beam.alpha})`);
          grad.addColorStop(1, 'transparent');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(beam.x, beam.y);
          ctx.lineTo(beam.x + beam.length, beam.y);
          ctx.stroke();
        } else {
          beam.y += beam.speed;
          if (beam.y - beam.length > height) {
            beam.y = -beam.length;
            beam.x = Math.random() * width;
          }

          const grad = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.length);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(0.5, `rgba(34, 197, 94, ${beam.alpha})`);
          grad.addColorStop(1, 'transparent');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(beam.x, beam.y);
          ctx.lineTo(beam.x, beam.y + beam.length);
          ctx.stroke();
        }
      });

      // 5. Connective Particle Matrix
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around boundaries smoothly
        if (p1.x < -10) p1.x = width + 10;
        if (p1.x > width + 10) p1.x = -10;
        if (p1.y < -10) p1.y = height + 10;
        if (p1.y > height + 10) p1.y = -10;

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `rgba(163, 230, 53, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle dot
        const pulse = Math.sin(time * 2 + p1.pulsePhase);
        const dynamicAlpha = Math.max(0.08, p1.baseAlpha + pulse * 0.1);
        ctx.fillStyle = `${p1.color}${dynamicAlpha})`;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Deep Cinematic Vignette for maximum text readability
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.2,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.45)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos((prev) => ({
      ...prev,
      targetX: e.clientX - rect.left,
      targetY: e.clientY - rect.top,
    }));
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({
      ...prev,
      targetX: -1000,
      targetY: -1000,
    }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden bg-[#030303] ${className}`}
    >
      {/* High-tech Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover z-0"
      />

      {/* Subtle Geometric Overlay Elements */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.11),transparent_70%)] blur-[90px]" />
        
        {/* Subtle Cyber Isometric Grid Lines */}
        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#a3e635_1px,transparent_1px),linear-gradient(to_bottom,#a3e635_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Edge Fade to ensure seamless blending with subsequent sections */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full flex flex-col justify-between items-center">
        {children}
      </div>
    </div>
  );
}
