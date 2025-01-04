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
                const message = JSON.parse(data)
                clientID = message.clientID;
                
                // Message type manager
                switch (message.type) {
                    
                    // On connect
                    case 'connect': {
                        

                        // Verify client ID
                        if (!clientID) {
                            socket.send(JSON.stringify({ type: 'error', message: 'Client ID is required.' }));
                            return;
                        }
                        // Add client to connected clients
                        connectedClients.set(clientID, { id: clientID, socket });
                        socket.send(JSON.stringify({ type: 'connected', message: `Welcome, client ${clientID}` }));
                        break;
                    }

                    // Join room
                    case 'join-room': {
                        

                        // Verify clietn ID
                        if (!clientID) {
                            socket.send(JSON.stringify({ type: 'error', message: 'Client ID is required.' }));
                            return;
                        }

                        // Call room controller to join room
                        const response = await roomController.joinRoom(socket, message, clientID);

                        // Error manager
                        if (response.error) {
                            socket.send(JSON.stringify({ type: 'error', message: response.message }));
                        } else {
                            socket.send(JSON.stringify({ type: 'joined-room', message: `Joined room successfully.` }));
                        }
                        break;
                    }

                    // Send room message
                    case 'send-room-message': {
                        if (!clientID) {
                            socket.send(JSON.stringify({ type: 'error', message: 'Client ID is required.' }));
                            return;
                        }

                        try {
                            await roomController.sendMessage(socket, clientID, message);
                            break;

                        } catch (error) {
                            socket.send(JSON.stringify({ type: 'error', message: 'Failed to send message.' }));
                        }

                    }
                }
            } catch (error) {
                socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format.' }));
            }

        })

        // On disconnect
        socket.on('close', async () => {

            

            // Remove client from connected clients
            if (clientID) {

                // Remove client from connected clients
                connectedClients.delete(clientID)
                console.log(`[ SERVER ]Client disconnected: ${clientID}`);

                // Remove client from rooms
                const leave = await roomController.leaveRoom(socket, clientID);


            }
            
            

        })



    });
};

export default router;

// On receive a message
// socket.on('message', async (message) => {
//     const messageJson = JSON.parse(message.toString());

//     // Get messages
//     if ( messageJson.action == "getmessages" ) {
//         const response = await MessageController.getmessages(messageJson)
//         socket.send(JSON.stringify(response));
//     }
    
//     // Send messages
//     else if ( messageJson.action == "sendmessage" ) {
//         const response = await MessageController.sendmessage(messageJson)
//         socket.send(JSON.stringify(response));
//     }

// On Log out
// socket.on('close', () => {
//     console.log('Client disconnected');
// });

// });