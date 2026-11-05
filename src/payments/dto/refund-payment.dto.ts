export interface RefundPaymentPayload {
    refundAmount: string;
    clientPageId: string;
    bookingIds: string[];
    paymentIntentId: string;
}
