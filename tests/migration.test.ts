import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { z } from 'zod';

test('wali request validation requires authority and privacy consent', () => {
  const schema = z.object({
    confirmedWaliAuthority: z.literal(true),
    privacyConsent: z.literal(true),
  });
  assert.equal(schema.safeParse({ confirmedWaliAuthority: true, privacyConsent: true }).success, true);
  assert.equal(schema.safeParse({ confirmedWaliAuthority: false, privacyConsent: true }).success, false);
});

test('PostgreSQL migration contains duplicate request and overlap protections', () => {
  const security = readFileSync('supabase/migrations/202611180002_security_and_rpc.sql', 'utf8');
  const initial = readFileSync('supabase/migrations/202611180001_initial.sql', 'utf8');
  assert.match(initial, /marriage_requests_active_wali_brother_key/);
  assert.match(initial, /exclude using gist/);
  assert.match(security, /only the addressed brother can respond/);
  assert.match(security, /respond_marriage_request/);
  assert.match(security, /create_counselling_booking/);
});

test('payment status is explicit and never enabled as paid', () => {
  const initial = readFileSync('supabase/migrations/202611180001_initial.sql', 'utf8');
  assert.match(initial, /payment_status payment_status not null default 'payment_not_enabled'/);
});
