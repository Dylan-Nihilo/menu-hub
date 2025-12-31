import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const { userId, code } = await request.json()

  const couple = await prisma.couple.findUnique({
    where: { inviteCode: code.toUpperCase() },
  })

  if (!couple || couple.status !== 'pending') {
    return NextResponse.json({ error: '邀请码无效' }, { status: 400 })
  }

  await prisma.couple.update({
    where: { id: couple.id },
    data: { status: 'active' },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { coupleId: couple.id, role: 'partner_b' },
  })

  return NextResponse.json({ success: true, coupleId: couple.id })
}
