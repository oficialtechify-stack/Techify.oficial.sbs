import React, { useState, useEffect } from 'react';
import defaultLogoImage from '../assets/images/techify_logo_original_1786362412096.jpg';
import { LogoSettings, getCachedLogoSettings, initLogoSettingsListener } from '../lib/siteContent';

interface TechifyIconProps {
  className?: string;
  size?: number;
  color?: string;
  onClick?: () => void;
  showCustomSettings?: boolean;
}

export function TechifyIcon({ 
  className = "",
  size,
  onClick,
  showCustomSettings = true 
}: TechifyIconProps) {
  const [settings, setSettings] = useState<LogoSettings>(getCachedLogoSettings);

  useEffect(() => {
    if (!showCustomSettings) return;
    const unsub = initLogoSettingsListener((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, [showCustomSettings]);

  const displayImageSrc = settings.imageUrl || defaultLogoImage;
  const actualSize = size || settings.logoSize || 42;

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden shrink-0 flex items-center justify-center rounded-full transition-all ${className} ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      style={{
        width: `${actualSize}px`,
        height: `${actualSize}px`,
        borderRadius: `${settings.borderRadius}%`,
        backgroundColor: settings.backgroundColor || '#000000',
        border: settings.showOuterRing 
          ? `${settings.outerRingBorderWidth}px solid ${settings.outerRingColor}`
          : 'none',
        boxShadow: settings.glowEffect ? `0 0 20px ${settings.glowColor}70` : '0 2px 10px rgba(0,0,0,0.5)'
      }}
    >
      <img
        src={displayImageSrc}
        alt="TECHIFY Logo Icon"
        className="w-full h-full pointer-events-none select-none transition-transform duration-100"
        style={{
          objectFit: settings.objectFit || 'cover',
          transform: `scale(${settings.zoom / 100}) translate(${settings.offsetX}%, ${settings.offsetY}%) rotate(${settings.rotation}deg)`
        }}
        referrerPolicy="no-referrer"
      />
      {settings.showCenterDot && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: `${Math.max(2, Math.round(settings.centerDotSize * (actualSize / 50)))}px`,
            height: `${Math.max(2, Math.round(settings.centerDotSize * (actualSize / 50)))}px`,
            backgroundColor: settings.centerDotColor,
            boxShadow: settings.glowEffect ? `0 0 6px ${settings.glowColor}` : '0 0 2px rgba(0,0,0,0.8)'
          }}
        />
      )}
    </div>
  );
}

interface CircleEmblemDividerProps {
  className?: string;
  size?: number;
  onOpenCustomizer?: () => void;
}

export function CircleEmblemDivider({
  className = "w-full my-6",
  size,
  onOpenCustomizer
}: CircleEmblemDividerProps) {
  const [settings, setSettings] = useState<LogoSettings>(getCachedLogoSettings);

  useEffect(() => {
    const unsub = initLogoSettingsListener((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, []);

  const displayImageSrc = settings.imageUrl || defaultLogoImage;
  const actualSize = size || settings.emblemDividerSize || 52;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Left line */}
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

      {/* Circle center */}
      <div 
        onClick={onOpenCustomizer}
        className={`relative shrink-0 flex items-center justify-center transition-all ${
          onOpenCustomizer ? 'cursor-pointer hover:scale-105 group' : ''
        }`}
        style={{
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          borderRadius: `${settings.borderRadius}%`,
          backgroundColor: settings.backgroundColor || '#000000',
          border: settings.showOuterRing 
            ? `${settings.outerRingBorderWidth}px solid ${settings.outerRingColor}`
            : 'none',
          boxShadow: settings.glowEffect ? `0 0 20px ${settings.glowColor}50` : '0 2px 10px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        <img
          src={displayImageSrc}
          alt="TECHIFY Center Emblem"
          className="w-full h-full pointer-events-none select-none transition-transform duration-100"
          style={{
            objectFit: settings.objectFit || 'cover',
            transform: `scale(${settings.zoom / 100}) translate(${settings.offsetX}%, ${settings.offsetY}%) rotate(${settings.rotation}deg)`
          }}
          referrerPolicy="no-referrer"
        />

        {settings.showCenterDot && (
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: `${settings.centerDotSize}px`,
              height: `${settings.centerDotSize}px`,
              backgroundColor: settings.centerDotColor,
              boxShadow: settings.glowEffect ? `0 0 8px ${settings.glowColor}` : '0 0 3px rgba(0,0,0,0.8)'
            }}
          />
        )}
      </div>

      {/* Right line */}
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
  );
}

interface TechifyLogoProps {
  iconClassName?: string;
  textClassName?: string;
  layout?: 'horizontal' | 'vertical';
  showText?: boolean;
  onClick?: () => void;
}

export default function TechifyLogo({
  iconClassName = "h-8 w-8",
  textClassName = "text-xl font-black text-white tracking-wider",
  layout = 'horizontal',
  showText = true,
  onClick
}: TechifyLogoProps) {
  if (layout === 'vertical') {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col items-center justify-center text-center ${onClick ? 'cursor-pointer' : ''}`}
      >
        <TechifyIcon className={iconClassName} />
        {showText && (
          <span className={`font-display mt-2 uppercase ${textClassName}`}>
            TECHIFY
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <TechifyIcon className={iconClassName} />
      {showText && (
        <span className={`font-display uppercase leading-tight ${textClassName}`}>
          TECHIFY
        </span>
      )}
    </div>
  );
}
