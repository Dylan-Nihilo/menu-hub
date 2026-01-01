import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coupleId = searchParams.get('coupleId')

  if (!coupleId) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const recipes = await prisma.recipe.findMany({
    where: { coupleId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(recipes)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { coupleId, createdById, name } = data

    if (!coupleId || !createdById || !name?.trim()) {
      return NextResponse.json(
        { error: '缺少必填字段：coupleId, createdById, name' },
        { status: 400 }
      )
    }

    const recipe = await prisma.recipe.create({ data })
    return NextResponse.json(recipe)
  } catch (error) {
    console.error('POST recipe error:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
