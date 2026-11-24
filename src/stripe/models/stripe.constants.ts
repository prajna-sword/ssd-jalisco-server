export enum StripeWebhookEvent {
  // ==========================================
  // 1. CHECKOUT SESSIONS (QR Code Flows)
  // ==========================================
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',
  CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED = 'checkout.session.async_payment_succeeded',
  CHECKOUT_SESSION_ASYNC_PAYMENT_FAILED = 'checkout.session.async_payment_failed',

  // ==========================================
  // 2. PAYMENT INTENTS (Holds, Captures, Releases & Incidentals)
  // ==========================================
  /** Hold succeeded -> Funds are authorized & ready to capture within 7 days */
  PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED = 'payment_intent.amount_capturable_updated',
  /** Hold captured (Day 5) OR off-session incidental charge succeeded */
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  /** Hold released (canceled within 5-day free window) or expired */
  PAYMENT_INTENT_CANCELED = 'payment_intent.canceled',
  /** Card declined or 3DS authentication required on off-session incidental charge */
  PAYMENT_INTENT_PAYMENT_FAILED = 'payment_intent.payment_failed',
  PAYMENT_INTENT_PROCESSING = 'payment_intent.processing',

  // ==========================================
  // 3. CHARGES & REFUNDS (Post-Capture Disputes & Refunds)
  // ==========================================
  CHARGE_SUCCEEDED = 'charge.succeeded',
  CHARGE_CAPTURED = 'charge.captured',
  CHARGE_REFUNDED = 'charge.refunded',
  CHARGE_DISPUTE_CREATED = 'charge.dispute.created',
  CHARGE_DISPUTE_CLOSED = 'charge.dispute.closed',

  // ==========================================
  // 4. CUSTOMERS & SAVED PAYMENT METHODS (Cards on File)
  // ==========================================
  /** Card tokenized & saved to Customer -> store pm_... ID on guest/reservation */
  PAYMENT_METHOD_ATTACHED = 'payment_method.attached',
  PAYMENT_METHOD_DETACHED = 'payment_method.detached',
  PAYMENT_METHOD_AUTOMATICALLY_UPDATED = 'payment_method.automatically_updated',
  CUSTOMER_UPDATED = 'customer.updated',

  // ==========================================
  // 5. CONNECT ACCOUNTS (Express Client Onboarding - Connect Scope)
  // ==========================================
  /** Client submitted onboarding / KYC / CLABE -> check charges_enabled & payouts_enabled */
  ACCOUNT_UPDATED = 'account.updated',
  ACCOUNT_APPLICATION_DEAUTHORIZED = 'account.application.deauthorized',
  CAPABILITY_UPDATED = 'capability.updated',

  // ==========================================
  // 6. TRANSFERS & PAYOUTS (Splitting Funds & Partial Payouts)
  // ==========================================
  /** Platform sent partial or full funds to client's Express account (Platform Scope) */
  TRANSFER_CREATED = 'transfer.created',
  TRANSFER_UPDATED = 'transfer.updated',
  TRANSFER_REVERSED = 'transfer.reversed',

  /** Funds moving from client's Express balance to their bank/CLABE (Connect Scope) */
  PAYOUT_CREATED = 'payout.created',
  PAYOUT_PAID = 'payout.paid',
  PAYOUT_FAILED = 'payout.failed',
  PAYOUT_CANCELED = 'payout.canceled',
}

export enum StripeScopes {
    PLATFORM = 'platform',
    CONNECT = 'connect'
}
