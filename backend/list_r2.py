import boto3
import os
from dotenv import load_dotenv
from botocore.config import Config

load_dotenv("../.env")

def list_r2():
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
    print(f"Listing objects in bucket: {bucket}")
    try:
        response = s3.list_objects_v2(Bucket=bucket)
        if 'Contents' in response:
            for obj in response['Contents']:
                print(f" - {obj['Key']}")
        else:
            print("Bucket is empty.")
    except Exception as e:
        print(f"FAILED to list bucket: {e}")

if __name__ == "__main__":
    list_r2()
