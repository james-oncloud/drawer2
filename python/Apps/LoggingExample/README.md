# Inventory Planner Lambda (Python 3)

This project is a simple AWS Lambda application that reviews product demand and returns restock recommendations.

It also includes end-to-end Python logging so you can see exactly what happens from request parsing to final response creation.

## Project Structure

- `lambda_function.py`: Lambda entrypoint (`lambda_handler`) and startup logging
- `app/__init__.py`: central logging setup (`configure_logging`)
- `app/handlers/order_handler.py`: request orchestration logs
- `app/models/`: dataclass domain models with creation/serialization debug logs
- `app/services/`: business logic classes with decision logs
- `app/utils/`: parser and response helper logs
- `event.json`: sample event payload
- `pyproject.toml`: project and dev tool configuration

## Logging Architecture

### 1) Setup: where logging is initialized

Logging is initialized in `app/__init__.py`:

- `configure_logging(level=logging.INFO)` sets up root logger behavior.
- If handlers already exist (common in managed runtimes), it only updates log level.
- Otherwise, it calls `logging.basicConfig(...)` with a standard format:
  - `%(asctime)s %(levelname)s %(name)s - %(message)s`

This gives each log line:

- timestamp
- severity (`DEBUG`, `INFO`, `WARNING`, etc.)
- logger name (usually module path)
- message

### 2) Configure flow: how startup happens at runtime

In `lambda_function.py`:

1. `configure_logging()` is called at import time.
2. A module logger is created with `logging.getLogger(__name__)`.
3. On invocation, `lambda_handler` logs start/info messages and then calls `OrderHandler`.

Because Lambda may reuse execution environments, this setup avoids duplicate handler creation while still allowing level updates.

### 3) Module-level loggers: one logger per file

Each module declares:

```python
import logging
logger = logging.getLogger(__name__)
```

Using `__name__` makes the source clear in output, for example:

- `lambda_function`
- `app.handlers.order_handler`
- `app.services.inventory_service`

## Log Statement Patterns Used

The code uses common patterns by intent:

- **`INFO`**: major business milestones
  - request starts
  - number of parsed products
  - recommendations created
  - summary completion
- **`DEBUG`**: detailed internal state
  - parsed values
  - normalization math
  - model creation/serialization details
  - fallback and clamp behavior
- **`WARNING`**: recoverable issues / invalid input
  - non-dict event payload
  - empty products list
  - invalid or non-positive minimum order quantity
  - error responses returned

Pattern example used across files:

```python
logger.info("Calculating restock plan for %d products", len(demands))
logger.debug("Normalized deficit from %d to %d", deficit, normalized)
logger.warning("Failed to parse minimum order quantity (%s); using fallback=%d", value, fallback)
```

Why this pattern is preferred:

- keeps logs structured with stable message templates
- defers string formatting unless level is enabled
- avoids expensive f-string interpolation when not needed

## End-to-End Logging Flow (Request Lifecycle)

When `lambda_handler(event, context)` runs:

1. `lambda_function` logs invocation start.
2. `OrderHandler` logs request handling start.
3. `parsers` logs product parsing and quantity fallback decisions.
4. `InventoryService` logs planning logic, skips, normalization, and final count.
5. `NotificationService` logs summary generation.
6. `response` logs success/error response construction.

This creates a full trace of how one event becomes one response.

## Viewing Log Statements Locally

Run:

```bash
python3 - <<'PY'
import json
from lambda_function import lambda_handler

with open("event.json", "r", encoding="utf-8") as f:
    event = json.load(f)

result = lambda_handler(event, None)
print(json.dumps(result, indent=2))
PY
```

What you will see:

- log lines printed to stdout first
- then the JSON response payload

Current default level is `INFO`, so `DEBUG` lines are hidden unless you lower the level.

## Viewing Log Statements in AWS Lambda

After deployment, Python logging output is automatically captured by CloudWatch Logs.

Basic steps:

1. Invoke the Lambda (console, CLI, event source, etc.).
2. Open CloudWatch Logs.
3. Find log group: `/aws/lambda/<your-function-name>`.
4. Open the newest log stream to inspect lines.

CLI example to tail logs:

```bash
aws logs tail "/aws/lambda/<your-function-name>" --follow
```

## Configuring Log Level

### Which file controls log setup?

Log setup is triggered in `lambda_function.py`:

```python
from app import configure_logging
configure_logging()
```

The actual configuration logic lives in `app/__init__.py` inside `configure_logging(...)`.

### How log level is chosen

`configure_logging(...)` resolves level in this order:

