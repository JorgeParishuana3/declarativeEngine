def process(data: dict, params: dict | None = None) -> dict:
    return {
        "cam_id": data.get("orion_id"),
        "aforo": data.get("aforo"),
        "timestamp": data.get("timestamp")
    }