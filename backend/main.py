from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(
    filename='pipeline.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

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
from services.transcription import transcribe_video
from services.storage import download_from_r2
from services.db import save_processing_results

@app.get("/")
async def root():
    return {"message": "LectureGraph AI Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/process-lecture")
async def process_lecture(video_id: str, file_path: str):
    logging.info(f"STARTING PIPELINE: video_id={video_id}, file_path={file_path}")
    temp_dir = "temp"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    local_video_path = os.path.join(temp_dir, f"{video_id}.mp4")

    try:
        # 1. Download
        logging.info("Step 1: Downloading from R2...")
        download_from_r2(file_path, local_video_path)

        # 2. Transcribe
        logging.info("Step 2: Transcribing...")
        metadata = transcribe_video(local_video_path)
        
        # 3. Extract Entities
        logging.info("Step 3: Extracting concepts...")
        concepts = extract_concepts(metadata["segments"])
        
        # 4. Save to Database
        logging.info("Step 4: Saving to DB...")
        save_processing_results(video_id, metadata["text"], concepts)
        
        # 5. Cleanup
        if os.path.exists(local_video_path):
            os.remove(local_video_path)

        logging.info("PIPELINE COMPLETE SUCCESS")
        return {"status": "success", "video_id": video_id}
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        logging.error(f"PIPELINE FATAL ERROR:\n{err_msg}")
        if os.path.exists(local_video_path):
            os.remove(local_video_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # reload=True works when you pass the app as a string "filename:appname"
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
