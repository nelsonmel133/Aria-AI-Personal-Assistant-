import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    res = await client.post(
        "/auth/register",
        json={"email": "new@aria.dev", "password": "pass1234", "display_name": "New User"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@aria.dev"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {"email": "dup@aria.dev", "password": "pass", "display_name": "Dup"}
    await client.post("/auth/register", json=payload)
    res = await client.post("/auth/register", json=payload)
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post(
        "/auth/register",
        json={"email": "login@aria.dev", "password": "pass1234", "display_name": "Login"},
    )
    res = await client.post(
        "/auth/login",
        json={"email": "login@aria.dev", "password": "pass1234"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/auth/register",
        json={"email": "wrong@aria.dev", "password": "correct", "display_name": "W"},
    )
    res = await client.post(
        "/auth/login", json={"email": "wrong@aria.dev", "password": "incorrect"}
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_requires_token(client):
    res = await client.get("/conversations")
    assert res.status_code == 401
