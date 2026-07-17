from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import CheckoutAsset, ReturnAsset
from ..services.checkout_service import CheckoutService
from ..import models

router = APIRouter(prefix="/checkouts", tags=["Checkouts"])


@router.post("/checkout/{asset_id}")
def checkout_asset(asset_id: int, checkout_data: CheckoutAsset, db: Session = Depends(get_db)):
    try:
        return CheckoutService.checkout_asset(
            db,
            asset_id,
            checkout_data.employee_id,
            checkout_data.due_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@router.get("/")
def get_checkouts(db: Session = Depends(get_db)):
    return db.query(models.AssetTransaction).all()


@router.get("/active")
def get_active_checkouts(db: Session = Depends(get_db)):
    return (
        db.query(models.Checkout)
        .filter(models.Checkout.return_date == None)  # noqa: E711
        .all()
    )


@router.post("/return/{transaction_id}")
def return_asset(transaction_id: int, return_data: ReturnAsset, db: Session = Depends(get_db)):
    try:
        return CheckoutService.return_asset(db, transaction_id, return_data.notes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/return/asset/{asset_id}")
def return_asset_by_asset_id(asset_id: int, return_data: ReturnAsset, db: Session = Depends(get_db)):
    transaction = (
        db.query(models.AssetTransaction)
        .filter(models.AssetTransaction.asset_id == asset_id, models.AssetTransaction.status == "checked_out")
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=400, detail="No active checkout transaction found for this asset")
    try:
        return CheckoutService.return_asset(db, transaction.id, return_data.notes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
