import config from '../config/index.js';

const sanitizeProductionMessage = (message) => {
  if (
    typeof message === 'string' &&
    (message.includes('unable to authenticate data') ||
      message.includes('Unsupported state'))
  ) {
    return 'Authentication service error. Please contact the administrator.';
  }

  return message;
};

const mapPrismaError = (err) => {
  if (err.code === 'P2025') {
    return { statusCode: 404, message: 'Record not found' };
  }

  if (err.code === 'P2002') {
    return { statusCode: 409, message: 'Duplicate record' };
  }

  if (err.name === 'PrismaClientValidationError') {
    return { statusCode: 400, message: 'Invalid request data' };
  }

  return null;
};

const errorHandler = (err, req, res, _next) => {
  const prismaError = mapPrismaError(err);
  const statusCode = prismaError?.statusCode || err.statusCode || 500;
  const rawMessage =
    prismaError?.message || err.message || 'Internal Server Error';
  const message =
    config.env === 'production'
      ? sanitizeProductionMessage(rawMessage)
      : rawMessage;

  if (config.env === 'development') {
    console.error(err);
  } else if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}] ${rawMessage}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
