import amqp from "amqplib";
import { RABBITMQ_URL } from "./config.js";

let channel = null;

//Inicia o conecta al exchange FANOUT, donde se publican los datos (Cola central en el diagrama de Notion)
export async function connectRabbit() {
    if (channel) return channel;

    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange("pipeline", "fanout", { durable: true });
    return channel;
}

export async function publishToPipeline(message) {
    if (!channel) await connectRabbit();

    channel.publish(
        "pipeline",
        "",
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
    );
}
