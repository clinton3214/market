import crypto from 'crypto';
import { accounts } from './database.js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_dummy';

async function runTest() {
  console.log("--- Starting Test ---");
  
  console.log("Initial DB State (first account):", accounts[0]);
  
  // 1. Simulate checkout for Instagram
  console.log("\n1. Testing Checkout API...");
  try {
    const checkoutRes = await fetch('http://localhost:5000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountType: 'Instagram',
        email: 'test@example.com'
      })
    });
    
    const checkoutData = await checkoutRes.json();
    console.log("Checkout Response:", checkoutData);
  } catch (e) {
    console.error("Checkout failed. Is the server running?");
  }
  
  // 2. Simulate Webhook
  console.log("\n2. Testing Webhook...");
  
  const payload = {
    event: "charge.success",
    data: {
      id: 123456,
      reference: "test_ref",
      metadata: {
        account_id: accounts[0].id
      },
      customer: {
        email: "test@example.com"
      }
    }
  };
  
  const payloadString = JSON.stringify(payload);
  const signature = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(payloadString).digest('hex');
  
  try {
    const webhookRes = await fetch('http://localhost:5000/api/paystack-webhook', {
      method: 'POST',
      headers: {
        'x-paystack-signature': signature,
        'Content-Type': 'application/json'
      },
      body: payloadString
    });
    
    console.log("Webhook Response Status:", webhookRes.status);
  } catch (e) {
    console.error("Webhook test failed.");
  }
  
  console.log("\n3. DB State After Webhook (first account):", accounts[0]);
  
  process.exit(0);
}

runTest();
