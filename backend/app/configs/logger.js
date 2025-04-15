import winston from 'winston';
const { combine, timestamp, label, printf, json } = winston.format;

export const logger = winston.createLogger({
  level: 'info',
  format: consoleFormat(),
  transports: [
    // - write to all logs with level `info` and below to `combined.log`
    // - write all logs error (and below) to `error.log`
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      colorize: false,
      handleExceptions: true,
      timestamp: true,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      colorize: false,
      handleExceptions: true,
      timestamp: true,
    }),
    new winston.transports.Console({
      timestamp: true,
      colorize: true,
    }),
  ],
});

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};

function consoleFormat() {
  return combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
    printf(({ timestamp, level, message }) => {
      return `${timestamp} :: ${level} :: ${message} `;
    }),
  );
}

// module.exports = logger;
