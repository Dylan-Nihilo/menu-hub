# 壹餐 App - React Native 迁移计划

## 项目概述

将现有的 Next.js PWA 应用迁移到 React Native + Expo，以实现：
- 更流畅的原生体验
- 上架 App Store 和 Google Play
- 保持现有 UI 设计风格和功能完整性

---

## 一、技术栈选型

### 前端（React Native）
| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Expo SDK 52 | 简化开发流程，支持 EAS Build |
| 路由 | Expo Router | 文件系统路由，类似 Next.js |
| 状态管理 | Zustand | 直接复用现有逻辑 |
| 样式 | NativeWind v4 | Tailwind CSS for RN |
| 动画 | React Native Reanimated | 替代 Framer Motion |
| 图标 | @expo/vector-icons | Lucide 图标替代方案 |
| 存储 | AsyncStorage | 替代 localStorage |
| HTTP | fetch / axios | 保持一致 |

### 后端（独立服务）
| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Express.js | 从 Next.js API Routes 迁移 |
| ORM | Prisma | 保持不变 |
| 数据库 | SQLite → PostgreSQL | 生产环境升级 |
| 部署 | Docker | 保持现有部署方式 |

---

## 二、项目结构

```
menu-app/
├── mobile/                    # React Native 应用
│   ├── app/                   # Expo Router 页面
│   │   ├── (auth)/           # 认证页面组
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (main)/           # 主应用页面组
│   │   │   ├── home.tsx
│   │   │   ├── recipes/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── new.tsx
│   │   │   ├── select.tsx
│   │   │   ├── shopping.tsx
│   │   │   └── settings/
│   │   ├── pair/
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── ui/               # UI 组件
│   │   └── layout/           # 布局组件
│   ├── stores/               # Zustand stores
│   ├── lib/                  # 工具函数
│   ├── constants/            # 常量定义
│   └── assets/               # 静态资源
│
├── server/                    # 后端 API 服务
│   ├── src/
│   │   ├── routes/           # API 路由
│   │   ├── middleware/       # 中间件
│   │   └── lib/              # 工具函数
│   ├── prisma/               # 数据库 schema
│   └── Dockerfile
│
└── web/                       # 保留原 Next.js（可选）
```

---

## 三、功能清单与页面映射

### 页面迁移清单

| 原页面 | RN 页面 | 优先级 | 复杂度 |
|--------|---------|--------|--------|
| `/` (Splash) | `app/index.tsx` | P0 | 低 |
| `/login` | `app/(auth)/login.tsx` | P0 | 中 |
| `/register` | `app/(auth)/register.tsx` | P0 | 中 |
| `/home` | `app/(main)/home.tsx` | P0 | 高 |
| `/recipes` | `app/(main)/recipes/index.tsx` | P0 | 中 |
| `/recipes/[id]` | `app/(main)/recipes/[id].tsx` | P0 | 高 |
| `/recipes/new` | `app/(main)/recipes/new.tsx` | P1 | 高 |
| `/select` | `app/(main)/select.tsx` | P0 | 中 |
| `/shopping` | `app/(main)/shopping.tsx` | P1 | 高 |
| `/profile` | `app/(main)/profile.tsx` | P2 | 低 |
| `/settings/*` | `app/(main)/settings/*` | P2 | 中 |
| `/pair/*` | `app/pair/*` | P1 | 中 |

### UI 组件迁移清单

| Web 组件 | RN 组件 | 变更说明 |
|----------|---------|----------|
| `Button` | `Button` | motion → Animated |
| `Input` | `Input` | TextInput 替代 |
| `Card` | `Card` | View + StyleSheet |
| `Dialog` | `Modal` | RN Modal 组件 |
| `Toast` | `Toast` | 自定义实现 |
| `Avatar` | `Avatar` | Image 组件 |
| `Badge` | `Badge` | View + Text |
| `EmptyState` | `EmptyState` | 直接迁移 |
| `BottomNav` | `TabBar` | Expo Router Tabs |
| `AppLayout` | `AppLayout` | SafeAreaView |

---

## 四、设计系统

### 颜色规范（保持一致）

```typescript
// constants/colors.ts
export const colors = {
  primary: '#0a0a0a',      // 主色调 - 黑色
  background: '#ffffff',    // 背景色 - 白色
  surface: '#f5f5f5',      // 卡片背景 - 浅灰
  text: {
    primary: '#0a0a0a',    // 主文字
    secondary: '#666666',   // 次要文字
    muted: '#a3a3a3',      // 弱化文字
  },
  border: '#e5e5e5',       // 边框色
}
```

### 字体规范

```typescript
// constants/typography.ts
export const typography = {
  h1: { fontSize: 28, fontWeight: '600' },
  h2: { fontSize: 20, fontWeight: '600' },
  h3: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  small: { fontSize: 11, fontWeight: '400' },
}
```

### 间距规范

```typescript
// constants/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
}

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
}
```

---

## 五、实施阶段

### Phase 1: 基础设施搭建
- [ ] 创建 Expo 项目
- [ ] 配置 NativeWind
- [ ] 配置 Expo Router
- [ ] 设置 Zustand store
- [ ] 创建设计系统常量

### Phase 2: 后端 API 分离
- [ ] 创建 Express 服务器
- [ ] 迁移所有 API Routes
- [ ] 配置 CORS
- [ ] 更新 Docker 配置
- [ ] 测试 API 端点

### Phase 3: UI 组件库
- [ ] Button 组件
- [ ] Input 组件
- [ ] Card 组件
- [ ] Modal/Dialog 组件
- [ ] Toast 组件
- [ ] Avatar 组件
- [ ] Badge 组件
- [ ] EmptyState 组件
- [ ] TabBar 组件
- [ ] Header 组件

