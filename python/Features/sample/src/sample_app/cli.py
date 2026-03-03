"""Command-line interface for sample_app."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .core import analyze_file, analyze_text


def build_parser() -> argparse.ArgumentParser:
    """Create and return the CLI parser."""
    parser = argparse.ArgumentParser(
        prog="sample",
        description="Compute text statistics from input text or a file.",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--text", type=str, help="Inline text to analyze.")
    group.add_argument("--file", type=Path, help="Path to a UTF-8 text file to analyze.")
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON output with indentation.",
    )
    return parser


def run(argv: list[str] | None = None) -> int:
    """Execute the CLI and return an exit status code."""
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        stats = analyze_text(args.text) if args.text is not None else analyze_file(args.file)
    except FileNotFoundError:
        parser.error(f"file not found: {args.file}")
    except OSError as exc:
        parser.error(f"failed to read file {args.file}: {exc}")

    output = stats.to_dict()
    if args.pretty:
        print(json.dumps(output, indent=2))
    else:
        print(json.dumps(output, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(run(sys.argv[1:]))
