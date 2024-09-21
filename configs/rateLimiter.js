import rateLimit from 'express-rate-limit';
import { AppConfig } from './config.js';


const { rateLimitRequestPerDay } = AppConfig;

// Limit to 5 requests per minute from the same IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: rateLimitRequestPerDay, // Limit each IP to 5 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after a minute',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

export default limiter;
