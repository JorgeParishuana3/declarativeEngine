import Fastify from "fastify";
import { connectRabbit, publishToPipeline } from "./rabbitmq_client.js";
import { parseOrionNotification } from "./orionParser.js";
import { selectPipeline } from "./pipelineSelector.js";
import { PORT } from "./config.js";

const app = Fastify({ logger: true });

app.post("/orion/notify", async (req, reply) => {
  try {
    const body = req.body;
    const parsed = parseOrionNotification(body);

    const { pipeline, version } = selectPipeline(parsed);

    const message = {
      pipeline,
      version,
      node: "ingest",
      data: parsed.attributes,
      meta: {
        entityId: parsed.id,
        entityType: parsed.type,
        subscriptionId: parsed.subscriptionId,
        receivedAt: new Date().toISOString()
      }
    };

    await publishToPipeline(message);

    return { status: "ok" };
  } catch (err) {
    req.log.error(err);
    return reply.status(400).send({ error: err.message });
  }
});

const start = async () => {
  await connectRabbit();
  await app.listen({ port: PORT, host: "0.0.0.0" });
};

start();
