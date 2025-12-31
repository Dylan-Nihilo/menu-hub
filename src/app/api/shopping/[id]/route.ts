import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 更新购物项（勾选状态）
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { checked } = await request.json()

  const item = await prisma.shoppingItem.update({
    where: { id: params.id },
    data: { checked },
  })

  return NextResponse.json(item)
}

// 删除购物项
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.shoppingItem.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
