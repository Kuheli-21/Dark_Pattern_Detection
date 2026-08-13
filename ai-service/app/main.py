import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from app.utils.config import settings
from app.utils.logger import logger, request_id_var
from app.schemas import PredictRequest, PredictResponse, HealthResponse, PredictionResult
from app.nlp.preprocess import clean_text
from app.nlp.model import model_manager
from app.nlp.explain import map_label_to_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        model_manager.load_model()
    except Exception as e:
        logger.error(f"Failed to load model during startup: {str(e)}")
    yield
    logger.info("Service shutting down. Unloading models.")

app = FastAPI(
    title="Dark Pattern Detector AI Microservice",
    description="Python/FastAPI service running DistilBERT classifier",
    version="1.0.0",
    lifespan=lifespan
)

@app.middleware("http")
async def add_request_id_and_latency(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    token = request_id_var.set(request_id)
    
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        logger.info(f"{request.method} {request.url.path} finished in {process_time:.4f}s")
        return response
    finally:
        request_id_var.reset(token)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": jsonable_encoder(exc.errors())}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Inference pipeline failure: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred running model inference."}
    )

@app.get("/health", response_model=HealthResponse)
async def health():
    model_loaded = (
        model_manager.model is not None and 
        model_manager.tokenizer is not None
    )
    return {
        "status": "ok" if model_loaded else "degraded",
        "modelLoaded": model_loaded
    }

@app.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest):
    start_time = time.perf_counter()
    raw_snippets = payload.snippets
    
    cleaned_snippets = []
    inference_indices = []
    inference_texts = []
    
    for idx, snippet in enumerate(raw_snippets):
        cleaned = clean_text(snippet)
        cleaned_snippets.append(cleaned)
        
        if cleaned == "":
            continue
        else:
            inference_indices.append(idx)
            inference_texts.append(cleaned)
            
    inference_results = {}
    if inference_texts:
        logger.info(f"Running inference on batch size: {len(inference_texts)}")
        predictions = model_manager.predict_batch(inference_texts)
        for local_idx, result in enumerate(predictions):
            global_idx = inference_indices[local_idx]
            inference_results[global_idx] = result
            
    results = []
    id2label = getattr(model_manager.model.config, "id2label", {"0": "Not Dark Pattern", "1": "Dark Pattern"})
    
    for idx, snippet in enumerate(raw_snippets):
        cleaned = cleaned_snippets[idx]
        if idx in inference_results:
            pred_data = inference_results[idx]
            res = map_label_to_response(
                snippet=snippet,
                label_id=pred_data["label_id"],
                confidence=pred_data["confidence"],
                id2label=id2label
            )
        else:
            res = map_label_to_response(
                snippet=snippet,
                label_id=None,
                confidence=None,
                id2label=id2label
            )
        results.append(PredictionResult(**res))
        
    latency = time.perf_counter() - start_time
    logger.info(f"Batch prediction size: {len(raw_snippets)} completed in {latency:.4f}s")
    return {"results": results}
