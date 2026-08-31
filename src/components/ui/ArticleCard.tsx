import React, { useState, useEffect } from "react";
import { Badge } from "./badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "./card";
import { cn } from "@/src/lib/utils";
import { 
  CardCustomizerSettings, 
  DEFAULT_CARD_SETTINGS, 
  getCachedCardSettings, 
  subscribeToCardSettings 
} from "@/src/lib/cardStyles";

export interface ArticleCardProps {
  headline: string;
  excerpt: string;
  cover?: string;
  tag?: string;
  readingTime?: number; // in seconds
  writer?: string;
  publishedAt?: Date;
  clampLines?: number;
  videoSrc?: string;
  onClick?: () => void;
  actionButton?: React.ReactNode;
  customSettings?: Partial<CardCustomizerSettings>;
}

// Human-friendly read time: seconds -> "X min read"
export function formatReadTime(seconds: number): string {
  if (!seconds || seconds < 60) return "Less than 1 min read";
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min read`;
}

// Date -> "Aug 15, 2025" (localized but concise)
export function formatPostDate(date: Date): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  cover,
  tag,
  readingTime,
  headline,
  excerpt,
  writer,
  publishedAt,
  clampLines: propClampLines,
  videoSrc,
  onClick,
  actionButton,
  customSettings,
}) => {
  const [globalSettings, setGlobalSettings] = useState<CardCustomizerSettings>(getCachedCardSettings);

  useEffect(() => {
    const unsub = subscribeToCardSettings((newSettings) => {
      setGlobalSettings(newSettings);
    });
    return () => unsub();
  }, []);

  const effectiveSettings = { ...globalSettings, ...customSettings };
  const effectiveClamp直接 = propClampLines !== undefined ? propClampLines : effectiveSettings.clampLines;

  const hasMeta = (effectiveSettings.showBadge && tag) || (effectiveSettings.showReadingTime && readingTime);
  const hasFooter不易 = effectiveSettings.showFooter && (writer || publishedAt || actionButton);

  return (
    <Card 
      onClick={onClick}
      style={{
        maxWidth: `${effectiveSettings.cardMaxWidth}px`,
        backgroundColor: effectiveSettings.cardBgColor,
        borderColor: effectiveSettings.borderColor,
        borderRadius: `${effectiveSettings.cardBorderRadius}px`,
        padding: `${effectiveSettings.cardPadding}px`,
        gap: `${effectiveSettings.elementsGap}px`,
      }}
      className={cn(
        "flex w-full flex-col overflow-hidden border shadow-lg transition-all duration-300 hover:shadow-2xl",
        onClick && "cursor-pointer hover:border-neutral-700"
      )}
    >
      {(cover || videoSrc) && (
        <CardHeader className="p-0">
          <div 
            style={{
              height: `${effectiveSettings.coverHeight}px`,
              borderRadius: `${effectiveSettings.coverBorderRadius}px`,
            }}
            className="relative w-full overflow-hidden bg-neutral-950"
          >
            {videoSrc ? (
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  borderRadius: `${effectiveSettings.coverBorderRadius}px`,
                }}
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={cover}
                alt={headline}
                loading="lazy"
                style={{
                  borderRadius: `${effectiveSettings.coverBorderRadius}px`,
                }}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </div>
        </CardHeader>
      )}

      <CardContent 
        style={{
          textAlign: effectiveSettings.textAlign,
        }}
        className="flex-grow p-1.5"
      >
        {hasMeta && (
          <div 
            style={{
              justifyContent: effectiveSettings.textAlign === 'center' ? 'center' : effectiveSettings.textAlign === 'right' ? 'flex-end' : 'flex-start'
            }}
            className="mb-3 flex items-center text-xs text-neutral-400"
          >
            {effectiveSettings.showBadge && tag && (
              <Badge 
                style={{
                  backgroundColor: effectiveSettings.badgeBgColor,
                  color: effectiveSettings.badgeTextColor,
                }}
                className="rounded-full border border-neutral-700/80 px-2.5 py-0.5 text-xs hover:text-white"
              >
                {tag}
              </Badge>
            )}
            {effectiveSettings.showBadge && tag && effectiveSettings.showReadingTime && readingTime && (
              <span className="mx-2 text-neutral-500">•</span>
            )}
            {effectiveSettings.showReadingTime && readingTime && (
              <span>{formatReadTime(readingTime)}</span>
            )}
          </div>
        )}

        <h2 
          style={{
            fontSize: `${effectiveSettings.headlineFontSize}px`,
            color: effectiveSettings.textColor,
            lineHeight: 1.25,
          }}
          className="mb-2 font-bold tracking-tight"
        >
          {headline}
        </h2>

        <p
          style={{
            fontSize: `${effectiveSettings.excerptFontSize}px`,
            color: effectiveSettings.excerptColor,
            lineHeight: effectiveSettings.lineHeight,
            WebkitLineClamp: effectiveClamp直接 && effectiveClamp直接 > 0 ? effectiveClamp直接 : undefined,
            display: effectiveClamp直接 && effectiveClamp直接 > 0 ? '-webkit-box' : 'block',
            WebkitBoxOrient: 'vertical',
            overflow: effectiveClamp直接 && effectiveClamp直接 > 0 ? 'hidden' : 'visible',
          }}
          className="text-neutral-400"
        >
          {excerpt}
        </p>
      </CardContent>

      {hasFooter不易 && (
        <CardFooter 
          style={{
            borderTop: `1px solid ${effectiveSettings.borderColor}`,
          }}
          className="flex items-center justify-between p-2 pt-2.5"
        >
          {writer && (
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">By</p>
              <p className="font-semibold text-xs text-neutral-300">{writer}</p>
            </div>
          )}
          {publishedAt && (
            <div className={writer ? "text-right" : ""}>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Published</p>
              <p className="font-semibold text-xs text-neutral-300">
                {formatPostDate(publishedAt)}
              </p>
            </div>
          )}
          {actionButton && (
            <div className="w-full">
              {actionButton}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ArticleCard;
