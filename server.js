const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'

// Bypassing environment flags to force port 6000 for the Firebase Studio Prototyper
const port = 6000;
const hostname = '0.0.0.0';

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Firebase IDE Prototyper link active on port ${port}`)
  })
}).catch((err) => {
  console.error('Error starting custom server:', err)
  process.exit(1)
})
