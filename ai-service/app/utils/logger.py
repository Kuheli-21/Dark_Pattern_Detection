import logging
import sys
from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

class RequestIDFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True

def setup_logger():
    logger = logging.getLogger("ai_service")
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s in %(module)s [Request-ID: %(request_id)s]: %(message)s'
        )
        handler.setFormatter(formatter)
        handler.addFilter(RequestIDFilter())
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()
