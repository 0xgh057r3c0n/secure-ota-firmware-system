from fastapi import FastAPI

from app.database import Base
from app.database import engine

from app.routers import auth
from app.routers import device
from app.routers import firmware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure OTA Platform"
)

app.include_router(
    auth.router
)

app.include_router(
    firmware.router
)

app.include_router(
    device.router
)


@app.get("/")
def root():
    return {
        "message":
        "Secure OTA API Running"
    }
