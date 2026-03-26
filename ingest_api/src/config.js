import dotenv from "dotenv";
dotenv.config();

// Lectura de variables de entorno
export const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";
export const PORT         = process.env.PORT || 3000;
export const PIPELINE_API_URL = process.env.PIPELINE_API_URL || "http://pipeline-registry:3002";