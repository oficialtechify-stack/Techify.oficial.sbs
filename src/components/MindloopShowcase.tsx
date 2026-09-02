import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, Twitter, ArrowRight, CornerDownLeft, Check, Compass, BookOpen, Users, Cpu, ShieldCheck } from 'lucide-react';
import Hls from 'hls.js';

interface MindloopShowcaseProps {
  onBack: () => void;
}

// FadeUp helper configuration
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(10px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: false, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

// Reusable animated Word component for the scroll reveal
interface ScrollWordRevealProps {
  text: string;
  highlights: string[];
}

function ScrollWordReveal({ text, highlights }: ScrollWordRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 45%"]
  });

  const words = text.split(" ");

  return (
    <div ref={containerRef} className="flex flex-wrap gap-x-2 gap-y-3 justify-center max-w-4xl mx-auto">
      {words.map((word, index) => {
        const start = index / words.length;
        const end = (index + 1) / words.length;
        
        // Map opacity based on progress range for each individual word
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);

        // Strip punctuation to check for highlight match
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()—?]/g, "").toLowerCase();
        const isHighlighted = highlights.some(h => cleanWord.includes(h.toLowerCase()));

        return (
          <motion.span
            key={index}
            style={{ opacity }}
            className={`text-2xl md:text-4xl lg:text-5xl font-medium tracking-tight transition-all duration-150 ${
              isHighlighted 
                ? 'text-white font-semibold' 
                : 'text-neutral-400'
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}

export default function MindloopShowcase({ onBack }: MindloopShowcaseProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const ctaVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize HLS for the CTA video background
  useEffect(() => {
    const video = ctaVideoRef.current;
    if (!video) return;

    const streamUrl = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Aborted video playing", e));
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for native Safari
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log("Aborted video playing in Safari", e));
      });
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 4500);
  };

  return (
    <div className="mindloop-theme min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans relative antialiased overflow-x-hidden">
      
      {/* 0. Voltar ao Portfólio fixed trigger button */}
      <div className="fixed top-24 left-6 md:left-12 z-[100]">
        <button
          onClick={onBack}
          className="bg-black/80 hover:bg-white hover:text-black text-white border border-white/20 rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95"
        >
          <CornerDownLeft className="h-4 w-4 text-white hover:text-black transition-colors" />
          <span>Voltar ao Portfólio</span>
        </button>
      </div>

      {/* 1. Navbar (fixed, transparent) */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-28 py-5 bg-black/20 backdrop-blur-md border-b border-white/[0.04]">
        {/* Left: Logo (concentric circles) + Text */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full border border-white/60" />
          </div>
          <span className="text-xl font-bold tracking-tight select-none">Mindloop</span>
        </div>

        {/* Center: Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#hero" className="text-neutral-400 hover:text-white transition-colors">Home</a>
          <span className="text-neutral-700 select-none">•</span>
          <a href="#search-changed" className="text-neutral-400 hover:text-white transition-colors">How It Works</a>
          <span className="text-neutral-700 select-none">•</span>
          <a href="#mission" className="text-neutral-400 hover:text-white transition-colors">Philosophy</a>
          <span className="text-neutral-700 select-none">•</span>
          <a href="#solutions" className="text-neutral-400 hover:text-white transition-colors">Use Cases</a>
        </div>

        {/* Right: Social Icons housed inside liquid-glass buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/techify.oficial"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-neutral-300 hover:text-white"
          >
            <Instagram className="h-4.5 w-4.5" />
          </a>
        </div>
      </nav>

      {/* 2. Hero Section (full viewport height) */}
      <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden pt-16">
        {/* Autoplay looping video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-45"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4" type="video/mp4" />
        </video>

        {/* Gradient black overlay to fade bottom edge to pure black background */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

        {/* Content Box */}
        <div className="relative z-20 text-center max-w-4xl px-6 pt-24 md:pt-32 flex flex-col items-center">
          {/* Avatar subscriber row */}
          <motion.div 
            {...fadeUp(0.1)}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Mindloop subscriber 1"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-black object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Mindloop subscriber 2"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-black object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Mindloop subscriber 3"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-black object-cover"
              />
            </div>
            <span className="text-neutral-400 text-sm font-medium">
              7,000+ people already subscribed
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            {...fadeUp(0.25)}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-none mb-6 text-white"
          >
            Get <span className="font-serif italic font-normal text-white">Inspired</span> with Us
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            {...fadeUp(0.4)}
            className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mb-10 leading-relaxed font-light"
          >
            Join our feed for meaningful updates, news around technology and a shared journey toward depth and direction.
          </motion.p>

          {/* Liquid Glass Email form */}
          <motion.form 
            onSubmit={handleSubscribe}
            {...fadeUp(0.55)}
            className="liquid-glass rounded-full p-1.5 w-full max-w-lg flex items-center gap-2 border border-white/10"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-transparent border-none outline-none text-white text-sm pl-5 py-2.5 flex-grow placeholder-neutral-500 rounded-full"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-black font-extrabold text-xs tracking-wider uppercase px-8 py-3 rounded-full cursor-pointer transition-colors hover:bg-neutral-200"
            >
              SUBSCRIBE
            </motion.button>
          </motion.form>

          {/* Subscription success indicator */}
          <AnimatePresence>
            {subscribed && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="mt-4 text-emerald-400 font-medium text-sm flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Success! You've joined the loop.</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* 3. "Search has changed" Section */}
      <section id="search-changed" className="relative w-full pt-44 md:pt-60 pb-20 px-6 md:px-28">
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Heading */}
          <motion.h2 
            {...fadeUp(0.1)}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 leading-none text-white"
          >
            Search has <span className="font-serif italic font-normal text-white">changed</span>. Have you?
          </motion.h2>

          {/* Subtitle */}
          <motion.p 
            {...fadeUp(0.25)}
            className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto mb-20 leading-relaxed font-light"
          >
            Algorithms curate our world, delivering custom feeds directly to our screens. Navigating this ocean requires intentional filters, focused channels, and trusted content hubs.
          </motion.p>

          {/* 3 Platform cards with custom beautiful vectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-24">
            
            {/* Card 1: ChatGPT */}
            <motion.div 
              {...fadeUp(0.1)}
              className="bg-zinc-950/40 border border-neutral-900 rounded-3xl p-8 flex flex-col items-center hover:border-neutral-800 transition-all group"
            >
              <div className="w-48 h-48 flex items-center justify-center rounded-2xl mb-8 bg-black border border-white/[0.03] transition-transform group-hover:scale-105 duration-300">
                {/* Advanced Monochrome vector chatgpt symbol replica */}
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white hover:rotate-45 transition-transform duration-700">
                  <path d="M4.5 16.5C4.5 13.5 6.5 11.5 9.5 11.5H14.5M19.5 7.5C19.5 10.5 17.5 12.5 14.5 12.5H9.5" />
                  <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                  <path d="M12 5V19M5 12H19" strokeOpacity="0.4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cognitive Feed</h3>
              <p className="text-zinc-500 text-sm leading-relaxed text-center">
                Access curated newsletters breaking down complex AI logic, cognitive models, and prompting frameworks.
              </p>
            </motion.div>

            {/* Card 2: Perplexity */}
            <motion.div 
              {...fadeUp(0.25)}
              className="bg-zinc-950/40 border border-neutral-900 rounded-3xl p-8 flex flex-col items-center hover:border-neutral-800 transition-all group"
            >
              <div className="w-48 h-48 flex items-center justify-center rounded-2xl mb-8 bg-black border border-white/[0.03] transition-transform group-hover:scale-105 duration-300">
                {/* Perplexity premium monogram vector */}
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Deep Synthesis</h3>
              <p className="text-zinc-500 text-sm leading-relaxed text-center">
                Insight engines translating search signals into actionable trend databases and hyper-focused reports.
              </p>
            </motion.div>

            {/* Card 3: Google */}
            <motion.div 
              {...fadeUp(0.4)}
              className="bg-zinc-950/40 border border-neutral-900 rounded-3xl p-8 flex flex-col items-center hover:border-neutral-800 transition-all group"
            >
              <div className="w-48 h-48 flex items-center justify-center rounded-2xl mb-8 bg-black border border-white/[0.03] transition-transform group-hover:scale-105 duration-300">
                {/* Google AI monochrome vector replica */}
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <circle cx="12" cy="12" r="4" strokeDasharray="2 2" />
                  <path d="M12 2V4M12 20V22M2 12H4M20 12H22" strokeOpacity="0.6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Next-Gen Delivery</h3>
              <p className="text-zinc-500 text-sm leading-relaxed text-center">
                Uncompromising standard of information flow. Delivering clarity in an age of automated digital fatigue.
              </p>
            </motion.div>

          </div>

          {/* Bottom Tagline */}
          <motion.div 
            {...fadeUp(0.2)}
            className="text-neutral-500 text-xs uppercase tracking-[3px]"
          >
            "If you don't answer the questions, someone else will."
          </motion.div>
        </div>
      </section>

      {/* 4. Mission Section */}
      <section id="mission" className="relative w-full py-28 px-6 md:px-28 bg-black flex flex-col items-center">
        
        {/* Large 800x800 looping autoplay video (centered) */}
        <div className="w-full max-w-[700px] aspect-square rounded-3xl overflow-hidden border border-white/[0.05] relative mb-16 bg-zinc-950 flex items-center justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4" type="video/mp4" />
          </video>
          {/* Subtle scanning laser graphic overlapping the video */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 animate-[laser-scan_4s_linear_infinite]" />
        </div>

        {/* Scroll-driven word-by-word reveals */}
        <div className="space-y-16 text-center max-w-4xl py-12">
          
          {/* Paragraph 1 */}
          <ScrollWordReveal 
            text="We're building a space where curiosity meets clarity — where readers find depth, writers find reach, and every newsletter becomes a conversation worth having." 
            highlights={["curiosity", "meets", "clarity"]} 
          />

          {/* Paragraph 2 */}
          <ScrollWordReveal 
            text="A platform where content, community, and insight flow together — with less noise, less friction, and more meaning for everyone involved." 
            highlights={["content", "community", "insight", "meaning"]}
          />

        </div>
      </section>

      {/* 5. Solution Section */}
      <section id="solutions" className="relative w-full py-32 md:py-44 border-t border-white/[0.06] px-6 md:px-28">
        <div className="max-w-6xl mx-auto">
          
          {/* Label & Heading */}
          <div className="mb-20 text-center md:text-left">
            <span className="text-white/40 text-xs font-semibold tracking-[4px] uppercase mb-3 block">SOLUTION</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">
              The platform for <span className="font-serif italic font-normal text-white">meaningful</span> content
            </h2>
          </div>

          {/* Premium aspect-[3/1] looping object-cover video */}
          <div className="w-full aspect-[2.5/1] md:aspect-[3/1] rounded-2xl overflow-hidden border border-white/[0.05] relative mb-20 bg-zinc-950">
            <video
              autoPlay
              loop
              muted
              playsInline
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-50"
            >
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4" type="video/mp4" />
            </video>
          </div>

          {/* 4-column feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
            
            {/* Grid 1: Curated Feed */}
            <motion.div {...fadeUp(0.1)} className="space-y-3">
              <div className="text-white flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <span className="font-semibold text-base">Curated Feed</span>
                <Compass className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                No cluttered mailboxes. High fidelity digest matching your precise mental models, delivered every week.
              </p>
            </motion.div>

            {/* Grid 2: Writer Tools */}
            <motion.div {...fadeUp(0.2)} className="space-y-3">
              <div className="text-white flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <span className="font-semibold text-base">Writer Tools</span>
                <BookOpen className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Markdown editor, collaborative proofing, automated layout renders, and deeper analytics for creators.
              </p>
            </motion.div>

            {/* Grid 3: Community */}
            <motion.div {...fadeUp(0.3)} className="space-y-3">
              <div className="text-white flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <span className="font-semibold text-base">Community</span>
                <Users className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Connect and converse with readers in cryptographic micro-forums built beneath each publication loop.
              </p>
            </motion.div>

            {/* Grid 4: Distribution */}
            <motion.div {...fadeUp(0.4)} className="space-y-3">
              <div className="text-white flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <span className="font-semibold text-base">Distribution</span>
                <ShieldCheck className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Seamless multi-platform push, native RSS support, secure sub-accounts, and immutable content archives.
              </p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 6. CTA Section (with HLS streaming integration) */}
      <section id="cta" className="relative w-full py-44 md:py-64 border-t border-white/[0.06] flex items-center justify-center overflow-hidden">
        {/* Background HLS Stream video */}
        <video
          ref={ctaVideoRef}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40"
        />

        {/* Backdrop glass overlay */}
        <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none" />

        {/* Content Box */}
        <div className="relative z-20 text-center max-w-3xl px-6 flex flex-col items-center">
          {/* Concentric Circles logo (w-10 outer, w-5 inner) */}
          <div className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center mb-8 relative after:content-[''] after:absolute after:inset-[-4px] after:border after:border-white/10 after:rounded-full">
            <div className="w-5 h-5 rounded-full border border-white/60" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-6xl font-medium tracking-tight mb-4 text-white leading-none">
            Start Your <span className="font-serif italic font-normal text-white">Journey</span>
          </h2>

          {/* Subtitle */}
          <p className="text-neutral-400 text-base md:text-lg mb-12 max-w-lg leading-relaxed font-light">
            Sign up for premium newsletters or request writer access to launch your publication.
          </p>

          {/* Two Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const target = document.getElementById('navbar');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-black font-extrabold text-xs tracking-widest uppercase px-10 py-4.5 rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              Subscribe Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => alert('Mindloop Content Creator dashboard represents a simulated interface. Under construction!')}
              className="liquid-glass text-white border border-white/20 font-extrabold text-xs tracking-widest uppercase px-10 py-4.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
            >
              Start Writing
            </motion.button>
          </div>

        </div>
      </section>

      {/* 7. Footer */}
      <footer className="relative w-full border-t border-white/[0.04] py-12 px-6 md:px-28 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-neutral-500 text-xs">
            © 2026 Mindloop. All rights reserved. Designed visually under premium asset guidelines.
          </p>
          <div className="flex items-center gap-6">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Terms of Service and Privacy Policies are placeholders under construction.')}} className="text-neutral-500 hover:text-white transition-colors text-xs">Privacy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service and Privacy Policies are placeholders under construction.')}} className="text-neutral-500 hover:text-white transition-colors text-xs">Terms</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Contact information is simulated.')}} className="text-neutral-500 hover:text-white transition-colors text-xs">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
