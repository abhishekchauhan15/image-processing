const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    requestId: String,
    status: String,
    products: [{
        serialNumber: String,
        productName: String,
        inputImages: [{ url: String, s3Url: String }],
        outputImages: [{ s3Url: String, s3Id: String }]
    }],
    outputCsv: String
});

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;