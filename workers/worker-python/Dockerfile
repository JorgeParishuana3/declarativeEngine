FROM python:3.11-slim

WORKDIR /app

COPY ./worker-python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./shared ./shared/shared

COPY ./worker-python/src ./src
COPY ./worker-python/scripts ./scripts

ENV PYTHONPATH=/app/src:/app/shared

CMD ["python", "-u", "src/main.py"]

