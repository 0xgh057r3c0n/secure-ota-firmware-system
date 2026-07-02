from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, SessionLocal, engine
from app.models.user import User
from app.routers import auth
from app.routers import device
from app.routers import firmware
from app.routers import dashboard
from app.routers import logs
from app.utils.security import hash_password

app = FastAPI(
    title="Firmware Management API",
    version="1.0.0"
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["referrer-policy"] = "strict-origin-when-cross-origin"
    response.headers["x-frame-options"] = "DENY"
    response.headers["permissions-policy"] = "geolocation=(), microphone=()"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://192.168.29.95:3001"
    ],
    allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?|null)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add(
                User(
                    username="admin",
                    email="admin@example.com",
                    password_hash=hash_password("admin"),
                    role="admin"
                )
            )
            db.commit()
    finally:
        db.close()

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"]
)

app.include_router(
    device.router,
    prefix="/device",
    tags=["Device"]
)

app.include_router(
    firmware.router,
    prefix="/firmware",
    tags=["Firmware"]
)

app.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    logs.router,
    prefix="/logs",
    tags=["Logs"]
)

@app.get("/")
def root():
    return {
        "message": "Firmware Management API Running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
