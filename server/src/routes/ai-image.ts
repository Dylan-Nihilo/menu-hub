import { Router } from 'express'

const router = Router()

const YUNWU_API = 'https://yunwu.ai/v1/chat/completions'
const YUNWU_KEY = 'sk-CQpNvAtH5RZ8LBfdt6lkjJfgiKr90Q2GhWvMC9J8H0tXeGXM'
const MODEL = 'gemini-3-pro-image-preview'

interface RecipeCardRequest {
  name: string
  category?: string
  difficulty?: string
  prepTime?: number
  cookTime?: number
  ingredients?: { name: string; amount: string }[]
}

router.post('/recipe-card', async (req, res) => {
  try {
    const { name, category, difficulty, prepTime, cookTime, ingredients } = req.body as RecipeCardRequest

    if (!name) {
      return res.status(400).json({ error: '缺少菜谱名称' })
    }

    // 构建提示词
    const ingredientList = ingredients?.slice(0, 5).map(i => i.name).join(', ') || ''
    const timeInfo = prepTime || cookTime ? `${(prepTime || 0) + (cookTime || 0)} minutes` : ''

    const prompt = `Create a stunning vintage recipe card image for "${name}".

SCENE SETUP:
- A 3D miniature kitchen scene with warm, golden-hour lighting
- Vintage cookbook aesthetic with cloth-bound cover texture and aged, stained pages as background elements
- The dish "${name}" as the hero element, beautifully plated and photographed

FOOD DETAILS:
- Hyper-realistic food textures with visible steam rising from the dish
- Glistening surfaces showing freshness and moisture
- Authentic cooking tools and utensils arranged artistically
${ingredientList ? `- Key ingredients visible: ${ingredientList}` : ''}

COMPOSITION:
- Single 1:1 square image format
- Dish centered with appetizing presentation
- Soft depth of field, background slightly blurred
- Warm kitchen ambiance with golden light casting gentle shadows

TEXT ELEMENTS:
- Dish name "${name}" in elegant serif typography at bottom
${category ? `- Small category tag: "${category}"` : ''}
${timeInfo ? `- Cooking time indicator: "${timeInfo}"` : ''}
- Watermark "Menu Hub" in bottom right corner (small, subtle)

STYLE:
- Vintage cookbook meets modern food photography
- Rich, warm color palette (amber, cream, copper tones)
- Professional food styling with garnishes
- Inviting and mouth-watering presentation

Output a single beautiful recipe card image.`

    const response = await fetch(YUNWU_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YUNWU_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('AI API error:', error)
      return res.status(500).json({ error: '生成图片失败' })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // 提取 base64 图片
    const match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/)
    if (!match) {
      console.error('No image in response:', content.substring(0, 200))
      return res.status(500).json({ error: '未能生成图片' })
    }

    res.json({ image: match[0] })
  } catch (error) {
    console.error('Recipe card generation error:', error)
    res.status(500).json({ error: '生成菜谱卡片失败' })
  }
})

// 随机元素
const BACKGROUNDS = ['rustic wooden table', 'white marble countertop', 'bamboo mat', 'ceramic plate on linen', 'cast iron skillet']
const LIGHTING = ['warm morning light', 'golden hour glow', 'soft natural daylight', 'cozy candlelight ambiance', 'dramatic side lighting']
const ANGLES = ['45-degree overhead shot', 'straight top-down view', 'eye-level side angle', 'close-up macro detail']
const GARNISHES = ['fresh herbs sprinkled', 'sesame seeds scattered', 'green onion garnish', 'chili flakes accent', 'citrus zest']

// 分类风格映射
const CATEGORY_STYLES: Record<string, string> = {
  '川菜': 'vibrant red chili oil sheen, fiery presentation, rustic clay bowl',
  '粤菜': 'elegant minimalist plating, white porcelain, delicate garnishes',
  '日料': 'zen-like simplicity, wooden serving board, geometric arrangement',
  '西餐': 'artistic sauce drizzle, white plate with negative space, herb sprigs',
  '家常菜': 'homestyle comfort, steaming hot, traditional cookware',
  '甜点': 'elegant dessert plating, powdered sugar dusting, mint leaf accent',
  '汤羹': 'deep ceramic bowl, visible steam swirls, floating garnishes',
}

const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

router.post('/recipe-cover', async (req, res) => {
  try {
    const { name, category, ingredients } = req.body

    if (!name) {
      return res.status(400).json({ error: '缺少菜谱名称' })
    }

    const bg = randomPick(BACKGROUNDS)
    const light = randomPick(LIGHTING)
    const angle = randomPick(ANGLES)
    const garnish = randomPick(GARNISHES)
    const categoryStyle = CATEGORY_STYLES[category] || 'appetizing home-cooked style'
    const ingredientHint = ingredients?.slice(0, 3).map((i: any) => i.name).join(', ') || ''

    const prompt = `Create a mouth-watering food photograph of "${name}".

SCENE: ${bg}
LIGHTING: ${light}
CAMERA: ${angle}
STYLE: ${categoryStyle}

FOOD PRESENTATION:
- The dish "${name}" as hero, professionally styled
- Hyper-realistic textures: glistening oils, visible steam, fresh ingredients
- ${garnish}
${ingredientHint ? `- Featuring: ${ingredientHint}` : ''}

MOOD: Inviting, delicious, makes viewer hungry

OUTPUT REQUIREMENTS:
- Format: Square 1:1 ratio
- Size: 512x512 pixels
- No text overlays
- Pure food photography
- Optimized file size`

    const response = await fetch(YUNWU_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YUNWU_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return res.status(500).json({ error: '生成图片失败' })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/)

    if (!match) {
      return res.status(500).json({ error: '未能生成图片' })
    }

    res.json({ image: match[0] })
  } catch (error) {
    console.error('Recipe cover generation error:', error)
    res.status(500).json({ error: '生成封面失败' })
  }
})

export default router
