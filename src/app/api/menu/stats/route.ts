import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coupleId = searchParams.get('coupleId')

  if (!coupleId) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const count = await prisma.menuItem.count({
    where: {
      menu: { coupleId }
    }
  })

  return NextResponse.json({ count })
}
