require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/uploadRoutes');
const Request = require('./models/requestModel');
const logger = require('./utils/logger');

// Connect to Database
connectDB();

const app = express();
app.use(express.json());

// Use Routes
app.use('/', uploadRoutes);

// Status API
app.get('/status/:requestId', async (req, res) => {
    try {
        const request = await Request.findOne({ requestId: req.params.requestId });
        if (!request) return res.status(404).send({ error: 'Request not found' });
        res.json({ status: request.status, products: request.products });
    } catch (error) {
        logger.error('Error in /status endpoint:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));