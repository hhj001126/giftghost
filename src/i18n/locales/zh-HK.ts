// ============================================
// TRANSLATIONS - Traditional Chinese Hong Kong (繁體中文)
// ============================================

export const zhHK = {
  // Navigation
  language: '語言',
  switchLanguage: '切換語言',

  // Intro Scene
  intro: {
    title: 'GiftGhost',
    subtitle: '送禮都可以好好玩！',
    cta: '開始搵禮物',
    socialProof: '10,000+ 開心既用家',
  },

  // Input Scene
  input: {
    header: '⚡ 我哋應該點幫你？',
    subtitle: '揀你鐘意既方式 ↓',

    // Mode Cards
    modes: {
      detective: {
        label: '偵探',
        shortDesc: '分析連結',
        description: '分享一個社交媒體連結，我哋會發掘隱藏既興趣愛好！🔍',
        hint: '試下：Instagram、Twitter、小紅書連結...',
        tips: '越多帖子，分析越準確！',
      },
      listener: {
        label: '聆聽者',
        shortDesc: '傾訴諗法',
        description: '分享你知既所有野，我哋會發現當中既閃光點！💎',
        hint: '佢地鍾意咩？憎咩？夢想係咩？',
        tips: '隨機既細節往往可以帶嚟完美既禮物靈感！',
      },
      interview: {
        label: '快速問答',
        shortDesc: '3條問題',
        description: '回答3條簡單問題。輕鬆搞掂！✨',
        hint: '',
        tips: '簡短回答都得！',

        // Interview questions
        pain: {
          label: '咩嘢令佢地唔開心？',
          prefix: '令佢地唔開心既嘢係...',
        },
        joy: {
          label: '咩嘢令佢地開心？',
          prefix: '令佢地開心既嘢係...',
        },
        secret: {
          label: '有咩隱藏既渴望？',
          prefix: '佢地暗地裏想要既嘢係...',
        },
      },
    },

    // Character count feedback messages
    charFeedback: {
      gettingThere: '繼續輸入...',
      niceDetail: '唔錯！💪',
      onFire: '太正喇！🔥',
      perfection: '完美！🌟',
    },

    // Placeholders
    placeholder: {
      detective: '貼上社交連結...',
      listener: '講吓關於佢地既嘢...',
    },

    // Hints
    hint: '💡 越多細節 = 越準確既推薦！',

    // Button
    startTyping: '開始輸入 →',
    findGift: '搵完美禮物',
  },

  // Thinking Scene
  thinking: {
    badge: 'Ghost 緊喺度施法...',
    stages: {
      analyzing: '緊喺度睇你既料 👀',
      digging: '緊喺度發掘彩蛋 💎',
      matching: '緊喺度疯狂配對 ⚡',
      generating: '緊喺度包裝驚喜 🎁',
      finalizing: '就快好！再等等 ✨',
    },
    rotatingLogs: [
      '緊喺度了解呢個人...',
      '發現咗啲有趣既嘢...',
      '緊喺度召喚禮物精靈...',
      '緊喺度搵靈感...',
      '緊喺度連接神經元...',
      '差唔多喇！',
    ],
    funFact: {
      header: '你知唔知？',
      content: '普通人平均花',
      highlight: '7個鐘',
      suffix: '尋找完美既禮物。我哋嚟改變呢個情況！🎯',
    },
  },

  // Reveal Scene
  reveal: {
    badge: '🏆 我哋搵到完美既禮物！',
    personaTitle: '呢個就係你朋友既類型！🎉',

    insightLabels: {
      painPoint: '痛點',
      obsession: '執念',
    },

    giftCard: {
      label: '✨ 完美禮物 ✨',
      findButton: '立即搵返嚟',
      priceLabel: '💰',
    },

    actions: {
      tryAnother: '再試一次',
      share: '分享',
    },

    footer: {
      text: '你將會成為最識送禮既人！',
    },
  },

  // Common
  common: {
    loading: '載入緊...',
    error: '出錯了',
    retry: '重試',
    cancel: '取消',
    confirm: '確認',
    back: '返回',
    next: '下一步',
  },

  // Errors
  errors: {
    apiKey: 'Ghost 困惑了。（請檢查 API Key）',
    network: '網絡連接失敗',
    unknown: '未知錯誤',
  },

  // Stage / General
  stage: {
    error: {
      title: '哎呀！',
      message: '出咗啲問題，要再試一次嗎？',
      button: '好嘅',
    },
    share: {
      title: 'GiftGhost',
      text: '我搵到完美既禮物！',
    },
  },

  // Share Card
  shareCard: {
    logo: 'GiftGhost 🎁',
    painPoint: '痛點',
    obsession: '執念',
    perfectGift: '完美禮物',
    footer: '由 GiftGhost 生成',
    website: 'giftghost.com',
    priceSymbol: '💰',
    saveImage: '儲存圖片',
    shareResult: '分享結果',
    shareTitle: '${persona} 既禮物',
    shareText: '我搵到完美既禮物: ${gift}!',
  },
};
