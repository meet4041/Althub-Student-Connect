# Althub Improvement Log

This file tracks structural improvements made to the project and why each change was made.

## 2026-05-01

### Added root workspace scripts

**Files changed**
- `package.json`
- `start-all.js`

**What changed**
- Added a root `package.json` for the full Althub workspace.
- Added root commands for starting and building the apps:
  - `npm start`
  - `npm run build`
  - `npm run build:main`
  - `npm run build:admin`
  - `npm run build:super-admin`
  - `npm run start:server`
  - `npm run start:main`
  - `npm run start:admin`
  - `npm run start:super-admin`
- Added/kept `start-all.js` to start services in order:
  1. Server
  2. Main
  3. Admin
  4. Super Admin

**Reason**
- The repo had four separate packages but no root command surface.
- This made setup, local development, and future CI harder.
- A root script layer makes the project easier to run, build, and scale.

### Fixed all-app build orchestration

**Files changed**
- `package.json`

**What changed**
- Added `npm run build` at the root to build:
  - `Althub-main`
  - `Althub-admin`
  - `Althub-super-admin`

**Reason**
- Previously each app had to be built separately.
- A single root build command gives a reliable smoke check before larger refactors.

### Fixed main app API base URL inconsistency

**Files changed**
- `Althub-main/src/context/AuthContext.jsx`

**What changed**
- Replaced CRA-style `process.env.REACT_APP_API_URL` usage with the existing Vite `WEB_URL` value from `Althub-main/src/baseURL.jsx`.

**Reason**
- The main app is a Vite app, so `process.env.REACT_APP_API_URL` is not the correct convention.
- Using one `WEB_URL` source avoids auth calls pointing at a different backend than the rest of the app.

### Standardized super-admin API base URL convention

**Files changed**
- `Althub-super-admin/src/config/baseURL.js`

**What changed**
- Updated super-admin to use:
  - `import.meta.env.VITE_API_URL`
  - Render production URL fallback
  - Localhost fallback in development

**Reason**
- Admin and main already use Vite-style environment variables.
- Super-admin had separate hostname detection logic.
- Standardizing this reduces deployment drift and local/dev surprises.

### Added architecture fix tracker

**Files changed**
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Added a phase-based architecture cleanup plan covering:
  - Workspace foundation
  - Configuration consistency
  - Dependency alignment
  - Shared frontend utilities
  - Admin/super-admin consolidation
  - Backend API structure
  - Tests and CI

**Reason**
- The project has several scaling issues that should be fixed in a deliberate order.
- The tracker prevents random cleanup and keeps future work visible.

### Verification completed

**Commands run**
- `npm run check:start-script`
- `npm run build`

**Result**
- Start script syntax check passed.
- Root build passed for main, admin, and super-admin.

### Normalized server path in root scripts

**Files changed**
- `package.json`
- `start-all.js`
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Updated root workspace and server scripts to use the canonical `Althub-server` folder name.
- Updated `start-all.js` to start the backend from `Althub-server`.

**Reason**
- The backend folder is now standardized as `Althub-server`.
- Using one folder casing prevents future script/build behavior from drifting across local machines and Git.

### Centralized backend origin config

**Files changed**
- `Althub-server/config/origins.js`
- `Althub-server/index.js`
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Added one backend origin config module for local and production app URLs.
- Reused that module for:
  - Helmet `connect-src`
  - Express CORS
  - Socket.IO CORS
- Included the expected local ports:
  - Main: `3000`
  - Admin: `3001`
  - Super Admin: `3002`
  - Server: `5001`

**Reason**
- Origin allowlists were duplicated in `index.js` and did not fully match each other.
- Duplicated origin lists make local login and deployment bugs more likely as the apps change.
- Centralizing this keeps security behavior consistent across HTTP requests, browser CSP, and sockets.

### Documented local dev port contract

**Files changed**
- `docs/DEV_PORTS.md`
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Added a single documentation page for the local ports:
  - Server: `5001`
  - Main: `3000`
  - Admin: `3001`
  - Super Admin: `3002`
- Listed the files that depend on those ports.

**Reason**
- The ports are now part of the project contract because auth, CORS, CSP, sockets, Vite, and the root start script all depend on them.
- Keeping the port contract visible reduces accidental drift when the project grows.

### Confirmed build output policy

**Files changed**
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Confirmed generated frontend `build/` output is already ignored by the root `.gitignore`.
- Marked the architecture tracker item as resolved.

**Reason**
- Build artifacts should come from CI/deployment builds instead of being committed during normal development.
- This keeps diffs smaller and avoids stale generated files hiding real source changes.

### Renamed backend folder to `Althub-server`

**Files changed**
- `Althub-server/**`
- `package.json`
- `start-all.js`
- `.gitignore`
- `README.md`
- `docs/ARCHITECTURE_FIX_PLAN.md`
- `docs/DEV_PORTS.md`
- `improvement.md`

**What changed**
- Renamed the Git-tracked backend folder to `Althub-server`.
- Updated root scripts, workspace config, docs, and ignore rules to use only `Althub-server`.
- Kept the backend origin config and recent server fixes under the lowercase backend path.

**Reason**
- The project owner renamed the backend folder to `Althub-server`.
- Aligning Git tracking and code references with that name avoids case-sensitive path problems when moving between machines or deployment environments.

### Aligned frontend runtime dependencies

**Files changed**
- `Althub-admin/package.json`
- `Althub-admin/package-lock.json`
- `Althub-admin/src/index.jsx`
- `Althub-super-admin/package.json`
- `Althub-super-admin/src/index.jsx`
- `package-lock.json`
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Updated admin and super-admin entry points from React 17 `ReactDOM.render` to React 18 `createRoot`.
- Aligned all three frontend apps on:
  - React `18`
  - React DOM `18`
  - Vite `6.4.x`
  - `@vitejs/plugin-react` `4.7.x`
  - `react-router-dom` `6.10.x`
  - `react-toastify` `9.1.x`
- Refreshed installed dependencies so admin no longer used a stale nested Vite 7 install.

### Rebuilt admin UI foundation around the green theme

**Files changed**
- `Althub-shared/src/styles/tokens.css`
- `Althub-shared/package.json`
- `Althub-admin/src/index.jsx`
- `Althub-admin/src/App.jsx`
- `Althub-admin/src/App.css`
- `Althub-admin/src/index.css`
- `Althub-admin/src/styles/menu.css`
- `Althub-admin/src/styles/dashboard.css`
- `Althub-admin/src/styles/institute-layout.css`
- `Althub-admin/src/styles/*.css`

**What changed**
- Added shared Althub green/white design tokens and imported them into admin.
- Removed the temporary `althub-green-theme.css` override layer from admin.
- Rebuilt the admin header/sidebar CSS as a single green shell instead of stacked blue and green overrides.
- Rebuilt the dashboard CSS with consistent green buttons, cards, focus, hover, and active states.
- Replaced the duplicated institute layout override layers with one structural admin page chrome.
- Removed hardcoded old blue color values from admin source styles.

**Reason**
- The admin UI had become fragile because old blue styles and newer green patches were both active.
- Making green the base theme, instead of a late override, makes the dashboard and admin tabs cleaner and easier to maintain.

### Cleaned super-admin routes and green UI foundation

**Files changed**
- `Althub-super-admin/src/app/Routes.jsx`
- `Althub-super-admin/src/pages/Dashboard.jsx`
- `Althub-super-admin/src/pages/Institute.jsx`
- `Althub-super-admin/src/pages/AlumniOffice.jsx`
- `Althub-super-admin/src/pages/PlacementCell.jsx`
- `Althub-super-admin/src/styles/app.css`
- `Althub-super-admin/src/styles/index.css`
- `Althub-super-admin/src/styles/menu.css`
- `Althub-super-admin/src/styles/dashboard.css`
- `Althub-super-admin/src/styles/users.css`
- `Althub-super-admin/src/styles/connected.css`
- `Althub-super-admin/src/styles/login.css`

**What changed**
- Replaced repeated protected route declarations with a single route config map.
- Removed old blue visual language from super-admin styles.
- Rebuilt the super-admin header, sidebar, dashboard, directory cards, modals, and connected graph around the shared Althub green/white tokens.
- Replaced the large patch-style global `app.css` with a small global utility layer.
- Removed green one-off inline search borders and stale template comments from key pages.

