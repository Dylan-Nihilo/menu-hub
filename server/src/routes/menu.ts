import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  const { coupleId, date } = req.query
  if (!coupleId || !date) return res.status(400).json({ error: '缺少参数' })

  const menu = await prisma.dailyMenu.findFirst({
    where: { coupleId: coupleId as string, menuDate: new Date(date as string) },
    include: { items: { include: { recipe: true, selectedBy: true } } },
  })
  res.json(menu || { items: [] })
})

router.post('/', async (req, res) => {
  const { coupleId, date, recipeId, userId } = req.body
  let menu = await prisma.dailyMenu.findFirst({
    where: { coupleId, menuDate: new Date(date) },
  })
  if (!menu) {
    menu = await prisma.dailyMenu.create({
      data: { coupleId, menuDate: new Date(date) },
    })
  }
  const item = await prisma.menuItem.create({
    data: { menuId: menu.id, recipeId, selectedById: userId },
  })
  res.json(item)
})

router.delete('/item/:id', async (req, res) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
