import { Client } from 'pg';

import env from './env'

export const dbConnect = async () => {

    const client = new Client({
        connectionString: env.DB_URL,
    })

    try {
        await client.connect();
        return client

    } catch(error) {
        console.log('Error connecting to database', error);
        process.exit(1);
    }
}