**Reason**
- Super-admin had the same patchy style drift as admin: old template utilities, blue page styles, and newer green overrides competing with each other.
- Using the shared token layer and cleaner route structure makes the app easier to maintain and visually consistent with the admin green theme.

### Added Safari-safe auth fallback for main and admin

**Files changed**
- `Althub-shared/src/authToken.js`
- `Althub-shared/src/apiClient.js`
- `Althub-shared/src/index.js`
- `Althub-shared/package.json`
- `Althub-main/src/components/Login.jsx`
- `Althub-main/src/context/AuthContext.jsx`
- `Althub-admin/src/pages/Login.jsx`
- `Althub-admin/src/context/AuthContext.jsx`
- `Althub-server/controllers/userController.js`

**What changed**
- Added a shared auth token storage helper.
- Main and admin now store the server-issued token after successful login.
- Shared Axios clients now attach `Authorization: Bearer <token>` when present.
- The backend already accepts bearer tokens, so this provides a Safari fallback when cross-site cookies are blocked.
- Main logout now clears access, refresh, and CSRF cookies with matching cookie attributes and removes the local fallback token.

**Reason**
- Safari can block or drop cross-site cookies between the Vercel frontend and Render API more aggressively than Chrome/Brave.
- The result was an immediate logout after login because `/api/auth/me` could not see the cookie.
- Keeping cookie auth while adding bearer fallback preserves existing Chrome/Brave behavior and makes Safari sessions reliable.

### Refactored authentication to actor-specific HttpOnly cookies

**Files changed**
- `Althub-server/config/authCookies.js`
- `Althub-server/middleware/authMiddleware.js`
- `Althub-server/controllers/userController.js`
- `Althub-server/controllers/instituteController.js`
- `Althub-server/controllers/adminController.js`
- `Althub-server/config/origins.js`
- `Althub-server/index.js`
- `Althub-shared/src/apiClient.js`
- `Althub-shared/src/index.js`
- `Althub-shared/package.json`
- `Althub-main/src/components/Login.jsx`
- `Althub-main/src/context/AuthContext.jsx`
- `Althub-main/src/ProtectedImage.jsx`
- `Althub-admin/src/pages/Login.jsx`
- `Althub-admin/src/context/AuthContext.jsx`
- `Althub-admin/src/features/institute/pages/Posts.jsx`

**What changed**
- Added actor-specific auth cookies:
  - Main app: `althub_main_token`
  - Main refresh: `althub_main_refresh_token`
  - Admin app: `althub_admin_token`
  - Super-admin app: `althub_super_admin_token`
- Refactored backend auth middleware into a cookie gateway that reads only actor HttpOnly cookies.
- Updated role checks to choose the matching authenticated actor when more than one actor cookie exists.
- Removed frontend bearer/localStorage token storage and Authorization-header auth.
- Removed the CSRF bypass for bearer requests.
- Login/logout and password-change flows now clear legacy cookie names during migration.

**Reason**
- The previous shared `jwt_token` cookie could collide between main and super-admin, and `institute_token` could be masked by another app cookie.
- LocalStorage bearer fallback fixed Safari behavior but was less secure than HttpOnly cookies.
- Actor-specific cookies make the three apps safer to use side-by-side and make the backend middleware the central gateway for authentication.

### Restored admin login visual background

**Files changed**
- `Althub-admin/src/styles/login.css`

**What changed**
- Restored the richer navy/blue visual-side background on the admin auth screen.
- Kept the change scoped to login/auth pages so the admin dashboard and app shell stay on the green/white theme.

**Reason**
- The earlier login background had stronger contrast and looked better, while the rest of the admin UI still needs to remain aligned with the green Althub theme.

### Tuned admin login aurora background

**Files changed**
- `Althub-admin/src/styles/login.css`

**What changed**
- Changed the admin auth visual background to a dark blue/black base with layered green and cyan aurora gradients.

**Reason**
- The admin login screen needed the richer northern-lights style visual treatment while the app shell remains clean green/white.

**Reason**
- The frontends were split across React 17/18 and Vite 6/7.
- Mixed runtime versions increase upgrade risk and make shared UI/auth utilities harder to extract.
- Aligning the dependency family gives the three apps a more predictable foundation.

**Verification**
- `npm ls react react-dom vite @vitejs/plugin-react --workspaces --depth=0`
- `npm run check:start-script`
- `node --check Althub-server/index.js`
- `node --check Althub-server/config/origins.js`
- `npm run build`

**Note**
- `npm install` reported one moderate root audit advisory. I did not run `npm audit fix --force` because that can introduce breaking dependency changes outside this targeted cleanup.

### Extracted main app API client setup

**Files changed**
- `Althub-main/src/services/apiClient.js`
- `Althub-main/src/index.jsx`
- `Althub-main/src/App.jsx`
- `Althub-main/src/context/AuthContext.jsx`
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Added a dedicated main app `apiClient` service with:
  - API base URL
  - `withCredentials`
  - CSRF cookie header attachment
- Moved global Axios setup out of `App.jsx` and into app bootstrap.
- Updated main auth session fetch/logout calls to use the dedicated client.

**Reason**
- The router/app component was carrying request setup side effects.
- Centralizing API setup makes future request changes safer and prepares the codebase for shared auth/session helpers.

### Added shared frontend utility workspace

**Files changed**
- `Althub-shared/package.json`
- `Althub-shared/src/apiClient.js`
- `Althub-shared/src/auth/createAuthSession.jsx`
- `Althub-shared/src/config.js`
- `Althub-shared/src/cookies.js`
- `Althub-shared/src/images.js`
- `Althub-shared/src/index.js`
- `package.json`
- `package-lock.json`

**What changed**
- Added a private `@althub/shared` workspace package.
- Added shared helpers for:
  - API base URL resolution
  - CSRF cookie reading
  - Axios client creation
  - global Axios setup
  - image URL construction
  - admin-style auth session contexts

**Reason**
- Main, admin, and super-admin were each solving the same config/request/session problems separately.
- A shared package gives future frontend cleanup a stable home instead of copying helpers between apps.

### Migrated apps onto shared frontend utilities

**Files changed**
- `Althub-main/package.json`
- `Althub-main/src/baseURL.jsx`
- `Althub-main/src/services/apiClient.js`
- `Althub-admin/package.json`
- `Althub-admin/package-lock.json`
- `Althub-admin/src/config/baseURL.js`
- `Althub-admin/src/context/AuthContext.jsx`
- `Althub-admin/src/service/axios.js`
- `Althub-admin/src/utils/imageUtils.js`
- `Althub-super-admin/package.json`
- `Althub-super-admin/src/config/baseURL.js`
- `Althub-super-admin/src/context/AuthContext.jsx`
- `Althub-super-admin/src/services/axios.jsx`
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Main, admin, and super-admin now use the shared API base URL resolver.
- Main, admin, and super-admin now depend on `@althub/shared`.
- Admin and super-admin API clients now use the shared Axios client factory.
- Admin and super-admin auth contexts now use the shared auth-session factory.
- Admin and super-admin image URL helpers now use the shared image URL builder.
- Aligned frontend Axios resolution through the workspace install.

**Reason**
- This removes duplicated request/auth/config logic while keeping each app's role-specific behavior local.
- It directly addresses the earlier Vite config mismatch and reduces future login/CORS/CSRF drift between apps.

**Verification**
- `npm ls @althub/shared axios react react-dom vite @vitejs/plugin-react --workspaces --depth=0`
- `node --check Althub-shared/src/config.js`
- `node --check Althub-shared/src/apiClient.js`
- `node --check Althub-shared/src/images.js`
- `npm run build`

### Tightened configuration consistency

**Files changed**
- `Althub-shared/src/config.js`
- `Althub-main/src/baseURL.jsx`
- `Althub-admin/src/config/baseURL.js`
- `Althub-super-admin/src/config/baseURL.js`
- `Althub-server/config/origins.js`
- `docs/CONFIGURATION.md`
- `docs/ARCHITECTURE_FIX_PLAN.md`

**What changed**
- Added `getViteApiBaseUrl` to the shared config package.
- Updated all frontend API URL wrappers to use the same Vite-aware resolver call.
- Kept backend default browser origins centralized, and added support for extra origins from one backend origin config hook.
- Documented frontend API URL and backend browser-origin behavior in one configuration guide.

**Reason**
- Frontend API URL behavior should not depend on copied environment logic in each app.
- Backend CORS, CSP, and Socket.IO origins should stay aligned and adjustable without editing `index.js`.
- This directly addresses the earlier config drift between Vite frontend config and backend browser security config.

