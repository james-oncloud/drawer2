import logging

from app import configure_logging
from app.handlers.order_handler import OrderHandler


configure_logging()
logger = logging.getLogger(__name__)
_handler = OrderHandler()


def lambda_handler(event, context):
    logger.info("Lambda invocation started")
    logger.debug("Incoming event keys: %s", list(event.keys()) if isinstance(event, dict) else "non-dict")
    return _handler.handle(event, context)
