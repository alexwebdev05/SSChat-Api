import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a new pool
const pool = new Pool({
    connectionString: process.env.DB_URL,
});

// Export pool
export const dbConnect = async () => {
    // Connect to the database
    let client;
    try {
        client = await pool.connect();
        return client;

    // Handle connection error
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    } finally {
        // Ensure client is defined before attempting to release
        if (client) {
            client.release();
        }
    }
};

