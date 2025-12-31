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
  const data = await request.json()

  const recipe = await prisma.recipe.create({ data })

  return NextResponse.json(recipe)
}
