import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import errorMiddleware from './middlewares/error-middleware.js';

import mongoose from 'mongoose';

import router from './router/index.js';

import { MINUTE } from './utils/constants.js';

const PORT = process.env.PORT || 5000;
const app = express();

const limiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter); 
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        app.listen(PORT, () => console.log(`Server on ${PORT}`));
    } catch (e) {
        console.error(e);
    }
}
start();
