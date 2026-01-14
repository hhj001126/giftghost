// ============================================
// URL FETCHER - Social Media Content Extraction
// ============================================
// Supports multiple extraction strategies: Firecrawl, Puppeteer, or API fallbacks
// Falls back gracefully if extraction fails

export interface FetchedContent {
  url: string;
  title: string;
  description: string;
  content: string;
  author?: string;
  profileImage?: string;
  posts?: string[];
  likes?: number;
  followers?: number;
  following?: number;
  extractedAt: Date;
  source: 'firecrawl' | 'puppeteer' | 'metadata' | 'og' | 'fallback';
}

export interface FetchOptions {
  timeout?: number;
  maxContentLength?: number;
  extractPosts?: boolean;
  extractMetadata?: boolean;
}

// ============================================
// EXTRACTION STRATEGIES
// ============================================

/**
 * Strategy 1: Firecrawl API (Recommended for production)
 * Get API key from https://firecrawl.dev
 */
async function fetchWithFirecrawl(url: string, apiKey?: string): Promise<Partial<FetchedContent> | null> {
  if (!apiKey) {
    console.log('🔍 Firecrawl: No API key configured');
    return null;
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        onlyMainContent: true,
        formats: ['markdown', 'metadata'],
      }),
    });

    if (!response.ok) {
      console.log('🔍 Firecrawl: API returned', response.status);
      return null;
    }

    const data = await response.json();
    return {
      content: data.markdown || '',
      title: data.metadata?.title || '',
      description: data.metadata?.description || '',
      source: 'firecrawl' as const,
    };
  } catch (error) {
    console.log('🔍 Firecrawl: Failed', error);
    return null;
  }
}

/**
 * Strategy 2: Puppeteer (Self-hosted alternative)
 * Note: Requires 'puppeteer-core' to be installed for this strategy
 * This is a placeholder for future implementation
 */
async function fetchWithPuppeteer(_url: string, _options?: FetchOptions): Promise<Partial<FetchedContent> | null> {
  console.log('🔍 Puppeteer: Not configured (requires puppeteer-core installation)');
  return null;
}

/**
 * Strategy 3: Metadata-only (Lightweight fallback)
 * Extracts only Open Graph and Twitter Card metadata
 */
async function fetchMetadata(url: string): Promise<Partial<FetchedContent> | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GiftGhost/1.0; +http://giftghost.com)',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Parse basic metadata from HTML
    const extractMeta = (selectors: string[]): string | undefined => {
      for (const selector of selectors) {
        const match = html.match(new RegExp(
          selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                  .replace('CONTENT', 'content="([^"]*)"'),
          'i'
        ));
        if (match) return match[1];
      }
      return undefined;
    };

    const title = extractMeta([
      '<meta property="og:title" content="CONTENT"',
      '<meta name="twitter:title" content="CONTENT"',
      '<title>',
    ]);

    const description = extractMeta([
      '<meta property="og:description" content="CONTENT"',
      '<meta name="twitter:description" content="CONTENT"',
    ]);

    return {
      title: title || '',
      description: description || '',
      source: 'metadata' as const,
    };
  } catch (error) {
    console.log('🔍 Metadata fetch: Failed', error);
    return null;
  }
}

// ============================================
// PLATFORM-SPECIFIC EXTRACTORS
// ============================================

const PLATFORM_PATTERNS = {
  instagram: /instagram\.com\/(p|reel|stories)\//,
  twitter: /twitter\.com\/(i\/web|web\/status)/,
  x: /x\.com\/(i\/web|web\/status)/,
  tiktok: /tiktok\.com\/@|tiktok\.com\/v/,
  xiaohongshu: /xiaohongshu\.com\/explore/,
  douyin: /douyin\.com\/video/,
  youtube: /youtube\.com\/watch/,
};

export function detectPlatform(url: string): string | null {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) return platform;
  }
  return 'unknown';
}

// ============================================
// MAIN FETCH FUNCTION
// ============================================

export async function fetchSocialContent(
  url: string,
  options: FetchOptions = {}
): Promise<FetchedContent> {
  const startTime = Date.now();
  const { timeout = 15000, maxContentLength = 10000 } = options;

  console.log(`🔍 Fetching content from: ${url}`);

  const platform = detectPlatform(url);

  // Try extraction strategies in order of preference
  const apiKey = process.env.FIRECRAWL_API_KEY;
  let result = await fetchWithFirecrawl(url, apiKey);

  if (!result) {
    result = await fetchWithPuppeteer(url, options);
  }

  if (!result || !result.content) {
    result = await fetchMetadata(url);
  }

  // Fallback for failed fetches
  if (!result || (!result.content && !result.title)) {
    result = {
      content: `[Could not extract content from ${url}]`,
      title: url,
      description: `Link shared by user: ${url}`,
      source: 'fallback',
    };
  }

  // Truncate content if needed
  const content = result.content?.slice(0, maxContentLength) || '';

  const fetchedContent: FetchedContent = {
    url,
    title: result.title || url,
    description: result.description || '',
    content,
    author: result.author,
    profileImage: result.profileImage,
    extractedAt: new Date(),
    source: result.source || 'fallback',
  };

  const duration = Date.now() - startTime;
  console.log(`✅ Content fetched (${fetchedContent.source}) in ${duration}ms`);

  return fetchedContent;
}

// ============================================
// SMART CONTENT PROCESSOR
// ============================================

export interface ProcessedContent {
  summary: string;
  keyInsights: string[];
  interests: string[];
  lifestyleHints: string[];
}

export function processFetchedContent(content: FetchedContent): ProcessedContent {
  // Simple heuristic-based processing
  // In production, this would use the LLM to analyze

  const text = content.content.toLowerCase();

  // Detect common interest keywords
  const interestKeywords = {
    tech: ['technology', 'software', 'app', 'code', 'computer', 'gadget', 'tech'],
    travel: ['travel', 'trip', 'vacation', 'adventure', 'explore', 'destination'],
    food: ['food', 'cooking', 'recipe', 'restaurant', 'cuisine', 'delicious'],
    fitness: ['fitness', 'workout', 'gym', 'exercise', 'health', 'running'],
    art: ['art', 'design', 'creative', 'illustration', 'painting', 'artist'],
    music: ['music', 'concert', 'playlist', 'band', 'song', 'album'],
    reading: ['book', 'read', 'novel', 'reading', 'story', 'author'],
    gaming: ['game', 'gaming', 'play', 'video game', 'gamer', 'esports'],
  };

  const interests: string[] = [];
  Object.entries(interestKeywords).forEach(([category, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      interests.push(category);
    }
  });

  // Extract potential lifestyle hints
  const lifestyleHints: string[] = [];

  // Look for personal pronouns and context
  if (text.includes('my') || text.includes('i am') || text.includes("i'm")) {
    lifestyleHints.push('First-person perspective (personal content)');
  }

  if (content.likes || content.followers) {
    lifestyleHints.push(`Social presence: ${content.followers || '?'} followers`);
  }

  return {
    summary: `${content.description || content.title} - Extracted from ${content.url}`,
    keyInsights: [
      `Source: ${content.source} extraction`,
      `Platform: ${detectPlatform(content.url)}`,
      `Content length: ${content.content.length} chars`,
    ],
    interests,
    lifestyleHints,
  };
}
