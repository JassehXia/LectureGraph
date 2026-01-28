import psycopg2
import os
from typing import List, Dict

def get_db_connection():
    #DATABASE_URL example: postgresql://user:pass@host:port/db
    conn = psycopg2.connect(os.getenv("DATABASE_URL").strip().strip("'"))
    return conn


def convert_numpy_to_python(obj):
    import numpy as np
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_numpy_to_python(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_to_python(i) for i in obj]
    return obj

def save_processing_results(video_id: str, transcript: str, concepts: List[Dict]):
    print(f"DEBUG: Saving results for video_id='{video_id}'...")
    print(f"DEBUG: Transcript length: {len(transcript)}")
    
    # Force conversion of all concepts to native Python types
    try:
        concepts = convert_numpy_to_python(concepts)
    except ImportError:
        pass # Numpy not installed, proceed anyway
    
    print(f"DEBUG: Concepts count: {len(concepts)}")
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        print("DEBUG: DB Connection successful.")
        
        # 1. Update Video metadata
        print("DEBUG: Updating Video transcript...")
        cur.execute(
            "UPDATE \"Video\" SET transcript = %s WHERE id = %s",
            (transcript, video_id)
        )
        
        # 2. Insert Concepts (Nodes)
        print(f"DEBUG: Inserting {len(concepts)} nodes...")
        for concept in concepts:
            # We'll use a simple random string if gen_random_uuid fails, 
            # but let's try a standard UUID from python first to be safe
            import uuid
            node_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO \"Node\" (id, label, definition, \"videoId\", timestamp) VALUES (%s, %s, %s, %s, %s)",
                (node_id, concept['name'], concept['definition'], video_id, float(concept['timestamp']))
            )
        
        conn.commit()
        print(f"DEBUG: DB Commit successful for video {video_id}")
    except Exception as e:
        if 'conn' in locals(): conn.rollback()
        print(f"DEBUG: DB SAVE ERROR: {e}")
        raise e
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()
