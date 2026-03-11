from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from app.adapters.input.db_reader import DbReader
from app.adapters.input.json_file_reader import JsonFileReader
from app.adapters.mappers.record_mapper import RecordMapper
from app.adapters.output.invalid_record_writer import InvalidRecordWriter
from app.adapters.output.s3_json_writer import S3JsonWriter
from app.adapters.validators.record_validator import RecordValidator
from app.application.ingestion_service import RecordIngestionService, SourceIngestionConfig
from app.application.pipeline import ProcessingPipeline
from app.application.step_factory import StepFactory
from app.ports.readers import DbSourceReader, JsonSourceReader


class LocalS3Client:
    """Fake S3 client that writes objects to local files."""

    def __init__(self, base_dir: Path):
        self._base_dir = base_dir

    def put_object(self, *, Bucket: str, Key: str, Body: bytes) -> None:
        target = self._base_dir / Bucket / Key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(Body)


def _demo_db_rows() -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "db-1001",
            "source": "db",
            "amount": "15000.00",
            "currency": "usd",
            "timestamp": now.isoformat(),
        },
        {
            "id": "db-1002",
            "source": "db",
            "amount": "-10",
            "currency": "USD",
            "timestamp": now.isoformat(),
        },
    ]


def _write_demo_input(path: Path) -> None:
    now = datetime.now(timezone.utc)
    records = [
        {
            "id": "file-2001",
            "source": "file",
            "amount": "500.55",
            "currency": "eur",
            "timestamp": now.isoformat(),
        },
        {
            "id": "",
            "source": "file",
            "amount": "5.00",
            "currency": "USD",
            "timestamp": now.isoformat(),
        },
        {
            "id": "file-2002",
            "source": "file",
            "amount": "100",
            "currency": "XXX",
            "timestamp": now.isoformat(),
        },
        {
            "id": "file-2003",
            "source": "file",
            "amount": "20",
            "currency": "USD",
            "timestamp": (now - timedelta(days=400)).isoformat(),
        },
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(json.dumps(row) for row in records) + "\n", encoding="utf-8")


def _build_pipeline() -> ProcessingPipeline:
    return ProcessingPipeline(
        steps=StepFactory.build_steps(
            ["normalize_currency", "enrich_counterparty", "risk_classification"]
        )
    )


def run_single_flow_demo() -> None:
    demo_root = Path("./demo")
    input_path = demo_root / "input" / "records.jsonl"
    fake_s3_path = demo_root / "s3_dump"
    _write_demo_input(input_path)

    db_reader: DbSourceReader = DbReader(fetch_rows=_demo_db_rows)
    json_reader: JsonSourceReader = JsonFileReader(file_paths=[input_path])
    db_source = SourceIngestionConfig(
        reader=db_reader,
        mapper=RecordMapper(),
        validator=RecordValidator(supported_currencies=["USD", "EUR", "GBP", "JPY"]),
        invalid_writer=InvalidRecordWriter(output_path=demo_root / "invalid" / "db.json"),
        pipeline=_build_pipeline(),
        valid_writer=S3JsonWriter(
            bucket="demo-bucket",
            prefix="business-records/source=db",
            batch_size=2,
            s3_client=LocalS3Client(base_dir=fake_s3_path),
        ),
        source_name="db",
    )
    json_source = SourceIngestionConfig(
        reader=json_reader,
        mapper=RecordMapper(),
        validator=RecordValidator(supported_currencies=["USD", "EUR", "GBP", "JPY"]),
        invalid_writer=InvalidRecordWriter(
            output_path=demo_root / "invalid" / "file.json"
        ),
        pipeline=_build_pipeline(),
        valid_writer=S3JsonWriter(
            bucket="demo-bucket",
            prefix="business-records/source=file",
            batch_size=2,
            s3_client=LocalS3Client(base_dir=fake_s3_path),
        ),
        source_name="file",
    )
    service = RecordIngestionService(
        sources=[db_source, json_source],
    )
    service.run()

    print("Single-flow demo complete.")
    print(f"Input file: {input_path}")
    print(f"Invalid records: {demo_root / 'invalid'}")
    print(f"Simulated S3 output: {fake_s3_path}")


def _chunked(items: list[str], chunk_size: int) -> list[list[str]]:
    return [items[i : i + chunk_size] for i in range(0, len(items), chunk_size)]


def _demo_rows_for_table(table_name: str) -> list[dict[str, Any]]:
    """
    Simulates table-level DB reads.
    Each table emits valid and invalid rows so routing can be observed.
    """
    now = datetime.now(timezone.utc)
    table_num = int(table_name.split("_")[-1])
    return [
        {
            "id": f"{table_name}-ok",
            "source": "db",
            "amount": str(100 + table_num),
            "currency": "usd",
            "timestamp": now.isoformat(),
            "counterparty": f"cp-{table_num}",
        },
        {
            "id": f"{table_name}-bad",
            "source": "db",
            "amount": "-1",
            "currency": "USD",
            "timestamp": now.isoformat(),
        },
    ]


def _build_db_chunk_service(
    *,
    table_names: list[str],
    chunk_id: int,
    output_root: Path,
) -> RecordIngestionService:
    sources = [
        SourceIngestionConfig(
            reader=DbReader(fetch_rows=lambda t=table: _demo_rows_for_table(t)),
            mapper=RecordMapper(),
            validator=RecordValidator(
                supported_currencies=["USD", "EUR", "GBP", "JPY"]
            ),
            invalid_writer=InvalidRecordWriter(
                output_path=output_root / "invalid" / f"chunk_{chunk_id}_{table}.json"
            ),
            pipeline=_build_pipeline(),
            valid_writer=S3JsonWriter(
                bucket="demo-bucket",
                prefix=f"business-records/chunk={chunk_id}/table={table}",
                batch_size=20,
                s3_client=LocalS3Client(base_dir=output_root / "s3_dump"),
            ),
            source_name=table,
        )
        for table in table_names
    ]
    return RecordIngestionService(
        sources=sources,
    )


def run_parallel_db_chunks_demo() -> None:
    """
    Ingest 20 DB tables in chunks of 5 tables, with each chunk run in parallel.
    Total workers: 4 (20 / 5).
    """
    output_root = Path("./demo_parallel")
    table_names = [f"table_{idx}" for idx in range(1, 21)]
    table_chunks = _chunked(table_names, 5)

    services = [
        _build_db_chunk_service(table_names=chunk, chunk_id=i, output_root=output_root)
        for i, chunk in enumerate(table_chunks, start=1)
    ]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(service.run) for service in services]
        for future in as_completed(futures):
            future.result()

    print("Parallel DB chunk demo complete.")
    print("Processed 20 tables in 4 parallel workers (5 tables per worker).")
    print(f"Invalid chunk files: {output_root / 'invalid'}")
    print(f"Simulated S3 output: {output_root / 's3_dump'}")


def main() -> None:
    run_single_flow_demo()
    run_parallel_db_chunks_demo()


if __name__ == "__main__":
    main()
