import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_DEFAULT_REGION });
const bucket = process.env.AWS_S3_BUCKET_NAME;

export async function uploadFile({ key, body, contentType }) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${key}`;
}

export async function getFileUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function deleteFile(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
