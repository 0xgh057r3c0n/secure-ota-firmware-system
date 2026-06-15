from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database import Base


class Firmware(Base):
    __tablename__ = "firmwares"

    id = Column(Integer, primary_key=True)

    version = Column(String)

    hash_value = Column(String)

    signature_path = Column(String)

    firmware_path = Column(String)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )
