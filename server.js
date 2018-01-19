const cluster = require('express-cluster');


cluster((worker) => {

  const port = process.env.PORT || 3000;
  const app = require('./app/app');

  const gracefulShutdown = () => {
    console.log("Received kill signal, shutting down gracefully.");
    server.close(function() {
      console.log("Closed out remaining connections.");
      process.exit()
    });

    setTimeout(function() {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit()
    }, 10000);
  };

  process.on ('SIGTERM', gracefulShutdown);
  process.on ('SIGINT', gracefulShutdown);

  const server = app.listen(port, function() {
    console.log('Express server listening on port ' + port);
  });


  return server;
}, {verbose : true, count: 1});



