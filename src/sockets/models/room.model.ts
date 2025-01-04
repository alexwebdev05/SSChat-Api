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
    static sendMessage = async (clientID: UUID, roomToken: UUID, chatMessage: string) => {
        const client = await dbConnect();
        
        try {
            // Get sender name
            const senderResult = await client.query(
                'SELECT * FROM users WHERE token = $1',
                [clientID]
            );
            if (senderResult.rows.length === 0) {
                throw new Error('Sender not found');
            }
            const sender: User = senderResult.rows[0];

            // Get users name
            const chatUsersResult = await client.query(
                'SELECT * FROM chats WHERE token = $1',
                [roomToken]
            );
            if (chatUsersResult.rows.length === 0) {
                throw new Error('Chat users not found');
            }
            const chatUsers: Users = chatUsersResult.rows[0];

            // Set receiver name
            let receiver: string;
            if (chatUsers.user1 === sender.token) {
                receiver = chatUsers.user2;
            } else {
                receiver = chatUsers.user1;
            }

            // Insert message to database
            await client.query(
                'INSERT INTO messages (sender, receiver, message) VALUES ($1, $2, $3)',
                [sender.token, receiver, chatMessage]
            );

            console.log(`[ SERVER ] Message sent from ${sender.token} to ${receiver}: ${chatMessage}`);

        } catch (error) {
            console.log('[ SERVER ] Failed to send room message at model: ' + error);
        }
    }
}