from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .import models, schemas
from .database import ensure_user_role_column, ensure_asset_columns, ensure_asset_transaction_columns, ensure_audit_log_table, get_db, engine
from .routers.assets import router as assets_router
from .routers.users import router as users_router
from .routers.department import router as department_router
from .routers.auth import router as auth_router
from .routers.depreciation import router as depreciation_router
from .routers.checkouts import router as checkouts_router
from .routers.employees import router as employees_router
from .routers.maintenance import router as maintenance_router
from .routers.repairs import router as repairs_router
from .routers.disposal import router as disposal_router
from .routers.reports import router as reports_router
from .routers.notifications import router as notifications_router
from .routers.audit_logs import router as audit_logs_router
from fastapi.middleware.cors import CORSMiddleware
import os

models.Base.metadata.create_all(bind=engine)
ensure_user_role_column()
ensure_audit_log_table()
ensure_asset_columns()
ensure_asset_transaction_columns()

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers for assets, users, departments, authentication, depreciation, and checkouts
app.include_router(assets_router, prefix="/assets", tags=["assets"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(department_router, prefix="/departments", tags=["departments"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(depreciation_router, prefix="/depreciation", tags=["depreciation"])
app.include_router(checkouts_router)
app.include_router(employees_router)
app.include_router(maintenance_router, prefix="/maintenance", tags=["maintenance"])
app.include_router(repairs_router, prefix="/repairs", tags=["repairs"])
app.include_router(disposal_router, prefix="/disposal", tags=["disposal"])
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(audit_logs_router, prefix="/audit-logs", tags=["audit-logs"])

# Check the health of the application
@app.get("/health")
def health_check():
    return {"status": "healthy"} 