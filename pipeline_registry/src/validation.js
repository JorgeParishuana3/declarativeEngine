const ALLOWED_STEP_TYPES = new Set(["python-script", "db-save"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePythonScriptConfig(config, stepId) {
  if (!isPlainObject(config)) {
    throw new Error(`Config inválida en step '${stepId}': debe ser un objeto`);
  }

  if (typeof config.script !== "string" || !config.script.trim()) {
    throw new Error(`Config inválida en step '${stepId}': 'script' es obligatorio y debe ser string`);
  }

  if (config.script.endsWith(".py")) {
    throw new Error(`Config inválida en step '${stepId}': 'script' no debe incluir la extensión .py`);
  }

  if ("params" in config && !isPlainObject(config.params)) {
    throw new Error(`Config inválida en step '${stepId}': 'params' debe ser un objeto si se envía`);
  }
}

function validateDbSaveConfig(config, stepId) {
  if (!isPlainObject(config)) {
    throw new Error(`Config inválida en step '${stepId}': debe ser un objeto`);
  }

  if (typeof config.tabla !== "string" || !config.tabla.trim()) {
    throw new Error(`Config inválida en step '${stepId}': 'tabla' es obligatoria y debe ser string`);
  }

  if ("column_map" in config && !isPlainObject(config.column_map)) {
    throw new Error(`Config inválida en step '${stepId}': 'column_map' debe ser un objeto si se envía`);
  }
}

export function validatePipelineDefinition(data) {
  if (!isPlainObject(data)) {
    throw new Error("El pipeline debe ser un objeto JSON");
  }

  const { pipeline, project, steps } = data;

  if (typeof pipeline !== "string" || !pipeline.trim()) {
    throw new Error("'pipeline' es obligatorio y debe ser string");
  }

  if (typeof project !== "string" || !project.trim()) {
    throw new Error("'project' es obligatorio y debe ser string");
  }

  if (!Array.isArray(steps)) {
    throw new Error("'steps' debe ser un arreglo");
  }

  const stepIds = new Set();

  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];

    if (!isPlainObject(step)) {
      throw new Error(`El step en posición ${index} debe ser un objeto`);
    }

    const { stepId, stepType, isFinal, config } = step;

    if (typeof stepId !== "string" || !stepId.trim()) {
      throw new Error(`El step en posición ${index} tiene 'stepId' inválido`);
    }

    if (stepIds.has(stepId)) {
      throw new Error(`El 'stepId' '${stepId}' está repetido`);
    }
    stepIds.add(stepId);

    if (typeof stepType !== "string" || !ALLOWED_STEP_TYPES.has(stepType)) {
      throw new Error(
        `El step '${stepId}' tiene 'stepType' inválido. Valores permitidos: python-script, db-save`
      );
    }

    if (typeof isFinal !== "boolean") {
      throw new Error(`El step '${stepId}' tiene 'isFinal' inválido; debe ser boolean`);
    }

    if (!isPlainObject(config)) {
      throw new Error(`El step '${stepId}' debe tener 'config' como objeto`);
    }

    if (stepType === "python-script") {
      validatePythonScriptConfig(config, stepId);
    }

    if (stepType === "db-save") {
      validateDbSaveConfig(config, stepId);
    }
  }
}