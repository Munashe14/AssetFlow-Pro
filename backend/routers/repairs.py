from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..permissions import authenticated_user

router = APIRouter()

@router.get("/", response_model=list[schemas.RepairResponse])
def list_repairs(db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    """List all repairs"""
    return db.query(models.RepairHistory).all()

@router.post("/", response_model=schemas.RepairResponse)
def create_repair_record(repair_data: schemas.RepairCreate, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    db_repair = models.RepairHistory(**repair_data.dict())
    db.add(db_repair)
    db.commit()
    db.refresh(db_repair)
    return db_repair
