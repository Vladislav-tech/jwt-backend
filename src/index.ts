import dotenv from 'dotenv';
// import util from 'util';
// // global error handlers to surface module-load errors with full inspection
// process.on('uncaughtException', (err: any) => {
//   console.error('Uncaught Exception:', util.inspect(err, { depth: null, colors: false }));
//   if (err && err.stack) console.error(err.stack);
//   process.exit(1);
// });
// process.on('unhandledRejection', (reason: any) => {
//   console.error('Unhandled Rejection:', util.inspect(reason, { depth: null, colors: false }));
//   if (reason && (reason.stack || reason.error && reason.error.stack)) console.error(reason.stack || reason.error.stack);
// });

dotenv.config({ path: './.env' });

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import errorMiddleware from '@/middlewares/error-middleware';

import mongoose from 'mongoose';

import router from '@/router/index';

import { MINUTE } from '@/utils/constants';

const PORT = process.env.PORT || 5000;
const app = express();

const limiter = rateLimit({
  windowMs: 10 * MINUTE,
  max: 125,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL || '');
    app.listen(PORT, () => console.log(`Server on ${PORT}`));
  } catch (e) {
    console.error(e);
  }
};
start();
