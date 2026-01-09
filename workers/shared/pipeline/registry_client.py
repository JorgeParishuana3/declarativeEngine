import requests
from functools import lru_cache

class PipelineRegistryClient:
    def __init__(self, registry_url):
        self.registry_url = registry_url

    @lru_cache(maxsize=128)
    def loadNextStep(self, pipeline, version, stepId):
        url = f"{self.registry_url}/pipeline/{pipeline}/{version}/{stepId}/next"
        resp = requests.get(url)
        
        resp.raise_for_status()
        return resp.json()
