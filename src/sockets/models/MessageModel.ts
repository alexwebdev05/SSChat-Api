import { z } from "zod";
import { dbConnect } from "../../conf/db";
import { IMessage } from "../interfaces";

    // Token
const tokenFilter = z
    .string()
    .uuid({
        message: 'Invalid token.'
    });

export class MessageModel {

    // Get messages
    static async getMessages(data: IMessage) {
        const client = await dbConnect();

        // Filters
        try {
            tokenFilter.parse(data.sender);
            tokenFilter.parse(data.receiver);
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
            const sender = data.sender
            const receiver = data.receiver

            const response = await client.query(
                'SELECT * FROM messages WHERE (sender = $1 OR receiver = $1) AND (sender = $2 OR receiver = $2);',
                [sender, receiver]
            )

            // Add message identifier
            const responseGetMessages = {
                action: 'getmessages',
                response: response.rows
            }

            return responseGetMessages;


        } catch (error) {

            console.log('[ SERVER ] Failed to get messages at model: ' + error)

        } finally {
            try {
                client.release();
            } catch (releaseError) {
                console.error('[ SERVER ] Error releasing DB connection: ', releaseError);
            }
        }
    }

    // Send message
    static async sendMessage(data: IMessage) {
        const client = await dbConnect();

        // Filters
        try {
            tokenFilter.parse(data.sender);
            tokenFilter.parse(data.receiver);
            z.string().nonempty().parse(data.message);
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

            const sender = data.sender
            const receiver = data.receiver
            const message = data.message

            const response = await client.query(
                'INSERT INTO messages (sender, receiver, message) VALUES ($1, $2, $3) RETURNING *',
                [sender, receiver, message]
            )

            // Add message identifier
            const responseSendMessage = {
                action: 'sendmessage',
                response: response.rows
            }

            return responseSendMessage;

        } catch(error) {
            console.log('[ SERVER ] Failed to send message at model: ' + error)
        }

    }

}