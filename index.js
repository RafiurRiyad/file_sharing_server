import { App } from './app.js';
import { AppConfig } from './config.js';

const { port, host, environment } = AppConfig;

/**
 * * create express server with port and host imported form app.config
 */
export const Server = App.listen(port, host, () => {
    console.log('Express server is running on --→');
    console.table({
      host: host,
      port: port,
      environment: environment,
    });
  });