from datetime import datetime, timezone

def process(data: dict, params: dict | None = None) -> dict:

    hex_payload = data.get("data")
    timestamp = data.get("timestamp")

    if not hex_payload:
        raise ValueError("Missing hex payload")

    bytes_data = bytes.fromhex(hex_payload)

    if len(bytes_data) < 9:
        raise ValueError("Invalid payload length")

    idb = (bytes_data[0] << 8) | bytes_data[1]
    humedad = (bytes_data[2] << 8) | bytes_data[3]
    temperatura = (bytes_data[4] << 8) | bytes_data[5]
    dioxido_de_carbono = (
        (bytes_data[6] << 16) |
        (bytes_data[7] << 8) |
        bytes_data[8]
    )

    ts_iso = None
    if timestamp:
        ts_iso = datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()

    return {
        "idb": idb - 256,
        "humedad": (humedad / 100) - 296,
        "temperatura": (temperatura / 100) - 296,
        "dioxido_de_carbono": (dioxido_de_carbono / 100) - 65536,
        "timestamp": ts_iso
    }