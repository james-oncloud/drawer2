from __future__ import annotations

import argparse
from pathlib import Path

from .missive_reader import MissiveReader
from .service import compute_stats


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="json-reader",
        description="Read a Missive-style JSON export using a Python generator.",
    )
    parser.add_argument("file", type=Path, help="Path to Missive JSON file (top-level array).")
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Max number of messages to print (default: 20).",
    )
    return parser.parse_args()


def run() -> int:
    args = parse_args()
    reader = MissiveReader(args.file)

    messages = []
    for message in reader.iter_messages():
        messages.append(message)
        if len(messages) >= args.limit:
            break

    if not messages:
        print("No messages found.")
        return 0

    print("Messages:")
    for msg in messages:
        print(
            f"- [{msg.created_at.isoformat()}] {msg.subject} "
            f"(from: {msg.sender_email}, to: {len(msg.recipient_emails)} recipients)"
        )

    stats = compute_stats(messages)
    print("\nStats (printed messages only):")
    print(f"- Total messages: {stats.total_messages}")
    print(f"- Average recipients: {stats.avg_recipients:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())

