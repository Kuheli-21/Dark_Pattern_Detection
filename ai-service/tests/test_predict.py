import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.config import settings

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_predict_happy_path(client):
    payload = {
        "snippets": [
            "Only 2 left in stock!",
            "Accept terms and subscribe"
        ]
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 2
    for res in data["results"]:
        assert "snippet" in res
        assert "isDarkPattern" in res
        assert "patternType" in res
        assert "confidence" in res

def test_predict_empty_snippets(client):
    payload = {
        "snippets": [
            "",
            "   ",
        ]
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 2
    for res in data["results"]:
        assert res["isDarkPattern"] is False
        assert res["patternType"] is None
        assert res["confidence"] is None

def test_predict_validation_max_batch_size(client):
    large_list = ["test snippet"] * (settings.max_batch_size + 1)
    payload = {"snippets": large_list}
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data

def test_predict_validation_snippet_length(client):
    oversized_snippet = "a" * (settings.max_snippet_length + 1)
    payload = {"snippets": [oversized_snippet]}
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

