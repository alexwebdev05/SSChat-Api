import { z } from "zod";
import { UUID } from "crypto";
import { dbConnect } from "../../conf/db";

// Token
const tokenFilter = z
    .string()
    .uuid({
        message: 'Invalid token.'
    });

export class userModel {

    static checkToken = async (otherClientID: UUID) => {
        const client = await dbConnect();

        // Filters
        try {
            tokenFilter.parse(otherClientID)

        // Handle errors
        } catch(error) {
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
            const response = await client.query (
                'SELECT * FROM users WHERE token = $1',
                [otherClientID]
            )
            return {
                username: response.rows[0].username,
                token: otherClientID
            }
        } catch(error) {
            console.log('[ SERVER ] Failed to check token at model: ' + error);
        }

    }

}