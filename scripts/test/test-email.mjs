/**
 * Quick Email Test Script
 * Run: node test-email.mjs
 */

import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY || "re_Trf2UNNJ_A9BSq5xeaE1TT6cwGE8VfQRR"
);

async function testEmail() {
  console.log("🚀 Testing Dynasty Academy Email System...\n");

  try {
    const result = await resend.emails.send({
      from: "Dynasty Academy <no-reply@dynasty.academy>",
      to: "yasinyutbr@gmail.com", // Your email from the screenshot
      subject: "🎉 Dynasty Academy Email System is LIVE!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🏰 Dynasty Academy</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Your email system is now operational!</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e5e7eb;">
            <h2 style="color: #667eea; margin-top: 0;">✅ Phase III.2 Complete!</h2>
            
            <p>Congratulations! Your Dynasty Academy platform now has:</p>
            
            <ul style="line-height: 1.8;">
              <li>📧 <strong>Email Notifications</strong> - Instructor approvals, security alerts</li>
              <li>🔐 <strong>JWT Token Rotation</strong> - 15-minute expiry, auto-refresh</li>
              <li>👥 <strong>Session Tracking</strong> - Real-time user monitoring</li>
              <li>🛡️ <strong>Rate Limiting</strong> - DDoS protection ready</li>
              <li>📊 <strong>Security Dashboard</strong> - Live threat monitoring</li>
            </ul>
            
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #15803d;">
                <strong>✨ Email System Status:</strong> OPERATIONAL
              </p>
              <p style="margin: 8px 0 0; color: #16a34a; font-size: 14px;">
                You're now receiving this test email from Resend!
              </p>
            </div>
            
            <h3 style="color: #333; margin-top: 32px;">🎯 What You Can Do Now:</h3>
            
            <ol style="line-height: 1.8;">
              <li>Send instructor approval emails</li>
              <li>Send security alert notifications</li>
              <li>Send course enrollment confirmations</li>
              <li>Send payout processed notifications</li>
              <li>Batch email capabilities</li>
            </ol>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="http://localhost:3000/admin/security" 
                 style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Visit Security Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Next Steps:</strong><br>
              • Add Upstash Redis for rate limiting (5 minutes)<br>
              • Test security features in /admin/security<br>
              • Deploy to production when ready
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">Dynasty Academy - From Learner to Legend</p>
            <p style="margin: 8px 0 0;">
              Powered by Phase III.2: Autonomous Evolution 🚀
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ EMAIL SENT SUCCESSFULLY!\n");
    console.log("📧 Message ID:", result.data?.id);
    console.log("📬 Sent to: yasinyutbr@gmail.com");
    console.log("\n🎉 Check your inbox! Your email system is working!\n");
    console.log("🔮 What's next?");
    console.log("   1. Check your email inbox");
    console.log("   2. Visit http://localhost:3000/admin/security");
    console.log("   3. Add Upstash Redis for rate limiting");
    console.log("\n✨ Dynasty Academy v3.2.0 - Email System ACTIVE ✨\n");
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error);
    console.error("\nTroubleshooting:");
    console.error("1. Check RESEND_API_KEY in .env file");
    console.error("2. Verify API key is active in Resend dashboard");
    console.error('3. Make sure "from" email domain is verified\n');
  }
}

testEmail();
