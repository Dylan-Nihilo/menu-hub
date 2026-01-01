import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  const { coupleId } = req.query
  if (!coupleId) return res.status(400).json({ error: '缺少 coupleId' })
  const recipes = await prisma.recipe.findMany({
    where: { coupleId: coupleId as string },
    orderBy: { createdAt: 'desc' },
  })
  res.json(recipes)
})

router.get('/:id', async (req, res) => {
  const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } })
  if (!recipe) return res.status(404).json({ error: '食谱不存在' })
  res.json(recipe)
})

router.post('/', async (req, res) => {
  const { coupleId, createdById, name, category, ingredients, steps } = req.body
  if (!createdById) {
    return res.status(400).json({ error: '缺少 createdById' })
  }
  try {
    const recipe = await prisma.recipe.create({
      data: {
        name,
        category,
        ingredients,
        steps,
        couple: { connect: { id: coupleId } },
        createdBy: { connect: { id: createdById } },
      },
    })
    res.json(recipe)
  } catch (e) {
    res.status(500).json({ error: '创建失败' })
  }
})

router.delete('/:id', async (req, res) => {
  await prisma.recipe.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
