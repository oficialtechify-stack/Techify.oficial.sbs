import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CornerDownLeft, Eye, X, MapPin, BedDouble, Compass, ArrowUpRight } from 'lucide-react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface WandrShowcaseProps {
  onBack: () => void;
}

interface SprayParticle {
  el: SVGCircleElement | null;
  baseX: number;
  drift: number;
  lift: number;
  phase: number;
  r: number;
}

export default function WandrShowcase({ onBack }: WandrShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const travelFrameRef = useRef<HTMLDivElement>(null);
  const foamFieldRef = useRef<SVGSVGElement | null>(null);
  const foamShadowRef = useRef<SVGPathElement | null>(null);
  const foamMainRef = useRef<SVGPathElement | null>(null);
  const foamSparkRef = useRef<SVGPathElement | null>(null);
  const foamBandRef = useRef<SVGPathElement | null>(null);
  const foamSprayRef = useRef<SVGGElement | null>(null);
  const oceanPlateRef = useRef<HTMLDivElement>(null);
  const beachCopyRef = useRef<HTMLDivElement>(null);
  const destinationCopyRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<SprayParticle[]>([]);
  const sandRevealRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const sandNavRef = useRef<HTMLDivElement>(null);
  
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'map' | 'accommodation' | 'tours'>('none');

  useEffect(() => {
    // 1. Force stateful scroll position reset synchronously before mapping ScrollTrigger coordinates
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // 2. Setup Spray particles in the SVG (executes immediately)
    const svgGroup = foamSprayRef.current;
    if (svgGroup) {
      svgGroup.innerHTML = '';
      particlesRef.current = [];
      const particles: SprayParticle[] = [];
      for (let i = 0; i < 16; i += 1) {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const p: SprayParticle = {
          el: dot,
          baseX: ((i + 0.5) / 16) * 100,
          drift: (i % 2 === 1 ? 1 : -1) * (1.4 + (i % 3) * 0.6),
          lift: 1.6 + (i % 4) * 1.1,
          phase: i * 0.83,
          r: 0.45 + (i % 3) * 0.15
        };
        dot.setAttribute("r", p.r.toFixed(2));
        svgGroup.appendChild(dot);
        particles.push(p);
      }
      particlesRef.current = particles;
    }

    gsap.set(oceanPlateRef.current, { scale: 1, x: 0, y: 0 });

    // Helper math functions mapping progress
    const clamp = (val: number) => Math.max(0, Math.min(1, val));
    const mapRange = (inMin: number, inMax: number, outMin: number, outMax: number, value: number) => {
      return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    };

    function renderShoreline(progress: number) {
      const frame = travelFrameRef.current;
      if (!frame) return;

      const reveal = clamp(mapRange(0.08, 0.82, 0, 1, progress));
      const eased = 1 - Math.pow(1 - reveal, 3);
      const yBase = mapRange(0, 1, 112, -10, eased);
      const amplitude = mapRange(0, 1, 5.8, 1.4, eased);
      const phase = progress * 8.5;
      const points: string[] = [];
      const pathPoints: [number, number][] = [];

      for (let i = 0; i <= 38; i += 1) {
        const x = (i / 38) * 100;
        const longSwell = Math.sin((x * 0.105) + phase) * amplitude;
        const chop = Math.sin((x * 0.49) - phase * 1.35) * amplitude * 0.34;
        const diagonal = (x - 50) * 0.025;
        const y = yBase + longSwell + chop + diagonal;
        points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
        pathPoints.push([x, y]);
      }

      const polygonString = `polygon(${points.join(", ")}, 100% 100%, 0% 100%)`;
      frame.style.setProperty("--sand-clip", polygonString);
      if (sandRevealRef.current) {
        sandRevealRef.current.style.clipPath = polygonString;
      }

      const startAlpha = clamp(mapRange(0.56, 0.36, 0, 1, progress));
      frame.style.setProperty("--start-alpha", String(startAlpha));
      if (beachCopyRef.current) {
        beachCopyRef.current.style.opacity = String(startAlpha);
      }

      const cueAlpha = clamp(mapRange(0.25, 0.16, 0, 1, progress));
      frame.style.setProperty("--cue-alpha", String(cueAlpha));
      if (scrollCueRef.current) {
        scrollCueRef.current.style.opacity = String(cueAlpha);
      }

      const detailsAlpha = clamp(mapRange(0.58, 0.75, 0, 1, progress));
      frame.style.setProperty("--details-alpha", String(detailsAlpha));
      const detailsEl = destinationCopyRef.current?.querySelector(".details") as HTMLElement | null;
      if (detailsEl) {
        detailsEl.style.opacity = String(detailsAlpha);
        detailsEl.style.transform = `translateY(${(1 - detailsAlpha) * 18}px)`;
      }

      const sandNavAlpha = clamp(mapRange(0.14, 0.25, 0, 1, progress));
      frame.style.setProperty("--sand-nav-alpha", String(sandNavAlpha));
      if (sandNavRef.current) {
        sandNavRef.current.style.opacity = String(sandNavAlpha);
        sandNavRef.current.style.pointerEvents = sandNavAlpha > 0.1 ? 'auto' : 'none';
      }

      const dPath = pathPoints
        .map(([x, y], idx) => `${idx === 0 ? "M" : "L"} ${x.toFixed(3)} ${y.toFixed(3)}`)
        .join(" ");

      if (foamShadowRef.current) foamShadowRef.current.setAttribute("d", dPath);
      if (foamMainRef.current) foamMainRef.current.setAttribute("d", dPath);
      if (foamSparkRef.current) {
        foamSparkRef.current.setAttribute("d", dPath);
        foamSparkRef.current.style.strokeDashoffset = String(-progress * 120);
      }

      const bandHeight = mapRange(0, 1, 8, 3, eased);
      let bandD = dPath;
      for (let i = pathPoints.length - 1; i >= 0; i -= 1) {
        const [bx, by] = pathPoints[i];
        const ripple = Math.sin((bx * 0.32) - phase * 1.1) * (bandHeight * 0.16);
        bandD += ` L ${bx.toFixed(3)} ${(by + bandHeight + ripple).toFixed(3)}`;
      }
      bandD += " Z";
      
      if (foamBandRef.current) {
        foamBandRef.current.setAttribute("d", bandD);
        const bandEnv = clamp(mapRange(0.12, 0.26, 0, 1, progress)) * clamp(mapRange(0.86, 0.66, 0, 1, progress));
        foamBandRef.current.setAttribute("opacity", (0.5 + 0.5 * bandEnv).toFixed(3));
      }

      const sprayEnv = clamp(mapRange(0.16, 0.32, 0, 1, progress)) * clamp(mapRange(0.78, 0.6, 0, 1, progress));
      particlesRef.current.forEach((p) => {
        if (!p.el) return;
        const sx = p.baseX + Math.sin(phase * 0.6 + p.phase) * p.drift;
        const swell = Math.sin((sx * 0.105) + phase) * amplitude;
        const chopS = Math.sin((sx * 0.49) - phase * 1.35) * amplitude * 0.34;
        const crestY = yBase + swell + chopS + (sx - 50) * 0.025;
        const twinkle = 0.5 + 0.5 * Math.sin(phase * 1.8 + p.phase * 1.7);
        p.el.setAttribute("cx", sx.toFixed(2));
        p.el.setAttribute("cy", (crestY - p.lift * (0.6 + 0.4 * twinkle)).toFixed(2));
        p.el.setAttribute("opacity", (sprayEnv * (0.35 + 0.65 * twinkle)).toFixed(3));
      });

      if (foamFieldRef.current) {
        foamFieldRef.current.style.opacity = String(
          clamp(mapRange(0.08, 0.2, 0, 1, progress)) *
          clamp(mapRange(0.95, 0.78, 0, 1, progress))
        );
      }
    }

    // Initialize state
    renderShoreline(0);

    // Initialize ScrollTrigger immediately to capture scroll events synchronously
    const scrubTl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".scroll-track",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => renderShoreline(self.progress)
      }
    });

    scrubTl
      .to(beachCopyRef.current ? beachCopyRef.current.querySelector(".headline") : null, { yPercent: -8 }, 0)
      .to(destinationCopyRef.current ? destinationCopyRef.current.querySelector(".headline") : null, { yPercent: -4 }, 0);

    // Short timeout to refresh bounding boxes after layout paint finishes
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 60);

    // 3. Mouse pointer parallax handling (runs synchronously on desktop pointers)
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cleanupTicker: (() => void) | undefined;

    if (finePointer && motionOk && travelFrameRef.current) {
      const travelFrame = travelFrameRef.current;
      const layers = [
        { el: beachCopyRef.current, x: -13, y: -9 },
        { el: destinationCopyRef.current, x: -9, y: -6 }
      ];

      const pointer = { tx: 0, ty: 0, cx: 0, cy: 0 };

      const handlePointerMove = (event: PointerEvent) => {
        const rect = travelFrame.getBoundingClientRect();
        pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      };

      const handlePointerLeave = () => {
        pointer.tx = 0;
        pointer.ty = 0;
      };

      travelFrame.addEventListener("pointermove", handlePointerMove);
      travelFrame.addEventListener("pointerleave", handlePointerLeave);

      const tickerCallback = () => {
        pointer.cx += (pointer.tx - pointer.cx) * 0.07;
        pointer.cy += (pointer.ty - pointer.cy) * 0.07;
        layers.forEach((layer) => {
          if (layer.el) {
            gsap.set(layer.el, { x: layer.x * pointer.cx, y: layer.y * pointer.cy });
          }
        });
      };

      gsap.ticker.add(tickerCallback);

      cleanupTicker = () => {
        travelFrame.removeEventListener("pointermove", handlePointerMove);
        travelFrame.removeEventListener("pointerleave", handlePointerLeave);
        gsap.ticker.remove(tickerCallback);
      };
    }

    // Return unmount cleaner
    return () => {
      clearTimeout(timer);
      scrubTl.kill();
      if (scrubTl.scrollTrigger) {
        scrubTl.scrollTrigger.kill();
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (cleanupTicker) {
        cleanupTicker();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="wandr-theme select-none relative">
      
      {/* Shortened Back Button & Better alignment prevents header branding overlap */}
      <div className="fixed top-3.5 left-4 md:left-6 z-[100]">
        <button
          onClick={onBack}
          className="bg-black/85 hover:bg-[#209aa0] text-white hover:text-white border border-white/10 hover:border-[#209aa0] rounded-full px-4 py-2 text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-[0_4px_25px_rgba(32,154,160,0.15)] hover:scale-105 active:scale-95 duration-300"
        >
          <CornerDownLeft className="h-4 w-4 text-[#209aa0]" />
          <span className="font-semibold tracking-wider uppercase text-[10px]">Voltar</span>
        </button>
      </div>

      <main className="scroll-track" aria-label="Beach shoreline reveal demo">
        <section className="sticky-stage">
          <div className="travel-frame" id="travelFrame" ref={travelFrameRef}>
            <div className="plate ocean-plate" ref={oceanPlateRef} aria-hidden="true" />

            {/* Ocean Water Navigation */}
            <nav className="nav water-nav" aria-label="Primary">
              <a className="brand ml-20 md:ml-32" href="#brand" onClick={(e) => e.preventDefault()}>Wandr.</a>
              <div className="nav-links">
                <a className="active" href="#active" onClick={(e) => e.preventDefault()}>The Beaches</a>
                <a href="#map" onClick={(e) => { e.preventDefault(); setActiveOverlay('map'); }}>Map</a>
                <a href="#accommodations" onClick={(e) => { e.preventDefault(); setActiveOverlay('accommodation'); }}>Accommodation</a>
                <a href="#tours" onClick={(e) => { e.preventDefault(); setActiveOverlay('tours'); }}>Tours</a>
              </div>
              <div className="socials">
                <span className="hidden sm:inline">Follow Us</span>
                <span className="divider hidden sm:inline">—</span>
                <span className="icon cursor-pointer" role="img" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.247-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" /></svg>
                </span>
                <span className="icon cursor-pointer" role="img" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.045.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0 3.259-.014 3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </span>
              </div>
            </nav>

            {/* Sand Deck Navigation */}
            <nav className="nav sand-nav" aria-hidden="true" ref={sandNavRef}>
              <a className="brand ml-20 md:ml-32" href="#brand" onClick={(e) => e.preventDefault()}>Wandr.</a>
              <div className="nav-links">
                <a className="active" href="#active" onClick={(e) => e.preventDefault()}>The Beaches</a>
                <a href="#map" onClick={(e) => { e.preventDefault(); setActiveOverlay('map'); }}>Map</a>
                <a href="#accommodations" onClick={(e) => { e.preventDefault(); setActiveOverlay('accommodation'); }}>Accommodation</a>
                <a href="#tours" onClick={(e) => { e.preventDefault(); setActiveOverlay('tours'); }}>Tours</a>
              </div>
              <div className="socials">
                <span className="hidden sm:inline">Follow Us</span>
                <span className="divider hidden sm:inline">—</span>
                <span className="icon cursor-pointer" role="img" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.247-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" /></svg>
                </span>
                <span className="icon cursor-pointer" role="img" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0 3.259-.014 3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </span>
              </div>
            </nav>

            {/* Starting water layer Copy */}
            <div className="copy-layer beach-copy" ref={beachCopyRef} aria-hidden="true">
              <h1 className="headline">
                <span className="serif">Beach</span>
                <span className="script text-[#209aa0]">Vibes</span>
              </h1>
            </div>

            {/* Sand Plate Overlap Reveal */}
            <div className="plate sand-reveal" id="sandReveal" aria-hidden="true" ref={sandRevealRef}>
              <div className="copy-layer destination-copy" ref={destinationCopyRef}>
                <div className="destination-stack flex flex-col items-center justify-center text-center">
                  <h2 className="headline">
                    <span className="serif text-[#272a2b]">Coastal</span>
                    <span className="script text-[#d48143]">Escapes</span>
                  </h2>
                  <div className="details flex flex-col items-center">
                    <p className="eyebrow text-[#4c5457]">The world's top 20 beaches</p>
                    <p className="body-copy text-[#2d3335]">
                      From secluded coves and turquoise-trimmed bays to windswept,
                      black-sand coastlines carved from volcanic rock, this beach
                      edit follows the shoreline to the places worth lingering.
                    </p>
                    <button 
                      className="map-button" 
                      type="button"
                      onClick={() => setActiveOverlay('map')}
                    >
                      View On Map
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shoreline mechanical wave foam SVG graphics */}
            <svg 
              className="foam-field animate-pulse-slow" 
              id="foamField" 
              ref={foamFieldRef}
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="foamGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="55%" stopColor="#ffffff" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="foam-band" id="foamBand" ref={foamBandRef}></path>
              <path className="foam-shadow" id="foamShadow" ref={foamShadowRef}></path>
              <path className="foam-main" id="foamMain" ref={foamMainRef}></path>
              <path className="foam-spark" id="foamSpark" ref={foamSparkRef}></path>
              <g className="foam-spray" id="foamSpray" ref={foamSprayRef}></g>
            </svg>

            {/* Downward Scroll Cue widget */}
            <div className="scroll-cue" aria-hidden="true" ref={scrollCueRef}>
              <p className="scroll-copy font-semibold tracking-wider text-white">Scroll to discover the world's best beaches</p>
              <div className="arrow-box rounded-xl text-white font-bold flex items-center justify-center animate-bounce">
                ↓
              </div>
            </div>

            {/* Microfilm static grain overlay */}
            <div className="grain" aria-hidden="true"></div>
          </div>
        </section>
      </main>

      {/* Premium Glass-morphic Overlays */}
      {activeOverlay !== 'none' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer transition-opacity duration-300"
            onClick={() => setActiveOverlay('none')}
          />
          
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-neutral-900/95 text-white border border-white/10 p-6 md:p-10 shadow-2xl animate-in fade-in duration-200">
            <button 
              onClick={() => setActiveOverlay('none')}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center border border-white/10 transition-all active:scale-95 cursor-pointer z-50"
              aria-label="Controle de Saída"
            >
              <X className="h-5 w-5" />
            </button>

            {activeOverlay === 'map' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pr-8">
                  <div className="h-10 w-10 rounded-xl bg-[#209aa0]/20 flex items-center justify-center text-[#209aa0]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold italic tracking-wide text-white">Cartografia Costeira</h3>
                    <p className="text-xs text-neutral-400 tracking-wider uppercase font-semibold">Mapeamento em Tempo Real das Coordenadas</p>
                  </div>
                </div>

                <div className="relative aspect-[21/9] w-full rounded-2xl bg-neutral-950 border border-white/5 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <svg className="w-full h-full text-[#209aa0]/30 absolute inset-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M 0 25 Q 25 15, 50 22 T 100 20 L 100 40 L 0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" />
                    <circle cx="20" cy="18" r="0.8" fill="#209aa0" className="animate-pulse" />
                    <circle cx="45" cy="24" r="0.8" fill="#209aa0" className="animate-pulse" />
                    <circle cx="70" cy="15" r="0.8" fill="#209aa0" className="animate-pulse" />
                    <circle cx="90" cy="22" r="0.8" fill="#209aa0" className="animate-pulse" />
                  </svg>
                  <p className="text-xs font-mono tracking-widest text-[#209aa0]/80 z-10 uppercase bg-neutral-900/60 px-3 py-1.5 rounded-lg border border-[#209aa0]/20 animate-pulse text-center">
                    Sincronizando Sensor Costeiro Wandr...
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Baía do Sancho', loc: 'Fernando de Noronha, Brasil', desc: 'Famosa pelas águas azul-turquesa de alta nitidez e imponentes falésias verdes de basalto.' },
                    { name: 'Anse Source d\'Argent', loc: 'La Digue, Seychelles', desc: 'Arenas levemente rosadas banhadas por águas rasas e adornadas com rochedos majestosos esculpidos pelo tempo.' },
                    { name: 'Grace Bay', loc: 'Providenciales, Turks & Caicos', desc: 'Areias ultra macias cercadas por uma grandiosa barreira de corais polidos, formando águas calmas e límpidas.' },
                    { name: 'Whitehaven Beach', loc: 'Ilhas Whitsunday, Austrália', desc: 'Composta por 98.9% de sílica de quartzo puríssima, mantendo a areia fria sob os pés mesmo nas horas quentes.' }
                  ].map((bj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#209aa0]/40 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-white group-hover:text-[#209aa0] transition-colors">{bj.name}</div>
                        <span className="text-[9px] font-mono tracking-wider bg-white/10 px-2 py-0.5 rounded text-neutral-400 select-none">{idx === 0 ? '-3.85°' : idx === 1 ? '-4.36°' : idx === 2 ? '21.80°' : '-20.27°'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-2">{bj.loc}</div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{bj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeOverlay === 'accommodation' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pr-8">
                  <div className="h-10 w-10 rounded-xl bg-[#d48143]/20 flex items-center justify-center text-[#d48143]">
                    <BedDouble className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold italic tracking-wide text-white">Santuários Arquitetônicos</h3>
                    <p className="text-xs text-neutral-400 tracking-wider uppercase font-semibold">Vilas Privadas e Retiros de Ecoturismo de Luxo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { hotel: 'Sancho Eco-Resort', rate: '★ 5.0', desc: 'Bungalows flutuantes em sintonia com a reserva marinha original de Fernando de Noronha.', features: ['Chef Privado', 'Piscina de Borda Infinita', 'Acesso Restrito'] },
                    { hotel: 'Six Senses Zil Pasyon', rate: '★ 4.9', desc: 'Moradas esculpidas nos rochedos de granito negro da ilha de Félicité nas Seychelles.', features: ['Spa Holístico', 'Observatório', 'Heliponto'] },
                    { hotel: 'COMO Parrot Cay', rate: '★ 5.0', desc: 'Santuário minimalista e sofisticado em ilha privada com quilômetros de costas desertas.', features: ['Yôga Shala', 'Clube de Mergulho', 'Serviço de Mordomia'] },
                    { hotel: 'Qualia Pavilions', rate: '★ 4.9', desc: 'Design zen de inspiração australiana com vistas arrebatadoras sobre as águas do Mar de Coral.', features: ['Catamarã à Vela', 'Adega Privativa', 'Golf Car Elétrico'] }
                  ].map((hc, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#d48143]/40 transition-all flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-lg text-white group-hover:text-[#d48143] transition-colors">{hc.hotel}</span>
                          <span className="text-[10px] text-yellow-500 font-mono font-bold tracking-wide">{hc.rate}</span>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed mb-4">{hc.desc}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                        {hc.features.map((ft, fidx) => (
                          <span key={fidx} className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 bg-white/5 px-2 py-1 rounded">
                            {ft}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeOverlay === 'tours' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pr-8">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold italic tracking-wide text-white">Expedições do Litoral</h3>
                    <p className="text-xs text-neutral-400 tracking-wider uppercase font-semibold">Excursões Exclusivas e Aventuras de Baixo Impacto</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Navegação em Catamarã à Vela', time: 'Privado • Meio Dia', info: 'Navegue pelo contorno das enseadas a bordo de um catamarã solar guiado por biólogos marinhos.' },
                    { title: 'Mergulho de Fenda Atol', time: 'Certificado • 3 Horas', info: 'Explore fendas vulcânicas submersas e recifes de coral ornamentados com rica fauna subaquática.' },
                    { title: 'Trilha do Litoral Selvagem', time: 'Guiado • Dia Inteiro', info: 'Travessia pedestre fotográfica por praias desertas e falésias esculpidas em rocha vulcânica antiga.' },
                    { title: 'Caiaque em Baías Bioluminescentes', time: 'Noturno • 2 Horas', info: 'Remada sensorial guiada sob constelações com plânctons brilhantes reagindo ao toque de cada remo.' }
                  ].map((tour, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#0e0f10] border border-white/5 hover:border-orange-500/30 transition-all flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-base text-white group-hover:text-orange-400 transition-colors">{tour.title}</span>
                          <span className="text-[9px] font-mono tracking-widest uppercase text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded font-extrabold">{tour.time}</span>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed my-2">{tour.info}</p>
                      </div>
                      <div className="mt-3 w-full text-center text-[11px] font-semibold text-neutral-400 hover:text-white transition-colors bg-white/5 rounded-lg py-2 border border-white/10 select-none">
                        Vagas sob consulta via rádio
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
