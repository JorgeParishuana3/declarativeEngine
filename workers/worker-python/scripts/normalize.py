def process(data, meta):
    return {
        "temperature": float(data["temperature"]),
        "humidity": int(data["humidity"]),
        "deviceId": meta["entityId"],
        "normalized": True
    }
