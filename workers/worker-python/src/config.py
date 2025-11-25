import os

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://rabbitmq")
REGISTRY_URL = os.getenv("REGISTRY_URL", "http://pipeline-registry:8000")
QUEUE_NAME = os.getenv("QUEUE_NAME", "worker-python")
EXCHANGE = "pipeline"
