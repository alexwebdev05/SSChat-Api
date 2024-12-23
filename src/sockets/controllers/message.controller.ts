import { MessageModel } from "../models/MessageModel"

import { IMessage } from "../interfaces"

export class MessageController {

    // Get messages
    static async getmessages(data: IMessage) {

        try {
            const messageData = await MessageModel.getMessages(data)
            return(messageData)
        } catch(error) {
            console.log('[ SERVER ] Failed to get messages at controller: ', error)
        }
    }

    // Send message
    static async sendmessage(data: IMessage) {

        try {
            const messageData = await MessageModel.sendMessage(data)
            return(messageData)
        } catch(error) {
            console.log('[ SERVER ] Failed to send message at controller: ', error)
        }
    }
}