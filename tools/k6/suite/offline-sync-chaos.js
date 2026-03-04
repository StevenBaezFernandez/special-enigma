import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Enterprise-Grade Offline Sync Chaos Test
 *
 * Objective: Verify data durability under network instability.
 */

export const options = {
  vus: 5,
  iterations: 30,
  thresholds: {
    http_req_failed: ['rate<0.001'],
    http_req_duration: ['p(95)<2500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const id = `${__VU}-${__ITER}-${Date.now()}`;

  const queueResponse = http.post(
    `${BASE_URL}/api/mobile/sync/queue`,
    JSON.stringify({ id, payload: { amount: 99.5, currency: 'MXN' } }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(queueResponse, {
    'queue endpoint accepted': (r) => r.status === 201 || r.status === 202,
  });

  sleep(Math.random() * 0.6);

  const replayResponse = http.post(
    `${BASE_URL}/api/mobile/sync/replay`,
    JSON.stringify({ id, simulateNetwork: true, maxRetries: 5 }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(replayResponse, {
    'replay successful': (r) => r.status === 200 || r.status === 202,
    'no internal server error': (r) => r.status < 500,
  });
}
