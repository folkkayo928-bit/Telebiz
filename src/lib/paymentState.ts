export type ManualPaymentAction = 'verify' | 'fail' | 'refund';

export function paymentActionError(currentStatus: unknown, action: ManualPaymentAction): string | null {
  const status = String(currentStatus || '').toLowerCase();
  const pending = ['initiated', 'pending', 'pending_verification', 'unpaid'];
  if (action === 'verify') {
    if (status === 'verified') return null;
    if (pending.includes(status)) return null;
    return 'Only a pending payment can be verified. Failed or refunded payments cannot be reopened.';
  }
  if (action === 'fail') {
    if (status === 'failed') return null;
    if (pending.includes(status)) return null;
    return 'A verified or refunded payment cannot be marked as failed.';
  }
  if (status === 'refunded' || status === 'verified') return null;
  return 'Only a verified payment can be refunded.';
}
