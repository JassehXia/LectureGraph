import psycopg2
import os
from dotenv import load_dotenv

load_dotenv("../.env")
db_url = os.getenv("DATABASE_URL").strip().strip("'")
conn = psycopg2.connect(db_url)
cur = conn.cursor()

print("Listing all Video records...")
cur.execute("SELECT id, title, \"r2Key\", transcript FROM \"Video\" ORDER BY \"createdAt\" DESC LIMIT 5")
videos = cur.fetchall()

for v in videos:
    print(f"ID: {v[0]}")
    print(f"Title: {v[1]}")
    print(f"R2Key: {v[2]}")
    print(f"Transcript: {v[3][:50] if v[3] else 'None'}")
    print("-" * 20)
    
    # Check nodes
    cur.execute("SELECT label FROM \"Node\" WHERE \"videoId\" = %s", (v[0],))
    nodes = cur.fetchall()
    print(f"Nodes ({len(nodes)}): {[n[0] for n in nodes]}")
    print("=" * 40)

cur.close()
conn.close()
