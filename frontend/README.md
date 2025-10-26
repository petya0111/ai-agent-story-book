
# Frontend (Next.js + TypeScript)

Quickstart:
1. Install dependencies:
   cd frontend
   npm install

2. Run dev:
   npm run dev

This frontend assumes the backend API is available at the same host (relative paths like /api/...).
If your backend runs on a different host (e.g. http://localhost:4000), either:
- run a simple proxy,
- or set NEXT_PUBLIC_API_URL and replace fetch routes with `${process.env.NEXT_PUBLIC_API_URL}/api/...`