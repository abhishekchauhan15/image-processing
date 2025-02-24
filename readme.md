# Image Processing API

## Description

This is a Node.js application that processes images from a CSV file. The application accepts a CSV file containing product information and image URLs, processes the images by compressing them, uploads them to AWS S3, and stores the results in a MongoDB database. It also provides APIs to check the status of the processing.

## Features

- Upload CSV files containing product information and image URLs.
- Asynchronously process images by compressing them.
- Store processed image data and associated product information in MongoDB.
- Provide a unique request ID upon file submission.
- Check processing status using the request ID.
- Trigger a webhook after processing is complete.

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- AWS S3
- Bull (for job queue)
- Axios (for HTTP requests)
- Sharp (for image processing)
- Winston (for logging)
- Multer (for file uploads)
- CSV Parser

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/abhishekchauhan15/image-processing-api.git
   cd image-processing-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:

   ```plaintext
   MONGO_URI=your_mongodb_atlas_url
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   S3_BUCKET_NAME=your_s3_bucket_name
   WEBHOOK_URL=your_webhook_url (optional)
   PORT=3000
   ```

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. Use a tool like Postman or cURL to interact with the API.

## API Endpoints

Postman Collection : [<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/24775685-881ed9fd-6488-434d-8219-59d4b8e2dc2b?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D24775685-881ed9fd-6488-434d-8219-59d4b8e2dc2b%26entityType%3Dcollection%26workspaceId%3Db7cbef5e-a545-4d26-be99-f4460d5b45ea)

### 1. Upload API

- **Endpoint**: `POST /upload`
- **Description**: Accepts a CSV file and returns a unique request ID.
- **Request**:
  - Form-data:
    - `file`: CSV file containing the following columns:
      - Serial Number
      - Product Name
      - Input Image URLs (comma-separated)
- **Response**:
  - JSON:
    ```json
    {
      "requestId": "unique-request-id"
    }
    ```

### 2. Status API

- **Endpoint**: `GET /status/:requestId`
- **Description**: Checks the processing status using the request ID.
- **Request**:
  - URL parameter:
    - `requestId`: The unique request ID returned from the upload API.
- **Response**:
  - JSON:
    ```json
    {
      "status": "Processing/Completed",
      "products": [
        {
          "serialNumber": "SKU1",
          "productName": "Product Name",
          "inputImages": [
            {
              "url": "original-image-url",
              "s3Url": "s3-image-url"
            }
          ],
          "outputImages": [
            {
              "s3Url": "s3-output-image-url",
              "s3Id": "s3-id"
            }
          ]
        }
      ]
    }
    ```

## Logging

Logs are stored in `combined.log` and also output to the console. The logging format is simple, providing information about the processing steps and any errors encountered.

