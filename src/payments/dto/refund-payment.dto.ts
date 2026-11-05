export class RefundPaymentPayload {
    refundAmount: number;
    clientPageId: string;
    bookingIds: string[];
    paymentIntentId: string;
}
