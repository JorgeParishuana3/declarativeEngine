import { reloadPipeline,loadAllPipelines } from "../pipelineLoader.js";
import { pipelinesStore } from "../store/pipelinesStore.js";


export default async function updateRoutes(fastify) {
  fastify.post("/update/:pipeline", async (request, reply) => {
    const { pipeline } = request.params;

    try {
      const result = reloadPipeline(pipeline);
      return {
        message: result.changed ? "Pipeline recargado con nueva versión" : "Sin cambios, no se creó nueva versión",
        pipeline,
        changed: result.changed,
        version: result.version
      };
    } catch (err) {
      return reply.code(400).send({ error: err.message });
    }
  });
  fastify.post("/update", async (request, reply) => {

    try {
      const results = loadAllPipelines();
      return {
        message: "Pipelines recargadas",
        results
      };
    } catch (err) {
      return reply.code(400).send({ error: err.message });
    }
  });
}
