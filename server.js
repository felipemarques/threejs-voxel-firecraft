// Minimal WebSocket relay for multiplayer position sync
// Run with: npm run server
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: PORT });

const clients = new Map(); // id -> ws

function broadcast(senderId, data) {
  const msg = JSON.stringify(data);
  for (const [id, ws] of clients.entries()) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(msg); } catch (e) {}
    }
  }
}

wss.on('connection', (ws) => {
  const id = randomUUID();
  clients.set(id, ws);
  ws.send(JSON.stringify({ type: 'welcome', id }));
  broadcast(id, { type: 'player-join', id });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === 'state' && data.pos) {
        broadcast(id, { type: 'state', id, pos: data.pos, nick: data.nick, color: data.color });
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    clients.delete(id);
    broadcast(id, { type: 'player-leave', id });
  });
});

console.log(`Multiplayer relay listening on ws://localhost:${PORT}`);
