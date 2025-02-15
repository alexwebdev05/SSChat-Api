import WebSocket from 'ws';
import { UUID } from "crypto";
import { IRoom } from '../interfaces';

import { userModel } from '../models/user.model';

type RoomControllerResponse = {
    error: boolean;
    message: string;
};

// Map of active rooms
const activeRooms: Map<UUID, IRoom> = new Map();

export class userController {
    static checkToken = async (socket: WebSocket, otherClientID: UUID): Promise<RoomControllerResponse> => {
        try {

            if (!otherClientID) {
                socket.send(
                    JSON.stringify({ type: 'error', message: 'Other client ID is required.' })
                );
                return { error: true, message: 'Other client ID is required.' };
            }

            // Get data from database
            const response = await userModel.checkToken(otherClientID)

            // Send messages to client
            socket.send(JSON.stringify({ type: 'checked-token', response }));

            return { error: false, message: 'Token checked successfully' };
        } catch(error) {
            console.log('[ SERVER ] Failed to check token at controller: ' + error);
            return { error: true, message: 'Failed to check token.' };
        }
    }
}