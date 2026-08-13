from typing import Optional, Dict

def map_label_to_response(
    snippet: str,
    label_id: Optional[int],
    confidence: Optional[float],
    id2label: Dict[str, str]
) -> dict:
    if label_id is None:
        return {
            "snippet": snippet,
            "isDarkPattern": False,
            "patternType": None,
            "confidence": None
        }

    label_str = id2label.get(str(label_id), "Not Dark Pattern")
    label_lower = label_str.lower().strip()
    
    if "not dark pattern" in label_lower or "no dark pattern" in label_lower or label_id == 0:
        return {
            "snippet": snippet,
            "isDarkPattern": False,
            "patternType": None,
            "confidence": round(confidence, 4) if confidence is not None else None
        }
    else:
        pattern_type = label_lower.replace(" ", "-")
        return {
            "snippet": snippet,
            "isDarkPattern": True,
            "patternType": pattern_type,
            "confidence": round(confidence, 4) if confidence is not None else None
        }
