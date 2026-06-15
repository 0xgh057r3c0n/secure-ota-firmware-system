from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True)

    device_id = Column(String, unique=True)

    current_version = Column(String)

    last_seen = Column(
        DateTime,
        default=datetime.utcnow
    )

    status = Column(String, default="online")
