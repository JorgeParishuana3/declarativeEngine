import { pipelinesStore } from "../store/pipelinesStore.js";
import { savePersistentStore } from "../store/persistence.js";
import fs from "fs";
import path from "path";


export default async function debugRoutes(fastify) {
    fastify.get("/debug/memory", async (request, reply) => {
    return {
        pipelines: pipelinesStore.pipelines,
        projectRegistry: pipelinesStore.projectRegistry
    };
    });

    const STORE_FILE = process.env.PIPELINE_DB_PATH || "/data/pipelines.db.json";


    fastify.get("/debug/persistent", async (request, reply) => {
    if (!fs.existsSync(STORE_FILE)) {
        return reply.code(404).send({
        error: "Archivo de persistencia no encontrado"
        });
    }

    const raw = fs.readFileSync(STORE_FILE, "utf-8");

    try {
        return JSON.parse(raw);
    } catch (err) {
        return reply.code(500).send({
        error: "Error parseando pipelines.db.json"
        });
    }
    });

    fastify.delete("/reset", async (request, reply) => {
    const { confirm } = request.query;

    if (confirm !== "true") {
        return reply.code(400).send({
        error: "Debes enviar ?confirm=true para ejecutar el reset"
        });
    }

    pipelinesStore.pipelines = {};
    pipelinesStore.projectRegistry = {};
    pipelinesStore.pipelineErrors = {};

    savePersistentStore({
        pipelines: {},
        projectRegistry: {},
        pipelineErrors: {}
    });

    return {
        message: "Estado reseteado correctamente"
    };
    });
}

