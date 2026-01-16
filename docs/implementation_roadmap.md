# 🗺️ GiftGhost Implementation Roadmap

> _Role: Technical Lead & Product Architect_ > _Philosophy: "Logic before Beauty, Beauty before Features."_

---

## 📅 High-Level Timeline (1 Month Sprint)

| Phase  | Milestone Name                  | Timeline | Key Goal                                                                                  |
| :----- | :------------------------------ | :------- | :---------------------------------------------------------------------------------------- |
| **M1** | **The Soul (Core Logic)**       | Week 1   | Functional "Mad Libs" Input -> Deep Insight -> Gift Recommendation pipeline.              |
| **M2** | **The Body (Playful UI)**       | Week 2   | Implement the "Playful Warmth" design system, animations, and "Magic in Progress" scenes. |
| **M3** | **The Brain (Intelligence)**    | Week 3   | Connect Omni-Source Inputs (Social Links, Chat Logs) to LLM. Fine-tune prompts.           |
| **M4** | **The Voice (Launch & Growth)** | Week 4   | SEO, Share Cards, Affiliate Links, PWA Polish.                                            |

---

## 📍 Weekly Breakdown & Task Cards

### 🚩 Milestone 1: The Soul (Core Logic & Infrastructure)

> _Focus: Data flow, Auth, and the "Brain" API._

#### Week 1 Plan

- **Goal:** A working "ugly" version where inputs generate valid gift JSON.
- **Architecture:** Supabase (Auth/DB) + Next.js Server Actions.

**Tasks:**

1.  **[Infra] Supabase Architecture**
    - `[ ]` Init Supabase project.
    - `[ ]` Schema Design: `users`, `gift_history`, `personas` (cache).
    - `[ ]` RLS Policies (Row Level Security) setup.
2.  **[Auth] Zero-Friction Auth**
    - `[ ]` Implement Google OAuth.
    - `[ ]` Implement "Anonymous Mode" (Guest users can try once).
3.  **[API] The Insight Engine (v0.1)**
    - `[ ]` Create `server action`: `generateInsight(inputText)`.
    - `[ ]` Integrate OpenAI API / Claude API (Mock first).
    - `[ ]` Output Structure: JSON schema validation for gift results.

### 🚩 Milestone 2: The Body (Playful Frontend)

> _Focus: Framer Motion, "Stage" System, and Emotional UI._

#### Week 2 Plan

- **Goal:** The application looks and feels like the "Playful Warmth Design Spec".
- **Architecture:** Client-side State Machine (`Stage.tsx`) + Framer Motion.

**Tasks:**

1.  **[UI] The "Stage" Controller**
    - `[ ]` Implement Scene Switcher (`Intro` -> `Input` -> `Thinking` -> `Reveal`).
    - `[ ]` Shared Layout Animations (AnimatePresence) - Soft & Friendly transitions.
2.  **[UI] Multi-Mode Input Component**
    - `[ ]` "Detective" Mode (URL/Link Analyzer).
    - `[ ]` "Listener" Mode (Thought Dump/Chat Log).
    - `[ ]` "Quick Chat" Mode (3-Question Interview).
3.  **[UI] Theatrical Loading State**
    - `[ ]` Implement Typewriter effect for "Thinking log".
    - `[ ]` Sound Design (Optional): Subtle "hum" or "click" sounds.

### 🚩 Milestone 3: The Brain (Real Intelligence & Sources)

> _Focus: Connecting the "Omni-Input" to the LLM and parsing messy data._

#### Week 3 Plan

- **Goal:** Support complex inputs (Chat logs, URLs) and generate _shockingly good_ results.
- **Architecture:** Server-side Parsing + Prompt Engineering.

**Tasks:**

1.  **[AI] Prompt Engineering Lab**
    - `[ ]` Construct System Prompt for "GiftGhost Persona" (Empathetic but sharp).
    - `[ ]` Unit Test Prompts: Ensure it handles "Vague inputs" gracefully.
2.  **[Parser] Chat Log Cleaner**
    - `[ ]` Regex Parser for WeChat/QQ export format.
    - `[ ]` anonymizer (`Alice` -> `Person A`, remove timestamps).
3.  **[Parser] URL Fetcher**
    - `[ ]` Integration with `Firecrawl` or basic `Puppeteer` for scraping text from public URLs.

### 🚩 Milestone 4: The Voice (Shareability & Launch)

> _Focus: Viral loops, Affiliate revenue, and Polish._

#### Week 4 Plan

- **Goal:** User wants to share the result. User buys the gift.
- **Architecture:** Canvas Generation + SEO.

**Tasks:**

1.  **[Growth] The "Ghost Card" Generator**
    - `[ ]` `canvas-confetti` + HTML2Canvas/Satori.
    - `[ ]` Generate a shareable image of the "Gift Reason" (Handwritten style).
2.  **[Monetization] Affiliate Engine**
    - `[ ]` Auto-append Amazon Associate Tags to generated links.
3.  **[Polish] Performance & SEO**
    - `[ ]` Metadata generation for dynamic pages.
    - `[ ]` Lighthouse Score > 95.

---

## 🏗️ Technical Dependencies Checklist

- **OpenAI API Key**: Need GPT-4o access.
- **Supabase Project**: Production & Staging env.
- **Vercel Account**: For Edge Functions deployment.
- **Resend/SendGrid**: For "Magic Link" emails (if not just Google).

---

## 🛑 Risk Assessment & Mitigation

| Risk                 | Probability | Mitigation                                                          |
| :------------------- | :---------- | :------------------------------------------------------------------ |
| **LLM Cost Spike**   | Medium      | Implement Strict Rate Limiting (3 free tries/IP).                   |
| **Scraper Blocking** | High        | Fallback to "Paste Text" mode if URL fetch fails.                   |
| **Animation Jitter** | Medium      | Use CSS Transforms only; optimize `framer-motion` layout thrashing. |

---

## 🚀 Immediate Next Actions (Today)

1.  **Execute Week 1, Task 1:** Initialize Supabase & Auth.
2.  **Execute Week 1, Task 2:** Create the basic "Mad Libs" Input Component (The visual shell).
