import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import usersRouter from './routes/users.routes.js'
import teamsRouter from './routes/teams.routes.js'
import projectsRouter from './routes/projects.routes.js'
import authRouter from './routes/auth.routes.js'
import { createAuthMiddleware } from './middlewares/auth.middleware.js'
import { AuthService } from './services/auth.service.js'
import { userRepository, sessionRepository } from './repositories/index.js'

const app = express()

// Global Middleware
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']

app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true, // Required to permit HttpOnly session cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))
app.use(express.json())

// Global Session Resolver Middleware
const authService = new AuthService(userRepository, sessionRepository)
app.use(createAuthMiddleware(authService))

// API Route Mounts
app.use('/api', healthRouter)
app.use('/api', usersRouter)
app.use('/api', teamsRouter)
app.use('/api', projectsRouter)
app.use('/api', authRouter)

// Catch-all 404 Handler for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route Not Found: ${req.method} ${req.originalUrl}`
  })
})

// Centralized Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err)

  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    status: 'error',
    error: {
      message,
      statusCode
    }
  })
})

export default app
