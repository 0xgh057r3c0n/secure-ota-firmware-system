from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.device import Device
from app.models.firmware import Firmware

from app.utils.version import version_tuple

router = APIRouter(
    tags=["device"]
)


@router.get("/check")
def check():

    return {
        "message":
        "firmware check endpoint"
    }


@router.post("/register")
def register_device(
    device_id: str,
    current_version: str,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(Device)
        .filter(
            Device.device_id == device_id
        )
        .first()
    )

    if existing:
        return {
            "message":
            "device already exists"
        }

    device = Device(
        device_id=device_id,
        current_version=current_version
    )

    db.add(device)
    db.commit()

    return {
        "message":
        "device registered"
    }


@router.post("/check-update")
def check_update(
    device_id: str,
    db: Session = Depends(get_db)
):

    device = (
        db.query(Device)
        .filter(
            Device.device_id == device_id
        )
        .first()
    )

    if not device:
        return {
            "message":
            "device not found"
        }

    latest = (
        db.query(Firmware)
        .order_by(
            Firmware.id.desc()
        )
        .first()
    )

    if not latest:
        return {
            "message":
            "no firmware available"
        }

    if version_tuple(
        latest.version
    ) <= version_tuple(
        device.current_version
    ):

        return {
            "update": False,
            "message":
            "rollback blocked"
        }

    return {
        "update": True,
        "version":
        latest.version,
        "firmware":
        latest.firmware_path,
        "signature":
        latest.signature_path,
        "hash":
        latest.hash_value
    }
