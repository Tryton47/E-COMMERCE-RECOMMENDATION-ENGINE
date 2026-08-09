FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port (7860 is default for Hugging Face Spaces)
ENV PORT=7860
EXPOSE 7860

# Start FastAPI server
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "7860"]
