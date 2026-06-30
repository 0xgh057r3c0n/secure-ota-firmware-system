import shutil
import os

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends
from fastapi import Form
from fastapi import Request

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.firmware import Firmware
from app.services.audit_service import create_audit_log, get_actor
from app.services.hash_service import calculate_sha256
from app.services.signing_service import sign_firmware
from app.utils.version import generate_release_version

router = APIRouter(
    tags=["firmware"]
)


@router.post("/upload")
async def upload_firmware(
    request: Request,
    version: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    storage_dir = "firmware_storage"
    os.makedirs(storage_dir, exist_ok=True)

    file_path = os.path.join(storage_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    release_version = version if version else generate_release_version()
    if version and version.count(".") == 1:
        release_version = generate_release_version(version)

    hash_value = calculate_sha256(
        file_path
    )

    signature = sign_firmware(
        file_path
    )

    firmware = Firmware(
        version=release_version,
        hash_value=hash_value,
        signature_path=signature,
        firmware_path=file_path
    )

    db.add(firmware)
    db.commit()
    db.refresh(firmware)

    create_audit_log(
        db,
        action="Firmware uploaded",
        actor=get_actor(request),
        details=f"filename={file.filename}, version={release_version}, hash={hash_value}"
    )

    return {
        "id": firmware.id,
        "version": release_version,
        "hash": hash_value,
        "signature": signature
    }


@router.get("/latest")
def latest_firmware(
    db: Session = Depends(get_db)
):

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
            "No firmware found"
        }

    return {
        "version":
        latest.version,

        "hash":
        latest.hash_value,

        "signature":
        latest.signature_path,

        "firmware":
        latest.firmware_path
    }


@router.get("/all")
def all_firmware(
    db: Session = Depends(get_db)
):

    rows = (
        db.query(Firmware)
        .order_by(
            Firmware.id.desc()
        )
        .all()
    )

    return rows
