import WebSocket, { Server } from 'ws';
import { UUID } from 'crypto';

// Controllers
import { roomController } from './controllers/room.controller';

import { Client } from './interfaces';

// Map of connected clients
const connectedClients: Map<UUID, Client> = new Map();

const router = (wss: Server) => {
    // On connect
    wss.on('connection', (socket: WebSocket) => {
        let clientID: UUID | null = null;

        // Receive client message
        socket.on('message', async (data: string) => {
            try {
                const message = JSON.parse(data);
                clientID = message.clientID;

                // Validate required fields for specific actions
                if (!clientID) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Client ID is required.' }));
                    return;
                }

                switch (message.type) {
                    // On connect
                    case 'connect': {
                        connectedClients.set(clientID, { id: clientID, socket });
                        socket.send(
                            JSON.stringify({ type: 'connected', message: `Welcome, client ${clientID}` })
                        );
                        break;
                    }


                    // Join room

                    // {
                    //     "type": "join-room",
                    //     "roomToken": "<UUID>",
                    //     "clientID": "<UUID>"
                    // }

                    case 'join-room': {
                        const response = await roomController.joinRoom(socket, message, clientID);

                        if (response.error) {
                            socket.send(JSON.stringify({ type: 'error', message: response.message }));
                        } else {
                            socket.send(
                                JSON.stringify({ type: 'joined-room', message: `Joined room successfully.` })
                            );
                        }
                        break;
                    }


                    // Get messages

                    // {
                    //     "type": "get-messages",
                    //     "clientID": "<UUID>",
                    //     "otherClientID": "UUID"
                    // }

                    case 'get-messages': {
                        const otherClientID = message.otherClientID;

                        if (!otherClientID) {
                            socket.send(
                                JSON.stringify({ type: 'error', message: 'Other client ID is required.' })
                            );
                            return;
                        }

                        const response = await roomController.getMessages(socket, clientID, otherClientID);

                        if (response.error) {
                            socket.send(JSON.stringify({ type: 'error', message: response.message }));
                        }
                        break;
                    }


                    // Send room message
                    // sender example

                    // {
                    //     "type": "send-room-message",
                    //     "clientID": "<UUID>",
                    //     "otherClientID": "<UUID>",
                    //     "roomToken": "<UUID>",
                    //     "message": "<Message>"    
                    // }
                    case 'send-room-message': {
                        const otherClientID = message.otherClientID;

                        if (!otherClientID) {
                            socket.send(
                                JSON.stringify({ type: 'error', message: 'Other client ID is required.' })
                            );
                            return;
                        }

                        try {
                            await roomController.sendMessage(socket, clientID, message, otherClientID);
                            socket.send(
                                JSON.stringify({ type: 'sent-message', message: 'Message sent successfully.' })
                            );
                        } catch (error) {
                            socket.send(
                                JSON.stringify({ type: 'error', message: 'Failed to send message.' })
                            );
                        }
                        break;
                    }

                    default: {
                        socket.send(JSON.stringify({ type: 'error', message: 'Invalid message type.' }));
                    }
                }
            } catch (error) {
                socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format.' }));
            }
        });

        // On disconnect
        socket.on('close', async () => {
            if (clientID) {
                connectedClients.delete(clientID);
                console.log(`[ SERVER ] Client disconnected: ${clientID}`);
                await roomController.leaveRoom(socket, clientID);
            }
        });
    });
};

export default router;
