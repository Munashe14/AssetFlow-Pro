from datetime import date

def warranty_status(purchase_date: str, warranty_period_years: int) -> str:
    if not purchase_date:
        return "No purchase date provided"
    
    try:
        purchase_date_obj = date.fromisoformat(purchase_date)
    except ValueError:
        return "Invalid purchase date format. Use YYYY-MM-DD."
    
    warranty_expiration_date = purchase_date_obj.replace(year=purchase_date_obj.year + warranty_period_years)
    current_date = date.today()
    
    if current_date <= warranty_expiration_date:
        return f"Under warranty until {warranty_expiration_date.isoformat()}"
    else:
        return f"Warranty expired on {warranty_expiration_date.isoformat()}"   