import { PIPELINE_API_URL } from "./config.js";

export async function selectPipeline(orionData) {
  const project = orionData.type;

  const projectRes = await fetch(
    `${PIPELINE_API_URL}/project/${encodeURIComponent(project)}`
  );

  if (!projectRes.ok) {
    throw new Error(`No se pudo obtener pipeline para el proyecto ${project}`);
  }

  const projectInfo = await projectRes.json();
  const { pipeline, version } = projectInfo;

  if (pipeline === undefined || version === undefined) {
    throw new Error(`Respuesta inválida al consultar proyecto ${project}`);
  }

  const nextRes = await fetch(
    `${PIPELINE_API_URL}/pipeline/${encodeURIComponent(pipeline)}/${encodeURIComponent(version)}/init/next`
  );

  if (!nextRes.ok) {
    throw new Error(
      `No se pudo obtener el siguiente paso del pipeline ${pipeline} versión ${version}`
    );
  }

  const nextInfo = await nextRes.json();
  const { stepId, routingKey } = nextInfo;

  if (!stepId || !routingKey) {
    throw new Error(
      `Respuesta inválida al consultar siguiente paso de ${pipeline}/${version}/init`
    );
  }

  return {
    project,
    pipeline,
    version,
    stepId,
    routingKey
  };
}