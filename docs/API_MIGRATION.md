# Althub API

The backend exposes a single, unversioned API surface mounted at `/api`.

There is no versioning scheme — the `/api/v1` prefix and resource-style aliases
(`/api/v1/posts`, `/api/v1/institutes/:id`, etc.) introduced during an earlier
exploration were removed in favour of a single namespace. All endpoints use
named-action paths (e.g. `GET /api/getPost`, `POST /api/addPost`).

## Conventions

- All endpoints live under `/api/<endpoint>`. No version prefix.
- HTTP method matches semantic intent (GET reads, POST writes).
- A few historical endpoints accept POST for reads when the body needs a
  `userid` field (e.g. `POST /api/getEducation`, `POST /api/getnotifications`).
- Auth is cookie-based (HttpOnly JWT). See `Althub-server/middleware/authMiddleware.js`.
- CSRF protection: state-changing requests must include the `csrf_token` cookie
  value in an `X-CSRF-Token` header. The cookie is set on every response;
  cross-site frontends can fetch it via `GET /api/csrf` (returns the token in
  the response body since cross-site cookies are unreadable from JS).

## Adding a new endpoint

1. Add the route in the appropriate `Althub-server/routes/<resource>Route.js`
2. Use `requireAuth` + `requireRole(...)` for protected routes
3. Use the named-action pattern (`getX`, `addX`, `editX`, `deleteX`) — REST-style
   nesting (`/users/:id/posts`) was tried and reverted; keep things flat
4. If the endpoint is pre-auth (login, register, password reset), add it to
   the `csrfAllowlist` Set in `Althub-server/index.js`

## Frontend usage

```js
import apiClient from '../api/client';

apiClient.get('/api/getInstituteById/694b...');
apiClient.post('/api/addPost', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
```

The shared `apiClient` (`Althub-shared/src/apiClient.js`) handles CSRF
token attachment and cookie credentials automatically.
