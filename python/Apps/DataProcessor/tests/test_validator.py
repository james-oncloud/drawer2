from __future__ import annotations

import unittest
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.adapters.validators.record_validator import RecordValidator
from app.domain.models import BusinessRecord


class TestRecordValidator(unittest.TestCase):
    def setUp(self) -> None:
        self.validator = RecordValidator(supported_currencies=["USD", "EUR"])

    def _base_record(self) -> BusinessRecord:
        return BusinessRecord(
            record_id="id-1",
            source="db",
            amount=Decimal("100"),
            currency="USD",
            timestamp=datetime.now(timezone.utc),
        )

    def test_validate_valid_record(self) -> None:
        result = self.validator.validate(self._base_record())
        self.assertTrue(result.is_valid)
        self.assertEqual(result.errors, [])

    def test_validate_negative_amount_and_unsupported_currency(self) -> None:
        record = BusinessRecord(
            record_id="id-2",
            source="db",
            amount=Decimal("-1"),
            currency="JPY",
            timestamp=datetime.now(timezone.utc),
        )
        result = self.validator.validate(record)
        self.assertFalse(result.is_valid)
        fields = {err.field for err in result.errors}
        self.assertIn("amount", fields)
        self.assertIn("currency", fields)

    def test_validate_duplicate_business_key(self) -> None:
        record = self._base_record()
        first = self.validator.validate(record)
        second = self.validator.validate(record)
        self.assertTrue(first.is_valid)
        self.assertFalse(second.is_valid)
        self.assertTrue(any(e.field == "business_key" for e in second.errors))

    def test_validate_timestamp_window(self) -> None:
        old_record = BusinessRecord(
            record_id="id-old",
            source="db",
            amount=Decimal("1"),
            currency="USD",
            timestamp=datetime.now(timezone.utc) - timedelta(days=366),
        )
        result = self.validator.validate(old_record)
        self.assertFalse(result.is_valid)
        self.assertTrue(any(e.field == "timestamp" for e in result.errors))


if __name__ == "__main__":
    unittest.main()
