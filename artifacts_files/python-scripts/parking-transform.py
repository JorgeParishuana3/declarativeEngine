import math

def process(data: dict, params: dict | None = None) -> dict:

    spots = data.get("parking_spots", [])

    state = "".join("1" if s["occupied"] else "0" for s in spots)
    ids = [s["spot_id"] for s in spots]
    n = len(state)

    layout_mode = (params or {}).get("layout_mode", "auto")

    if layout_mode == "grid":
        layout = [2, math.ceil(n / 2)]
    else:
        layout = [1, n]

    return {
        "cam_id": data.get("orion_id"),
        "spots_state": state,
        "ids": ids,
        "layout": layout,
        "timestamp": data.get("timestamp")
    }