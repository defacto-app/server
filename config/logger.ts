/*
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
*/
import winston from "winston";

// Define your custom format with colors and timestamp
const myFormat = winston.format.printf(
	({ level, message, label, timestamp }) => {
		return `${timestamp} [${label}] ${level}: ${message}`;
	},
);

const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.colorize(), // This will add color to your console output
		winston.format.timestamp(), // Adds a timestamp to each log message
		// Adds a label, which you set in your defaultMeta
		myFormat, // Use the custom format defined above
	),
	transports: [
		new winston.transports.File({ filename: "error.log", level: "error" }),
		// new winston.transports.File({ filename: "combined.log" }),
	],
});

if (process.env.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.simple(),
		}),
	);
}

export default logger;
