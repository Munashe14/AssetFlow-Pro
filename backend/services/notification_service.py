from ..import models

class NotificationService:

    @staticmethod
    def create_notification(
        db,
        user_id,
        title,
        message,
        notification_type="info",
        asset_id=None,
        transaction_id=None
    ):
        notification = models.Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            asset_id=asset_id,
            transaction_id=transaction_id
        )

        db.add(notification)
