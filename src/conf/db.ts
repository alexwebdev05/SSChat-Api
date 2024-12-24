import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export const dbConnect = async () => {

    const client = new Client({
        connectionString: process.env.DB_URL,
    })

    try {
        await client.connect();
        return client

    } catch(error) {
        console.log('Error connecting to database', error);
        process.exit(1);
    }
}