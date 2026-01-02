import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

const getBaseUrl = (req: any) => `${req.protocol}://${req.get('host')}`

// 处理封面图片 URL：data URI 直接返回，相对路径添加 baseUrl
const formatCoverImage = (coverImage: string | null, baseUrl: string) => {
  if (!coverImage) return null
  // data URI 或已经是完整 URL 的直接返回
  if (coverImage.startsWith('data:') || coverImage.startsWith('http')) {
    return coverImage
  }
  // 相对路径添加 baseUrl
  return `${baseUrl}${coverImage}`
}

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
    coverImage: formatCoverImage(r.coverImage, baseUrl)
  }))
  res.json(recipesWithFullUrl)
})

router.get('/:id', async (req, res) => {
  const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } })
  if (!recipe) return res.status(404).json({ error: '食谱不存在' })
  const baseUrl = getBaseUrl(req)
  res.json({
    ...recipe,
    coverImage: formatCoverImage(recipe.coverImage, baseUrl)
  })
})

router.post('/', async (req, res) => {
  const { coupleId, createdById, name, coverImage, category, difficulty, prepTime, cookTime, ingredients, steps } = req.body
  console.log('创建菜谱请求:', { coupleId, createdById, name, category })

  if (!coupleId) {
    return res.status(400).json({ error: '缺少 coupleId' })
  }
  if (!createdById) {
    return res.status(400).json({ error: '缺少 createdById' })
  }
  if (!name) {
    return res.status(400).json({ error: '缺少菜名' })
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
    console.log('菜谱创建成功:', recipe.id)
    res.json(recipe)
  } catch (e) {
    console.error('创建菜谱失败:', e)
    res.status(500).json({ error: '创建失败', details: String(e) })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    // 先删除关联的菜单项
    await prisma.menuItem.deleteMany({ where: { recipeId: req.params.id } })
    // 再删除菜谱
    await prisma.recipe.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('删除菜谱失败:', error)
    res.status(500).json({ error: '删除失败' })
  }
})

export default router
