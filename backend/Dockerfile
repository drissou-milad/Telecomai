FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies first for better layer caching
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the backend app code and the ML artifacts/datasets it reads at runtime
COPY backend/ backend/
COPY ml/ ml/

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
