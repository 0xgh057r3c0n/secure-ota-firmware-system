import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from jose import jwt

from app.config import settings
from app.main import app


client = TestClient(app)


def test_security_headers_present_on_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"


def test_logs_requires_authentication():
    response = client.get("/logs/")

    assert response.status_code == 401


def test_new_registration_defaults_to_user_role():
    username = "newuser"
    password = "Password123"
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "username": username,
            "password": password,
        },
    )

    assert response.status_code == 200

    login_response = client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )

    payload = jwt.decode(
        login_response.json()["access_token"],
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )

    assert payload["role"] == "user"


def test_non_admin_cannot_access_admin_logs():
    username = "limiteduser"
    password = "Password123"
    client.post(
        "/auth/register",
        json={
            "email": "limiteduser@example.com",
            "username": username,
            "password": password,
        },
    )

    login_response = client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )
    token = login_response.json()["access_token"]

    response = client.get("/logs/", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 403
