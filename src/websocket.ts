import { Server } from 'ws';
import env from './conf/env';
import router from './sockets/router';

const PORT = env.SOCKET;

const wss = new Server({ port: PORT });

router(wss);

console.log(`WebSocket server is running on ws://localhost:${PORT}`);