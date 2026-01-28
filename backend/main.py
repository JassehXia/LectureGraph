from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from services.transcription import transcribe_video

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="LectureGraph API")

# Configure CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from services.extraction import extract_concepts

# ... (middleware stays same)

@app.post("/process-lecture")
async def process_lecture(video_id: str, file_path: str):
    """
    Triggers the transcription and extraction pipeline for a given video path.
    """
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        # 1. Transcribe
        metadata = transcribe_video(file_path)
        
        # 2. Extract Entities
        concepts = extract_concepts(metadata["text"])
        
        return {
            "status": "success",
            "video_id": video_id,
            "transcription": metadata,
            "concepts": concepts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
