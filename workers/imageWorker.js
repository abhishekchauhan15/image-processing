const Bull = require('bull');
const axios = require('axios');
const sharp = require('sharp');
const { uploadToS3 } = require('../services/s3Service');
const Request = require('../models/requestModel');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const imageQueue = new Bull('image-processing', {
    limiter: {
        max: 5, // Max 5 jobs processed at a time
        duration: 1000
    }
});

imageQueue.process(5, async (job) => {
    const { requestId, product } = job.data;
    const outputImages = [];
    logger.info(`Processing job for requestId: ${requestId}, product: ${product.productName}`);

    let allImagesProcessed = true; // Flag to track if all images were processed successfully

    for (let i = 0; i < product.inputImages.length; i++) {
        const inputImage = product.inputImages[i];
        logger.info(`Fetching image from URL: ${inputImage.url}`);
        let attempts = 0;
        let success = false;

        while (attempts < 3 && !success) {
            try {
                const response = await axios({ url: inputImage.url, responseType: 'arraybuffer', timeout: 10000 });
                logger.info(`Fetched image successfully from URL: ${inputImage.url}`);
                
                const buffer = await sharp(response.data).jpeg({ quality: 50 }).toBuffer();
                logger.info(`Processed image for URL: ${inputImage.url}`);

                const filename = `${uuidv4()}.jpeg`;
                const { s3Url, s3Id } = await uploadToS3(buffer, filename);
                logger.info(`Uploaded image to S3: ${s3Url}`);

                product.inputImages[i].s3Url = s3Url;
                outputImages.push({ s3Url, s3Id });
                success = true; // Mark as successful
            } catch (error) {
                attempts++;
                logger.error(`Error processing image from URL: ${inputImage.url}. Attempt ${attempts}: ${error.message}`);
                if (attempts === 3) {
                    outputImages.push(null); // Mark as failed after 3 attempts
                    allImagesProcessed = false; // Set flag to false if any image fails
                }
            }
        }
    }

    logger.info(`Updating database for requestId: ${requestId}, product: ${product.productName}`);
    await Request.findOneAndUpdate(
        { requestId, 'products.productName': product.productName },
        { $set: { 'products.$.inputImages': product.inputImages, 'products.$.outputImages': outputImages } }
    );

    const updatedRequest = await Request.findOne({ requestId });
    if (allImagesProcessed) {
        logger.info(`All images processed for requestId: ${requestId}. Status updated to 'Completed'.`);
        await Request.updateOne({ requestId }, { $set: { status: 'Completed' } });
        
        // Trigger webhook after processing is complete
        try {
            await axios.post(process.env.WEBHOOK_URL, { requestId, status: 'Completed', products: updatedRequest.products });
            logger.info(`Webhook triggered for requestId: ${requestId}`);
        } catch (error) {
            logger.error('Error triggering webhook.');
        }
    } else {
        logger.info(`Not all images processed for requestId: ${requestId}. Status updated to 'Failed'.`);
        await Request.updateOne({ requestId }, { $set: { status: 'Failed' } });
    }
});

module.exports = imageQueue;