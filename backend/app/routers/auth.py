import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        text("select id from users where email = :email"), {"email": payload.email}
    )
    if existing.first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    await db.execute(
        text(
            """
            insert into users (id, email, password_hash, display_name)
            values (:id, :email, :pw, :name)
            """
        ),
        {
            "id": user_id,
            "email": payload.email,
            "pw": hash_password(payload.password),
            "name": payload.display_name,
        },
    )
    await db.execute(
        text("insert into user_preferences (user_id) values (:id)"), {"id": user_id}
    )
    await db.commit()

    token = create_access_token(user_id)
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "email": payload.email, "display_name": payload.display_name},
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("select id, password_hash, display_name from users where email = :email"),
        {"email": payload.email},
    )
    row = result.first()
    if not row or not verify_password(payload.password, row.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(row.id))
    return TokenResponse(
        access_token=token,
        user={"id": str(row.id), "email": payload.email, "display_name": row.display_name},
    )
