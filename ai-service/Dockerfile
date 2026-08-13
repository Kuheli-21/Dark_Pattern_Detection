FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY models/ ./models/

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=models/nlp_model
ENV MAX_BATCH_SIZE=50
ENV MAX_SNIPPET_LENGTH=2000
ENV MAX_SEQUENCE_LENGTH=128
ENV LOG_LEVEL=INFO

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
