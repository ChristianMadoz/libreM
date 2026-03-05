# Agent Notes & Context

## Project Structure

This is a multi-service project using Vercel's `experimentalServices`:
- **Frontend**: React (Vite) SPA in `/frontend`
- **Backend**: FastAPI in `/backend` (entry point: `main.py`)
- **Root**: `vercel.json` defines service routing

## Architecture

- Frontend calls `/api/...` endpoints (same origin, no CORS needed in dev)
- Backend uses SQLAlchemy + PostgreSQL
- Auth: Session-based with httponly cookies + Bearer token fallback
- Password hashing: salted SHA-256 (salt:hash format)

## Backend

- Entry point: `backend/main.py` (FastAPI app)
- All routes prefixed with `/api/` (e.g. `/api/health`, `/api/auth/login`)
- Dependencies managed via `pyproject.toml`
- Database config via `DATABASE_URL` environment variable

## Frontend

- Built with Vite + React
- Uses shadcn/ui components, Tailwind CSS
- API service in `src/services/api.js`
- Auth context in `src/context/AuthContext.jsx`
