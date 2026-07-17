from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..oauth2 import get_current_user
from ..permissions import authenticated_user

router = APIRouter()

# Disposal endpoints (to be implemented)
@router.get("/")
def list_disposals(db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    """List all disposals"""

    disposed_assets = db.query(models.Asset).filter(models.Asset.status == "disposed").all()
    return disposed_assets
