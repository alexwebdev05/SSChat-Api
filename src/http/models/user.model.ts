// Dependencies
import { z } from "zod";
import bcrypt from 'bcrypt';

// Interfaces
import { IStatus, IUser } from "../interfaces/interfaces";

// Database connection
import { dbConnect } from '../../conf/db';

// Filters

    // Username
const usernameFilter = z
    .string()
    .min(4, { message: "Username must be at least 5 characters long." })
    .max(20, { message: "Username must not exceed 25 characters." })
    .regex(/^[a-zA-Z0-9]+$/, {
        message: 'Invalid charset. Only letters and numbers are allowed.'
    });

    // Email
const emailFilter = z
    .string()
    .email({
        message: 'Invalid email, look for mistakes.'
    });

    // Password
const passwordFilter = z
    .string()
    .min(5, { message: "Password must be at least 5 characters long." })
    .max(25, { message: "Password must not exceed 25 characters." });

    // Token
const tokenFilter = z
    .string()
    .uuid({
        message: 'Invalid token.'
    });

export class UserModel {

    // Register user
    static async registeruser(userData: Omit<IUser, 'id'>): Promise<IUser | IStatus> {

        // Set data
        const { username, email, password } = userData;

        // Filters
        try {
            usernameFilter.parse(username);
            emailFilter.parse(email);
            passwordFilter.parse(password);
            console.log('1')
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
        console.log('2')

        // Hash password
        const saltRounds = 10;
        async function encryptPassword(password: string): Promise<string> {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return hashedPassword;
        }

        const hashedPassword = await encryptPassword(JSON.stringify(password));

        // Connect to the database
        const client = await dbConnect();
        try {
            // Insert data
            console.log('3')
            const result = await client.query<IUser>(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
                [username, email, hashedPassword]
            );
            console.log('4')
            // Manage response
            return result.rows[0];

        // Handle duplication and other errors
        } catch (error: any) {
            if (error.code === '23505') {
                throw {
                    status: 'error',
                    message: 'Duplicate entry: Username or email already exists.'
                };
            }
            throw {
                status: 'error',
                message: 'Error registering the user.'
            };

        // Close connection
        } finally {
            try {
                client.release();
            } catch (releaseError) {
                console.error('[ SERVER ] Error releasing DB connection: ', releaseError);
            }
        }
    }


    // Get one
    static async getOne(data: Omit<IUser, 'id'>): Promise<IUser | IStatus> {
        const { email, password } = data

        // Filters
        try {
            emailFilter.parse(email);
            passwordFilter.parse(password);

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

        // Check hashed password
        async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            return isMatch;
        }

        const checkedPassword = await comparePassword(JSON.stringify(password), JSON.stringify(password));

        // Connect to the database
        const client = await dbConnect();
        try {
            // Check user
            const result = await client.query<IUser>(
                'SELECT * FROM users WHERE email = $1 AND password = $2',
                [email, checkedPassword]
            )

            // Manage response
            return result.rows[0]

        // Handle errors
        } catch(error: any) {
            console.log('[ SERVER ] Failed to check user at model: ' + error)
            throw {
                status: 'error',
                message: error
            }

        // Close connection
        } finally {
            try {
                client.release();
            } catch (releaseError) {
                console.error('[ SERVER ] Error releasing DB connection: ', releaseError);
            }
        }
    }

    // Check token
    static async checktoken(data: Omit<IUser, 'id'>): Promise<IUser | IStatus> {
        const { token } = data

        // Filters
        try {
            tokenFilter.parse(token);

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

        // Connect to the database
        const client = await dbConnect();
        try {
            const result = await client.query<IUser>(
                'SELECT * FROM users WHERE token = $1',
                [token]
            )

            // Verifica si no se encuentra el token
            if (result.rows.length === 0) {
                throw {
                    status: 'error',
                    message: 'Token not found in database.'
                };
            }

            // Manage response
            return result.rows[0]

        } catch(error: any) {
            console.log('[ SERVER ] Failed to check token at model: ' + error)
            throw {
                status: 'error',
                message: error
            }
        } finally {
            try {
                client.release();
            } catch (releaseError) {
                console.error('[ SERVER ] Error releasing DB connection: ', releaseError);
            }
        }
    }   

}