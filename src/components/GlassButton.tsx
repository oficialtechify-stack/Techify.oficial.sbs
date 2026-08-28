"use client";

import React from "react";

export interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "lime" | "emerald" | "dark" | "white" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
}

// Global SVG Filter required for liquid glass distortion
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none", position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.001 0.005"
          numOctaves="1"
          seed="17"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="200"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

// Liquid Glass Effect Wrapper
export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
  onClick,
  type = "button",
  disabled = false,
  variant = "lime",
}) => {
  const glassBoxShadow =
    variant === "lime"
      ? "0 6px 20px rgba(163, 230, 53, 0.25), 0 0 12px rgba(163, 230, 53, 0.15)"
      : variant === "emerald"
      ? "0 6px 20px rgba(16, 185, 129, 0.25), 0 0 12px rgba(16, 185, 129, 0.15)"
      : "0 6px 15px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 255, 255, 0.05)";

  const bgOverlay =
    variant === "lime"
      ? "rgba(163, 230, 53, 0.22)"
      : variant === "emerald"
      ? "rgba(16, 185, 129, 0.22)"
      : variant === "white"
      ? "rgba(255, 255, 255, 0.25)"
      : "rgba(20, 20, 20, 0.5)";

  const textAndBorderColor =
    variant === "lime"
      ? "text-white hover:text-white"
      : variant === "emerald"
      ? "text-white"
      : "text-neutral-200 hover:text-white";

  const glassStyle: React.CSSProperties = {
    boxShadow: glassBoxShadow,
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  const innerContent = (
    <div
      className={`relative inline-flex items-center justify-center font-bold overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] active:scale-[0.97] ${textAndBorderColor} ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} ${className}`}
      style={glassStyle}
      onClick={onClick}
    >
      {/* Glass Distortion Layer */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          backdropFilter: "blur(5px)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
      />

      {/* Tint Overlay */}
      <div
        className="absolute inset-0 z-10 rounded-[inherit] transition-all duration-300"
        style={{ background: bgOverlay }}
      />

      {/* Inset Liquid Border Highlights */}
      <div
        className="absolute inset-0 z-20 rounded-[inherit] overflow-hidden pointer-events-none"
        style={{
          boxShadow:
            variant === "lime"
              ? "inset 1.5px 1.5px 2px 0 rgba(255, 255, 255, 0.6), inset -1px -1px 1px 1px rgba(163, 230, 53, 0.4)"
              : "inset 1.5px 1.5px 2px 0 rgba(255, 255, 255, 0.4), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.15)",
        }}
      />

      {/* Button Content */}
      <div className="relative z-30 flex items-center justify-center gap-2 transition-all duration-300">
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel="noopener noreferrer"
        className="inline-block no-underline"
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className="inline-block border-none bg-transparent p-0 cursor-pointer"
      onClick={onClick}
    >
      {innerContent}
    </button>
  );
};

// Ready-to-use GlassButton component
export const GlassButton: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  size = "md",
  variant = "lime",
  ...props
}) => {
  const sizeClasses =
    size === "sm"
      ? "px-4 py-2 text-xs rounded-xl sm:rounded-2xl"
      : size === "md"
      ? "px-6 py-3 text-sm rounded-2xl sm:rounded-3xl"
      : size === "lg"
      ? "px-8 py-4 text-base rounded-3xl"
      : "px-10 py-5 text-lg rounded-3xl sm:rounded-4xl";

  return (
    <GlassEffect
      variant={variant}
      className={`${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </GlassEffect>
  );
};

export default GlassButton;
