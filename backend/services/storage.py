import boto3
import os
from botocore.config import Config

def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv("CLOUDFLARE_R2_ENDPOINT").strip(),
        aws_access_key_id=os.getenv("CLOUDFLARE_R2_ACCESS_KEY").strip(),
        aws_secret_access_key=os.getenv("CLOUDFLARE_R2_SECRET_KEY").strip(),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def download_from_r2(key: str, local_path: str):
    bucket = "lecture-graph" # Or from env
    client = get_r2_client()
    print(f"Downloading {key} from R2 to {local_path}...")
    client.download_file(bucket, key, local_path)
    return local_path
