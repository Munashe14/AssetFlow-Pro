from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    # pbkdf2_sha256 supports long passwords without bcrypt's 72-byte limit
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def log_audit_action(db, user_id=None, user_name=None, action="", resource_type="", resource_id=None, details=None, ip_address=None):
    from . import models

    entry = models.AuditLog(
        user_id=user_id,
        user_name=user_name,
        action=str(action or "").strip(),
        resource_type=str(resource_type or "").strip(),
        resource_id=resource_id,
        details=str(details) if details is not None else None,
        ip_address=ip_address,
        created_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    return entry
