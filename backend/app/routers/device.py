from fastapi import APIRouter

router = APIRouter(
    prefix="/device",
    tags=["device"]
)


@router.get("/check")
def check():

    return {
        "message":
        "firmware check endpoint"
    }
