# DataProcessor

DataProcessor is a Python 3 pipeline built with a ports/adapters (hexagonal) design.
It ingests raw records from multiple sources, maps them to domain types, validates them,
runs configurable processing steps, writes invalid records locally, and writes valid
records to S3 as JSONL.

## How It Works

The run is orchestrated by `RecordIngestionService` in `app/application/ingestion_service.py`.

For each configured reader, the service executes this sequence:

1. Read a raw dictionary from a source adapter
2. Map raw input into `BusinessRecord`
3. Validate business rules and collect structured errors
4. Route invalid records to the invalid sink
5. Send valid records through the ordered processing pipeline
6. Write processed valid records to the output writer

At the end of the run, both invalid and valid writers are flushed.

### End-to-End Data Flow

```text
DbReader / JsonFileReader
  -> raw dict
  -> RecordMapper
  -> BusinessRecord
  -> RecordValidator
     -> invalid -> InvalidRecordWriter (./invalid/data.json, JSONL)
     -> valid   -> ProcessingPipeline (step1 -> step2 -> ...)
                -> S3JsonWriter (JSONL batches to S3 keys)
```

### Layer Responsibilities

- `app/domain`
  - Pure business types and validation result objects
  - `BusinessRecord`, `ValidationError`, `ValidationResult`
- `app/ports`
  - Interfaces that define what the application needs
  - Reader ports: `Reader`, `DbSourceReader`, `JsonSourceReader`
  - Writer ports: `Writer`, `JsonWriter`, `InvalidRecordSink`
  - Mapper, validator, and processing step interfaces
- `app/adapters`
  - Infrastructure implementations of ports
  - Input adapters (`DbReader`, `JsonFileReader`)
  - Output adapters (`InvalidRecordWriter`, `S3JsonWriter`)
  - Mapper (`RecordMapper`), validator (`RecordValidator`)
  - Processing steps (normalize, enrich, risk classification)
- `app/application`
  - Orchestration and pipeline composition
  - `ProcessingPipeline`, `StepFactory`, `RecordIngestionService`

### Records and Validation

- Mapping (`RecordMapper`)
  - Converts raw source records to `BusinessRecord`
  - Uses `pydantic` if available, with stdlib fallback for parsing/validation
- Validation (`RecordValidator`)
  - Checks required fields and business constraints:
    - non-empty ID
    - positive amount
    - supported currency
    - timestamp window
    - duplicate business key
  - Returns `ValidationResult` instead of raising for normal invalid data

### Processing Pipeline

`ProcessingPipeline` runs steps in strict order. Current built-in steps:

- `normalize_currency`
- `enrich_counterparty`
- `risk_classification`

The step list is config-driven via `Settings.pipeline_steps` and resolved by
`StepFactory`. This allows adding/removing steps without changing orchestration.

### Output Behavior

- Invalid records
  - Written by `InvalidRecordWriter` to `./invalid/data.json`
  - Stored as JSONL (one JSON object per line)
  - Includes source name, ingestion time, raw input, and error list
- Valid records
  - Buffered and written by `S3JsonWriter`
  - Output is JSONL batches
  - Keys are partitioned by date and source, for example:
    - `business-records/date=2026-03-10/source=db/part-0001.jsonl`

### Configuration Entry Point

`Settings` in `app/config/settings.py` controls:

- input JSON files
- supported currencies
- max record age
- enabled processing steps
- invalid output path
- S3 bucket, prefix, and batch size

`app/main.py` wires the concrete adapters to these settings and starts the service.

## Architecture

- **Ingestion**: source adapters implement reader interfaces (`DbSourceReader`, `JsonSourceReader`)
- **Transformation**: `RecordMapper` converts raw dictionaries to `BusinessRecord`
- **Validation**: `RecordValidator` returns structured `ValidationResult`
- **Processing**: `ProcessingPipeline` applies ordered, pluggable `ProcessingStep`s
- **Output**:
  - invalid -> `./invalid/data.json` (JSONL payloads with errors)
  - valid -> S3 JSONL objects via `S3JsonWriter`

Core orchestration lives in `app/application/ingestion_service.py`.

## Project Layout

```text
app/
  domain/
  ports/
  application/
  adapters/
  config/
  main.py
tests/
demo_app.py
```

## Install

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Developer Step-by-Step

Follow these steps to get from local setup to a production-ready run:

1. Install and verify
   - Create a virtual env and install dependencies
   - Run tests:
     - `python3 -m unittest discover -s tests -v`
2. Run the demo first
   - Execute `python3 demo_app.py`
   - Confirm files are created in `demo/input`, `demo/invalid`, and `demo/s3_dump`
3. Configure runtime settings
   - Open `app/config/settings.py`
   - Set:
     - `input_json_paths`
     - `supported_currencies`
     - `pipeline_steps`
     - `invalid_output_path`
     - `s3_bucket`, `s3_prefix`, `s3_batch_size`
4. Wire real DB ingestion
   - Replace `_fetch_db_rows_stub()` in `app/main.py` with your real DB/repository call
   - Keep the adapter contract: list/iterable of raw dict records
5. Configure AWS access for S3 writes
   - Provide credentials/role with `s3:PutObject` permissions on target bucket/prefix
   - Validate with a small batch first
6. Run the main app
   - Execute `python3 -m app.main`
   - Check:
     - invalid records in `./invalid/data.json`
     - valid records in configured S3 prefix
