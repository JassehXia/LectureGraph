import { prisma as db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LectureViewClient from "./LectureViewClient";

export default async function LecturePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lecture = await db.video.findUnique({
        where: { id: id },
        include: {
            nodes: {
                include: {
                    sourceEdges: true
                }
            },
        },
    });

    if (!lecture) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            <LectureViewClient lecture={lecture} />
        </div>
    );
}
