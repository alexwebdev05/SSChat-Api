import WebSocket from 'ws';
import { UUID } from "crypto";
import { IRoom, Client } from '../interfaces';
import { messageModel } from '../models/messages.model';

// Message
type Message = {
    roomToken: UUID,
    clientID: UUID,
    message?: string
}


type RoomControllerResponse = {
    error: boolean;
    message: string;
};

// Map of active rooms
const activeRooms: Map<UUID, IRoom> = new Map();

export class messageController {
    
    // Get messages
    static getMessages = async (socket: WebSocket, clientID: UUID, otherClientID: UUID): Promise<RoomControllerResponse> => {
        try {

            // Check other client ID
            if (!otherClientID) {
                socket.send(
                    JSON.stringify({ type: 'error', message: 'Other client ID is required.' })
                );
                return { error: true, message: 'Other client ID is required.' };
            }

            // Check client ID
            if (!clientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'You must connect first.' }));
                return { error: true, message: 'Client ID is required.' };
            }

            // Get messages from database
            const response = await messageModel.getMessages(clientID, otherClientID);

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

            if (!otherClientID) {
                socket.send(
                    JSON.stringify({ type: 'error', message: 'Other client ID is required.' })
                );
                return { error: true, message: 'Other client ID is required.' };
            }

            // Check client ID
            if (!clientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'You must connect first.' }));
                return { error: true, message: 'ClientID is required.' };
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
            await messageModel.sendMessage(clientID, roomToken, chatMessage, otherClientID, room)

            return { error: false, message: 'Message sent successfully' };

        } catch (error) {
            socket.send(JSON.stringify({ type: 'error', message: 'Failed to send message.' }));
            return { error: true, message: 'Failed to send message.' };
        }
        
    }
}