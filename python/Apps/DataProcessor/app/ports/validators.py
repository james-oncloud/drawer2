from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.models import BusinessRecord
from app.domain.validation import ValidationResult


class Validator(ABC):
    @abstractmethod
    def validate(self, record: BusinessRecord) -> ValidationResult:
        """Run domain validation and return a structured result."""
