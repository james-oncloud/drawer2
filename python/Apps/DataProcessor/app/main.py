from __future__ import annotations

from pathlib import Path

from app.adapters.input.db_reader import DbReader
from app.adapters.input.json_file_reader import JsonFileReader
from app.adapters.mappers.record_mapper import RecordMapper
from app.adapters.output.invalid_record_writer import InvalidRecordWriter
from app.adapters.output.s3_json_writer import S3JsonWriter
from app.adapters.validators.record_validator import RecordValidator
from app.application.ingestion_service import RecordIngestionService
from app.application.pipeline import ProcessingPipeline
from app.application.step_factory import StepFactory
from app.config.settings import Settings
from app.ports.readers import DbSourceReader, JsonSourceReader, Reader
from app.ports.writers import JsonWriter


def _fetch_db_rows_stub() -> list[dict]:
    # Replace with a real DB repository fetch in production wiring.
    return []


def build_service(settings: Settings) -> RecordIngestionService:
    db_reader: DbSourceReader = DbReader(fetch_rows=_fetch_db_rows_stub)
    json_reader: JsonSourceReader = JsonFileReader(
        file_paths=[Path(path) for path in settings.input_json_paths]
    )
    readers: list[Reader] = [db_reader, json_reader]
    mapper = RecordMapper()
    validator = RecordValidator(
        supported_currencies=settings.supported_currencies,
        max_age_days=settings.max_record_age_days,
    )
    invalid_writer = InvalidRecordWriter(output_path=settings.invalid_output_path)
    steps = StepFactory.build_steps(settings.pipeline_steps)
    pipeline = ProcessingPipeline(steps=steps)
    valid_writer: JsonWriter = S3JsonWriter(
        bucket=settings.s3_bucket,
        prefix=settings.s3_prefix,
        batch_size=settings.s3_batch_size,
    )
    return RecordIngestionService(
        readers=readers,
        mapper=mapper,
        validator=validator,
        invalid_writer=invalid_writer,
        pipeline=pipeline,
        valid_writer=valid_writer,
    )


def main() -> None:
    settings = Settings()
    service = build_service(settings)
    service.run()


if __name__ == "__main__":
    main()
