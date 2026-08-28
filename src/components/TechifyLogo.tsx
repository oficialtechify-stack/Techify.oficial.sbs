import React from 'react';
import logoImage from '../assets/images/techify_logo_original_1786362412096.jpg';

interface TechifyIconProps {
  className?: string;
  color?: string;
}

export function TechifyIcon({ className = "h-8 w-8" }: TechifyIconProps) {
  return (
    <img
      src={logoImage}
      alt="TECHIFY Logo Icon"
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}

interface TechifyLogoProps {
  iconClassName?: string;
  textClassName?: string;
  layout?: 'horizontal' | 'vertical';
  showText?: boolean;
}

export default function TechifyLogo({
  iconClassName = "h-8 w-8",
  textClassName = "text-xl font-black text-white tracking-wider",
  layout = 'horizontal',
  showText = true,
}: TechifyLogoProps) {
  if (layout === 'vertical') {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <img
          src={logoImage}
          alt="TECHIFY Logo"
          className={`object-contain ${iconClassName}`}
          referrerPolicy="no-referrer"
        />
        {showText && (
          <span className={`font-display mt-2 uppercase ${textClassName}`}>
            TECHIFY
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoImage}
        alt="TECHIFY Logo"
        className={`object-contain ${iconClassName}`}
        referrerPolicy="no-referrer"
      />
      {showText && (
        <span className={`font-display uppercase leading-tight ${textClassName}`}>
          TECHIFY
        </span>
      )}
    </div>
  );
}

