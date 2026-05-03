# ⚡ Quick Commands Reference

## 🚀 For You (Pushing to GitHub)

```bash
# 1. Check what will be committed
git status

# 2. Add all files (respecting .gitignore)
git add .

# 3. Commit with message
git commit -m "Add Quick Commerce Agent project"

# 4. Push to GitHub (first time)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main

# 5. Push to GitHub (subsequent times)
git push origin main
```

---

## 👥 For Your Friend (Setting Up)

### **One-Time Setup:**

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Install Node.js dependencies
cd backend
npm install

# 3. Install Chromium browser
npx playwright install chromium

# 4. Install Python dependencies & Firefox
cd ../blinkit-mcp
uv sync
uv run python -m playwright install firefox

# 5. Configure environment
cd ../backend
cp .env.sample .env
# Edit .env and add GROQ_API_KEY

# 6. Login to Instamart
node loginInstamart.js
# Follow prompts in browser

# 7. Start server
node server.js
```

### **Daily Usage:**

```bash
# Start server
cd backend
node server.js

# Open UI
# Then open frontend/index.html in browser
```

---

## 🔧 Maintenance Commands

### **Update Dependencies:**
```bash
# Node.js
cd backend
npm update

# Python
cd blinkit-mcp
uv sync
```

### **Re-login to Instamart:**
```bash
cd backend
node loginInstamart.js
```

### **Clear Cache:**
```bash
# Remove node_modules
cd backend
rm -rf node_modules
npm install

# Remove Python cache
cd ../blinkit-mcp
rm -rf .venv
uv sync
```

### **Check Versions:**
```bash
node --version    # Should be v18+
python --version  # Should be 3.12+
uv --version
npx playwright --version
```

---

## 🐛 Troubleshooting Commands

### **Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### **Check if .env Exists:**
```bash
cd backend
ls -la .env
cat .env
```

### **Reinstall Browsers:**
```bash
# Chromium
npx playwright install chromium

# Firefox
cd blinkit-mcp
uv run python -m playwright install firefox
```

---

## 📝 Git Commands

### **Check Status:**
```bash
git status
git log --oneline -5
```

### **Pull Latest Changes:**
```bash
git pull origin main
```

### **Discard Local Changes:**
```bash
git checkout -- .
git clean -fd
```

### **Create Branch:**
```bash
git checkout -b feature-name
git push -u origin feature-name
```

---

## 🔍 Debug Commands

### **Test Blinkit MCP:**
```bash
cd blinkit-mcp
uv run python main.py
# Should start MCP server
```

### **Test Groq API:**
```bash
cd backend
node -e "
const Groq = require('groq-sdk');
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});
console.log('Groq client created successfully');
"
```

### **Check Server Logs:**
```bash
cd backend
node server.js 2>&1 | tee server.log
```

---

## 📦 Package Management

### **List Installed Packages:**
```bash
# Node.js
cd backend
npm list --depth=0

# Python
cd blinkit-mcp
uv pip list
```

### **Add New Package:**
```bash
# Node.js
cd backend
npm install package-name

# Python
cd blinkit-mcp
uv add package-name
```

---

## 🎯 Quick Tests

### **Test Frontend:**
```bash
# Just open in browser
open frontend/index.html  # Mac
start frontend/index.html  # Windows
xdg-open frontend/index.html  # Linux
```

### **Test Backend:**
```bash
cd backend
node server.js
# Visit http://localhost:3001
```

### **Test MCP Connection:**
```bash
# Check Blinkit tools
curl http://localhost:3001/blinkit-tools

# Check Blinkit login
curl http://localhost:3001/check-blinkit-login
```

---

## 💾 Backup Commands

### **Backup Session Files:**
```bash
cp instamart-session.json instamart-session.backup.json
```

### **Backup Environment:**
```bash
cp backend/.env backend/.env.backup
```

---

## 🧹 Cleanup Commands

### **Remove All Generated Files:**
```bash
# Node modules
rm -rf backend/node_modules

# Python venv
rm -rf blinkit-mcp/.venv

# Session files
rm instamart-session.json

# Browser data
rm -rf .blinkit-browser-data

# Logs
rm -rf *.log
```

### **Fresh Start:**
```bash
# Remove everything except source code
git clean -fdx
# Then run setup again
```

---

## 📊 Monitoring Commands

### **Watch Server Logs:**
```bash
cd backend
node server.js | tee -a server.log
```

### **Monitor Network:**
```bash
# Check if ports are open
netstat -an | grep 3001
```

### **Check Process:**
```bash
# Windows
tasklist | findstr node

# Mac/Linux
ps aux | grep node
```

---

## 🎓 Learning Commands

### **Explore Code:**
```bash
# Count lines of code
find . -name "*.js" -o -name "*.py" | xargs wc -l

# Find TODO comments
grep -r "TODO" --include="*.js" --include="*.py"

# List all functions
grep -r "function\|async function" backend/*.js
```

---

**💡 Tip:** Bookmark this file for quick reference!
