import os
from dotenv import load_dotenv

load_dotenv()

RABBIT_URL   = os.getenv("RABBIT_URL", "amqp://rabbitmq")
REGISTRY_URL = os.getenv("REGISTRY_URL", "http://pipeline-registry:3002")
EXCHANGE     = os.getenv("EXCHANGE", "pipeline")
ROUTING_KEY  = os.getenv("ROUTING_KEY", "workerpython")


QUEUE_NAME   = os.getenv("QUEUE_NAME", "worker-python")