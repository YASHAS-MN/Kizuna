import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'

const app = express()

// Global Middleware
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174']

app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// API Route Mounts
app.use('/api', healthRouter)

// Catch-all 404 Handler for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route Not Found: ${req.method} ${req.originalUrl}`
  })
})

// Centralized Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Log the full error in development console
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
