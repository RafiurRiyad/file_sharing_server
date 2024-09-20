import * as dotenv from 'dotenv';
dotenv.config();

export const AppConfig = {
    environment: process.env.NODE_ENV,
    port: process.env.API_PORT,
    host: process.env.API_HOST,
    protocol: process.env.API_PROTOCOL,
    baseRoute: `${process.env.ROUTE_PREFIX}`,
  };