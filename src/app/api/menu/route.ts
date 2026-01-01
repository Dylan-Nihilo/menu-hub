import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coupleId = searchParams.get('coupleId')
  const date = searchParams.get('date')

  if (!coupleId || !date) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const menu = await prisma.dailyMenu.findUnique({
    where: { coupleId_menuDate: { coupleId, menuDate: new Date(date) } },
    include: {
      items: {
        include: {
          recipe: true,
          selectedBy: { select: { nickname: true } },
        },
      },
    },
  })

  return NextResponse.json(menu || { items: [] })
}

export async function POST(request: Request) {
  const { coupleId, date, recipeIds, userId } = await request.json()

  if (!coupleId || !date || !recipeIds?.length) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  let menu = await prisma.dailyMenu.findUnique({
    where: { coupleId_menuDate: { coupleId, menuDate: new Date(date) } },
    include: { items: true },
  })

  if (!menu) {
    menu = await prisma.dailyMenu.create({
      data: { coupleId, menuDate: new Date(date) },
      include: { items: true },
    })
  }

  // 过滤掉已存在的 recipeId，避免重复插入
  const existingRecipeIds = new Set(menu.items.map(item => item.recipeId))
  const newRecipeIds = recipeIds.filter((id: string) => !existingRecipeIds.has(id))

  if (newRecipeIds.length > 0) {
    await prisma.menuItem.createMany({
      data: newRecipeIds.map((recipeId: string) => ({
        menuId: menu.id,
        recipeId,
        selectedById: userId,
      })),
    })
  }

  return NextResponse.json({ success: true })
}
