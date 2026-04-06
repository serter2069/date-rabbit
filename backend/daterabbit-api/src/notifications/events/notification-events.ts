export enum NotificationEventType {
  BOOKING_CONFIRMED = 'booking.confirmed',
  BOOKING_DECLINED = 'booking.declined',
  BOOKING_CANCELLED = 'booking.cancelled',
  BOOKING_COMPLETED = 'booking.completed',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_FAILED = 'payment.failed',
  VERIFICATION_APPROVED = 'verification.approved',
  VERIFICATION_REJECTED = 'verification.rejected',
  NEW_MESSAGE = 'new.message',
  COMPANION_ONLINE = 'companion.online',
  SOS_ALERT = 'sos.alert',
  SAFETY_ALERT = 'safety.alert',
}
