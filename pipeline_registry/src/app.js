import Fastify from "fastify";
import projectRoutes from "./routes/projpipe.routes.js";
import pipelineRoutes from "./routes/pipeline.routes.js";
import updateRoutes from "./routes/update.routes.js";
import { loadAllPipelines} from "./pipelineLoader.js";

const fastify = Fastify({ logger: true });

loadAllPipelines();

await fastify.register(projectRoutes);
await fastify.register(pipelineRoutes);
await fastify.register(updateRoutes);

fastify.listen({ port: 3002, host: "0.0.0.0" });
