# Security Guidelines - Aura Search

## Overview

This document outlines the security measures implemented in Aura Search and best practices for deploying and maintaining the application securely.

---

## Authentication & Authorization

### Password Security
- ✅ **Bcrypt Hashing** - Passwords hashed with 10 rounds
- ✅ **Strong Password Requirements** - Min 8 chars, uppercase, number
- ✅ **No Plain-Text Storage** - Never store passwords in DB
- ⚠️ **Implement Rate Limiting** - Prevent brute-force attacks (TODO)

### JWT Tokens
- ✅ **Secure Secret** - Use min 32 random characters
- ✅ **HttpOnly Cookies** - Prevents JavaScript access
- ✅ **Secure Flag** - Sent only over HTTPS in production
- ✅ **SameSite Policy** - Set to "Strict" against CSRF
- ✅ **Expiration** - Tokens expire in 20 days

### Two-Factor Authentication
- ✅ **Optional 2FA** - Time-based 5-minute codes
- ✅ **Email Delivery** - OTP codes sent via email
- ⚠️ **Backup Codes** - Not yet implemented (TODO)

---

## Data Protection

### Email Validation
- ✅ **Strict Regex** - RFC 5322 compliant pattern
- ✅ **Disposable Domain Check** - Blocks temp-mail services
- ✅ **Length Limits** - Max 254 chars per RFC 5321
- ✅ **Prevents Typosquatting** - No obvious look-alikes

### Database Security
- ✅ **Parameterized Queries** - Via Drizzle ORM (no SQL injection)
- ✅ **Foreign Keys** - CASCADE DELETE for referential integrity
- ✅ **Connection Pooling** - Limited connections (max 20)
- ⚠️ **Encryption at Rest** - Use cloud provider defaults (TODO)

### API Security
- ✅ **CORS Restriction** - Only frontend origin allowed
- ✅ **HELMET Middleware** - Security headers (CSP, X-Frame-Options, etc.)
- ✅ **Rate Limiting** - (TODO: Implement express-rate-limit)
- ✅ **Input Validation** - Zod schema validation on all endpoints
- ✅ **Error Messages** - Generic messages, no stack traces in production

---

## Communication Security

### HTTPS/TLS
- ❌ **Development** - HTTP allowed (localhost)
- ✅ **Production** - HTTPS enforced
- ✅ **HSTS Headers** - Preload list (TODO)

### WebSocket Security
- ✅ **JWT Authentication** - Verified on socket connection
- ✅ **CORS on Upgrade** - Socket respects CORS policy
- ✅ **Message Validation** - Input validated before processing
- ⚠️ **Message Encryption** - Plain-text for now (TODO)

---

## Third-Party API Security

### Mistral AI
- ✅ **API Key in .env** - Not hardcoded
- ✅ **HTTPS Only** - Secure endpoint
- ⚠️ **Rate Limits** - Monitor usage (add alerting: TODO)

### Tavily Search
- ✅ **API Key in .env** - Secrets not exposed
- ✅ **Query Sanitization** - User input validated
- ⚠️ **Response Validation** - Could add schema validation (TODO)

### Gmail SMTP
- ✅ **App Password** - Not regular password
- ✅ **Secure Connection** - TLS/SSL
- ✅ **Error Handling** - Failures logged, not exposed to users

---

## Environment & Deployment

### Development
```env
NODE_ENV=development
JWT_SECRET=your-dev-secret-32-chars-min
DATABASE_URL=postgresql://user:password@localhost:5432/aura_search
```

### Production
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DATABASE_URL=<encrypted-connection-string>
CORS_ORIGIN=https://your-domain.com
# Never log sensitive data
LOG_LEVEL=error
```

### Secrets Management
- ✅ **Environment Variables** - Loaded from .env (dev)
- ✅ **CI/CD Secrets** - GitHub Actions / Vercel secrets
- ✅ **Never Commit .env** - Added to .gitignore
- ✅ **Rotate Keys Regularly** - Especially API keys

---

## Deployment Checklist

- [ ] NODE_ENV set to production
- [ ] JWT_SECRET is random (32+ chars)
- [ ] CORS_ORIGIN set to frontend domain only
- [ ] HTTPS enabled and enforced
- [ ] Database backups configured (daily)
- [ ] SSL/TLS certificates valid
- [ ] Error logging configured (Sentry/etc)
- [ ] Database connection string encrypted
- [ ] API rate limiting enabled
- [ ] WAF rules configured (DDoS protection)
- [ ] Monitoring & alerting set up
- [ ] Firewall rules restrict access
- [ ] Security headers verified (curl -I)

---

## Security Considerations

### Known Vulnerabilities
- None currently identified

### Planned Security Improvements
1. **Implement CSRF Protection** - Tokens on state-changing requests
2. **Add Rate Limiting** - Per IP/user for login, signup, chat
3. **Enable Audit Logging** - Track sensitive actions
4. **Add Database Encryption** - For production
5. **Implement Backup Codes** - For 2FA
6. **Security Headers** - CSP, X-Content-Type-Options, etc.
7. **Input Sanitization** - XSS prevention on all inputs
8. **Dependency Scanning** - Automated security updates

---

## Incident Response

### If API Key Compromised
1. Immediately revoke the key in the API dashboard
2. Generate a new key
3. Update .env in all environments
4. Monitor usage for suspicious activity

### If Database Breached
1. Alert all users to change passwords
2. Invalidate all JWT tokens (restart with new JWT_SECRET)
3. Review access logs for unauthorized data access
4. Implement new security measures before resuming service

### If Application Hacked
1. Take production offline
2. Audit codebase for malicious changes
3. Update all dependencies to latest versions
4. Re-deploy from clean build
5. Rotate all secrets

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [JWT Security](https://tools.ietf.org/html/rfc7519)

---

## Questions or Concerns?

Open a GitHub issue or email: your-email@example.com

**Last Updated**: 2024
