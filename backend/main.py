from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

# Set up logging to console only
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
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

from services.storage import upload_to_r2
from services.db import create_video_record
import uuid

@app.post("/process")
async def upload_and_process(file: UploadFile = File(...)):
    logging.info(f"RECEIVED UPLOAD: filename={file.filename}")
    video_id = str(uuid.uuid4())
    temp_dir = "temp"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    local_path = os.path.join(temp_dir, f"{video_id}_{file.filename}")
    r2_key = f"uploads/{video_id}/{file.filename}"

    try:
        # 1. Save locally
        with open(local_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 2. Upload to R2
        logging.info("Step 1: Uploading to R2...")
        upload_to_r2(local_path, r2_key)

        # 3. Create initial record
        logging.info("Step 2: Creating DB record...")
        create_video_record(video_id, file.filename, r2_key)

        # 4. Transcribe (already uses local path)
        logging.info("Step 3: Transcribing...")
        metadata = transcribe_video(local_path)
        
        # 5. Extract Entities & Relationships
        logging.info("Step 4: Extracting concepts...")
        graph_data = extract_concepts(metadata["segments"])
        
        # 6. Save results to DB
        logging.info("Step 5: Updating DB with results...")
        save_processing_results(video_id, metadata["text"], graph_data)
        
        # 7. Cleanup
        if os.path.exists(local_path):
            os.remove(local_path)

        logging.info("UPLOAD & PROCESS COMPLETE")
        return {"status": "success", "id": video_id}
    except Exception as e:
        import traceback
        logging.error(f"UPLOAD & PROCESS ERROR: {traceback.format_exc()}")
        if os.path.exists(local_path):
            os.remove(local_path)
        raise HTTPException(status_code=500, detail=str(e))

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
        
        # 3. Extract Entities & Relationships
        logging.info("Step 3: Extracting concepts and edges...")
        graph_data = extract_concepts(metadata["segments"])
        
        # 4. Save to Database
        logging.info("Step 4: Saving to DB...")
        save_processing_results(video_id, metadata["text"], graph_data)
        
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
