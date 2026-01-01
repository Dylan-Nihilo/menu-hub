import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  const { coupleId, date } = req.query
  if (!coupleId) return res.status(400).json({ error: '缺少 coupleId' })
  const items = await prisma.shoppingItem.findMany({
    where: { coupleId: coupleId as string, listDate: new Date(date as string) },
  })
  res.json(items)
})

router.post('/', async (req, res) => {
  const { coupleId, name, amount, category, type, listDate } = req.body
  const item = await prisma.shoppingItem.create({
    data: { coupleId, name, amount, category, type, listDate: new Date(listDate) },
  })
  res.json(item)
})

router.put('/:id', async (req, res) => {
  const { checked } = req.body
  const item = await prisma.shoppingItem.update({
    where: { id: req.params.id },
    data: { checked },
  })
  res.json(item)
})

router.delete('/:id', async (req, res) => {
  await prisma.shoppingItem.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
