import re
import html
from typing import List

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    # Strip HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    # Decode HTML entities
    text = html.unescape(text)
    # Replace multiple whitespaces and newlines with a single space
    text = re.sub(r'\s+', ' ', text)
    # Strip boundary spaces
    return text.strip()

def batch_clean(snippets: List[str]) -> List[str]:
    return [clean_text(s) for s in snippets]
