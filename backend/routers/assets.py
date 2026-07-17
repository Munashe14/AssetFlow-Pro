from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..oauth2 import get_current_user
from ..permissions import admin_only, storekeeper_or_admin, authenticated_user
from ..services.barcode_service import BarcodeService
from ..services.warranty_service import warranty_status
from ..services.depreciation_service import straight_line_depreciation

router = APIRouter()

@router.post("/", response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    salvage_value = asset.salvage_value if asset.salvage_value is not None else int(asset.purchase_cost * 0.1)
    useful_life_years = asset.useful_life_years if asset.useful_life_years is not None else 5
    annual_depreciation = int(straight_line_depreciation(asset.purchase_cost, salvage_value, useful_life_years))

    db_asset = models.Asset(
        asset_name=asset.asset_name,
        asset_tag=asset.asset_tag,
        purchase_cost=asset.purchase_cost,
        location=asset.location,
        purchase_date=asset.purchase_date,
        warranty_expiration_date=asset.warranty_expiration_date,
        salvage_value=salvage_value,
        useful_life_years=useful_life_years,
        annual_depreciation=annual_depreciation,
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

# the following endpoints are for demonstration purposes and can be moved to the assets router
@router.get("/", response_model=list[schemas.Asset])
def read_assets(db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    return db.query(models.Asset).all()

@router.get("/{asset_id}", response_model=schemas.Asset)
def read_asset(asset_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/{asset_id}/generate-qr")
def generate_asset_qr_code(asset_id: int, db: Session = Depends(get_db), current_user: dict = Depends(storekeeper_or_admin)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    filename = BarcodeService.generate_asset_qr_code(
        asset_id=asset.id,
        asset_tag=asset.asset_tag,
        asset_name=asset.asset_name,
    )
    asset.qr_code_path = filename
    db.commit()
    db.refresh(asset)
    return {"qr_code_path": filename}

@router.post("/{asset_id}/generate-barcode")
def generate_asset_barcode(asset_id: int, db: Session = Depends(get_db), current_user: dict = Depends(storekeeper_or_admin)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    filename = BarcodeService.generate_barcode(
        asset_id=asset.id,
        asset_tag=asset.asset_tag,
    )
    asset.barcode_path = filename
    db.commit()
    db.refresh(asset)
    return {"barcode_path": filename}

@router.put("/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: int, asset_update: schemas.AssetCreate, db: Session = Depends(get_db), current_user: dict= Depends(storekeeper_or_admin)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset.asset_name = asset_update.asset_name
    asset.asset_tag = asset_update.asset_tag
    asset.purchase_cost = asset_update.purchase_cost
    asset.location = asset_update.location
    asset.purchase_date = asset_update.purchase_date
    asset.warranty_expiration_date = asset_update.warranty_expiration_date
    asset.salvage_value = asset_update.salvage_value if asset_update.salvage_value is not None else int(asset_update.purchase_cost * 0.1)
    asset.useful_life_years = asset_update.useful_life_years if asset_update.useful_life_years is not None else 5
    asset.annual_depreciation = int(straight_line_depreciation(asset.purchase_cost, asset.salvage_value, asset.useful_life_years))

    db.commit()
    db.refresh(asset)
    return asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    db.delete(asset)
    db.commit()
    return {"detail": "Asset deleted"}

@router.post("/{asset_id}/dispose", response_model=schemas.DisposalResponse)
def dispose_asset(asset_id: int, disposal: schemas.DisposalCreate, db: Session = Depends(get_db), current_user: dict = Depends(storekeeper_or_admin)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset.status = "disposed"
    db_disposal = models.AssetDisposal(
        asset_id=asset_id,
        disposal_date=disposal.disposal_date,
        disposal_method=disposal.disposal_method,
        description=disposal.reason or "",
        approved_by=disposal.approved_by or current_user.get("username", "system"),
    )
    db.add(db_disposal)
    db.commit()
    db.refresh(db_disposal)
    return db_disposal

@router.get("/{asset_id}/warranty")
def get_asset_warranty(asset_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    warranty_info = warranty_status(asset.purchase_date, 1)
    return {"asset_id": asset_id, "warranty_status": warranty_info}

@router.get("/{asset_id}/depreciation")
def get_asset_depreciation(asset_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.purchase_cost is None:
        raise HTTPException(status_code=400, detail="Asset purchase cost is required for depreciation calculation")

    salvage_value = asset.salvage_value if asset.salvage_value is not None else int(asset.purchase_cost * 0.1)
    useful_life = asset.useful_life_years if asset.useful_life_years is not None else 5
    depreciation_amount = straight_line_depreciation(asset.purchase_cost, salvage_value, useful_life)
    return {
        "asset_id": asset_id,
        "purchase_cost": asset.purchase_cost,
        "salvage_value": salvage_value,
        "useful_life_years": useful_life,
        "annual_depreciation": depreciation_amount,
    }

@router.get("/{asset_id}/history", response_model=list[schemas.Checkout])
def get_asset_history(asset_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authenticated_user)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    checkouts = db.query(models.Checkout).filter(models.Checkout.asset_id == asset_id).all()
    return checkouts

