# Contributing to Aura Search

First off, thank you for considering contributing to Aura Search! It's people like you that make this project such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### Reporting Bugs
Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate those steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment (OS, Node version, etc.)**

### Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests
- Fill in the required template
- Follow the JavaScript/React styleguides
- End all files with a newline
- Document new code with JSDoc comments
- Include appropriate test case(s)

---

## Development Setup

### Prerequisites
- Node.js v25.9+
- PostgreSQL 15+
- Git

### Steps
1. Fork the repo
2. Clone your fork: `git clone https://github.com/yourusername/aura-search.git`
3. Add upstream: `git remote add upstream https://github.com/originalauthor/aura-search.git`
4. Create feature branch: `git checkout -b feature/amazing-feature`
5. Install dependencies: `npm install` (in both backend and frontend)
6. Set up environment variables (copy from `.env.example`)
7. Start development servers: `npm run dev` (in both backend and frontend)
8. Make your changes
9. Commit: `git commit -m 'Add amazing feature'`
10. Push: `git push origin feature/amazing-feature`
11. Open a Pull Request

---

## Styleguides

### JavaScript/Node.js
- Use **2-space indentation**
- Use **const** by default, **let** if rebinding is needed
- Use **async/await** over promises
- Use **template literals** for strings
- Comment complex logic
- Use descriptive variable names

### React/JSX
- Use **functional components** with hooks
- Keep components small and focused
- Use **meaningful prop names**
- Memoize expensive computations
- Follow a clear component hierarchy

### CSS/Tailwind
- Use **Tailwind utility classes** primarily
- Create custom CSS only for animations
- Use consistent spacing (multiples of 4px)
- Maintain dark theme consistency
- Test responsiveness on mobile

### Commit Messages
- Use the present tense: "Add feature" not "Added feature"
- Use the imperative mood: "Move cursor to..." not "Moves cursor to..."
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Example:
  ```
  Add email validation with disposable domain check
  
  - Implement strict regex validation
  - Add list of 12+ disposable domains
  - Return structured error object
  
  Fixes #123
  ```

---

## Testing

Before submitting a PR, please test:

### Frontend
```bash
cd frontend
npm run build  # Ensure no build errors
npm run lint   # Check for linting issues
```

### Backend
```bash
cd backend
npm run db:generate  # Check migrations
npm run dev          # Verify it starts without errors
```

### Manual Testing Checklist
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Mobile responsive (tested on mobile breakpoints)
- [ ] Existing features not broken
- [ ] Error states handled gracefully

---

## What should I know before I get started?

### Project Architecture
- **Backend**: Express.js + Socket.io + PostgreSQL
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Real-time**: WebSocket streaming for AI responses
- **Auth**: JWT tokens with secure httpOnly cookies

### Key Technologies to Understand
1. **Socket.io** - For streaming AI responses
2. **Drizzle ORM** - Database abstraction layer
3. **Context API** - State management (Auth, Socket)
4. **React Router** - Client-side routing
5. **Tailwind CSS** - Utility-first CSS

---

## Additional Notes

### Issue and Pull Request Labels

After the issue/PR is created, it can be labeled with the following:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

---

## Recognition

Contributors will be recognized in:
- README.md acknowledgments
- GitHub contributors page
- Release notes for significant contributions

---

## Questions?

Feel free to open an issue or discussion if you have questions about contributing!

**Happy coding!** 🚀
