import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: Request) {
  const { userId } = await request.json()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 400 })
  }

  if (user.coupleId) {
    const couple = await prisma.couple.findUnique({ where: { id: user.coupleId } })
    return NextResponse.json(couple)
  }

  const couple = await prisma.couple.create({
    data: { inviteCode: generateCode() },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { coupleId: couple.id, role: 'partner_a' },
  })

  return NextResponse.json(couple)
}
