import Barcode from "react-barcode";

/**
 * Renders a Code128 barcode from the asset's asset_tag
 * The white bg is intentional-barcode scanner need high contrast
 * 
 * Props:
 *      value (string)- the asset tag e.g. "IT-2024-0041"
 *      small (bool) - compact variant for tables/lists 
 */

export default function BarcodeDisplay({value}) {
    if (!value) return null;

    return(
        <div className=" bg-white rounded-lg p-3 inline-flex flex-col items-center ">
            <Barcode
                value={value}
                format="CODE128"
                width={small ? 1.2 : 2}
                height={small ? 40 : 64}
                fontSize={small ? 10 : 12}
                displayValue={true}
                margin={4}
        />
        </div>
    );
}