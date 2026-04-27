# Aura Search - Architecture Documentation

## System Overview

Aura Search is a full-stack web application built with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                  │
│              http://localhost:5173                      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/WebSocket
                         │
┌────────────────────────▼────────────────────────────────┐
│               Backend (Express.js + Socket.io)          │
│              http://localhost:3000                      │
└────────────────┬───────────────────┬───────────────────┘
                 │                   │
          ┌──────▼─────┐      ┌──────▼─────┐
          │ PostgreSQL │      │  External  │
          │  Database  │      │  APIs      │
          │            │      │            │
          │ • Users    │      │ Mistral AI │
          │ • Chats    │      │ Tavily     │
          │ • Messages │      │ Gmail SMTP │
          └────────────┘      └────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **React 19.2** - Modern UI library with hooks
- **Vite 8.0** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Context API** - Global state management

### Component Hierarchy
```
App (Routes)
├── ProtectedRoute / PublicRoute
│   ├── LandingPage
│   ├── LoginPage
│   ├── SignupPage
│   ├── ChatPage (Protected)
│   │   ├── Sidebar
│   │   │   ├── ChatItem (list)
│   │   │   └── User Footer (profile)
│   │   ├── ChatWindow
│   │   │   ├── WelcomeState
│   │   │   └── MessageBubble (list)
│   │   │       ├── User Bubble
│   │   │       └── AI Bubble (with Markdown)
│   │   └── SearchInput
│   ├── ProfilePage (Protected)
│   └── [Other Auth Pages]
```

### State Management

#### AuthContext
- **State**: `user`, `loading`, `isAuthenticated`
- **Methods**: `login()`, `signup()`, `logout()`, `updateUser()`, `refetchUser()`
- **Persistence**: JWT in httpOnly cookies

#### SocketContext
- **State**: `socket` instance, `isConnected` boolean
- **Events**: Listens to connect/disconnect/error
- **Auto-connect**: Triggered when user authenticates

#### Local State (useReducer/useState)
- Component-level UI state (forms, modals, etc.)

### Data Flow

```
User Input
    ↓
Component Form
    ↓
Context Method (useAuth/useSocket)
    ↓
API Call (Axios) or Socket Emit
    ↓
Backend Processing
    ↓
Context Update (re-render)
    ↓
UI Update
```

---

## Backend Architecture

### Technology Stack
- **Node.js 25.9** - JavaScript runtime
- **Express 5.2** - Web framework
- **Socket.io 4.8** - WebSocket library
- **PostgreSQL 15+** - Relational database
- **Drizzle ORM** - Type-safe queries
- **Mistral AI API** - Language model
- **Tavily API** - Web search
- **Nodemailer** - Email delivery

### Folder Structure
```
backend/
├── src/
│   ├── config/
│   │   └── mail.js              # Email configuration, validators
│   ├── controller/
│   │   ├── auth.controller.js   # Auth endpoints (signup, login, etc.)
│   │   └── ai.controller.js     # Chat endpoints
│   ├── db/
│   │   ├── index.js             # Connection pool setup
│   │   └── schema.js            # Table definitions
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT verification, validation
│   ├── routes/
│   │   ├── auth.routes.js       # Auth route definitions
│   │   └── chat.routes.js       # Chat route definitions
│   ├── services/
│   │   ├── ai.service.js        # AI response generation
│   │   └── internetSearch.service.js  # Web search integration
│   └── sockets/
│       └── server.socket.js     # WebSocket event handlers
├── app.js                       # Express setup & middleware
└── package.json
```

### Authentication Flow

```
Signup:
1. Validate email (strict regex + disposable domain check)
2. Hash password with bcrypt
3. Create user in DB with isVerified=true
4. Send welcome email (async)
5. Generate JWT token
6. Return user object

Login:
1. Find user by email
2. Verify password with bcrypt
3. Check 2FA enabled → send code if yes
4. Generate JWT token
5. Set httpOnly cookie
6. Return success
```

### Chat Flow (Socket.io Streaming)

```
Client sends: chat:send { message, chatId }
    ↓
1. Authenticate user from JWT cookie
2. If no chatId: generate title (AI), create new chat
3. Save user message to DB
4. Fetch chat history
5. Call AI API to generate response (full text)
6. Stream response word-by-word:
   - Split text into tokens
   - Emit chat:token { token } with 15-40ms delays
7. Save complete AI message to DB
8. Emit chat:done { messageId, fullContent, chatId }
```

### Database Schema

