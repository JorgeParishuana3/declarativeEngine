FROM python:3.11-slim

WORKDIR /app

COPY ./worker-db/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./shared ./shared/shared

COPY ./worker-db/src ./src

ENV PYTHONPATH=/app/src:/app/shared

CMD ["python", "-u", "src/main.py"]

