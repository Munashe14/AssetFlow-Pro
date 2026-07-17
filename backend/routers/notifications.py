from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from .. import models, schemas
from ..permissions import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[schemas.NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    notifications = db.query(models.Notification).filter(models.Notification.user_id == current_user["user_id"]).order_by(models.Notification.created_at.desc()).all()
    return notifications

@router.get("/unread", response_model=List[schemas.NotificationOut])
def get_unread_notifications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    unread_notifications = db.query(models.Notification).filter(models.Notification.user_id == current_user["user_id"],
    models.Notification.is_read == False).order_by(models.Notification.created_at.desc().all())
    return unread_notifications

@router.post("/", response_model=models.NotificationOut)
def create_notification(
        data: schemas.NotificationCreate,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)
    ):
        notification = models.Notification(
            **data.dict()
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    notification = db.query(models.NotificationOut).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user["user_id"]
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

        notification.is_read = True
        notification.read_at = datetime.utcnow()

        db.commit()

        return {"message": "Notification marked as read"}

@router.patch("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    all_as_read = db.query(models.NotificationOut).filter(
        models.Notification.user_id == current_user["user_id"],
        models.Notification.is_read == False
    ).update(
        {
            "is_read": True, 
            "read_at": datetime.utcnow()
        }
    )

    db.commit()

    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    notification = db.query(models.NotificationOut).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user["user_id"]
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Not found")

        db.delete(notification)
        db.commit()

        return {"message": "Deleted Successfully"}
