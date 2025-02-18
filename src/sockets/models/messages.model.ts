import { z } from "zod";
import { UUID } from "crypto";
import { dbConnect } from "../../conf/db";
import { IRoom } from "../interfaces";
import { v4 as uuidv4 } from 'uuid';

// Token
const tokenFilter = z
    .string()
    .uuid({
        message: 'Invalid token.'
    });

export class messageModel {

    static getMessages = async (clientID: UUID, otherClientID: UUID) => {
        const client = await dbConnect();

        // Filters
        try {
            tokenFilter.parse(clientID);
            tokenFilter.parse(otherClientID);

        // Handle errors
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw {
                    status: 'error',
                    message: `${error.errors.map(e => e.message).join(', ')}`
                }
            }
            throw error;
        }

        // Logic
        try {
            const response = await client.query(
                'SELECT * FROM messages WHERE (sender = $1 OR receiver = $1) AND (sender = $2 OR receiver = $2) ORDER BY created_at;',
                [clientID, otherClientID]
            )
            console.log(response.rows)
            return response.rows;
            
        } catch(error) {
            console.log('[ SERVER ] Failed to get messages at model: ' + error);
        }
    }

    static sendMessage = async (clientID: UUID, roomToken: UUID, chatMessage: string, otherClientID: UUID, room: IRoom, id: UUID) => {

        const client = await dbConnect();

        console.log('step 3')

        // Filters
        try {
            tokenFilter.parse(clientID);
            tokenFilter.parse(otherClientID);
            tokenFilter.parse(roomToken);
            z.string().nonempty().parse(chatMessage);
        // Handle errors
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw {
                    status: 'error',
                    message: `${error.errors.map(e => e.message).join(', ')}`
                }
            }
            throw error;
        }
        
        try {
            // Insert message to database
            await client.query(
                'INSERT INTO messages (id, sender, receiver, message) VALUES ($1, $2, $3, $4)',
                [id, clientID, otherClientID, chatMessage]
            );
            console.log('step 4')
            return {
                "id": id,
                "created_at": new Date(),
                "message": chatMessage,
                "receiver": otherClientID,
                "sender": clientID
            }

        } catch (error) {
            console.log('[ SERVER ] Failed to send room message at model: ' + error);
        }
    }
}