const { logEvents } = require("./logger");

const errorHandler = (err, request, response, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${request.method}\t${request.url}\t${request.headers.origin}`,
    "errLog.log"
  );
  console.log(err.stack);

  const status = response.statusCode ? response.statusCode : 500; // server error

  response.status(status);
  response.json({ message: err.message, isError: true });
};

module.exports = errorHandler;
