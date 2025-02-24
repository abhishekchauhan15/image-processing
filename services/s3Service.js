const AWS = require('aws-sdk');
const logger = require('../utils/logger');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadToS3(buffer, filename) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `processed-images/${filename}`,
        Body: buffer,
        ContentType: 'image/jpeg',
    };
    
    let attempts = 0;
    while (attempts < 3) {
        try {
            const result = await s3.upload(params).promise();
            return { s3Url: result.Location, s3Id: result.Key };
        } catch (error) {
            attempts++;
            logger.error(`S3 upload failed (Attempt ${attempts}):`, error.message);
            if (attempts === 3) throw error; // Rethrow after 3 attempts
        }
    }
}

module.exports = { uploadToS3 };