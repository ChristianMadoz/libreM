from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import uuid
import logging
from auth import get_session_user, exchange_session_id
from config import settings
from fastapi import APIRouter

app = FastAPI(title="LibreM API")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

@api_router.get("/test")
def test():
    return {"status": "ok", "message": "Original-like setup working"}

app.include_router(api_router)

@app.get("/{path:path}")
def catch_all(path: str):
    return {"path": path, "message": "hello from catch all"}