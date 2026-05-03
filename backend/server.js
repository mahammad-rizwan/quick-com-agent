import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";
import { parseUserMessage }                    from "./inputParser.js";
import { searchAllPlatforms, addToCartByChoice } from "./cartManager.js";

dotenv.config();

const app      = express();
app.use(cors());
app.use(express.json());

const sessions = {};

function getSession(id) {
  if (!sessions[id]) sessions[id] = { history: [], shopState: null };
  return sessions[id];
}

// ── Chat intent ───────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { message, sessionId = "default" } = req.body;
  const session = getSession(sessionId);

  const parsed = await parseUserMessage(message, session.history);

  session.history.push({ role: "user",      content: message       });
  session.history.push({ role: "assistant", content: parsed.reply  });
  if (session.history.length > 20) session.history.splice(0, 2);

  res.json(parsed);
});

// ── Shop Live SSE ─────────────────────────────────────────────────
app.get("/shop-live", async (req, res) => {
  const { message, sessionId = "default" } = req.query;

  res.setHeader("Content-Type",                "text/event-stream");
  res.setHeader("Cache-Control",               "no-cache");
  res.setHeader("Connection",                  "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const send = (type, data) =>
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);

  const session = getSession(sessionId);

  try {
    const parsed = await parseUserMessage(message, session.history);

    if (!parsed.products || parsed.products.length === 0) {
      send("error", { message: "No products found. Please tell me what you need!" });
      return res.end();
    }

    send("parsed", { products: parsed.products, reply: parsed.reply });

    const state = await searchAllPlatforms(parsed.products, send);
    session.shopState = { ...state, products: parsed.products };

    send("done", {});
  } catch (err) {
    send("error", { message: err.message });
  } finally {
    res.end();
  }
});

// ── Add to Cart SSE ───────────────────────────────────────────────
app.get("/add-to-cart-stream", async (req, res) => {
  const { choice, sessionId = "default" } = req.query;

  res.setHeader("Content-Type",                "text/event-stream");
  res.setHeader("Cache-Control",               "no-cache");
  res.setHeader("Connection",                  "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const send = (type, data) =>
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);

  const session = getSession(sessionId);

  if (!session?.shopState) {
    send("error", { message: "Session expired. Please search again." });
    return res.end();
  }

  try {
    const {
      products, blinkitPage, instamartPage,
      blinkitClient, instamartClient,
      addressId, blinkitData, instamartData,
      recommendation, blinkitEta, instamartEta
    } = session.shopState;

    await addToCartByChoice(
      choice, products,
      blinkitPage, instamartPage,
      blinkitClient, instamartClient,
      addressId, blinkitData, instamartData,
      send,
      recommendation,
      blinkitEta  ?? 10,
      instamartEta ?? 20
    );
  } catch (err) {
    send("error", { message: err.message });
  } finally {
    res.end();
  }
});

app.listen(3001, () => console.log("🚀 Server running at http://localhost:3001"));

// Add temporarily to server.js
app.get("/blinkit-tools", async (req, res) => {
  try {
    const { getBlinkitClient } = await import("./mcpClients/blinkitClient.js");
    const client = await getBlinkitClient();
    const tools  = await client.listTools();
    console.log("📋 Blinkit Tools:");
    console.log(JSON.stringify(tools, null, 2));
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/check-blinkit-login", async (req, res) => {
  try {
    const { getBlinkitClient } = await import("./mcpClients/blinkitClient.js");
    const client = await getBlinkitClient();
    const result = await client.callTool({ name: "check_login", arguments: {} });
    console.log("Login status:", result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/blinkit-login", async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const { getBlinkitClient } = await import("./mcpClients/blinkitClient.js");
    const client = await getBlinkitClient();

    if (otp) {
      // Enter OTP
      const result = await client.callTool({
        name: "enter_otp",
        arguments: { otp }
      });
      res.json(result);
    } else {
      // Send OTP
      const result = await client.callTool({
        name: "login",
        arguments: { phone_number: phone }
      });
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/blinkit-set-location", async (req, res) => {
  try {
    const { getBlinkitClient } = await import("./mcpClients/blinkitClient.js");
    const client = await getBlinkitClient();
    const result = await client.callTool({
      name: "set_location",
      arguments: { location_name: "detect" }  // auto-detects your location
    });
    console.log("Location set:", result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to server.js temporarily
app.get("/check-instamart-cart", async (req, res) => {
  try {
    const { getInstamartClient } = await import("./mcpClients/instamartClient.js");
    const client = await getInstamartClient();
    const result = await client.callTool({ name: "get_cart", arguments: {} });
    console.log("Instamart cart:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});