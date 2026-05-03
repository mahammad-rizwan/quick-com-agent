# 🛒 Quick Commerce Agent - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Workflow & Data Flow](#workflow--data-flow)
6. [Features](#features)
7. [File Structure](#file-structure)
8. [Setup & Installation](#setup--installation)
9. [API Endpoints](#api-endpoints)
10. [How It Works](#how-it-works)

---

## 🎯 Project Overview

**Quick Commerce Agent** is an AI-powered grocery shopping assistant that helps users compare prices and delivery times across **Blinkit** and **Swiggy Instamart**, two major quick commerce platforms in India.

### **What It Does:**
- 🤖 **AI-Powered Chat Interface** - Natural language interaction using Groq LLaMA 3.3
- 🔍 **Multi-Platform Search** - Searches products on both Blinkit and Instamart simultaneously
- 💰 **Price Comparison** - Shows real-time prices and delivery times
- 🧠 **Smart Recommendations** - AI suggests the best option (cheapest, fastest, or best overall)
- 🛒 **Automated Cart Management** - Adds items to cart automatically
- 🌐 **Visual Browser Automation** - Opens actual websites for visual confirmation

### **Use Case:**
Users can simply type: *"I need 1kg tomato, 1kg potato, and 1kg sugar"*

The agent will:
1. Search both platforms
2. Compare prices and delivery times
3. Recommend the best option
4. Add items to cart with one click
5. Open cart pages for checkout

---

## 🏗️ Architecture

### **High-Level Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                      (HTML/CSS/JavaScript)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/SSE
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│                      (Node.js Backend)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Chat Handler │  │ Shop Handler │  │ Cart Handler │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────┬────────────────────┬────────────────────┬──────────────┘
         │                    │                    │
         │                    │                    │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │  Groq   │         │ Browser │         │   MCP   │
    │   AI    │         │ Manager │         │ Clients │
    └─────────┘         └────┬────┘         └────┬────┘
                             │                    │
                    ┌────────┴────────┐    ┌──────┴──────┐
                    │                 │    │             │
              ┌─────▼─────┐     ┌────▼────▼──┐    ┌────▼─────┐
              │ Chromium  │     │  Python MCP │    │  Remote  │
              │(Instamart)│     │  (Blinkit)  │    │   MCP    │
              └───────────┘     └─────────────┘    │(Instamart)│
                                                    └──────────┘
```

### **Component Interaction:**

```
User Input → AI Parser → Search Both Platforms → Compare Results
                                                        ↓
                                              AI Recommendation
                                                        ↓
                                              User Chooses Option
                                                        ↓
                                              Add to Cart(s)
                                                        ↓
                                              Show Cart Pages
```

---

## 💻 Technology Stack

### **Frontend:**
- **HTML5** - Structure
- **CSS3** - Styling (inline, modern design)
- **Vanilla JavaScript** - Client-side logic
- **Server-Sent Events (SSE)** - Real-time updates

### **Backend:**
- **Node.js** (v18+) - Runtime
- **Express.js** - Web server
- **Playwright** - Browser automation
  - Chromium for Instamart
  - Firefox for Blinkit (via Python MCP)

### **AI & NLP:**
- **Groq API** - LLaMA 3.3 70B model
- **Natural Language Processing** - Intent detection & product extraction

### **Integration:**
- **Model Context Protocol (MCP)** - Standardized API communication
  - Python MCP Server (Blinkit)
  - Remote MCP Server (Instamart)

### **Python (Blinkit MCP):**
- **FastMCP** - MCP server framework
- **Playwright (Python)** - Browser automation
- **Python 3.12+** - Runtime
- **uv** - Package manager

---

## 🧩 System Components

### **1. Frontend (UI Layer)**

**File:** `frontend/index.html`

**Features:**
- Chat interface with message history
- Real-time progress panel (SSE)
- Price comparison cards
- AI recommendation display
- Cart summary with checkout links

**Key Functions:**
- `sendMessage()` - Sends user input to backend
- `chooseOption()` - Handles cart addition choice
- `buildSearchCard()` - Renders price comparison
- `buildRecCard()` - Renders AI recommendations
- `buildCartCard()` - Renders cart summary

---

### **2. Backend Server**

**File:** `backend/server.js`

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat` | POST | Parse user message (chat vs shop intent) |
| `/shop-live` | GET (SSE) | Search products and stream progress |
| `/add-to-cart-stream` | GET (SSE) | Add items to cart and stream progress |
| `/blinkit-tools` | GET | Debug: List Blinkit MCP tools |
| `/check-blinkit-login` | GET | Debug: Check Blinkit login status |
| `/blinkit-login` | POST | Debug: Login to Blinkit |
| `/check-instamart-cart` | GET | Debug: Check Instamart cart |

**Session Management:**
- Stores conversation history (last 20 messages)
- Caches search results for cart operations
- Session-based state management

---

### **3. AI Parser**

**File:** `backend/inputParser.js`

**Functions:**

#### `parseUserMessage(message, history)`
**Purpose:** Analyze user input and determine intent

**Input:**
```javascript
"I need 1kg tomato and 2kg potato"
```

**Output:**
```json
{
  "intent": "shop",
  "reply": "Sure! Let me search for that on Blinkit and Instamart right away!",
  "products": [
    {"name": "tomato", "quantity": "1kg"},
    {"name": "potato", "quantity": "2kg"}
  ]
}
```

**AI Model:** Groq LLaMA 3.3 70B
**Temperature:** 0 (deterministic)

#### `generateRecommendation(products, blinkitData, instamartData)`
**Purpose:** Generate AI-powered shopping recommendations

**Input:**
```javascript
{
  "tomato": {
    "blinkit": {price: 52, eta: 10},
    "instamart": {price: 45, eta: 15}
  }
}
```

**Output:**
```json
{
  "cheapest": {
    "platform": "Instamart",
    "totalPrice": 45,
    "totalEta": 15,
    "reason": "Saves ₹7 compared to Blinkit"
  },
  "fastest": {
    "platform": "Blinkit",
    "totalPrice": 52,
    "totalEta": 10,
    "reason": "5 minutes faster delivery"
  },
  "bestOverall": {
    "platform": "Instamart",
    "totalPrice": 45,
    "totalEta": 15,
    "reason": "Best value with reasonable delivery time"
  }
}
```

---

### **4. Cart Manager**

**File:** `backend/cartManager.js`

**Main Functions:**

#### `searchAllPlatforms(products, send)`
**Purpose:** Search products on both platforms simultaneously

**Process:**
1. Connect to browsers (Chromium + Firefox via MCP)
2. Connect to MCP clients (Blinkit + Instamart)
3. Search each product on both platforms in parallel
4. Parse results (extract ID, name, price)
5. Extract delivery ETAs
6. Generate AI recommendation
7. Send results to frontend via SSE

**Parsers:**
- `parseBlinkitResults(text)` - Regex-based parsing
  - Pattern: `[0] ID: 123456 | Product Name - ₹45`
- `parseInstamartResults(text)` - JSON parsing
  - Extracts: `spinId`, `price`, `quantityDescription`

#### `addToCartByChoice(choice, products, ...)`
**Purpose:** Add items to selected platform(s)

**Choices:**
- `"cheapest"` - Add to platform with lowest total price
- `"fastest"` - Add to platform with fastest delivery
- `"best"` - Add to AI-recommended platform
- `"both"` - Add to both platforms
- `"blinkit"` - Add only to Blinkit
- `"instamart"` - Add only to Instamart

**Process:**
1. Check Blinkit login status
2. Determine which platform(s) to use based on choice
3. Add items to Blinkit (one by one via MCP)
4. Add items to Instamart (batch via MCP)
5. Show cart pages
6. Send cart summary to frontend

---

### **5. Browser Manager**

**File:** `backend/browserManager.js`

**Purpose:** Manage browser automation for visual confirmation

**Browsers:**
- **Chromium** - Instamart (managed by Node.js)
- **Firefox** - Blinkit (managed by Python MCP)

**Functions:**

#### `connectToFirefox()`
**Purpose:** Launch Instamart browser with stealth mode

**Features:**
- Session persistence (saved login)
- Anti-detection measures
- Geolocation (Bangalore coordinates)
- Retry logic for error pages

#### `searchOnInstamart(page, query, send)`
**Purpose:** Navigate to Instamart search results

**Process:**
1. Bring browser to front
2. Navigate to search URL
3. Wait for page load
4. Check for error pages
5. Retry if needed

#### `showInstamartCart(page, send)`
**Purpose:** Open Instamart cart page

**Features:**
- Retry logic (3 attempts)
- Error page detection
- Session expiry handling

---

### **6. MCP Clients**

#### **Blinkit Client**
**File:** `backend/mcpClients/blinkitClient.js`

**Connection:**
```javascript
{
  command: "uv",
  args: ["run", "main.py"],
  cwd: "blinkit-mcp",
  env: { HEADLESS: "false" }
}
```

**Available Tools:**
- `check_login` - Check if logged in
- `login` - Send OTP to phone
- `enter_otp` - Enter OTP code
- `set_location` - Set delivery location
- `search` - Search for products
- `add_to_cart` - Add item to cart
- `remove_from_cart` - Remove item from cart
- `check_cart` - View cart contents
- `get_addresses` - List saved addresses
- `select_address` - Change delivery address
- `checkout` - Proceed to checkout
- `select_payment_method` - Choose payment
- `pay_now` - Complete payment

#### **Instamart Client**
**File:** `backend/mcpClients/instamartClient.js`

**Connection:**
```javascript
{
  command: "npx",
  args: ["mcp-remote", "https://mcp.swiggy.com/im"]
}
```

**Available Tools:**
- `get_addresses` - List saved addresses
- `search_products` - Search for products
- `get_cart` - View cart contents
- `update_cart` - Update cart items (batch)

**Address Management:**
- Caches first address ID
- Uses for all search/cart operations

---

### **7. Presentation Mode**

**File:** `backend/presentationMode.js`

**Purpose:** Fallback mode for demos when MCP fails

**Features:**
- Mock cart operations
- Simulated delays (realistic timing)
- Progress updates
- Cart summary generation

**Use Case:** Ensures demo works even if:
- MCP servers are down
- Network issues occur
- Authentication fails

---

## 🔄 Workflow & Data Flow

### **Complete User Journey:**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER INPUT                                               │
└─────────────────────────────────────────────────────────────────┘
User types: "I need 1kg tomato, 1kg potato, 1kg sugar"
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: AI INTENT DETECTION                                     │
└─────────────────────────────────────────────────────────────────┘
POST /chat
  → Groq AI analyzes message
  → Detects intent: "shop"
  → Extracts products: [
      {name: "tomato", quantity: "1kg"},
      {name: "potato", quantity: "1kg"},
      {name: "sugar", quantity: "1kg"}
    ]
  → Returns friendly reply
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: MULTI-PLATFORM SEARCH (Parallel)                        │
└─────────────────────────────────────────────────────────────────┘
GET /shop-live (SSE stream)
  │
  ├─→ Connect to Browsers
  │   ├─→ Chromium (Instamart)
  │   └─→ Firefox (Blinkit via MCP)
  │
  ├─→ Connect to MCP Clients
  │   ├─→ Blinkit MCP (Python)
  │   └─→ Instamart MCP (Remote)
  │
  └─→ For each product:
      │
      ├─→ BLINKIT SEARCH
      │   ├─→ Browser: Navigate to search page
      │   ├─→ MCP: Call search tool
      │   ├─→ Parse: Extract products
      │   └─→ Result: [{id, name, price}]
      │
      ├─→ INSTAMART SEARCH
      │   ├─→ Browser: Navigate to search page
      │   ├─→ MCP: Call search_products tool
      │   ├─→ Parse: Extract products
      │   └─→ Result: [{spinId, name, price, qty}]
      │
      └─→ Send to Frontend:
          {
            product: "tomato",
            quantity: "1kg",
            blinkit: [{name: "Fresh Tomato", price: 52}],
            instamart: [{name: "Tomato", price: 45}],
            blinkitEta: 10,
            instamartEta: 15
          }
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: AI RECOMMENDATION                                       │
└─────────────────────────────────────────────────────────────────┘
Groq AI analyzes all results:
  → Calculates total prices
  → Compares delivery times
  → Generates recommendations:
    {
      cheapest: {platform: "Instamart", totalPrice: 135, ...},
      fastest: {platform: "Blinkit", totalPrice: 156, ...},
      bestOverall: {platform: "Instamart", totalPrice: 135, ...}
    }
  → Sends to frontend
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: USER CHOICE                                             │
└─────────────────────────────────────────────────────────────────┘
User clicks: "Cheapest Price" (Instamart)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: ADD TO CART                                             │
└─────────────────────────────────────────────────────────────────┘
GET /add-to-cart-stream?choice=cheapest (SSE stream)
  │
  ├─→ Check Blinkit Login
  │   └─→ MCP: check_login tool
  │
  ├─→ Determine Platform (Instamart for cheapest)
  │
  ├─→ Add to Instamart Cart
  │   ├─→ MCP: get_cart (get existing items)
  │   ├─→ Merge: existing + new items
  │   ├─→ MCP: update_cart (batch update)
  │   └─→ Browser: Navigate to cart page
  │
  └─→ Send Cart Summary:
      {
        instamartCart: [
          {name: "Tomato", price: 45, quantity: "1kg"},
          {name: "Potato", price: 40, quantity: "1kg"},
          {name: "Sugar", price: 50, quantity: "1kg"}
        ],
        instamartTotal: 135,
        instamartEta: 15,
        checkoutLinks: {
          instamart: "https://www.swiggy.com/instamart"
        }
      }
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: CHECKOUT                                                │
└─────────────────────────────────────────────────────────────────┘
User clicks: "Checkout on Instamart"
  → Opens Instamart cart page in browser
  → User completes payment manually
```

---

## ✨ Features

### **1. Natural Language Processing**
- Understands casual conversation
- Extracts products and quantities
- Handles variations (1kg, 1 kg, one kilogram)
- Maintains conversation context

### **2. Multi-Platform Search**
- Searches Blinkit and Instamart simultaneously
- Real-time progress updates
- Parallel execution for speed
- Error handling and retries

### **3. Price Comparison**
- Side-by-side comparison
- Highlights cheapest option
- Shows delivery times
- Displays product variations

### **4. AI Recommendations**
- Cheapest option
- Fastest delivery
- Best overall value
- Personalized reasoning

### **5. Automated Cart Management**
- One-click cart addition
- Batch operations
- Preserves existing cart items
- Visual confirmation

### **6. Browser Automation**
- Real browser windows
- Visual feedback
- Session persistence
- Anti-detection measures

### **7. Real-Time Updates**
- Server-Sent Events (SSE)
- Live progress tracking
- Status indicators
- Error notifications

---

## 📁 File Structure

```
gro_chatbot/
├── backend/
│   ├── server.js                 # Express server & API endpoints
│   ├── cartManager.js            # Search & cart operations
│   ├── inputParser.js            # AI message parsing
│   ├── browserManager.js         # Browser automation
│   ├── presentationMode.js       # Demo fallback mode
│   ├── loginInstamart.js         # Utility: Instamart login
│   ├── .env                      # Environment variables
│   ├── package.json              # Node.js dependencies
│   └── mcpClients/
│       ├── blinkitClient.js      # Blinkit MCP integration
│       └── instamartClient.js    # Instamart MCP integration
│
├── frontend/
│   └── index.html                # Web UI (HTML/CSS/JS)
│
├── blinkit-mcp/                  # Python MCP Server
│   ├── main.py                   # Entry point
│   ├── .env                      # Python config
│   ├── pyproject.toml            # Python dependencies
│   └── src/
│       ├── server.py             # FastMCP server
│       ├── auth/                 # Authentication
│       ├── order/                # Order management
│       └── utils/                # Utilities
│
├── instamart-session.json        # Saved Instamart login
└── STATUS_REPORT.md              # Project status
```

---

## 🚀 Setup & Installation

### **Prerequisites:**
- Node.js 18+
- Python 3.12+
- uv (Python package manager)
- Playwright browsers

### **Installation Steps:**

#### **1. Clone Repository**
```bash
git clone <repository-url>
cd gro_chatbot
```

#### **2. Backend Setup**
```bash
cd backend
npm install
```

#### **3. Install Playwright Browsers**
```bash
# Node.js Playwright (for Instamart)
npx playwright install chromium

# Python Playwright (for Blinkit)
cd ../blinkit-mcp
uv run python -m playwright install firefox
```

#### **4. Configure Environment**

**backend/.env:**
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

**blinkit-mcp/.env:**
```env
SERVE_HTTPS=false
HEADLESS=false
```

#### **5. Login to Instamart**
```bash
cd backend
node loginInstamart.js
# Follow prompts to login
# Session saved to instamart-session.json
```

#### **6. Start Server**
```bash
cd backend
node server.js
```

#### **7. Open UI**
- Open `frontend/index.html` in browser
- Or visit `http://localhost:3001`

---

## 🔌 API Endpoints

### **POST /chat**
**Purpose:** Parse user message and detect intent

**Request:**
```json
{
  "message": "I need 1kg tomato",
  "sessionId": "default"
}
```

**Response:**
```json
{
  "intent": "shop",
  "reply": "Sure! Let me search for that...",
  "products": [
    {"name": "tomato", "quantity": "1kg"}
  ]
}
```

---

### **GET /shop-live** (SSE)
**Purpose:** Search products and stream progress

**Query Parameters:**
- `message` - User's shopping request
- `sessionId` - Session identifier

**SSE Events:**
```javascript
// Progress update
{type: "progress", platform: "blinkit", message: "Searching...", status: "loading"}

// Search result
{type: "search_result", product: "tomato", blinkit: [...], instamart: [...]}

// AI recommendation
{type: "recommendation", recommendation: {...}}

// Completion
{type: "done"}

// Error
{type: "error", message: "Error description"}
```

---

### **GET /add-to-cart-stream** (SSE)
**Purpose:** Add items to cart and stream progress

**Query Parameters:**
- `choice` - User's choice (cheapest/fastest/best/both/blinkit/instamart)
- `sessionId` - Session identifier

**SSE Events:**
```javascript
// Progress update
{type: "progress", platform: "blinkit", message: "Adding...", status: "loading"}

// Cart summary
{
  type: "cart_summary",
  blinkitCart: [...],
  instamartCart: [...],
  blinkitTotal: 156,
  instamartTotal: 135,
  checkoutLinks: {...}
}

// Error
{type: "error", message: "Error description"}
```

---

## 🎯 How It Works

### **Example Scenario:**

**User Input:**
```
"I need 1kg tomato, 1kg potato, and 1kg sugar"
```

**Step 1: AI Parsing**
```json
{
  "intent": "shop",
  "products": [
    {"name": "tomato", "quantity": "1kg"},
    {"name": "potato", "quantity": "1kg"},
    {"name": "sugar", "quantity": "1kg"}
  ]
}
```

**Step 2: Search Results**
```
Blinkit:
- Tomato: ₹52 (10 mins)
- Potato: ₹48 (10 mins)
- Sugar: ₹56 (10 mins)
Total: ₹156

Instamart:
- Tomato: ₹45 (15 mins)
- Potato: ₹40 (15 mins)
- Sugar: ₹50 (15 mins)
Total: ₹135
```

**Step 3: AI Recommendation**
```json
{
  "cheapest": {
    "platform": "Instamart",
    "totalPrice": 135,
    "totalEta": 15,
    "reason": "Saves ₹21 compared to Blinkit"
  },
  "fastest": {
    "platform": "Blinkit",
    "totalPrice": 156,
    "totalEta": 10,
    "reason": "5 minutes faster delivery"
  },
  "bestOverall": {
    "platform": "Instamart",
    "totalPrice": 135,
    "totalEta": 15,
    "reason": "Best value with reasonable delivery time"
  }
}
```

**Step 4: User Chooses "Cheapest"**
- Items added to Instamart cart
- Cart page opens in Chromium browser
- User sees cart summary in UI

**Step 5: Checkout**
- User clicks "Checkout on Instamart"
- Redirected to Instamart cart
- Completes payment manually

---

## 🎨 UI Components

### **Chat Area**
- Message bubbles (user/bot)
- Product cards with price comparison
- AI recommendation cards
- Cart summary cards

### **Progress Panel**
- Live activity indicator
- Platform-specific progress logs
- Status icons (loading/done/error)
- Real-time updates via SSE

### **Price Comparison Card**
```
📦 1kg tomato
┌─────────────────┬─────────────────┐
│ ⚡ BLINKIT      │ 🧡 INSTAMART   │
│ Fresh Tomato    │ Tomato          │
│ ₹52 [CHEAPEST]  │ ₹58             │
│ 🕐 ~10 mins     │ 🕐 ~15 mins     │
└─────────────────┴─────────────────┘
```

### **Recommendation Card**
```
🤖 Pick your preference to add to cart

🏷️ Cheapest Price
   Instamart — ₹135 — ~15 mins
   Saves ₹21 compared to Blinkit
   [Choose]

⚡ Fastest Delivery
   Blinkit — ₹156 — ~10 mins
   5 minutes faster delivery
   [Choose]

🏆 Best Overall
   Instamart — ₹135 — ~15 mins
   Best value with reasonable delivery time
   [Choose]

🛒 Add to Both
   Add to cart on both platforms
   [Choose]
```

---

## 🔐 Security & Privacy

### **Session Management:**
- Session-based state (no database)
- Temporary storage (cleared on restart)
- No sensitive data stored

### **Authentication:**
- Blinkit: Session saved in Python MCP
- Instamart: Session saved in JSON file
- No passwords stored

### **Browser Automation:**
- Anti-detection measures
- Stealth mode enabled
- User-agent spoofing
- WebDriver property hidden

---

## 🐛 Error Handling

### **Network Errors:**
- Retry logic (3 attempts)
- Timeout handling
- Graceful degradation

### **MCP Errors:**
- Fallback to presentation mode
- Error messages to user
- Debug logging

### **Browser Errors:**
- Session expiry detection
- Error page detection
- Automatic refresh

---

## 📊 Performance

### **Optimization:**
- Parallel searches (both platforms simultaneously)
- Batch cart operations (Instamart)
- Browser reuse (persistent connections)
- Cached address IDs

### **Timing:**
- Search: ~5-10 seconds
- Cart addition: ~3-5 seconds
- Total workflow: ~15-20 seconds

---

## 🎓 Learning Resources

### **Technologies Used:**
- [Express.js](https://expressjs.com/)
- [Playwright](https://playwright.dev/)
- [Groq API](https://groq.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [FastMCP](https://github.com/jlowin/fastmcp)

---

## 🚀 Future Enhancements

### **Potential Features:**
- [ ] More platforms (BigBasket, Zepto, etc.)
- [ ] Price history tracking
- [ ] Scheduled orders
- [ ] Voice input
- [ ] Mobile app
- [ ] User accounts
- [ ] Order history
- [ ] Favorites/wishlists
- [ ] Notifications

---

## 📝 Notes

### **Limitations:**
- Requires manual login (one-time)
- Depends on platform availability
- Subject to platform changes
- No payment automation (security)

### **Best Practices:**
- Keep sessions updated
- Monitor MCP server health
- Check browser compatibility
- Update dependencies regularly

---

## 🎉 Conclusion

**Quick Commerce Agent** is a fully functional AI-powered shopping assistant that demonstrates:
- Modern web technologies
- AI integration
- Browser automation
- Real-time communication
- Multi-platform integration

**Perfect for:**
- Learning full-stack development
- Understanding AI applications
- Exploring browser automation
- Building practical tools

---

**Built with ❤️ for smart grocery shopping!**
