from __future__ import annotations

from app.application.pipeline import ProcessingPipeline
from app.domain.validation import ValidationError
from app.ports.mappers import RecordMapper
from app.ports.readers import Reader
from app.ports.validators import Validator
from app.ports.writers import InvalidRecordSink, Writer


class RecordIngestionService:
    def __init__(
        self,
        *,
        readers: list[Reader],
        mapper: RecordMapper,
        validator: Validator,
        invalid_writer: InvalidRecordSink,
        pipeline: ProcessingPipeline,
        valid_writer: Writer,
    ):
        self._readers = readers
        self._mapper = mapper
        self._validator = validator
        self._invalid_writer = invalid_writer
        self._pipeline = pipeline
        self._valid_writer = valid_writer

    def run(self) -> None:
        for reader in self._readers:
            source_name = reader.__class__.__name__
            for raw in reader.read():
                try:
                    record = self._mapper.map(raw)
                except Exception as ex:
                    self._invalid_writer.write(
                        source=source_name,
                        raw_record=raw,
                        errors=[ValidationError(field="*", message=str(ex))],
                    )
                    continue

                validation_result = self._validator.validate(record)
                if not validation_result.is_valid:
                    self._invalid_writer.write(
                        source=source_name,
                        raw_record=raw,
                        errors=validation_result.errors,
                    )
                    continue

                processed = self._pipeline.run(record)
                self._valid_writer.write(processed)

        self._invalid_writer.flush()
        self._valid_writer.flush()
