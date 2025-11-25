import json
from shared.messaging.rabbitClient import RabbitClient
from shared.pipeline.registry_client import PipelineRegistryClient
from shared.utils.logger import log_info, log_warn, log_error
#from executor import run_python_script
from config import RABBIT_URL, REGISTRY_URL, QUEUE_NAME, EXCHANGE


def handle_message(channel, method, props, body):
    msg = json.loads(body)

    pipeline = msg["pipeline"]
    version = msg["version"]
    node = msg["node"]

    registry = PipelineRegistryClient(REGISTRY_URL)
    try:
        pipeline_def = registry.load(pipeline, version)
    except Exception as e:
        log_error("Cannot load pipeline:", e)
        channel.basic_ack(method.delivery_tag)
        return

    node_cfg = pipeline_def["nodes"].get(node)

    if not node_cfg:
        log_warn(f"Node '{node}' not found in pipeline '{pipeline}'")
        channel.basic_ack(method.delivery_tag)
        return

    if node_cfg["type"] != "python_script":
        channel.basic_ack(method.delivery_tag)
        return

    log_info(f"Processing Python script node: {node}")

    try:
        script_path = node_cfg["config"]["script"]
        #new_data = run_python_script(script_path, msg["data"], msg.get("meta", {}))

        next_node = node_cfg.get("next")
        if next_node:
            #msg["data"] = new_data
            msg["node"] = next_node

            channel.basic_publish(
                exchange=EXCHANGE,
                routing_key="",
                body=json.dumps(msg),
                properties=props
            )

        channel.basic_ack(method.delivery_tag)

    except Exception as e:
        log_error("Error executing script:", e)
        channel.basic_ack(method.delivery_tag)



def handle_message_test(channel, method, props, body):
    print(body)
    channel.basic_ack(method.delivery_tag)

def run():
    log_info("Starting worker-python...")

    rabbit = RabbitClient(RABBIT_URL, EXCHANGE)
    rabbit.connect()
    rabbit.setup_queue(QUEUE_NAME)

    rabbit.channel.basic_qos(prefetch_count=1)
    rabbit.channel.basic_consume(queue=QUEUE_NAME, on_message_callback=handle_message_test)

    log_info("Listening for messages...")
    rabbit.channel.start_consuming()
