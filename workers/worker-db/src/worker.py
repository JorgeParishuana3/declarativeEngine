import json
from shared.messaging.rabbitClient import RabbitClient
from shared.pipeline.registry_client import PipelineRegistryClient
from shared.utils.logger import log_info, log_warn, log_error

from dynamic_writer import write_json_row
from config.config import RABBIT_URL, QUEUE_NAME, EXCHANGE, ROUTING_KEY, REGISTRY_URL
registry = PipelineRegistryClient(REGISTRY_URL)

def handle_message(channel, method, props, bodyB):
    try:
        body = json.loads(bodyB.decode("utf-8"))

        project = body.get("project")
        pipeline = body.get("pipeline")
        version = body.get("version")
        current_step_id = body.get("stepId")
        databody = body.get("data", {})
        meta = body.get("meta", {})

        if not pipeline or version is None or not current_step_id:
            raise ValueError("Falta pipeline, version, o stepId")
        
        step_info = registry.get_step(pipeline, version, current_step_id)
        config = step_info.get("config", {})
        is_final = step_info.get("isFinal", False)

        table = config.get("tabla")
        column_map = config.get("column_map")

        if not table:
            raise ValueError("Missing required config.table in registry step config")

        if not column_map:
            raise ValueError("Missing required config.columnMap in registry step config")


        print(databody)
        print(project)
        try:
            write_json_row(
                table=table,
                payload=databody,
                column_map=column_map
            )
            print("Guardado con exito")
        except Exception as e:
            print("Esrror : ", e)
        
        if is_final:
            channel.basic_ack(method.delivery_tag)
            return
        
        next_info = registry.get_next_step(pipeline, version, current_step_id)

        next_step_id = next_info.get("stepId")
        next_routing_key = next_info.get("routingKey")

        if not next_step_id or not next_routing_key:
            raise ValueError("Invalid next step response from registry")
        
        next_message = {
                "project": project,
                "pipeline": pipeline,
                "version": version,
                "lastNode": current_step_id,
                "stepId": next_step_id,
                "data": databody,
                "meta": meta
            }
        channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=f"{EXCHANGE}.{next_routing_key}",
                body=json.dumps(next_message),
                properties=props
            )
        
        channel.basic_ack(method.delivery_tag)
    except Exception as e:
        print("Error:", e)
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
