import json
import math
import random
from shared.messaging.rabbitClient import RabbitClient
from shared.pipeline.registry_client import PipelineRegistryClient
from datetime import datetime, timezone
from shared.utils.logger import log_info, log_warn, log_error
from types import SimpleNamespace
#from executor import run_python_script
from config.config import RABBIT_URL, REGISTRY_URL, QUEUE_NAME, EXCHANGE, ROUTING_KEY

registry = PipelineRegistryClient(REGISTRY_URL)

def decoder_from_hex(hex_payload):

    bytes_data = bytes.fromhex(hex_payload)

    # 2 bytes (16 bits)
    idb = (bytes_data[0] << 8) | bytes_data[1]
    humedad = (bytes_data[2] << 8) | bytes_data[3]
    temperatura = (bytes_data[4] << 8) | bytes_data[5]

    # 3 bytes (24 bits)
    dioxido_de_carbono = (
        (bytes_data[6] << 16) |
        (bytes_data[7] << 8) |
        bytes_data[8]
    )

    # Aplicar escalas y offsets
    return {
        "idb": idb - 256,
        "humedad": (humedad / 100) - 296,
        "temperatura": (temperatura / 100) - 296,
        "dioxido_de_carbono": (dioxido_de_carbono / 100) - 65536
    }


def handle_message_test(channel, method, props, bodyB):
    print(bodyB)
    body = json.loads(bodyB.decode("utf-8"))
    #pipelineInfo = body["pipeline-info"]
    #nextStepData = registry.loadNextStep(pipelineInfo["pipeline_name"], pipelineInfo["version"], pipelineInfo["stepId"])
    #print("NEXTSTEP DATA ", nextStepData)
    if body["pipeline"] == "parking":
        data = body["data"]
        spots = data.get("parking_spots", [])

        state = "".join("1" if spot["occupied"] else "0" for spot in spots)
        ids = [spot["spot_id"] for spot in spots]
        
        n = len(state)
        if random.choice([True, False]):
            lay = [1, n]
        else:
            lay = [2, math.ceil(n / 2)]
    
        body["data"]["cam_id"] = body.get("meta",{}).get("entityId")
        body["data"]["spots_state"] = state
        body["data"]["ids"] = ids
        body["data"]["layout"] = lay
        body["lastNode"] = body["node"]
        body["node"] = "bd_manager"
        body["data"].pop("parking_spots", None)
    
        channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=EXCHANGE + ".bd_manager",
                body=json.dumps(body),
                properties=props
            )        
        print("parking form: ", body ["data"])


    elif body ["pipeline"] == "cuenta_personas": 
        
        body["data"]["cam_id"] = body.get("meta",{}).get("entityId")

        body["config"]["table"] = "cuenta-personas"

        body["lastNode"] = body["node"]
        body["node"] = "bd_manager"
        channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=EXCHANGE + ".bd_manager",
                body=json.dumps(body),
                properties=props
            )

        print("cuentap", body)

    elif body["pipeline"] == "lorawan":
        data = body.get("data", {})
        data_encode = data.get("data_encode")

        if data_encode == "hexstring":
            try:
                hex_payload = data.get("data")
                timestamp = datetime.fromtimestamp(data.get("timestamp"), tz=timezone.utc)
                if hex_payload:
                    decoded_data = decoder_from_hex(hex_payload)
                    body["data"] = decoded_data
                    body["data"]["timestamp"] = timestamp.isoformat()

            except Exception as e:
                print("Error decoding lorawan payload:", e)
                channel.basic_ack(method.delivery_tag)
                return

        body["lastNode"] = body["node"]
        body["node"] = "bd_manager"

        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key=EXCHANGE + ".bd_manager",
            body=json.dumps(body),
            properties=props
        )

        print("lorawan:", body["data"])

    else:
        print("Unknown",["data"])

    
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
