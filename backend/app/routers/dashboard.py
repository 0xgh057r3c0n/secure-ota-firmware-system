from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.device import Device
from app.models.firmware import Firmware

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "devices": db.query(Device).count(),
        "firmwares": db.query(Firmware).count()
    }
