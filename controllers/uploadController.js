const fs = require('fs');
const csvParser = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const Request = require('../models/requestModel');
const logger = require('../utils/logger');
const imageQueue = require('../workers/imageWorker');

async function uploadFile(req, res) {
    if (!req.files || req.files.length === 0) return res.status(400).send({ error: 'CSV files are required' });
    
    const requestId = uuidv4();
    const products = [];

    // Process each uploaded file
    for (const file of req.files) {
        fs.createReadStream(file.path)
            .pipe(csvParser())
            .on('data', (row) => {
                if (row['Serial Number'] && row['Product Name'] && row['Input Image Urls']) {
                    const inputImages = row['Input Image Urls'].split(',').map(url => ({ url: url.trim(), s3Url: null }));
                    products.push({
                        serialNumber: row['Serial Number'].trim(),
                        productName: row['Product Name'].trim(),
                        inputImages: inputImages
                    });
                } else {
                    logger.warn('Invalid row format:', row);
                }
            })
            .on('end', async () => {
                await Request.create({ requestId, status: 'Processing', products });
                products.forEach(product => imageQueue.add({ requestId, product }));
            });
    }

    // Respond with the requestId after processing all files
    res.json({ requestId });
}

module.exports = { uploadFile };