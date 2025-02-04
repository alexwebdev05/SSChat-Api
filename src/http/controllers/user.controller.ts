import { Request, Response } from 'express';

import { UserModel } from '../models/user.model';

export class UserController {
    
    // Create user
    static async registeruser(req: Request, res: Response): Promise<void> {
        try {
            const userData = req.body;
            // Model
            const newUser = await UserModel.registeruser(userData);
            console.log('[ SERVER ] New client has been created: ' + newUser);
            // Response
            res.status(201).json({ user: newUser });

        // Handle errors
        } catch (error) {
            console.log('[ SERVER ] Failed to create a new user at controller: ', error);
            res.status(500).json( error );
        }
    }

    // Check user
    static async checkuser(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            // Model
            const dataChecker = await UserModel.getOne(data);
            console.log('[ SERVER ] New client has been checked: ' + dataChecker);
            // Response
            res.status(200).json(dataChecker);

        // Handle errors
        } catch(error) {
            console.log('[ SERVER ] Error checking the user at controller: ', error)
            res.status(500).json( error );
        }
    }

    // Check token
    static async checktoken(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            // Model
            const dataChecker = await UserModel.checktoken(data);
            console.log('[ SERVER ] New client has been checked: ' + dataChecker);
            // Response
            res.status(200).json({ message: dataChecker });

        // Handle errors
        } catch(error) {
            console.log('[ SERVER ] Error checking the user at controller: ', error)
            res.status(500).json( error );
        }
    }

}