from __future__ import annotations

from dataclasses import dataclass

from .models import Message


@dataclass(slots=True)
class MessageStats:
    total_messages: int = 0
    total_recipients: int = 0

    @property
    def avg_recipients(self) -> float:
        if self.total_messages == 0:
            return 0.0
        return self.total_recipients / self.total_messages


def compute_stats(messages: list[Message]) -> MessageStats:
    stats = MessageStats()
    for msg in messages:
        stats.total_messages += 1
        stats.total_recipients += len(msg.recipient_emails)
    return stats

