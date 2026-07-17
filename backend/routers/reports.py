from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..permissions import authenticated_user, require_role
from datetime import date, timedelta
from fastapi.responses import FileResponse

from ..services.report_service import ReportService

router = APIRouter(
    tags=["reports"],
    prefix="/reports"
)


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    return ReportService.dashboard_stats(db)


@router.get("/maintenance-costs")
def maintenance_costs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    total_cost = db.query(
        func.sum(models.RepairHistory.repair_cost)
    ).scalar()

    return {
        "total_maintenance_cost": total_cost or 0
    }

@router.get("/repair-costs")
def repairs_costs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    total_cost = db.query(
        func.sum(models.RepairHistory.repair_cost)
    ).scalar()

    return {
        "total_repairs_cost": total_cost or 0
    }

@router.get("/due-return-reminders")
def due_return_reminders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    today = date.today()
    upcoming = today + timedelta(days=7) # asset due within 7 days

    due_assets = db.query(models.Asset).filter(
        models.Asset.expected_return_date >= today,
        models.Asset.expected_return_date <= upcoming,
        models.Asset.status == "assigned"
    ).all()

    return {
        "due_return_reminders": [
            {
                "asset_id": a.id,
                "asset_name": a.name,
                "expected_return_date": a.expected_return_date,
                "status": a.status
            }

            for a in due_assets
        ]
    }

@router.get("/warranty-expiry-alerts")
def warranty_expiry_alerts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    today = date.today()
    upcoming = today + timedelta(days=30) #asset expiring within 30 days

    expiring_assets = db.query(models.Asset).filter(
        models.Asset.warranty_expiration_date >= today,
        models.Asset.warranty_expiration_date <= upcoming
    ).all()


    return {
        "warranty_expiry_alerts": [
            {
                "asset_id": a.id,
                "asset_name": a.asset_name,
                "asset_tag": a.asset_tag,
                "warranty_expiration_date": a.warranty_expiration_date
            }
            for a in expiring_assets
        ]
    }

@router.get("/low-inventory-alerts")
def low_inventory_alerts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):

    LOW_STOCK_THRESHOLD = 5

    total_assets = db.query(func.count(models.Asset.id)).scalar()
   

    return {
        "low_inventory_alerts": [
            {
                "total_assets": total_assets,
                "threshold": LOW_STOCK_THRESHOLD,
                "alert": total_assets <= LOW_STOCK_THRESHOLD,
                "message": (
                    f"Low inventory! Only {total_assets} assets in the system."
                    if total_assets <= LOW_STOCK_THRESHOLD
                    else f"Inventory is sufficient. {total_assets} in the system."
                )
            }
        ]
    }

@router.get("/allocations")
def asset_allocations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    return ReportService.asset_allocation_report(db)


@router.get("/transactions")
def transaction_report(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    return ReportService.transaction_report(db)


@router.get("/maintenance")
def maintenance_report(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    return ReportService.maintenance_report(db)

@router.get("/categories")
def categories_report(
    db: Session = Depends(get_db),
    current_user: dict = Depends(authenticated_user)
):
    return ReportService.category_report(db)

@router.get("/export/excel")
def export_excel(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "manager"))
):

    file_path = ReportService.export_assets_excel(db)

    return FileResponse(
        path=file_path,
        filename="assets_report.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/export/pdf")
def export_pdf(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "manager"))
):
    file_path = ReportService.export_assets_pdf(db)

    return FileResponse(
        path=file_path,
        filename="asset_report.pdf",
        media_type="application/pdf"
    )
