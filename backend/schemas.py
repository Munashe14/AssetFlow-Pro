from datetime import date, datetime

from pydantic import BaseModel
from typing import Optional
from enum import Enum

class AssetCreate(BaseModel):
    asset_name: str
    asset_tag: str
    purchase_cost: int
    location: str
    purchase_date: Optional[str] = None
    warranty_expiration_date: Optional[str] = None
    salvage_value: Optional[int] = None
    useful_life_years: Optional[int] = None

class Asset(BaseModel):
    id: int
    asset_name: str
    asset_tag: str
    purchase_cost: int
    location: str
    qr_code_path: Optional[str] = None
    barcode_path: Optional[str] = None
    purchase_date: Optional[str] = None
    warranty_expiration_date: Optional[str] = None
    salvage_value: Optional[int] = None
    useful_life_years: Optional[int] = None
    annual_depreciation: Optional[int] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str # Default role is storekeeper

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str  # Include the role in the output schema

    class Config:
        from_attributes = True

class User(BaseModel):
    id: int
    username: str
    email: str
    password: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class CreateDepartment(BaseModel):
    name: str

class Department(BaseModel):
    id: int
    name: str

class DisposalCreate(BaseModel):
    disposal_date: date
    disposal_method: str
    reason: Optional[str] = None
    approved_by: Optional[str] = None

class DisposalResponse(DisposalCreate):
    id: int
    asset_id: int

class CheckoutAsset(BaseModel):
    employee_id: int
    due_date: date

class ReturnAsset(BaseModel):
    notes: Optional[str] = None

class MaintenanceRecordCreate(BaseModel):
    asset_id: int
    maintenance_date: date
    maintenance_type: str
    description: str
    performed_by: str
    cost: Optional[int] = None

class MaintenanceResponse(MaintenanceRecordCreate):
    id: int

    class Config:
        from_attributes = True

class RepairCreate(BaseModel):
    asset_id: int
    repair_date: date
    issue_reported: str
    repair_done: str
    repair_cost: int
    repaired_by: str

class RepairResponse(RepairCreate):
    id: int

    class Config:
        from_attributes = True

class Checkout(BaseModel):
    id: int
    asset_id: int
    employee_id: int
    checkout_date: str
    due_date: str
    return_date: Optional[str] = None
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class NotificationType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    SUCCESS = "success"

class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType
    asset_id: Optional[int] = None
    checkout_id: Optional[int] = None
   
class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationOut(NotificationResponse):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True
