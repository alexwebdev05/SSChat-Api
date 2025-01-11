import { Request, Response } from 'express';
import { IUser, IChat } from '../interfaces/interfaces';

import { UserModel } from '../models/user.model';

export class UserController {
    // Create user
    static async registeruser(req: Request, res: Response): Promise<void> {
        try {
            const userData: Omit<IUser, 'id'> = req.body; 
            const newUser = await UserModel.registeruser(userData);
            console.log('[ SERVER ] New client has been created: ' + newUser);
            res.status(201).json({ user: newUser });
        } catch(error) {
            console.log('[ SERVER ] Failed to create a new user at controller: ', error);
            res.status(500).json({ error: 'The username or email are in use.' });
        }
    }

    // Check user
    static async checkuser(req: Request, res: Response): Promise<void> {
        try {

            const data: Omit<IUser, 'id' | 'username' | 'photo'> = req.body;
            const dataChecker = await UserModel.getOne(data);
            console.log('[ SERVER ] New client has been checked: ' + dataChecker);
            res.status(201).json({ username: dataChecker.username, "photo": dataChecker.photo, "token": dataChecker.token });

        } catch(error) {
            console.log('[ SERVER ] Error checking the user at controller: ', error)
            res.status(500).json({ error: 'Error checking the user.' });
        }
    }

    // Check token
    static async checktoken(req: Request, res: Response): Promise<void> {
        try {
            const data: Omit<IUser, 'password' | 'username' | 'emai'> = req.body;
            const dataChecker = await UserModel.checktoken(data);
            console.log('[ SERVER ] New client has been checked: ' + dataChecker);
            res.status(201).json({ username: dataChecker.username, "photo": dataChecker.photo, "token": dataChecker.token });
        } catch(error) {
            console.log('[ SERVER ] Error checking the user at controller: ', error)
            res.status(500).json({ error: 'Error checking the token.' });
        }
    }

}