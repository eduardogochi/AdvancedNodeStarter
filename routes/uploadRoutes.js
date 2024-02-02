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
    const key = `${req.user.id}/${uuid()}.jpeg`

    // Get a pre-signed URL for uploading the file
    const params = {
      Bucket: 'my-blog-bucket-eg',
      ContentType: 'image/jpeg',
      Key: key,
    }

    try {
      s3.getSignedUrl(
        'putObject',
        {
          Bucket: 'my-blog-bucket-eg',
          ContentType: 'image/jpeg',
          Key: key,
        },
        (err, url) => res.send({ key, url })
      )
    } catch (err) {
      console.error('Error generating pre-signed URL or uploading file:', err)
      res.status(500).send('Internal Server Error')
    }
  })
}
