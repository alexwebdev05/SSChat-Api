
import { UUID } from "crypto";
import WebSocket from 'ws';
import { z } from "zod";
import { chatModel } from "../models/chat.model";

type RoomControllerResponse = {
    error: boolean;
    message: string;
};

// --- Filters ---
// Token
const tokenFilter = z
    .string()
    .uuid({
        message: 'Invalid token.'
    });

export class chatController {

    // Create chat
    static createChat = async (socket: WebSocket, clientID: UUID, otherClientID: string): Promise<RoomControllerResponse> => {
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

            // Check UUID
            tokenFilter.parse(clientID);

            // Create chat
            const response = await chatModel.createChat(clientID, otherClientID);

            // Send response to client
            socket.send(JSON.stringify({ type: 'created-chat', response }));

            return { error: false, message: 'Chat created successfully.' };

        } catch (error) {
            console.log('[ SERVER ] Failed to create chat at controller: ' + error);
            return { error: true, message: 'Failed to create chat.' };
        }
    }

    // Get chats
    static getChats = async (socket: WebSocket, clientID: UUID): Promise<RoomControllerResponse> => {
        try {

            // Check client ID
            if (!clientID) {
                socket.send(JSON.stringify({ type: 'error', message: 'You must connect first.' }));
                return { error: true, message: 'Client ID is required.' };
            }

            // Check UUID
            tokenFilter.parse(clientID);

            // Get messages from database
            const response = await chatModel.getChats(clientID);

            // Send messages to client
            socket.send(JSON.stringify({ type: 'obtained-chats', response }));

            return { error: false, message: 'Chats retrieved successfully' };

        } catch (error) {
            console.log('[ SERVER ] Failed to get chats at controller: ' + error);
            return { error: true, message: 'Failed to get chats.' };
        }
    }

}