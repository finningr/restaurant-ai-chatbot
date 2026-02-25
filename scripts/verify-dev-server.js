#!/usr/bin/env node

/**
 * Development Server Verification Script
 * 
 * This script checks that:
 * 1. Dev server is running on port 3000
 * 2. Key pages are accessible
 * 3. No build errors exist
 * 
 * Run this after making changes to ensure everything works.
 */

const http = require('http');

const PAGES_TO_CHECK = [
  '/',
  '/marketing',
  '/manual-input',
  '/demo',
  '/login',
  '/signup'
];

const PORT = 3000;
const HOST = 'localhost';

function checkPage(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 308) {
          resolve({ path, status: res.statusCode, success: true });
        } else {
          resolve({ path, status: res.statusCode, success: false });
        }
      });
    });

    req.on('error', (error) => {
      reject({ path, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ path, error: 'Request timeout' });
    });

    req.end();
  });
}

async function verifyDevServer() {
  console.log('🔍 Verifying development server...\n');
  
  let allPassed = true;
  
  for (const page of PAGES_TO_CHECK) {
    try {
      const result = await checkPage(page);
      if (result.success) {
        console.log(`✅ ${page.padEnd(20)} - Status: ${result.status}`);
      } else {
        console.log(`❌ ${page.padEnd(20)} - Status: ${result.status} (FAILED)`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${page.padEnd(20)} - Error: ${error.error}`);
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All checks passed! Dev server is running correctly.');
  } else {
    console.log('❌ Some checks failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run verification
verifyDevServer().catch((error) => {
  console.error('❌ Verification script error:', error);
  process.exit(1);
});

