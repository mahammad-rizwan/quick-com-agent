# 🚀 Setup Guide - Quick Commerce Agent

## 📋 Table of Contents
1. [For You (Pushing to Repo)](#for-you-pushing-to-repo)
2. [For Your Friend (Pulling & Setup)](#for-your-friend-pulling--setup)
3. [Troubleshooting](#troubleshooting)

---

## 👤 For You (Pushing to Repo)

### **Step 1: Prepare Your Repository**

#### **1.1 Check Git Status**
```bash
git status
```

#### **1.2 Review What Will Be Pushed**
The `.gitignore` file will automatically exclude:
- ❌ `node_modules/` (too large, will be installed by your friend)
- ❌ `.env` (contains your API keys - sensitive!)
- ❌ `instamart-session.json` (contains your login - sensitive!)
- ❌ `.blinkit-browser-data/` (contains your browser session)
- ❌ Python `__pycache__/` and `.venv/`
- ✅ Everything else will be pushed

#### **1.3 Verify Sensitive Files Are Excluded**
```bash
# Check if .env is ignored
git check-ignore backend/.env
# Should output: backend/.env

# Check if session file is ignored
git check-ignore instamart-session.json
# Should output: instamart-session.json
```

---

### **Step 2: Add Files to Git**

```bash
# Add all files (respecting .gitignore)
git add .

# Check what's staged
git status
```

**You should see:**
- ✅ All `.js` files
- ✅ `frontend/index.html`
- ✅ `package.json` files
- ✅ `.env.sample` files
- ✅ Documentation files
- ✅ Python source files
- ❌ NOT `node_modules/`
- ❌ NOT `.env`
- ❌ NOT `instamart-session.json`

---

### **Step 3: Commit Changes**

```bash
git commit -m "Add Quick Commerce Agent - AI-powered grocery shopping assistant

Features:
- Multi-platform search (Blinkit + Instamart)
- AI-powered price comparison
- Automated cart management
- Real-time browser automation
- Natural language processing

Tech Stack:
- Node.js + Express
- Python MCP Server
- Groq AI (LLaMA 3.3)
- Playwright automation
"
```

---

### **Step 4: Push to GitHub**

#### **4.1 If This Is a New Repository:**
```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### **4.2 If Repository Already Exists:**
```bash
git push origin main
```

---

### **Step 5: Share Setup Instructions**

Send your friend:
1. **Repository URL:** `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
2. **This file:** `SETUP_GUIDE.md`
3. **Your Groq API Key** (or tell them to get their own from https://console.groq.com/)

---

## 👥 For Your Friend (Pulling & Setup)

### **Prerequisites:**

Before starting, install:
- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **Python** (v3.12 or higher) - [Download](https://www.python.org/)
- ✅ **uv** (Python package manager) - [Install Guide](https://docs.astral.sh/uv/getting-started/installation/)
- ✅ **Git** - [Download](https://git-scm.com/)

---

### **Step 1: Clone Repository**

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Navigate to project
cd YOUR_REPO_NAME
```

---

### **Step 2: Backend Setup**

#### **2.1 Install Node.js Dependencies**
```bash
cd backend
npm install
```

**This will install:**
- Express.js
- Playwright
- Groq SDK
- MCP SDK
- Other dependencies

#### **2.2 Configure Environment Variables**
```bash
# Copy sample env file
cp .env.sample .env

# Edit .env file
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Add your Groq API Key:**
```env
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=3001
```

**Get Groq API Key:**
1. Go to https://console.groq.com/
2. Sign up / Log in
3. Create API key
4. Copy and paste into `.env`

---

### **Step 3: Install Playwright Browsers**

#### **3.1 Install Chromium (for Instamart)**
```bash
# Still in backend/ directory
npx playwright install chromium
```

#### **3.2 Install Firefox (for Blinkit - Python)**
```bash
# Navigate to blinkit-mcp
cd ../blinkit-mcp

# Install Python dependencies and Firefox
uv sync
uv run python -m playwright install firefox
```

---

### **Step 4: Configure Blinkit MCP**

```bash
# Still in blinkit-mcp/ directory
# Copy sample env file
cp .env.sample .env
```

**The `.env` should contain:**
```env
SERVE_HTTPS=false
HEADLESS=false
```

---

### **Step 5: Login to Instamart**

```bash
# Navigate back to backend
cd ../backend

# Run login script
node loginInstamart.js
```

**Follow the prompts:**
1. Press Enter to open browser
2. Browser will open to Swiggy Instamart
3. Login with your phone number
4. Enter OTP
5. Wait for login to complete
6. Come back to terminal and press Enter
7. Session will be saved to `instamart-session.json`

---

### **Step 6: Start the Server**

```bash
# Still in backend/ directory
node server.js
```

**You should see:**
```
🚀 Server running at http://localhost:3001
```

---

### **Step 7: Open the UI**

**Option 1: Direct File**
- Open `frontend/index.html` in your browser

**Option 2: Via Server**
- Visit `http://localhost:3001` in your browser

---

### **Step 8: Test the Application**

1. **Type in chat:** `"I need 1kg tomato, 1kg potato, 1kg sugar"`
2. **Watch:**
   - Firefox opens (Blinkit)
   - Chromium opens (Instamart)
   - Prices appear in comparison cards
   - AI recommendation shows
3. **Click:** Choose an option (Cheapest/Fastest/Best)
4. **Verify:** Items added to cart

---

## 🎯 Quick Start Checklist

### **For You (Before Pushing):**
- [ ] Created `.gitignore` file
- [ ] Created `.env.sample` files
- [ ] Removed sensitive data from code
- [ ] Tested that `.env` is ignored
- [ ] Committed all changes
- [ ] Pushed to GitHub
- [ ] Shared repo URL with friend

### **For Your Friend (After Pulling):**
- [ ] Installed Node.js (v18+)
- [ ] Installed Python (v3.12+)
- [ ] Installed uv
- [ ] Cloned repository
- [ ] Ran `npm install` in backend/
- [ ] Created `.env` with Groq API key
- [ ] Installed Chromium: `npx playwright install chromium`
- [ ] Installed Firefox: `uv run python -m playwright install firefox`
- [ ] Logged into Instamart: `node loginInstamart.js`
- [ ] Started server: `node server.js`
- [ ] Opened UI and tested

---

## 🐛 Troubleshooting

### **Issue 1: "GROQ_API_KEY not found"**
**Solution:**
```bash
# Make sure .env exists in backend/
cd backend
ls -la .env  # Should show the file

# Check contents
cat .env  # Should show GROQ_API_KEY=...
```

---

### **Issue 2: "Playwright Firefox not installed"**
**Solution:**
```bash
cd blinkit-mcp
uv run python -m playwright install firefox
```

---

### **Issue 3: "Instamart session expired"**
**Solution:**
```bash
cd backend
node loginInstamart.js
# Login again
```

---

### **Issue 4: "Module not found"**
**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
```

---

### **Issue 5: "Port 3001 already in use"**
**Solution:**
```bash
# Change port in backend/.env
PORT=3002

# Or kill process using port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

---

### **Issue 6: "uv command not found"**
**Solution:**
```bash
# Install uv
# Windows (PowerShell):
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Mac/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## 📞 Getting Help

### **Check Documentation:**
- `PROJECT_DOCUMENTATION.md` - Complete project details
- `README.md` - Quick overview

### **Common Commands:**

```bash
# Check Node.js version
node --version  # Should be v18+

# Check Python version
python --version  # Should be 3.12+

# Check uv version
uv --version

# Check if Playwright is installed
npx playwright --version

# View server logs
cd backend
node server.js  # Watch console output
```

---

## 🎉 Success Indicators

**Everything is working if you see:**

1. ✅ Server starts without errors
2. ✅ Two browsers open (Firefox + Chromium)
3. ✅ Prices show in UI comparison cards
4. ✅ AI recommendations appear
5. ✅ Items add to cart successfully
6. ✅ Cart pages open in browsers

---

## 📝 Important Notes

### **For You:**
- ⚠️ **Never commit `.env` files** (contains API keys)
- ⚠️ **Never commit session files** (contains login credentials)
- ⚠️ **Never commit `node_modules/`** (too large)
- ✅ **Always use `.env.sample`** for sharing config structure

### **For Your Friend:**
- 🔑 **Get your own Groq API key** (free at console.groq.com)
- 🔐 **Login with your own accounts** (Blinkit & Instamart)
- 📍 **Set your own location** (for accurate delivery times)
- 💾 **Keep session files private** (don't share or commit)

---

## 🚀 Next Steps After Setup

1. **Read Documentation:** `PROJECT_DOCUMENTATION.md`
2. **Explore Features:** Try different products
3. **Test Platforms:** Compare Blinkit vs Instamart
4. **Customize:** Modify UI, add features
5. **Deploy:** Consider hosting options

---

## 🎓 Learning Resources

- **Node.js:** https://nodejs.org/docs
- **Express.js:** https://expressjs.com/
- **Playwright:** https://playwright.dev/
- **Groq API:** https://console.groq.com/docs
- **MCP Protocol:** https://modelcontextprotocol.io/

---

**Happy Coding! 🎉**

If you encounter any issues not covered here, check the full documentation or create an issue in the repository.
