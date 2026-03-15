import logging
from typing import Any, Dict, List

from app.models.order import ProductDemand


logger = logging.getLogger(__name__)


def parse_demand_records(event: Dict[str, Any]) -> List[ProductDemand]:
    records = event.get("products", [])
    logger.debug("Parsing demand records from %d product entries", len(records))
    demands: List[ProductDemand] = []
    for index, record in enumerate(records):
        demands.append(_parse_single_record(record, index))
    logger.info("Parsed %d product demand records", len(demands))
    return demands


def read_minimum_order_quantity(event: Dict[str, Any], fallback: int = 10) -> int:
    value = event.get("minimum_order_qty", fallback)
    try:
        parsed = int(value)
        if parsed > 0:
            logger.debug("Read minimum order quantity: %d", parsed)
            return parsed
        logger.warning(
            "Minimum order quantity was non-positive (%s); using fallback=%d",
            value,
            fallback,
        )
        return fallback
    except (TypeError, ValueError):
        logger.warning(
            "Failed to parse minimum order quantity (%s); using fallback=%d",
            value,
            fallback,
        )
        return fallback


def _parse_single_record(record: Dict[str, Any], index: int) -> ProductDemand:
    product_id = str(record.get("id", f"product-{index + 1}"))
    product_name = str(record.get("name", "Unknown Product"))
    current_stock = _to_non_negative_int(record.get("current_stock"))
    expected_weekly_sales = _to_non_negative_int(record.get("expected_weekly_sales"))
    demand = ProductDemand(
        product_id=product_id,
        product_name=product_name,
        current_stock=current_stock,
        expected_weekly_sales=expected_weekly_sales,
    )
    logger.debug("Parsed product record %s (%s)", demand.product_id, demand.product_name)
    return demand


def _to_non_negative_int(value: Any) -> int:
    try:
        parsed = int(value)
        if parsed < 0:
            logger.debug("Clamped negative integer %d to 0", parsed)
        return max(0, parsed)
    except (TypeError, ValueError):
        logger.debug("Failed to parse integer from %r; defaulting to 0", value)
        return 0
