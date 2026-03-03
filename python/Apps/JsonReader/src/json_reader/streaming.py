from __future__ import annotations

import json
from collections.abc import Generator
from pathlib import Path
from typing import Any


class JsonArrayStreamError(ValueError):
    """Raised when a JSON array stream cannot be decoded."""


def iter_json_array(file_path: Path, chunk_size: int = 8192) -> Generator[Any, None, None]:
    """
    Stream top-level JSON array items from disk.

    This avoids loading the whole file into memory, which is useful for
    large exports.
    """
    decoder = json.JSONDecoder()
    buffer = ""
    index = 0
    started = False
    eof = False

    with file_path.open("r", encoding="utf-8") as handle:
        while True:
            if not eof and (len(buffer) - index) < chunk_size // 2:
                chunk = handle.read(chunk_size)
                if chunk:
                    if index:
                        buffer = buffer[index:] + chunk
                        index = 0
                    else:
                        buffer += chunk
                else:
                    eof = True

            while index < len(buffer) and buffer[index].isspace():
                index += 1

            if not started:
                if index >= len(buffer):
                    if eof:
                        raise JsonArrayStreamError("File is empty or only whitespace.")
                    continue
                if buffer[index] != "[":
                    raise JsonArrayStreamError("Expected top-level JSON array (starts with '[').")
                started = True
                index += 1
                continue

            while index < len(buffer) and (buffer[index].isspace() or buffer[index] == ","):
                index += 1

            if index < len(buffer) and buffer[index] == "]":
                return

            if eof and index >= len(buffer):
                raise JsonArrayStreamError("Unexpected end of file while reading JSON array.")

            try:
                item, next_index = decoder.raw_decode(buffer, index)
            except json.JSONDecodeError:
                if eof:
                    snippet = buffer[index : index + 100]
                    raise JsonArrayStreamError(
                        f"Invalid JSON near: {snippet!r}"
                    ) from None
                continue

            yield item
            index = next_index

