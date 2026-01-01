import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

const getBaseUrl = (req: any) => `${req.protocol}://${req.get('host')}`

router.get('/', async (req, res) => {
  const { coupleId } = req.query
  if (!coupleId) return res.status(400).json({ error: '缺少 coupleId' })
  const recipes = await prisma.recipe.findMany({
    where: { coupleId: coupleId as string },
    orderBy: { createdAt: 'desc' },
  })
  const baseUrl = getBaseUrl(req)
  const recipesWithFullUrl = recipes.map(r => ({
    ...r,
    coverImage: r.coverImage ? `${baseUrl}${r.coverImage}` : null
  }))
  res.json(recipesWithFullUrl)
})

router.get('/:id', async (req, res) => {
  const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } })
  if (!recipe) return res.status(404).json({ error: '食谱不存在' })
  const baseUrl = getBaseUrl(req)
  res.json({
    ...recipe,
    coverImage: recipe.coverImage ? `${baseUrl}${recipe.coverImage}` : null
  })
})

router.post('/', async (req, res) => {
  const { coupleId, createdById, name, coverImage, category, difficulty, prepTime, cookTime, ingredients, steps } = req.body
  if (!createdById) {
    return res.status(400).json({ error: '缺少 createdById' })
  }
  try {
    const recipe = await prisma.recipe.create({
      data: {
        name,
        coverImage,
        category,
        difficulty,
        prepTime,
        cookTime,
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
