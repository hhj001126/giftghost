# GiftGhost i18n Coding Standards

## Global Rule: Use Context Hook, Not Prop Drilling

### The Rule

**Always use `useI18n()` hook to access translations. Never pass `t` as a prop.**

### ✅ Correct Usage

```tsx
// In every component that needs translations:
import { useI18n } from '@/i18n';

function MyComponent() {
  const { t } = useI18n();

  return <button>{t.common.submit}</button>;
}
```

### ❌ Forbidden Usage (Prop Drilling)

```tsx
// WRONG - Never pass t as prop
function ParentComponent() {
  const { t } = useI18n();
  return <ChildComponent t={t} />;
}

// WRONG - Never receive t in props
function ChildComponent({ t }: { t: TFunction }) {
  return <button>{t.common.submit}</button>;
}
```

### Why This Rule Exists

1. **Cleaner Components** - No need to pass translation props through intermediate components
2. **Easier Refactoring** - Adding translations to a component doesn't require changing parent components
3. **Consistency** - All components follow the same pattern
4. **Type Safety** - The hook ensures translations are properly typed

### How to Migrate Old Code

If you find code passing `t` as a prop:

1. Remove `t` from the child component's props interface
2. Add `const { t } = useI18n()` inside the child component
3. Remove `t={t}` from the parent component's JSX

### Available Translations

All translation keys are defined in `src/i18n/locales/*.ts`:
- `en.ts` - English
- `zh-CN.ts` - Simplified Chinese
- `zh-HK.ts` - Traditional Chinese Hong Kong

Access translations via:
```tsx
const { t } = useI18n();
// t.intro.title
// t.input.modes.detective.label
// t.reveal.badge
// t.feedback.like
// etc.
```
