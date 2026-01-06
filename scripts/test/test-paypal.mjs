/**
 * 🧪 TEST PAYPAL INTEGRATION
 * Quick script to verify PayPal credentials are working
 */

import { PayPalProvider } from "../src/lib/payments/providers/paypal";

async function testPayPal() {
  console.log("🧪 Testing PayPal Integration...\n");

  const paypal = new PayPalProvider();

  // 1. Check if configured
  console.log("1️⃣ Checking configuration...");
  if (!paypal.isConfigured()) {
    console.error("❌ PayPal is NOT configured. Check your .env file.");
    return;
  }
  console.log("✅ PayPal is configured\n");

  // 2. Test API connection (get access token)
  console.log("2️⃣ Testing API connection...");
  try {
    const testOrder = await paypal.createOrder({
      userId: "test-user-123",
      bookId: "test-book-456",
      bookTitle: "Test Book - Dynasty Academy",
      amount: 29.99,
      currency: "USD",
      returnUrl: "http://localhost:3000/success",
      cancelUrl: "http://localhost:3000/cancel",
    });

    console.log("✅ PayPal API connection successful!");
    console.log("📋 Test Order Created:");
    console.log(`   Order ID: ${testOrder.orderId}`);
    console.log(`   Approval URL: ${testOrder.approvalUrl}`);
    console.log("\n💡 You can visit the approval URL to test the payment flow");
    console.log(
      "\n✅ ALL TESTS PASSED! PayPal is ready to accept payments! 🎉"
    );
  } catch (error) {
    console.error("❌ PayPal API connection failed:");
    console.error(error);
  }
}

testPayPal();
