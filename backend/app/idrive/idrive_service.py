import boto3
from app.core.config import IDRIVE_ENDPOINT_URL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, IDRIVE_BUCKET_NAME

idrive_s3_client = boto3.client(
        's3',
        endpoint_url=IDRIVE_ENDPOINT_URL,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )


