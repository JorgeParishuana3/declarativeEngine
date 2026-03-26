import fs from "fs";
import path from "path";
import { pipelinesStore } from "./pipelinesStore.js";

const STORE_FILE = process.env.PIPELINE_DB_PATH || "/data/pipelines.db.json";

const EMPTY_STORE = {
  pipelines: {},
  projectRegistry: {}
};

export function loadPersistentStore() {
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(EMPTY_STORE, null, 2),
      "utf-8"
    );
    return structuredClone(EMPTY_STORE);
  }

  const raw = fs.readFileSync(STORE_FILE, "utf-8");

  if (!raw.trim()) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(EMPTY_STORE, null, 2),
      "utf-8"
    );
    return structuredClone(EMPTY_STORE);
  }

  const parsed = JSON.parse(raw);

  return {
    pipelines: parsed.pipelines ?? {},
    projectRegistry: parsed.projectRegistry ?? {}
  };
}

export function savePersistentStore(data) {
  const normalized = {
    pipelines: data?.pipelines ?? {},
    projectRegistry: data?.projectRegistry ?? {}
  };

  fs.writeFileSync(
    STORE_FILE,
    JSON.stringify(normalized, null, 2),
    "utf-8"
  );
}

export function syncMemoryStore() {
  const persisted = loadPersistentStore();

  pipelinesStore.pipelines = persisted.pipelines;
  pipelinesStore.projectRegistry = persisted.projectRegistry;

  return pipelinesStore;
}