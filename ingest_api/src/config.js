import dotenv from "dotenv";
dotenv.config();

export const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";
export const PORT         = process.env.PORT || 3000;
