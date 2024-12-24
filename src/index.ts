import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server as WebSocketServer } from 'ws';
import * as dotenv from 'dotenv';
import router from './http/router';
import socketRouter from './sockets/router';
import http from 'http';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.HTTP;

// Habilitar solicitudes HTTP desde el cliente
app.use(cors());

// Convertir los datos recibidos a JSON
app.use(bodyParser.json());

// Rutas HTTP
app.use('/api', router);

// Configurar WebSocket en el mismo puerto
const wss = new WebSocketServer({ server: httpServer });
socketRouter(wss);

// Iniciar el servidor HTTP y WebSocket
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
