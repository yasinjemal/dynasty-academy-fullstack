// Simple PayPal credential test (no imports needed)
import "dotenv/config";

console.log("🧪 Testing PayPal Credentials...\n");

// 1. Check if credentials are configured
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("❌ PayPal credentials NOT found in .env");
  console.error(
    "   Make sure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set"
  );
  process.exit(1);
}

console.log("✅ PayPal credentials found in .env");
console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
console.log(`   Secret: ${clientSecret.substring(0, 20)}...\n`);

// 2. Test API connection by getting access token
console.log("🔐 Testing PayPal API connection (getting access token)...");

const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const apiBase =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

try {
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("❌ PayPal API authentication FAILED");
    console.error(`   Status: ${response.status}`);
    console.error(`   Error: ${error}`);
    process.exit(1);
  }

  const data = await response.json();
  console.log("✅ PayPal API authentication successful!");
  console.log(`   Access token: ${data.access_token.substring(0, 30)}...`);
  console.log(`   Token type: ${data.token_type}`);
  console.log(`   Expires in: ${data.expires_in} seconds\n`);

  // 3. Test creating an order
  console.log("📦 Testing PayPal order creation...");

  const orderResponse = await fetch(`${apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.access_token}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "29.99",
          },
          description: "Test Book - Dynasty Academy",
        },
      ],
      application_context: {
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      },
    }),
  });

  if (!orderResponse.ok) {
    const error = await orderResponse.text();
    console.error("❌ PayPal order creation FAILED");
    console.error(`   Status: ${orderResponse.status}`);
    console.error(`   Error: ${error}`);
    process.exit(1);
  }

  const orderData = await orderResponse.json();
  const approvalUrl = orderData.links.find(
    (link) => link.rel === "approve"
  )?.href;

  console.log("✅ PayPal order created successfully!");
  console.log(`   Order ID: ${orderData.id}`);
  console.log(`   Status: ${orderData.status}`);
  console.log(`   Approval URL: ${approvalUrl}\n`);

  console.log("🎉 ALL TESTS PASSED!");
  console.log("\n✨ PayPal is ready to accept payments!");
  console.log("\n💡 Next steps:");
  console.log("   1. Test payment flow in browser (visit approval URL above)");
  console.log("   2. Configure webhook URL in PayPal dashboard");
  console.log("   3. Deploy to production when ready");
} catch (error) {
  console.error("❌ Unexpected error:", error.message);
  process.exit(1);
}
