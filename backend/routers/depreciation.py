from fastapi import APIRouter
from ..services.depreciation_service import (straight_line_depreciation, reducing_balance_depreciation)

router = APIRouter(tags=["depreciation"])

@router.get("/straight-line")
def calculate_straight_line_depreciation(
    cost: float,
    salvage_value: float, 
    useful_life: int):
    """
    Calculate straight-line depreciation.
    """
    return straight_line_depreciation(cost, salvage_value, useful_life)


@router.get("/reducing-balance")
def calculate_reducing_balance_depreciation(
    salvage_value: float, 
    rate: float):
    """
    Calculate reducing balance depreciation.
    """
    return reducing_balance_depreciation(salvage_value, rate)