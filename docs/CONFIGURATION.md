# Althub Configuration

This project keeps configuration intentionally small and shared where possible.

## Frontend API URL

All three Vite frontends resolve their API URL through `@althub/shared/config`.

| App | Config file |
| --- | --- |
| Main | `Althub-main/src/baseURL.jsx` |
| Admin | `Althub-admin/src/config/baseURL.js` |
| Super admin | `Althub-super-admin/src/config/baseURL.js` |

The shared resolver reads `VITE_API_URL` when provided. Without it, local development uses:

```text
http://localhost:5001
```

Production fallback uses:

```text
https://althub-server.onrender.com
```

Do not use CRA-style `REACT_APP_*` variables in these Vite apps.

## Backend Browser Origins

Backend CORS, Helmet `connect-src`, and Socket.IO CORS all use:

```text
Althub-server/config/origins.js
```

Default local origins include:

```text
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://localhost:5001
```

Additional origins can be provided as a comma-separated list through:

```text
ALTHUB_ALLOWED_ORIGINS
```

Vercel preview origins are allowed by default. Set this to `false` to restrict them:

```text
ALLOW_VERCEL_PREVIEW_ORIGINS=false
```

Production origins are intentionally limited to the working deployed URLs:

```text
https://althub-admin.vercel.app
https://althub-super-admin.vercel.app
https://althub-connect.vercel.app
https://althub-server.onrender.com
```
