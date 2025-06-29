import logging
import traceback
import pprint as pp
from typing import Optional, Dict, Any

def log_error_with_context(
    logger: logging.Logger,
    message: str,
    error: Optional[Exception] = None,
    context: Optional[Dict[str, Any]] = None,
    include_stack_trace: bool = True
):
    """
    Log an error with full context, stack trace, and structured data.

    Args:
        logger: The logger instance to use
        message: The main error message
        error: The exception object (if available)
        context: Additional context data to log
        include_stack_trace: Whether to include the full stack trace
    """
    logger.error(f"ERROR: {message}")

    if error is not None:
        logger.error(f"Exception Type: {type(error).__name__}")
        logger.error(f"Exception Message: {str(error)}")

    if context is not None:
        logger.error(f"Context Data:")
        for key, value in context.items():
            if isinstance(value, (dict, list)):
                logger.error(f"  {key}: {pp.pformat(value)}")
            else:
                logger.error(f"  {key}: {value}")

    if include_stack_trace:
        logger.error(f"Stack Trace:")
        logger.error(traceback.format_exc())

def log_error_simple(logger: logging.Logger, message: str, error: Optional[Exception] = None):
    """
    Simple error logging with stack trace.

    Args:
        logger: The logger instance to use
        message: The error message
        error: The exception object (if available)
    """
    logger.error(f"ERROR: {message}")
    if error is not None:
        logger.error(f"Exception: {str(error)}")
    logger.error(f"Stack trace: {traceback.format_exc()}")
