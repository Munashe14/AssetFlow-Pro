from fastapi import Depends, HTTPException, status
from .oauth2 import get_current_user

def admin_only(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )
    return current_user

def storekeeper_or_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["storekeeper", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )
    return current_user

def authenticated_user(current_user: dict = Depends(get_current_user)):
    return current_user

def require_role(*roles):

    def role_checker(
        current_user: dict = Depends(authenticated_user)
    ):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=403,
                detail="Access required"
            )
        
        return current_user

    return role_checker