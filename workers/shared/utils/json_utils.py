import json

def safe_parse(body):
    try:
        return json.loads(body)
    except Exception:
        return None
