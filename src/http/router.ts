import express from 'express';

import { UserController } from './controllers/user.controller';
import { ChatController } from './controllers/chat.controller';

const router = express.Router();

// Title
router.get('/', (req, res) => {
    res.status(200).send('SSChat API');
});

// [ USER ROUTES ]

// create user
router.post('/users/registeruser', UserController.registeruser);

// Check user
router.post('/users/checkuser', UserController.checkuser)

// Check token
router.post('/users/checktoken', UserController.checktoken)

// [ CHAT ROUTES ]

// New chat
router.post('/chats/newchat', ChatController.newchat)

// Get chats
router.post('/chats/getchats', ChatController.getchats)

export default router;