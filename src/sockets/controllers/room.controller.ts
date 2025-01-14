import WebSocket, { Server } from 'ws';
import { UUID } from "crypto";
import { IRoom, Client } from '../interfaces';
import { roomModel } from '../models/room.model';

// Message
type Message = {
    roomToken: UUID,
    message?: string
}


type RoomControllerResponse = {
    error: boolean;
    message: string;
};

// Map of active rooms
const activeRooms: Map<UUID, IRoom> = new Map();

export class roomController {

    // Join room
    static joinRoom = async (socket: WebSocket, message: Message, clientID: UUID): Promise<RoomControllerResponse> => {

        try {
            // Check the client id
            if (!clientID) {
                return { error: true, message: 'clientID is required.' };
            }

            // Check the room id
            const roomToken = message.roomToken;
            if (!roomToken) {
                return { error: true, message: 'roomToken is required.' };
            }

            // Check if the room exists
            let room = activeRooms.get(roomToken);
            if (!room) {
                // Create new room
                room = {id: roomToken, clients: [] as Client[]}
                activeRooms.set(roomToken, room);
            }

            // Add clients
            const isAlreadyInRoom = room.clients.find((client) => client.id === clientID);
            if (!isAlreadyInRoom) {
                room.clients.push({ id: clientID, socket });
            }

            // Notify clients
            room.clients.forEach(client => {
                if (client.id !== clientID) {
                    client.socket.send(JSON.stringify({ type: 'user-joined', clientID, roomToken }));
                }
            });

            console.log(`[ SERVER ] Client ${clientID} joined room ${roomToken}`);
            socket.send(JSON.stringify({ type: 'room-joined', roomToken }));

            return { error: false, message: 'Client joined successfully' };

        } catch (error) {
            return { error: true, message: 'Failed to join room.' };
        }
    
    }

    
    // Get messages
    static getMessages = async (socket: WebSocket, clientID: UUID, otherClientID: UUID): Promise<RoomControllerResponse> => {
        try {
            // Check client ID
            if (!clientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'You must connect first.' }));
                return { error: true, message: 'Client ID is required.' };
            }

            // Check other client ID
            if (!otherClientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'Other client ID is required.' }));
                return { error: true, message: 'Other client ID is required.' };
            }

            // Get messages from database
            const response = await roomModel.getMessages(clientID, otherClientID);

            // Send messages to client
            socket.send(JSON.stringify({ type: 'obtained-messages', response }));

            return { error: false, message: 'Messages retrieved successfully' };
        } catch(error) {
            console.log('[ SERVER ] Failed to get messages at controller: ' + error);
            return { error: true, message: 'Failed to get messages.' };
            
        }
    }

    // Send message
    static sendMessage = async (socket: WebSocket, clientID: UUID, message: Message, otherClientID: UUID): Promise<RoomControllerResponse> => {
        try {
            // Check client ID
            if (!clientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'You must connect first.' }));
                return { error: true, message: 'clientID is required.' };
            }

            // Check room ID and message
            const { roomToken, message: chatMessage } = message;
            if (!roomToken || !chatMessage) {
                socket.send(JSON.stringify({ type: 'error', message: 'Room ID and message are required.' }));
                return { error: true, message: 'roomToken is required.' };
            }

            // Check if room exists
            let room = activeRooms.get(roomToken);
            if (!room) {
                room = { id: roomToken, clients: [] as Client[] };
                socket.send(JSON.stringify({ type: 'error', message: 'Room does not exist.' }));
                return { error: true, message: 'Room does not exist.' };
            }

            // Check if the client is in the room
            const isInRoom = room.clients.find((client) => client.id === clientID);
            if (!isInRoom) {
                return { error: true, message: 'Client is not in the room.' };
            }

            // Send message to database
            await roomModel.sendMessage(clientID, roomToken, chatMessage, otherClientID)

            room.clients.forEach(async client => {
                // Send message to all clients in the room
                client.socket.send(JSON.stringify({ type: 'received-message', response: {
                    created_at: new Date(),
                    message: chatMessage,
                    receiver: otherClientID,
                    sender: clientID
                }
            }));
            })

            return { error: false, message: 'Message sent successfully' };

        } catch (error) {
            socket.send(JSON.stringify({ type: 'error', message: 'Failed to send message.' }));
            return { error: true, message: 'Failed to send message.' };
        }
        
    }

    // Leave room
    static leaveRoom = async (socket: WebSocket, clientID: UUID) => {
        activeRooms.forEach((room) => {
            room.clients = room.clients.filter((client) => client.id !== clientID);

            // Delete room if empty
            if ( room.clients.length === 0 ) {
                activeRooms.delete(room.id);
            } else {
                room.clients.forEach(client => {
                    client.socket.send(JSON.stringify({ type: 'user-left', clientID, roomToken: room.id }));
                });
            }


        })
    }
}