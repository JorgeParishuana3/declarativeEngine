def process(data: dict, params: dict | None = None) -> dict:
    """
    data: datos que vienen en body["data"]
    params: opcional, viene de body["config"]["params"]

    Devuelve un diccionario con los datos transformados.
    Es decir, el reemplazo de data
    No debe modificar data directamente.
    """