import pytest


@pytest.mark.asyncio
async def test_create_task(auth_client):
    res = await auth_client.post("/tasks", json={"title": "Buy groceries"})
    assert res.status_code == 200
    assert res.json()["title"] == "Buy groceries"


@pytest.mark.asyncio
async def test_list_tasks(auth_client):
    await auth_client.post("/tasks", json={"title": "Task A"})
    await auth_client.post("/tasks", json={"title": "Task B"})
    res = await auth_client.get("/tasks")
    assert res.status_code == 200
    assert len(res.json()) >= 2


@pytest.mark.asyncio
async def test_update_task_status(auth_client):
    create = await auth_client.post("/tasks", json={"title": "Update me"})
    task_id = create.json()["id"]

    res = await auth_client.patch(f"/tasks/{task_id}", json={"status": "done"})
    assert res.status_code == 200
    assert res.json()["ok"] is True


@pytest.mark.asyncio
async def test_filter_tasks_by_status(auth_client):
    await auth_client.post("/tasks", json={"title": "Open task"})
    create = await auth_client.post("/tasks", json={"title": "Done task"})
    task_id = create.json()["id"]
    await auth_client.patch(f"/tasks/{task_id}", json={"status": "done"})

    res = await auth_client.get("/tasks?status=done")
    assert res.status_code == 200
    titles = [t["title"] for t in res.json()]
    assert "Done task" in titles
    assert "Open task" not in titles


@pytest.mark.asyncio
async def test_delete_task(auth_client):
    create = await auth_client.post("/tasks", json={"title": "Delete me"})
    task_id = create.json()["id"]

    res = await auth_client.delete(f"/tasks/{task_id}")
    assert res.status_code == 200

    remaining = await auth_client.get("/tasks")
    ids = [t["id"] for t in remaining.json()]
    assert task_id not in ids


@pytest.mark.asyncio
async def test_task_priority_default(auth_client):
    res = await auth_client.post("/tasks", json={"title": "Default priority"})
    assert res.json()["priority"] == "normal"
