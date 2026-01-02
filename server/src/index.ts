import express from 'express'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth'
import recipeRoutes from './routes/recipes'
import menuRoutes from './routes/menu'
import shoppingRoutes from './routes/shopping'
import coupleRoutes from './routes/couple'
import uploadRoutes from './routes/upload'
import aiRoutes from './routes/ai'
import aiImageRoutes from './routes/ai-image'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.method === 'POST' ? req.body : req.query)
  next()
})

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/recipes', recipeRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/shopping', shoppingRoutes)
app.use('/api/couple', coupleRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/ai-image', aiImageRoutes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
