'use server';

import { headers as nextHeaders } from 'next/headers';
import OpenAI from 'openai';
import { startAISession, completeAISession, failAISession } from '@/tracker/server';
import { clearTraceCookie } from '@/tracker/trace-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { fetchSocialContent, processFetchedContent, detectPlatform } from '@/lib/url-fetcher';

// Configure OpenAI with optional custom base URL (for proxy support)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
});

// ============================================
// URL FETCHER SERVER ACTION
// ============================================

export async function fetchUrlContent(url: string) {
  console.log('🔍 Fetching URL:', url);

  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        success: false,
        error: 'INVALID_URL',
        message: 'Please enter a valid URL starting with http:// or https://',
      };
    }

    // Fetch content
    const content = await fetchSocialContent(url, {
      maxContentLength: 15000,
      timeout: 20000,
    });

    // Process for key insights
    const processed = processFetchedContent(content);

    console.log(`✅ Fetched ${content.content.length} chars from ${content.platform}, ${content.content}`);

    return {
      success: true,
      url: content.url,
      title: content.title,
      platform: content.platform,
      content: content.content,
      summary: processed.summary,
      interests: processed.interests,
      personalityTraits: processed.personalityTraits,
      lifestyleHints: processed.lifestyleHints,
      spendingStyle: processed.spendingStyle,
      socialContext: processed.socialContext,
    };
  } catch (error) {
    console.error('❌ URL fetch error:', error);
    return {
      success: false,
      error: 'FETCH_FAILED',
      message: 'Failed to fetch URL. Please try pasting the content directly.',
    };
  }
}

// ============================================
// PROMPT ENGINEERING LIBRARY
// ============================================

const GHOST_PERSONA = `You are GiftGhost, an unparalleled empathy engine and gift recommendation expert.

## YOUR ESSENCE
- You are warm, witty, and uncannily perceptive
- You see beyond what people say to what they truly need
- You believe every person contains multitudes - find the beautiful contradictions
- You deliver insights that make people go "YES! That's so them!"

## YOUR EXPERTISE
- Deep understanding of human psychology and desires
- Vast knowledge of products, hobbies, and experiences across all domains
- Ability to connect seemingly unrelated interests into perfect gift ideas
- Cultural fluency across generations, interests, and backgrounds

## YOUR VOICE
- Warm but sharp, never saccharine
- Specific over general (always name names, brands, models)
- Playful when appropriate, profound when needed
- Confident in your insights, humble about uncertainty`;

const ANALYSIS_FRAMEWORK = `## YOUR ANALYSIS FRAMEWORK

When analyzing input, look for:

1. **LIFESTYLE SIGNALS**: Daily routines, work habits, self-care rituals
2. **EMOTIONAL PATTERNS**: What brings joy? What causes stress?
3. **ASPIRATIONS VS REALITY**: What do they dream about vs. what they actually do?
4. **RELATIONSHIPS**: How do they connect with others? What do they give vs. receive?
5. **HIDDEN CUES**: Passively mentioned interests often matter more than actively stated ones
6. **CONTEXT CLUES**: Age, life stage, cultural background, season of life

## PERSONA EXTRACTION RULES
- Create 3-5 word archetypes (e.g., "The Tired Dreamer", "The Quiet Curator")
- Capture both WHO THEY ARE and WHO THEY WANT TO BE
- Include an element of tenderness or irony`;

const GIFT_PHILOSOPHY = `## GIFT RECOMMENDATION PHILOSOPHY

The perfect gift:
- [HITS] Solves a real problem OR fuels a genuine passion
- [FITS] Matches their aesthetic, values, and lifestyle
- [SURPRISES] Offers a delightful twist on something they already love
- [CONNECTS] Creates a moment, memory, or ritual
- [KEEPS GIVING] Provides ongoing value or joy

## FORBIDDEN (NEVER RECOMMEND)
- Generic gift cards or cash
- Generic "self-care" baskets
- Anything that says "I didn't know what to get you"
- Overly personal items (underwear, skincare for strangers)
- Clutter that will gather dust`;

