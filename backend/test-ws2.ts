import Fastify from 'fastify'
import websocket from '@fastify/websocket'

const fastify = Fastify()
fastify.register(websocket)

fastify.get('/terminal', { websocket: true }, function (connection, req) {
  console.log("Constructor 1:", connection.constructor.name)
  if (req) console.log("Constructor 2:", req.constructor.name)
  process.exit(0)
})

fastify.listen({ port: 3000 }, () => {
  const WebSocket = require('ws');
  new WebSocket('ws://localhost:3000/terminal');
})
