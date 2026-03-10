from __future__ import annotations

from app.domain.models import BusinessRecord
from app.ports.processing import ProcessingStep


class ProcessingPipeline:
    def __init__(self, steps: list[ProcessingStep]):
        self._steps = steps

    def run(self, record: BusinessRecord) -> BusinessRecord:
        current = record
        for step in self._steps:
            current = step.process(current)
        return current
