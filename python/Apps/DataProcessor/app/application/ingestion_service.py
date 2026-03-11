from __future__ import annotations

from dataclasses import dataclass

from app.application.pipeline import ProcessingPipeline
from app.domain.validation import ValidationError
from app.ports.mappers import RecordMapper
from app.ports.readers import Reader
from app.ports.validators import Validator
from app.ports.writers import InvalidRecordSink, Writer


@dataclass(frozen=True)
class SourceIngestionConfig:
    reader: Reader
    mapper: RecordMapper
    validator: Validator
    invalid_writer: InvalidRecordSink
    pipeline: ProcessingPipeline
    valid_writer: Writer
    source_name: str | None = None


class RecordIngestionService:
    def __init__(
        self,
        *,
        sources: list[SourceIngestionConfig],
    ):
        self._sources = sources

    def run(self) -> None:
        for source in self._sources:
            source_name = source.source_name or source.reader.__class__.__name__
            for raw in source.reader.read():
                try:
                    record = source.mapper.map(raw)
                except Exception as ex:
                    source.invalid_writer.write(
                        source=source_name,
                        raw_record=raw,
                        errors=[ValidationError(field="*", message=str(ex))],
                    )
                    continue

                validation_result = source.validator.validate(record)
                if not validation_result.is_valid:
                    source.invalid_writer.write(
                        source=source_name,
                        raw_record=raw,
                        errors=validation_result.errors,
                    )
                    continue

                processed = source.pipeline.run(record)
                source.valid_writer.write(processed)

            source.invalid_writer.flush()
            source.valid_writer.flush()
