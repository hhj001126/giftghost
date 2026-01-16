// ============================================
// URL FETCHER - Social Media Content Extraction
// ============================================
// Supports multiple extraction strategies: Firecrawl SDK (primary) → Jina AI (fallback) → Metadata
// Falls back gracefully if extraction fails

import Firecrawl from '@mendable/firecrawl-js';

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
  source: 'firecrawl' | 'jina' | 'puppeteer' | 'metadata' | 'og' | 'fallback';
  platform: string;
}

export interface FetchOptions {
  timeout?: number;
  maxContentLength?: number;
  extractPosts?: boolean;
  extractMetadata?: boolean;
}

// ============================================
// SINGLETON CLIENTS
// ============================================

/**
 * Firecrawl 客户端单例
 * 
 * 使用单例模式避免重复创建客户端实例，提高性能：
 * - 全局唯一实例，按 API key 缓存
 * - 如果 API key 变化，会创建新实例
 * - 减少内存占用和初始化开销
 */
let firecrawlClient: Firecrawl | null = null;
let firecrawlApiKey: string | null = null;

/**
 * 获取或创建 Firecrawl 客户端单例
 * @param apiKey Firecrawl API 密钥
 * @returns Firecrawl 客户端实例
 */
function getFirecrawlClient(apiKey: string): Firecrawl {
  // 如果 API key 变化或客户端不存在，创建新实例
  if (!firecrawlClient || firecrawlApiKey !== apiKey) {
    firecrawlClient = new Firecrawl({ apiKey });
    firecrawlApiKey = apiKey;
  }
  return firecrawlClient;
}

// ============================================
// EXTRACTION STRATEGIES
// ============================================

/**
 * Strategy 1: Firecrawl SDK (Primary - Recommended)
 * Get API key from https://firecrawl.dev
 * API key should start with 'fc-'
 */
async function fetchWithFirecrawl(url: string, apiKey?: string): Promise<Partial<FetchedContent> | null> {
  if (!apiKey) {
    console.log('🔍 Firecrawl: No API key configured');
    return null;
  }

  // 验证 API key 格式（应该以 'fc-' 开头）
  if (!apiKey.startsWith('fc-')) {
    console.log('🔍 Firecrawl: API key should start with "fc-"');
    // 尝试自动添加前缀（如果用户忘记添加）
    if (!apiKey.includes('fc-')) {
      apiKey = `fc-${apiKey}`;
      console.log('🔍 Firecrawl: Auto-prefixed API key with "fc-"');
    }
  }

  try {
    // 使用单例客户端
    const app = getFirecrawlClient(apiKey);

    // 使用 SDK 的 scrape 方法
    // SDK 直接返回 Document 对象，包含 markdown, html, metadata 等
    const result = await app.scrape(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      // 可选：设置超时和缓存
      // maxAge: 600000, // 10 分钟缓存
    });

    // SDK 直接返回 Document 对象
    if (!result) {
      console.log('🔍 Firecrawl: Scrape returned empty result');
      return null;
    }

    // 检查是否有内容
    const hasContent = result.markdown || result.html;
    if (!hasContent) {
      console.log('🔍 Firecrawl: No content extracted');
      return null;
    }

    // SDK 返回的 Document 结构
    return {
      content: result.markdown || result.html || '',
      title: result.metadata?.title || '',
      description: result.metadata?.description || '',
      source: 'firecrawl' as const,
    };
  } catch (error) {
    // SDK 会抛出更详细的错误信息
    if (error instanceof Error) {
      console.log('🔍 Firecrawl: Failed', error.message);

      // 提供更友好的错误提示
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log('   提示: 可能是 API 密钥无效、过期或没有权限');
        console.log('   请检查：');
        console.log('   1. API 密钥是否正确（从 https://firecrawl.dev 获取）');
        console.log('   2. API 密钥是否已激活');
        console.log('   3. 账户配额是否已用完');
        console.log('   4. 是否允许访问该 URL');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('   提示: API 密钥认证失败，请检查密钥是否正确');
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.log('   提示: 请求频率过高，请稍后重试');
      }
    } else {
      console.log('🔍 Firecrawl: Failed', error);
    }
    return null;
  }
}

/**
 * Strategy 2: Jina AI Reader (Fallback)
 * Free tier: 10,000 requests/month
 * API: https://r.jina.ai/{url}
 */
