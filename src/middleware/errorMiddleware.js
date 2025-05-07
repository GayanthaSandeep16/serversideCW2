const { HTTP_STATUS } = require('../utils/constants');

function errorHandler(err, req, res, next) {
  logger.error(`Error: ${err.message}, Stack: ${err.stack}`);
  
  const statusCode = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message
  });
}

module.exports = errorHandler;