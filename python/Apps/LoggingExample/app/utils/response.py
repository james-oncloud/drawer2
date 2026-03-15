import logging
from typing import Dict, List

from app.models.recommendation import RestockRecommendation


logger = logging.getLogger(__name__)


def success_response(
    recommendations: List[RestockRecommendation],
    summary_message: str,
) -> Dict[str, object]:
    logger.debug("Building success response with %d recommendations", len(recommendations))
    return {
        "statusCode": 200,
        "body": {
            "message": summary_message,
            "recommendations": [item.to_dict() for item in recommendations],
        },
    }


def error_response(message: str, status_code: int = 400) -> Dict[str, object]:
    logger.warning("Returning error response %d: %s", status_code, message)
    return {
        "statusCode": status_code,
        "body": {"error": message},
    }
