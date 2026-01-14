// ============================================
// CHAT LOG PARSER
// ============================================
// Supports WeChat, QQ, and generic chat export formats
// Handles anonymization and signal extraction

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp?: Date;
  isOwnMessage: boolean;
}

export interface ParsedChat {
  messages: ChatMessage[];
  participants: string[];
  dateRange: { start: Date; end: Date } | null;
  format: 'wechat' | 'qq' | 'generic' | 'unknown';
}

// ============================================
// WECHAT FORMAT PATTERNS
// ============================================

const WECHAT_PATTERNS = {
  // 标准文本消息: [2024/01/15 14:30:15] 用户名: 内容
  standard: /^\[(\d{4}[\/\-]\d{2}[\/\-]\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.+)$/,

  // 图片/语音等多媒体消息
  media: /^\[(\d{4}[\/\-]\d{2}[\/\-]\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*\[(图片|语音|视频|文件|表情|转账|位置|名片|链接|合并转发的一条消息)\]/,

  // 系统消息: [2024/01/15 14:30:15] 系统消息内容
  system: /^\[(\d{4}[\/\-]\d{2}[\/\-]\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\]\s*(.+)$/,
};

// ============================================
// QQ FORMAT PATTERNS
// ============================================

const QQ_PATTERNS = {
  // 标准格式: [14:30:15] 用户名 内容
  standard: /^\[(\d{2}:\d{2}(?::\d{2})?)\]\s*([^ ]+)\s+(.+)$/,

  // 日期+时间: [2024-01-15 14:30] 用户名 内容
  withDate: /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\]\s*([^ ]+)\s+(.+)$/,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function parseWeChatDate(dateStr: string): Date | null {
  // 尝试多种日期格式
  const formats = [
    /^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [, year, month, day, hour, min, sec = '0'] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day),
                      parseInt(hour), parseInt(min), parseInt(sec));
    }
  }
  return null;
}

function parseQQDate(dateStr: string, baseDate: Date = new Date()): Date | null {
  // QQ 消息通常只有时间，需要结合上下文推断日期
  const match = dateStr.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    const [, hour, min, sec = '0'] = match;
    const date = new Date(baseDate);
    date.setHours(parseInt(hour), parseInt(min), parseInt(sec), 0);
    return date;
  }
  return null;
}

// ============================================
// ANONYMIZER
// ============================================

export interface AnonymizerConfig {
  replaceNames: boolean;
  preserveGender: boolean;
  preserveIdentity: boolean;
  removeTimestamps: boolean;
}

const DEFAULT_ANONYMIZER_CONFIG: AnonymizerConfig = {
  replaceNames: true,
  preserveGender: false,
  preserveIdentity: false,
  removeTimestamps: true,
};

export function anonymizeChat(chat: ParsedChat, config: Partial<AnonymizerConfig> = {}): ParsedChat {
  const finalConfig = { ...DEFAULT_ANONYMIZER_CONFIG, ...config };

  // 创建名称映射
  const nameMapping = new Map<string, string>();
  let personCounter = 1;

  chat.participants.forEach(name => {
    if (finalConfig.preserveIdentity) {
      nameMapping.set(name, name);
    } else {
      nameMapping.set(name, `Person ${String.fromCharCode(64 + personCounter)}`);
      personCounter++;
    }
  });

  // 匿名化消息
  const anonymizedMessages = chat.messages.map(msg => ({
    ...msg,
    sender: nameMapping.get(msg.sender) || msg.sender,
    timestamp: finalConfig.removeTimestamps ? undefined : msg.timestamp,
  }));

  return {
    ...chat,
    messages: anonymizedMessages,
    participants: Array.from(nameMapping.values()),
  };
}

// ============================================
// SIGNAL EXTRACTOR
// ============================================

export interface GiftSignal {
  category: 'interest' | 'pain_point' | 'aspiration' | 'relationship' | 'habit' | 'mention';
  content: string;
  strength: number; // 0-1, how strong the signal is
  context: string;
  evidence: string[];
}

