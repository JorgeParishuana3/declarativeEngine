import amqp from "amqplib";
import { RABBITMQ_URL } from "./config.js";

let channel = null;

const MAX_RETRIES = 10; 
const RETRY_DELAY_MS = 3000; 

//Inicia o conecta al exchange FANOUT, donde se publican los datos (Cola central en el diagrama de Notion)
export async function connectRabbit() {
    if (channel) return channel;

    let attempts = 0;

    while (attempts<MAX_RETRIES){
        try{
            const connection = await amqp.connect(RABBITMQ_URL);
            channel = await connection.createChannel();

            await channel.assertExchange("pipeline", "topic", { durable: true });
            return channel; 
        }
        catch (err) {
            attempts++; 
            console.error(`Error conectando a RabbitMQ (intento ${attempts}/${MAX_RETRIES})`);
            console.error(err.message); 

            if (attempts >= MAX_RETRIES) { 
                console.error("No se pudo conectar a RabbitMQ después de varios intentos."); 
                throw err;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }    
    }
}

export async function publishToPipeline(message, next = "#") {
    if (!channel) await connectRabbit();

    channel.publish(
        "pipeline",
        "pipeline."+next,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
    );
}