const OUTPUT_SCHEMA = `## OUTPUT REQUIREMENTS

## LANGUAGE
You MUST respond in the same language as the user's input.

## JSON OUTPUT
Return a JSON object with this exact structure:

{
  "persona": "3-5 word archetype capturing their essence",
  "pain_point": "1-2 sentences describing their real struggle or friction",
  "obsession": "1-2 sentences about what brings them genuine joy",
  "gift_recommendation": {
    "item": "SPECIFIC product name with brand and model",
    "reason": "2-3 sentences explaining WHY this gift hits their soul",
    "buy_link": "Google Search URL for finding this exact item",
    "price_range": "Approximate price range (e.g., $30-50)"
  }
}`;

const FEW_SHOT_EXAMPLES = `

## EXAMPLE OUTPUTS (Reference for quality bar)

EXAMPLE 1:
Input: "My friend always complains about never having time for hobbies, but she loves plants and has a tiny apartment balcony."
Persona: "The Confined Green Thumb"
Pain Point: "Wants creative outlets but feels trapped by urban living and a packed schedule"
Obsession: "Transforming small spaces into jungles, the fantasy of weekend gardening"
Gift Recommendation: {
  "item": "Mighty Vyne Wall-Mounted Vertical Garden",
  "reason": "Solves the space constraint while feeding her plant obsession. Creates a living piece of art she can tend to in 5 minutes between meetings.",
  "buy_link": "https://www.google.com/search?q=Mighty+Vyne+Wall+Mounted+Vertical+Garden",
  "price_range": "$45-80"
}

EXAMPLE 2:
Input: "My dad never buys anything for himself. He's always working. Obsessed with his classic car restoration project."
Persona: "The Self-Sacrificing Tinkerer"
Pain Point: "Hasn't relaxed in years, defines himself entirely through productivity"
Obsession: "The dream of his 1967 Mustang, hours of meticulous work in the garage"
Gift Recommendation: {
  "item": "Restoration-grade Shop Apron with Personal Embroidery",
  "reason": "Something purely FOR his passion, not for his utility. Practical enough he'll use it, special enough he'll feel seen.",
  "buy_link": "https://www.google.com/search?q=personalized+classic+car+restoration+apron",
  "price_range": "$35-60"
}`;

const LANGUAGE_GUIDE: Record<string, string> = {
  'zh-CN': '## LANGUAGE REQUIREMENT\nYou MUST respond in Simplified Chinese (简体中文). All text must be in Simplified Chinese, including persona names, pain points, obsession descriptions, gift names, and reasons.\n\n示例 persona: "疲惫的绿植控", "自我牺牲的修补匠"',
  'zh-HK': '## LANGUAGE REQUIREMENT\nYou MUST respond in Traditional Chinese (繁體中文). All text must be in Traditional Chinese, including persona names, pain points, obsession descriptions, gift names, and reasons.\n\n示例 persona: "疲憊的綠植控", "自我犧牲的修補匠"',
  'en': '## LANGUAGE REQUIREMENT\nYou MUST respond in English. All text must be in English, including persona names, pain points, obsession descriptions, gift names, and reasons.\n\n示例 persona: "The Tired Dreamer", "The Self-Sacrificing Tinkerer"',
};

