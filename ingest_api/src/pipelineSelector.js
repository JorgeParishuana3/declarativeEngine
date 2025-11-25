export function selectPipeline(orionData) {
    const type = orionData.type;

    // Simple routing
    // Esta parte es un Mock.
    // Se supone que el servicio pregunta a otro por el pipeline para el tipo de dato. 
    // (Sera otro api rest, aún no implementado)
    if (type === "AirSensor") return { pipeline: "smart_city", version: "v1" };
    if (type === "ParkingMeter") return { pipeline: "parking", version: "v2" };

    return { pipeline: "default_pipeline", version: "v1" };
}
