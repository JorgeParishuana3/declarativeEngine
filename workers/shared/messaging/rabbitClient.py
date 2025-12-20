import pika, json, time

MAX_RETRIES = 10    
RETRY_DELAY = 3 

class RabbitClient:
    def __init__(self, url, exchange="pipeline"):
        self.url = url
        self.exchange = exchange
        self.connection = None
        self.channel = None
        self.routing_key = "#"

    def connect(self):
        attempts = 0 
        while attempts<MAX_RETRIES:
            try:
                params = pika.URLParameters(self.url)
                self.connection = pika.BlockingConnection(params)
                self.channel = self.connection.channel()

                self.channel.exchange_declare(
                    exchange=self.exchange,
                    exchange_type="topic",
                    durable=True
                )
                print("RabbitMQ conectado exitosamente")  
                return
            except Exception as e:  
                attempts += 1 
                print(f"Error conectando a RabbitMQ (intento {attempts}/{MAX_RETRIES}): {e}")  

                if attempts >= MAX_RETRIES:  
                    print("No se pudo conectar a RabbitMQ después de múltiples intentos.")  
                    raise e 
                time.sleep(RETRY_DELAY)

    def setup_queue(self, queue_name, routing_key = "#"):
        self.channel.queue_declare(queue=queue_name, durable=True)
        fullrouting = self.exchange+"."+routing_key
        self.channel.queue_bind(queue=queue_name, exchange=self.exchange, routing_key=fullrouting)
        self.routing_key = fullrouting

    def publish(self, message, next_routing_key = "#"):
        self.channel.basic_publish(
            exchange=self.exchange,
            routing_key= self.exchange+"."+next_routing_key,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )

    def consume(self, queue_name, callback):
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback
        )
        self.channel.start_consuming()
