from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    input_json_paths: list[Path] = field(default_factory=list)
    invalid_output_path: Path = Path("./invalid/data.json")
    supported_currencies: list[str] = field(
        default_factory=lambda: ["USD", "EUR", "GBP", "JPY"]
    )
    max_record_age_days: int = 365
    pipeline_steps: list[str] = field(
        default_factory=lambda: [
            "normalize_currency",
            "enrich_counterparty",
            "risk_classification",
        ]
    )
    s3_bucket: str = "example-bucket"
    s3_prefix: str = "business-records"
    s3_batch_size: int = 500
