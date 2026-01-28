"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function saveLecture(data: {
    title: string;
    r2Key: string;
}) {
    try {
        // 1. Save to Database
        const video = await db.video.create({
            data: {
                title: data.title,
                r2Key: data.r2Key,
                url: `${process.env.R2_PUBLIC_URL}/${data.r2Key}`, // You'll need this in .env
            },
        });

        // 2. Trigger FastAPI Backend (Async)
        // We don't await the full processing here because it takes time
        // But we trigger the request
        fetch(`${BACKEND_URL}/process-lecture?video_id=${video.id}&file_path=${data.r2Key}`, {
            method: "POST",
        }).catch(err => console.error("Backend trigger failed:", err));

        revalidatePath("/");
        return { success: true, videoId: video.id };
    } catch (error: any) {
        console.error("DATABASE SAVE ERROR:", error);
        return { success: false, error: error.message || "Database error" };
    }
}
