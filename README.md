# 🛒 Quick Commerce Agent

> AI-powered grocery shopping assistant that compares prices across Blinkit and Swiggy Instamart

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 What It Does

**Quick Commerce Agent** helps you find the best deals on groceries by:
- 🔍 Searching products on **Blinkit** and **Instamart** simultaneously
- 💰 Comparing prices and delivery times in real-time
- 🤖 Using AI to recommend the best option
- 🛒 Adding items to cart automatically
- 🌐 Opening actual websites for visual confirmation

---

## ✨ Features

- **Natural Language Processing** - Just type what you need in plain English
- **Multi-Platform Search** - Searches both platforms in parallel
- **AI Recommendations** - Smart suggestions for cheapest, fastest, or best overall
- **Automated Cart Management** - One-click cart additions
- **Real-Time Updates** - Live progress tracking with Server-Sent Events
- **Browser Automation** - Visual confirmation in actual browsers

---

## 🎬 Demo

```
You: "I need 1kg tomato, 1kg potato, and 1kg sugar"

Agent: 
📦 1kg tomato
⚡ Blinkit: ₹52 (10 mins)
🧡 Instamart: ₹45 (15 mins) [CHEAPEST]

📦 1kg potato
⚡ Blinkit: ₹48 (10 mins)
🧡 Instamart: ₹40 (15 mins) [CHEAPEST]

📦 1kg sugar
⚡ Blinkit: ₹56 (10 mins)
🧡 Instamart: ₹50 (15 mins) [CHEAPEST]

🤖 Recommendation: Choose Instamart
   Total: ₹135 (saves ₹21)
   Delivery: 15 minutes

[Cheapest] [Fastest] [Best Overall] [Add to Both]
```

---

## 🚀 Quick Start

### **Prerequisites:**
- Node.js 18+
- Python 3.12+
- uv (Python package manager)

### **Installation:**

```bash
# 1. Clone repository
git clone <your-repo-url>
cd quick-commerce-agent

# 2. Install backend dependencies
cd backend
npm install

# 3. Install browsers
npx playwright install chromium
cd ../blinkit-mcp
uv run python -m playwright install firefox

# 4. Configure environment
cd ../backend
cp .env.sample .env
# Add your Groq API key to .env

# 5. Login to Instamart
node loginInstamart.js

# 6. Start server
node server.js

# 7. Open frontend/index.html in browser
```

**📖 Detailed Setup:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              Quick Commerce Agent                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Blinkit         │      │  Instamart       │   │
│  │  (Firefox)       │      │  (Chromium)      │   │
│  │  Python MCP      │      │  Node.js         │   │
│  └──────────────────┘      └──────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         Groq AI (LLaMA 3.3 70B)             │  │
│  │  • Intent Detection                          │  │
│  │  • Product Extraction                        │  │
│  │  • Smart Recommendations                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### **Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Server-Sent Events (SSE) for real-time updates

### **Backend:**
- Node.js + Express.js
- Playwright (Browser automation)
- Groq API (AI/NLP)

### **Integration:**
- Model Context Protocol (MCP)
- Python MCP Server (Blinkit)
- Remote MCP Server (Instamart)

---

## 📁 Project Structure

```
quick-commerce-agent/
├── backend/
│   ├── server.js              # Express server
│   ├── cartManager.js         # Search & cart logic
│   ├── inputParser.js         # AI message parsing
│   ├── browserManager.js      # Browser automation
│   ├── mcpClients/            # MCP integrations
│   └── package.json
│
├── frontend/
│   └── index.html             # Web UI
│
├── blinkit-mcp/               # Python MCP Server
│   ├── main.py
│   ├── src/
│   └── pyproject.toml
│
├── PROJECT_DOCUMENTATION.md   # Complete documentation
├── SETUP_GUIDE.md            # Setup instructions
└── README.md                 # This file
```

---

## 🎯 How It Works

1. **User Input:** Type your grocery needs in natural language
2. **AI Parsing:** Groq AI extracts products and quantities
3. **Multi-Platform Search:** Searches Blinkit and Instamart in parallel
4. **Price Comparison:** Shows side-by-side comparison
5. **AI Recommendation:** Suggests best option based on price and delivery time
6. **Cart Management:** Adds items to selected platform(s)
7. **Visual Confirmation:** Opens cart pages in browsers

---

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat` | POST | Parse user message |
| `/shop-live` | GET (SSE) | Search products |
| `/add-to-cart-stream` | GET (SSE) | Add to cart |

---

## 🛠️ Configuration

### **Environment Variables:**

**backend/.env:**
```env
GROQ_API_KEY=your_groq_api_key
PORT=3001
```

**blinkit-mcp/.env:**
```env
SERVE_HTTPS=false
HEADLESS=false
```

---

## 📖 Documentation

- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete technical documentation
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions

---

## 🐛 Troubleshooting

### **Common Issues:**

**"GROQ_API_KEY not found"**
```bash
# Make sure .env exists with your API key
cd backend
cat .env
```

**"Playwright browser not installed"**
```bash
# Install browsers
npx playwright install chromium
cd blinkit-mcp
uv run python -m playwright install firefox
```

**"Session expired"**
```bash
# Re-login to Instamart
cd backend
node loginInstamart.js
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** - For the amazing AI API
- **Playwright** - For browser automation
- **Model Context Protocol** - For standardized integrations
- **Blinkit & Swiggy** - For the platforms

---

## 📞 Support

- **Documentation:** [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **Setup Help:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Issues:** Create an issue in the repository

---

## 🎓 Learning Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Playwright Documentation](https://playwright.dev/)
- [Groq API Documentation](https://console.groq.com/docs)
- [MCP Protocol](https://modelcontextprotocol.io/)

---

## 🚀 Future Enhancements

- [ ] Support for more platforms (BigBasket, Zepto)
- [ ] Price history tracking
- [ ] Voice input
- [ ] Mobile app
- [ ] User accounts
- [ ] Order history

---

## ⚠️ Disclaimer

This project is for educational purposes. Always respect the terms of service of the platforms you're automating. Use responsibly.

---

**Built with ❤️ for smart grocery shopping!**

---

## 📊 Stats

- **Languages:** JavaScript, Python, HTML/CSS
- **Frameworks:** Express.js, FastMCP
- **AI Model:** LLaMA 3.3 70B (via Groq)
- **Platforms:** Blinkit, Swiggy Instamart
- **Browsers:** Firefox, Chromium

---

**⭐ Star this repo if you find it useful!**
