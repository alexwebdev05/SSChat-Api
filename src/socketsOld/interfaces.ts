import WebSocket from 'ws';
import { UUID } from "crypto"

export interface IUser {
    id?: number,
    username: Text,
    email: Text,
    password: Text,
    photo?: Text,
    token: UUID
}

export interface IChat {
    id?: number,
    user1: Text,
    user2: Text,
    created_at?: EpochTimeStamp,
    token: UUID
}

export interface IMessage {
    id?: number,
    sender: Text,
    receiver: Text,
    message: Text,
    created_at?: EpochTimeStamp
}

// Client
export interface Client {
    id: UUID,
    socket: WebSocket
}

// Room
export interface IRoom {
    id: UUID,
    clients: Client[]
}