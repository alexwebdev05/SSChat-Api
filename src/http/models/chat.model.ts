import { IChat } from "../interfaces/interfaces";

import { dbConnect } from '../../conf/db';

export class ChatModel {

    // Create chat
    static async createChat(data: Omit<IChat, 'id' | 'created_at'>): Promise<IChat> {
        const { user1, user2} = data
        const { v4: uuidv4 } = require('uuid');
        const token = uuidv4();

        // Set dates
        const created_at = new Date();
        const client = await dbConnect();

        // Insert chat
        try {
            // get user2 token
            const user2Token = await client.query(
                'SELECT token FROM users WHERE username = $1',
                [user2]
            )

            // Insert chat query
            const result = await client.query<IChat>(
                'INSERT INTO chats (user1, user2, created_at, token) VALUES ($1, $2, $3, $4) RETURNING *',
                [user1, user2Token, created_at, token]
            )

            // Handle errors
            if (result.rows.length === 0) {
                throw new Error('No rows returned from insert');
            }

            // Return result
            return result.rows[0];

        // Handle errors
        } catch(error) {
            console.log('[ SERVER ] Failed to create new chat at model: ' + error)
            throw error

        // Release client
        } finally {
            try {
                client.release();
            } catch (releaseError) {
                console.error('[ SERVER ] Error releasing DB connection: ', releaseError);
            }
        }
    }

    // Get chats
    static async getChats(data: Omit<IChat, 'user2'> & {user: string}) {
        const client = await dbConnect();

        // Get chats
        try {

            // Set username
            const username = data.user1;

            // Get chats query
            const response = await client.query(
                'SELECT * FROM chats WHERE user1 = $1 OR user2 = $2',
                [username, username]
            );

            // Handle errors
            if (response.rows.length === 0) {
                return { message: 'No chats found' };
            }

            // Return result
            return response.rows;
        
        // Handle errors
        } catch(error) {
            console.log('[ SERVER ] Failed to get chats at model: ' + error);
            return { message: 'Error retrieving chats' };

        // Release client
        } finally {
            try {
                client.release();
            } catch (releaseError) {
                console.error('[ SERVER ] Error releasing DB connection: ', releaseError);
            }
        }
    }

}