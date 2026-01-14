// ============================================
// AFFILIATE ENGINE
// ============================================
// Auto-appends affiliate tags to buy links
// Supports Amazon, and other major affiliate programs

export interface AffiliateConfig {
  amazon?: {
    associateTag: string;
    trackingId: string;
  };
  rakuten?: {
    affiliateId: string;
  };
  custom?: {
    domain: string;
    param: string;
    value: string;
  }[];
}

export interface AffiliateLink {
  original: string;
  transformed: string;
  platform: 'amazon' | 'rakuten' | 'google' | 'other';
  wasModified: boolean;
}

// ============================================
// PLATFORM DETECTION
// ============================================

function detectPlatform(url: string): AffiliateLink['platform'] {
  if (url.includes('amazon.') || url.includes('amzn.')) return 'amazon';
  if (url.includes('rakuten.') || url.includes('rakuten.co.jp')) return 'rakuten';
  if (url.includes('google.com/search')) return 'google';
  return 'other';
}

// ============================================
// AMAZON AFFILIATE TRANSFORMATION
// ============================================

function transformAmazonLink(url: string, tag: string): string {
  try {
    const urlObj = new URL(url);

    // Amazon uses 'tag' parameter for associate tag
    const existingParams = urlObj.searchParams;

    // Check if already has affiliate tag
    if (existingParams.get('tag')) {
      return url; // Already has a tag, don't override
    }

    // Add or update the tag
    existingParams.set('tag', tag);

    // Add tracking ID if provided
    if (existingParams.get('ascsubtag')) {
      // Keep existing sub-tag
    } else {
      existingParams.set('ascsubtag', 'giftghost');
    }

    urlObj.search = existingParams.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}

// ============================================
// RAKUTEN AFFILIATE TRANSFORMATION
// ============================================

function transformRakutenLink(url: string, affiliateId: string): string {
  try {
    const urlObj = new URL(url);

    // Rakuten uses 'affiliateId' or 'afid' parameter
    const existingParams = urlObj.searchParams;

    if (!existingParams.get('afid')) {
      existingParams.set('afid', affiliateId);
    }

    urlObj.search = existingParams.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}

// ============================================
// CUSTOM AFFILIATE TRANSFORMATION
// ============================================

function transformCustomLink(url: string, configs: AffiliateConfig['custom']): string {
  if (!configs || configs.length === 0) return url;

  for (const config of configs) {
    if (url.includes(config.domain)) {
      try {
        const urlObj = new URL(url);
        urlObj.searchParams.set(config.param, config.value);
        return urlObj.toString();
      } catch {
        continue;
      }
    }
  }

  return url;
}

// ============================================
// GOOGLE SEARCH TRANSFORMATION
// ============================================

function transformGoogleSearch(url: string): string {
  // For Google search, we can't add affiliate directly
  // But we can add UTM parameters for tracking
  try {
    const urlObj = new URL(url);

    // Add UTM parameters for analytics
    if (!urlObj.searchParams.get('utm_source')) {
      urlObj.searchParams.set('utm_source', 'giftghost');
      urlObj.searchParams.set('utm_medium', 'affiliate');
      urlObj.searchParams.set('utm_campaign', 'gift-recommendation');
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

// ============================================
// MAIN TRANSFORMATION FUNCTION
// ============================================

export function transformAffiliateLink(
  url: string,
  config: AffiliateConfig
): AffiliateLink {
  const platform = detectPlatform(url);
  let transformed = url;
  let wasModified = false;

  // Amazon transformation
  if (platform === 'amazon' && config.amazon) {
    const newUrl = transformAmazonLink(url, config.amazon.associateTag);
    if (newUrl !== url) {
      transformed = newUrl;
      wasModified = true;
    }
  }

  // Rakuten transformation
  if (platform === 'rakuten' && config.rakuten) {
    const newUrl = transformRakutenLink(url, config.rakuten.affiliateId);
    if (newUrl !== url) {
      transformed = newUrl;
      wasModified = true;
    }
  }

  // Custom transformations
  if (config.custom) {
    const newUrl = transformCustomLink(url, config.custom);
    if (newUrl !== url) {
      transformed = newUrl;
      wasModified = true;
    }
  }

  // Google search link enhancement
  if (platform === 'google') {
    const newUrl = transformGoogleSearch(url);
    if (newUrl !== url) {
      transformed = newUrl;
      wasModified = true;
    }
  }

  return {
    original: url,
    transformed,
    platform,
    wasModified,
  };
}

// ============================================
// BATCH TRANSFORMATION
// ============================================

export function transformAllAffiliateLinks(
  links: string[],
  config: AffiliateConfig
): AffiliateLink[] {
  return links.map(link => transformAffiliateLink(link, config));
}

// ============================================
// LINK VALIDATION
// ============================================

export interface LinkValidation {
  isValid: boolean;
  platform: AffiliateLink['platform'];
  warnings: string[];
}

export function validateAffiliateLink(url: string): LinkValidation {
  const platform = detectPlatform(url);
  const warnings: string[] = [];

  try {
    const urlObj = new URL(url);

    if (!urlObj.protocol.startsWith('http')) {
      warnings.push('Invalid protocol');
    }

    if (platform === 'amazon') {
      // Check for Amazon-specific issues
      if (!url.includes('/dp/') && !url.includes('/gp/product/')) {
        warnings.push('May not be a direct product link');
      }
    }

    return {
      isValid: urlObj.protocol.startsWith('http'),
      platform,
      warnings,
    };
  } catch {
    return {
      isValid: false,
      platform: 'other',
      warnings: ['Invalid URL format'],
    };
  }
}

// ============================================
// CONFIG MANAGEMENT
// ============================================

export function getAffiliateConfig(): AffiliateConfig {
  return {
    amazon: process.env.AMAZON_ASSOCIATE_TAG
      ? {
          associateTag: process.env.AMAZON_ASSOCIATE_TAG,
          trackingId: process.env.AMAZON_TRACKING_ID || 'giftghost-20',
        }
      : undefined,
    rakuten: process.env.RAKUTEN_AFFILIATE_ID
      ? { affiliateId: process.env.RAKUTEN_AFFILIATE_ID }
      : undefined,
    custom: process.env.CUSTOM_AFFILIATE_DOMAINS
      ? parseCustomAffiliates(process.env.CUSTOM_AFFILIATE_DOMAINS)
      : undefined,
  };
}

interface CustomAffiliateInput {
  domain: string;
  param: string;
  value: string;
}

function parseCustomAffiliates(envValue: string): AffiliateConfig['custom'] {
  try {
    return JSON.parse(envValue) as AffiliateConfig['custom'];
  } catch {
    return undefined;
  }
}

// ============================================
// ANALYTICS TRACKING
// ============================================

export interface AffiliateAnalytics {
  linkId: string;
  originalUrl: string;
  affiliateUrl: string;
  platform: AffiliateLink['platform'];
  wasClicked: boolean;
  convertedAt?: Date;
  revenue?: number;
}

export function trackAffiliateClick(analytics: AffiliateAnalytics): void {
  // In production, this would send to analytics backend
  console.log('📊 Affiliate click tracked:', {
    ...analytics,
    timestamp: new Date().toISOString(),
  });
}
