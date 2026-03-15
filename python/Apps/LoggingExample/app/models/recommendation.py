import logging
from dataclasses import dataclass
from typing import Dict


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RestockRecommendation:
    product_id: str
    product_name: str
    current_stock: int
    recommended_order: int
    urgency: str

    def __post_init__(self) -> None:
        logger.debug(
            "Created RestockRecommendation(id=%s, order=%d, urgency=%s)",
            self.product_id,
            self.recommended_order,
            self.urgency,
        )

    def to_dict(self) -> Dict[str, str | int]:
        logger.debug("Serializing recommendation for product %s", self.product_id)
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "current_stock": self.current_stock,
            "recommended_order": self.recommended_order,
            "urgency": self.urgency,
        }
