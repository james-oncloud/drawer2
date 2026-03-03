from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(frozen=True, slots=True)
class Message:
    """Domain model for a Missive message record."""

    message_id: str
    subject: str
    sender_email: str
    recipient_emails: tuple[str, ...]
    created_at: datetime
    body_preview: str
    labels: tuple[str, ...] = field(default_factory=tuple)

    @staticmethod
    def from_dict(raw: dict[str, Any]) -> "Message":
        """Create a Message from a Missive-style dictionary."""
        sender_email = ""
        sender = raw.get("sender")
        if isinstance(sender, dict):
            sender_email = str(sender.get("email", "")).strip()

        recipients_raw = raw.get("recipients", [])
        recipient_emails = tuple(
            str(item.get("email", "")).strip()
            for item in recipients_raw
            if isinstance(item, dict) and str(item.get("email", "")).strip()
        )

        labels_raw = raw.get("labels", [])
        labels = tuple(str(item).strip() for item in labels_raw if str(item).strip())

        created_at_raw = str(raw.get("created_at", "")).strip()
        created_at = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))

        body = str(raw.get("body", ""))
        body_preview = body if len(body) <= 120 else f"{body[:117]}..."

        return Message(
            message_id=str(raw.get("id", "")).strip(),
            subject=str(raw.get("subject", "")).strip(),
            sender_email=sender_email,
            recipient_emails=recipient_emails,
            created_at=created_at,
            body_preview=body_preview,
            labels=labels,
        )

