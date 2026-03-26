import requests


class PipelineRegistryClient:
    def __init__(self, base_url="http://pipeline-registry:3002"):
        self.base_url = base_url.rstrip("/")

    def get_step(self, pipeline, version, step_id):
        url = f"{self.base_url}/pipeline/{pipeline}/{version}/{step_id}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()

    def get_next_step(self, pipeline, version, step_id):
        url = f"{self.base_url}/pipeline/{pipeline}/{version}/{step_id}/next"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()