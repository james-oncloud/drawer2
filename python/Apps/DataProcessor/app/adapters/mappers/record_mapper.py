from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Any

try:
    from pydantic import BaseModel, Field, ValidationError as PydanticValidationError

    HAS_PYDANTIC = True
except ModuleNotFoundError:  # pragma: no cover - exercised in dependency-light envs
    HAS_PYDANTIC = False

from app.domain.errors import ParsingError
from app.domain.models import BusinessRecord
from app.ports.mappers import RecordMapper as RecordMapperPort


if HAS_PYDANTIC:

    class RawRecordDto(BaseModel):
        id: str = Field(min_length=1)
        source: str = Field(min_length=1)
        amount: str
        currency: str = Field(min_length=3, max_length=3)
        timestamp: datetime
        counterparty: str | None = None


def _parse_timestamp(value: Any) -> datetime:
    if isinstance(value, datetime):
        ts = value
    elif isinstance(value, str):
        ts = datetime.fromisoformat(value.replace("Z", "+00:00"))
    else:
        raise ValueError("timestamp must be a datetime or ISO-8601 string")
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return ts


def _validate_without_pydantic(raw: dict[str, Any]) -> dict[str, Any]:
    record_id = str(raw.get("id", "")).strip()
    source = str(raw.get("source", "")).strip()
    currency = str(raw.get("currency", "")).strip()
    if not record_id:
        raise ValueError("id must not be empty")
    if not source:
        raise ValueError("source must not be empty")
    if len(currency) != 3:
        raise ValueError("currency must be a 3-letter code")

    return {
        "id": record_id,
        "source": source,
        "amount": str(raw.get("amount")),
        "currency": currency,
        "timestamp": _parse_timestamp(raw.get("timestamp")),
        "counterparty": raw.get("counterparty"),
    }


class RecordMapper(RecordMapperPort):
    def map(self, raw: dict[str, Any]) -> BusinessRecord:
        try:
            if HAS_PYDANTIC:
                dto = RawRecordDto.model_validate(raw)
                parsed = {
                    "id": dto.id,
                    "source": dto.source,
                    "amount": dto.amount,
                    "currency": dto.currency,
                    "timestamp": dto.timestamp,
                    "counterparty": dto.counterparty,
                }
            else:
                parsed = _validate_without_pydantic(raw)
            amount = Decimal(parsed["amount"])
        except (InvalidOperation, TypeError, ValueError) as ex:
            raise ParsingError(f"Unable to parse raw record: {ex}") from ex
        except Exception as ex:  # includes pydantic validation error
            raise ParsingError(f"Unable to parse raw record: {ex}") from ex

        timestamp = parsed["timestamp"]
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)

        return BusinessRecord(
            record_id=parsed["id"],
            source=parsed["source"],
            amount=amount,
            currency=parsed["currency"].upper(),
            timestamp=timestamp,
            counterparty=parsed["counterparty"],
        )
