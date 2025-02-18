import WebSocket from 'ws';
import { UUID } from "crypto";
import { IRoom, Client } from '../interfaces';
import { messageModel } from '../models/messages.model';

import { activeRooms } from '../models/room.model';

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
            socket.send(JSON.stringify({ type: 'obtained-messages', userID: otherClientID, response }));

            return { error: false, message: 'Messages retrieved successfully' };
        } catch(error) {
            console.log('[ SERVER ] Failed to get messages at controller: ' + error);
            return { error: true, message: 'Failed to get messages.' };
        }
    }

    // Send message
    static sendMessage = async (socket: WebSocket, clientID: UUID, message: Message, otherClientID: UUID, id: UUID): Promise<RoomControllerResponse> => {
        try {
            console.log('step 1')
            // Validate ID
            if (!id) {
                socket.send(JSON.stringify({ type: 'error', message: 'Id is required.' }));
                return { error: true, message: 'Id is required.' };
            }

            // Validate otherClientID
            if (!otherClientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'Other client ID is required.' }));
                return { error: true, message: 'Other client ID is required.' };
            }

            // Validate clientID
            if (!clientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'You must connect first.' }));
                return { error: true, message: 'ClientID is required.' };
            }

            // Validate message structure
            if (!message || !message.roomToken || !message.message) {
                socket.send(JSON.stringify({ type: 'error', message: 'Room ID and message are required.' }));
                return { error: true, message: 'Room ID and message are required.' };
            }

            const { roomToken, message: chatMessage } = message;

            // Check if room exists
            let room = activeRooms.get(roomToken);
            if (!room) {
                socket.send(JSON.stringify({ type: 'error', message: 'Room does not exist.' }));
                return { error: true, message: 'Room does not exist.' };
            }

            // Check if the client is in the room
            const isInRoom = room.clients.find((client) => client.id === clientID);
            if (!isInRoom) {
                socket.send(JSON.stringify({ type: 'error', message: 'Client is not in the room.' }));
                return { error: true, message: 'Client is not in the room.' };
            }
            
            // Send message to database
            let response;
            try {
                console.log('step 2')
                response = await messageModel.sendMessage(clientID, roomToken, chatMessage, otherClientID, room, id);
                console.log('step 5')
            } catch (error) {
                console.error("Database error:", error);
                socket.send(JSON.stringify({ type: 'error', message: 'Failed to save message to database.' }));
                return { error: true, message: 'Failed to save message to database.' };
            }

            // Notify other clients in the room
            room.clients.forEach(client => {
                if (client.id !== clientID && client.socket.readyState === WebSocket.OPEN) {
                    client.socket.send(JSON.stringify({ type: 'received-message', response }));
                }
            });

            return { error: false, message: 'Message sent successfully' };

        } catch (error) {
            console.error("[SERVER] Unexpected error in sendMessage:", error);
            socket.send(JSON.stringify({ type: 'error', message: 'Failed to send message due to an unexpected error.' }));
            return { error: true, message: 'Failed to send message due to an unexpected error.' };
        }
    };
}