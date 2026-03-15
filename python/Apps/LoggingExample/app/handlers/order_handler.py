import logging
from typing import Any, Dict

from app.services.inventory_service import InventoryService
from app.services.notification_service import NotificationService
from app.utils.parsers import parse_demand_records, read_minimum_order_quantity
from app.utils.response import error_response, success_response


logger = logging.getLogger(__name__)


class OrderHandler:
    def __init__(
        self,
        inventory_service: InventoryService | None = None,
        notification_service: NotificationService | None = None,
    ):
        self.inventory_service = inventory_service or InventoryService()
        self.notification_service = notification_service or NotificationService()
        logger.debug("OrderHandler initialized with %s and %s", type(self.inventory_service).__name__, type(self.notification_service).__name__)

    def handle(self, event: Dict[str, Any], context: Any) -> Dict[str, object]:
        logger.info("Handling order planning request")
        if not isinstance(event, dict):
            logger.warning("Rejected event with invalid payload type: %s", type(event).__name__)
            return error_response("Event payload must be a JSON object.", status_code=400)

        demands = parse_demand_records(event)
        logger.debug("Parsed %d demand records", len(demands))
        if not demands:
            logger.warning("Rejected request with no product records")
            return error_response("No product demand records provided in `products`.", 400)

        minimum_order_qty = read_minimum_order_quantity(event, fallback=10)
        logger.debug("Using minimum order quantity: %d", minimum_order_qty)
        recommendations = self.inventory_service.calculate_restock_plan(
            demands,
            minimum_order_qty=minimum_order_qty,
        )
        summary_message = self.notification_service.build_summary(recommendations)
        logger.info("Generated %d recommendations", len(recommendations))
        return success_response(recommendations, summary_message)
