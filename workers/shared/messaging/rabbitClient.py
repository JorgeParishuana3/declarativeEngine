import pika, json

class RabbitClient:
    def __init__(self, url, exchange="pipeline"):
        self.url = url
        self.exchange = exchange
        self.connection = None
        self.channel = None

    def connect(self):
        params = pika.URLParameters(self.url)
        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()

        self.channel.exchange_declare(
            exchange=self.exchange,
            exchange_type="fanout",
            durable=True
        )

    def setup_queue(self, queue_name):
        self.channel.queue_declare(queue=queue_name, durable=True)
        self.channel.queue_bind(queue=queue_name, exchange=self.exchange)

    def publish(self, message):
        self.channel.basic_publish(
            exchange=self.exchange,
            routing_key="",
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )

    def consume(self, queue_name, callback):
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback
        )
        self.channel.start_consuming()
