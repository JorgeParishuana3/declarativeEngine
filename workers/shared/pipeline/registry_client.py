import requests
from functools import lru_cache

class PipelineRegistryClient:
    def __init__(self, registry_url):
        self.registry_url = registry_url

    @lru_cache(maxsize=128)
    def load(self, pipeline, version):
        url = f"{self.registry_url}/pipelines/{pipeline}/{version}"
        resp = requests.get(url)
        
        resp.raise_for_status()
        return resp.json()
