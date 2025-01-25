import { UUID } from "crypto"

export interface IStatus {
    status: string,
    message: string
}

export interface IUser {
    id?: number,
    username: Text,
    email?: Text,
    password?: Text,
    token: UUID
    photo?: Text
}

export interface IChat {
    id?: number,
    user1: Text,
    user2: Text,
    created_at?: EpochTimeStamp
}

export interface IMessage {
    id?: number,
    sender: Text,
    receiver: Text,
    message: Text,
    created_at?: EpochTimeStamp
}