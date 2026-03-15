"""Application package for the sample AWS Lambda."""

import logging
import os


logger = logging.getLogger(__name__)


def configure_logging(level: int | str | None = None) -> None:
    resolved_level = _resolve_log_level(level)
    root_logger = logging.getLogger()
    if root_logger.handlers:
        root_logger.setLevel(resolved_level)
        logger.debug("Updated existing root logger level to %s", resolved_level)
        return

    logging.basicConfig(
        level=resolved_level,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )
    logger.info("Initialized application logging with level=%s", resolved_level)


def _resolve_log_level(level: int | str | None) -> int:
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO")

    if isinstance(level, int):
        return level

    normalized = str(level).strip().upper()
    resolved = logging.getLevelName(normalized)
    if isinstance(resolved, int):
        return resolved

    logger.warning("Invalid LOG_LEVEL=%s; defaulting to INFO", level)
    return logging.INFO
