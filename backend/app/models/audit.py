from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)

    action = Column(String)

    actor = Column(String)

    details = Column(String)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )
