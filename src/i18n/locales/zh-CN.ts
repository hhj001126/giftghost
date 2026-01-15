// ============================================
// TRANSLATIONS - Simplified Chinese (简体中文)
// ============================================

export const zhCN = {
  // Navigation
  language: '语言',
  switchLanguage: '切换语言',

  // Intro Scene
  intro: {
    title: 'GiftGhost',
    subtitle: '送礼也可以很有趣！',
    cta: '开始寻礼',
    socialProof: '10,000+ 快乐的用户',
  },

  // Input Scene
  input: {
    header: '⚡ 我们该怎么帮你？',
    subtitle: '选择你的方式 ↓',

    // Mode Cards
    modes: {
      detective: {
        label: '侦探',
        shortDesc: '分析链接',
        description: '分享一个社交媒体链接，我们会发掘隐藏的兴趣爱好！🔍',
        hint: '试试：Instagram、Twitter、小红书链接...',
        tips: '帖子越多，洞察越准确！',
      },
      listener: {
        label: '倾听者',
        shortDesc: '倾诉想法',
        description: '分享你了解的一切，我们会发现其中的闪光点！💎',
        hint: 'ta喜欢什么？讨厌什么？梦想是什么？',
        tips: '随机细节往往能带来完美的礼物灵感！',
      },
      interview: {
        label: '快速问答',
        shortDesc: '3个问题',
        description: '回答3个简单问题。轻松搞定！✨',
        hint: '',
        tips: '简短回答也可以！',

        // Interview questions
        pain: {
          label: '什么让ta烦恼？',
          prefix: '让ta烦恼的是...',
        },
        joy: {
          label: '什么让ta开心？',
          prefix: '让ta开心的是...',
        },
        secret: {
          label: '有什么隐藏的渴望？',
          prefix: 'ta暗地里想要...',
        },
      },
    },

    // Character count feedback messages
    charFeedback: {
      gettingThere: '继续输入...',
      niceDetail: '不错！💪',
      onFire: '太棒了！🔥',
      perfection: '完美！🌟',
    },

    // Placeholders
    placeholder: {
      detective: '粘贴社交链接...',
      listener: '告诉我关于ta的一切...',
    },

    // Hints
    hint: '💡 更多细节 = 更准确的推荐！',

    // Button
    startTyping: '开始输入 →',
    findGift: '寻找完美礼物',
  },

  // Thinking Scene
  thinking: {
    badge: 'Ghost 正在施法...',
    stages: {
      analyzing: '正在翻阅你的资料 👀',
      digging: '正在挖掘隐藏彩蛋 💎',
      matching: '正在疯狂匹配中 ⚡',
      generating: '正在组装惊喜礼物 🎁',
      finalizing: '马上好！再给一点点时间 ✨',
    },
    rotatingLogs: [
      '正在读懂这个人...',
      '发现了有趣的小秘密...',
      '正在召唤礼物精灵...',
      '正在寻找灵感...',
      '正在连接神经元...',
      '就差一点点了！',
    ],
    funFact: {
      header: '你知道吗？',
      content: '平均每个人花费',
      highlight: '7小时',
      suffix: '寻找完美礼物。我们来改变这个！🎯',
    },
  },

  // Reveal Scene
  reveal: {
    badge: '🏆 我们找到了完美礼物！',
    personaTitle: '这就是你的朋友！🎉',

    insightLabels: {
      painPoint: '痛点',
      obsession: '执念',
    },

    giftCard: {
      label: '✨ 完美礼物 ✨',
      findButton: '立即寻找',
      priceLabel: '💰',
    },

    actions: {
      tryAnother: '再试一次',
      share: '分享',
    },

    footer: {
      text: '你将成为最会送礼的人！',
    },
  },

  // Common
  common: {
    loading: '加载中...',
    error: '出错了',
    retry: '重试',
    cancel: '取消',
    confirm: '确认',
    back: '返回',
    next: '下一步',
  },

  // Errors
  errors: {
    apiKey: 'Ghost 困惑了。（请检查 API Key）',
    network: '网络连接失败',
    unknown: '未知错误',
  },

  // Stage / General
  stage: {
    error: {
      title: '哎呀！',
      message: '出了点问题，要再试一次吗？',
      button: '好的',
    },
    share: {
      title: 'GiftGhost',
      text: '我找到了完美的礼物！',
    },
  },

  // Share Card
  shareCard: {
    logo: 'GiftGhost 🎁',
    painPoint: '痛点',
    obsession: '执念',
    perfectGift: '完美礼物',
    footer: '由 GiftGhost 生成',
    website: 'giftghost.com',
    priceSymbol: '💰',
    saveImage: '保存图片',
    shareResult: '分享结果',
    shareTitle: '${persona} 的礼物',
    shareText: '我找到了完美礼物: ${gift}!',
  },
};
