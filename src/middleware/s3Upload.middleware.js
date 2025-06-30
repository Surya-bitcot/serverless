// import AWS from 'aws-sdk';
// import multer from 'multer';
// import multerS3 from 'multer-s3';

// // Configure AWS SDK
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// const s3 = new AWS.S3();

// // Multer S3 storage configuration
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_S3_BUCKET_NAME,
//     acl: 'public-read',
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       const fileName = `profiles/${Date.now()}-${file.originalname}`;
//       cb(null, fileName);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: function (req, file, cb) {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   },
// });

// export default upload;
