from __future__ import annotations

from collections.abc import Callable

from app.adapters.processing.enrich_counterparty_step import EnrichCounterpartyStep
from app.adapters.processing.normalize_currency_step import NormalizeCurrencyStep
from app.adapters.processing.risk_classification_step import RiskClassificationStep
from app.ports.processing import ProcessingStep

StepBuilder = Callable[[], ProcessingStep]


class StepFactory:
    REGISTRY: dict[str, StepBuilder] = {
        "normalize_currency": NormalizeCurrencyStep,
        "enrich_counterparty": EnrichCounterpartyStep,
        "risk_classification": RiskClassificationStep,
    }

    @classmethod
    def build_steps(cls, enabled_steps: list[str]) -> list[ProcessingStep]:
        steps: list[ProcessingStep] = []
        for step_name in enabled_steps:
            builder = cls.REGISTRY.get(step_name)
            if builder is None:
                raise ValueError(f"Unknown processing step: {step_name}")
            steps.append(builder())
        return steps
