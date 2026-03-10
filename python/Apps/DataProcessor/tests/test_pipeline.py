from __future__ import annotations

import unittest
from dataclasses import replace
from datetime import datetime, timezone
from decimal import Decimal

from app.application.pipeline import ProcessingPipeline
from app.domain.models import BusinessRecord
from app.ports.processing import ProcessingStep


class AddOneStep(ProcessingStep):
    def process(self, record: BusinessRecord) -> BusinessRecord:
        return replace(record, amount=record.amount + Decimal("1"))


class DoubleAmountStep(ProcessingStep):
    def process(self, record: BusinessRecord) -> BusinessRecord:
        return replace(record, amount=record.amount * Decimal("2"))


class TestProcessingPipeline(unittest.TestCase):
    def test_pipeline_applies_steps_in_order(self) -> None:
        record = BusinessRecord(
            record_id="r1",
            source="file",
            amount=Decimal("10"),
            currency="USD",
            timestamp=datetime.now(timezone.utc),
        )
        pipeline = ProcessingPipeline(steps=[AddOneStep(), DoubleAmountStep()])

        output = pipeline.run(record)

        self.assertEqual(output.amount, Decimal("22"))  # (10 + 1) * 2


if __name__ == "__main__":
    unittest.main()
