import React from 'react';
import { motion } from 'motion/react';
import { TechifyIcon } from './TechifyLogo';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
}

export default function LoadingScreen({
  message = "Carregando experiência...",
  subMessage = "Preparando interface e recursos de alto desempenho",
  fullscreen = true
}: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`${
        fullscreen ? 'fixed inset-0 z-50' : 'relative w-full min-h-[400px]'
      } flex flex-col items-center justify-center bg-[#030303]/95 backdrop-blur-xl px-4 select-none`}
    >
      {/* Background ambient neon glow */}
      <div className="absolute h-64 w-64 rounded-full bg-[#22c55e]/10 blur-3xl pointer-events-none animate-pulse" />

      {/* Center glowing logo and rings */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer rotating dash ring */}
        <div className="absolute h-24 w-24 rounded-full border-2 border-dashed border-[#22c55e]/30 animate-[spin_8s_linear_infinite]" />
        
        {/* Inner rotating gradient ring */}
        <div className="absolute h-20 w-20 rounded-full border-2 border-transparent border-t-[#22c55e] border-r-[#4ade80] animate-spin" />
        
        {/* Techify Icon Box */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-800 bg-[#060606] p-2.5 shadow-[0_0_30px_rgba(34,197,94,0.25)]"
        >
          <TechifyIcon className="h-8 w-8" />
        </motion.div>
      </div>

      {/* Brand title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-2 mb-2"
      >
        <span className="font-display text-base font-black tracking-widest text-white uppercase">
          TECHIFY
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-ping" />
      </motion.div>

      {/* Main loading message */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-sm font-semibold text-neutral-200 text-center max-w-sm"
      >
        {message}
      </motion.p>

      {/* Sub message */}
      {subMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xs text-neutral-500 text-center mt-1.5 max-w-xs"
        >
          {subMessage}
        </motion.p>
      )}

      {/* Smooth animated progress line */}
      <div className="relative mt-6 h-1 w-48 overflow-hidden rounded-full bg-neutral-900 border border-neutral-800">
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            ease: "easeInOut",
          }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#22c55e] to-transparent shadow-[0_0_12px_#22c55e]"
        />
      </div>
    </motion.div>
  );
}
