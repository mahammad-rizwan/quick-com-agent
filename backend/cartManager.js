// backend/cartManager.js
import { getBlinkitClient } from "./mcpClients/blinkitClient.js";
import { getInstamartClient, getAddressId } from "./mcpClients/instamartClient.js";
import {
  connectToFirefox,
  searchOnBlinkit,
  searchOnInstamart,
  showBlinkitCart,
  showInstamartCart,
  addToInstamartCartViaBrowser
} from "./browserManager.js";
import { generateRecommendation } from "./inputParser.js";
import { presentationCart } from "./presentationMode.js";

// ── Parsers ───────────────────────────────────────────────────────

function parseBlinkitResults(text) {
  const lines    = text?.split('\n') || [];
  const products = [];
  for (const line of lines) {
    const match = line.match(/\[(\d+)\]\s+ID:\s+(\d+)\s+\|\s+(.+?)\s+-\s+₹(\d+)/);
    if (match) {
      products.push({
        index: parseInt(match[1]),
        id:    match[2],
        name:  match[3].trim(),
        price: parseInt(match[4])
      });
    }
  }
  return products;
}

function parseInstamartResults(text) {
  try {
    const data     = JSON.parse(text);
    const products = [];
    for (const p of (data.data?.products || [])) {
      const best = p.variations.find(v =>
        v.quantityDescription?.toLowerCase().includes('1 ltr') ||
        v.quantityDescription?.toLowerCase().includes('1l')    ||
        v.quantityDescription?.toLowerCase().includes('1 kg')  ||
        v.quantityDescription?.toLowerCase().includes('1kg')   ||
        v.quantityDescription?.toLowerCase().includes('500 g') ||
        v.quantityDescription?.toLowerCase().includes('500g')
      ) || p.variations[0];

      if (best) {
        products.push({
          name:   p.displayName,
          price:  best.price.offerPrice,
          mrp:    best.price.mrp,
          spinId: best.spinId,
          qty:    best.quantityDescription
        });
      }
    }
    return products;
  } catch { return []; }
}

// Extract ETA from Instamart search response (etaInMinutes field)
function extractInstamartEta(text) {
  try {
    const data = JSON.parse(text);
    // Try top-level ETA fields
    const eta =
      data?.data?.etaInMinutes ||
      data?.data?.storeEta ||
      data?.data?.deliveryEta ||
      data?.meta?.etaInMinutes;
    if (eta && typeof eta === "number") return eta;

    // Try from first product's store info
    const firstProduct = data?.data?.products?.[0];
    if (firstProduct?.storeEtaInMinutes) return firstProduct.storeEtaInMinutes;
    if (firstProduct?.etaInMinutes)      return firstProduct.etaInMinutes;
  } catch {}
  return null;
}

// Extract ETA from Blinkit MCP text response
function extractBlinkitEta(text) {
  if (!text) return null;
  // Look for patterns like "ETA: 12 mins" or "Delivery in 10 minutes"
  const match =
    text.match(/ETA[:\s]+(\d+)\s*min/i) ||
    text.match(/delivery in\s+(\d+)\s*min/i) ||
    text.match(/(\d+)\s*min.*delivery/i) ||
    text.match(/delivers in\s+(\d+)/i);
  if (match) return parseInt(match[1]);
  return null;
}

// ── Main search ───────────────────────────────────────────────────

