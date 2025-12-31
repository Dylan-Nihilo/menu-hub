import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { nickname } = await request.json()

    if (!nickname?.trim()) {
      return NextResponse.json({ error: '昵称不能为空' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { nickname: nickname.trim() }
    })

    return NextResponse.json({ success: true, user })
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
