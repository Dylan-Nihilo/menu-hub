import { NextResponse } from 'next/server'

const AI_BASE_URL = 'http://172.17.0.1:8045'
const AI_API_KEY = 'sk-148151549d9a4cc2a8e9eb8f320eebf8'
const AI_MODEL = 'claude-sonnet-4-5-thinking'

const SYSTEM_PROMPT = `你是一个专业的中餐厨师助手。用户会给你一个菜名，你需要生成这道菜的详细信息。

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

export async function POST(request: Request) {
  try {
    const { dishName } = await request.json()

    if (!dishName?.trim()) {
      return NextResponse.json({ error: '请输入菜名' }, { status: 400 })
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请为"${dishName}"生成菜谱信息` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('AI API error:', error)
      return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: '生成失败' }, { status: 500 })
    }

    // 解析 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: '解析失败' }, { status: 500 })
    }

    const recipe = JSON.parse(jsonMatch[0])
    return NextResponse.json(recipe)
  } catch (error) {
    console.error('AI recipe error:', error)
    return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 })
  }
}
