const AWS = require('aws-sdk')
const uuid = require('uuid')
const keys = require('../config/keys')
const requireLogin = require('../middlewares/requireLogin')

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
  },
  region: 'us-east-2',
})

module.exports = (app) => {
    app.get('/api/upload', requireLogin, async (req, res) => {
      const key = `${req.user.id}/${uuid()}.jpeg`;
  
      // Get a pre-signed URL for uploading the file
      const params = {
        Bucket: 'my-blog-bucket-eg',
        ContentType: 'image/jpeg',
        Key: key,
      };
  
      try {
        const url = await s3.getSignedUrlPromise('putObject', params);
  
        // Use axios to upload the file to the pre-signed URL
        const response = await axios.put(url, /* Your file buffer or stream goes here */);
  
        // If the upload is successful, you can handle the response accordingly
        console.log('Upload response:', response.data);
  
        // Send the key and URL back to the client
        res.send({ key, url });
      } catch (err) {
        console.error('Error generating pre-signed URL or uploading file:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  };