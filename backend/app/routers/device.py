from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from fastapi import status

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.device import Device
from app.models.firmware import Firmware
from app.schemas.device import DeviceRegister
from app.services.audit_service import create_audit_log, get_actor

from app.utils.version import is_newer_version

router = APIRouter()


@router.get("/all")
def list_devices(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    devices = (
        db.query(Device)
        .order_by(Device.id.desc())
        .all()
    )

    return [
        {
            "id": device.id,
            "device_id": device.device_id,
            "current_version": device.current_version,
            "status": device.status,
            "last_seen": device.last_seen.isoformat() if device.last_seen else None,
        }
        for device in devices
    ]


@router.get("/check")
def check():

    return {
        "message":
        "firmware check endpoint"
    }


@router.post("/register")
def register_device(
    request: Request,
    device: DeviceRegister,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing = (
        db.query(Device)
        .filter(
            Device.device_id == device.device_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device already exists"
        )

    new_device = Device(
        device_id=device.device_id,
        current_version=device.current_version
    )

    db.add(new_device)
    db.commit()
    db.refresh(new_device)

    create_audit_log(
        db,
        action="Device registered",
        actor=get_actor(request),
        details=f"device_id={device.device_id}, version={device.current_version}"
    )

    return {
        "message": "device registered",
        "device": {
            "id": new_device.id,
            "device_id": new_device.device_id,
            "current_version": new_device.current_version,
            "status": new_device.status,
            "last_seen": new_device.last_seen.isoformat() if new_device.last_seen else None,
        }
    }


@router.post("/check-update")
def check_update(
    request: Request,
    device_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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
