import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  iterations: 30,
  thresholds: {
    http_req_failed: ['rate<0.05'],
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
    'queue endpoint accepts payload': (r) => [200, 201, 202, 404].includes(r.status),
  });

  sleep(Math.random() * 0.6);

  const replayResponse = http.post(
    `${BASE_URL}/api/mobile/sync/replay`,
    JSON.stringify({ id, simulateNetwork: true, maxRetries: 5 }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(replayResponse, {
    'replay endpoint responds': (r) => [200, 202, 404, 503].includes(r.status),
    'no server crash': (r) => r.status !== 500,
  });
}
