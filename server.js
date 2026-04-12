const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, hostname: '0.0.0.0', port: 6000 })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(6000, '0.0.0.0', () => {
    console.log('> Ready on http://0.0.0.0:6000')
  })
})