async function fetchWithJinaAI(url: string, apiKey?: string): Promise<Partial<FetchedContent> | null> {
  try {
    let markdown: string;

    if (apiKey) {
      // Use Jina AI API with authentication (higher limits)
      const apiUrl = `https://r.jina.ai/${url}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'GiftGhost/1.0',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `API returned ${response.status}`;

        if (response.status === 404) {
          errorMessage += ' - 可能是 API 端点不正确或 URL 无法访问';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage += ' - API 密钥无效或没有权限。请检查：';
          errorMessage += '\n   1. API 密钥是否正确（从 https://jina.ai 获取）';
          errorMessage += '\n   2. API 密钥是否已激活';
          errorMessage += '\n   3. 账户配额是否已用完';
        } else if (response.status === 429) {
          errorMessage += ' - 请求频率过高，请稍后重试';
        }

        console.log(`🔍 Jina AI API: ${errorMessage}`);
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message || errorJson.error) {
              console.log(`   详情: ${errorJson.message || errorJson.error}`);
            }
          } catch {
            // 忽略 JSON 解析错误
          }
        }
        return null;
      }

      const data = await response.json();
      markdown = data.data || data.markdown || data.content || '';
    } else {
      // Use free public endpoint (no auth required)
      // 注意：需要移除协议前缀，因为 Jina 的免费端点会自动添加
      const cleanUrl = url.replace(/^https?:\/\//, '');
      const jinaUrl = `https://r.jina.ai/${cleanUrl}`;

      const response = await fetch(jinaUrl, {
        headers: {
          'User-Agent': 'GiftGhost/1.0',
        },
      });

      if (!response.ok) {
        let errorMessage = `API returned ${response.status}`;
        if (response.status === 404) {
          errorMessage += ' - URL 可能无法访问或格式不正确';
        } else if (response.status === 429) {
          errorMessage += ' - 免费额度已用完，请使用 API 密钥';
        }
        console.log(`🔍 Jina AI (free): ${errorMessage}`);
        return null;
      }

      markdown = await response.text();
    }

    // Jina returns plain text/markdown, try to extract title from first line
    const lines = markdown.split('\n').filter(line => line.trim());
    const title = lines[0]?.startsWith('# ') ? lines[0].replace(/^#+\s*/, '').trim() : url;

    return {
      content: markdown,
      title: title || url,
      description: lines.slice(0, 3).join(' ').slice(0, 200) || '',
      source: 'jina' as const,
    };
  } catch (error) {
    console.log('🔍 Jina AI: Failed', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Strategy 3: Metadata-only (Lightweight fallback)
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

    const extractMeta = (selectors: string[]): string | undefined => {
      for (const selector of selectors) {
        const pattern = selector.replace(/CONTENT/g, 'content="([^"]*)"');
        const match = html.match(new RegExp(pattern, 'i'));
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
      title: title || url,
      description: description || '',
      content: `[Metadata from ${url}]`,
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

export function detectPlatform(url: string): string {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) return platform;
  }
  return 'general';
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
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const jinaKey = process.env.JINA_API_KEY;
  let result = await fetchWithFirecrawl(url, firecrawlKey);

  // Fallback to Jina AI
  if (!result || !result.content) {
    console.log('🔍 Firecrawl failed, trying Jina AI...');
    result = await fetchWithJinaAI(url, jinaKey);
  }

  // Fallback to metadata
  if (!result || !result.content) {
    console.log('🔍 Jina AI failed, trying metadata...');
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
    platform,
  };

  const duration = Date.now() - startTime;
  console.log(`✅ Content fetched (${fetchedContent.source}) in ${duration}ms`);

  return fetchedContent;
}

// ============================================
// SMART CONTENT PROCESSOR - Intelligent Key Info Extraction
// ============================================

export interface ProcessedContent {
  summary: string;
  keyInsights: string[];
  interests: string[];
  lifestyleHints: string[];
  personalityTraits: string[];
  spendingStyle: string;
  socialContext: string;
}

/**
 * Enhanced content processor that extracts meaningful insights for gift recommendations
 */
export function processFetchedContent(content: FetchedContent): ProcessedContent {
  const text = content.content.toLowerCase();
  const cleanText = content.content.replace(/[#*`\[\]]/g, ' ').replace(/\s+/g, ' ').trim();

  // ============ Interest Detection ============
  const interestKeywords: Record<string, string[]> = {
    tech: ['technology', 'software', 'app', 'code', 'computer', 'gadget', 'tech', 'developer', 'programming', 'ai', 'digital'],
    travel: ['travel', 'trip', 'vacation', 'adventure', 'explore', 'destination', 'wanderlust', 'journey', 'tourism'],
    food: ['food', 'cooking', 'recipe', 'restaurant', 'cuisine', 'delicious', 'gourmet', 'chef', 'baking', 'eat'],
    fitness: ['fitness', 'workout', 'gym', 'exercise', 'health', 'running', 'yoga', 'sports', 'wellness', 'training'],
    art: ['art', 'design', 'creative', 'illustration', 'painting', 'artist', 'drawing', 'sketch', 'creative'],
    music: ['music', 'concert', 'playlist', 'band', 'song', 'album', 'musician', 'singer', 'hip-hop', 'rock', 'jazz'],
    reading: ['book', 'read', 'novel', 'reading', 'story', 'author', 'literature', 'bookstore', 'library'],
    gaming: ['game', 'gaming', 'play', 'video game', 'gamer', 'esports', 'xbox', 'playstation', 'nintendo', 'steam'],
    outdoor: ['hiking', 'camping', 'nature', 'mountain', 'beach', 'outdoor', 'cycling', 'running'],
    beauty: ['beauty', 'skincare', 'makeup', 'cosmetics', 'fashion', 'style', 'clothing', 'outfit'],
    home: ['home', 'decor', 'furniture', 'interior', 'garden', 'plant', 'house', 'living'],
    pet: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'animal', 'paw', 'furry'],
    photography: ['photo', 'camera', 'photography', 'capture', 'lens', 'snapshot', 'portrait'],
    coffee: ['coffee', 'caffeine', 'espresso', 'latte', 'brew', 'barista', 'cafe'],
    wine: ['wine', 'beer', 'cocktail', 'alcohol', 'brewery', 'vineyard', 'spirits'],
  };

  const interests: string[] = [];
  const interestScores: Record<string, number> = {};

  Object.entries(interestKeywords).forEach(([category, keywords]) => {
    const score = keywords.filter(kw => text.includes(kw)).length;
    if (score > 0) {
      interestScores[category] = score;
    }
  });

  // Sort by score and take top interests
  Object.entries(interestScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([category]) => {
      interests.push(category);
    });

  // ============ Personality Trait Detection ============
  const personalityTraits: string[] = [];
  const traitPatterns: Record<string, RegExp[]> = {
    'Introverted/Thoughtful': [/i prefer.*alone/i, /quiet time/i, /deep thinking/i, /personal space/i],
    'Extroverted/Social': [/love being with friends/i, /social/i, /party/i, /community/i],
    'Adventure-Seeker': [/adventure/i, /thrill/i, /new experience/i, /take risks/i, /explore/i],
    'Practical/Organized': [/organized/i, /efficient/i, /practical/i, /plan/i, /schedule/i],
    'Creative/Artistic': [/creative/i, /imagination/i, /express.*myself/i, /unique/i],
    'Minimalist': [/simple/i, /minimal/i, /less is more/i, /declutter/i],
    'Luxury-Seeker': [/premium/i, /luxury/i, /quality/i, /best/i, /treat myself/i],
    'Eco-Conscious': [/sustainable/i, /eco-friendly/i, /environment/i, /green/i, /organic/i],
    'Tech-Enthusiast': [/latest.*tech/i, /new gadget/i, /innovation/i, /smart/i],
    'Sentimental': [/memories/i, /sentimental/i, /nostalgic/i, /treasure/i, /meaningful/i],
  };

  Object.entries(traitPatterns).forEach(([trait, patterns]) => {
    if (patterns.some(pattern => pattern.test(text))) {
      personalityTraits.push(trait);
    }
  });

  // ============ Lifestyle Hints ============
  const lifestyleHints: string[] = [];

  // Budget hints
  if (/expensive|luxury|premium/i.test(text)) {
    lifestyleHints.push('倾向于高品质/高端产品');
  } else if (/budget|affordable|cheap/i.test(text)) {
    lifestyleHints.push('注重性价比');
  }

  // Time availability
  if (/busy|no time|limited time/i.test(text)) {
    lifestyleHints.push('时间紧张，适合便捷实用的礼物');
  } else if (/relax|chill|free time/i.test(text)) {
    lifestyleHints.push('有充裕休闲时间，可享受复杂有趣的礼物');
  }

  // Social context
  if (/gift for someone/i.test(text) || /looking for/i.test(text)) {
    lifestyleHints.push('有明确的送礼需求');
  }

  // ============ Spending Style ============
  let spendingStyle = 'Moderate';
  const budgetMatches = (text.match(/budget|save|cheap|affordable/gi) || []).length;
  const luxuryMatches = (text.match(/splurge|luxury|premium|expensive/gi) || []).length;

  if (budgetMatches > 2) {
    spendingStyle = 'Budget-Conscious';
  } else if (luxuryMatches > 2) {
    spendingStyle = 'Generous';
  }

  // ============ Social Context ============
  let socialContext = 'Personal use';
  if (content.platform === 'instagram' || content.platform === 'xiaohongshu') {
    socialContext = 'Social media - lifestyle content';
  } else if (content.platform === 'twitter' || content.platform === 'x') {
    socialContext = 'Social media - thoughts/opinions';
  } else if (content.platform === 'youtube') {
    socialContext = 'Video content - entertainment/education';
  }

  // ============ Key Insights ============
  const keyInsights = [
    `来源: ${content.platform} (${content.source})`,
    `内容长度: ${content.content.length} 字符`,
    interests.length > 0 ? `检测到兴趣: ${interests.join(', ')}` : '',
    personalityTraits.length > 0 ? `性格特征: ${personalityTraits.slice(0, 3).join(', ')}` : '',
  ].filter(Boolean);

  return {
    summary: cleanText.slice(0, 500),
    keyInsights,
    interests,
    lifestyleHints,
    personalityTraits,
    spendingStyle,
    socialContext,
  };
}
