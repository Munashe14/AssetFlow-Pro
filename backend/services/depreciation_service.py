


def straight_line_depreciation(cost: float, salvage_value: float, useful_life: int) -> float:
    """
    Calculate straight-line depreciation.

    :param cost: Initial cost of the asset
    :param salvage_value: Value of the asset at the end of its useful life
    :param useful_life: Useful life of the asset in years
    :return: Annual depreciation expense
    """
    if useful_life <= 0:
        raise ValueError("Useful life must be greater than zero.")
    
    return (cost - salvage_value) / useful_life

def reducing_balance_depreciation(salvage_value: float, rate: float) -> float: 
        depreciation = (salvage_value * rate) / 100
        ending_value = salvage_value - depreciation
        return {
            "method":
            "Reducing Balance",

            "depreciation":
            round(depreciation, 2),

            "ending_value":
            round(ending_value,2)
        }
   