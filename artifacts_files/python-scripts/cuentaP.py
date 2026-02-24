def process(data: dict, params: dict | None = None) -> dict:

    spots = data.get("parking_spots", [])

    return {
        "cam_id": data.get("orion_id"),
        "aforo": data.get("aforo"),
        "timestamp": data.get("timestamp")
    }