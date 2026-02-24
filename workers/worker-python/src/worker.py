import json
import math
import random
import importlib.util
import sys
import os
from pathlib import Path
from shared.messaging.rabbitClient import RabbitClient
from shared.pipeline.registry_client import PipelineRegistryClient
from datetime import datetime, timezone
from shared.utils.logger import log_info, log_warn, log_error
from types import SimpleNamespace
#from executor import run_python_script
from config.config import RABBIT_URL, REGISTRY_URL, QUEUE_NAME, EXCHANGE, ROUTING_KEY

registry = PipelineRegistryClient(REGISTRY_URL)

SCRIPTS_PATH = "/app/scripts"

def load_script_module(script_name: str):
    script_path = Path(SCRIPTS_PATH) / f"{script_name}.py"

    if not script_path.exists():
        raise FileNotFoundError(f"Script {script_name} non encontrado")

    module_name = f"scri[s_{script_name}"

    # hot reload
    if module_name in sys.modules:
        del sys.modules[module_name]

    spec = importlib.util.spec_from_file_location(module_name, script_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module


def handle_message(channel, method, props, bodyB):
    try:
        body = json.loads(bodyB.decode("utf-8"))

        config = body.get("config", {})
        script_name = config.get("script")

        if not script_name:
            raise ValueError("Missing required config.script")

        params = config.get("params")

        module = load_script_module(script_name)

        if not hasattr(module, "process"):
            raise AttributeError(f"{script_name}.py must define process()")

        databody = body.get("data", {})
        print ("[OG DATA]: ",databody )
        result_data = module.process(
            data=databody,
            params=params
        )
        print ("[TF DATA]:", result_data)

        body["data"] = result_data
        body["lastNode"] = body.get("node")
        body["node"] = "bd_manager"

        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key=EXCHANGE + ".bd_manager",
            body=json.dumps(body),
            properties=props
        )

        channel.basic_ack(method.delivery_tag)

    except Exception as e:
        print("Processing error:", e)
        channel.basic_ack(method.delivery_tag)




def run():
    log_info("Starting worker-python...")

    rabbit = RabbitClient(RABBIT_URL, EXCHANGE)
    rabbit.connect()
    rabbit.setup_queue(QUEUE_NAME,ROUTING_KEY)

    rabbit.channel.basic_qos(prefetch_count=1)
    rabbit.channel.basic_consume(queue=QUEUE_NAME, on_message_callback=handle_message)

    log_info("Listening for messages...")
    rabbit.channel.start_consuming()
