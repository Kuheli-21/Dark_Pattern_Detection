from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    model_path: str = Field(default="models/nlp_model", validation_alias="MODEL_PATH")
    max_batch_size: int = Field(default=50, validation_alias="MAX_BATCH_SIZE")
    max_snippet_length: int = Field(default=2000, validation_alias="MAX_SNIPPET_LENGTH")
    max_sequence_length: int = Field(default=128, validation_alias="MAX_SEQUENCE_LENGTH")  # Verified from training
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