1. explicit `level=` argument (if provided)
2. `LOG_LEVEL` environment variable (for example: `DEBUG`, `INFO`, `WARNING`, `ERROR`)
3. default fallback to `INFO`

If an invalid value is provided, the code falls back to `INFO` and emits a warning log.

### Set log level in AWS Lambda Console

You can configure logging level directly in the AWS UI (no code changes required):

1. Open **AWS Lambda** and select your function.
2. Open the **Configuration** tab.
3. Go to **Environment variables** and click **Edit**.
4. Add or update:
   - Key: `LOG_LEVEL`
   - Value: `DEBUG` (or `INFO`, `WARNING`, `ERROR`, `CRITICAL`)
5. Click **Save**.
6. Open the **Test** tab and run a test event.
7. Open **Monitor** -> **View CloudWatch logs** to confirm the expected verbosity.

This updates function configuration only, so you do not need to redeploy the zip/package.

### Change log level without redeploying code

You can change verbosity by updating Lambda **configuration only** (environment variables), without uploading a new zip/package.

Example CLI:

```bash
aws lambda update-function-configuration \
  --function-name <your-function-name> \
  --environment "Variables={LOG_LEVEL=DEBUG}"
```

Then invoke your function again and tail logs:

```bash
aws logs tail "/aws/lambda/<your-function-name>" --follow
```

To restore default behavior:

```bash
aws lambda update-function-configuration \
  --function-name <your-function-name> \
  --environment "Variables={LOG_LEVEL=INFO}"
```

Notes:

- this is a configuration change, not a code redeploy
- new execution environments pick up the new value; existing warm environments may take a short time to rotate
- if logs do not appear, verify the function execution role includes CloudWatch Logs permissions

### Recommended setup defaults for AWS Python Lambda

- start with `INFO` in production
- use `DEBUG` only during active troubleshooting
- include module logger names (`logging.getLogger(__name__)`) for source traceability
- keep message templates stable for easier CloudWatch filtering
- configure CloudWatch log retention in production environments

Recommended practice:

- use `INFO` in production by default
- temporarily switch to `DEBUG` for troubleshooting
- keep warning/error paths concise and actionable

## Configure Logger Method (Copy/Paste)

Use this method in your Lambda project (for example in `app/__init__.py`):

```python
import logging
import os
from typing import Optional, Union


def configure_logging(level: Optional[Union[int, str]] = None) -> None:
    """
    Configure root logging for AWS Lambda.

    Priority:
    1) explicit `level` argument
    2) LOG_LEVEL environment variable
    3) INFO default
    """
    resolved_level = _resolve_log_level(level)
    root_logger = logging.getLogger()

    # Lambda can reuse execution environments; avoid adding duplicate handlers.
    if root_logger.handlers:
        root_logger.setLevel(resolved_level)
        return

    logging.basicConfig(
        level=resolved_level,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def _resolve_log_level(level: Optional[Union[int, str]]) -> int:
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO")

    if isinstance(level, int):
        return level

    normalized = str(level).strip().upper()
    parsed = logging.getLevelName(normalized)
    if isinstance(parsed, int):
        return parsed

    # Fallback for invalid values
    return logging.INFO
```

Use it in `lambda_function.py`:

```python
import logging
from app import configure_logging

configure_logging()
logger = logging.getLogger(__name__)
```

## Deploy Notes

1. Zip this folder contents.
2. In AWS Lambda, set runtime to Python 3.11 (or any Python 3 runtime you use).
3. Set handler to `lambda_function.lambda_handler`.


```
import logging
import os
from typing import Optional, Union


def configure_logging(level: Optional[Union[int, str]] = None) -> None:
    """
    Configure root logging for AWS Lambda.

    Priority:
    1) explicit `level` argument
    2) LOG_LEVEL environment variable
    3) INFO default
    """
    resolved_level = _resolve_log_level(level)
    root_logger = logging.getLogger()

    # Lambda can reuse execution environments; avoid adding duplicate handlers.
    if root_logger.handlers:
        root_logger.setLevel(resolved_level)
        return

    logging.basicConfig(
        level=resolved_level,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def _resolve_log_level(level: Optional[Union[int, str]]) -> int:
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO")

    if isinstance(level, int):
        return level

    normalized = str(level).strip().upper()
    parsed = logging.getLevelName(normalized)
    if isinstance(parsed, int):
        return parsed

    # Fallback for invalid values
    return logging.INFO
```

Example:
```
import logging
from app import configure_logging

configure_logging()
logger = logging.getLogger(__name__)
```