// ============================================
// TRANSLATIONS - English
// ============================================
// This is a data file. Fast Refresh will perform a full reload when this file changes.
// This is expected behavior for translation files.

export const en = {
  // Navigation
  language: 'Language',
  switchLanguage: 'Switch Language',

  // Intro Scene
  intro: {
    title: 'GiftGhost',
    subtitle: 'Gift hunting made fun & easy!',
    cta: 'Find a Gift',
    socialProof: '10,000+ happy gift-givers',
  },

  // Input Scene
  input: {
    header: "⚡ How should we help?",
    subtitle: "Choose your style ↓",

    // Mode Cards
    modes: {
      listener: {
        label: 'Memory Lane',
        shortDesc: 'Share memories',
        description: "Walk down memory lane and share what makes your friend who they are! 📖",
        hint: 'Think about their daily rituals, passions, and quirks...',
        tips: 'Every memory is a clue to the perfect gift!',
        memoryPrompts: {
          // Morning & Energy
          morning: {
            emoji: '🌅',
            title: 'Morning Rituals',
            subtitle: 'How do they start their day?',
            questions: [
              'What\'s their first drink? Coffee, tea, or something else?',
              'Do they scroll phone immediately or enjoy quiet first?',
              'Morning person or snooze button warrior?',
            ],
            placeholder: 'e.g., They absolutely cannot function without their oat latte ritual...',
          },
          // Work & Passion
          work: {
            emoji: '🎯',
            title: 'Work & Passions',
            subtitle: 'What drives them?',
            questions: [
              'What would they do even if not paid?',
              'Any side projects or creative pursuits?',
              'Do they love their job or dream of something else?',
            ],
            placeholder: 'e.g., They spend weekends coding personal projects even though they\'re a designer...',
          },
          // Comfort & Relax
          comfort: {
            emoji: '☁️',
            title: 'Comfort & Relaxation',
            subtitle: 'How do they unwind?',
            questions: [
              'Favorite way to spend a lazy Sunday?',
              'Snack or food they can\'t resist?',
              'Do they have a favorite blanket, pillow, or comfort item?',
            ],
            placeholder: 'e.g., They\'re obsessed with Japanese KitKats and have a favorite manga cafe...',
          },
          // Quirks & Personality
          quirks: {
            emoji: '🦋',
            title: 'Quirks & Oddities',
            subtitle: 'What makes them uniquely them?',
            questions: [
              'Any strange food combinations they love?',
              'Superstitions or lucky rituals?',
              'Funny phobias or irrational fears?',
            ],
            placeholder: 'e.g., They put ketchup on scrambled eggs and it\'s delicious somehow...',
          },
          // Relationships
          relationships: {
            emoji: '💝',
            title: 'Relationships & Social',
            subtitle: 'How do they connect with others?',
            questions: [
              'Best friend\'s name or what they love doing together?',
              'Do they prefer big groups or intimate gatherings?',
              'Any pet or animal they\'re obsessed with?',
            ],
            placeholder: 'e.g., They\'re that friend who remembers everyone\'s birthday...',
          },
          // Dreams & Aspirations
          dreams: {
            emoji: '✨',
            title: 'Dreams & Aspirations',
            subtitle: 'What are they reaching for?',
            questions: [
              'Places they\'ve always wanted to visit?',
              'Skills they wish they had?',
              'What would their dream weekend look like?',
            ],
            placeholder: 'e.g., They\'ve been dreaming of visiting Kyoto during cherry blossom season...',
          },
        },
      },
      interview: {
        label: 'Heart-to-Heart',
        shortDesc: 'Quick questions',
        description: "A quick heart-to-heart. Answer a few questions and we'll work our magic! 💫",
        hint: '',
        tips: 'Your honest answers lead to the best recommendations!',

        // Interview questions with enhanced context
        pain: {
          emoji: '💭',
          label: 'What weighs on them?',
          questions: [
            'What small things constantly annoy them daily?',
            'Any stress from work, relationships, or life?',
            'What problems do they complain about most?',
          ],
          placeholder: 'e.g., They\'re always complaining about neck pain from bad pillows...',
          hint: 'Think: frustrations, annoyances, daily struggles',
        },
        joy: {
          emoji: '💖',
          label: 'What lights them up?',
          questions: [
            'What makes their eyes sparkle when they talk about it?',
            'Any hobby they lose track of time doing?',
            'What gift have they loved receiving most?',
          ],
          placeholder: 'e.g., They could talk about vintage cameras for hours...',
          hint: 'Think: passions, happy moments, treasured activities',
        },
        secret: {
          emoji: '🌟',
          label: 'What do they secretly want?',
          questions: [
            'What would they never admit to wanting?',
            'Any guilty pleasures they hide?',
            'What\'s on their wishlist but they\'ll never buy for themselves?',
          ],
          placeholder: 'e.g., They\'d love a fancy espresso machine but think it\'s too indulgent...',
          hint: 'Think: guilty pleasures, hidden desires, self-denial',
        },
        style: {
          emoji: '🎨',
          label: 'What\'s their style?',
          questions: [
            'Minimalist or maximalist?',
            'Do they prefer classic or trendy?',
            'Any color they always wear or avoid?',
          ],
          placeholder: 'e.g., They\'re drawn to earth tones but own way too many black clothes...',
          hint: 'Think: fashion sense, aesthetic preferences, colors',
        },
      },
    },

    // Character count feedback messages
    charFeedback: {
      gettingThere: 'Keep going... more details help!',
      niceDetail: 'This is great! 💪',
      onFire: "You're on fire! 🔥",
      perfection: 'Perfect! We\'ve got everything! 🌟',
    },

    // Placeholders
    placeholder: {
      listener: 'Tell me about them...',
    },

    // Hints
    hint: '💡 More details = better recommendations!',

    // Button
    startTyping: 'Start Typing →',
    findGift: 'Find Perfect Gift',

    // Memory Lane Input
    memoryLane: {
      step: 'Step {number}',
      nextQuestion: 'Next',
    },

    // Profile Quick Input
    profileQuick: {
      header: {
        title: 'Quick Profile',
        subtitle: 'Answer a few questions to help us recommend better',
      },
      progress: {
        completed: '{count} / {total} completed',
        completeText: 'Awesome! 🎉',
      },
      sections: {
        gender: {
          title: 'Gender',
          options: {
            male: 'Male',
            female: 'Female',
            other: 'Other',
            preferNot: 'Secret',
          },
        },
        age: {
          title: 'Age Range',
          options: {
            '18-24': '18-24 years',
            '25-34': '25-34 years',
            '35-44': '35-44 years',
            '45-54': '45-54 years',
            '55+': '55+ years',
          },
        },
        mbti: {
          title: 'MBTI Personality',
          types: {
            ISTJ: 'Inspector',
            ISFJ: 'Protector',
            INFJ: 'Advocate',
            INTJ: 'Architect',
            ISTP: 'Virtuoso',
            ISFP: 'Adventurer',
            INFP: 'Mediator',
            INTP: 'Thinker',
            ESTP: 'Entrepreneur',
            ESFP: 'Entertainer',
            ENFP: 'Campaigner',
            ENTP: 'Debater',
            ESTJ: 'Executive',
            ESFJ: 'Consul',
            ENFJ: 'Protagonist',
            ENTJ: 'Commander',
          },
        },
        interests: {
          title: 'Interests',
          tags: {
            tech: 'Tech',
            gaming: 'Gaming',
            reading: 'Reading',
            travel: 'Travel',
            fitness: 'Fitness',
            cooking: 'Cooking',
            music: 'Music',
            art: 'Art',
            outdoor: 'Outdoor',
            photography: 'Photography',
            fashion: 'Fashion',
            pets: 'Pets',
          },
        },
      },
      buttons: {
        continue: 'Continue →',
        skip: 'Skip & Continue',
      },
    },
  },

  // Thinking Scene
  thinking: {
    badge: 'Ghost is conjuring...',
    stages: {
      analyzing: 'Reading your thoughts 👀',
      digging: 'Uncovering hidden gems 💎',
      matching: 'Matching like crazy ⚡',
      generating: 'Wrapping up a surprise 🎁',
      finalizing: 'Almost there! Just a sec ✨',
    },
    rotatingLogs: [
      'Figuring out this person...',
      'Found something interesting...',
      'Summoning gift spirits...',
      'Looking for inspiration...',
      'Connecting the dots...',
      'Almost done!',
    ],
    funFact: {
      header: 'Did you know?',
      content: 'The average person spends',
      highlight: '7 hours',
      suffix: 'searching for the perfect gift. We\'re here to fix that! 🎯',
    },
  },

  // Reveal Scene
  reveal: {
    badge: '🏆 We found something perfect!',
    personaTitle: 'This is who your friend is! 🎉',

    insightLabels: {
      painPoint: 'Pain Point',
      obsession: 'Obsession',
    },

    giftCard: {
      label: '✨ PERFECT GIFT ✨',
      findButton: 'Find It Now',
      priceLabel: '💰',
    },

    actions: {
      tryAnother: 'Try Another',
      share: 'Share',
    },

    footer: {
      text: "You're going to be the best gift-giver!",
    },
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
  },

  // Errors
  errors: {
    apiKey: 'The Ghost is confused. (Check API Key)',
    network: 'Network connection failed',
    unknown: 'Unknown error',
  },

  // Stage / General
  stage: {
    error: {
      title: 'Oops!',
      message: 'Something went wrong. Try again?',
      button: 'OK',
      rateLimit: {
        title: 'Daily Limit Reached',
        message: "You've used all ${count} free generations today. Come back tomorrow for more!",
        button: 'OK',
      },
    },
    share: {
      title: 'GiftGhost',
      text: 'I found the perfect gift!',
    },
  },

  // Share Card
  shareCard: {
    logo: 'GiftGhost 🎁',
    painPoint: 'PAIN POINT',
    obsession: 'OBSESSION',
    perfectGift: 'PERFECT GIFT',
    footer: 'Generated by GiftGhost',
    website: 'giftghost.com',
    priceSymbol: '💰',
    saveImage: 'Save Image',
    shareResult: 'Share Result',
    shareTitle: 'Gift for ${persona}',
    shareText: 'I found the perfect gift: ${gift}!',
  },

  // Feedback
  feedback: {
    title: 'Love this recommendation?',
    like: 'Love it!',
    dislike: 'Not for me',
    thanks: 'Thanks for the feedback!',
  },
};
