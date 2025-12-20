import json
from shared.messaging.rabbitClient import RabbitClient
from shared.pipeline.registry_client import PipelineRegistryClient
from shared.utils.logger import log_info, log_warn, log_error
#from executor import run_python_script
from config import RABBIT_URL, REGISTRY_URL, QUEUE_NAME, EXCHANGE,ROUTING_KEY


def handle_message_test(channel, method, props, bodyB):
    body = json.loads(bodyB.decode("utf-8"))
    print(body["data"])
    
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
