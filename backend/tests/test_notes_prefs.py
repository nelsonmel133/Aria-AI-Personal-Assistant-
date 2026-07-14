import pytest


# ── Notes ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_note(auth_client):
    res = await auth_client.post(
        "/notes", json={"title": "My note", "body": "Content here", "tags": ["work"]}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "My note"
    assert data["tags"] == ["work"]


@pytest.mark.asyncio
async def test_list_notes(auth_client):
    await auth_client.post("/notes", json={"body": "Note one"})
    await auth_client.post("/notes", json={"body": "Note two"})
    res = await auth_client.get("/notes")
    assert res.status_code == 200
    assert len(res.json()) >= 2


@pytest.mark.asyncio
async def test_note_without_title(auth_client):
    res = await auth_client.post("/notes", json={"body": "Untitled note"})
    assert res.status_code == 200
    assert res.json()["title"] is None


# ── Preferences ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_preferences(auth_client):
    res = await auth_client.get("/preferences")
    assert res.status_code == 200
    data = res.json()
    assert data["theme"] == "dusk"
    assert data["assistant_name"] == "Aria"


@pytest.mark.asyncio
async def test_update_preferences(auth_client):
    res = await auth_client.patch(
        "/preferences",
        json={"theme": "reef", "assistant_name": "Nova", "voice_enabled": False},
    )
    assert res.status_code == 200

    prefs = await auth_client.get("/preferences")
    data = prefs.json()
    assert data["theme"] == "reef"
    assert data["assistant_name"] == "Nova"
    assert data["voice_enabled"] is False
