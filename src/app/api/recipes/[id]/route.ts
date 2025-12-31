import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
  })

  if (!recipe) {
    return NextResponse.json({ error: '菜谱不存在' }, { status: 404 })
  }

  return NextResponse.json(recipe)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.recipe.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
