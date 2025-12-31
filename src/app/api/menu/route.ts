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

  return NextResponse.json(menu)
}

export async function POST(request: Request) {
  const { coupleId, date, recipeIds, userId } = await request.json()

  let menu = await prisma.dailyMenu.findUnique({
    where: { coupleId_menuDate: { coupleId, menuDate: new Date(date) } },
  })

  if (!menu) {
    menu = await prisma.dailyMenu.create({
      data: { coupleId, menuDate: new Date(date) },
    })
  }

  await prisma.menuItem.createMany({
    data: recipeIds.map((recipeId: string) => ({
      menuId: menu.id,
      recipeId,
      selectedById: userId,
    })),
  })

  return NextResponse.json({ success: true })
}
