import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from app.utils.config import settings
from app.utils.logger import logger

class ModelManager:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load_model(self):
        model_dir = settings.model_path
        if not os.path.exists(model_dir):
            raise FileNotFoundError(f"Model path '{model_dir}' does not exist.")
        
        logger.info(f"Loading model and tokenizer from: {model_dir} on device: {self.device}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_dir)
        self.model.to(self.device)
        self.model.eval()
        logger.info("Model and tokenizer loaded successfully.")

    def predict_batch(self, cleaned_snippets: list[str]) -> list[dict]:
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Model is not loaded. Call load_model() first.")
        
        # Tokenize full list as a single batch
        inputs = self.tokenizer(
            cleaned_snippets,
            padding=True,
            truncation=True,
            max_length=settings.max_sequence_length,
            return_tensors="pt",
            return_token_type_ids=False
        )

        
        # Move tensor variables to device
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)
            confidences, predictions = torch.max(probabilities, dim=-1)
            
        results = []
        for idx, (pred, conf) in enumerate(zip(predictions, confidences)):
            results.append({
                "label_id": int(pred.item()),
                "confidence": float(conf.item())
            })
        return results

model_manager = ModelManager()