7. Add/adjust business logic safely
   - For new transformation: update `RecordMapper`
   - For new validation rule: update `RecordValidator`
   - For new pipeline logic:
     1. create a class implementing `ProcessingStep`
     2. register it in `app/application/step_factory.py`
     3. enable it in `Settings.pipeline_steps`
   - Add/adjust unit tests before merging

## Run Main App

`app/main.py` is wired with a DB stub and default settings.

```bash
python3 -m app.main
```

To use real infrastructure, replace the DB fetch stub and provide AWS credentials/config.

## Run Demo App

The demo does not require AWS. It uses a fake local S3 client and writes outputs under `./demo`.

```bash
python3 demo_app.py
```

Expected demo outputs:

- `demo/input/records.jsonl` (generated demo input)
- `demo/invalid/data.json` (invalid JSONL records)
- `demo/s3_dump/demo-bucket/.../part-*.jsonl` (simulated S3 objects)

## Run Unit Tests

```bash
python3 -m unittest discover -s tests -v
```

## Extending Pipeline Steps

1. Add a new step class implementing `ProcessingStep`
2. Register it in `app/application/step_factory.py`
3. Enable it via `Settings.pipeline_steps`

No changes are required in the orchestration flow.



# JSON File Size Guide

There is **no fixed JSON file size** that guarantees completion within **Lambda’s 15-minute limit**, because runtime depends mainly on **processing complexity and CPU allocation**, not just file size; however we can estimate practical ranges.

## Rough practical limits (single Lambda, Python)

| JSON Size      | Typical Processing Time                       |
| -------------- | --------------------------------------------- |
| **1–10 MB**    | usually **milliseconds to a few seconds**     |
| **10–50 MB**   | **seconds to ~1 minute**                      |
| **50–200 MB**  | **1–5 minutes** depending on logic            |
| **200–500 MB** | **5–15 minutes** possible if logic is simple  |
| **>500 MB**    | risky for Lambda unless processing is trivial |

These estimates assume:

* **in-memory parsing**
* **simple transformations**
* **adequate Lambda memory (≥2048 MB)**

## Why size alone doesn’t determine runtime

Execution time mainly depends on:

1. **JSON parsing speed**
2. **number of records**
3. **complexity of transformation logic**
4. **network transfer (S3 read/write)**
5. **Lambda CPU (memory setting)**

Example:

| File                                 | Records          | Runtime         |
| ------------------------------------ | ---------------- | --------------- |
| 10 MB with 1000 records              | light logic      | <1s             |
| 10 MB with 200k records              | heavy validation | several seconds |
| 200 MB with simple mapping           | 1–3 min          |                 |
| 200 MB with complex joins/validation | >10 min          |                 |

## Important memory consideration

A parsed JSON object typically uses **2–5× the raw file size in RAM**.

Example:

| JSON file | Memory used after parsing |
| --------- | ------------------------- |
| 10 MB     | ~20–50 MB                 |
| 100 MB    | ~200–500 MB               |
| 500 MB    | ~1–2 GB                   |

So memory must be sized accordingly.

## Realistic safe upper bound

For **reliable Lambda execution** with Python:

**~100–250 MB JSON** is usually a comfortable upper limit.

Above that:

* memory pressure increases
* parsing time rises
* risk of hitting 15-minute limit grows

## Your scenario (10 MB JSON)

If your files are **~10 MB**, they are **extremely safe** for Lambda.

Typical runtime:

* **download:** ~50–150 ms
* **parse:** ~100–300 ms
* **process:** depends on logic
* **upload:** ~50–150 ms

Total often **<1–2 seconds**.

## Simple rule of thumb

| JSON size      | Recommended approach                      |
| -------------- | ----------------------------------------- |
| **<50 MB**     | single Lambda, full in-memory parse       |
| **50–250 MB**  | Lambda OK, increase memory                |
| **250–500 MB** | consider streaming                        |
| **>500 MB**    | split files or use distributed processing |

## Best configuration for your case

For **10 MB JSON files**:

* Lambda memory: **2048 MB**
* Architecture: **arm64**
* Parser: **orjson**
* Process in memory
* Single read / single write

This will give **very low execution times**.

---

If you'd like, I can also show the **fastest Python Lambda JSON processing pattern (about 2–3× faster than typical code)** that many high-throughput pipelines use.

# app/adapters


```
app/adapters is the infrastructure implementation layer in your hexagonal design.

Purpose in one line: it contains the concrete code that talks to external systems and formats, while the core app depends only on interfaces in app/ports.

What lives there
input/
db_reader.py: reads raw rows from DB fetch function
json_file_reader.py: reads raw records from JSON/JSONL files
mappers/
record_mapper.py: converts raw dicts into BusinessRecord
validators/
record_validator.py: business-rule validation logic
processing/
step implementations (normalize currency, enrich counterparty, risk classification)
output/
invalid_record_writer.py: writes invalid records to local JSONL
s3_json_writer.py: batches valid records and writes JSONL to S3
Why this matters
Keeps app/application orchestration clean and testable.
Lets you swap implementations without changing core flow (e.g., replace file reader with Kafka reader, S3 writer with local writer).
Makes responsibilities explicit:
ports = contracts
adapters = concrete implementations of those contracts.
So app/adapters is where your system “touches the outside world.”
```