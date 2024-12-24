import { Server } from 'ws';
import router from './sockets/router';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.SOCKET as string, 10);

const wss = new Server({ port: PORT });

router(wss);

console.log(`WebSocket server is running on ws://localhost:${PORT}`);