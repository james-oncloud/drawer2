from __future__ import annotations

import unittest
from decimal import Decimal

from app.adapters.mappers.record_mapper import RecordMapper
from app.domain.errors import ParsingError


class TestRecordMapper(unittest.TestCase):
    def setUp(self) -> None:
        self.mapper = RecordMapper()

    def test_map_valid_record(self) -> None:
        raw = {
            "id": "abc-123",
            "source": "file",
            "amount": "10.50",
            "currency": "usd",
            "timestamp": "2026-03-10T10:00:00Z",
        }

        record = self.mapper.map(raw)

        self.assertEqual(record.record_id, "abc-123")
        self.assertEqual(record.currency, "USD")
        self.assertEqual(record.amount, Decimal("10.50"))

    def test_map_invalid_record_raises_parsing_error(self) -> None:
        raw = {
            "id": "",
            "source": "file",
            "amount": "not-a-number",
            "currency": "US",
            "timestamp": "bad-ts",
        }

        with self.assertRaises(ParsingError):
            self.mapper.map(raw)


if __name__ == "__main__":
    unittest.main()
