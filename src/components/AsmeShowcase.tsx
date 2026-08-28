import React, { useEffect, useRef, useState } from 'react';
import { Globe, ArrowRight, Instagram, Twitter, CornerDownLeft } from 'lucide-react';

interface AsmeShowcaseProps {
  onBack: () => void;
}

export default function AsmeShowcase({ onBack }: AsmeShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Custom JS Animation frame-based opacity fade interpolator
  const animateOpacity = (target: number, duration: number, callback?: () => void) => {
    if (!videoRef.current) return;

    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
    }

    const startOpacity = parseFloat(videoRef.current.style.opacity || '0');
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = startOpacity + (target - startOpacity) * progress;
      if (videoRef.current) {
        videoRef.current.style.opacity = current.toString();
      }

      if (progress < 1) {
        fadeRafRef.current = requestAnimationFrame(step);
      } else {
        fadeRafRef.current = null;
        if (callback) callback();
      }
    };

    fadeRafRef.current = requestAnimationFrame(step);
  };

  // Video Time updates checks for fading out before end
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const timeLeft = video.duration - video.currentTime;

    // Trigger fade-out 500ms when 0.55s remain before video ends
    if (timeLeft <= 0.55 && !fadingOutRef.current) {
      fadingOutRef.current = true;
      animateOpacity(0, 500);
    }
  };

  // Loop ended manual transition resetting
  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.style.opacity = '0';
    }

    setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play()
          .then(() => {
            fadingOutRef.current = false;
            animateOpacity(1, 500);
          })
          .catch((err) => {
            console.log('Video play triggered, but browser blocked sandbox context autoplay', err);
          });
      }
    }, 100);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.style.opacity = '0';
      // Attempt play on mount
      video.play()
        .then(() => {
          animateOpacity(1, 500);
        })
        .catch((err) => {
          console.log('Browser delayed auto-start, waiting for user click/focus context', err);
        });
    }

    return () => {
      if (fadeRafRef.current) {
        cancelAnimationFrame(fadeRafRef.current);
      }
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col text-white font-sans">
      
      {/* Background Video Player */}
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="absolute top-0 left-0 w-full h-full object-cover translate-y-[17%] pointer-events-none select-none z-0"
        style={{ opacity: 0, transition: 'none' }}
      />

      {/* Exclusivo: Floating Exit demo helper header to return to Techify */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={onBack}
          className="liquid-glass rounded-full px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        >
          <CornerDownLeft className="h-3.5 w-3.5 text-brand-lime" />
          <span>Sair da Demo</span>
        </button>
      </div>

      {/* Navigation bar Header */}
      <header className="relative z-20 pl-6 pr-6 py-6 w-full">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto w-full">
          
          {/* Leftside Brand */}
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-white" />
            <span className="font-semibold text-lg text-white">Asme</span>
          </div>

          {/* Centered navigation menus (tablet & desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Sign Up
            </button>
            <button className="liquid-glass rounded-full px-6 py-2 text-white hover:bg-white/5 transition-all text-sm font-medium">
              Login
            </button>
          </div>

        </div>
      </header>

      {/* Core Hero Content Container (Shifted -20% upwards) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%] w-full">
        
        {/* Main Display Heading with custom Instrument Serif inline styling */}
        <h1 
          className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight text-balance sm:whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        {/* Call to action boxes and Subtitle content */}
        <div className="max-w-xl w-full space-y-4">
          
          {/* Input control and signups */}
          <form onSubmit={handleSubscribe} className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 w-full">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-transparent border-none outline-none flex-1 text-white placeholder-white/40 text-base w-full focus:ring-0"
            />
            
            <button
              type="submit"
              className="bg-white rounded-full p-3 text-black hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ArrowRight className="h-5 w-5 stroke-[2.5]" />
            </button>
          </form>

          {/* Visual confirmation notification */}
          {subscribed && (
            <div className="text-xs text-brand-lime font-mono tracking-widest uppercase animate-pulse">
              Email Registered Successfully!
            </div>
          )}

          {/* Explanatory description paragraph */}
          <p className="text-white text-sm leading-relaxed px-4">
            Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
          </p>

          {/* Centered glass manifesto button */}
          <div className="pt-4 flex justify-center">
            <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Read our manifesto
            </button>
          </div>

        </div>

      </div>

      {/* Social Icons footer structure */}
      <footer className="relative z-10 flex justify-center gap-4 pb-12 w-full mt-auto">
        <a
          href="https://www.instagram.com/techify.oficial"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <Instagram className="h-5 w-5" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Twitter"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <Twitter className="h-5 w-5" />
        </a>
        <a
          href="https://google.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Website"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <Globe className="h-5 w-5" />
        </a>
      </footer>

    </div>
  );
}
