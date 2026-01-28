import { S3Client } from "@aws-sdk/client-s3";

if (
  !process.env.CLOUDFLARE_R2_ACCESS_KEY ||
  !process.env.CLOUDFLARE_R2_SECRET_KEY ||
  !process.env.CLOUDFLARE_R2_ENDPOINT
) {
  console.warn("R2 environment variables are missing. File uploads will fail.");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT?.trim() as string,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY?.trim() as string,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY?.trim() as string,
  },
});

export const BUCKET_NAME = "lecture-graph";
