import logging
from typing import List

from app.models.recommendation import RestockRecommendation


logger = logging.getLogger(__name__)


class NotificationService:
    def build_summary(
        self,
        recommendations: List[RestockRecommendation],
    ) -> str:
        logger.debug("Building summary for %d recommendations", len(recommendations))
        if not recommendations:
            logger.info("No recommendations found; returning healthy stock message")
            return "Stock levels are healthy. No restock orders are required."

        high_count = sum(1 for item in recommendations if item.urgency == "high")
        medium_count = sum(1 for item in recommendations if item.urgency == "medium")
        low_count = sum(1 for item in recommendations if item.urgency == "low")
        summary = (
            f"Generated {len(recommendations)} restock recommendations "
            f"(high={high_count}, medium={medium_count}, low={low_count})."
        )
        logger.info("Summary built: %s", summary)
        return summary
