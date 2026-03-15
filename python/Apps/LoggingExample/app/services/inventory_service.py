import logging
from typing import List

from app.models.order import ProductDemand
from app.models.recommendation import RestockRecommendation


logger = logging.getLogger(__name__)


class InventoryService:
    def __init__(self, safety_weeks: int = 2):
        self.safety_weeks = safety_weeks
        logger.debug("InventoryService initialized with safety_weeks=%d", safety_weeks)

    def calculate_restock_plan(
        self,
        demands: List[ProductDemand],
        minimum_order_qty: int = 10,
    ) -> List[RestockRecommendation]:
        logger.info(
            "Calculating restock plan for %d products (minimum_order_qty=%d)",
            len(demands),
            minimum_order_qty,
        )
        plan: List[RestockRecommendation] = []
        for demand in demands:
            target_stock = demand.expected_weekly_sales * self.safety_weeks
            deficit = target_stock - demand.current_stock
            if deficit <= 0:
                logger.debug(
                    "Skipping %s (%s): stock is sufficient (current=%d target=%d)",
                    demand.product_id,
                    demand.product_name,
                    demand.current_stock,
                    target_stock,
                )
                continue

            order_qty = self._normalize_order_qty(deficit, minimum_order_qty)
            urgency = self._urgency_level(demand.current_stock, demand.expected_weekly_sales)
            logger.debug(
                "Restock %s (%s): deficit=%d normalized_order=%d urgency=%s",
                demand.product_id,
                demand.product_name,
                deficit,
                order_qty,
                urgency,
            )
            plan.append(
                RestockRecommendation(
                    product_id=demand.product_id,
                    product_name=demand.product_name,
                    current_stock=demand.current_stock,
                    recommended_order=order_qty,
                    urgency=urgency,
                )
            )

        sorted_plan = sorted(plan, key=lambda item: (item.urgency != "high", item.product_name))
        logger.info("Restock plan generated with %d recommendations", len(sorted_plan))
        return sorted_plan

    @staticmethod
    def _normalize_order_qty(deficit: int, minimum_order_qty: int) -> int:
        if deficit <= minimum_order_qty:
            logger.debug(
                "Deficit %d is under minimum order quantity; using minimum=%d",
                deficit,
                minimum_order_qty,
            )
            return minimum_order_qty

        remainder = deficit % minimum_order_qty
        if remainder == 0:
            logger.debug(
                "Deficit %d already aligns with minimum order quantity=%d",
                deficit,
                minimum_order_qty,
            )
            return deficit
        normalized = deficit + (minimum_order_qty - remainder)
        logger.debug(
            "Normalized deficit from %d to %d using minimum order quantity=%d",
            deficit,
            normalized,
            minimum_order_qty,
        )
        return normalized

    @staticmethod
    def _urgency_level(current_stock: int, expected_weekly_sales: int) -> str:
        if expected_weekly_sales <= 0:
            logger.debug("No expected sales; urgency defaults to low")
            return "low"

        weeks_left = current_stock / expected_weekly_sales
        if weeks_left < 0.5:
            return "high"
        if weeks_left < 1.5:
            return "medium"
        return "low"
