import { Server } from 'ws';

// Controllers
import { MessageController } from './controllers/message.controller';

// Mapa de rooms (token -> WebSockets)
const rooms: { [token: string]: Set<any> } = {};

const router = (wss: Server) => {
  // En la conexión del cliente
  wss.on('connection', (ws, req) => {
    console.log('Client connected');

    // Extraer el token del query string en la URL
    const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
    const token = urlParams.get('token');
    if (!token) {
      ws.close(4000, 'Token no proporcionado');
      return;
    }

    // Verificar si la room ya existe
    if (!rooms[token]) {
      // Crear una nueva room si no existe
      rooms[token] = new Set();
      console.log(`Room creada para el token: ${token}`);
    } else {
      console.log(`Cliente uniéndose a room existente para el token: ${token}`);
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
        
        // Verificar si la room existe y reenviar el mensaje a todos los clientes de la misma room
        if (rooms[token]) {
          rooms[token].forEach(client => {
            // Asegurarse de que el cliente está listo para recibir el mensaje
            if (client !== ws && client.readyState === ws.OPEN) {
              client.send(JSON.stringify(response)); // Enviar el mensaje a todos los clientes
            }
          });
        }

        // Enviar la respuesta al cliente que lo envió también
        ws.send(JSON.stringify(response));
      }
    });

    // En la desconexión del cliente
    ws.on('close', () => {
      console.log(`Cliente con token ${token} desconectado`);
      if (rooms[token]) {
        rooms[token].delete(ws); // Eliminar el WebSocket de la room
        if (rooms[token].size === 0) {
          console.log(`Room para el token ${token} eliminada porque está vacía`);
          delete rooms[token]; // Eliminar la room si ya no tiene clientes
        }
      }
    });
  });
};

export default router;
