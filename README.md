# Aura Search - AI-Powered Chat with Real-Time Web Search

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)
![Node](https://img.shields.io/badge/Node-v25.9+-green.svg)
![React](https://img.shields.io/badge/React-v19.2+-blue.svg)

> **Aura Search** is a sophisticated AI chat application that combines real-time web search capabilities with advanced language models to provide accurate, up-to-date answers. Built with modern web technologies, it features streaming responses, conversation history, and a beautiful dark-themed UI.

---

## ✨ Features

### Core Functionality
- 🤖 **AI-Powered Conversations** - Powered by Mistral AI for intelligent responses
- 🌐 **Real-Time Web Search** - Uses Tavily API to fetch live internet data
- 💬 **Chat History** - Persistent conversation storage with PostgreSQL
- 📊 **Message Streaming** - Socket.io for smooth, real-time token-by-token response delivery
- 🔐 **Secure Authentication** - JWT tokens, bcrypt password hashing, email verification
- 🔑 **Optional 2FA** - Two-factor authentication support for enhanced security

### User Experience
- 🎨 **Professional Dark Theme** - Graphite Void + Indigo + Emerald color scheme
- ⚡ **Auto-Resizing Textarea** - Smart input with Enter to send, Shift+Enter for newlines
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎯 **Markdown Rendering** - Full GitHub-Flavored Markdown support with code syntax highlighting
- 💾 **Copy-to-Clipboard** - One-click code snippet copying
- 🔄 **Auto-Scroll** - Smooth scrolling to latest messages

### Account Management
- 📧 **Strict Email Validation** - Rejects disposable domains
- ✅ **Auto-Verified Signup** - No OTP needed; accounts active immediately
- 📨 **Welcome Emails** - Beautiful HTML emails sent to new users
- 👤 **User Profile** - Edit display name, view account details, manage 2FA
- 🚪 **Logout** - Secure session termination

---

## 🛠 Tech Stack

### Frontend
- **React 19.2** - UI component library
- **Vite 8.0** - Fast build tool & dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Socket.io Client** - Real-time bidirectional communication
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications
- **React Markdown + Remark GFM** - Markdown rendering
- **Lucide React** - 400+ icon components

### Backend
- **Node.js 25.9** - JavaScript runtime
- **Express 5.2** - Web framework
- **Socket.io 4.8** - WebSocket server for streaming
- **PostgreSQL 15+** - Relational database
- **Drizzle ORM 0.45** - Type-safe database access
- **Mistral AI API** - Language model provider
- **Tavily API** - Real-time web search
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email delivery (Gmail SMTP)
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

### DevOps & Tools
- **Docker** (optional) - Containerization
- **Nodemon** - Auto-reload during development
- **ESLint** - Code linting
- **npm** - Package management

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v25.9 or higher ([download](https://nodejs.org/))
- **npm** v10+ or **yarn**
- **PostgreSQL** 15+ ([download](https://www.postgresql.org/))
- **Git** ([download](https://git-scm.com/))

### External Services (Required)
- **Mistral AI API Key** - [Get free trial](https://console.mistral.ai/)
- **Tavily API Key** - [Sign up free](https://tavily.com/)
- **Gmail App Password** - [Generate](https://myaccount.google.com/apppasswords) (2FA enabled)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/aura-search.git
cd aura-search
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'ENVFILE'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aura_search

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI & Search APIs
MISTRAL_AI_KEY=your-mistral-api-key
TAVILY_API_KEY=your-tavily-api-key

# Email (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Optional: Mistral Model
MISTRAL_MODEL=mistral-medium-latest
ENVFILE

# Create database
createdb aura_search

# Generate & run migrations
npm run db:generate
npm run db:push

# Start server (with auto-reload)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local (optional, defaults to localhost:3000)
echo "VITE_API_URL=http://localhost:3000" > .env.local

# Start dev server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **WebSocket**: ws://localhost:3000

---

## 📖 Usage

### Getting Started
1. Visit http://localhost:5173
2. Sign up with a valid email (non-disposable domains only)
3. Check your email for the welcome message
4. Start chatting immediately — ask any question!

### Features in Action

#### Starting a Conversation
```
User: "What are the latest developments in AI?"
↓
Aura Search:
- Searches the web for recent AI news
- Generates a chat title automatically
- Streams response word-by-word
- Saves conversation to history
```

#### Using Chat History
- View all past conversations in the left sidebar
- Organized by: Today, Yesterday, Previous 7 Days, Older
- Click to resume any conversation
- Delete conversations with one click

#### Editing Your Profile
- Click your name/avatar in the sidebar footer
- Edit display name
- View account creation date
- Check 2FA status
- Logout securely

---

## 📁 Project Structure

```
aura-search/
├── backend/
│   ├── src/
│   │   ├── config/          # Mail & environment configs
│   │   ├── controller/      # Request handlers (auth, AI)
│   │   ├── db/              # Database schema & connection
│   │   ├── middleware/      # Auth & validation middleware
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (AI, search)
│   │   └── sockets/         # WebSocket handlers
│   ├── app.js               # Express app setup
│   ├── package.json         # Dependencies
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   └── chat/        # Chat-specific components
│   │   ├── context/         # React Context (Auth, Socket)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (API, helpers)
│   │   ├── pages/           # Page components
│   │   │   └── profile/     # User profile page
│   │   ├── App.jsx          # Routes & layout
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── vite.config.js       # Vite configuration
│   ├── package.json         # Dependencies
│   └── index.html           # HTML template
│
├── docs/                    # Documentation files
├── README.md                # This file
└── .gitignore               # Git ignore rules
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create new account |
| `POST` | `/api/auth/login` | Sign in with email/password |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/get-me` | Fetch current user |
| `POST` | `/api/auth/forgotPassword` | Request password reset |
| `POST` | `/api/auth/resetPassword/:token` | Reset password |
| `POST` | `/api/auth/twoFactorAuth` | Enable/disable 2FA |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chats/message` | Send message (triggers AI response) |
| `GET` | `/api/chats` | Fetch all user conversations |
| `GET` | `/api/chats/:chatId/messages` | Fetch messages in a chat |
| `DELETE` | `/api/chats/delete/:chatId` | Delete conversation |

### WebSocket Events

**Client → Server**
- `chat:send` - Send message with optional chatId

**Server → Client**
- `chat:start` - New chat created with ID
- `chat:token` - Stream token received
- `chat:done` - Response streaming complete
- `chat:error` - Error occurred

---

## 🎓 What I Learned

### Full-Stack Development
1. **Real-time Communication** - Implemented Socket.io for streaming responses, learned about connection lifecycle and reconnection strategies
2. **Database Design** - Structured PostgreSQL schema with relationships (users → chats → messages)
3. **Authentication Security** - JWT tokens, httpOnly cookies, bcrypt hashing, email validation
4. **API Design** - RESTful endpoints, error handling with structured `errors` objects, proper HTTP status codes

### Frontend Engineering
1. **React 19 + Vite** - Fast HMR, code splitting with lazy loading, build optimization
2. **State Management** - Context API for auth & socket state, avoiding prop drilling
3. **Responsive Design** - Tailwind CSS, mobile-first approach, flex/grid layouts
4. **Markdown Rendering** - Rendering complex formatted content with syntax highlighting
5. **Form Validation** - Client-side (live) + server-side validation with clear UX feedback
6. **Accessibility** - ARIA labels, keyboard navigation, focus management

### Backend Engineering
1. **Stream Processing** - Token-by-token AI response streaming with natural timing
2. **Middleware Architecture** - Authentication, validation, error handling layers
3. **Database ORM** - Drizzle ORM for type-safe queries
4. **External APIs** - Integrating Mistral AI and Tavily search APIs
5. **Email Delivery** - HTML email templates with nodemailer
6. **Deployment Readiness** - Environment variables, error logging, graceful shutdown

### DevOps & Best Practices
1. **Environment Management** - .env files, secrets handling, configuration by environment
2. **Error Handling** - Structured error responses for client-side mapping
3. **Logging** - Console logs for debugging development issues
4. **Security** - CORS, helmet middleware, input validation
5. **Performance** - Code splitting, lazy loading, optimized database queries

### UI/UX Design
1. **Color Theory** - Designed a professional dark theme (Graphite + Indigo + Emerald)
2. **Visual Hierarchy** - Text contrast, spacing, size distinctions
3. **Micro-interactions** - Loading states, hover effects, animations
4. **Accessibility** - Focus indicators, semantic HTML, ARIA attributes

---

## 🔧 Configuration

### Environment Variables (.env)

#### Database
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

#### Server
```
PORT=3000
NODE_ENV=development
```

#### Security
```
JWT_SECRET=use-a-strong-random-string-min-32-chars
```

#### AI & Search
```
MISTRAL_AI_KEY=sk-xxxxx
TAVILY_API_KEY=tvly-xxxxx
```

#### Email
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Sign up with valid email
- [ ] Receive welcome email
- [ ] Sign in with credentials
- [ ] View profile page
- [ ] Edit display name
- [ ] Logout

#### Chat Flow
- [ ] Send message to start new conversation
- [ ] Verify chat title generated (no markdown symbols)
- [ ] Watch response stream word-by-word
- [ ] See conversation saved in sidebar
- [ ] Delete a conversation
- [ ] Resume past conversation

#### Validation
- [ ] Try signing up with invalid email (disposable domain) → rejected
- [ ] Try empty password → shows inline error
- [ ] Try mismatched passwords → shows mismatch error
- [ ] Try duplicate email → shows "already exists"

---

## 🚀 Deployment

### Backend Deployment (Heroku / Railway / Render)
1. Push code to GitHub
2. Create PostgreSQL database on hosting platform
3. Set environment variables (DATABASE_URL, API keys, JWT_SECRET)
4. Deploy Node.js app
5. Update frontend API URL to production backend

### Frontend Deployment (Vercel / Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variable: `VITE_API_URL=https://your-backend.com`

### Production Checklist
- [ ] NODE_ENV=production
- [ ] Secure JWT_SECRET (32+ random chars)
- [ ] Enable CORS only for your frontend domain
- [ ] Set database backups
- [ ] Monitor API rate limits
- [ ] Enable error tracking (Sentry optional)

---

## 🐛 Troubleshooting

### Backend won't start
```
Error: EADDRINUSE: address already in use :::3000
→ Kill process: lsof -ti:3000 | xargs kill -9
```

### Database connection fails
```
Error: connect ECONNREFUSED 127.0.0.1:5432
→ Ensure PostgreSQL is running: brew services start postgresql
```

### Email not sending
```
Error: 535 5.7.8 Username and password not accepted
→ Use Gmail App Password (not regular password)
→ Ensure 2FA is enabled on Gmail account
```

### Socket not connecting
```
Client shows "connection refused"
→ Ensure backend is running
→ Check VITE proxy in vite.config.js points to correct port
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Style
- Use **2-space indentation**
- Follow **ESLint** rules (run `npm lint`)
- Write **descriptive commit messages**
- Add comments for complex logic

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Email**: your-email@example.com
- **Documentation**: See [/docs](./docs/) folder

---

## 🙏 Acknowledgments

- **Mistral AI** - Language model
- **Tavily** - Web search API
- **Tailwind CSS** - Styling framework
- **Socket.io** - Real-time communication
- **Drizzle ORM** - Type-safe database access

---

## 📊 Project Statistics

- **Frontend**: ~4,500 lines of JSX/CSS
- **Backend**: ~2,500 lines of JavaScript
- **Database**: 4 main tables with relationships
- **API Endpoints**: 11 REST + 3 WebSocket
- **Components**: 15+ reusable React components
- **Build Time**: ~500-800ms (dev)
- **Bundle Size**: 280KB (gzipped: 91KB)

---

<div align="center">

### Made with ❤️ and ☕

**[⬆ back to top](#aura-search---ai-powered-chat-with-real-time-web-search)**

</div>
