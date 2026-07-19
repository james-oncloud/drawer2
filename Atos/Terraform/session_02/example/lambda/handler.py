import json
import os


def handler(event, context):
    """Demo Lambda: returns env metadata for the app stack."""
    return {
        "statusCode": 200,
        "body": json.dumps(
            {
                "message": "ok",
                "assets_bucket": os.environ.get("ASSETS_BUCKET", ""),
                "db_secret_arn": os.environ.get("DB_SECRET_ARN", ""),
                "event_keys": list(event.keys()) if isinstance(event, dict) else [],
            }
        ),
    }
