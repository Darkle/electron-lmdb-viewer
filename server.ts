import path from 'path'
import fs from 'fs'

import { open as openLMDB } from 'lmdb'
import createFastify from 'fastify'
import fastifyFavicon from 'fastify-favicon'
import fastifyStatic from 'fastify-static'
import fastifyUrlData from 'fastify-url-data'

const port = 3131
const fastify = createFastify({
  ignoreTrailingSlash: true,
  onProtoPoisoning: 'remove',
})

fastify.register(fastifyFavicon, { path: './frontend/static', name: 'database_lightning_icon.png' })

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'frontend'),
  prefix: '/public/',
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'node_modules'),
  prefix: '/node_modules/',
  decorateReply: false, // need this if do more than one fastify.register(fastifyStatic
})

fastify.register(fastifyUrlData)

const bufferIndexHtml = fs.readFileSync(path.join(process.cwd(), 'frontend', 'index.html'))

fastify.get('/', (_, reply) => {
  reply.type('text/html').send(bufferIndexHtml)
})

fastify.listen(port, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Server is now listening on ${address}`)
})
