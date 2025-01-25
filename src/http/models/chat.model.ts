import { IChat } from "../interfaces/interfaces";

import { dbConnect } from '../../conf/db';

export class ChatModel {

    // Create chat
    static async createChat(data: Omit<IChat, 'id' | 'created_at'>): Promise<IChat> {
        const { user1, user2} = data
        const { v4: uuidv4 } = require('uuid');
        const token = uuidv4();

        const created_at = new Date();
        const client = await dbConnect();

        try {
            const result = await client.query<IChat>(
                'INSERT INTO chats (user1, user2, created_at, token) VALUES ($1, $2, $3, $4) RETURNING *',
                [user1, user2, created_at, token]
            )

            if (result.rows.length === 0) {
                throw new Error('No rows returned from insert');
            }
            return result.rows[0];

        } catch(error) {
            console.log('[ SERVER ] Failed to create new chat at model: ' + error)
            throw error
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

        try {
            const username = data.user1; 
            const response = await client.query(
                'SELECT * FROM chats WHERE user1 = $1 OR user2 = $2',
                [username, username]
            );
            if (response.rows.length === 0) {
                return { message: 'No chats found' };
            }
            return response.rows;
        } catch(error) {
            console.log('[ SERVER ] Failed to get chats at model: ' + error);
            return { message: 'Error retrieving chats' };
        } finally {
            try {
                client.release();
            } catch (releaseError) {
                console.error('[ SERVER ] Error releasing DB connection: ', releaseError);
            }
        }
    }

}