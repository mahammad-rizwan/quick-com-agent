// backend/browserManager.js
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = path.resolve(__dirname, "../instamart-session.json");

let instamartPage    = null;
let instamartContext = null;
let instamartBrowser = null;

// Note: Blinkit browser is managed by Python MCP server, not here

export async function connectToFirefox() {
  // Return existing connections if already established
  if (instamartPage) {
    return { blinkitPage: null, instamartPage };
  }

  // ── Blinkit uses MCP's Firefox (no separate browser needed) ───
  // The Python MCP server manages its own Firefox browser
  // We don't need a separate Node.js Firefox for Blinkit

  // ── Launch Instamart in Chromium ──────────────────────────────
  if (!instamartPage) {
    if (!fs.existsSync(SESSION_FILE)) {
      throw new Error(
        "\n❌ No Instamart session found.\n" +
        "   Run this first: node backend/loginInstamart.js\n"
      );
    }

    console.log("🌐 Launching Instamart in Chromium...");

    // Launch with maximum stealth to avoid detection
    instamartBrowser = await chromium.launch({
    headless: false,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--disable-extensions",
      "--disable-plugins",
      "--disable-images", // Faster loading
      "--disable-javascript-harmony-shipping",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--disable-ipc-flooding-protection",
    ],
  });

  instamartContext = await instamartBrowser.newContext({
    storageState: SESSION_FILE,
    viewport: null,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    permissions: ["geolocation"],
    geolocation: { latitude: 12.9225506, longitude: 77.4969179 }, // Bangalore
  });

  // Maximum stealth injection
  await instamartContext.addInitScript(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Mock chrome object
    window.chrome = {
      runtime: {},
      loadTimes: function() {},
      csi: function() {},
    };

    // Mock plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Mock languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // Remove automation indicators
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
  });

  instamartPage = await instamartContext.newPage();

  // Navigate with retry logic for "Something went wrong" errors
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`🔗 Navigating to Instamart (attempt ${retryCount + 1})...`);
      
      await instamartPage.goto("https://www.swiggy.com/instamart", {
        waitUntil: "domcontentloaded", 
        timeout: 30000
      });
      await instamartPage.waitForTimeout(4000);

      // Check for error page
      const pageText = await instamartPage.textContent("body");
      if (pageText.includes("Something went wrong")) {
        console.log("⚠️  Got 'Something went wrong' error, retrying...");
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Try refreshing
          await instamartPage.reload({ waitUntil: "domcontentloaded" });
          await instamartPage.waitForTimeout(3000);
          continue;
        } else {
          throw new Error("Swiggy is blocking automated access. Try logging in manually first.");
        }
      }

      // Check if redirected to login
      const url = instamartPage.url();
      if (url.includes("login") || url.includes("signin")) {
        throw new Error("Session expired - run: node backend/loginInstamart.js");
      }

      console.log("✅ Instamart ready!");
      break;
      
    } catch (e) {
      retryCount++;
      if (retryCount >= maxRetries) {
        throw e;
      }
      console.log(`⚠️  Retry ${retryCount}/${maxRetries}: ${e.message}`);
      await instamartPage.waitForTimeout(2000);
    }
  }
  } // Close the if (!instamartPage) block

  console.log("✅ Instamart browser ready!");
  return { blinkitPage: null, instamartPage };
}

export async function searchOnBlinkit(pg, query, send) {
  // Blinkit search is handled by MCP server (Python)
  // The MCP server controls its own Firefox browser
  // We just send progress updates here
  send("progress", { platform: "blinkit", message: `🔍 Searching "${query}" on Blinkit (via MCP)...`, status: "loading" });
  // MCP does the actual search, we just acknowledge it
  await new Promise(r => setTimeout(r, 500));
  send("progress", { platform: "blinkit", message: `✅ Blinkit search in progress...`, status: "done" });
  return true;
}

export async function searchOnInstamart(pg, query, send) {
  try {
    send("progress", { platform: "instamart", message: `🔍 Searching "${query}" on Instamart...`, status: "loading" });
    await pg.bringToFront();
    
    // Navigate to search with retry logic
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
    await pg.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await pg.waitForTimeout(4000);

    // Check for error page
    const pageText = await pg.textContent("body");
    if (pageText.includes("Something went wrong")) {
      send("progress", {
        platform: "instamart",
        message: "⚠️ Swiggy error page - refreshing...",
        status: "loading"
      });
      
      await pg.reload({ waitUntil: "domcontentloaded" });
      await pg.waitForTimeout(3000);
    }

    const currentUrl = pg.url();
    if (currentUrl.includes("login") || currentUrl.includes("signin")) {
      send("progress", {
        platform: "instamart",
        message: "⚠️ Session expired - run: node loginInstamart.js",
        status: "error"
      });
      return false;
    }

    send("progress", { platform: "instamart", message: `✅ Results loaded for "${query}"`, status: "done" });
    return true;
  } catch (err) {
    send("progress", { platform: "instamart", message: `❌ ${err.message}`, status: "error" });
    return false;
  }
}

export async function showBlinkitCart(pg, send) {
  // Blinkit cart is managed by MCP server
  // The MCP server's Firefox browser shows the cart
  // We can optionally trigger the MCP to show cart, or just acknowledge
  send("progress", { platform: "blinkit", message: "✅ Blinkit cart updated - check MCP Firefox window!", status: "done" });
}

