import WebSocket from 'ws';
import { UUID } from "crypto";
import { IRoom, Client } from '../interfaces';

// Map of active rooms
export const activeRooms: Map<UUID, IRoom> = new Map();

export class roomModel {
    static joinRoom = async (socket: WebSocket, clientID: UUID, roomToken: UUID) => {
    
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

        return {message: 'Joined room successful.', roomToken};
    }

    static leaveRoom = async (socket: WebSocket, clientID: UUID, roomToken: UUID, room: IRoom) => {

    // Remove client from the room
    room.clients = room.clients.filter(client => client.id !== clientID);
    if (room.clients.length === 0) {
        activeRooms.delete(roomToken);
    }

    console.log(`[ SERVER ] Client ${clientID} left room ${roomToken}`);

    return { message: 'Left room successful.', roomToken };

    }
}