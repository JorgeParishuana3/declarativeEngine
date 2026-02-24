export function selectPipeline(orionData) {
    const type = orionData.type;

    console.log("Intentando agregar pipeline: " + JSON.stringify(orionData, null, 2));

    // Simple routing
    // Esta parte es un Mock.
    // Se supone que el servicio pregunta a otro por el pipeline para el tipo de dato. 
    // (Sera otro api rest, aún no implementado)
    if (type === "lora_wan") return { pipeline: "lorawan", next: "workerpython", version: "v1", config: {"script": "calidadAire-decode", "params": {"sample":"sample2"}}};
    if (type === "smart_parking") return { pipeline: "parking", next: "workerpython", version: "v2", config: {"script": "parking-transform"} };
    if (type === "cuenta_personas") return { pipeline: "cuenta_personas", next: "workerpython", version: "v2", config: {"script": "cuentaP"}  };

    return { pipeline: "default_pipeline", next: "workerpython", version: "v1" };
}
