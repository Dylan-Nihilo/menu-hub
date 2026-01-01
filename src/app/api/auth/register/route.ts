import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const { email, password, nickname } = await request.json()

  // 验证必填字段
  if (!email?.trim()) {
    return NextResponse.json({ error: '请输入邮箱' }, { status: 400 })
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
  }
  if (!nickname?.trim()) {
    return NextResponse.json({ error: '请输入昵称' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: '邮箱已注册' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, nickname },
  })

  return NextResponse.json({ id: user.id, email: user.email, nickname: user.nickname })
}
