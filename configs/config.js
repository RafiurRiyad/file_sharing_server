import * as dotenv from 'dotenv';
dotenv.config();

export const AppConfig = {
    environment: process.env.NODE_ENV,
    port: process.env.API_PORT,
    host: process.env.API_HOST,
    protocol: process.env.API_PROTOCOL,
    baseRoute: `${process.env.ROUTE_PREFIX}`,
    provider: process.env.PROVIDER,
    rateLimitRequestPerDay: `${process.env.RATE_LIMIT_REQUEST_PER_DAY}`,
  };