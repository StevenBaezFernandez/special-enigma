#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');
const { X509Certificate } = require('crypto');

function validateCertificate(filePath, type = 'pem') {
  console.log(`Checking certificate: ${filePath} (type: ${type})`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  try {
    let certData;
    if (type === 'pfx' || type === 'p12') {
        console.log('PFX/P12 validation requires a password. This tool only checks for existence and basic headers for now if password not provided.');
        const stats = fs.statSync(filePath);
        if (stats.size < 500) {
            console.error('❌ PFX file looks too small to be a valid certificate.');
            return false;
        }
        console.log('✅ PFX/P12 file exists and size looks reasonable.');
        return true;
    }

    certData = fs.readFileSync(filePath, 'utf8');
    const cert = new X509Certificate(certData);

    console.log(`   Subject: ${cert.subject}`);
    console.log(`   Issuer: ${cert.issuer}`);
    console.log(`   Valid From: ${cert.validFrom}`);
    console.log(`   Valid To: ${cert.validTo}`);
    console.log(`   Serial Number: ${cert.serialNumber}`);

    const now = new Date();
    const validTo = new Date(cert.validTo);
    const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

    if (now > validTo) {
      console.error('❌ Certificate has EXPIRED!');
      return false;
    }

    if (daysRemaining < 30) {
      console.warn(`⚠️  Certificate expires soon! (${daysRemaining} days remaining)`);
    } else {
      console.log(`✅ Certificate is valid for ${daysRemaining} more days.`);
    }

    if (cert.subject.includes('OU=DIAN') || cert.subject.includes('O=DIAN')) {
        console.log('   Type: Colombian DIAN Compatible');
    } else if (cert.subject.includes('ICP-Brasil')) {
        console.log('   Type: Brazilian ICP-Brasil Compatible');
    }

    return true;
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    return false;
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node validate-certificate.js <path-to-cert> [pem|pfx]');
  process.exit(0);
}

const ok = validateCertificate(args[0], args[1] || 'pem');
process.exit(ok ? 0 : 1);
