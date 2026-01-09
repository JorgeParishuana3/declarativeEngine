import fs from "fs";
import path from "path";
import { pipelinesStore } from "./store/pipelinesStore.js";

const PIPELINES_DIR = path.resolve("src/pipelines");

function loadPipelineFile(filePath, incrementVersion = false) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  const { pipeline, project, steps } = data;

  if (!pipelinesStore.pipelines[pipeline]) {
    pipelinesStore.pipelines[pipeline] = {
      versions: {},
      currentVersion: -1
    };
  }

  const entry = pipelinesStore.pipelines[pipeline];
  const newVersion = incrementVersion
    ? entry.currentVersion + 1
    : entry.currentVersion >= 0
      ? entry.currentVersion
      : 0;

  const pipelineData = {
    name: pipeline,
    project,
    version: newVersion,
    createdAt: new Date().toISOString(),
    steps
  };

  entry.versions[newVersion] = pipelineData;
  entry.currentVersion = newVersion;

  pipelinesStore.projectRegistry[project] = {
    pipeline,
    version: newVersion
  };
}

export function loadAllPipelines() {
  const files = fs.readdirSync(PIPELINES_DIR)
    .filter(f => f.endsWith(".json"));

  files.forEach(file => {
    loadPipelineFile(path.join(PIPELINES_DIR, file), false);
  });
}

export function reloadPipeline(pipelineName) {
  const filePath = path.join(PIPELINES_DIR, `${pipelineName}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error("Pipeline JSON no encontrado");
  }

  loadPipelineFile(filePath, true);
}
