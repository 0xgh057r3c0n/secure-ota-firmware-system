from fastapi import APIRouter
from fastapi import Depends
from fastapi import Request

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.device import Device
from app.models.firmware import Firmware
from app.services.audit_service import create_audit_log, get_actor

from app.utils.version import is_newer_version

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
    request: Request,
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

    create_audit_log(
        db,
        action="Device registered",
        actor=get_actor(request),
        details=f"device_id={device_id}, version={current_version}"
    )

    return {
        "message":
        "device registered"
    }


@router.post("/check-update")
def check_update(
    request: Request,
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

    if not is_newer_version(
        latest.version,
        device.current_version
    ):

        create_audit_log(
            db,
            action="Firmware update check",
            actor=get_actor(request),
            details=f"device_id={device_id}, current_version={device.current_version}, latest_version={latest.version}, update_available=False"
        )

        return {
            "update": False,
            "message":
            "rollback blocked"
        }

    create_audit_log(
        db,
        action="Firmware update check",
        actor=get_actor(request),
        details=f"device_id={device_id}, current_version={device.current_version}, latest_version={latest.version}, update_available=True"
    )

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
