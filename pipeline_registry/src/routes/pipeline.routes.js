import { pipelinesStore } from "../store/pipelinesStore.js";
import { stepTypeToWorkerRoutingKey } from "../stepTypeToWorkerRoutingKeyDict.js";

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

        if (!firstStep) {
        return {
          pipeline,
          version: Number(version),
          nextStep: null,
          nextRoutingKey: null
        };
      }

        if(!(firstStep.stepType in stepTypeToWorkerRoutingKey)){
          return reply.code(404).send({
          error: "stepTypeInvalido"
          });
        }
        return {
          pipeline: pipeline,
          version: version,
          nextStep: firstStep
            ? {
                stepId: firstStep.stepId,
                stepType: firstStep.stepType,
                isFinal: firstStep.isFinal,
                config: firstStep.config ?? null
              }
            : null,
          nextRoutingKey: stepTypeToWorkerRoutingKey[firstStep.stepType]
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

      if (currentIndex === steps.lenght - 1) {
        return reply.code(404).send({
          error: "No hay mas pasos"
        });
      }


      const nextStep = steps[currentIndex + 1] ?? null;
        if(!(nextStep.stepType in stepTypeToWorkerRoutingKey)){
          return reply.code(404).send({
          error: "stepTypeInvalido"
          });
        }
      return {
        pipeline: pipeline,
        version: version,
        nextStep: nextStep
          ? {
              stepId: nextStep.stepId,
              stepType: nextStep.stepType,
              isFinal: nextStep.isFinal,
              config: nextStep.config ?? null
            }
          : null,
          nextRoutingKey: stepTypeToWorkerRoutingKey[nextStep.stepType]
      };
    }
  );
}

