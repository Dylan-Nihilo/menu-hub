import { Router, Request, Response } from 'express'

const router = Router()

const AI_BASE_URL = process.env.AI_BASE_URL || 'http://localhost:8045'
const AI_API_KEY = process.env.AI_API_KEY || 'sk-148151549d9a4cc2a8e9eb8f320eebf8'
const AI_MODEL = process.env.AI_MODEL || 'claude-sonnet-4-5-thinking'

const RECIPE_PROMPT = `你是一个专业的中餐厨师助手。用户会给你一个菜名，你需要生成这道菜的详细信息。

请严格按照以下 JSON 格式返回，不要包含任何其他文字：
{
  "category": "分类（家常菜/川菜/粤菜/西餐/日料/甜点/汤羹/其他）",
  "difficulty": "难度（简单/中等/困难）",
  "prepTime": 准备时间（分钟，数字）,
  "cookTime": 烹饪时间（分钟，数字）,
  "ingredients": [
    {"name": "食材名称", "amount": "用量"}
  ],
  "steps": [
    {"content": "步骤描述"}
  ]
}

注意：
1. 食材数量通常 5-10 个
2. 步骤数量通常 4-8 个
3. 步骤描述要简洁明了
4. 只返回 JSON，不要有其他内容`

const SHOPPING_PROMPT = `你是一个购物清单助手。用户会给你多道菜的食材列表，你需要：
1. 识别相同或相似的食材（如"生姜"和"姜"是同一种）
2. 合并相同食材
3. 区分公共食材（多道菜都需要）和专属食材（只有一道菜需要）
4. 为每个食材分类
5. **重要**：将烹饪用量转换为购买用量！

请严格按照以下 JSON 格式返回：
{
  "common": [
    {"name": "食材名", "amount": "购买用量", "category": "分类"}
  ],
  "recipes": [
    {
      "recipeId": "菜谱ID",
      "recipeName": "菜名",
      "items": [
        {"name": "食材名", "amount": "购买用量", "category": "分类"}
      ]
    }
  ]
}

分类只能是：蔬菜、水果、肉类、海鲜、蛋奶、调味料、其他

注意：只返回 JSON，不要有其他内容`

// AI 生成菜谱
router.post('/recipe', async (req: Request, res: Response) => {
  try {
    const { dishName } = req.body

    if (!dishName?.trim()) {
      return res.status(400).json({ error: '请输入菜名' })
    }

    const response = await fetch(`${AI_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: RECIPE_PROMPT },
          { role: 'user', content: `请为"${dishName}"生成菜谱信息` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error('AI API error:', await response.text())
      return res.status(500).json({ error: 'AI 服务暂时不可用' })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return res.status(500).json({ error: '生成失败' })
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: '解析失败' })
    }

    const recipe = JSON.parse(jsonMatch[0])
    res.json(recipe)
  } catch (error) {
    console.error('AI recipe error:', error)
    res.status(500).json({ error: '生成失败，请重试' })
  }
})

// AI 生成购物清单
router.post('/shopping', async (req: Request, res: Response) => {
  try {
    const { recipes } = req.body

    if (!recipes?.length) {
      return res.status(400).json({ error: '没有菜谱' })
    }

    const recipeList = recipes.map((r: any) => {
      let ingredients = []
      try {
        ingredients = r.ingredients ? JSON.parse(r.ingredients) : []
      } catch {
        ingredients = []
      }
      return `菜谱ID: ${r.id}\n菜名: ${r.name}\n食材: ${ingredients.map((i: any) => `${i.name}(${i.amount})`).join(', ')}`
    }).join('\n\n')

    const response = await fetch(`${AI_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SHOPPING_PROMPT },
          { role: 'user', content: `请整理以下菜谱的购物清单：\n\n${recipeList}` }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error('AI API error:', await response.text())
      return res.status(500).json({ error: 'AI 服务暂时不可用' })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return res.status(500).json({ error: '生成失败' })
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: '解析失败' })
    }

    const result = JSON.parse(jsonMatch[0])
    res.json(result)
  } catch (error) {
    console.error('AI shopping error:', error)
    res.status(500).json({ error: '生成失败，请重试' })
  }
})

export default router
