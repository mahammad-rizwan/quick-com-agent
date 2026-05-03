import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let client          = null;
let cachedAddressId = null;

export async function getInstamartClient() {
  if (client) return client;
  const transport = new StdioClientTransport({
    command: "npx",
    args:    ["mcp-remote", "https://mcp.swiggy.com/im"]
  });
  client = new Client({ name: "instamart-client", version: "1.0.0" });
  await client.connect(transport);
  console.log("✅ Instamart MCP connected");
  return client;
}

export async function getAddressId() {
  if (cachedAddressId) return cachedAddressId;

  try {
    const c      = await getInstamartClient();
    const result = await c.callTool({ name: "get_addresses", arguments: {} });
    const text   = result.content[0].text;
    
    console.log("DEBUG: get_addresses response:", text);
    
    const data = JSON.parse(text);
    const addresses = data?.data?.addresses || [];
    
    if (addresses.length === 0) {
      throw new Error("No saved addresses found. Please add an address in your Swiggy account first.");
    }

    cachedAddressId = addresses[0].id;
    console.log(`✅ Using address ID: ${cachedAddressId} (${addresses[0].area || 'Unknown area'})`);
    return cachedAddressId;
  } catch (e) {
    console.error("DEBUG: Address fetch error:", e);
    throw new Error(`Failed to get Swiggy address: ${e.message}`);
  }
}

export async function searchInstamart(productName, quantity) {
  try {
    const c         = await getInstamartClient();
    const addressId = await getAddressId();
    const result    = await c.callTool({
      name:      "search_products",
      arguments: { query: `${quantity} ${productName}`, addressId }
    });
    return { platform: "Instamart", data: result, error: null };
  } catch (err) {
    return { platform: "Instamart", data: null, error: err.message };
  }
}