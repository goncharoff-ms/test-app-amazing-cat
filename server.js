const cluster = require('express-cluster');

const logger = require('./app/logger');

const app = require('./app/app');

cluster(() => {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    logger.info(`Express server listening on port ${port}`);
  });

  const gracefulShutdown = () => {
    logger.error('Received kill signal, shutting down gracefully.');
    server.close(() => {
      logger.error('Closed out remaining connections.');
      process.exit();
    });

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit();
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return server;
}, { verbose: true });

