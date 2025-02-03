import { Request, Response } from 'express';
import { IChat } from '../interfaces/interfaces';

import { ChatModel } from '../models/chat.model';

export class ChatController {

    // New chat
    static async newchat(req: Request, res: Response): Promise<void> {
        try {
            const data: Omit<IChat, 'id' | 'created_at'> = req.body;
            const dataInsert = await ChatModel.createChat(data);
            console.log('[ SERVER ] New chat has been created: ' + dataInsert)
            res.status(201).json({ status: 'success', data: dataInsert });
        } catch(error) {
            console.log('[ SERVER ] Error createing new chat at controller: ', error)
            throw error
        }
    }

    // Get chats
    static async getchats(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body
            const chatsData = await ChatModel.getChats(data);
            console.log(chatsData)
            res.status(201).json(chatsData);
        } catch(error) {
            console.log('[ SERVER ] Error getting chats at controller: ', error)
        }
    }
}