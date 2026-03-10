from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass(frozen=True)
class BusinessRecord:
    record_id: str
    source: str
    amount: Decimal
    currency: str
    timestamp: datetime
    counterparty: str | None = None
    risk_level: str | None = None