```sql
users
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── passwordHash (TEXT)
├── name (TEXT)
├── provider (TEXT)
├── isVerified (BOOLEAN)
├── twoFactorEnabled (BOOLEAN)
├── twoFactorSecret (TEXT)
├── tfA_expiresAT (TIMESTAMP)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

chats
├── id (UUID, PK)
├── userId (UUID, FK → users.id)
├── title (TEXT)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

messages
├── id (UUID, PK)
├── chatId (UUID, FK → chats.id, CASCADE DELETE)
├── content (TEXT)
├── role (ENUM: 'user' | 'ai')
└── createdAt (TIMESTAMP)

passwordResetTokens
├── id (UUID, PK)
├── userId (UUID, FK → users.id, CASCADE DELETE)
├── tokenHash (TEXT)
└── expiresAt (TIMESTAMP)
```

### API Endpoints

#### Auth Routes (`/api/auth`)
```
POST   /signup             → Create account
POST   /login              → Sign in
POST   /logout             → Sign out (protected)
GET    /get-me             → Fetch user (protected)
POST   /forgotPassword     → Request reset token
POST   /resetPassword/:token → Reset password
POST   /twoFactorAuth      → Toggle 2FA (protected)
POST   /verify2FAcode      → Verify 2FA code
POST   /verify             → Verify email (protected)
```

#### Chat Routes (`/api/chats`)
```
POST   /message            → Send message (protected)
GET    /                   → List chats (protected)
GET    /:chatId/messages   → List messages (protected)
DELETE /delete/:chatId     → Delete chat (protected)
```

### Error Handling

All errors return structured responses:
```json
{
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password too weak"]
  }
}
```

Frontend maps these to field-level error messages.

---

## Communication Protocols

### REST API
- **Method**: HTTP (JSON)
- **Authentication**: JWT in httpOnly cookies
- **Response**: `{ data, message, errors, success }`
- **Error Codes**: 400 (validation), 401 (auth), 404 (not found), 500 (server)

### WebSocket (Socket.io)
- **Protocol**: WebSocket with fallback to polling
- **Namespace**: Default `/`
- **Auth**: JWT from cookie on handshake
- **Events**:
  - `chat:send` → Request message
  - `chat:start` → New chat created
  - `chat:token` → Streamed token
  - `chat:done` → Streaming complete
  - `chat:error` → Error occurred

---

## Security Considerations

### Frontend
- Tokens stored only in httpOnly cookies
- CSRF protected via same-origin policy
- Input sanitization before display
- XSS prevention via React's built-in escaping

### Backend
- Password hashing with bcrypt (10 rounds)
- JWT signed with strong secret
- CORS restricted to frontend origin
- Helmet middleware for security headers
- Input validation on all endpoints
- Middleware authentication on protected routes

### Database
- SQL injection prevention via Drizzle ORM
- Foreign key constraints (CASCADE DELETE)
- Indexes on frequently queried columns (userId, email, chatId)

---

## Performance Optimizations

### Frontend
- **Code Splitting**: Lazy load routes with React.lazy
- **Bundle Size**: ~280KB gzipped (91KB gzipped)
- **Caching**: Tailwind CSS purging
- **Rendering**: Memoization for expensive components

### Backend
- **Database**: Indexes on user.email, chats.userId, messages.chatId
- **Streaming**: Word-by-word token emission (15-40ms delays)
- **Caching**: In-memory for connection pooling
- **API Limits**: External APIs have rate limits; queue backpressure handled

---

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (can run multiple instances)
- Session stored in JWT (no server-side sessions needed)
- Database is bottleneck (use read replicas for reporting)

### Vertical Scaling
- Increase database connection pool
- Upgrade Node.js heap size
- Use CDN for frontend static assets

### Future Improvements
- Redis for caching (chat history, user sessions)
- Message queues (Bull, RabbitMQ) for async tasks
- Database partitioning for millions of messages
- GraphQL API for flexible queries

---

## Deployment Pipeline

```
1. Push to GitHub
   ↓
2. CI/CD runs tests
   ↓
3. Build frontend (vite build)
   ↓
4. Build backend (npm run build if needed)
   ↓
5. Deploy to Vercel (frontend) / Railway (backend)
   ↓
6. Database migrations run
   ↓
7. Smoke tests verify deployment
```

---

## Monitoring & Debugging

### Development
- Nodemon auto-reload
- React DevTools extension
- Network tab for API calls
- Socket.io debug logs

### Production
- Console error logging
- Environment-based log levels
- Error tracking (optional: Sentry)
- Database query performance monitoring

---

## Testing Strategy

### Unit Tests (TODO)
- Controllers
- Services
- Utility functions

### Integration Tests (TODO)
- Auth flow
- Chat flow
- Database transactions

### E2E Tests (TODO)
- Full user signup → chat → delete cycle

---

**Last Updated**: 2024
**Version**: 1.0.0
