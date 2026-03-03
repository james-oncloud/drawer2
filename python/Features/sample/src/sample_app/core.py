"""Core logic for text analysis."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class TextStats:
    """Simple text statistics."""

    lines: int
    words: int
    characters: int

    def to_dict(self) -> dict[str, int]:
        """Return stats as a dictionary."""
        return asdict(self)


def analyze_text(text: str) -> TextStats:
    """Analyze text and return line, word, and character counts."""
    if text == "":
        return TextStats(lines=0, words=0, characters=0)

    line_count = len(text.splitlines())
    if text.endswith("\n"):
        line_count += 1

    return TextStats(
        lines=line_count,
        words=len(text.split()),
        characters=len(text),
    )


def analyze_file(path: Path) -> TextStats:
    """Read a UTF-8 text file and analyze it."""
    content = path.read_text(encoding="utf-8")
    return analyze_text(content)
