# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ UI-First Design Principle

这是一个 **UI 优先** 的应用，设计质量是核心竞争力：
- 严格遵循黑白灰设计系统，不使用彩色
- 动画和交互反馈必须流畅自然
- 使用 `AnimatedPressable` 替代 `TouchableOpacity`
- 任何 UI 修改前先阅读 `lib/theme.ts` 和 `lib/motion.ts`
- 保持全局设计语言一致性

## Commands

```bash
npx expo start          # Start Metro bundler (development)
npx expo start --ios    # Start with iOS simulator
npx expo start --android # Start with Android emulator
```

## Architecture

### App Structure (Expo Router - File-based routing)

```
app/
├── _layout.tsx         # Root layout with Stack navigator
├── index.tsx           # Splash/redirect screen
├── (auth)/             # Auth route group: login, register
├── (tabs)/             # Main tab navigator
│   ├── _layout.tsx     # Tab bar configuration
│   ├── home.tsx        # Daily menu view with calendar
│   ├── recipes.tsx     # Recipe list
│   ├── shopping.tsx    # Shopping list with checkboxes
│   └── profile.tsx     # User profile
├── pair/               # Couple pairing flow (create, join)
├── recipes/            # Recipe detail [id] and new recipe screens
├── settings/           # Settings pages (profile, password, couple)
└── select.tsx          # Recipe selection modal
```

### Key Patterns

**State Management:** Zustand store (`stores/authStore.ts`) with AsyncStorage persistence. Includes `menuRefreshKey` and `recipeRefreshKey` for triggering cross-component refreshes via `triggerMenuRefresh()` and `triggerRecipeRefresh()`.

**API Configuration:** `lib/api.ts` - Development uses local IP `192.168.88.233:3001`, production uses `menu.commitme.top`. All pages use direct fetch calls with `API_BASE` constant.

**Design System:** Black/white/gray palette only. Two theme files:
- `lib/theme.ts` - Complete design tokens (colors, spacing, borderRadius, fontSize, shadows)
- `constants/` - Legacy tokens (being phased out)

Key values: `#0a0a0a` (primary), `#f5f5f5` (card bg), `#a3a3a3` (tertiary text)

**Animation System:** `lib/motion.ts` with react-native-reanimated. Centralized configs:
- `listAnimation` - Staggered entrance/exit for lists
- `modalAnimation` - Overlay + content animations
- `bottomBarAnimation` - Slide-up for action bars
- `cardAnimation` - Press feedback
- Supports reduce-motion accessibility via `isReduceMotionEnabled()`

**Component Libraries:**
- `components/ui/` - Static UI primitives (Button, Input, Card, Modal, Toast, ConfirmModal)
- `components/animated/` - Animated wrappers (AnimatedPressable, AnimatedListItem, AnimatedBottomBar, AnimatedModal)

Use `AnimatedPressable` instead of `TouchableOpacity` for consistent press feedback across the app.

### Data Flow

1. User authenticates → stored in Zustand + AsyncStorage
2. All API calls include `coupleId` from auth store
3. Backend Express API runs separately at port 3001 (see `/server` directory)
4. Cross-component refresh: call `triggerMenuRefresh()` or `triggerRecipeRefresh()` after mutations

### Important Files

- `stores/authStore.ts` - Auth state with refresh triggers
- `lib/api.ts` - API base URL configuration
- `lib/theme.ts` - Design tokens aligned with web
- `lib/motion.ts` - Animation configuration
- `app/(tabs)/_layout.tsx` - Tab bar with Feather icons
- `components/ui/ToastProvider.tsx` - Wrap app root, use `useToast()` hook
