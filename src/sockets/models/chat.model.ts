import { UUID } from "crypto";
import { dbConnect } from "../../conf/db";
import { create } from "domain";

export class chatModel {

    // Create chat
    static createChat = async (clientID: UUID, otherClientID: UUID) => {
        const client = await dbConnect();

        try {
            const response = await client.query(
                'INSERT INTO chats (user1, user2) VALUES ($1, $2) RETURNING *',
                [clientID, otherClientID]
            )

            // Handle errors
            if (response.rows.length === 0) {
                return { message: 'Failed to create chat' };
            }

            // Response
            return {
                user1: response.rows[0].user1,
                user2: response.rows[0].user2,
                token: response.rows[0].token,
                created_at: response.rows[0].created_at
            }

        } catch(error) {
            console.log('[ SERVER ] Failed to create chat at model: ' + error);
        }
    }

    // Get chats
    static getChats = async (clientID: UUID) => {
        const client = await dbConnect();

        try {
            const response = await client.query(
                'SELECT * FROM chats WHERE user1 = $1 OR user2 = $1',
                [clientID]
            );

            // Handle errors if no chats are found
            if (response.rows.length === 0) {
                return { message: 'No chats found' };
            }

            // Array of chats
            const chats = [];

            // Obtain all chats
            for (const chat of response.rows) {
                try {
                    // Find other user
                    const otherUserToken = chat.user1 === clientID ? chat.user2 : chat.user1;

                    // Find other user name
                    const usernameResponse = await client.query(
                        'SELECT username FROM users WHERE token = $1',
                        [otherUserToken]
                    );

                    // Add data to array
                    chats.push({
                        username: usernameResponse.rows[0].username,
                        userID: otherUserToken,
                        created_at: chat.created_at,
                        token: chat.token,
                    });

                } catch (error) {
                    console.log('Error getting username for chat:', error);
                }
            }

            // Return array
            return chats;

        } catch (error) {
            console.log('[ SERVER ] Failed to get chats at model: ' + error);
            return { message: 'Error getting chats' };
        }
    };


}