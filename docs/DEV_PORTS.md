# Althub Local Ports

The local development stack uses fixed ports so auth redirects, CORS, CSP, and Socket.IO stay predictable.

| Service | Folder | Port | URL |
| --- | --- | ---: | --- |
| Backend API | `Althub-server` | `5001` | `http://localhost:5001` |
| Main app | `Althub-main` | `3000` | `http://localhost:3000` |
| Admin app | `Althub-admin` | `3001` | `http://localhost:3001` |
| Super admin app | `Althub-super-admin` | `3002` | `http://localhost:3002` |

## Where These Ports Are Used

- Root orchestration: `start-all.js`
- Frontend dev servers:
  - `Althub-main/vite.config.js`
  - `Althub-admin/vite.config.js`
  - `Althub-super-admin/vite.config.js`
- Backend browser/security allowlists:
  - `Althub-server/config/origins.js`

## Local Start Command

From the repo root:

```bash
npm start
```

This starts the services in order:

1. Backend API
2. Main app
3. Admin app
4. Super admin app