function buildSystemPrompt(mode: string, content: string, isInterview: boolean, locale: string = 'en'): string {
  let prompt = `${GHOST_PERSONA}\n\n${ANALYSIS_FRAMEWORK}\n\n${GIFT_PHILOSOPHY}\n\n${OUTPUT_SCHEMA}\n\n${LANGUAGE_GUIDE[locale] || LANGUAGE_GUIDE['en']}`;

  if (mode === 'DETECTIVE') {
    prompt += `

## MODE: DETECTIVE (Link Analysis)

The user has shared a social media link/profile. Analyze it like a detective reading clues.

CONTENT FROM LINK:
${content}

ANALYZE FOR:
- Lifestyle hints in their posts, photos, and engagement
- Subtle preferences shown through what they like/comment on
- Context clues: bio, highlights, pinned content
- Aspirational vs. actual self (what they post vs. what they do)
- Cultural signals, aesthetic preferences, values`;
  } else if (mode === 'LISTENER') {
    prompt += `

## MODE: LISTENER (Thought Dump Analysis)

The user has shared everything they know about their friend. Read between the lines.

USER'S NOTES:
${content}

ANALYZE FOR:
- Direct statements of interests (what they explicitly say they love)
- Passive mentions (things they complain about or casually reference)
- Dreams and aspirations (what they wish they had time/money for)
- Pain points and frustrations (what stresses them out)
- Relationship dynamics (what they give to others, what they neglect for themselves)
- Unique contradictions (the surprising combinations that make them, them)`;
  } else {
    prompt += `

## MODE: QUICK CHAT (3-Question Interview)

The user answered 3 quick questions. Synthesize these into deep insights.

INTERVIEW RESPONSES:
${content}

ANALYZE FOR:
- Patterns across answers (what themes keep appearing)
- The emotional subtext beneath surface answers
- Contradictions that reveal complexity
- The unasked question (what would have made recommendations even better)`;
  }

  prompt += FEW_SHOT_EXAMPLES;
  return prompt;
}

