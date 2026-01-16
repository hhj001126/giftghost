# 🏗️ Radical Technical Architecture: The "Binary Star" Strategy

> _For: Kindred Radar & GiftGhost_ > _Author: The Pragmatic Architect (Musk/Jobs Hybrid)_

---

## 1. 核心技术选型论证 (The Tech Stack Decision)

我们面临两个截然不同的物理问题：

1.  **Kindred Radar** 依赖于 _Hardware Access_ (BLE 广播)。
2.  **GiftGhost** 依赖于 _Information Density_ (数据抓取与处理)。

因此，我们不强行使用一种技术栈。我们要使用**"Right Tool for the Physics"**。

### A. Kindred Radar (灵魂雷达)

- **选型:** **选项 C：React Native (Expo)**
- **论证:**
  - **Physics:** PWA 无法在 iOS 后台进行 BLE 广播（这是物理限制）。原生开发太慢。React Native 是唯一在 1 个月内能交付跨端 BLE 应用的方案。
  - **Innovation:** 使用 `Expo Config Plugins` 注入原生蓝牙权限，保持 JS 开发的极速体验。

### B. GiftGhost (情感幽灵)

- **选型:** **选项 A：Node.js 全栈 (Next.js on Vercel)**
- **论证:**
  - **Physics:** 这是一个纯信息流应用。无需下载。即用即走。
  - **Speed:** Vercel 的 Edge Functions 能在 100ms 内启动爬虫和 AI 推理。
  - **SEO:** 我们需要 GiftGhost 的生成的礼物页面被 Google 索引，从而获得免费流量。

---

## 2. 极简架构设计 (Radical Simplicity Architecture)

> _"The best part is no part." — Elon Musk_

我们拒绝微服务。我们拒绝 Kubernetes。在获得 10 万用户前，单体即正义。

### 📐 Architecture Diagram

```ascii
[USER'S REALITY]                 [CLOUD REALITY]
       |                                |
(Mobile/BLE) <--- Kindred Radar ---> (Supabase)
       |                                |
   [Offline] <---   (Sync)   ---> [Postgres DB]
                                        |
(Web Browser) <---  GiftGhost  ---> (Vercel Edge)
                                        |
                                   [OpenAI API]
                                   [Puppeteer]
```

### 关键决策 (Key Decisions)

1.  **Kindred Radar: The "Local-First" DB**
    - 使用 **RxDB** 或 **WatermelonDB** 在本地存储 Tags。只有匹配成功需交换 Contact 时，才连接 Supabase。**这将服务器成本降至 $0/月**。
2.  **GiftGhost: Ephemeral Compute**
    - 不存储用户聊天记录。分析完即销毁。**零隐私责任，零数据库成本**。

---

## 3. 激进技术决策 (Aggressive Tech Choices)

### 决策 1: "No-Backend" for Kindred (Kindred 的无后端策略)

我们不传输位置。我们不传输 ID。

- **常规做法:** 手机上传 GPS -> 服务器计算距离 -> 推送匹配。 (昂贵，侵犯隐私，延迟高)
- **我们的做法:** 它是 **P2P 的**。你的手机就是服务器。只有当两个手机的 BLE 信号在空中握手时，才发生交互。
- **竞争壁垒:** 极致的隐私和零延迟。

### 决策 2: "Prompt-as-Database" for GiftGhost (GiftGhost 的 Prompt 数据库)

我们不建立"商品数据库"。

- **常规做法:** 爬取淘宝/亚马逊商品 -> 存入 DB -> 搜索。
- **我们的做法:** 利用 LLM 的幻觉（Hallucination）作为特性。让 LLM "回忆"它见过的商品，然后通过 Google Search API 验证该商品现在的链接。
- **竞争壁垒:** 我们的库存是无限的（Whole Internet）。

---

## 4. 关键接口设计 (Key Interfaces)

我们只定义 3 个最核心的原子操作。

### 1. The Magic Moment (GiftGhost)

```http
POST /api/ghost/insight
Description: The core epiphany engine.
Input: { "url": "twitter.com/elonmusk", "text": "optional_raw_text" }
Output: {
  "persona": "Risk-taking visionary",
  "pain_point": "Loneliness at the top",
  "gift_recommendation": {
    "item": "First Edition of 'Foundation' by Asimov",
    "reason": "He mentioned it shaped his childhood.",
    "buy_link": "https://..."
  }
}
```

### 2. The Handshake (Kindred Radar)

This is not an HTTP request. It's a **BLE Advertisement Packet**.

```c
// BLE Manufacturer Data (0xFF)
Struct Payload {
  uint8_t protocol_version; // 0x01
  uint64_t tag_hash_1;      // First 8 bytes of hash("Mycology")
  uint64_t tag_hash_2;      // First 8 bytes of hash("Synth")
  uint8_t  magic_bit;       // 1 = I am open to talk
}
// Size: Extremely small (Scanning consumes < 1% battery/hour)
```

### 3. The Realtime Bridge (Kindred Radar)

只在双方决定"揭面"时调用。

```http
POST /api/radar/reveal
Input: { "my_user_id": "uuid", "target_device_id": "hash", "unlock_token": "signed_token" }
Output: { "status": "pending_target_approval" }
// WebSocket triggers when target also calls /reveal
```

---

## 5. 部署与运维 (Deployment & Zero-Ops)

### Global from Day 1

- **GiftGhost:** 部署在 Vercel Edge Regions (自动全球 CDN)。美国用户访问美国的节点，日本用户访问东京节点。
- **Kindred Radar:** Supabase 设为 Singapor (亚太中心) 或 US East。鉴于大部分逻辑是 Local P2P，服务器位置不重要。

### Zero Maintenance

- **Database:** Supabase 自动备份。
- **Logs:** Vercel 自动日志。
- **Monitoring:** Sentry 用于捕获 React Native 崩溃。

---

## 6. 放弃了什么？ (The Trade-offs)

- **放弃了:** 精准的"附近的人"地图查看功能。
  - _为什么值得？_ 换取了**绝对隐私**和**无需服务器计算位置**的低成本。
- **放弃了:** GiftGhost 的历史记录和账号系统（MVP 阶段）。
  - _为什么值得？_ 换取了**无注册门槛**的极速转化率。
