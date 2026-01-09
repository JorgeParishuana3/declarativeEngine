import { pipelinesStore } from "../store/pipelinesStore.js";

export default async function projectRoutes(fastify) {
  fastify.get("/project/:projectName", async (request, reply) => {
    pipelinesStore.projectRegistry;
    const { projectName } = request.params;

    const entry = pipelinesStore.projectRegistry[projectName];

    if (!entry) {
      return reply.code(404).send({
        error: "Proyecto no encontrado"
      });
    }

    return {
      pipeline: entry.pipeline,
      version: entry.version
    };
  });
}
