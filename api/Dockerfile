FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy models first to ensure they exist
COPY *.pkl /app/
COPY *.tflite /app/

# Then copy other files
COPY *.py /app/

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
