from datetime import date, datetime

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Any
from enum import Enum

VALID_ROLES = {"admin", "manager", "storekeeper", "employee"}
DEFAULT_ROLE = "storekeeper"


class AssetCreate(BaseModel):
    asset_name: str
    asset_tag: str
    purchase_cost: int
    location: str
    purchase_date: Optional[str] = None
    warranty_expiration_date: Optional[str] = None
    salvage_value: Optional[int] = None
    useful_life_years: Optional[int] = None
    status: Optional[str] = "available"

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
    status: Optional[str] = "available"

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = DEFAULT_ROLE
    department_id: Optional[int] = None

    @field_validator("role")
    @classmethod
    def normalize_role(cls, v):
        value = str(v or "").strip().lower()
        if value not in VALID_ROLES:
            raise ValueError("Invalid role")
        return value


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    department_id: Optional[int] = None

    class Config:
        from_attributes = True


class User(BaseModel):
    id: int
    username: str
    email: str
    password: str
    role: str
    department_id: Optional[int] = None

    class Config:
        from_attributes = True

class EmployeeCreate(BaseModel):
    employee_number: str
    first_name: str
    last_name: str
    department: str
    email: EmailStr

class Employee(BaseModel):
    id: int
    employee_number: str
    first_name: str
    last_name: str
    department: str
    email: EmailStr

    class Config:
        from_attributes = True

class Message(BaseModel):
    message: str

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


class AuditLog(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True
