import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const REQUIRED_ENV_VARS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
] as const

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Please set it in your .env.local file.`
    )
  }
  return value
}

function createR2Client(): S3Client {
  REQUIRED_ENV_VARS.forEach(getEnv)

  const accountId = getEnv('R2_ACCOUNT_ID')
  const accessKeyId = getEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = getEnv('R2_SECRET_ACCESS_KEY')

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

/**
 * Upload a file to Cloudflare R2.
 * @param key - The object key (path) within the bucket.
 * @param body - The file contents as a Buffer.
 * @param contentType - MIME type of the file.
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const client = createR2Client()
  const bucketName = getEnv('R2_BUCKET_NAME')

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
}

/**
 * Generate a pre-signed GET URL for a private R2 object.
 * @param key - The object key within the bucket.
 * @param expiresInSeconds - How long the URL is valid (max 3600 for R2).
 */
export async function getPresignedUrl(
  key: string,
  expiresInSeconds: number
): Promise<string> {
  const client = createR2Client()
  const bucketName = getEnv('R2_BUCKET_NAME')

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}
