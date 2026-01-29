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

def save_processing_results(video_id: str, transcript: str, data: Dict):
    concepts = data.get("concepts", [])
    edges = data.get("edges", [])
    
    print(f"DEBUG: Saving results for video_id='{video_id}'...")
    print(f"DEBUG: Transcript length: {len(transcript)}")
    
    # Force conversion to native Python types
    try:
        concepts = convert_numpy_to_python(concepts)
        edges = convert_numpy_to_python(edges)
    except ImportError:
        pass 
    
    print(f"DEBUG: Concepts count: {len(concepts)}")
    print(f"DEBUG: Edges count: {len(edges)}")
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        print("DEBUG: DB Connection successful.")
        
        # 1. Update Video metadata
        cur.execute(
            "UPDATE \"Video\" SET transcript = %s WHERE id = %s",
            (transcript, video_id)
        )
        
        # Mapping to keep track of node IDs for edge creation
        name_to_id = {}

        # 2. Insert Concepts (Nodes)
        for concept in concepts:
            import uuid
            node_id = str(uuid.uuid4())
            name_to_id[concept['name'].lower()] = node_id
            cur.execute(
                "INSERT INTO \"Node\" (id, label, definition, \"videoId\", timestamp) VALUES (%s, %s, %s, %s, %s)",
                (node_id, concept['name'], concept['definition'], video_id, float(concept['timestamp']))
            )
            
        # 3. Insert Edges
        print(f"DEBUG: Inserting {len(edges)} edges...")
        for edge in edges:
            source_id = name_to_id.get(edge['source'].lower())
            target_id = name_to_id.get(edge['target'].lower())
            
            if source_id and target_id:
                edge_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO \"Edge\" (id, \"sourceId\", \"targetId\", type) VALUES (%s, %s, %s, %s)",
                    (edge_id, source_id, target_id, edge.get('type', 'related'))
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

def create_video_record(video_id: str, title: str, r2_key: str):
    print(f"DEBUG: Creating video record id='{video_id}', title='{title}'...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # INSERT into Video table
        # We also set a dummy URL since the schema requires it
        url = f"https://pub-34bc8f2e9d9449f69a86830caeb45256.r2.dev/{r2_key}"
        
        cur.execute(
            "INSERT INTO \"Video\" (id, title, \"r2Key\", url, \"updatedAt\") VALUES (%s, %s, %s, %s, NOW())",
            (video_id, title, r2_key, url)
        )
        
        conn.commit()
        print(f"DEBUG: Video record created successfully.")
        return True
    except Exception as e:
        if 'conn' in locals(): conn.rollback()
        print(f"DEBUG: VIDEO CREATION ERROR: {e}")
        raise e
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()
