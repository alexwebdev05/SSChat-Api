import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './http/router';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.HTTP;

// Enable http requests from the client
app.use(cors());

// Change receibed data to json
app.use(bodyParser.json());

// Routes
app.use('/api', router);


// Starts the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

