from pydantic import BaseModel

class DashboardStats(BaseModel):
    devices: int
    firmwares: int
