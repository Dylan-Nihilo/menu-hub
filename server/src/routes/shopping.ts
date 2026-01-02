import { Router } from 'express'
import { prisma } from '../lib/db'

const router = Router()

// 验证日期是否有效
function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

router.get('/', async (req, res) => {
  try {
    const { coupleId, date } = req.query
    if (!coupleId) return res.status(400).json({ error: '缺少 coupleId' })
    if (!date || !isValidDate(date as string)) {
      return res.status(400).json({ error: '无效的日期格式' })
    }
    const items = await prisma.shoppingItem.findMany({
      where: { coupleId: coupleId as string, listDate: new Date(date as string) },
    })
    res.json(items)
  } catch (error) {
    console.error('获取购物清单失败:', error)
    res.status(500).json({ error: '获取购物清单失败' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { coupleId, items, date, name, amount, category, type, listDate } = req.body

    if (!coupleId) {
      return res.status(400).json({ error: '缺少 coupleId' })
    }

    // 批量创建模式
    if (items && Array.isArray(items)) {
      if (!date || !isValidDate(date)) {
        return res.status(400).json({ error: '无效的日期格式' })
      }
      const listDateObj = new Date(date)
      const created = await prisma.shoppingItem.createMany({
        data: items.map((item: any) => ({
          coupleId,
          name: item.name || '',
          amount: item.amount || '',
          category: item.category || '其他',
          type: item.type || 'memo',
          recipeId: item.recipeId || null,
          recipeName: item.recipeName || null,
          listDate: listDateObj,
        })),
      })
      return res.json({ success: true, count: created.count })
    }

    // 单个创建模式
    if (!name) {
      return res.status(400).json({ error: '缺少必要参数' })
    }
    if (!listDate || !isValidDate(listDate)) {
      return res.status(400).json({ error: '无效的日期格式' })
    }

    const item = await prisma.shoppingItem.create({
      data: {
        coupleId,
        name,
        amount: amount || '',
        category: category || '其他',
        type: type || 'memo',
        listDate: new Date(listDate)
      },
    })
    res.json(item)
  } catch (error) {
    console.error('创建购物项失败:', error)
    res.status(500).json({ error: '创建购物项失败' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { checked } = req.body
    const item = await prisma.shoppingItem.update({
      where: { id: req.params.id },
      data: { checked },
    })
    res.json(item)
  } catch (error) {
    console.error('更新购物项失败:', error)
    res.status(500).json({ error: '更新购物项失败' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.shoppingItem.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('删除购物项失败:', error)
    res.status(500).json({ error: '删除购物项失败' })
  }
})

export default router