### Trimmed production browser origins

**Files changed**
- `Althub-server/config/origins.js`
- `docs/CONFIGURATION.md`
- `improvement.md`

**What changed**
- Removed unused production origins from the backend allowlist.
- Kept only the working deployed URLs:
  - `https://althub-admin.vercel.app`
  - `https://althub-super-admin.vercel.app`
  - `https://althub-connect.vercel.app`
  - `https://althub-server.onrender.com`

**Reason**
- CORS/CSP should only allow production URLs that are actually used.
- Removing stale origins reduces confusion and tightens the production browser security surface.

### Added versioned backend API boundary

**Files changed**
- `Althub-server/index.js`
- `Althub-server/routes/apiRoutes.js`
- `Althub-server/routes/v1ResourceAliases.js`
- `docs/API_MIGRATION.md`
- `docs/ARCHITECTURE_FIX_PLAN.md`
- `improvement.md`

**What changed**
- Extracted backend API route mounting into `createApiRouter`.
- Mounted existing compatibility routes at `/api`.
- Mounted versioned routes at `/api/v1`.
- Added API version headers:
  - `/api/v1`: `X-Althub-API-Version: v1`
  - `/api`: `X-Althub-API-Version: legacy`
- Normalized CSRF allowlist checks so public auth/reset/register flows work under both `/api` and `/api/v1`.
- Added initial REST-style `/api/v1` aliases for posts, events, users, institute-user listing, and notifications.

**Reason**
- The backend had no API version boundary, so every route change affected the same flat `/api` namespace.
- Versioning lets frontends migrate gradually while preserving existing behavior.
- Resource-style aliases give the project a cleaner target for future frontend and API cleanup.

### Standardized inline route error handling

**Files changed**
- `Althub-server/middleware/errorHandler.js`
- `Althub-server/utils/httpError.js`
- `Althub-server/routes/adminRoute.js`
- `Althub-server/routes/companyRoute.js`
- `Althub-server/routes/educationRoute.js`
- `Althub-server/routes/experienceRoute.js`
- `Althub-server/routes/imagesRoute.js`
- `Althub-server/routes/notificationRoute.js`
- `docs/ARCHITECTURE_FIX_PLAN.md`
- `improvement.md`

**What changed**
- Added small HTTP error helpers for status-aware errors.
- Updated the global error handler to respect already-sent headers and `statusCode`.
- Converted inline upload/image route handlers to use `asyncHandler`.
- Replaced per-route `try/catch` JSON responses with errors that flow into the global error handler.

**Reason**
- Some backend routes bypassed the existing global error handler and returned inconsistent failure shapes.
- Standardizing inline route handlers is the safest first step before moving larger controllers to shared async/error handling.

**Verification**
- `node --check Althub-server/utils/httpError.js`
- `node --check Althub-server/middleware/errorHandler.js`
- `node --check Althub-server/routes/adminRoute.js`
- `node --check Althub-server/routes/companyRoute.js`
- `node --check Althub-server/routes/educationRoute.js`
- `node --check Althub-server/routes/experienceRoute.js`
- `node --check Althub-server/routes/imagesRoute.js`
- `node --check Althub-server/routes/notificationRoute.js`
- `node --check Althub-server/index.js`

### Migrated smaller controllers to global error handling

**Files changed**
- `Althub-server/controllers/companyController.js`
- `Althub-server/controllers/courseController.js`
- `Althub-server/controllers/educationController.js`
- `Althub-server/controllers/experienceController.js`
- `Althub-server/controllers/conversationController.js`
- `Althub-server/controllers/messageController.js`
- `Althub-server/controllers/notificationController.js`
- `Althub-server/middleware/errorHandler.js`
- `Althub-server/utils/httpError.js`
- `docs/ARCHITECTURE_FIX_PLAN.md`
- `improvement.md`

**What changed**
- Wrapped smaller domain controller handlers with `asyncHandler`.
- Removed local `try/catch` response blocks from those controllers.
- Routed unexpected controller failures through `globalErrorHandler`.
- Preserved expected validation failures with explicit status-aware HTTP errors.
- Updated production error behavior so safe 4xx messages can still be exposed while unexpected 5xx errors stay generic.

**Reason**
- Controllers were returning inconsistent 400/500 response shapes and bypassing the global error handler.
- Migrating smaller controllers first lowers risk before touching large auth/user/institute/admin/post/event controllers.

**Verification**
- `node --check Althub-server/controllers/companyController.js`
- `node --check Althub-server/controllers/courseController.js`
- `node --check Althub-server/controllers/educationController.js`
- `node --check Althub-server/controllers/experienceController.js`
- `node --check Althub-server/controllers/conversationController.js`
- `node --check Althub-server/controllers/messageController.js`
- `node --check Althub-server/controllers/notificationController.js`
- `node --check Althub-server/middleware/errorHandler.js`
- `node --check Althub-server/utils/httpError.js`

### Centralized admin table controls and pagination

**Files changed**
- `Althub-admin/src/components/admin/AdminSearchBox.jsx`
- `Althub-admin/src/components/admin/AdminPaginationFooter.jsx`
- `Althub-admin/src/components/admin/AdminTableAction.jsx`
- `Althub-admin/src/features/institute/pages/Feedback.jsx`
- `Althub-admin/src/features/institute/pages/AlumniOffice.jsx`
- `Althub-admin/src/features/institute/pages/PlacementOffice.jsx`
- `Althub-admin/src/features/institute/pages/Posts.jsx`
- `Althub-admin/src/features/institute/pages/Users.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniPosts.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniMembers.jsx`
- `Althub-admin/src/styles/institute-layout.css`
- `Althub-admin/src/styles/feedback.css`

**What changed**
- Added shared admin search, pagination, and table action components.
- Replaced duplicated search bars, pagination footers, and delete/edit button markup on key admin pages.
- Standardized table action cell sizing so delete buttons align consistently in posts and feedback tables.
- Standardized student/alumni badges through shared green/white admin classes.
- Added shared admin card, toolbar, table, footer, and action styles to the main institute layout layer.
- Removed remaining hardcoded blue admin accents from event/post forms, profile focus states, and route-specific shadows.
- Mapped Bootstrap `text-primary` back to the Althub green token so icons and spinners do not fall back to blue.

**Reason**
- Admin pages were hand-building the same controls with different spacing, colors, and alignment rules.
- Moving repeated UI into shared components makes the admin interface easier to keep consistent as new pages are added.
- The pagination footer now keeps single-page states clean, avoiding awkward corner placement like `Showing 1 - 1 of 1` beside an unnecessary page button.

**Verification**
- `npm --prefix Althub-admin run build`

### Standardized event, post, and feedback controller errors

**Files changed**
- `Althub-server/utils/httpError.js`
- `Althub-server/controllers/eventController.js`
- `Althub-server/controllers/postController.js`
- `Althub-server/controllers/feedbackController.js`
- `improvement.md`

**What changed**
- Added reusable `unauthorized` and `forbidden` HTTP error helpers.
- Wrapped event, post, and feedback controller handlers with `asyncHandler`.
- Replaced local controller `try/catch` response branches with `httpError` throws for common 400/401/403/404 cases.
- Kept the like-notification `try/catch` inside `postController` because notification creation is a non-critical side effect and should not fail the like action.

**Reason**
- Controllers should send unexpected failures through the global error handler instead of each returning different response shapes.
- Centralizing error behavior makes API debugging easier and reduces future drift as routes are versioned or reorganized.

**Verification**
- `node --check Althub-server/utils/httpError.js`
- `node --check Althub-server/controllers/eventController.js`
- `node --check Althub-server/controllers/postController.js`
- `node --check Althub-server/controllers/feedbackController.js`
- `rg -n "try \\{|catch \\(|res\\.status\\((400|401|403|404|500)|json\\(err\\)|console\\.error" Althub-server/controllers/eventController.js Althub-server/controllers/postController.js Althub-server/controllers/feedbackController.js`

### Migrated frontend post, event, user, and notification calls to API v1 resource routes

