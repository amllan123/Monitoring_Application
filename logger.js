const winston = require('winston');
const LokiTransport = require('winston-loki');

// Access the environment variable
const lokiUrl = process.env.LOKI_URL || 'https://loki.tecoalesce.com';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Use JSON format for structured logging
    ),
    transports: [
        new winston.transports.Console(),
        new LokiTransport({
            host: lokiUrl, // Use the environment variable
            labels: { job: 'express-app' }, // Optional labels for better organization in Loki
            json: true,
            format: winston.format.json(),
            replaceTimestamp: true, // Use this option if you want to replace the timestamp with Loki's timestamp
            level: 'info', // Adjust log level as needed
        })
    ]
});

module.exports = logger;
