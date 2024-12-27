import { Server } from 'ws';

// Controllers
import { MessageController } from './controllers/message.controller';

// Mapa de rooms (token -> WebSockets)
const rooms: { [token: string]: Set<any> } = {};

const router = (wss: Server) => {
  // En la conexión del cliente
  wss.on('connection', (ws) => {
    console.log('Client connected');

    // Extraer el token del query string en la URL
    const urlParams = new URLSearchParams(ws.upgradeReq.url?.split('?')[1] || '');
    const token = urlParams.get('token');
    if (!token) {
      ws.close(4000, 'Token no proporcionado');
      return;
    }

    // Si no existe la room para este token, crearla
    if (!rooms[token]) {
      rooms[token] = new Set();
    }

    // Agregar el cliente a la room
    rooms[token].add(ws);
    console.log(`Cliente con token ${token} agregado a la room`);

    // Manejo de mensajes del cliente
    ws.on('message', async (message) => {
      const messageJson = JSON.parse(message.toString());

      // Obtener mensajes
      if (messageJson.action === 'getmessages') {
        const response = await MessageController.getmessages(messageJson);
        ws.send(JSON.stringify(response));
      }
      
      // Enviar mensajes
      else if (messageJson.action === 'sendmessage') {
        const response = await MessageController.sendmessage(messageJson);
        
        // Enviar el mensaje a todos los clientes de la misma room
        if (rooms[token]) {
          rooms[token].forEach(client => {
            if (client !== ws && client.readyState === ws.OPEN) {
              client.send(JSON.stringify(response));
            }
          });
        }

        // Enviar la respuesta al cliente que lo envió
        ws.send(JSON.stringify(response));
      }
    });

    // En la desconexión del cliente
    ws.on('close', () => {
      console.log(`Cliente con token ${token} desconectado`);
      if (rooms[token]) {
        rooms[token].delete(ws); // Eliminar el WebSocket de la room
        if (rooms[token].size === 0) {
          delete rooms[token]; // Eliminar la room si ya no tiene clientes
        }
      }
    });
  });
};

export default router;
