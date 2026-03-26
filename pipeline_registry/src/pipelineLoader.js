import fs from "fs";
import path from "path";
import { pipelinesStore } from "./store/pipelinesStore.js";
import crypto from "crypto";
import { loadPersistentStore, savePersistentStore, syncMemoryStore } from "./store/persistence.js";
import { validatePipelineDefinition } from "./validation.js";
function computeHash(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

const PIPELINES_DIR = path.resolve("src/pipelines");

function loadPipelineFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const sourceHash = computeHash(raw);
  try {
    validatePipelineDefinition(data);
  } catch (err) {
    const fileName = path.basename(filePath);
    const pipelineName = data?.pipeline ?? path.basename(filePath, ".json");
    throw new Error(`[${fileName} | pipeline=${pipelineName}] ${err.message}`);
  }

  const { pipeline, project, steps } = data;

  if (!pipelinesStore.pipelines[pipeline]) {
    pipelinesStore.pipelines[pipeline] = {
      versions: {},
      currentVersion: -1
    };
  }

  const entry = pipelinesStore.pipelines[pipeline];
  const currentVersion = entry.currentVersion;
  const currentData = currentVersion >= 0 ? entry.versions[currentVersion] : null;

  if (currentData && currentData.sourceHash === sourceHash) {
    pipelinesStore.projectRegistry[project] = {
      pipeline,
      version: currentVersion
    };
    savePersistentStore({
      pipelines: pipelinesStore.pipelines,
      projectRegistry: pipelinesStore.projectRegistry
    });

    return { pipeline, changed: false, version: currentVersion };
  } 

  const newVersion = currentVersion >= 0 ? currentVersion + 1 : 0;

  const pipelineData = {
    name: pipeline,
    project,
    version: newVersion,
    createdAt: new Date().toISOString(),
    sourceHash,
    steps
  };
  entry.versions[newVersion] = pipelineData;
  entry.currentVersion = newVersion;

  pipelinesStore.projectRegistry[project] = {
    pipeline,
    version: newVersion
  };

  savePersistentStore({
    pipelines: pipelinesStore.pipelines,
    projectRegistry: pipelinesStore.projectRegistry
  });
  return { pipeline, changed: true, version: newVersion };
}

export function loadAllPipelines() {
  syncMemoryStore();

  const files = fs.readdirSync(PIPELINES_DIR)
    .filter(f => f.endsWith(".json"));

  const results = files.map(file => {
    const filePath = path.join(PIPELINES_DIR, file);

    try {
      const result = loadPipelineFile(filePath);
      return {
        file,
        pipeline: result.pipeline ?? path.basename(file, ".json"),
        changed: result.changed,
        version: result.version,
        ok: true
      };
    } catch (err) {
      return {
        file,
        pipeline: path.basename(file, ".json"),
        ok: false,
        error: err.message
      };
    }
  });

  return results;
}

export function reloadPipeline(pipelineName) {
  syncMemoryStore();
  const filePath = path.join(PIPELINES_DIR, `${pipelineName}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error("Pipeline JSON no encontrado");
  }

  return loadPipelineFile(filePath);
}
