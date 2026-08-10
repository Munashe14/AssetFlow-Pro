from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..permissions import authenticated_user

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/", response_model=list[schemas.Employee])
def get_employees(db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    return db.query(models.Employee).all()


@router.get("/me", response_model=schemas.Employee)
def get_current_employee(db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    user = db.query(models.User).filter(models.User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Signed-in user not found")

    employee = db.query(models.Employee).filter(models.Employee.email == user.email).first()
    if employee:
        return employee

    names = (user.username or "User").strip().split()
    first_name = names[0] if names else "User"
    last_name = " ".join(names[1:]) if len(names) > 1 else "User"

    fallback_employee = models.Employee(
        employee_number=f"USER-{user.id}",
        first_name=first_name,
        last_name=last_name,
        department="General",
        email=user.email,
    )
    db.add(fallback_employee)
    db.commit()
    db.refresh(fallback_employee)
    return fallback_employee


@router.post("/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    existing = db.query(models.Employee).filter(models.Employee.email == employee.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee already exists")

    db_employee = models.Employee(
        employee_number=employee.employee_number,
        first_name=employee.first_name,
        last_name=employee.last_name,
        department=employee.department,
        email=employee.email,
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee
