export enum PaymentTypes {
    ROOM_HOLD = 'room_hold',
    INCIDENTAL_CHARGE = 'incidental_charge',
}

export enum PaymentStatuses {
    PENDING = 'pending',
    AUTHORIZED = 'authorized',
    CAPTURED = 'captured',
    HOLD_EXPIRED = 'hold_expired',
    CANCELED = 'canceled',
    COMPLETE = 'complete',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    PARTIALLY_REFUNDED = 'partially_refunded',
    DISPUTED = 'disputed',
    DISPUTE_LOST = 'dispute_lost'
}
