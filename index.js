require('./tracing')
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 4000;
const dotenv = require('dotenv');
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const orderRoute = require('./routes/order');
const stripeRoute = require('./routes/stripe');
const cors = require("cors");
const logger = require('./logger'); // Import the logger

dotenv.config();
app.use(express.json());
app.use(cors());

// Middleware to log request details for specific routes
const logRequestDetails = (req, res, next) => {
    res.on('finish', () => { // 'finish' event is emitted when the response has been sent
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;

        const logLevel = statusCode >= 400 ? 'error' : 'info';

        logger.log({
            level: logLevel,
            message: `${method} ${originalUrl} - ${ip} - Status: ${statusCode}`,
            timestamp: new Date().toISOString(),
            ip: ip,
            status: statusCode
        });
    });
    next();
};

// Apply the logging middleware only to specific routes
app.use('/api/users', logRequestDetails, userRoute);
app.use('/api/auth', logRequestDetails, authRoute);
app.use('/api/products', logRequestDetails, productRoute);
app.use('/api/carts', logRequestDetails, cartRoute);
app.use('/api/orders', logRequestDetails, orderRoute);
app.use('/api/checkout', logRequestDetails, stripeRoute);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => { console.log(err); });

app.get('/', (req, res) => {
    res.send("Hello from Server 🥳 ");
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });

// Monitoring Part
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
});
