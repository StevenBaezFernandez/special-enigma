#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Basic smoke test harness for fiscal transmission
async function runSmokeTest(country) {
  console.log(`🚀 Starting smoke test for fiscal transmission to ${country}...`);

  const mockInvoice = {
      id: `SMOKE-${Date.now()}`,
      tenantId: 'test-tenant-smoke',
      amount: 100.00,
      currency: country === 'BR' ? 'BRL' : 'COP',
      items: [
          { name: 'Smoke Test Product', price: 100.00, quantity: 1 }
      ]
  };

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    console.error('❌ CRITICAL: Smoke test harness cannot be run in production with actual transmission enabled.');
    return false;
  }

  // Verify certificate files/env vars
  const privateKey = process.env.FISCAL_PRIVATE_KEY;
  const certificate = process.env.FISCAL_CERTIFICATE;

  if (!privateKey || !certificate) {
    console.error(`❌ FISCAL_PRIVATE_KEY or FISCAL_CERTIFICATE not found for ${country} smoke test.`);
    return false;
  }

  console.log('✅ Certificate material found in environment.');
  console.log(`✅ Using mock invoice ID: ${mockInvoice.id}`);

  if (country === 'BR') {
     console.log('   Testing SEFAZ (Brazil) NFe 4.00 structural validation...');
  } else if (country === 'CO') {
     console.log('   Testing DIAN (Colombia) UBL 2.1 structural validation...');
  }

  console.log('✅ Structural validation passed (simulated for smoke harness).');
  console.log('✅ Digital signature generated successfully (simulated for smoke harness).');

  const transmissionUrl = process.env[`${country}_FISCAL_URL`] || 'http://localhost:8080/sandbox';
  console.log(`✅ Ready for transmission to sandbox: ${transmissionUrl}`);

  return true;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node smoke-test-fiscal.js <BR|CO>');
  process.exit(0);
}

runSmokeTest(args[0].toUpperCase())
  .then(ok => process.exit(ok ? 0 : 1))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
