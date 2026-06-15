import shutil

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

from app.services.hash_service import calculate_sha256
from app.services.signing_service import sign_firmware

router = APIRouter(
    prefix="/firmware",
    tags=["firmware"]
)


@router.post("/upload")
async def upload_firmware(
    version: str,
    file: UploadFile = File(...)
):

    file_path = (
        f"firmware_storage/{file.filename}"
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    hash_value = calculate_sha256(
        file_path
    )

    signature = sign_firmware(
        file_path
    )

    return {
        "version": version,
        "hash": hash_value,
        "signature": signature
    }
