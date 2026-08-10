from fastapi import Depends, HTTPException, status
from .oauth2 import get_current_user

VALID_ROLES = {"admin", "manager", "storekeeper", "employee"}
DEFAULT_ROLE = "storekeeper"


def normalize_role(role):
    return str(role or "").strip().lower()


def admin_only(current_user: dict = Depends(get_current_user)):
    if normalize_role(current_user.get("role")) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )
    return current_user


def manager_or_admin(current_user: dict = Depends(get_current_user)):
    role = normalize_role(current_user.get("role"))
    if role not in {"admin", "manager"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )
    return current_user


def storekeeper_or_admin(current_user: dict = Depends(get_current_user)):
    role = normalize_role(current_user.get("role"))
    if role not in {"storekeeper", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )
    return current_user


def authenticated_user(current_user: dict = Depends(get_current_user)):
    if current_user and "role" in current_user:
        current_user["role"] = normalize_role(current_user["role"])
    return current_user


def require_role(*roles):
    allowed_roles = {normalize_role(role) for role in roles}

    def role_checker(current_user: dict = Depends(authenticated_user)):
        if normalize_role(current_user.get("role")) not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access required"
            )

        return current_user

    return role_checker


def require_roles(roles):
    return require_role(*roles)