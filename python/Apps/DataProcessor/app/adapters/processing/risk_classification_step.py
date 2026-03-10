from __future__ import annotations

from dataclasses import replace
from decimal import Decimal

from app.domain.models import BusinessRecord
from app.ports.processing import ProcessingStep


class RiskClassificationStep(ProcessingStep):
    def process(self, record: BusinessRecord) -> BusinessRecord:
        if record.amount >= Decimal("100000"):
            risk = "high"
        elif record.amount >= Decimal("10000"):
            risk = "medium"
        else:
            risk = "low"
        return replace(record, risk_level=risk)
