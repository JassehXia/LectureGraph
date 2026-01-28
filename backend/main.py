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

@app.get("/")
async def root():
    return {"message": "LectureGraph AI Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

from services.storage import download_from_r2
from services.db import save_processing_results

@app.post("/process-lecture")
async def process_lecture(video_id: str, file_path: str):
    """
    Downloads from R2, transcribes, extracts concepts, and saves to DB.
    """
    temp_dir = "temp"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    local_video_path = os.path.join(temp_dir, f"{video_id}.mp4")

    try:
        # 1. Download
        download_from_r2(file_path, local_video_path)

        # 2. Transcribe
        metadata = transcribe_video(local_video_path)
        
        # 3. Extract Entities
        concepts = extract_concepts(metadata["segments"])
        
        # 4. Save to Database
        save_processing_results(video_id, metadata["text"], concepts)
        
        # 5. Cleanup
        if os.path.exists(local_video_path):
            os.remove(local_video_path)

        return {
            "status": "success",
            "video_id": video_id,
        }
    except Exception as e:
        import traceback
        print(f"PIPELINE ERROR: {e}")
        traceback.print_exc()
        if os.path.exists(local_video_path):
            os.remove(local_video_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
