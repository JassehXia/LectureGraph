import boto3
import os
from dotenv import load_dotenv
from botocore.config import Config

# Load from root .env
load_dotenv("../.env")

def test_r2():
    endpoint = os.getenv("CLOUDFLARE_R2_ENDPOINT")
    access_key = os.getenv("CLOUDFLARE_R2_ACCESS_KEY")
    secret_key = os.getenv("CLOUDFLARE_R2_SECRET_KEY")
    
    print(f"Endpoint: {endpoint}")
    print(f"Access Key: {access_key[:5]}...")
    
    if not all([endpoint, access_key, secret_key]):
        print("Error: Missing R2 environment variables")
        return

    try:
        s3 = boto3.client(
            's3',
            endpoint_url=endpoint.strip(),
            aws_access_key_id=access_key.strip(),
            aws_secret_access_key=secret_key.strip(),
            config=Config(signature_version='s3v4'),
            region_name='auto'
        )
        
        print("Listing buckets...")
        response = s3.list_buckets()
        print("Buckets found:")
        for bucket in response['Buckets']:
            print(f" - {bucket['Name']}")
            
    except Exception as e:
        print(f"R2 Connection FAILED: {e}")

if __name__ == "__main__":
    test_r2()
