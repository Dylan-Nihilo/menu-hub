import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取购物清单
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const coupleId = searchParams.get('coupleId')
    const date = searchParams.get('date')

    if (!coupleId || !date) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    }

    const items = await prisma.shoppingItem.findMany({
      where: {
        coupleId,
        listDate: new Date(date),
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET shopping error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 批量添加购物清单项
export async function POST(request: Request) {
  try {
    const { coupleId, date, items } = await request.json()

    if (!coupleId || !date || !items?.length) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    }

    const listDate = new Date(date)

    const created = await prisma.shoppingItem.createMany({
      data: items.map((item: {
        name: string
        amount?: string
        category: string
        type: string
        recipeId?: string
        recipeName?: string
      }) => ({
        coupleId,
        listDate,
        name: item.name,
        amount: item.amount || '',
        category: item.category,
        type: item.type,
        recipeId: item.recipeId || null,
        recipeName: item.recipeName || null,
      })),
    })

    return NextResponse.json({ count: created.count })
  } catch (error) {
    console.error('POST shopping error:', error)
    return NextResponse.json({ error: '添加失败' }, { status: 500 })
  }
}

// 清空当日购物清单
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const coupleId = searchParams.get('coupleId')
  const date = searchParams.get('date')

  if (!coupleId || !date) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  await prisma.shoppingItem.deleteMany({
    where: {
      coupleId,
      listDate: new Date(date),
    },
  })

  return NextResponse.json({ success: true })
}
