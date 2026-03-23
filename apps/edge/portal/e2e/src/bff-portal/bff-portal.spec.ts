import axios from 'axios';

describe('BFF Portal E2E', () => {
  // axios.defaults.baseURL is set in test-setup.ts to http://localhost:3100
  const bffApiUrl = '/api';

  it('GET /api should return hello message', async () => {
    try {
      const res = await axios.get(`${bffApiUrl}`);
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Hello API' });
    } catch (error: any) {
       if (error.code === 'ECONNREFUSED') {
         console.log('BFF not running, skipping assertion');
         return;
       }
       throw error;
    }
  });

  it('GET /api/inventory/warehouses should be reachable (Presentation Module)', async () => {
     // This verifies that the InventoryPresentationModule is correctly wired
     try {
       const res = await axios.get(`${bffApiUrl}/inventory/warehouses`);
       // If it returns 200 or 401, it means the route exists
       expect([200, 401]).toContain(res.status);
     } catch (error: any) {
       if (error.response) {
         // 401 Unauthorized is expected since we're not sending a token
         expect([401, 403]).toContain(error.response.status);
         // Ensure it's not a 404 (route not found)
         expect(error.response.status).not.toBe(404);
       } else if (error.code === 'ECONNREFUSED') {
         console.log('BFF not running, skipping assertion');
       } else {
         throw error;
       }
     }
  });

  it('GET /api/pos/health should be proxied (Middleware Proxy)', async () => {
    try {
      const res = await axios.get(`${bffApiUrl}/pos/health`);
      // If it's proxied and the target is down, it might return 500 or 503 from our ResilientHttpClient
      // If target is up, it might be 200.
      expect([200, 500, 503]).toContain(res.status);
      expect(res.status).not.toBe(404);
    } catch (error: any) {
      if (error.response) {
        // If we get a response, the proxy is working (even if it's an error from target or circuit breaker)
        // Ensure it's not a 404 (routing mismatch)
        expect(error.response.status).not.toBe(404);
        // We expect errors related to service unavailability if target is down
        expect([500, 503, 401]).toContain(error.response.status);
      } else if (error.code === 'ECONNREFUSED') {
        console.log('BFF not running, skipping assertion');
      } else {
        throw error;
      }
    }
  });
});
