from datetime import datetime

from ..models import Asset, Employee, AssetTransaction
from .notification_service import NotificationService
from ..import models




class CheckoutService:
    @staticmethod
    def checkout_asset(db, asset_id: int, employee_id: int, due_date: str):
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            raise ValueError("Asset not found")
        if asset.status != "available":
            raise ValueError("Asset is not available for checkout")

        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError("Employee not found")

        # Create a new transaction record
        due_date_value = due_date.isoformat() if hasattr(due_date, "isoformat") else str(due_date)

        transaction = AssetTransaction(
            asset_id=asset_id,
            employee_name=f"{employee.first_name} {employee.last_name}",
            checkout_date=datetime.now().strftime("%Y-%m-%d"),
            due_date=due_date_value,
            status="checked_out"
        )
        db.add(transaction)

        db.flush()

        # Update asset status to checked_out
        asset.status = "checked_out"

        NotificationService.create_notification(
            db=db,
            user_id=employee_id,
            title="Asset Checked Out",
            message=f"{asset.asset_name} has been assigned to {employee.first_name} {employee.last_name}",
            notification_type="info",
            asset_id=asset_id,
            transaction_id=transaction.id
        )
        db.commit()
        db.refresh(transaction)
        return transaction

    @staticmethod
    def return_asset(db, transaction_id: int, notes: str|None = None):
        transaction = db.query(AssetTransaction).filter(AssetTransaction.id == transaction_id).first()
        if not transaction:
            raise ValueError("Transaction not found")
        if transaction.status != "checked_out":
            raise ValueError("Asset is not currently checked out")

        # Update the transaction record with return date and notes
        transaction.return_date = datetime.now().strftime("%Y-%m-%d")
        transaction.status = "returned"
        transaction.notes = notes
        db.commit()

        employee = db.query(models.Employee).filter(
        models.Employee.id == transaction.employee_id).first()

        asset = db.query(Asset).filter(Asset.id == transaction.asset_id).first()
        if asset:
            asset.status = "available"

        NotificationService.create_notification(
            db=db,
            user_id=employee.id,
            title="Asset Returned",
            message=f"{asset.asset_name} has been returned successfully.",
            notification_type="success",
            asset_id=asset.id,
            transaction_id=transaction.id
        )

        db.commit()
        return transaction