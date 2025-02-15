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
                'SELECT * FROM chats WHERE user1 = $1 OR user2 = $2',
                [clientID, clientID]
            )

            // Handle errors
            if (response.rows.length === 0) {
                return { message: 'No chats found' };
            }

            // Response
            if (response.rows[0].user1 === clientID) {
                try {
                    const username = await client.query(
                        'SELECT * FROM users WHERE token=$1',
                        [response.rows[0].user2]
                    )
                    return {
                        user1: clientID,
                        user2: username.rows[0].username,
                        created_at: response.rows[0].created_at,
                        token: response.rows[0].token
                    }
                } catch(error) {
                    console.log('Error geting username.')
                }
            }
            try {
                const username = await client.query(
                    'SELECT * FROM users WHERE username=$1',
                    [response.rows[0].user2]
                )
                return {
                    user1: username.rows[0].username,
                    user2: clientID,
                    created_at: response.rows[0].created_at,
                    token: response.rows[0].token
                }
            } catch(error) {
                console.log('Error geting username.')
            }

        } catch(error) {
            console.log('[ SERVER ] Failed to get chats at model: ' + error);
        }
    }

}