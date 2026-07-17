from collections import Counter
from datetime import datetime, date, timedelta
import os
import re
import tempfile

from sqlalchemy import func
from openpyxl import Workbook
from fastapi.responses import FileResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

from .. import models


class ReportService:

    @staticmethod
    def _normalize_status(status):
        if not status:
            return "available"

        status_text = re.sub(r"[\s_-]+", " ", str(status).strip().lower())
        if status_text in {"available", "ready", "in stock", "active"}:
            return "available"
        if status_text in {"checked out", "checked out", "assigned", "borrowed", "out", "checked out"}:
            return "checked out"
        if status_text in {"maintenance", "under maintenance", "in maintenance", "service"}:
            return "maintenance"
        if status_text in {"retired", "disposed", "obsolete", "archived"}:
            return "retired"
        return status_text

    @staticmethod
    def _parse_datetime(value):
        if isinstance(value, datetime):
            return value
        if not value:
            return None
        try:
            return datetime.fromisoformat(str(value))
        except ValueError:
            try:
                return datetime.strptime(str(value), "%Y-%m-%d")
            except ValueError:
                return None

    @staticmethod
    def dashboard_stats(db):
        assets = db.query(models.Asset).all()
        status_counts = Counter(ReportService._normalize_status(asset.status) for asset in assets)

        total_assets = len(assets)
        available = status_counts.get("available", 0)
        checked_out = status_counts.get("checked out", 0)
        maintenance = status_counts.get("maintenance", 0)
        retired = status_counts.get("retired", 0)

        transaction_rows = db.query(models.AssetTransaction).all()
        month_lookup = {}
        now = datetime.now()
        for offset in range(6, -1, -1):
            month_num = (now.month - offset - 1) % 12 + 1
            year_num = now.year + (now.month - offset - 1) // 12
            label = datetime(year_num, month_num, 1).strftime("%b")
            month_lookup[label] = {"month": label, "checkouts": 0, "returns": 0}

        for transaction in transaction_rows:
            parsed_date = ReportService._parse_datetime(
                transaction.transaction_date or transaction.create_at or transaction.checkout_date
            )
            if not parsed_date:
                continue
            label = parsed_date.strftime("%b")
            if label not in month_lookup:
                month_lookup[label] = {"month": label, "checkouts": 0, "returns": 0}

            transaction_type = str(transaction.transaction_type or "").strip().lower()
            if transaction_type == "checkout":
                month_lookup[label]["checkouts"] += 1
            elif transaction_type in {"return", "returned"}:
                month_lookup[label]["returns"] += 1

        monthly_activity = [month_lookup[label] for label in sorted(month_lookup, key=lambda key: datetime.strptime(key, "%b").month)]

        repair_history = db.query(models.RepairHistory).all()
        maintenance_cost_lookup = {}
        for repair in repair_history:
            parsed_date = ReportService._parse_datetime(repair.repair_date)
            if not parsed_date:
                continue
            label = parsed_date.strftime("%b")
            maintenance_cost_lookup[label] = maintenance_cost_lookup.get(label, 0) + (repair.repair_cost or 0)

        maintenance_cost = []
        for offset in range(6, -1, -1):
            month_num = (now.month - offset - 1) % 12 + 1
            year_num = now.year + (now.month - offset - 1) // 12
            label = datetime(year_num, month_num, 1).strftime("%b")
            maintenance_cost.append({"month": label, "cost": maintenance_cost_lookup.get(label, 0)})

        recent_activity = []
        for transaction in sorted(
            transaction_rows,
            key=lambda item: (ReportService._parse_datetime(item.transaction_date or item.create_at or item.checkout_date) or datetime.min, item.id),
            reverse=True,
        )[:8]:
            asset = db.query(models.Asset).filter(models.Asset.id == transaction.asset_id).first()
            transaction_type = str(transaction.transaction_type or "").strip().lower()
            if transaction_type == "checkout":
                activity_type = "checkout"
                label = "Checked out"
            elif transaction_type in {"return", "returned"}:
                activity_type = "return"
                label = "Returned"
            else:
                activity_type = "new"
                label = "Updated"

            recent_activity.append({
                "id": transaction.id,
                "action": label,
                "asset": asset.asset_name if asset else "Asset",
                "tag": asset.asset_tag if asset else "-",
                "by": transaction.employee_name or "System",
                "time": "Just now",
                "type": activity_type,
            })

        today = date.today()
        upcoming = today + timedelta(days=7)
        due_assets = (
            db.query(models.Asset)
            .filter(
                models.Asset.expected_return_date >= today,
                models.Asset.expected_return_date <= upcoming,
                models.Asset.status == "assigned",
            )
            .all()
        )

        alerts = []
        for asset in due_assets:
            alerts.append({
                "type": "warning",
                "msg": f"{asset.asset_name or 'Asset'} is due for return on {asset.expected_return_date}",
                "asset": asset.asset_tag or asset.id,
            })

        warranty_window = today + timedelta(days=30)
        expiring_assets = (
            db.query(models.Asset)
            .filter(
                models.Asset.warranty_expiration_date >= today,
                models.Asset.warranty_expiration_date <= warranty_window,
            )
            .all()
        )
        for asset in expiring_assets:
            alerts.append({
                "type": "warning",
                "msg": f"Warranty expires soon for {asset.asset_name or 'asset'}",
                "asset": asset.asset_tag or asset.id,
            })

        if total_assets <= 5:
            alerts.append({
                "type": "critical",
                "msg": "Inventory is low. Consider replenishing core assets.",
                "asset": "Inventory",
            })

        status_breakdown = [
            {"name": "Available", "value": available, "color": "#2DD4BF"},
            {"name": "Checked Out", "value": checked_out, "color": "#F59E0B"},
            {"name": "Maintenance", "value": maintenance, "color": "#3B82F6"},
            {"name": "Retired", "value": retired, "color": "#64748B"},
        ]

        return {
            "stats": [
                {"label": "Total Assets", "value": total_assets, "sub": "across all locations", "color": "#2DD4BF", "icon": "🗂"},
                {"label": "Available", "value": available, "sub": "ready for deployment", "color": "#2DD4BF", "icon": "✅"},
                {"label": "Checked Out", "value": checked_out, "sub": "currently with staff", "color": "#F59E0B", "icon": "📤"},
                {"label": "In Maintenance", "value": maintenance, "sub": "under service", "color": "#3B82F6", "icon": "🔧"},
            ],
            "monthly_activity": monthly_activity,
            "asset_categories": status_breakdown,
            "maintenance_cost": maintenance_cost,
            "recent_activity": recent_activity,
            "alerts": alerts,
            "total_maintenance_cost": sum(item["cost"] for item in maintenance_cost),
        }

    @staticmethod
    def inventory_report(db):
        return db.query(models.Asset).all()

    @staticmethod
    def asset_allocation_report(db):
        return (
            db.query(models.AssetTransaction)
            .filter(models.AssetTransaction.transaction_type == "checkout")
            .all()
        )

    @staticmethod
    def transaction_report(db):
        return (
            db.query(models.AssetTransaction)
            .order_by(models.AssetTransaction.create_at.desc())
            .all()
        )

    @staticmethod
    def maintenance_report(db):
        return db.query(models.MaintenanceRecord).all()

    @staticmethod
    def category_report(db):
        categories = (
            db.query(models.Asset.location, func.count(models.Asset.id))
            .group_by(models.Asset.location)
            .all()
        )
        return categories

    @staticmethod
    def export_assets_excel(db):
        assets = db.query(models.Asset).all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Assets Report"

        ws.append([
            "ID",
            "Asset Name",
            "Asset Tag",
            "Purchase Cost",
            "Location",
            "Purchase Date",
            "Warranty Expiration",
        ])

        for asset in assets:
            ws.append([
                asset.id,
                asset.asset_name,
                asset.asset_tag,
                asset.purchase_cost,
                asset.location,
                str(asset.purchase_date) if asset.purchase_date else "",
                str(asset.warranty_expiration_date) if asset.warranty_expiration_date else "",
            ])

        file_path = os.path.join(tempfile.gettempdir(), "assets_report.xlsx")
        wb.save(file_path)
        return file_path

    @staticmethod
    def export_assets_pdf(db):
        assets = db.query(models.Asset).all()

        file_path = os.path.join(tempfile.gettempdir(), "assets_report.pdf")
        doc = SimpleDocTemplate(file_path, pagesize=A4)

        data = [["ID", "Asset Name", "Asset Tag", "Purchase Cost", "Location", "Purchase Date", "Warranty Expiry"]]
        for asset in assets:
            data.append([
                asset.id,
                asset.asset_name,
                asset.asset_tag,
                asset.purchase_cost,
                asset.location,
                str(asset.purchase_date) if asset.purchase_date else "",
                str(asset.warranty_expiration_date) if asset.warranty_expiration_date else "",
            ])

        table = Table(data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ]))

        doc.build([table])
        return file_path