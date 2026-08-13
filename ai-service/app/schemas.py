from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from app.utils.config import settings

class PredictRequest(BaseModel):
    snippets: List[str] = Field(..., min_length=1)

    @field_validator("snippets")
    @classmethod
    def validate_snippets(cls, v: List[str]) -> List[str]:
        if len(v) > settings.max_batch_size:
            raise ValueError(f"Batch size exceeds maximum of {settings.max_batch_size}")
        for idx, snippet in enumerate(v):
            if len(snippet) > settings.max_snippet_length:
                raise ValueError(
                    f"Snippet at index {idx} exceeds maximum length of {settings.max_snippet_length} characters"
                )
        return v

class PredictionResult(BaseModel):
    snippet: str
    isDarkPattern: bool
    patternType: Optional[str] = None
    confidence: Optional[float] = None

class PredictResponse(BaseModel):
    results: List[PredictionResult]

class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool
