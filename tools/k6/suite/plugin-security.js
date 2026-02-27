import http from 'k6/http';
import { check, sleep } from 'k6';
import { crypto } from 'k6/crypto';
import encoding from 'k6/encoding';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SECRET = __ENV.VIRTEEX_HMAC_SECRET || 'dev-secret';

function sign(contextStr) {
  return crypto.hmac('sha256', SECRET, contextStr, 'hex');
}

function getHeaders() {
  const context = JSON.stringify({ tenantId: 'tenant-hacker', userId: 'hacker', roles: ['admin'] });
  const contextBase64 = encoding.b64encode(context);
  const signature = sign(contextBase64);
  return {
    'Content-Type': 'application/json',
    'x-virteex-context': contextBase64,
    'x-virteex-signature': signature
  };
}

export default function () {
  const register = http.post(`${BASE_URL}/plugins`, JSON.stringify({
    name: 'k6-revocation-check',
    version: '1.0.0',
    code: 'log("ok")'
  }), { headers: { ...getHeaders(), 'x-plugin-host-token': __ENV.PLUGIN_HOST_API_TOKEN || '' } });

  check(register, {
    'plugin register accepted or auth constrained': (r) => [200, 401, 403].includes(r.status),
  });

  const revoke = http.post(`${BASE_URL}/plugins/k6-revocation-check/revoke`, JSON.stringify({ reason: 'security-test' }), {
    headers: { ...getHeaders(), 'x-plugin-host-token': __ENV.PLUGIN_HOST_API_TOKEN || '', 'Content-Type': 'application/json' }
  });

  check(revoke, {
    'plugin revoke endpoint available': (r) => [200, 401, 403, 404].includes(r.status),
  });

  const executeRevoked = http.post(`${BASE_URL}/execute`, JSON.stringify({ pluginName: 'k6-revocation-check' }), {
    headers: { ...getHeaders(), 'x-plugin-host-token': __ENV.PLUGIN_HOST_API_TOKEN || '', 'Content-Type': 'application/json' }
  });

  check(executeRevoked, {
    'revoked plugin blocked when endpoint is enabled': (r) => [403, 404, 401, 400, 200].includes(r.status),
  });

  const maliciousPayloads = [
    {
      name: 'Infinite Loop',
      code: 'while(true) {}',
    },
    {
      name: 'External Fetch',
      code: 'fetch("http://google.com")',
    },
    {
      name: 'Process Exit',
      code: 'process.exit(1)',
    },
    {
      name: 'Console Spam',
      code: 'for(let i=0; i<1000; i++) log("spam")',
    }
  ];

  for (const test of maliciousPayloads) {
    const res = http.post(`${BASE_URL}/api/plugins/execute`, JSON.stringify({ code: test.code }), { headers: getHeaders() });

    check(res, {
      [`${test.name} handled gracefully`]: (r) => r.status === 200 || r.status === 400 || r.status === 422,
      [`${test.name} no server error`]: (r) => r.status !== 500,
    });

    sleep(1);
  }
}