**Files changed**
- `Althub-server/routes/v1ResourceAliases.js`
- `Althub-main/src/components/Home.jsx`
- `Althub-main/src/components/MyPosts.jsx`
- `Althub-main/src/components/Notification.jsx`
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/features/institute/pages/Posts.jsx`
- `Althub-admin/src/features/institute/pages/Events.jsx`
- `Althub-admin/src/features/institute/pages/AddPost.jsx`
- `Althub-admin/src/features/institute/pages/EditPost.jsx`
- `Althub-admin/src/features/institute/pages/AddEvent.jsx`
- `Althub-admin/src/features/institute/pages/EditEvent.jsx`
- `Althub-admin/src/features/institute/pages/Users.jsx`
- `Althub-admin/src/features/alumni-office/pages/*`
- `Althub-admin/src/features/placement-cell/pages/*`
- `improvement.md`

**What changed**
- Kept legacy backend endpoints mounted under `/api` for backward compatibility.
- Updated the frontend post flow to use resource-style `/api/v1/posts` and `/api/v1/users/:id/posts` routes.
- Updated the frontend event flow to use `/api/v1/events` and `/api/v1/institutes/:id/events` routes.
- Updated institute user list calls to use `/api/v1/institutes/:id/users`.
- Updated main notification reads/deletes to use `/api/v1/users/:id/notifications` and `/api/v1/notifications/:id`.
- Tightened v1 PATCH upload aliases so path ids are copied after multipart parsing.

**Reason**
- New frontend code should depend on stable resource routes instead of legacy action names like `getPostById`, `editPost`, `getnotifications`, and `getUpcommingEvents`.
- Keeping aliases avoids breaking older deployed clients while the UI moves to the cleaner API surface.

**Verification**
- `node --check Althub-server/routes/v1ResourceAliases.js`
- `npm --prefix Althub-main run build`
- `npm --prefix Althub-admin run build`
- `rg -n "getPostById|getPostByUser|getUsersOfInstitute|getEventsByInstitute|getPost\\b|getEvents\\b|addPost\\b|addEvent\\b|deletePost|deleteEvent|like/|participateInEvent|getRandomUsers|searchUserById|searchUser\\b|getUsers\\b|addNotification|getnotifications|deleteNotification|editPost|editEvent|getUpcommingEvents" Althub-main/src Althub-admin/src Althub-super-admin/src`

**Remaining**
- Auth, profile, education, experience, feedback, messaging, and super-admin management routes still have legacy frontend calls and need a separate v1 resource-route migration.

### Consolidated duplicated admin post and event pages

**Files changed**
- `Althub-admin/src/features/admin-shared/pages/AdminEventsPage.jsx`
- `Althub-admin/src/features/admin-shared/pages/AdminPostsPage.jsx`
- `Althub-admin/src/features/admin-shared/forms/PostForm.jsx`
- `Althub-admin/src/features/admin-shared/forms/EventForm.jsx`
- `Althub-admin/src/features/institute/pages/Events.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniEvents.jsx`
- `Althub-admin/src/features/placement-cell/pages/PlacementEvents.jsx`
- `Althub-admin/src/features/institute/pages/Posts.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniPosts.jsx`
- `Althub-admin/src/features/placement-cell/pages/PlacementPosts.jsx`
- `Althub-admin/src/features/institute/pages/AddPost.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniAddPost.jsx`
- `Althub-admin/src/features/placement-cell/pages/PlacementAddPost.jsx`
- `Althub-admin/src/features/institute/pages/AddEvent.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniAddEvent.jsx`
- `Althub-admin/src/features/placement-cell/pages/PlacementAddEvent.jsx`
- `Althub-admin/src/features/institute/pages/EditPost.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniEditPost.jsx`
- `Althub-admin/src/features/placement-cell/pages/PlacementEditPost.jsx`
- `Althub-admin/src/features/institute/pages/EditEvent.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniEditEvent.jsx`
- `Althub-admin/src/features/placement-cell/pages/PlacementEditEvent.jsx`
- `improvement.md`

**What changed**
- Added configurable shared `AdminEventsPage` and `AdminPostsPage` modules.
- Added shared `PostForm` and `EventForm` modules that support both create and edit modes.
- Replaced institute, alumni-office, and placement-cell event/post/add/edit pages with small wrappers that only define labels and route destinations.
- Kept existing route names and visual styling while centralizing fetch, search, pagination, delete, upload, and submit logic.

**Reason**
- The admin, alumni-office, and placement-cell sections had near-identical event and post implementations.
- Duplicated page logic made UI fixes fragile because the same bug had to be fixed three times.
- Config wrappers keep role-specific wording/routes while giving the admin UI one implementation path.

**Verification**
- `npm --prefix Althub-admin run build`
- `wc -l Althub-admin/src/features/admin-shared/pages/AdminEventsPage.jsx Althub-admin/src/features/admin-shared/pages/AdminPostsPage.jsx Althub-admin/src/features/admin-shared/forms/PostForm.jsx Althub-admin/src/features/admin-shared/forms/EventForm.jsx Althub-admin/src/features/institute/pages/Events.jsx Althub-admin/src/features/alumni-office/pages/AlumniEvents.jsx Althub-admin/src/features/placement-cell/pages/PlacementEvents.jsx Althub-admin/src/features/institute/pages/Posts.jsx Althub-admin/src/features/alumni-office/pages/AlumniPosts.jsx Althub-admin/src/features/placement-cell/pages/PlacementPosts.jsx Althub-admin/src/features/institute/pages/AddPost.jsx Althub-admin/src/features/alumni-office/pages/AlumniAddPost.jsx Althub-admin/src/features/placement-cell/pages/PlacementAddPost.jsx Althub-admin/src/features/institute/pages/AddEvent.jsx Althub-admin/src/features/alumni-office/pages/AlumniAddEvent.jsx Althub-admin/src/features/placement-cell/pages/PlacementAddEvent.jsx Althub-admin/src/features/institute/pages/EditPost.jsx Althub-admin/src/features/alumni-office/pages/AlumniEditPost.jsx Althub-admin/src/features/placement-cell/pages/PlacementEditPost.jsx Althub-admin/src/features/institute/pages/EditEvent.jsx Althub-admin/src/features/alumni-office/pages/AlumniEditEvent.jsx Althub-admin/src/features/placement-cell/pages/PlacementEditEvent.jsx`

### Consolidated admin CSS foundation and removed override-heavy patches

**Files changed**
- `Althub-admin/index.html`
- `Althub-admin/src/styles/admin-tokens.css`
- `Althub-admin/src/styles/admin-shell.css`
- `Althub-admin/src/styles/admin-components.css`
- `Althub-admin/src/styles/institute-layout.css`
- `Althub-admin/src/styles/add-post.css`
- `Althub-admin/src/styles/alumni-pages.css`
- `Althub-admin/src/styles/edit-event.css`
- `Althub-admin/src/styles/events.css`
- `Althub-admin/src/styles/posts.css`
- `Althub-admin/src/styles/profile.css`
- `Althub-admin/src/layouts/Menu.jsx`
- `Althub-admin/src/features/institute/pages/AlumniOffice.jsx`
- `Althub-admin/src/features/institute/pages/PlacementOffice.jsx`
- `Althub-admin/src/features/institute/pages/Feedback.jsx`
- `Althub-admin/src/features/institute/pages/Leaderboard.jsx`
- `Althub-admin/src/features/institute/pages/Profile.jsx`
- `Althub-admin/src/features/institute/pages/Users.jsx`
- `Althub-admin/src/features/admin-shared/forms/PostForm.jsx`
- `improvement.md`

**What changed**
- Added a small admin CSS foundation:
  - `admin-tokens.css` for shared dimensions, colors, spacing, shadows, and state tokens.
  - `admin-shell.css` for the admin layout shell.
  - `admin-components.css` for reusable cards, buttons, forms, table columns, badges, and score pills.
- Reduced `institute-layout.css` to imports for the foundation files.
- Removed old `Minimal Althub route polish` blocks from route CSS files.
- Removed all `!important` usage from admin source styles.
- Removed inline styles from the main admin portal feature/layout/shared-component source.
- Removed old jQuery-era template assets from `index.html`, including gritter/flot/sparkline/theme scripts and unused public override styles.
- Replaced the profile menu's Bootstrap data-toggle dependency with React state so the dropdown no longer needs legacy template JavaScript.

**Reason**
- The admin UI was hard to maintain because page CSS, old template CSS, inline styles, and late override patches were fighting each other.
- A layered styling foundation makes future changes predictable: tokens first, shell second, components third, page exceptions last.
- Removing unused legacy scripts and styles reduces load cost and lowers the chance of external template code changing React-rendered UI.

**Verification**
- `npm --prefix Althub-admin run build`
- `rg -n "!important|Minimal Althub route polish" Althub-admin/src/styles Althub-admin/src/App.css Althub-admin/src/index.css`
- `rg -n "style=\\{" Althub-admin/src/features Althub-admin/src/layouts Althub-admin/src/components Althub-admin/src/app`
- `rg -n "/assets/plugins|jquery|flot|sparkline|gritter|theme/default|/style.css|assets/css/style.css" Althub-admin/index.html`

**Remaining**
- Auth pages still contain intentional inline visual styling for the login/forgot/register screens and should be converted in a separate auth-design cleanup pass.

### Removed legacy public template plugins from admin apps

**Files changed**
- `Althub-admin/index.html`
- `Althub-admin/public/style.css`
- `Althub-admin/public/assets/css/style.css`
- `Althub-admin/public/assets/js/**`
- `Althub-admin/public/assets/plugins/**`
- `Althub-super-admin/index.html`
- `Althub-super-admin/public/style.css`
- `Althub-super-admin/public/assets/css/style.css`
- `Althub-super-admin/public/assets/js/**`
- `Althub-super-admin/public/assets/plugins/**`
- `improvement.md`

**What changed**
- Removed unused jQuery-era plugin folders from admin and super-admin public assets:
  - `ckeditor`
  - `flot`
  - `gritter`
  - `jquery-sparkline`
  - `jvectormap-next`
  - `blueimp-*`
  - `bootstrap-colorpalette`
  - `superbox`
  - old combobox plugin files
- Removed unused public JavaScript bundles:
  - `assets/js/app.min.js`
  - `assets/js/theme/default.min.js`
  - `assets/js/demo/dashboard.js`
- Removed unused public override CSS files:
  - `public/style.css`
  - `assets/css/style.css`
- Removed matching `<link>` and `<script>` tags from both admin HTML entry files.
- Kept only assets that are still referenced by React or needed by the remaining template utility CSS: logos, fallback images, fonts, and `assets/css/default/app.min.css`.

**Reason**
- The public folders were shipping old dashboard/demo plugins that React does not import.
- Those files increased deploy size, confused future maintainers, and made it unclear which UI system was actually active.
- Removing the unused plugin surface makes the admin apps faster to deploy and easier to reason about.

**Verification**
- `npm --prefix Althub-admin run build`
- `npm --prefix Althub-super-admin run build`
- `rg -n "assets/plugins|assets/js|assets/css/style\\.css|/style\\.css|app\\.min\\.js|dashboard\\.js|ckeditor\\.js|jquery\\.flot|jquery\\.sparkline|jquery-jvectormap|jquery\\.gritter" Althub-admin/index.html Althub-super-admin/index.html Althub-admin/src Althub-super-admin/src`
- `du -sh Althub-admin/public Althub-super-admin/public`

**Remaining**
- `assets/css/default/app.min.css` remains for now because current admin markup still uses Bootstrap/template utility classes. It should be removed only after those utilities are fully replaced by the admin design-system CSS.

### Started replacing direct DOM page lifecycle with React AppShell

**Files changed**
- `Althub-admin/src/layouts/AppShell.jsx`
- `Althub-admin/src/layouts/Loader.jsx`
- `Althub-admin/src/components/ProtectedRoute.jsx`
- `Althub-admin/src/features/admin-shared/pages/AdminEventsPage.jsx`
- `Althub-admin/src/features/admin-shared/pages/AdminPostsPage.jsx`
- `Althub-admin/src/features/admin-shared/forms/EventForm.jsx`
- `Althub-admin/src/features/admin-shared/forms/PostForm.jsx`
- `improvement.md`

**What changed**
- Added `AppShell` to own the admin `page-container`, `Menu`, content region, `Footer`, and loader placement.
- Changed `Loader` to render from React state through a `show` prop instead of being manually hidden with DOM calls.
- Updated `ProtectedRoute` to show the React loader while auth is being checked.
- Migrated the shared post/event list and form modules to `AppShell`.
- Removed `document.getElementById('page-loader')`, `document.getElementById('page-container')`, and manual `show` class manipulation from those shared modules.

**Reason**
- Pages should not control shell DOM nodes directly.
- A single shell makes header/sidebar/footer/loader behavior predictable and removes the need for page-level lifecycle hacks.
- Starting with shared modules fixes many admin routes at once because institute, alumni-office, and placement-cell post/event/add/edit pages now use these shared components.

**Verification**
- `npm --prefix Althub-admin run build`
- `rg -n "document\\.getElementById|window\\.App|<Loader|<Menu|<Footer|page-container" Althub-admin/src/features/admin-shared Althub-admin/src/layouts Althub-admin/src/components/ProtectedRoute.jsx`

**Remaining**
- Older standalone admin pages and super-admin pages still contain direct DOM lifecycle calls and should be migrated to `AppShell`/a matching `SuperAdminShell` next.

### Modernized institute event detail panel

**Files changed**
- `Althub-admin/src/features/institute/pages/Events.jsx`
- `Althub-admin/src/styles/events.css`
- `improvement.md`

**What changed**
- Restyled the opened event detail panel with a cleaner, minimal split layout.
- Reduced heavy backdrop, large rounded treatment, and image overlay effects.
- Reworked event metadata into a quiet bordered block.
- Changed the event delete control from an icon-only button to a labelled `Delete Event` destructive button.

**Reason**
- The event panel still looked like an older template modal and did not match the admin green/white visual direction.
- The delete action needed to be clearer and visually appropriate for a destructive event action.

**Verification**
- `npm --prefix Althub-admin run build`

### Fixed dashboard metric card alignment

**Files changed**
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/styles/dashboard.css`
- `improvement.md`

**What changed**
- Shortened dashboard card names to match the admin tabs: Students, Alumni, Events, Calendar, Posts.
- Changed `No dates` to `No date` to reduce visual weight in the calendar card.
- Locked each dashboard card into equal internal rows so titles, values, and action buttons align consistently.

**Reason**
- Longer card names were wrapping and pushing values/buttons out of alignment.
- The dashboard card row needed predictable vertical rhythm more than smaller scale.

**Verification**
- `npm --prefix Althub-admin run build`

### Simplified dashboard metric card layout

**Files changed**
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/styles/dashboard.css`
- `improvement.md`

**What changed**
- Removed long explanatory text from each dashboard card.
- Changed the card section title to `Portal Snapshot`.
- Compressed the metric cards into a cleaner icon, label, value, and action layout.
- Switched the card grid to adaptive columns so the dashboard does not force five cramped cards into one row.

**Reason**
- The previous cards were too tall, text-heavy, and visually crowded.
- Admin dashboard metrics need to be scan-first, not explanation-heavy.

**Verification**
- `npm --prefix Althub-admin run build`

### Aligned admin dashboard with real tab statistics

**Files changed**
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/styles/dashboard.css`
- `Althub-server/models/portalAnnouncementModel.js`
- `Althub-server/routes/portalAnnouncementRoute.js`
- `Althub-server/routes/apiRoutes.js`
- `Althub-super-admin/src/pages/Announcement.jsx`
- `Althub-super-admin/src/styles/announcement.css`
- `Althub-super-admin/src/app/Routes.jsx`
- `Althub-super-admin/src/layouts/Menu.jsx`
- `improvement.md`

**What changed**
- Reworked institute admin dashboard cards around the actual admin tabs and useful numbers:
  - Total students
  - Total alumni
  - Upcoming events
  - Next calendar date
  - Published posts and announcements
- Replaced the hardcoded security note with a custom portal announcement.
- Added backend storage and API for the portal announcement.
- Added a Super Admin `Announcement` page so the message can be managed from the super-admin panel.

**Reason**
- The dashboard should help admins quickly understand operational status and jump into the matching tab.
- Static security copy was not flexible enough for production operations or super-admin communication.

**Verification**
- `node --check Althub-server/models/portalAnnouncementModel.js`
- `node --check Althub-server/routes/portalAnnouncementRoute.js`
- `node --check Althub-server/routes/apiRoutes.js`
- `npm --prefix Althub-admin run build`
- `npm --prefix Althub-super-admin run build`

### Reworked dashboard into a practical management portal

**Files changed**
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/styles/dashboard.css`
- `improvement.md`

**What changed**
- Changed the dashboard cards from decorative stat tiles into minimal management-area cards.
- Added relevant descriptions for students, events, and posts so the dashboard reads like an operations portal.
- Simplified the card color system to restrained green/white surfaces with consistent icon, count, and action placement.
- Removed decorative glow/tone variants and loud visual treatment from the dashboard cards.

**Reason**
- The previous card treatment looked too decorative for an admin product.
- The dashboard should help institute admins quickly enter the core work areas: students, events, and posts.

**Verification**
- `npm --prefix Althub-admin run build`

### Redesigned admin dashboard stat cards

**Files changed**
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/styles/dashboard.css`
- `improvement.md`

**What changed**
- Replaced repeated legacy widget stat markup with one reusable card configuration.
- Added modern green/white stat cards with a consistent icon block, label, value, and action area.
- Adjusted text positioning so card labels, values, and action links are aligned predictably.
- Added responsive grid behavior for desktop, tablet, and mobile dashboard widths.

**Reason**
- The previous cards still inherited old template layout behavior, causing dull colors and awkward text placement.
- A single card structure keeps the dashboard easier to maintain and visually consistent with the Althub green theme.

**Verification**
- `npm --prefix Althub-admin run build`

### Corrected admin dashboard shell alignment

**Files changed**
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/styles/dashboard.css`
- `Althub-admin/src/styles/menu.css`
- `improvement.md`

**What changed**
- Locked dashboard content width and left offset to the shared sidebar width.
- Forced the sidebar and sidebar background to use the same width token to avoid overlap.
- Replaced the pale institute badge with a solid green dashboard chip.
- Scoped stat card styles so legacy white text and gray link strips no longer leak into the dashboard.

**Reason**
- The dashboard was visually sliding under the sidebar and old widget classes were overriding the green/white design.
- The institute tag had white text on a pale background, making it look disabled instead of highlighted.

**Verification**
- `npm --prefix Althub-admin run build`

### Routed frontend requests through shared API clients and removed legacy auth storage

**Files changed**
- `Althub-main/src/services/apiClient.js`
- `Althub-main/src/ProtectedImage.jsx`
- `Althub-main/src/components/ChangePasswordModal.jsx`
- `Althub-main/src/components/ConnectionUser.jsx`
- `Althub-main/src/components/EditEducationModal.jsx`
- `Althub-main/src/components/EditExperienceModal.jsx`
- `Althub-main/src/components/EditProfileModal.jsx`
- `Althub-main/src/components/EventModal.jsx`
- `Althub-main/src/components/Events.jsx`
- `Althub-main/src/components/Feedback.jsx`
- `Althub-main/src/components/ForgetPassword.jsx`
- `Althub-main/src/components/Home.jsx`
- `Althub-main/src/components/Login.jsx`
- `Althub-main/src/components/Message.jsx`
- `Althub-main/src/components/MyPosts.jsx`
- `Althub-main/src/components/Navbar.jsx`
- `Althub-main/src/components/NewPassword.jsx`
- `Althub-main/src/components/Notification.jsx`
- `Althub-main/src/components/Register.jsx`
- `Althub-main/src/components/SearchProfile.jsx`
- `Althub-main/src/components/ViewProfile.jsx`
- `Althub-main/src/components/ViewSearchProfile.jsx`
- `Althub-admin/src/layouts/Menu.jsx`
- `Althub-admin/src/pages/Login.jsx`
- `Althub-admin/src/features/institute/pages/Profile.jsx`
- `Althub-super-admin/src/pages/ForgotPassword.jsx`
- `Althub-super-admin/src/pages/Login.jsx`
- `Althub-super-admin/src/pages/Profile.jsx`
- `Althub-super-admin/src/layouts/Menu.jsx`
- `improvement.md`

**What changed**
- Replaced raw main-app axios imports and calls with the shared `apiClient`.
- Kept main API behavior behind `@althub/shared/api` so cookies, CSRF headers, unauthorized handling, and future interceptors apply consistently.
- Removed the main account-delete `localStorage.clear()` call.
- Removed legacy admin and super-admin profile/name/image cache writes.
- Removed old remember-me status keys and kept only remembered-email storage for login convenience.
- Moved the remaining raw super-admin forgot-password request onto the super-admin shared API client.

**Reason**
- Direct axios calls bypass shared cookie/session behavior and can create inconsistent auth failures across browsers.
- Client-side auth/profile caches drift from the server and are risky with HttpOnly-cookie auth.
- Remembered email is the only browser storage that is still useful without storing session or identity data.

**Verification**
- `npm --prefix Althub-main run build`
- `npm --prefix Althub-admin run build`
- `npm --prefix Althub-super-admin run build`
- `rg -n "\baxios\b|localStorage|sessionStorage" Althub-main/src`
- `rg -n "import axios from|axios\(" Althub-main/src Althub-admin/src Althub-super-admin/src`
- `rg -n "localStorage|sessionStorage|AlmaPlus|remember_me_status|Remember_Me" Althub-main/src Althub-admin/src Althub-super-admin/src`

### Split large backend controllers by domain

**Files changed**
- `Althub-server/controllers/instituteController.js`
- `Althub-server/controllers/institute/authController.js`
- `Althub-server/controllers/institute/passwordController.js`
- `Althub-server/controllers/institute/profileController.js`
- `Althub-server/controllers/institute/invitesController.js`
- `Althub-server/controllers/institute/officeDirectoryController.js`
- `Althub-server/controllers/userController.js`
- `Althub-server/controllers/user/authController.js`
- `Althub-server/controllers/user/passwordController.js`
- `Althub-server/controllers/user/profileController.js`
- `Althub-server/controllers/user/directoryController.js`
- `Althub-server/controllers/user/socialController.js`
- `Althub-server/controllers/adminController.js`
- `Althub-server/controllers/admin/authController.js`
- `Althub-server/controllers/admin/passwordController.js`
- `Althub-server/controllers/admin/profileController.js`
- `Althub-server/controllers/admin/directoryController.js`
- `improvement.md`

**What changed**
- Converted the three large controllers into compatibility barrels that keep the same exported handler names for existing routes.
- Moved institute handlers into auth, password reset/change, profile/account, invites/CSV import, and office directory modules.
- Moved user handlers into auth/session, password reset/change, profile/image, directory/search, and social modules.
- Moved super-admin handlers into auth/session, password reset/change, profile, and directory modules.
- Preserved existing route contracts and response shapes so the frontend does not need route changes for this refactor.

**Reason**
- The old controllers mixed unrelated responsibilities in 500-660 line files, making changes risky and hard to review.
- Domain files make it easier to find related logic, assign ownership, and continue the async/error cleanup without touching unrelated flows.
- Thin compatibility barrels let the backend move forward without breaking legacy route imports.

**Verification**
- `node --check Althub-server/controllers/userController.js`
- `node --check Althub-server/controllers/adminController.js`
- `node --check Althub-server/controllers/instituteController.js`
- `for file in Althub-server/controllers/admin/*.js Althub-server/controllers/user/*.js Althub-server/controllers/institute/*.js; do node --check "$file" || exit 1; done`
- `node -e "import('./Althub-server/routes/userRoute.js').then(()=>console.log('user route ok'))"`
- `node -e "import('./Althub-server/routes/adminRoute.js').then(()=>console.log('admin route ok'))"`
- `node -e "import('./Althub-server/routes/instituteRoute.js').then(()=>console.log('institute route ok'))"`

### Tightened admin dashboard shell and card alignment

**Files changed**
- `Althub-admin/src/features/institute/pages/Dashboard.jsx`
- `Althub-admin/src/styles/dashboard.css`
- `Althub-admin/src/styles/menu.css`
- `Althub-admin/src/styles/footer.css`
- `improvement.md`

**What changed**
- Added a centered dashboard content column so dashboard sections do not stretch awkwardly on wide screens.
- Reworked dashboard stat card sizing into a consistent grid with smaller, evenly aligned card internals.
- Anchored the profile dropdown to the header user menu with predictable width, spacing, and hover states.
- Changed the admin footer from a fixed overlay to a normal layout footer so it no longer covers dashboard content.
- Standardized footer colors and spacing against the Althub green/white shell tokens.

**Reason**
- The dashboard felt oversized and inconsistent because every section was stretching to the full remaining viewport width.
- The profile dropdown and fixed footer were visually floating over content, creating the messy layering seen in the admin UI.
- These shell-level fixes improve the dashboard and reduce similar inconsistencies across admin pages that share the same header/sidebar/footer.

**Verification**
- `npm --prefix Althub-admin run build`

### Verified and normalized shared frontend API/auth layer

**Files changed**
- `Althub-main/src/context/AuthContext.jsx`
- `Althub-main/src/components/ChangePasswordModal.jsx`
- `Althub-main/src/components/ConnectionUser.jsx`
- `Althub-main/src/components/EditEducationModal.jsx`
- `Althub-main/src/components/EditExperienceModal.jsx`
- `Althub-main/src/components/EditProfileModal.jsx`
- `Althub-main/src/components/EventModal.jsx`
- `Althub-main/src/components/Events.jsx`
- `Althub-main/src/components/Feedback.jsx`
- `Althub-main/src/components/ForgetPassword.jsx`
- `Althub-main/src/components/Home.jsx`
- `Althub-main/src/components/Login.jsx`
- `Althub-main/src/components/Message.jsx`
- `Althub-main/src/components/MyPosts.jsx`
- `Althub-main/src/components/NewPassword.jsx`
- `Althub-main/src/components/Notification.jsx`
- `Althub-main/src/components/Register.jsx`
- `Althub-main/src/components/SearchProfile.jsx`
- `Althub-main/src/components/ViewProfile.jsx`
- `Althub-main/src/components/ViewSearchProfile.jsx`
- `Althub-admin/src/pages/ForgotPassword.jsx`
- `Althub-admin/src/pages/NewPassword.jsx`
- `Althub-admin/src/features/admin-shared/forms/EventForm.jsx`
- `Althub-admin/src/features/admin-shared/forms/PostForm.jsx`
- `Althub-admin/src/features/admin-shared/pages/AdminEventsPage.jsx`
- `Althub-admin/src/features/admin-shared/pages/AdminPostsPage.jsx`
- `Althub-admin/src/features/alumni-office/pages/AlumniMembers.jsx`
- `Althub-admin/src/features/institute/pages/Feedback.jsx`
- `Althub-admin/src/features/institute/pages/Leaderboard.jsx`
- `Althub-admin/src/features/institute/pages/Users.jsx`
- `improvement.md`

**What changed**
- Moved the main frontend auth context onto the shared `createAuthSession` factory.
- Preserved main-app socket connection behavior through shared auth session callbacks.
- Normalized frontend API request paths to relative `/api/...` paths so base URL handling stays centralized in each shared API client wrapper.
- Confirmed all three apps depend on `@althub/shared` and use the shared API client layer.

**Reason**
- Main, admin, and super-admin should share one auth/session behavior model for HttpOnly cookie auth.
- Relative API paths avoid scattering API base URL logic across pages and keep CSRF/cookie handling in the shared client.
- This makes browser differences and production URL changes easier to handle in one place.

**Verification**
- `npm --prefix Althub-main run build`
- `npm --prefix Althub-admin run build`
- `npm --prefix Althub-super-admin run build`
- `node -e "import('./Althub-shared/src/apiClient.js').then(()=>console.log('shared api ok'))"`
- `node -e "import('./Althub-shared/src/config.js').then(m=>console.log(m.getViteApiBaseUrl({MODE:'development'})))"`
- `node -e "import('./Althub-server/routes/apiRoutes.js').then(()=>console.log('server api router ok'))"`
- `rg -n "import axios from|axios\(" Althub-main/src Althub-admin/src Althub-super-admin/src`
- `rg -n "\$\{ALTHUB_API_URL\}/api|\$\{WEB_URL\}/api|ALTHUB_API_URL \+" Althub-main/src Althub-admin/src Althub-super-admin/src`

### Restructured main app infrastructure folders

**Files changed**
- `Althub-main/src/api/client.js`
- `Althub-main/src/auth/session.jsx`
- `Althub-main/src/auth/AuthGuard.jsx`
- `Althub-main/src/config/api.js`
- `Althub-main/src/realtime/socket.js`
- `Althub-main/src/App.jsx`
- `Althub-main/src/index.jsx`
- `Althub-main/src/ProtectedImage.jsx`
- `Althub-main/src/components/*.jsx`
- Removed `Althub-main/src/context/AuthContext.jsx`
- Removed `Althub-main/src/components/AuthGuard.jsx`
- Removed `Althub-main/src/services/apiClient.js`
- Removed `Althub-main/src/baseURL.jsx`
- Removed `Althub-main/src/socket.jsx`
- Removed `Althub-main/src/.DS_Store`
- `improvement.md`

**What changed**
- Moved main app session state into `src/auth/session.jsx`.
- Moved route protection into `src/auth/AuthGuard.jsx`.
- Moved API client setup into `src/api/client.js`.
- Moved API URL config into `src/config/api.js`.
- Moved Socket.IO setup into `src/realtime/socket.js`.
- Removed now-empty `context` and `services` folders from the main frontend.
- Updated imports across the main app to use the new structure.

**Reason**
- `AuthContext`, `AuthGuard`, API client setup, base URL config, and socket setup were scattered across unrelated folders.
- Grouping files by responsibility makes it clearer what provides auth state, what protects routes, what talks to the backend, and what owns realtime behavior.
- Removing one-file folders and component-misnamed infrastructure files makes the main app easier to navigate before deeper feature-level restructuring.

**Verification**
- `npm --prefix Althub-main run build`
- `rg -n "context/AuthContext|services/apiClient|baseURL|socket\.jsx|components/AuthGuard" Althub-main/src`
- `find Althub-main/src -name '.DS_Store' -print`

### Fixed main profile page runtime loading issues

**Files changed**
- `Althub-main/src/App.jsx`
- `Althub-main/src/components/ViewProfile.jsx`
- `Althub-main/src/components/ViewSearchProfile.jsx`
- `Althub-main/src/components/Notification.jsx`
- `improvement.md`

**What changed**
- Added the missing `Github` icon import used by the own-profile page.
- Hardened own-profile skills and languages parsing so invalid, empty, array, or comma-separated values do not crash rendering.
- Added guards so profile-related API calls do not run before an authenticated user id exists.
- Added `/view-search-profile/:id` routing for profile links that come from notifications or direct URLs.
- Changed notification profile clicks to open the searched-user profile route instead of an undefined `/view-profile/:id` route.
- Updated searched-user profile loading to support both route params and navigation state.

**Reason**
- `ViewProfile` could crash at runtime when a user had a GitHub value because the `Github` component was referenced but not imported.
- `/view-profile/:id` was not registered as a route, so notification profile links could fall through to the wrong page.
- Profile data fields are not guaranteed to always be valid JSON strings, so direct `JSON.parse` made profile pages fragile.

**Verification**
- `npm --prefix Althub-main run build`
- `rg -n "<Github|Github|/view-profile/|JSON\.parse\(.*skills|JSON\.parse\(.*languages" Althub-main/src/components Althub-main/src/App.jsx`
- `rg -n "view-search-profile/:id|view-profile/:id|handleProfileRedirect" Althub-main/src`

### Consolidated admin and super-admin auth/API infrastructure folders

**Files changed**
- `Althub-admin/src/auth/session.jsx`
- `Althub-admin/src/auth/ProtectedRoute.jsx`
- `Althub-admin/src/api/client.js`
- `Althub-admin/src/App.jsx`
- `Althub-admin/src/app/Routes.jsx`
- `Althub-admin/src/layouts/Footer.jsx`
- `Althub-admin/src/layouts/Menu.jsx`
- `Althub-admin/src/hooks/useSessionTimeout.js`
- `Althub-admin/src/pages/*.jsx`
- `Althub-admin/src/features/**/*.jsx`
- Removed `Althub-admin/src/context/AuthContext.jsx`
- Removed `Althub-admin/src/components/ProtectedRoute.jsx`
- Removed `Althub-admin/src/service/axios.js`
- `Althub-super-admin/src/auth/session.jsx`
- `Althub-super-admin/src/auth/AuthGuard.jsx`
- `Althub-super-admin/src/api/client.js`
- `Althub-super-admin/src/App.jsx`
- `Althub-super-admin/src/app/Routes.jsx`
- `Althub-super-admin/src/layouts/Menu.jsx`
- `Althub-super-admin/src/pages/*.jsx`
- Removed `Althub-super-admin/src/context/AuthContext.jsx`
- Removed `Althub-super-admin/src/components/AuthGuard.jsx`
- Removed `Althub-super-admin/src/services/axios.jsx`
- Removed admin and super-admin `.DS_Store` files
- `improvement.md`

**What changed**
- Moved admin auth session setup into `src/auth/session.jsx`.
- Moved admin route protection into `src/auth/ProtectedRoute.jsx`.
- Moved admin API client setup into `src/api/client.js`.
- Moved super-admin auth session setup into `src/auth/session.jsx`.
- Moved super-admin route guard into `src/auth/AuthGuard.jsx`.
- Moved super-admin API client setup into `src/api/client.js`.
- Updated all imports to use the new auth and API folder structure.
- Removed old one-purpose `context`, `service`, and `services` folders after moving their contents.

**Reason**
- Auth context, route guards, and API clients were split between generic `context`, `components`, `service`, and `services` folders.
- Keeping session, route protection, and API client setup in explicit `auth` and `api` folders makes admin, super-admin, and main follow the same structure.
- Removing the old files avoids duplicate names and makes it clearer where future auth/session changes belong.

**Verification**
- `npm --prefix Althub-admin run build`
- `npm --prefix Althub-super-admin run build`
- `rg -n "context/AuthContext|components/AuthGuard|components/ProtectedRoute|service/axios|services/axios|from ['\"]\.\./context|from ['\"]\.\./\.\./\.\./context" Althub-admin/src Althub-super-admin/src`
- `find Althub-admin/src Althub-super-admin/src -name '.DS_Store' -print`

### Renamed admin role workspaces and configured role access

**Files changed**
- `Althub-admin/src/app/Routes.jsx`
- `Althub-admin/src/auth/ProtectedRoute.jsx`
- `Althub-admin/src/portals/institute/**`
- `Althub-admin/src/portals/alumni-office/**`
- `Althub-admin/src/portals/placement-cell/**`
- `Althub-admin/src/portals/shared/**`
- Removed `Althub-admin/src/features/**`
- `improvement.md`

**What changed**
- Renamed `src/features` to `src/portals` because these folders represent admin portal workspaces for different login roles.
- Renamed `src/portals/admin-shared` to `src/portals/shared` for reusable portal forms/pages.
- Renamed shared page modules from `AdminEventsPage` and `AdminPostsPage` to `PortalEventsPage` and `PortalPostsPage`.
- Added explicit role groups in `Routes.jsx`.
- Configured institute-only routes, alumni-office-only routes, placement-cell-only routes, and shared routes.
- Updated `ProtectedRoute` to distinguish authentication from role authorization.
- Unauthorized role access now redirects back to `/dashboard` instead of letting another role open the page directly.

**Reason**
- The old `features` name made these folders look like generic product features, but they are role-delegated portal workspaces.
- Menu visibility alone is not enough because users could still enter another role's route directly.
- The folder and route structure now reflects the actual access model of the admin portal.

**Verification**
- `npm --prefix Althub-admin run build`
- `rg -n "features|admin-shared|src/features|\.\./features|\.\./\.\./features|\.\./\.\./\.\./features" Althub-admin/src`
- `rg -n "AdminEventsPage|AdminPostsPage|features|admin-shared" Althub-admin/src`

### Admin UI browser polish pass

**Files changed**
- `Althub-admin/src/layouts/Menu.jsx`
- `Althub-admin/src/styles/menu.css`
- `Althub-admin/src/portals/institute/pages/Dashboard.jsx`
- `Althub-admin/src/portals/shared/pages/PortalEventsPage.jsx`
- `Althub-admin/src/styles/events.css`
- `Althub-admin/src/components/admin/AdminTableAction.jsx`
- `improvement.md`

**What changed**
- Opened the admin portal in the in-app browser and checked dashboard, member directory, events, posts, and feedback.
- Moved dashboard onto the shared `AppShell` instead of manually touching `page-loader`, `page-container`, and `window.App`.
- Fixed the profile dropdown by removing legacy Bootstrap dropdown menu classes and anchoring the custom menu with admin shell CSS.
- Tightened the events stats strip, toolbar, filter tabs, view buttons, event cards, and pagination so they do not create oversized blank spaces at medium/mobile widths.
- Rewired the event detail modal JSX to use the CSS classes that already existed for the modern modal layout.
- Constrained event modal media height on smaller screens so the event details and actions are visible without awkward scrolling.
- Changed the event delete action from an icon-only square to a labelled red action button inside the modal.
- Normalized `AdminTableAction` icon names so callers can pass either `trash-alt` or `fa-trash-alt`.

**Reason**
- Several UI problems were caused by small inconsistencies rather than missing design: legacy Bootstrap classes competing with custom CSS, mismatched modal class names, and flex-basis behavior making toolbars too tall.
- Moving dashboard into the same shell lifecycle as the other admin pages removes another direct DOM manipulation path and keeps layout behavior predictable.
- Normalizing shared action icons prevents blank action buttons like the post delete control.

**Verification**
- Browser checked `http://localhost:3001/dashboard`
- Browser checked `http://localhost:3001/users`
- Browser checked `http://localhost:3001/events`
- Browser checked `http://localhost:3001/posts`
- Browser checked `http://localhost:3001/feedback`
- `npm --prefix Althub-admin run build`

### Actor-specific frontend session checks

**Files changed**
- `Althub-shared/src/auth/createAuthSession.jsx`
- `Althub-main/src/auth/session.jsx`
- `Althub-admin/src/auth/session.jsx`
- `Althub-super-admin/src/auth/session.jsx`
- `Althub-server/routes/userRoute.js`
- `Althub-server/routes/instituteRoute.js`
- `Althub-server/routes/adminRoute.js`
- `improvement.md`

**What changed**
- Added configurable `mePath` support to the shared auth session helper.
- Pointed main to `/api/auth/main/me`.
- Pointed admin to `/api/auth/admin/me`.
- Pointed super-admin to `/api/auth/super-admin/me`.
- Added backend actor-specific session endpoints guarded by role:
  - main: `student`, `alumni`
  - admin portal: `institute`, `alumni_office`, `placement_cell`
  - super-admin: `admin`

**Reason**
- The old shared `/api/auth/me` endpoint could return whichever valid actor cookie was present in the browser.
- On localhost, after checking admin, Althub main could hydrate with an admin/institute actor object and render missing user fields such as `fname`, causing UI text like `What's on your mind, undefined?`.
- Each frontend now asks for the session shape that matches its actor, so cookies from another portal no longer count as a valid session.

**Verification**
- Browser confirmed `http://localhost:3000/login` no longer redirects to `/home` from the admin cookie alone.
- Browser login attempt with `meetgandhi4041@gmail.com` and the provided main password returned `Invalid Credentials`, so authenticated main page inspection is blocked until the password is corrected.
- `npm --prefix Althub-main run build`
- `npm --prefix Althub-admin run build`
- `npm --prefix Althub-super-admin run build`

### Althub main Brave auth and route verification

**Files changed**
- `Althub-main/src/components/Notification.jsx`
- `Althub-main/src/components/Login.jsx`
- `Althub-main/src/ProtectedImage.jsx`
- `Althub-server/routes/userRoute.js`
- `improvement.md`

**What changed**
- Tested Althub main in Brave/Chromium, not Safari, with `jashshah.itims@gmail.com`.
- Changed the main actor session check to accept the valid `althub_main_token` user-model cookie instead of depending on a stored role string.
- Guarded notifications until a user id exists so the first render after login does not make an invalid request.
- Sanitized legacy notification text so old records containing `undefined` or `null` render with safe fallback names/messages.
- Added login input autocomplete attributes for a cleaner browser login flow.
- Reworked protected image loading so HttpOnly-cookie image requests retry once after session hydration and revoke blob URLs correctly.

**Reason**
- The supplied main account has an empty stored `role`, so a role-only `/api/auth/main/me` guard rejected an otherwise valid main session.
- Several main pages depend on the authenticated user immediately after login; guarding early requests prevents noisy failed calls and broken placeholder text.
- Protected image fetching can race the post-login cookie/session moment. A small retry and correct cleanup keeps avatars stable without storing tokens in JavaScript.

**Verification**
- Brave/Chromium CDP login succeeded and `/api/auth/main/me` returned the Jash user profile.
- Route sweep passed for `/home`, `/view-profile`, `/my-posts`, `/search-profile`, `/events`, `/feedback`, `/notification`, and `/message`.
- Checked for login redirects, `undefined`, `NaN`, and horizontal overflow across the swept routes.
- `npm --prefix Althub-main run build`
