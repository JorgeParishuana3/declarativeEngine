import json
from shared.messaging.rabbitClient import RabbitClient
from shared.pipeline.registry_client import PipelineRegistryClient
from shared.utils.logger import log_info, log_warn, log_error

from dynamic_writer import write_json_row
from config.config import RABBIT_URL, QUEUE_NAME, EXCHANGE, ROUTING_KEY


def handle_message_test(channel, method, props, bodyB):
    body = json.loads(bodyB.decode("utf-8"))
    print(body["data"])
    write_json_row( table="cupe_registros",  payload=body["data"], column_map={'cam_id':"cam_id",'timestamp': "ts",'aforo':"aforo"})
    
    channel.basic_ack(method.delivery_tag)



def run():
    log_info("Starting worker-python...")

    rabbit = RabbitClient(RABBIT_URL, EXCHANGE)
    rabbit.connect()
    rabbit.setup_queue(QUEUE_NAME,ROUTING_KEY)

    rabbit.channel.basic_qos(prefetch_count=1)
    rabbit.channel.basic_consume(queue=QUEUE_NAME, on_message_callback=handle_message_test)

    log_info("Listening for messages...")
    rabbit.channel.start_consuming()
