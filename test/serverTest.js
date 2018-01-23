const app = require('./../app/app')('test');

const port = process.env.PORT || 3005;

const server = app.listen(port);

module.exports = server;



