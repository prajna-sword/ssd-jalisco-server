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
    COMPLETE = 'complete'
}
