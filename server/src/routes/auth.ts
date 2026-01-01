import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/db'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { nickname, email, password } = req.body
    if (!nickname || !email || !password) {
      return res.status(400).json({ error: '请填写所有字段' })
    }
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ error: '邮箱已注册' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { nickname, email, password: hashed },
    })
    res.json({ user: { id: user.id, email: user.email, nickname: user.nickname } })
  } catch {
    res.status(500).json({ error: '注册失败' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: '用户不存在' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: '密码错误' })

    res.json({ user: { id: user.id, email: user.email, nickname: user.nickname, coupleId: user.coupleId } })
  } catch {
    res.status(500).json({ error: '登录失败' })
  }
})

export default router
