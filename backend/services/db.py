import psycopg2
import os
from typing import List, Dict

def get_db_connection():
    #DATABASE_URL example: postgresql://user:pass@host:port/db
    conn = psycopg2.connect(os.getenv("DATABASE_URL").strip().strip("'"))
    return conn

def save_processing_results(video_id: str, transcript: str, concepts: List[Dict]):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 1. Update Video metadata
        cur.execute(
            "UPDATE \"Video\" SET transcript = %s WHERE id = %s",
            (transcript, video_id)
        )
        
        # 2. Insert Concepts (Nodes)
        # Note: We assume the extraction returns a flat list of concepts for now
        # We need to calculate timestamps or use segment timestamps
        for concept in concepts:
            # For this prototype, we'll assign concepts to the first segment for now
            # or try to match them. A better way is to pass timestamps to extract_concepts.
            cur.execute(
                "INSERT INTO \"Node\" (id, label, definition, \"videoId\", timestamp) VALUES (gen_random_uuid()::text, %s, %s, %s, %s)",
                (concept['name'], concept['definition'], video_id, 0.0)
            )
        
        conn.commit()
        print(f"Successfully saved results for video {video_id}")
    except Exception as e:
        conn.rollback()
        print(f"Error saving to DB: {e}")
        raise e
    finally:
        cur.close()
        conn.close()
