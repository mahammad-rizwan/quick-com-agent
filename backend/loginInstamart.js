// backend/loginInstamart.js
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname      = path.dirname(fileURLToPath(import.meta.url));
const SESSION_FILE   = path.resolve(__dirname, "../instamart-session.json");

async function main() {
  console.log("\n🔥 INSTAMART LOGIN FOR PRESENTATION 🔥\n");
  
  console.log("Press Enter to open browser...");
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
    ],
  });
  
  const context = await browser.newContext({
    viewport: null,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
  });
  
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.chrome = { runtime: {} };
  });
  
  const page = await context.newPage();
  
  console.log("\n🌐 Opening Swiggy Instamart...");
  await page.goto("https://www.swiggy.com/instamart", {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("📱 LOG IN NOW IN THE BROWSER WINDOW:");
  console.log("   1. Enter your phone number");
  console.log("   2. Enter the OTP");
  console.log("   3. Make sure you see your profile/cart icon");
  console.log("=".repeat(60));
  console.log("\n🚨 AFTER YOU'RE LOGGED IN, COME BACK HERE AND PRESS ENTER 🚨\n");
  
  // Wait for user confirmation
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  console.log("💾 Saving your session...");
  
  // Check if logged in
  const url = page.url();
  if (url.includes("login") || url.includes("signin")) {
    console.error("\n❌ STILL ON LOGIN PAGE!");
    console.error("   Please complete the login first, then run this script again.\n");
    await browser.close();
    process.exit(1);
  }
  
  // Save session
  const storageState = await context.storageState();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(storageState, null, 2));
  
  console.log(`\n✅ SUCCESS! Session saved with ${storageState.cookies.length} cookies`);
  console.log("✅ You can now close the browser and run: node server.js\n");
  
  await browser.close();
  process.exit(0);
}

main().catch(e => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});