import Fastify from "fastify";
import { connectRabbit, publishToPipeline } from "./rabbitmq_client.js";
import { parseOrionNotification } from "./orionParser.js";
import { selectPipeline } from "./pipelineSelector.js";
import { PORT } from "./config.js";

const app = Fastify({ logger: true });


// Endpoint de recibo de datos (Notificacion)
app.post("/orion/notify", async (req, reply) => {
  try {
    const body = req.body;
    const parsed = parseOrionNotification(body);

    const { pipeline, next, version } = selectPipeline(parsed);

    // Los datos llegan → Se les agrega la info de la pipeline que usaran → Se marca el nodo actual (Ingest)
    // → se publica en la cola central (FANOUT) para que los workers comiencen a consumir
    const message = {
      proyect: parsed.type,
      pipeline,
      version,
      lastNode: "ingest",
      node: next,
      data: parsed.attributes,
      config: {},
      meta: {
        entityId: parsed.id,
        entityType: parsed.type,
        receivedAt: new Date().toISOString()
      }
    };

    await publishToPipeline(message,next);

    return { status: "ok" };
  } catch (err) {
    req.log.error(err);
    return reply.status(400).send({ error: err.message });
  }
});

// Inicia y hace assert de la cola RABBIT MQ
// Nota: El Docker File aún no tiene configurado el inicio del servicio rabbit -> pendiente a agregar con compose
const start = async () => {
  await connectRabbit();
  await app.listen({ port: PORT, host: "0.0.0.0" });
};

start();
