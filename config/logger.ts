import winston from "winston";

// Logger configuration
const logConfiguration = {
   'transports': [
      new winston.transports.Console({
         level: 'info', // This will set the minimum level of log messages to display on console
         format: winston.format.combine(
            winston.format.timestamp({
               format: 'MMM-DD-YYYY HH:mm:ss'
            }),
            winston.format.printf(info => `${info.level}: ${info.timestamp}: ${info.message}`),
            winston.format.colorize({
               all: true
            })
         )
      }),
      new winston.transports.File({
         level: 'debug',
         filename: 'logs/library.log',
         format: winston.format.combine(
            winston.format.timestamp({
               format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.json()
         )
      })
   ]
};

// Create the logger
const $logger = winston.createLogger(logConfiguration);

export default $logger;
