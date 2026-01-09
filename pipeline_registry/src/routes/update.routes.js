import { reloadPipeline,loadAllPipelines } from "../pipelineLoader.js";

export default async function updateRoutes(fastify) {
  fastify.post("/update/:pipeline", async (request, reply) => {
    const { pipeline } = request.params;

    try {
      reloadPipeline(pipeline);
      return {
        message: "Pipeline recargado",
        pipeline
      };
    } catch (err) {
      return reply.code(404).send({ error: err.message });
    }
  });
  fastify.post("/update", async (request, reply) => {

    try {
     loadAllPipelines();
      return { message: "Pipelines recargado" };
    } catch (err) {
      return reply.code(404).send({ error: err.message });
    }
  });
}
