require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');


// Initialize Express
const app = express();
app.use(express.json());


app.get('/health', async (req, res) => {
    try {
        res.json({ message:"Server is running!!" });
    } catch (error) {
        logger.error('Error in /health endpoint:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});



// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
