from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, utils
from ..database import get_db
from ..permissions import admin_only, storekeeper_or_admin, authenticated_user


router = APIRouter()


def _build_user(user, department_id=None):
    normalized_role = str(user.role or "").strip().lower()
    if normalized_role not in {"admin", "manager", "storekeeper", "employee"}:
        raise HTTPException(status_code=400, detail="Invalid role")

    hashed_password = utils.hash_password(user.password)
    return models.User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role=normalized_role,
        department_id=department_id,
    )


@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = _build_user(user, user.department_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/", response_model=list[schemas.UserOut])
def get_users(db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    return db.query(models.User).all()


@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    db_user = _build_user(user, user.department_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(storekeeper_or_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = user_update.username
    user.email = user_update.email
    user.password = utils.hash_password(user_update.password)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=schemas.Message)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}