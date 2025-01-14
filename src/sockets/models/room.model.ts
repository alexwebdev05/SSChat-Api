import { UUID } from "crypto";
import { dbConnect } from "../../conf/db";

interface Users {
    user1: string;
    user2: string;
}

interface User {
    username: string;
    token: UUID;
}

export class roomModel {

    static getMessages = async (clientID: UUID, otherClientID: UUID) => {
        const client = await dbConnect();

        try {
            const response = await client.query(
                'SELECT * FROM messages WHERE (sender = $1 OR receiver = $1) AND (sender = $2 OR receiver = $2);',
                [clientID, otherClientID]
            )

            return response.rows;
        } catch(error) {
            console.log('[ SERVER ] Failed to get messages at model: ' + error);
        }
    }

    static sendMessage = async (clientID: UUID, roomToken: UUID, chatMessage: string, otherClientID: UUID) => {
        const client = await dbConnect();
        
        try {
            // Insert message to database
            await client.query(
                'INSERT INTO messages (sender, receiver, message) VALUES ($1, $2, $3)',
                [clientID, otherClientID, chatMessage]
            );

            console.log(`[ SERVER ] Message sent from ${clientID} to ${otherClientID}: ${chatMessage}`);

        } catch (error) {
            console.log('[ SERVER ] Failed to send room message at model: ' + error);
        }
    }
}