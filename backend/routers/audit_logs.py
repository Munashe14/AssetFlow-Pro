from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..permissions import admin_only

router = APIRouter()


@router.get("/", response_model=list[schemas.AuditLog])
def list_audit_logs(db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).all()
