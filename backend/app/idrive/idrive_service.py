import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from app.core.config import IDRIVE_ENDPOINT_URL, IDRIVE_ACCESS_KEY_ID, IDRIVE_SECRET_ACCESS_KEY, IDRIVE_BUCKET_NAME

idrive_s3_client = boto3.client(
        's3',
        endpoint_url=IDRIVE_ENDPOINT_URL,
        aws_access_key_id=IDRIVE_ACCESS_KEY_ID,
        aws_secret_access_key=IDRIVE_SECRET_ACCESS_KEY
    )


