import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 400 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: '密码错误' }, { status: 400 })
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    coupleId: user.coupleId,
  })
}
