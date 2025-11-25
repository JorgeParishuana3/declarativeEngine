export function selectPipeline(orionData) {
  const type = orionData.type;

  // Simple routing (MVP)
  if (type === "AirSensor") return { pipeline: "smart_city", version: "v1" };
  if (type === "ParkingMeter") return { pipeline: "parking", version: "v2" };

  return { pipeline: "default_pipeline", version: "v1" };
}