export async function searchAllPlatforms(products, send) {
  const blinkitData   = {};
  const instamartData = {};

  send("progress", { platform: "blinkit",   message: "🔌 Connecting to browser (Blinkit)...",   status: "loading" });
  send("progress", { platform: "instamart", message: "🔌 Connecting to browser (Instamart)...", status: "loading" });

  const [{ blinkitPage, instamartPage }, blinkitClient, instamartClient] = await Promise.all([
    connectToFirefox(),
    getBlinkitClient(),
    getInstamartClient()
  ]);

  const addressId = await getAddressId();

  send("progress", { platform: "blinkit",   message: "✅ Blinkit browser ready!",   status: "done" });
  send("progress", { platform: "instamart", message: "✅ Instamart browser ready!", status: "done" });

  // Default ETAs — updated per-product if real values found
  let globalBlinkitEta   = 10;
  let globalInstamartEta = 20;

  for (const { name, quantity } of products) {
    const query = `${quantity} ${name}`;

    const [, , blinkitRes, instamartRes] = await Promise.all([
      searchOnBlinkit(blinkitPage, query, send),
      searchOnInstamart(instamartPage, query, send),

      blinkitClient.callTool({
        name: "search",
        arguments: { query }
      }).catch(() => null),

      instamartClient.callTool({
        name: "search_products",
        arguments: { query, addressId }
      }).catch(() => null)
    ]);

    const blinkitText   = blinkitRes?.content?.[0]?.text   || "";
    const instamartText = instamartRes?.content?.[0]?.text || "";

    // Debug logging
    console.log(`\n🔍 DEBUG - Search for "${query}":`);
    console.log(`Blinkit response length: ${blinkitText.length} chars`);
    console.log(`Blinkit response preview: ${blinkitText.substring(0, 200)}...`);

    const bItems  = blinkitText   ? parseBlinkitResults(blinkitText)   : [];
    const imItems = instamartText ? parseInstamartResults(instamartText) : [];

    console.log(`Blinkit parsed: ${bItems.length} items`);
    console.log(`Instamart parsed: ${imItems.length} items`);
    if (bItems.length > 0) {
      console.log(`Blinkit first item:`, bItems[0]);
    }

    const bBest  = bItems[0];
    const imBest = imItems[0];

    // ── Extract real ETAs ──────────────────────────────────────
    const blinkitEta   = extractBlinkitEta(blinkitText)     ?? globalBlinkitEta;
    const instamartEta = extractInstamartEta(instamartText) ?? globalInstamartEta;

    // Cache for next products (ETAs are store-level, same across products)
    globalBlinkitEta   = blinkitEta;
    globalInstamartEta = instamartEta;

    blinkitData[name] = {
      price: bBest?.price ?? null,
      eta:   blinkitEta,
      item:  bBest,
      items: bItems.slice(0, 3)
    };

    instamartData[name] = {
      price: imBest?.price ?? null,
      eta:   instamartEta,
      item:  imBest,
      items: imItems.slice(0, 3)
    };

    if (bBest)  send("progress", { platform: "blinkit",   message: `💰 ${bBest.name} — ₹${bBest.price}`,                   status: "done" });
    if (imBest) send("progress", { platform: "instamart", message: `💰 ${imBest.name} — ₹${imBest.price} (${imBest.qty})`, status: "done" });

    send("search_result", {
      product:      name,
      quantity,
      blinkit:      bItems.slice(0, 3),
      instamart:    imItems.slice(0, 3),
      blinkitEta,
      instamartEta
    });
  }

  send("progress", { platform: "system", message: "🧠 Analyzing best options...", status: "loading" });
  const recommendation = await generateRecommendation(products, blinkitData, instamartData);
  send("progress", { platform: "system", message: "✅ Analysis complete!", status: "done" });

  send("recommendation", { recommendation, blinkitData, instamartData, products });

  return {
    blinkitPage, instamartPage,
    blinkitClient, instamartClient,
    addressId, blinkitData, instamartData,
    recommendation,
    blinkitEta:   globalBlinkitEta,
    instamartEta: globalInstamartEta
  };
}

// ── Add to cart ───────────────────────────────────────────────────

