const fs = require('fs');
const csvParser = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const Request = require('../models/requestModel');
const logger = require('../utils/logger');
const imageQueue = require('../workers/imageWorker');

async function uploadFile(req, res) {
    if (!req.file) return res.status(400).send({ error: 'CSV file is required' });
    
    const requestId = uuidv4();
    const products = [];

    fs.createReadStream(req.file.path)
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
            res.json({ requestId });
        });
}

module.exports = { uploadFile };