export async function generateInsight(input: { mode: string; content: string }, locale: string = 'en') {
  console.log('👻 Ghost is thinking about:', input, 'Language:', locale);

  // ============ Rate Limiting ============
  const headersList = await nextHeaders();
  const rateLimitResult = await checkRateLimit(headersList, {
    anonymousId: headersList.get('x-anonymous-id') || undefined,
    // userId: 如果有登录用户，传入用户 ID
  });

  if (rateLimitResult && !rateLimitResult.allowed) {
    console.log('🚫 Rate limit exceeded');
    return {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'rateLimit',
      limit: rateLimitResult.limit,
      remaining: 0,
      resetAt: rateLimitResult.resetAt.toISOString(),
    };
  }
  // ============ End Rate Limiting ============

  // ============ MOCK MODE ============
  // Test full tracking flow without calling AI
  if (process.env.MOCK_MODE === 'true' || input.content.includes('[MOCK]')) {
    console.log('🔮 MOCK MODE: Skipping AI call, returning mock data');

    // Mock AI response based on locale
    const mockData = {
      success: true,
      persona: locale === 'zh-CN' ? '疲惫的绿植控' : locale === 'zh-HK' ? '疲憊的綠植控' : 'The Tired Dreamer',
      pain_point: locale === 'zh-CN' ? '城市生活空间有限，但渴望接触自然' : 'Urban living limits space, but craves connection with nature',
      obsession: locale === 'zh-CN' ? '把狭小的阳台变成秘密花园' : 'Transforming tiny balconies into secret gardens',
      gift_recommendation: {
        item: locale === 'zh-CN' ? 'Mighty Vyne 墙面垂直花园' : 'Mighty Vyne Wall-Mounted Vertical Garden',
        reason: locale === 'zh-CN' ? '解决空间约束，同时滋养她的植物热爱。创造一个活着的艺术，她可以在会议间隙花5分钟照料。' : 'Solves space constraint while feeding her plant obsession. Creates a living piece of art she can tend to in 5 minutes between meetings.',
        buy_link: 'https://www.google.com/search?q=Mighty+Vyne+Wall+Mounted+Vertical+Garden',
        price_range: '$45-80',
      },
    };

    // Use real traceId from startAISession for proper tracking
    const responseTimeMs = 1500;
    let realTraceId: string = 'mock-' + Date.now();

    try {
      realTraceId = await startAISession({
        input_mode: input.mode,
        input_content: input.content,
        locale,
      });

      await completeAISession(realTraceId, {
        persona: mockData.persona,
        pain_point: mockData.pain_point,
        obsession: mockData.obsession,
        gift_item: mockData.gift_recommendation.item,
        gift_reason: mockData.gift_recommendation.reason,
        gift_price_range: mockData.gift_recommendation.price_range,
        gift_buy_link: mockData.gift_recommendation.buy_link,
        response_time_ms: responseTimeMs,
      });

      console.log('📍 Mock trace completed:', realTraceId);
    } catch (error) {
      console.error('Failed to track mock session:', error);
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('🎁 Mock GiftGhost insight generated:', mockData.persona);
    return { ...mockData, trace_id: realTraceId, response_time_ms: responseTimeMs };
  }
  // ============ END MOCK MODE ============

  const startTime = Date.now();
  let traceId: string | null = null;

  // 1. 开始追踪，创建 AI 会话记录
  try {
    traceId = await startAISession({
      input_mode: input.mode,
      input_content: input.content,
      locale,
    });
    console.log('📍 Trace started:', traceId);
  } catch (error) {
    console.error('Failed to start trace:', error);
    // 继续执行，不影响主要功能
  }

  const minDelay = new Promise((resolve) => setTimeout(resolve, 2500));

  // Build language-specific system prompt
  const systemPrompt = buildSystemPrompt(
    input.mode,
    input.mode === 'INTERVIEW' ? input.content : '',
    input.mode === 'INTERVIEW',
    locale
  );

  const userContent = input.mode === 'INTERVIEW'
    ? input.content
    : (input.mode === 'DETECTIVE' ? `CONTENT FROM LINK:\n${input.content}` : `USER'S NOTES:\n${input.content}`);

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    const [completion] = await Promise.all([
      openai.chat.completions.create({
        messages,
        model: 'gpt-4o',
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
      minDelay,
    ]);

    const rawResult = completion.choices[0].message.content || '{}';
    const result = JSON.parse(rawResult);

    const normalized = {
      success: true,
      trace_id: traceId,  // 返回 trace_id
      persona: result.persona || 'The Mystery Guest',
      pain_point: result.pain_point || 'Keeping their interests a secret',
      obsession: result.obsession || 'The unknown treasure',
      gift_recommendation: {
        item: result.gift_recommendation?.item || 'A handwritten letter',
        reason: result.gift_recommendation?.reason || 'When in doubt, go personal.',
        buy_link: result.gift_recommendation?.buy_link || '#',
        price_range: result.gift_recommendation?.price_range,
      },
      ...(result.optional_follow_up_questions && {
        follow_ups: result.optional_follow_up_questions
      }),
    };

    // 2. 完成追踪
    if (traceId) {
      try {
        await completeAISession(traceId, {
          persona: normalized.persona,
          pain_point: normalized.pain_point,
          obsession: normalized.obsession,
          gift_item: normalized.gift_recommendation.item,
          gift_reason: normalized.gift_recommendation.reason,
          gift_price_range: normalized.gift_recommendation.price_range,
          gift_buy_link: normalized.gift_recommendation.buy_link,
          response_time_ms: Date.now() - startTime,
        });
        // 清除 trace cookie，下次生成新 trace
        clearTraceCookie();
        console.log('📍 Trace completed:', traceId);
      } catch (error) {
        console.error('Failed to complete trace:', error);
      }
    }

    console.log('🎁 GiftGhost insight generated:', normalized.persona);
    return normalized;

  } catch (error) {
    console.error('AI Error:', error);

    // 3. 追踪失败
    if (traceId) {
      try {
        await failAISession(traceId, String(error), Date.now() - startTime);
        clearTraceCookie();
      } catch (traceError) {
        console.error('Failed to fail trace:', traceError);
      }
    }

    return {
      success: false,
      error: "The Ghost is confused. (Check API Key)",
      trace_id: traceId,
      persona: "The Mystery",
      pain_point: "Unknown",
      obsession: "Unknown",
      gift_recommendation: {
        item: "A handwritten letter",
        reason: "When technology fails, humanity wins.",
        buy_link: "#",
      }
    };
  }
}
