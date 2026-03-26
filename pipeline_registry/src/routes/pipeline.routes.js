import { pipelinesStore } from "../store/pipelinesStore.js";
import { stepTypeToWorkerRoutingKey } from "../stepTypeToWorkerRoutingKeyDict.js";

export default async function pipelineRoutes(fastify) {
  fastify.get(
    "/pipeline/:pipeline/:version/:stepId/next",
    async (request, reply) => {
      const { pipeline, version, stepId } = request.params;

      const pipelineEntry = pipelinesStore.pipelines[pipeline];
      const pipelineData = pipelineEntry?.versions?.[Number(version)];

      if (!pipelineData) {
        return reply.code(404).send({
          error: "Pipeline o versión no encontrada"
        });
      }

      const steps = pipelineData.steps ?? [];
      let nextStep = null;

      if (stepId === "init") {
        nextStep = steps[0] ?? null;
      } else {
        const currentIndex = steps.findIndex((s) => s.stepId === stepId);

        if (currentIndex === -1) {
          return reply.code(404).send({
            error: "Paso no encontrado"
          });
        }

        nextStep = steps[currentIndex + 1] ?? null;
      }

      if (!nextStep) {
        return reply.code(404).send({
          error: "No hay mas pasos"
        });
      }

      if (!(nextStep.stepType in stepTypeToWorkerRoutingKey)) {
        return reply.code(404).send({
          error: "stepTypeInvalido"
        });
      }

      return {
        pipeline,
        version: Number(version),
        stepId: nextStep.stepId,
        routingKey: stepTypeToWorkerRoutingKey[nextStep.stepType]
      };
    }
  );

  fastify.get(
    "/pipeline/:pipeline/:version/:stepId",
    async (request, reply) => {
      const { pipeline, version, stepId } = request.params;

      const pipelineEntry = pipelinesStore.pipelines[pipeline];
      const pipelineData = pipelineEntry?.versions?.[Number(version)];

      if (!pipelineData) {
        return reply.code(404).send({
          error: "Pipeline o versión no encontrada"
        });
      }

      const steps = pipelineData.steps ?? [];
      const step = steps.find((s) => s.stepId === stepId);

      if (!step) {
        return reply.code(404).send({
          error: "Paso no encontrado"
        });
      }

      return {
        pipeline,
        version: Number(version),
        stepId: step.stepId,
        isFinal: step.isFinal,
        config: step.config ?? null
      };
    }
  );
}
