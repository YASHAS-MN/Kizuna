import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down server gracefully...`)
  server.close(() => {
    console.log('HTTP server closed.')
    process.exit(0)
  })

  // Timeout shutdown after 10s if connections refuse to close
  setTimeout(() => {
    console.error('Shutdown timeout reached, forcing process termination.')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
