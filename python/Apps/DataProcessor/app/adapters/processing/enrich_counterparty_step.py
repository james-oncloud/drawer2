from __future__ import annotations

from dataclasses import replace

from app.domain.models import BusinessRecord
from app.ports.processing import ProcessingStep


class EnrichCounterpartyStep(ProcessingStep):
    def process(self, record: BusinessRecord) -> BusinessRecord:
        if record.counterparty:
            return record
        return replace(record, counterparty="UNKNOWN")
