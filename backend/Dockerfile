FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "TF_ENABLE_ONEDNN_OPTS=0 exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]