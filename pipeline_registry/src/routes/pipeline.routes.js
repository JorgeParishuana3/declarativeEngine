import { pipelinesStore } from "../store/pipelinesStore.js";

export default async function pipelineRoutes(fastify) {
  fastify.get(
    "/pipeline/:pipeline/:version/:stepId/next",
    async (request, reply) => {
      console.log(pipelinesStore.pipelines);
      const { pipeline, version, stepId } = request.params;

      const pipelineEntry = pipelinesStore.pipelines[pipeline];
      const pipelineData = pipelineEntry?.versions?.[Number(version)];

      if (!pipelineData) {
        return reply.code(404).send({
          error: "Pipeline o versión no encontrada"
        });
      }

      const steps = pipelineData.steps;

      if (stepId === "init") {
        const firstStep = steps[0] ?? null;

        return {
          nextStep: firstStep
            ? {
                stepId: firstStep.stepId,
                stepType: firstStep.stepType,
                config: firstStep.config ?? null
              }
            : null
        };
      }

      const currentIndex = steps.findIndex(
        (s) => s.stepId === stepId
      );

      if (currentIndex === -1) {
        return reply.code(404).send({
          error: "Paso no encontrado"
        });
      }

      const nextStep = steps[currentIndex + 1] ?? null;

      return {
        nextStep: nextStep
          ? {
              stepId: nextStep.stepId,
              stepType: nextStep.stepType,
              config: nextStep.config ?? null
            }
          : null
      };
    }
  );
}

