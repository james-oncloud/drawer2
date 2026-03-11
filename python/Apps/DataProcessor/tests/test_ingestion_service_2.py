from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from app.application.ingestion_service import RecordIngestionService, SourceIngestionConfig
from app.application.pipeline import ProcessingPipeline
from app.domain.models import BusinessRecord
from app.domain.validation import ValidationResult, ValidationError
from app.ports.mappers import RecordMapper
from app.ports.readers import Reader
from app.ports.validators import Validator
from app.ports.writers import Writer, InvalidRecordSink


class StaticReader(Reader):
    def __init__(self, records: list[dict[str, Any]]):
        self._records = records

    def read(self) -> list[dict[str, Any]]:
        return self._records

class StubMapper(RecordMapper):
    def map(self, raw: dict[str, Any]) -> Any:
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

class InvalidWriter(InvalidRecordSink):
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
        self.rows.append({
            "source": source,
            "raw_record": raw_record,
            "errors": errors,
        })

    def flush(self) -> None:
        self.flushed = True

class ValidWriter(Writer):
    def __init__(self):
        self.records: list[BusinessRecord] = []
        self.flushed = False

    def write(self, record: BusinessRecord) -> None:
        self.records.append(record)

    def flush(self) -> None:
        self.flushed = True


def test_service():
    invalid_writer_obj = InvalidWriter()
    valid_writer_obj = ValidWriter()
    sourceConfig = SourceIngestionConfig(
        reader = StaticReader(records=[{"id": "1", "source": "test", "amount": "100", "currency": "USD"}]),
        mapper = StubMapper(),
        validator= StubValidator(),
        invalid_writer = invalid_writer_obj,
        pipeline = ProcessingPipeline(steps=[]),
        valid_writer = valid_writer_obj,
        source_name = "test_source"
    )
    service = RecordIngestionService(sources=[sourceConfig])
    service.run()

    assert invalid_writer_obj.rows == []
    assert valid_writer_obj.records[0].record_id == "1"
    assert True