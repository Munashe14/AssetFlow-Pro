from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime
from pydantic import BaseModel
import enum

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String, index=True)
    asset_tag = Column(String, index=True)
    purchase_cost = Column(Integer)
    location = Column(String)

    qr_code_path = Column(String, nullable=True)
    barcode_path = Column(String, nullable=True)
    status = Column(String, default="available")  # Default status is available
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset")  # Relationship to maintenance records
    repair_history = relationship("RepairHistory", back_populates="asset")  # Relationship to repair history
    purchase_date = Column(String, nullable=True)  # Optional purchase date field
    warranty_expiration_date = Column(String, nullable=True)  # Optional warranty expiration date field
    salvage_value = Column(Integer, nullable=True)
    useful_life_years = Column(Integer, nullable=True)
    annual_depreciation = Column(Integer, nullable=True)
    expected_return_date = Column(Date, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # In a real application, passwords should be hashed!
    role = Column(String, default="storekeeper")  # Default role is storekeeper


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

class Checkout(Base):
    __tablename__ = "checkouts"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), index=True)
    checkout_date = Column(String)
    due_date = Column(String)
    return_date = Column(String, nullable=True)  # Nullable for assets not yet returned
    status = Column(String, default="checked_out")  # Default status is checked_out
    notes = Column(String, nullable=True)  # Optional notes about the checkout

class AssetTransaction(Base):
    __tablename__ = "asset_transactions"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    employee_name = Column(String, index=True)
    checkout_date = Column(String)
    due_date = Column(String)
    return_date = Column(String, nullable=True)  # Nullable for assets not yet returned
    status = Column(String, default="checked_out")  # Default status is checked_out
    notes = Column(String, nullable=True)  # Optional notes about the transaction
    transaction_type = Column(String)
    transaction_date = Column(DateTime)
    create_at = Column(DateTime, default=datetime.utcnow)

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String, unique=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    department = Column(String, index=True)  # Store department name for easier access
    email = Column(String, unique=True, index=True)

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    maintenance_date = Column(String)
    maintenance_type = Column(String)
    description = Column(String)
    performed_by = Column(String)
    cost = Column(Integer, nullable=True)
    asset = relationship("Asset", back_populates="maintenance_records")

class RepairHistory(Base):
    __tablename__ = "repair_history"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    repair_date = Column(String)
    issue_reported = Column("repair_type", String)
    repair_done = Column("description", String)
    repair_cost = Column("cost", Integer)
    repaired_by = Column("performed_by", String)
    asset = relationship("Asset", back_populates="repair_history")


class AssetDisposal(Base):
    __tablename__ = "asset_disposal"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    disposal_date = Column(String)
    disposal_method = Column(String)
    description = Column(String)
    approved_by = Column(String)

class NotificationType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    SUCCESS = "success"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    title = Column(String, nullable=False)
    message = Column(String, nullable=False)

    type = Column(String)  # Should be one of the values from NotificationType

    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    checkout_id = Column(Integer, ForeignKey("checkouts.id"), nullable=True)

    created_at = Column(String)  # Timestamp for when the notification was created
    read_at = Column(String, nullable=True)  # Timestamp for when the notification was read, nullable if unread

    is_read = Column(Boolean, default=False)

    transaction_id = Column(Integer, ForeignKey("checkouts.id"), nullable=True)


class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime 

    class Config:
        from_attributes = True