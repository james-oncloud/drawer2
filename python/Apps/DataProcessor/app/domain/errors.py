class ParsingError(ValueError):
    """Raised when a raw record cannot be parsed into a domain model."""


class SystemFailure(RuntimeError):
    """Raised when infrastructure errors should fail the run."""
