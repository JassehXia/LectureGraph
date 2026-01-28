import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, BUCKET_NAME } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        console.log("POST /api/upload - Starting");
        const { filename, contentType } = await request.json();
        console.log(`Request: ${filename} (${contentType})`);

        if (!filename || !contentType) {
            console.error("Missing filename or contentType");
            return NextResponse.json(
                { error: "Filename and contentType are required" },
                { status: 400 }
            );
        }

        const key = `${uuidv4()}-${filename}`;

        console.log("Checking R2 environment variables...");
        if (!process.env.CLOUDFLARE_R2_ENDPOINT || !process.env.CLOUDFLARE_R2_ACCESS_KEY) {
            console.error("CRITICAL: R2 environment variables are MISSING on the server!");
        }

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        console.log("Generating presigned URL...");
        const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return NextResponse.json({
            url: presignedUrl,
            key: key,
        });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
