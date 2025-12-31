import { NextResponse } from 'next/server'

const AI_BASE_URL = 'http://localhost:8045'
const AI_API_KEY = 'sk-148151549d9a4cc2a8e9eb8f320eebf8'
const AI_MODEL = 'claude-sonnet-4-5-thinking'

const SYSTEM_PROMPT = `你是一个购物清单助手。用户会给你多道菜的食材列表，你需要：
1. 识别相同或相似的食材（如"生姜"和"姜"是同一种）
2. 合并相同食材
3. 区分公共食材（多道菜都需要）和专属食材（只有一道菜需要）
4. 为每个食材分类
5. **重要**：将烹饪用量转换为购买用量！
   - 调味料（盐、糖、酱油、醋、油等）：如果家里常备，写"适量"或"（常备）"
   - 生鲜食材：转换为合理的购买单位（如"300g"、"1斤"、"2个"）
   - 不要出现"半勺"、"一勺"、"少许"这种烹饪用量

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

export async function POST(request: Request) {
  try {
    const { recipes } = await request.json()

    if (!recipes?.length) {
      return NextResponse.json({ error: '没有菜谱' }, { status: 400 })
    }

    // 构建提示
    const recipeList = recipes.map((r: { id: string; name: string; ingredients: string }) => {
      let ingredients = []
      try {
        ingredients = r.ingredients ? JSON.parse(r.ingredients) : []
      } catch {
        ingredients = []
      }
      return `菜谱ID: ${r.id}\n菜名: ${r.name}\n食材: ${ingredients.map((i: { name: string; amount: string }) => `${i.name}(${i.amount})`).join(', ')}`
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请整理以下菜谱的购物清单：\n\n${recipeList}` }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error('AI API error:', await response.text())
      return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: '生成失败' }, { status: 500 })
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: '解析失败' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI shopping error:', error)
    return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 })
  }
}
