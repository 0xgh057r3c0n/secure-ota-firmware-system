from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import Boolean

from datetime import datetime

from app.database import Base


class Firmware(Base):
    __tablename__ = "firmwares"

    id = Column(Integer, primary_key=True)

    version = Column(String, nullable=False)

    hash_value = Column(String, nullable=False)

    signature_path = Column(String, nullable=False)

    firmware_path = Column(String, nullable=False)

    published = Column(
        Boolean,
        default=False
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )
