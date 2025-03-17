import express from 'express';

import { UserController } from './controllers/user.controller';

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

export default router;