export function extractGiftSignals(messages: ChatMessage[]): GiftSignal[] {
  const signals: GiftSignal[] = [];

  // 关键词模式匹配
  const patterns = {
    interest: {
      patterns: [/喜欢/i, /爱(好|吃|玩|看)/i, /迷/i, /收藏/i, /热爱/i, /钟爱/i],
      weight: 0.8,
    },
    pain_point: {
      patterns: [/抱怨/i, /烦恼/i, /头疼/i, /麻烦/i, /困难/i, /搞不定/i, /没时间/i, /太累了/i],
      weight: 0.7,
    },
    aspiration: {
      patterns: [/想(要|买|学|去|做)/i, /梦想/i, /希望/i, /要是能/i, /好想/i],
      weight: 0.6,
    },
    relationship: {
      patterns: [/送(给|过|个)/i, /生日/i, /纪念日/i, /礼物/i, /惊喜/i],
      weight: 0.5,
    },
    habit: {
      patterns: [/每天/i, /总是/i, /经常/i, /习惯/i, /一直/i, /离不开/i],
      weight: 0.4,
    },
    mention: {
      patterns: [/提到/i, /说起/i, /上次/i, /那个/i],
      weight: 0.3,
    },
  };

  messages.forEach(msg => {
    const content = msg.content;

    Object.entries(patterns).forEach(([category, { patterns: categoryPatterns, weight }]) => {
      categoryPatterns.forEach(pattern => {
        const match = content.match(pattern);
        if (match) {
          // 提取上下文（前后各50字符）
          const start = Math.max(0, match.index! - 50);
          const end = Math.min(content.length, match.index! + match[0].length + 50);

          signals.push({
            category: category as GiftSignal['category'],
            content: match[0],
            strength: weight,
            context: content.slice(start, end),
            evidence: [`From ${msg.sender} at ${msg.timestamp?.toISOString()}`],
          });
        }
      });
    });
  });

  // 按强度排序
  return signals.sort((a, b) => b.strength - a.strength);
}

// ============================================
// MAIN PARSER
// ============================================

export function parseChatLog(rawText: string): ParsedChat {
  const lines = rawText.split('\n').filter(line => line.trim());
  const messages: ChatMessage[] = [];
  const participants = new Set<string>();
  let format: ParsedChat['format'] = 'unknown';

  for (const line of lines) {
    // 尝试 WeChat 标准格式
    let match = line.match(WECHAT_PATTERNS.standard);
    if (match) {
      format = 'wechat';
      const [, dateStr, sender, content] = match;
      const timestamp = parseWeChatDate(dateStr);
      messages.push({
        sender: sender.trim(),
        content: content.trim(),
        timestamp: timestamp || undefined,
        isOwnMessage: false,
      });
      participants.add(sender.trim());
      continue;
    }

    // 尝试 QQ 格式
    match = line.match(QQ_PATTERNS.standard) || line.match(QQ_PATTERNS.withDate);
    if (match) {
      format = 'qq';
      const [, dateStr, sender, content] = match;
      const timestamp = parseQQDate(dateStr);
      messages.push({
        sender: sender.trim(),
        content: content.trim(),
        timestamp: timestamp || undefined,
        isOwnMessage: false,
      });
      participants.add(sender.trim());
      continue;
    }

    // 尝试检测是否是用户自己的消息（通常在开头或结尾）
    if (line.includes(':') && !line.match(/^\[/)) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        format = 'generic';
        const sender = parts[0].trim();
        const content = parts.slice(1).join(':').trim();
        messages.push({
          sender,
          content,
          isOwnMessage: false,
        });
        participants.add(sender);
      }
    }
  }

  // 计算日期范围
  const timestamps = messages.filter(m => m.timestamp).map(m => m.timestamp!);
  const dateRange = timestamps.length > 0
    ? { start: new Date(Math.min(...timestamps.map(d => d.getTime()))),
        end: new Date(Math.max(...timestamps.map(d => d.getTime()))) }
    : null;

  return {
    messages,
    participants: Array.from(participants),
    dateRange,
    format,
  };
}

// ============================================
// CHAT TO SUMMARY
// ============================================

export interface ChatSummary {
  totalMessages: number;
  uniqueParticipants: number;
  dateRange: string | null;
  topInterests: string[];
  painPoints: string[];
  aspirations: string[];
  relationshipClues: string[];
  signals: GiftSignal[];
}

export function summarizeChat(chat: ParsedChat, config?: Partial<AnonymizerConfig>): ChatSummary {
  const anonymized = config ? anonymizeChat(chat, config) : chat;
  const signals = extractGiftSignals(anonymized.messages);

  const signalsByCategory = {
    interest: signals.filter(s => s.category === 'interest'),
    pain_point: signals.filter(s => s.category === 'pain_point'),
    aspiration: signals.filter(s => s.category === 'aspiration'),
    relationship: signals.filter(s => s.category === 'relationship'),
  };

  return {
    totalMessages: anonymized.messages.length,
    uniqueParticipants: anonymized.participants.length,
    dateRange: anonymized.dateRange
      ? `${anonymized.dateRange.start.toLocaleDateString()} - ${anonymized.dateRange.end.toLocaleDateString()}`
      : null,
    topInterests: signalsByCategory.interest.map(s => s.context),
    painPoints: signalsByCategory.pain_point.map(s => s.context),
    aspirations: signalsByCategory.aspiration.map(s => s.context),
    relationshipClues: signalsByCategory.relationship.map(s => s.context),
    signals,
  };
}