### Phase 4: 核心页面
- [ ] Splash 页面
- [ ] 登录页面
- [ ] 注册页面
- [ ] 首页（含周历、菜单、随机推荐）
- [ ] 食谱列表页
- [ ] 食谱详情页
- [ ] 选择食谱页

### Phase 5: 次要页面
- [ ] 新建食谱页
- [ ] 购物清单页
- [ ] 配对页面
- [ ] 个人资料页
- [ ] 设置页面

### Phase 6: 优化与发布
- [ ] 性能优化
- [ ] 动画优化
- [ ] 离线支持
- [ ] 推送通知
- [ ] App Store 提交
- [ ] Google Play 提交

---

## 六、API 端点清单

### 认证 API
```
POST /api/auth/register    # 用户注册
POST /api/auth/login       # 用户登录
POST /api/auth/logout      # 用户登出
```

### 食谱 API
```
GET    /api/recipes              # 获取食谱列表
POST   /api/recipes              # 创建食谱
GET    /api/recipes/:id          # 获取食谱详情
PUT    /api/recipes/:id          # 更新食谱
DELETE /api/recipes/:id          # 删除食谱
```

### 菜单 API
```
GET    /api/menu                 # 获取每日菜单
POST   /api/menu                 # 创建/更新菜单
DELETE /api/menu/item/:id        # 删除菜单项
```

### 购物清单 API
```
GET    /api/shopping             # 获取购物清单
POST   /api/shopping             # 添加购物项
PUT    /api/shopping/:id         # 更新购物项
DELETE /api/shopping/:id         # 删除购物项
POST   /api/ai/shopping          # AI 生成购物清单
```

### 配对 API
```
POST   /api/couple/create        # 创建配对
POST   /api/couple/join          # 加入配对
```

### AI API
```
POST   /api/ai/recipe            # AI 生成食谱
POST   /api/ai/shopping          # AI 聚合购物清单
```

---

## 七、数据模型（保持不变）

```prisma
model User {
  id        String   @id @default(cuid())
  nickname  String
  email     String   @unique
  password  String
  coupleId  String?
  role      String?
  createdAt DateTime @default(now())
}

model Couple {
  id         String   @id @default(cuid())
  inviteCode String   @unique
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}

model Recipe {
  id          String   @id @default(cuid())
  coupleId    String
  createdById String
  name        String
  coverImage  String?
  category    String?
  difficulty  String?
  prepTime    Int?
  cookTime    Int?
  ingredients String?  // JSON
  steps       String?  // JSON
  createdAt   DateTime @default(now())
}

model DailyMenu {
  id        String   @id @default(cuid())
  coupleId  String
  menuDate  DateTime
  status    String   @default("planning")
}

model MenuItem {
  id           String   @id @default(cuid())
  menuId       String
  recipeId     String
  selectedById String
  createdAt    DateTime @default(now())
}

model ShoppingItem {
  id        String   @id @default(cuid())
  coupleId  String
  name      String
  amount    String?
  category  String
  checked   Boolean  @default(false)
  type      String   @default("memo")
  recipeId  String?
  recipeName String?
  listDate  DateTime
  createdAt DateTime @default(now())
}
```

---

## 八、关键技术决策

### 1. 动画方案
- Web: Framer Motion
- RN: React Native Reanimated + Moti

```typescript
// Web (Framer Motion)
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// RN (Moti)
<MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} />
```

### 2. 样式方案
- Web: Tailwind CSS
- RN: NativeWind (Tailwind for RN)

```typescript
// 两者语法基本一致
<View className="bg-gray-50 rounded-2xl p-5" />
```

### 3. 图标方案
- Web: Lucide React
- RN: @expo/vector-icons (Feather 图标集)

```typescript
// Web
import { Plus } from 'lucide-react'

// RN
import { Feather } from '@expo/vector-icons'
<Feather name="plus" size={24} />
```

### 4. 存储方案
- Web: localStorage
- RN: AsyncStorage

```typescript
// 封装统一接口
export const storage = {
  get: async (key: string) => AsyncStorage.getItem(key),
  set: async (key: string, value: string) => AsyncStorage.setItem(key, value),
  remove: async (key: string) => AsyncStorage.removeItem(key),
}
```

---

## 九、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 动画效果差异 | 中 | 使用 Reanimated 重新实现 |
| 样式兼容问题 | 低 | NativeWind 覆盖大部分场景 |
| 图片上传 | 中 | 使用 expo-image-picker |
| 推送通知 | 中 | 使用 expo-notifications |
| App 审核 | 高 | 提前准备隐私政策、截图 |

---

## 十、验收标准

### 功能验收
- [ ] 所有页面功能与 Web 版一致
- [ ] 数据同步正常
- [ ] 离线状态处理得当

### 体验验收
- [ ] 页面切换流畅（< 300ms）
- [ ] 动画流畅（60fps）
- [ ] 手势操作自然
- [ ] 键盘交互正常

### 性能验收
- [ ] 冷启动时间 < 2s
- [ ] 内存占用合理
- [ ] 电量消耗正常

---

## 开始执行

准备就绪后，按以下顺序执行：

1. **Phase 1**: 创建 Expo 项目并配置基础设施
2. **Phase 2**: 分离后端 API
3. **Phase 3**: 实现 UI 组件库
4. **Phase 4**: 实现核心页面
5. **Phase 5**: 实现次要页面
6. **Phase 6**: 优化并提交应用商店
