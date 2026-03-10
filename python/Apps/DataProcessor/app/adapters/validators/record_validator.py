from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable

from app.domain.models import BusinessRecord
from app.domain.validation import ValidationError, ValidationResult
from app.ports.validators import Validator


class RecordValidator(Validator):
    def __init__(self, *, supported_currencies: Iterable[str], max_age_days: int = 365):
        self._supported_currencies = {c.upper() for c in supported_currencies}
        self._max_age_days = max_age_days
        self._seen_keys: set[str] = set()

    def validate(self, record: BusinessRecord) -> ValidationResult:
        errors: list[ValidationError] = []

        if not record.record_id.strip():
            errors.append(ValidationError(field="record_id", message="Must not be empty"))

        if record.amount <= 0:
            errors.append(ValidationError(field="amount", message="Must be positive"))

        if record.currency.upper() not in self._supported_currencies:
            errors.append(
                ValidationError(field="currency", message="Unsupported currency")
            )

        now = datetime.now(timezone.utc)
        if record.timestamp < (now - timedelta(days=self._max_age_days)):
            errors.append(
                ValidationError(field="timestamp", message="Record timestamp too old")
            )
        if record.timestamp > (now + timedelta(minutes=5)):
            errors.append(
                ValidationError(field="timestamp", message="Record timestamp in future")
            )

        business_key = f"{record.source}:{record.record_id}:{record.timestamp.date().isoformat()}"
        if business_key in self._seen_keys:
            errors.append(
                ValidationError(field="business_key", message="Duplicate business key")
            )
        else:
            self._seen_keys.add(business_key)

        return ValidationResult(is_valid=not errors, errors=errors)
