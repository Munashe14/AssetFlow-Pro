import os
import qrcode
from barcode import Code128
from barcode.writer import ImageWriter


class BarcodeService:

    QRCODE_FOLDER = 'generated/qrcodes'
    BARCODE_FOLDER = 'generated/barcodes'

    @classmethod

    # Ensure that the directories for storing QR codes and barcodes exist
    def ensure_directories(cls):
        os.makedirs(cls.QRCODE_FOLDER, exist_ok=True)
        os.makedirs(cls.BARCODE_FOLDER, exist_ok=True)

    @classmethod

    # Generate a QR code for the asset containing its ID, tag, and name
    def generate_asset_qr_code(
        cls,
        asset_id: int,
        asset_tag: str,
        asset_name: str,
    ) -> str:
        
        cls.ensure_directories()

        qr_data = (
            f"Asset ID: {asset_id}\n"
            f"Asset Tag: {asset_tag}\n"
            f"Asset Name: {asset_name}"
        )


        qr = qrcode.QRCode(
            version=1,
            box_size=10,
            border=4
        )

        qr.add_data(qr_data)
        qr.make(fit=True)

        image = qr.make_image(fill_color="black", back_color="white")

        filename = f"{cls.QRCODE_FOLDER}/asset_{asset_id}.png"
        image.save(filename)

        return filename

    @classmethod

    # Generate a barcode for the asset using Code128 format
    def generate_barcode(
        cls,
        asset_id: int,
        asset_tag: str,
    ) -> str:
        
        cls.ensure_directories()

        barcode_data = f"{asset_id}-{asset_tag}"

        barcode = Code128(barcode_data, writer=ImageWriter())
        # barcode.save() adds .png extension automatically, so don't include it
        filename_base = f"{cls.BARCODE_FOLDER}/asset_{asset_id}"
        barcode.save(filename_base)
        
        # Return the actual filename with extension
        return f"{filename_base}.png"