export async function addToCartByChoice(
  choice, products,
  blinkitPage, instamartPage,
  blinkitClient, instamartClient,
  addressId, blinkitData, instamartData,
  send,
  recommendation = null,
  blinkitEta = 10,
  instamartEta = 20
) {
  const blinkitCart   = [];
  const instamartCart = [];
  const instamartItems = []; // Collect all Instamart items for single cart update

  // ── Check Blinkit login ────────────────────────────────────────
  send("progress", { platform: "blinkit", message: "🔐 Checking Blinkit login...", status: "loading" });
  let blinkitLoggedIn = false;
  try {
    const loginCheck = await blinkitClient.callTool({ name: "check_login", arguments: {} });
    const loginText  = loginCheck?.content?.[0]?.text || "";
    console.log(`\n🔐 DEBUG - Blinkit login check: "${loginText}"`);
    
    if (loginText.includes("Not Logged In")) {
      send("progress", { platform: "blinkit", message: "❌ Not logged in to Blinkit — skipping Blinkit cart", status: "error" });
      console.log("❌ Blinkit not logged in - items will be skipped");
    } else {
      blinkitLoggedIn = true;
      send("progress", { platform: "blinkit", message: "✅ Blinkit logged in!", status: "done" });
      console.log("✅ Blinkit logged in successfully");
    }
  } catch (e) {
    console.log(`❌ Blinkit login check error:`, e.message);
    send("progress", { platform: "blinkit", message: `⚠️ Login check: ${e.message}`, status: "error" });
  }

  // ── Determine which products go to which platform ─────────────
  for (const { name, quantity } of products) {
    const bd  = blinkitData[name];
    const imd = instamartData[name];

    const bPrice  = bd?.price  ?? Infinity;
    const imPrice = imd?.price ?? Infinity;

    let useBlinkit   = false;
    let useInstamart = false;

    if      (choice === "both")      { useBlinkit = true;  useInstamart = true;  }
    else if (choice === "blinkit")   { useBlinkit = true;                        }
    else if (choice === "instamart") {                      useInstamart = true;  }
    else if (choice === "fastest") {
      if ((bd?.eta ?? 999) <= (imd?.eta ?? 999)) useBlinkit   = true;
      else                                        useInstamart = true;
    } else {
      // cheapest or best — pick lower price
      if (bPrice <= imPrice) useBlinkit   = true;
      else                   useInstamart = true;
    }

    // ── Add to Blinkit (one by one) ────────────────────────────
    if (useBlinkit && blinkitLoggedIn && bd?.item) {
      console.log(`\n🛒 DEBUG - Adding to Blinkit: ${bd.item.name} (ID: ${bd.item.id})`);
      send("progress", {
        platform: "blinkit",
        message:  `🛒 Adding "${bd.item.name}" to Blinkit cart...`,
        status:   "loading"
      });
      try {
        await blinkitClient.callTool({
          name: "add_to_cart",
          arguments: { item_id: String(bd.item.id), quantity: 1 }
        });
        blinkitCart.push({ name: bd.item.name, price: bd.item.price, quantity, eta: bd.eta });
        console.log(`✅ Successfully added to Blinkit cart`);
        send("progress", {
          platform: "blinkit",
          message:  `✅ "${bd.item.name}" added — ₹${bd.item.price}`,
          status:   "done"
        });
      } catch (e) {
        console.log(`❌ Failed to add to Blinkit:`, e.message);
        send("progress", { platform: "blinkit", message: `❌ Failed: ${e.message}`, status: "error" });
      }
    } else {
      console.log(`\n⏭️  DEBUG - Skipping Blinkit for ${name}:`);
      console.log(`   useBlinkit: ${useBlinkit}`);
      console.log(`   blinkitLoggedIn: ${blinkitLoggedIn}`);
      console.log(`   bd?.item exists: ${!!bd?.item}`);
      if (bd?.item) console.log(`   Item: ${bd.item.name} (ID: ${bd.item.id})`);
    }

    // ── Collect Instamart items (don't add yet) ────────────────
    if (useInstamart && imd?.item) {
      instamartItems.push({
        spinId: imd.item.spinId,
        quantity: 1,
        name: imd.item.name,
        price: imd.item.price,
        eta: imd.eta
      });
      instamartCart.push({ name: imd.item.name, price: imd.item.price, quantity, eta: imd.eta });
    }
  }

  // ── Add ALL Instamart items ────────────────────────────────────
  if (instamartItems.length > 0) {
    send("progress", {
      platform: "instamart",
      message:  `🛒 Processing ${instamartItems.length} items for Instamart...`,
      status:   "loading"
    });

    // Try MCP first, then fallback to browser automation
    let mcpSuccess = false;
    
    try {
      // Get existing cart items first
      const cartResult = await instamartClient.callTool({
        name: "get_cart",
        arguments: {}
      });
      const cartData = JSON.parse(cartResult?.content?.[0]?.text || "{}");
      
      // Check if response indicates store unavailable
      if (cartData.message && cartData.message.includes("unavailable")) {
        throw new Error("Store unavailable");
      }
      
      const existingItems = cartData?.data?.items || [];
      console.log(`DEBUG: Found ${existingItems.length} existing items in cart`);
      
      // Merge existing + new items (CRITICAL: preserve existing items)
      const allItems = [
        ...existingItems.map(item => ({ 
          spinId: item.spinId, 
          quantity: item.quantity 
        })),
        ...instamartItems.map(item => ({ 
          spinId: item.spinId, 
          quantity: item.quantity 
        }))
      ];
      
      console.log(`DEBUG: Updating cart with ${allItems.length} total items`);
      
      await instamartClient.callTool({
        name: "update_cart",
        arguments: {
          selectedAddressId: addressId,
          items: allItems
        }
      });

      mcpSuccess = true;
      send("progress", {
        platform: "instamart",
        message:  `✅ Added ${instamartItems.length} items to existing cart (${existingItems.length} + ${instamartItems.length})`,
        status:   "done"
      });
      
    } catch (e) {
      console.log("DEBUG: MCP failed, using presentation mode:", e.message);
      
      send("progress", {
        platform: "instamart",
        message: `🎭 Demo mode: Adding ${instamartItems.length} items to Instamart...`,
        status: "loading"
      });
      
      // Use presentation mode for reliable demo
      await presentationCart.addToInstamartCart(
        instamartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          eta: item.eta
        })),
        send
      );
      
      // Update local cart for summary
      for (const item of instamartItems) {
        instamartCart.push({ 
          name: item.name, 
          price: item.price, 
          quantity: item.quantity, 
          eta: item.eta 
        });
      }
    }
    
    // Always show the cart page for visual confirmation
    await showInstamartCart(instamartPage, send);
  }

  // Show Blinkit cart if items were added
  if (blinkitCart.length > 0) {
    send("progress", { platform: "blinkit", message: "🛒 Opening Blinkit cart...", status: "loading" });
    try {
      // Use MCP to check/show cart
      const cartResult = await blinkitClient.callTool({
        name: "check_cart",
        arguments: {}
      });
      const cartText = cartResult?.content?.[0]?.text || "";
      console.log("Blinkit cart contents:", cartText);
      send("progress", { platform: "blinkit", message: "✅ Blinkit cart opened - check Firefox window!", status: "done" });
    } catch (e) {
      console.log("Could not open Blinkit cart:", e.message);
      send("progress", { platform: "blinkit", message: "✅ Items added to Blinkit cart!", status: "done" });
    }
  }

  // ── Final summary ──────────────────────────────────────────────
  const blinkitTotal   = blinkitCart.reduce((s, i)  => s + i.price, 0);
  const instamartTotal = instamartCart.reduce((s, i) => s + i.price, 0);

  send("cart_summary", {
    blinkitCart,
    instamartCart,
    blinkitTotal,
    instamartTotal,
    blinkitEta,
    instamartEta,
    recommendation,   // ← AI recommendation included in summary
    checkoutLinks: {
      blinkit:   "https://blinkit.com/cart",
      instamart: "https://www.swiggy.com/instamart"
    }
  });
}
