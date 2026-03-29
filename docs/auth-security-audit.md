# Authentication and Authorization Audit

Date: 2026-03-25

Scope:
- `Althub-main`
- `Althub-admin`
- `Althub-super-admin`
- `Althub-Server`

## Summary

The codebase had multiple authentication and authorization weaknesses. The most serious issues were:

1. Super-admin route protection trusted only client-side localStorage.
2. Notification APIs allowed unauthenticated read/create/delete operations.
3. Institute-side account update/delete handlers trusted attacker-controlled IDs.
4. Student password reset tokens were stored in plaintext and had no expiry.
5. Admin registration allowed a hardcoded fallback secret if env was missing.
6. Main/admin clients stored bearer tokens in localStorage even though server cookies already existed.

## Findings

### P0

- Super-admin UI access depended on `AlmaPlus_admin_Id` in localStorage rather than a live server-validated session.
- Notification endpoints did not require authentication and did not bind access to the authenticated user.
- Institute/alumni-office/placement-cell profile update and delete flows accepted arbitrary target IDs rather than using `req.user._id`.

### P1

- Student password reset tokens were stored and matched in plaintext with no expiration.
- Admin registration used a default hardcoded secret when `ADMIN_REGISTRATION_SECRET` was not configured.
- Main and admin apps stored access tokens in localStorage, increasing XSS impact.
- Admin and super-admin client-side route guards did not validate server sessions before unlocking protected UI.

## Fix Plan

### Batch 1

- Require auth for notification APIs and enforce ownership checks.
- Bind institute account update/delete to the authenticated account.
- Hash and expire student password reset tokens.
- Remove the hardcoded admin registration fallback secret.
- Move main/admin apps toward cookie-first session auth.
- Make admin and super-admin frontend guards validate real sessions with the backend.

### Batch 2

- Review remaining authorization checks for object-level ownership.
- Reduce account enumeration in password reset/login responses where appropriate.
- Review all profile/account fetch endpoints for least-privilege field exposure.
- Ensure logout clears all auth cookies, including refresh-token state.
- Bind profile picture and follow/unfollow actions to the authenticated user instead of request body identifiers.

## Notes

- Backend authorization is the primary trust boundary; frontend guards are helpful but never sufficient on their own.
- Cookie-based auth with `HttpOnly` cookies is safer than duplicating bearer tokens into localStorage.
