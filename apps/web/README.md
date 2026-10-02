# Aloeve Art Studio - System Verification Checklist

## Environment Configuration
- [x] `VITE_POCKETBASE_URL` environment variable configured in frontend (`apps/web/.env`).
- [x] `POCKETBASE_URL` environment variable configured in backend (`apps/api/.env`).
- [x] Proxy configured in `vite.config.js` to route `/api` requests to the correct PocketBase instance.

## Codebase Integrity
- [x] No hardcoded URLs in source code.
- [x] Centralized PocketBase configuration implemented in `apps/web/src/config/pocketbaseConfig.js`.
- [x] Unnecessary/dummy requests removed from `AuthContext.jsx` and other components.

## Authentication & Routing
- [x] Login/logout flows work correctly with the centralized URL.
- [x] User session persists correctly across reloads.
- [x] Protected routes are accessible only when authenticated and authorized.
- [x] Error handling implemented for PocketBase connection failures with user-friendly messages.

## Verification Commands
Run the following commands in your terminal to verify no hardcoded URLs exist: