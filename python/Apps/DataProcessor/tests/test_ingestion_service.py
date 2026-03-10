from __future__ import annotations

import unittest
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from app.application.ingestion_service import RecordIngestionService
from app.application.pipeline import ProcessingPipeline
from app.domain.models import BusinessRecord
from app.domain.validation import ValidationError, ValidationResult
from app.ports.mappers import RecordMapper
from app.ports.processing import ProcessingStep
from app.ports.readers import Reader
from app.ports.validators import Validator
from app.ports.writers import InvalidRecordSink, Writer


class StaticReader(Reader):
    def __init__(self, records: list[dict[str, Any]]):
        self._records = records

    def read(self) -> list[dict[str, Any]]:
        return self._records


class StubMapper(RecordMapper):
    def map(self, raw: dict[str, Any]) -> BusinessRecord:
        if raw.get("broken"):
            raise ValueError("cannot parse")
        return BusinessRecord(
            record_id=raw["id"],
            source=raw["source"],
            amount=Decimal(raw["amount"]),
            currency=raw["currency"],
            timestamp=datetime.now(timezone.utc),
        )


class StubValidator(Validator):
    def validate(self, record: BusinessRecord) -> ValidationResult:
        if record.amount <= 0:
            return ValidationResult(
                is_valid=False,
                errors=[ValidationError(field="amount", message="Must be positive")],
            )
        return ValidationResult(is_valid=True, errors=[])


class PassThroughStep(ProcessingStep):
    def process(self, record: BusinessRecord) -> BusinessRecord:
        return record


class CaptureInvalidWriter(InvalidRecordSink):
    def __init__(self):
        self.rows: list[dict[str, Any]] = []
        self.flushed = False

    def write(
        self,
        *,
        source: str,
        raw_record: dict[str, Any],
        errors: list[ValidationError],
    ) -> None:
        self.rows.append({"source": source, "raw_record": raw_record, "errors": errors})

    def flush(self) -> None:
        self.flushed = True


class CaptureValidWriter(Writer):
    def __init__(self):
        self.records: list[BusinessRecord] = []
        self.flushed = False

    def write(self, record: BusinessRecord) -> None:
        self.records.append(record)

    def flush(self) -> None:
        self.flushed = True


class TestRecordIngestionService(unittest.TestCase):
    def test_routes_valid_and_invalid_records(self) -> None:
        reader = StaticReader(
            [
                {"id": "1", "source": "file", "amount": "10", "currency": "USD"},
                {"id": "2", "source": "file", "amount": "-1", "currency": "USD"},
                {"broken": True},
            ]
        )
        invalid_writer = CaptureInvalidWriter()
        valid_writer = CaptureValidWriter()
        service = RecordIngestionService(
            readers=[reader],
            mapper=StubMapper(),
            validator=StubValidator(),
            invalid_writer=invalid_writer,
            pipeline=ProcessingPipeline([PassThroughStep()]),
            valid_writer=valid_writer,
        )

        service.run()

        self.assertEqual(len(valid_writer.records), 1)
        self.assertEqual(len(invalid_writer.rows), 2)
        self.assertTrue(valid_writer.flushed)
        self.assertTrue(invalid_writer.flushed)


if __name__ == "__main__":
    unittest.main()
