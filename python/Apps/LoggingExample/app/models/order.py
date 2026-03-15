import logging
from dataclasses import dataclass


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ProductDemand:
    product_id: str
    product_name: str
    current_stock: int
    expected_weekly_sales: int

    def __post_init__(self) -> None:
        logger.debug(
            "Created ProductDemand(id=%s, name=%s, stock=%d, weekly_sales=%d)",
            self.product_id,
            self.product_name,
            self.current_stock,
            self.expected_weekly_sales,
        )
