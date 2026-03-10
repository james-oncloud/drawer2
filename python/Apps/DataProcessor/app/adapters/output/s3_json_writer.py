from __future__ import annotations

import json
from dataclasses import asdict
from datetime import timezone
from typing import Any

import boto3

from app.domain.models import BusinessRecord
from app.ports.writers import JsonWriter


class S3JsonWriter(JsonWriter):
    def __init__(
        self,
        *,
        bucket: str,
        prefix: str,
        batch_size: int = 500,
        s3_client: Any | None = None,
    ):
        self._bucket = bucket
        self._prefix = prefix.strip("/")
        self._batch_size = batch_size
        self._s3 = s3_client or boto3.client("s3")
        self._buffer: list[BusinessRecord] = []
        self._part_counter = 1

    def write(self, record: BusinessRecord) -> None:
        self._buffer.append(record)
        if len(self._buffer) >= self._batch_size:
            self._flush_batch()

    def flush(self) -> None:
        if self._buffer:
            self._flush_batch()

    def _flush_batch(self) -> None:
        first = self._buffer[0]
        date_partition = first.timestamp.astimezone(timezone.utc).date().isoformat()
        source_partition = first.source
        key = (
            f"{self._prefix}/date={date_partition}/source={source_partition}/"
            f"part-{self._part_counter:04d}.jsonl"
        )

        body = "\n".join(
            json.dumps(asdict(record), default=str) for record in self._buffer
        ) + "\n"
        self._s3.put_object(Bucket=self._bucket, Key=key, Body=body.encode("utf-8"))

        self._part_counter += 1
        self._buffer.clear()
