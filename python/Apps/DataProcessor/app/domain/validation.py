from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ValidationError:
    field: str
    message: str


@dataclass(frozen=True)
class ValidationResult:
    is_valid: bool
    errors: list[ValidationError] = field(default_factory=list)
