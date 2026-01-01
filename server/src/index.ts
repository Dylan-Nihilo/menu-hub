import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import recipeRoutes from './routes/recipes'
import menuRoutes from './routes/menu'
import shoppingRoutes from './routes/shopping'
import coupleRoutes from './routes/couple'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/recipes', recipeRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/shopping', shoppingRoutes)
app.use('/api/couple', coupleRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
