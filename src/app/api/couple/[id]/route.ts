import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const couple = await prisma.couple.findUnique({
    where: { id: params.id },
    include: {
      users: {
        select: { id: true, nickname: true }
      }
    }
  })

  if (!couple) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }

  // 返回 pairCode 字段（兼容前端）
  return NextResponse.json({
    ...couple,
    pairCode: couple.inviteCode
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 先解除用户关联
    await prisma.user.updateMany({
      where: { coupleId: params.id },
      data: { coupleId: null }
    })

    // 删除配对
    await prisma.couple.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '解除失败' }, { status: 500 })
  }
}
