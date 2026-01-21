'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui';
import { useI18n } from '@/i18n';
import styles from './GhostCard.module.scss';

export interface GhostCardData {
  persona: string;
  painPoint: string;
  obsession: string;
  gift: {
    item: string;
    reason: string;
    priceRange?: string;
  };
}

interface ShareCardTranslations {
  logo: string;
  painPoint: string;
  obsession: string;
  perfectGift: string;
  footer: string;
  website: string;
  priceSymbol: string;
  saveImage: string;
  shareResult: string;
  shareTitle: string;
  shareText: string;
}

// ============================================
// CARD RENDERER (Server-side compatible with Satori)
// ============================================

export function generateCardSVG(data: GhostCardData, t: ShareCardTranslations): string {
  const { persona, painPoint, obsession, gift } = data;

  // Generate SVG for server-side rendering (Satori)
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" style="font-family: system-ui, sans-serif;">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFBF5"/>
          <stop offset="100%" style="stop-color:#FFF5EB"/>
        </linearGradient>
        <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FF7F6E"/>
          <stop offset="100%" style="stop-color:#FFA096"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="600" height="800" fill="url(#bgGrad)"/>

      <!-- Decorative circles -->
      <circle cx="500" cy="100" r="150" fill="#FF7F6E" opacity="0.1"/>
      <circle cx="100" cy="700" r="100" fill="#96DEC3" opacity="0.15"/>

      <!-- Header -->
      <text x="300" y="80" text-anchor="middle" font-size="28" font-weight="bold" fill="#FF7F6E">
        ${t.logo}
      </text>

      <!-- Persona Badge -->
      <rect x="100" y="120" width="400" height="60" rx="30" fill="url(#coralGrad)"/>
      <text x="300" y="160" text-anchor="middle" font-size="22" font-weight="bold" fill="white">
        ${persona}
      </text>

      <!-- Insights Grid -->
      <rect x="50" y="210" width="230" height="140" rx="20" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
      <text x="165" y="245" text-anchor="middle" font-size="14" fill="#FF7F6E" font-weight="600">${t.painPoint}</text>
      <text x="70" y="280" font-size="13" fill="#3C3C43" style="word-wrap: break-word;">
        ${painPoint.slice(0, 60)}...
      </text>

      <rect x="320" y="210" width="230" height="140" rx="20" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
      <text x="435" y="245" text-anchor="middle" font-size="14" fill="#C3AFFF" font-weight="600">${t.obsession}</text>
      <text x="340" y="280" font-size="13" fill="#3C3C43">
        ${obsession.slice(0, 60)}...
      </text>

      <!-- Gift Hero -->
      <rect x="50" y="380" width="500" height="280" rx="30" fill="url(#coralGrad)"/>
      <text x="300" y="430" text-anchor="middle" font-size="20" font-weight="bold" fill="white">${t.perfectGift}</text>

      <text x="300" y="480" text-anchor="middle" font-size="24" font-weight="bold" fill="white">
        ${gift.item}
      </text>

      <rect x="80" y="510" width="440" height="80" rx="15" fill="rgba(255,255,255,0.2)"/>
      <text x="300" y="555" text-anchor="middle" font-size="14" fill="white" font-style="italic">
        "${gift.reason.slice(0, 80)}"
      </text>

      ${gift.priceRange ? `
      <text x="300" y="620" text-anchor="middle" font-size="16" fill="rgba(255,255,255,0.9)">
        ${t.priceSymbol} ${gift.priceRange}
      </text>
      ` : ''}

      <!-- Footer -->
      <text x="300" y="720" text-anchor="middle" font-size="14" fill="#A0A0A5">
        ${t.footer}
      </text>
      <text x="300" y="750" text-anchor="middle" font-size="12" fill="#A0A0A5">
        ${t.website}
      </text>
    </svg>
  `;
}

// ============================================
// CLIENT-SIDE COMPONENT
// ============================================

interface GhostCardProps {
  data: GhostCardData;
  onShare?: () => void;
}

export function GhostCard({ data, onShare }: GhostCardProps) {
  const { t } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setIsExporting(true);

    try {
      // Dynamic import for client-side only
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#FFFBF5',
        scale: 2,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `giftghost-${data.persona.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [data.persona]);

  const handleShare = useCallback(async () => {
    // Trigger confetti for celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF7F6E', '#96DEC3', '#C3AFFF', '#FFC878'],
    });

    onShare?.();

    // Try native share if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareCard.shareTitle.replace('${persona}', data.persona),
          text: t.shareCard.shareText.replace('${gift}', data.gift.item),
          url: window.location.origin,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  }, [data, onShare, t]);

  return (
    <div className={styles.cardContainer}>
      {/* Card Preview */}
      <motion.div
        ref={cardRef}
        className={styles.card}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        {/* Background decoration */}
        <div className={styles.decoration}>
          <div className={styles.circleTopRight} />
          <div className={styles.circleBottomLeft} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.logo}>{t.shareCard.logo}</span>
        </div>

        {/* Persona Badge */}
        <div className={styles.personaBadge}>
          <Sparkles size={16} />
          <span>{data.persona}</span>
        </div>

        {/* Insights Grid */}
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightHeader}>
              <span className={styles.insightIcon}>💔</span>
              <span className={styles.insightLabel}>{t.shareCard.painPoint}</span>
            </div>
            <p className={styles.insightText}>{data.painPoint}</p>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightHeader}>
              <span className={styles.insightIcon}>💎</span>
              <span className={styles.insightLabel}>{t.shareCard.obsession}</span>
            </div>
            <p className={styles.insightText}>{data.obsession}</p>
          </div>
        </div>

        {/* Gift Hero */}
        <div className={styles.giftHero}>
          <div className={styles.giftBadge}>
            <span>✨ {t.shareCard.perfectGift} ✨</span>
          </div>

          <h3 className={styles.giftName}>{data.gift.item}</h3>

          <div className={styles.reasonBox}>
            <p>&ldquo;{data.gift.reason}&rdquo;</p>
          </div>

          {data.gift.priceRange && (
            <p className={styles.priceRange}>{t.shareCard.priceSymbol} {data.gift.priceRange}</p>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span>{t.shareCard.footer}</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          icon={<Download />}
          onClick={handleDownload}
          loading={isExporting}
        >
          {t.shareCard.saveImage}
        </Button>
        <Button
          variant="primary"
          icon={<Share2 />}
          onClick={handleShare}
        >
          {t.shareCard.shareResult}
        </Button>
      </div>
    </div>
  );
}

export default GhostCard;
