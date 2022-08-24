/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
import 'dotenv/config';
import Hapi, { Server } from '@hapi/hapi';
import taskPlugin from './plugins/task';

const init = async (): Promise<Server> => {
  const server = new Hapi.Server({
    port: process.env.SERVER_PORT || 3000,
    host: process.env.SERVER_HOST || 'localhost',
  });

  // pino logger
  await server.register({
    // eslint-disable-next-line global-require
    plugin: require('hapi-pino'), // see issue https://github.com/pinojs/hapi-pino/issues/171
    options: {
      logEvents: (process.env.CI === 'true' || process.env.TEST === 'true') ? false : undefined,
      transport: (process.env.NODE_ENV !== 'production') ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
    },
  });

  await server.register([taskPlugin]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);

  return server;
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
