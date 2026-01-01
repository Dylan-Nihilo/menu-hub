import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' })
    }
    const couple = await prisma.couple.create({
      data: { inviteCode: generateCode(), status: 'pending' },
    })
    await prisma.user.update({
      where: { id: userId },
      data: { coupleId: couple.id },
    })
    res.json(couple)
  } catch (error) {
    console.error('创建配对失败:', error)
    res.status(500).json({ error: '创建配对失败' })
  }
})

router.post('/join', async (req, res) => {
  try {
    const { userId, inviteCode } = req.body
    if (!userId || !inviteCode) {
      return res.status(400).json({ error: '缺少必要参数' })
    }
    const couple = await prisma.couple.findUnique({ where: { inviteCode } })
    if (!couple) return res.status(404).json({ error: '邀请码无效' })

    await prisma.user.update({
      where: { id: userId },
      data: { coupleId: couple.id },
    })
    await prisma.couple.update({
      where: { id: couple.id },
      data: { status: 'active' },
    })
    res.json(couple)
  } catch (error) {
    console.error('加入配对失败:', error)
    res.status(500).json({ error: '加入配对失败' })
  }
})

router.get('/:id', async (req, res) => {
  const couple = await prisma.couple.findUnique({
    where: { id: req.params.id },
    include: { users: { select: { id: true, nickname: true } } },
  })
  if (!couple) return res.status(404).json({ error: '配对不存在' })
  res.json(couple)
})

export default router
