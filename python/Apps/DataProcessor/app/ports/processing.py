from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.models import BusinessRecord


class ProcessingStep(ABC):
    @abstractmethod
    def process(self, record: BusinessRecord) -> BusinessRecord:
        """Apply one business processing step."""
