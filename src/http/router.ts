import express from 'express';

import { UserController } from './controllers/user.controller';
import { ChatController } from './controllers/chat.controller';

const router = express.Router();

// [ USER ROUTES ]

// create user
router.post('/users/registeruser', UserController.registeruser);

// Check user
router.post('/users/checkuser', UserController.checkuser)

// [ CHAT ROUTES ]

// New chat
router.post('/chats/newchat', ChatController.newchat)

// Get chats
router.post('/chats/getchats', ChatController.getchats)

export default router;