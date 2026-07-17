from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import MaintenanceRecord
from backend.schemas import MaintenanceRecordCreate, MaintenanceResponse
from backend.permissions import authenticated_user

router = APIRouter(
    tags=["maintenance"]
)

@router.get("/", response_model=list[MaintenanceResponse])
def list_maintenance_records(db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    return db.query(MaintenanceRecord).all()

@router.post("/", response_model=MaintenanceResponse)
def create_maintenance_record(maintenance_data: MaintenanceRecordCreate, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    db_maintenance_record = MaintenanceRecord(**maintenance_data.dict())
    db.add(db_maintenance_record)
    db.commit()
    db.refresh(db_maintenance_record)
    return db_maintenance_record