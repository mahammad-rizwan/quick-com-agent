// backend/mcpClients/blinkitClient.js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const BLINKIT_PATH = path.resolve(__dirname, "../../blinkit-mcp");

let client = null;

export async function getBlinkitClient() {
  if (client) return client;

  const transport = new StdioClientTransport({
    command: "uv",
    args:    ["run", "main.py"],
    cwd:     BLINKIT_PATH,
    env: {
      ...process.env,
      HEADLESS: "false"  // ✅ visible browser — uses saved login session
    }
  });

  client = new Client({ name: "blinkit-client", version: "1.0.0" });
  await client.connect(transport);
  console.log("✅ Blinkit MCP connected (visible browser)");
  return client;
}

export async function searchBlinkit(productName, quantity) {
  try {
    const c      = await getBlinkitClient();
    const result = await c.callTool({
      name:      "search",
      arguments: { query: `${quantity} ${productName}` }
    });
    return { platform: "Blinkit", data: result, error: null };
  } catch (err) {
    return { platform: "Blinkit", data: null, error: err.message };
  }
}
