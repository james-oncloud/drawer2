from __future__ import annotations

from dataclasses import replace

from app.domain.models import BusinessRecord
from app.ports.processing import ProcessingStep


class NormalizeCurrencyStep(ProcessingStep):
    def process(self, record: BusinessRecord) -> BusinessRecord:
        return replace(record, currency=record.currency.upper())
