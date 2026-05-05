# Althub Architecture Fix Plan

This plan tracks structural fixes that make the repo easier to scale. It intentionally excludes environment/secret handling for now.

## Phase 1: Workspace Foundation

- [x] Add a root workspace manifest.
- [x] Add root scripts for starting each app and building all frontends.
- [x] Verify root `npm run build` builds main, admin, and super-admin.
- [x] Normalize root scripts to use the canonical `Althub-server` path.
- [x] Rename the tracked backend folder to `Althub-server`.
- [x] Confirm generated `build/` output is deployment-only and ignored.

## Phase 2: Configuration Consistency

- [x] Replace CRA-style `process.env.REACT_APP_API_URL` usage in the Vite main app.
- [x] Standardize API base URL modules across main, admin, and super-admin.
- [x] Move hardcoded local/frontend origins into a central server config module.
- [x] Make backend origin config extensible without editing server bootstrap code.
- [x] Standardize dev ports in one documented place.

## Phase 3: Dependency Alignment

- [x] Align React versions across all frontend apps.
- [x] Align Vite and `@vitejs/plugin-react` versions.
- [x] Align shared libraries such as `axios`, `react-router-dom`, and `react-toastify`.
- [x] Rebuild and smoke-test after each dependency family is aligned.
- [ ] Review remaining npm audit advisory without forced breaking fixes.

## Phase 4: Shared Frontend Utilities

- [x] Extract a shared API client pattern for the main app.
- [x] Extend the shared API client pattern across admin and super-admin.
- [x] Extract shared auth/session helpers.
- [x] Extract shared image URL helper logic.
- [ ] Extract route guard patterns for main/admin/super-admin.

## Phase 5: Admin/Super-Admin Consolidation

- [ ] Consolidate duplicate post management pages.
- [ ] Consolidate duplicate event management pages.
- [ ] Convert role-specific differences into config, not copied components.
- [ ] Move shared admin layout and design tokens into one layer.

## Phase 6: Backend API Structure

- [x] Introduce `/api/v1` for new routes.
- [x] Keep old `/api` routes as compatibility aliases during migration.
- [x] Add initial resource-based aliases for posts, events, users, and notifications.
- [ ] Continue renaming remaining endpoints toward resource-based conventions.
- [ ] Group backend code by domain or add service boundaries under the existing structure.
- [x] Apply `asyncHandler` and the global error response format to inline route handlers.
- [x] Apply `asyncHandler` and the global error response format to smaller domain controllers.
- [ ] Apply `asyncHandler` and the global error response format consistently across controllers.

## Phase 7: Tests and CI

- [ ] Add smoke tests for auth, health, posts, events, users, and institute routes.
- [ ] Add root CI/build workflow.
- [ ] Add frontend build checks for all apps.
- [ ] Add regression tests before large API route migrations.
