from pydantic import BaseModel


class DeviceRegister(BaseModel):
    device_id: str
    current_version: str
