import os
from dotenv import load_dotenv

# Cargar .env (si existe)
load_dotenv()

RABBIT_URL   = os.getenv("RABBIT_URL", "amqp://rabbitmq")
REGISTRY_URL = os.getenv("REGISTRY_URL", "http://pipeline-registry:3002")
PGHOST       = os.getenv("PGHOST", "postgres")
PGUSER       = os.getenv("PGUSER", "admin")
PGPASSWORD   = os.getenv("PGPASSWORD", "otipass123")

QUEUE_NAME   = os.getenv("QUEUE_NAME", "worker-db")

EXCHANGE     = os.getenv("EXCHANGE", "pipeline")
ROUTING_KEY  = os.getenv("ROUTING_KEY", "bd_manager")


PGPORT       = int(os.getenv("PGPORT", 5432))
PGDATABASE   = os.getenv("PGDATABASE", "otiappdb")

