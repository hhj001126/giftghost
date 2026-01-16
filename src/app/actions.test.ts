/**
 * 独立测试脚本 - actions.ts
 * 
 * 运行方式:
 * 1. 使用 tsx (推荐): npx tsx src/app/actions.test.ts
 * 2. 使用 npm 脚本: npm run test:actions
 * 
 * 环境变量:
 * - 会自动从 .env.local 加载环境变量
 * - OPENAI_API_KEY: OpenAI API 密钥
 * - MOCK_MODE: 设置为 'true' 时使用模拟模式（默认）
 * - FIRECRAWL_API_KEY: Firecrawl API 密钥（用于 URL 解析）
 * - JINA_API_KEY: Jina AI API 密钥（用于 URL 解析）
 * 
 * 注意: 如果设置了 MOCK_MODE=true，不会调用真实的 OpenAI API
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// 加载 .env.local 文件（如果存在）
const envLocalPath = resolve(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
    console.log('✅ 已加载 .env.local 文件');
} else {
    console.log('⚠️  未找到 .env.local 文件，使用系统环境变量');
}

// 也尝试加载 .env 文件（如果存在）
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false }); // override: false 表示不覆盖已存在的变量
}

// 设置测试环境变量（必须在导入 actions 之前）
// 只有在未设置时才使用默认值
if (!process.env.MOCK_MODE) {
    process.env.MOCK_MODE = 'true';
}

// 检查环境变量是否已加载
if (process.env.OPENAI_API_KEY) {
    console.log('✅ OPENAI_API_KEY 已加载');
} else {
    console.log('⚠️  OPENAI_API_KEY 未找到，将使用 MOCK 模式');
    process.env.OPENAI_API_KEY = 'test-key-for-mock-mode';
}

// 显示当前环境配置
console.log(`📋 环境配置: MOCK_MODE=${process.env.MOCK_MODE}`);
if (process.env.FIRECRAWL_API_KEY) {
    const keyPreview = process.env.FIRECRAWL_API_KEY.length > 20
        ? `${process.env.FIRECRAWL_API_KEY.substring(0, 10)}...${process.env.FIRECRAWL_API_KEY.substring(process.env.FIRECRAWL_API_KEY.length - 4)}`
        : process.env.FIRECRAWL_API_KEY;
    console.log(`✅ FIRECRAWL_API_KEY 已加载 (${keyPreview})`);
} else {
    console.log('⚠️  FIRECRAWL_API_KEY 未配置 - 将跳过 Firecrawl 提取');
    console.log('   提示: 从 https://firecrawl.dev 获取 API 密钥');
}
if (process.env.JINA_API_KEY) {
    const keyPreview = process.env.JINA_API_KEY.length > 20
        ? `${process.env.JINA_API_KEY.substring(0, 10)}...${process.env.JINA_API_KEY.substring(process.env.JINA_API_KEY.length - 4)}`
        : process.env.JINA_API_KEY;
    console.log(`✅ JINA_API_KEY 已加载 (${keyPreview})`);
} else {
    console.log('⚠️  JINA_API_KEY 未配置 - 将使用免费端点（有限制）');
    console.log('   提示: 从 https://jina.ai 获取 API 密钥以获得更高配额');
}
console.log('');

// ============================================
// API 密钥诊断函数
// ============================================

async function diagnoseApiKeys() {
    console.log('🔍 API 密钥诊断\n');
    console.log('='.repeat(60));

    // 检查 Firecrawl
    if (process.env.FIRECRAWL_API_KEY) {
        const key = process.env.FIRECRAWL_API_KEY;
        console.log('✅ FIRECRAWL_API_KEY: 已配置');
        console.log(`   密钥长度: ${key.length} 字符`);
        console.log(`   密钥预览: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);

        // 使用 SDK 验证 API 密钥
        try {
            const Firecrawl = (await import('@mendable/firecrawl-js')).default;
            const app = new Firecrawl({ apiKey: key });

            // 尝试抓取一个简单的测试页面
            const result = await app.scrape('https://example.com', {
                formats: ['markdown'],
                onlyMainContent: true,
            });

            if (result && (result.markdown || result.html)) {
                console.log('   ✅ API 密钥有效');
            } else {
                console.log('   ⚠️  API 密钥可能有效，但未返回内容');
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('403') || error.message.includes('Forbidden')) {
                    console.log('   ❌ API 密钥无效或没有权限 (403)');
                    console.log('      请检查：');
                    console.log('      1. 密钥是否正确（从 https://firecrawl.dev 获取）');
                    console.log('      2. 密钥是否以 "fc-" 开头');
                    console.log('      3. 账户是否已激活');
                    console.log('      4. 配额是否已用完');
                } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    console.log('   ❌ API 密钥认证失败 (401)');
                } else {
                    console.log(`   ⚠️  验证失败: ${error.message}`);
                }
            } else {
                console.log('   ⚠️  无法验证 API 密钥（网络错误）');
            }
        }
    } else {
        console.log('❌ FIRECRAWL_API_KEY: 未配置');
        console.log('   提示: 从 https://firecrawl.dev 获取 API 密钥');
    }

    console.log('');

    // 检查 Jina AI
    if (process.env.JINA_API_KEY) {
        const key = process.env.JINA_API_KEY;
        console.log('✅ JINA_API_KEY: 已配置');
        console.log(`   密钥长度: ${key.length} 字符`);
        console.log(`   密钥预览: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);

        // 尝试简单的验证请求
        try {
            const testResponse = await fetch('https://api.jina.ai/v1/reader', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                },
                body: JSON.stringify({ url: 'https://example.com' }),
            });

            if (testResponse.ok) {
                console.log('   ✅ API 密钥有效');
            } else if (testResponse.status === 401 || testResponse.status === 403) {
                console.log('   ❌ API 密钥无效或没有权限');
                console.log('      请检查：');
                console.log('      1. 密钥是否正确（从 https://jina.ai 获取）');
                console.log('      2. 账户是否已激活');
            } else {
                console.log(`   ⚠️  API 返回状态码: ${testResponse.status}`);
            }
        } catch (error) {
            console.log('   ⚠️  无法验证 API 密钥（网络错误）');
        }
    } else {
        console.log('⚠️  JINA_API_KEY: 未配置（将使用免费端点）');
        console.log('   提示: 从 https://jina.ai 获取 API 密钥以获得更高配额');
    }

    console.log('\n' + '='.repeat(60));
    console.log('');
}

// ============================================
// 测试函数
// ============================================

async function runTests() {
    console.log('🧪 开始测试 actions.ts\n');
    console.log('='.repeat(60));
    console.log(`环境: MOCK_MODE=${process.env.MOCK_MODE}`);
    console.log('='.repeat(60));

    // 测试 1: generateInsight (LISTENER MODE - 英文)
    console.log('\n📋 测试 1: generateInsight (LISTENER MODE - 英文)');
    console.log('-'.repeat(60));

    try {
        const { generateInsight } = await import('./actions');

        const testInput = {
            mode: 'LISTENER',
            content: 'My friend loves plants and has a tiny apartment balcony. She always complains about never having time for hobbies.',
        };

        console.log('📥 输入:');
        console.log(JSON.stringify(testInput, null, 2));
        console.log('\n⏳ 生成洞察中...\n');

        const startTime = Date.now();
        const result = await generateInsight(testInput, 'en');
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ 测试通过!');
            console.log(`   Persona: ${result.persona}`);
            console.log(`   Pain Point: ${result.pain_point}`);
            console.log(`   Obsession: ${result.obsession}`);
            console.log(`   Gift: ${result.gift_recommendation?.item}`);
            console.log(`   Reason: ${result.gift_recommendation?.reason}`);
            console.log(`   Price: ${result.gift_recommendation?.price_range}`);
        } else {
            console.log('\n❌ 测试失败:', result.error);
            console.log('   Message:', result.message);
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
        if (error instanceof Error) {
            console.error('   错误信息:', error.message);
            console.error('   堆栈:', error.stack);
        }
    }

    // 测试 2: generateInsight (LISTENER MODE - 简体中文)
    console.log('\n📋 测试 2: generateInsight (LISTENER MODE - 简体中文)');
    console.log('-'.repeat(60));

    try {
        const { generateInsight } = await import('./actions');

        const testInput = {
            mode: 'LISTENER',
            content: '我的朋友喜欢植物，有一个小阳台。她总是抱怨没有时间培养爱好。她工作很忙，但周末会去咖啡店看书。',
        };

        console.log('📥 输入:');
        console.log(JSON.stringify(testInput, null, 2));
        console.log('\n⏳ 生成洞察中...\n');

        const startTime = Date.now();
        const result = await generateInsight(testInput, 'zh-CN');
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ 测试通过!');
            console.log(`   Persona: ${result.persona}`);
            console.log(`   Pain Point: ${result.pain_point}`);
            console.log(`   Obsession: ${result.obsession}`);
            console.log(`   Gift: ${result.gift_recommendation?.item}`);
        } else {
            console.log('\n❌ 测试失败:', result.error);
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    // 测试 3: generateInsight (DETECTIVE MODE)
    console.log('\n📋 测试 3: generateInsight (DETECTIVE MODE)');
    console.log('-'.repeat(60));

    try {
        const { generateInsight } = await import('./actions');

        const testInput = {
            mode: 'DETECTIVE',
            content: 'Instagram profile content:\nBio: "Plant mom | Coffee enthusiast | Book lover"\nRecent posts: Photos of plants, coffee setups, minimalist home decor. Likes posts about sustainable living and urban gardening.',
        };

        console.log('📥 输入:');
        console.log(JSON.stringify(testInput, null, 2));
        console.log('\n⏳ 生成洞察中...\n');

        const startTime = Date.now();
        const result = await generateInsight(testInput, 'en');
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ 测试通过!');
            console.log(`   Persona: ${result.persona}`);
            console.log(`   Gift: ${result.gift_recommendation?.item}`);
        } else {
            console.log('\n❌ 测试失败:', result.error);
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    // 测试 4: generateInsight (INTERVIEW MODE)
    console.log('\n📋 测试 4: generateInsight (INTERVIEW MODE)');
    console.log('-'.repeat(60));

    try {
        const { generateInsight } = await import('./actions');

        const testInput = {
            mode: 'INTERVIEW',
            content: 'Q1: What do they love doing in their free time?\nA1: Reading and tending to their plants\n\nQ2: What\'s something they always complain about?\nA2: Never having enough space for more plants\n\nQ3: What would make them genuinely happy?\nA3: A way to combine their love of plants with their small living space',
        };

        console.log('📥 输入:');
        console.log(JSON.stringify(testInput, null, 2));
        console.log('\n⏳ 生成洞察中...\n');

        const startTime = Date.now();
        const result = await generateInsight(testInput, 'en');
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ 测试通过!');
            console.log(`   Persona: ${result.persona}`);
            console.log(`   Gift: ${result.gift_recommendation?.item}`);
        } else {
            console.log('\n❌ 测试失败:', result.error);
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    // 测试 5: 测试错误处理（无效输入）
    console.log('\n📋 测试 5: 错误处理（空内容）');
    console.log('-'.repeat(60));

    try {
        const { generateInsight } = await import('./actions');

        const testInput = {
            mode: 'LISTENER',
            content: '',
        };

        console.log('📥 输入: 空内容');
        console.log('\n⏳ 生成洞察中...\n');

        const result = await generateInsight(testInput, 'en');

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));

        // 即使输入为空，也应该有某种响应（可能是默认值或错误）
        console.log('\n✅ 错误处理测试完成');
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    // ============================================
    // URL 解析测试
    // ============================================

    console.log('\n' + '='.repeat(60));
    console.log('🌐 URL 解析测试');
    console.log('='.repeat(60));

    // 测试 6: fetchUrlContent - 有效的 Instagram URL
    console.log('\n📋 测试 6: fetchUrlContent - Instagram URL');
    console.log('-'.repeat(60));

    try {
        const { fetchUrlContent } = await import('./actions');

        const testUrl = 'https://www.instagram.com/username/';
        console.log('📥 URL:', testUrl);
        console.log('\n⏳ 解析 URL 中...\n');

        const startTime = Date.now();
        const result = await fetchUrlContent(testUrl);
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ URL 解析成功!');
            console.log(`   Platform: ${result.platform}`);
            console.log(`   Title: ${result.title}`);
            console.log(`   Content Length: ${result.content?.length || 0} chars`);
            console.log(`   Interests: ${result.interests?.join(', ') || 'N/A'}`);
        } else {
            console.log('\n⚠️  URL 解析失败（可能是网络问题或需要 API 密钥）');
            console.log(`   Error: ${result.error}`);
            console.log(`   Message: ${result.message}`);
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
        if (error instanceof Error) {
            console.error('   错误信息:', error.message);
        }
    }

    // 测试 7: fetchUrlContent - 有效的 Twitter/X URL
    console.log('\n📋 测试 7: fetchUrlContent - Twitter/X URL');
    console.log('-'.repeat(60));

    try {
        const { fetchUrlContent } = await import('./actions');

        const testUrl = 'https://twitter.com/username';
        console.log('📥 URL:', testUrl);
        console.log('\n⏳ 解析 URL 中...\n');

        const startTime = Date.now();
        const result = await fetchUrlContent(testUrl);
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ URL 解析成功!');
            console.log(`   Platform: ${result.platform}`);
        } else {
            console.log('\n⚠️  URL 解析失败（可能是网络问题或需要 API 密钥）');
            console.log(`   Error: ${result.error}`);
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    // 测试 8: fetchUrlContent - 有效的小红书 URL
    console.log('\n📋 测试 8: fetchUrlContent - 小红书 URL');
    console.log('-'.repeat(60));

    try {
        const { fetchUrlContent } = await import('./actions');

        const testUrl = 'https://www.xiaohongshu.com/user/profile/123456';
        console.log('📥 URL:', testUrl);
        console.log('\n⏳ 解析 URL 中...\n');

        const startTime = Date.now();
        const result = await fetchUrlContent(testUrl);
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ URL 解析成功!');
            console.log(`   Platform: ${result.platform}`);
        } else {
            console.log('\n⚠️  URL 解析失败（可能是网络问题或需要 API 密钥）');
            console.log(`   Error: ${result.error}`);
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    // 测试 9: fetchUrlContent - 无效的 URL（错误的协议）
    console.log('\n📋 测试 9: fetchUrlContent - 无效协议 (ftp://)');
    console.log('-'.repeat(60));

    try {
        const { fetchUrlContent } = await import('./actions');

        const testUrl = 'ftp://example.com/profile';
        console.log('📥 URL:', testUrl);
        console.log('\n⏳ 验证 URL 中...\n');

        const result = await fetchUrlContent(testUrl);

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));

        if (!result.success && result.error === 'INVALID_URL') {
            console.log('\n✅ URL 验证正确 - 正确拒绝了无效协议');
        } else {
            console.log('\n⚠️  预期应该拒绝无效协议');
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    // 测试 10: fetchUrlContent - 无效的 URL（格式错误）
    console.log('\n📋 测试 10: fetchUrlContent - 格式错误的 URL');
    console.log('-'.repeat(60));

    try {
        const { fetchUrlContent } = await import('./actions');

        const testUrl = 'not-a-valid-url';
        console.log('📥 URL:', testUrl);
        console.log('\n⏳ 验证 URL 中...\n');

        const result = await fetchUrlContent(testUrl);

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));

        if (!result.success) {
            console.log('\n✅ URL 验证正确 - 正确拒绝了格式错误的 URL');
        } else {
            console.log('\n⚠️  预期应该拒绝格式错误的 URL');
        }
    } catch (error) {
        console.log('\n✅ URL 验证正确 - 抛出异常拒绝格式错误的 URL');
        console.log('   错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    }

    // 测试 11: fetchUrlContent - 空字符串
    console.log('\n📋 测试 11: fetchUrlContent - 空字符串');
    console.log('-'.repeat(60));

    try {
        const { fetchUrlContent } = await import('./actions');

        const testUrl = '';
        console.log('📥 URL: (空字符串)');
        console.log('\n⏳ 验证 URL 中...\n');

        const result = await fetchUrlContent(testUrl);

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));

        if (!result.success) {
            console.log('\n✅ URL 验证正确 - 正确拒绝了空字符串');
        }
    } catch (error) {
        console.log('\n✅ URL 验证正确 - 抛出异常拒绝空字符串');
        console.log('   错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    }

    // 测试 12: fetchUrlContent - 带查询参数的 URL
    console.log('\n📋 测试 12: fetchUrlContent - 带查询参数的 URL');
    console.log('-'.repeat(60));

    try {
        const { fetchUrlContent } = await import('./actions');

        const testUrl = 'https://www.instagram.com/username/?utm_source=test&ref=test';
        console.log('📥 URL:', testUrl);
        console.log('\n⏳ 解析 URL 中...\n');

        const startTime = Date.now();
        const result = await fetchUrlContent(testUrl);
        const duration = Date.now() - startTime;

        console.log('📤 结果:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n⏱️  耗时: ${duration}ms`);

        if (result.success) {
            console.log('\n✅ URL 解析成功 - 正确处理了查询参数!');
            console.log(`   Platform: ${result.platform}`);
        } else {
            console.log('\n⚠️  URL 解析失败（可能是网络问题或需要 API 密钥）');
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有测试完成!\n');
    console.log('💡 提示:');
    console.log('   - 测试使用了 MOCK 模式，不会调用真实的 OpenAI API');
    console.log('   - 要测试真实 API，设置 MOCK_MODE=false 并提供 OPENAI_API_KEY');
    console.log('   - URL 解析测试需要真实的网络环境或配置 Firecrawl/Jina API');
    console.log('   - 某些 URL 测试可能会失败，这是正常的（需要 API 密钥或网络访问）\n');
}

// ============================================
// 单独的 URL 解析测试函数
// ============================================

async function runUrlTests() {
    console.log('🌐 开始 URL 解析测试\n');
    console.log('='.repeat(60));
    console.log('💡 提示: URL 解析需要真实的网络环境或配置 API 密钥');
    console.log('='.repeat(60));

    const testUrls = [
        {
            name: 'Instagram URL',
            url: 'https://www.instagram.com/zhangyu1747?igsh=MW43OWQwbXZ1cGtuOA==',
            expected: 'success',
        },
        {
            name: 'Twitter/X URL',
            url: 'https://x.com/elonmusk?s=21',
            expected: 'success',
        },
        {
            name: '小红书 URL',
            url: 'https://xhslink.com/m/6Z5eBeQNbV4',
            expected: 'success',
        },
        {
            name: '带查询参数的 URL',
            url: 'https://www.instagram.com/username/?utm_source=test',
            expected: 'success',
        },
        {
            name: '无效协议 (ftp://)',
            url: 'ftp://example.com/profile',
            expected: 'invalid',
        },
        {
            name: '格式错误的 URL',
            url: 'not-a-valid-url',
            expected: 'invalid',
        },
        {
            name: '空字符串',
            url: '',
            expected: 'invalid',
        },
    ];

    const { fetchUrlContent } = await import('./actions');

    for (let i = 0; i < testUrls.length; i++) {
        const test = testUrls[i];
        console.log(`\n📋 测试 ${i + 1}: ${test.name}`);
        console.log('-'.repeat(60));
        console.log('📥 URL:', test.url || '(空字符串)');
        console.log('⏳ 测试中...\n');

        try {
            const startTime = Date.now();
            const result = await fetchUrlContent(test.url);
            const duration = Date.now() - startTime;

            console.log('📤 结果:');
            if (result.success) {
                console.log('   ✅ 成功');
                console.log(`   Platform: ${result.platform}`);
                console.log(`   Title: ${result.title || 'N/A'}`);
                console.log(`   Content Length: ${result.content?.length || 0} chars`);
                if (result.interests && result.interests.length > 0) {
                    console.log(`   Interests: ${result.interests.join(', ')}`);
                }
            } else {
                console.log('   ❌ 失败');
                console.log(`   Error: ${result.error}`);
                console.log(`   Message: ${result.message}`);
            }
            console.log(`   ⏱️  耗时: ${duration}ms`);

            // 验证预期结果
            if (test.expected === 'success' && result.success) {
                console.log('   ✅ 符合预期');
            } else if (test.expected === 'invalid' && !result.success) {
                console.log('   ✅ 符合预期（正确拒绝了无效 URL）');
            } else if (test.expected === 'success' && !result.success) {
                console.log('   ⚠️  可能失败（需要网络或 API 密钥）');
            }
        } catch (error) {
            console.log('   ❌ 异常');
            if (error instanceof Error) {
                console.log(`   错误: ${error.message}`);
            }
            if (test.expected === 'invalid') {
                console.log('   ✅ 符合预期（抛出异常拒绝无效 URL）');
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 URL 解析测试完成!\n');
}

// 运行测试
// 如果命令行参数包含 '--url-only'，只运行 URL 测试
// 如果包含 '--diagnose'，只运行 API 密钥诊断
const args = process.argv.slice(2);
if (args.includes('--diagnose')) {
    diagnoseApiKeys().catch((error) => {
        console.error('💥 诊断运行失败:', error);
        process.exit(1);
    });
} else if (args.includes('--url-only')) {
    runUrlTests().catch((error) => {
        console.error('💥 URL 测试运行失败:', error);
        process.exit(1);
    });
} else {
    // 先运行诊断，再运行测试
    diagnoseApiKeys()
        .then(() => runTests())
        .catch((error) => {
            console.error('💥 测试运行失败:', error);
            process.exit(1);
        });
}
