import Fastify from 'fastify'
import websocket from '@fastify/websocket'

const fastify = Fastify()
fastify.register(websocket)

fastify.get('/terminal', { websocket: true }, (connection, req) => {
  console.log(Object.keys(connection));
  process.exit(0)
})

fastify.listen({ port: 3000 }, () => {
  // Use a proper WS client to trigger the upgrade
  const WebSocket = require('ws');
  new WebSocket('ws://localhost:3000/terminal');
})
