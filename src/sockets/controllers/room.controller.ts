import WebSocket from 'ws';
import { UUID } from "crypto";
import { IRoom, Client } from '../interfaces';
import { roomModel } from '../models/room.model';

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

            const response = await roomModel.joinRoom(socket, clientID, roomToken);

            // Send messages to client
            socket.send(JSON.stringify({type: 'joined-room', response}));

            return { error: false, message: 'Messages retrieved successfully' };

        } catch (error) {
            return { error: true, message: 'Failed to join room.' };
        }
    
    }

    // Leave room
    static leaveRoom = async (socket: WebSocket, message: Message) => {
        try {

            // Check client ID
            if (!message.clientID) {
                return { error: true, message: 'clientID is required.' };
            }

            // Check room
            if (!message.roomToken) {
                return { error: true, message: 'roomToken is required.' };
            }

            const clientID = message.clientID;
            const roomToken = message.roomToken;

            // Check if the room exists
            const room = activeRooms.get(message.roomToken);
            if (!room) {
                return { error: true, message: 'Room does not exist.' };
            }

            const response = await roomModel.leaveRoom(socket, clientID, roomToken, room);
            
            // Send messages to client
            socket.send(JSON.stringify({ type: 'left-room', response }));

            return { error: false, message: 'Client left the room successfully' };

        } catch(error) {
            console.log('[ SERVER ] Failed to leave room at controller: ' + error);
            return { error: true, message: 'Failed to leave room.' };
        }
    }
}