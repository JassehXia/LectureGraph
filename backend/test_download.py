import boto3
import os
from dotenv import load_dotenv
from botocore.config import Config

load_dotenv("../.env")

def test_download():
    s3 = boto3.client(
        's3',
        endpoint_url=os.getenv("CLOUDFLARE_R2_ENDPOINT").strip(),
        aws_access_key_id=os.getenv("CLOUDFLARE_R2_ACCESS_KEY").strip(),
        aws_secret_access_key=os.getenv("CLOUDFLARE_R2_SECRET_KEY").strip(),
        config=Config(
            signature_version='s3v4',
            s3={'addressing_style': 'path'}
        ),
        region_name='auto'
    )
    
    bucket = "lecture-graph"
    # EXACT KEY FROM DATABASE
    key = "2d2d5cee-ab83-4bdd-a489-9d0601a2cd8-Python in 100 Seconds.mp4"
    
    print(f"Testing download for key: {key}")
    try:
        s3.download_file(bucket, key, "test_downloaded.mp4")
        print("Test Download SUCCESS!")
    except Exception as e:
        print(f"Test Download FAILED: {e}")

if __name__ == "__main__":
    test_download()
