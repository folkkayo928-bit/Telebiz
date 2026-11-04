import { describe, expect, test } from 'bun:test';
import { paymentActionError } from './paymentState';

describe('manual payment state transitions', () => {
  test('allows pending payments to be verified or failed', () => {
    expect(paymentActionError('initiated', 'verify')).toBeNull();
    expect(paymentActionError('pending_verification', 'fail')).toBeNull();
  });
  test('does not reopen failed or refunded payments', () => {
    expect(paymentActionError('failed', 'verify')).not.toBeNull();
    expect(paymentActionError('refunded', 'verify')).not.toBeNull();
  });
  test('does not mark verified payments as failed', () => {
    expect(paymentActionError('verified', 'fail')).not.toBeNull();
  });
  test('refunds only verified payments', () => {
    expect(paymentActionError('verified', 'refund')).toBeNull();
    expect(paymentActionError('initiated', 'refund')).not.toBeNull();
  });
});