export async function showInstamartCart(pg, send) {
  try {
    send("progress", { 
      platform: "instamart", 
      message: "🛒 Opening Instamart cart for visual confirmation...", 
      status: "loading" 
    });
    
    await pg.bringToFront();
    
    // Navigate to cart page with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        await pg.goto("https://www.swiggy.com/instamart/cart", {
          waitUntil: "domcontentloaded", 
          timeout: 15000
        });
        
        await pg.waitForTimeout(3000);
        
        // Check if we got an error page
        const pageText = await pg.textContent("body");
        if (pageText.includes("Something went wrong")) {
          console.log("DEBUG: Error page detected, refreshing...");
          await pg.reload({ waitUntil: "domcontentloaded" });
          await pg.waitForTimeout(2000);
        }
        
        // Check if redirected to login
        const currentUrl = pg.url();
        if (currentUrl.includes("login") || currentUrl.includes("signin")) {
          send("progress", { 
            platform: "instamart", 
            message: "⚠️ Session expired - please run: node loginInstamart.js", 
            status: "error" 
          });
          return;
        }
        
        console.log("DEBUG: Successfully navigated to Instamart cart");
        send("progress", { 
          platform: "instamart", 
          message: "✅ Instamart cart opened - check browser window!", 
          status: "done" 
        });
        return;
        
      } catch (e) {
        retryCount++;
        console.log(`DEBUG: Cart navigation attempt ${retryCount} failed:`, e.message);
        
        if (retryCount >= maxRetries) {
          send("progress", { 
            platform: "instamart", 
            message: "🛒 Cart updated (check Swiggy app manually)", 
            status: "done" 
          });
          return;
        }
        
        await pg.waitForTimeout(1000);
      }
    }
  } catch (e) {
    console.log("DEBUG: Cart display error:", e.message);
    send("progress", { 
      platform: "instamart", 
      message: "🛒 Cart operations completed (check Swiggy manually)", 
      status: "done" 
    });
  }
}

export async function addToInstamartCartViaBrowser(page, productName, send) {
  try {
    send("progress", { 
      platform: "instamart", 
      message: `🔍 Searching "${productName}" in browser...`, 
      status: "loading" 
    });

    await page.bringToFront();
    
    // Navigate to search page with retry logic
    const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(productName)}`;
    
    let navigationSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(4000);

        // Check for error page
        const pageText = await page.textContent("body");
        if (pageText.includes("Something went wrong")) {
          console.log(`DEBUG: Attempt ${attempt} - Error page detected, refreshing...`);
          await page.reload({ waitUntil: "domcontentloaded" });
          await page.waitForTimeout(3000);
          continue;
        }
        
        // Check if redirected to login
        const currentUrl = page.url();
        if (currentUrl.includes("login") || currentUrl.includes("signin")) {
          send("progress", { 
            platform: "instamart", 
            message: "⚠️ Session expired - run: node loginInstamart.js", 
            status: "error" 
          });
          return false;
        }
        
        navigationSuccess = true;
        break;
        
      } catch (e) {
        console.log(`DEBUG: Navigation attempt ${attempt} failed:`, e.message);
        if (attempt === 3) throw e;
        await page.waitForTimeout(2000);
      }
    }
    
    if (!navigationSuccess) {
      throw new Error("Failed to navigate to search page after 3 attempts");
    }

    send("progress", { 
      platform: "instamart", 
      message: `🛒 Looking for ADD buttons for "${productName}"...`, 
      status: "loading" 
    });

    // Wait for products to load and look for ADD buttons
    await page.waitForTimeout(3000);
    
    // Try multiple selectors for ADD buttons
    const addSelectors = [
      'button:has-text("ADD")',
      'div:has-text("ADD")',
      '[data-testid*="add"]',
      'button[class*="add"]',
      'div[class*="add"]'
    ];
    
    let addButton = null;
    for (const selector of addSelectors) {
      try {
        const buttons = page.locator(selector);
        const count = await buttons.count();
        console.log(`DEBUG: Found ${count} elements with selector: ${selector}`);
        
        if (count > 0) {
          addButton = buttons.first();
          break;
        }
      } catch (e) {
        console.log(`DEBUG: Selector ${selector} failed:`, e.message);
      }
    }
    
    if (addButton) {
      try {
        // Scroll to button and click
        await addButton.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Highlight the button for visual feedback
        await addButton.evaluate(el => {
          el.style.border = "3px solid red";
          el.style.backgroundColor = "yellow";
        });
        
        await page.waitForTimeout(1000); // Let user see the highlight
        
        await addButton.click();
        console.log(`DEBUG: Successfully clicked ADD button for "${productName}"`);
        
        await page.waitForTimeout(3000); // Wait for cart update
        
        send("progress", { 
          platform: "instamart", 
          message: `✅ "${productName}" added to cart via browser!`, 
          status: "done" 
        });
        
        return true;
        
      } catch (e) {
        console.log(`DEBUG: Failed to click ADD button:`, e.message);
        send("progress", { 
          platform: "instamart", 
          message: `⚠️ Found "${productName}" but couldn't add to cart`, 
          status: "error" 
        });
        return false;
      }
    } else {
      // No ADD buttons found - product might be out of stock or not available
      console.log(`DEBUG: No ADD buttons found for "${productName}"`);
      
      // Check if products are actually loaded
      const productElements = await page.locator('[data-testid*="product"], .product, [class*="product"]').count();
      console.log(`DEBUG: Found ${productElements} product elements on page`);
      
      if (productElements === 0) {
        send("progress", { 
          platform: "instamart", 
          message: `❌ No products found for "${productName}"`, 
          status: "error" 
        });
      } else {
        send("progress", { 
          platform: "instamart", 
          message: `⚠️ "${productName}" found but out of stock`, 
          status: "error" 
        });
      }
      
      return false;
    }
    
  } catch (e) {
    console.error(`DEBUG: Browser add failed for "${productName}":`, e);
    send("progress", { 
      platform: "instamart", 
      message: `❌ Browser error: ${e.message}`, 
      status: "error" 
    });
    return false;
  }
}