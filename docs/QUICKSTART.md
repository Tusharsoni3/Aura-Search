# Quick Start Guide - Aura Search

Get Aura Search running in 5 minutes!

## Prerequisites
- Node.js v25.9+, npm, PostgreSQL
- Mistral AI API key
- Tavily API key
- Gmail with App Password

## Installation

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/aura-search.git
cd aura-search
```

### 2. Backend
```bash
cd backend
npm install

# Copy .env.example to .env and fill in your keys
cp .env.example .env

# Edit .env with your credentials
nano .env

# Create database
createdb aura_search

# Run migrations
npm run db:push

# Start server
npm run dev
```

### 3. Frontend
```bash
cd ../frontend
npm install

# Start dev server
npm run dev
```

### 4. Open Browser
Visit **http://localhost:5173**

---

## First Run Checklist

- [ ] Backend runs without errors
- [ ] Frontend loads at localhost:5173
- [ ] Can sign up with valid email
- [ ] Receive welcome email
- [ ] Can sign in
- [ ] Can send a message
- [ ] Receive AI response with streaming

---

## Common Issues

### Port 3000 Already in Use
```bash
lsof -ti:3000 | xargs kill -9
```

### Database Connection Fails
```bash
# Check PostgreSQL is running
brew services start postgresql

# Create database
createdb aura_search

# Try migrations
npm run db:push
```

### Email Not Sending
- Verify Gmail App Password (not regular password)
- Enable 2FA on Gmail first
- Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` in .env

### Socket Connection Fails
- Ensure backend is running on port 3000
- Check Vite proxy points to localhost:3000

---

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Check [API Documentation](./API.md)
3. Review [Contributing Guidelines](../CONTRIBUTING.md)

Happy coding! 🚀
