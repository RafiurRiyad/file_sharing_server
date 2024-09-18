import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import {
  FileRouter,
} from './routes.js';
import { AppConfig } from './config.js';

/**
 * * initiate express and express community middleware
 */
const { baseRoute, environment } = AppConfig;

const app = express();

/**
 * * A basic health check route above all the routes for checking if the application is running
 */
app.get(`${baseRoute}/health`, (req, res) => {
  res.status(200).json({
    message: 'Basic Health Check.',
    environment: environment,
  });
});

/**
 * * Route injection to the app module
 */
app.use(`${baseRoute}/files`, FileRouter);

export const App = app;
