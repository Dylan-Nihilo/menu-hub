---
name: design-guide
description: Menu App 设计规范指南。在进行任何 UI 开发或设计修改前，必须参考此规范确保风格统一。
user_invocable: false
---

# Menu App 设计规范

## 核心设计原则

**极简黑白灰** - 整体采用黑白灰色调，营造简洁高级感。

## 色彩系统

### 主色调（必须遵守）
- **主黑色**: `#0a0a0a` - 用于标题、按钮、强调元素
- **深灰色**: `#666666` - 用于次要文字、图标
- **浅灰色**: `#a3a3a3` - 用于辅助文字、占位符
- **边框灰**: `#d4d4d4` - 用于边框、分割线
- **背景灰**: `#f5f5f5` / `gray-50` - 用于卡片背景、输入框背景
- **纯白色**: `#ffffff` - 用于页面背景、卡片

### 语义色（仅在特定场景使用）
- **成功**: 不使用绿色，使用黑色勾选框表示完成
- **错误/删除**: `#F44336` (error-500) - 仅用于删除确认按钮
- **警告**: `#FF9800` (warning-500) - 仅用于警告提示

## 组件样式规范

### 勾选框 Checkbox
```
未选中: border-[#d4d4d4] bg-transparent
已选中: bg-[#0a0a0a] border-[#0a0a0a] + 白色勾选图标
```

### 按钮 Button
```
主要按钮: bg-[#0a0a0a] text-white rounded-xl
次要按钮: bg-gray-100 text-[#0a0a0a] rounded-xl
危险按钮: bg-[#0a0a0a] text-white (不用红色背景)
```

### 输入框 Input
```
默认: bg-gray-100 rounded-xl border-none
聚焦: ring-2 ring-[#0a0a0a]
```

### 卡片 Card
```
背景: bg-gray-50 rounded-2xl
无阴影，使用背景色区分层级
```

### 徽章 Badge
```
默认: bg-[#0a0a0a] text-white rounded-full px-3 py-1
次要: bg-gray-100 text-[#666] rounded-full px-3 py-1
```

## 禁止事项

1. **禁止使用彩色作为状态指示**
   - 不用绿色表示"已完成"
   - 不用红色表示"删除"按钮背景
   - 不用蓝色表示"选中"

2. **禁止使用渐变色**

3. **禁止使用彩色图标**（除非是品牌logo）

## 正确示例

### 已完成项目
```tsx
// 正确：黑色勾选框 + 删除线
<div className={`w-5 h-5 rounded-lg border-2
  ${checked ? 'bg-[#0a0a0a] border-[#0a0a0a]' : 'border-[#d4d4d4]'}`}>
  {checked && <CheckIcon className="text-white" />}
</div>
<span className={checked ? 'line-through text-[#a3a3a3]' : 'text-[#0a0a0a]'}>
  项目名称
</span>
```

### 操作栏
```tsx
// 正确：黑色背景徽章 + 黑色按钮
<div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center">
  <span className="text-white font-semibold">{count}</span>
</div>
<button className="px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl">
  清除已选
</button>
```
