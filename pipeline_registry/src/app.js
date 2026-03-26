import Fastify from "fastify";
import projectRoutes from "./routes/projpipe.routes.js";
import pipelineRoutes from "./routes/pipeline.routes.js";
import updateRoutes from "./routes/update.routes.js";
import debugRoutes from "./routes/debug.routes.js";
import { syncMemoryStore } from "./store/persistence.js";

const fastify = Fastify({ logger: true });

syncMemoryStore();

await fastify.register(projectRoutes);
await fastify.register(pipelineRoutes);
await fastify.register(updateRoutes);
await fastify.register(debugRoutes);


fastify.listen({ port: 3002, host: "0.0.0.0" });
