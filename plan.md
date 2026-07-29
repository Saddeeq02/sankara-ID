# Plan: Instant Activities Gallery Load Optimization

## Steps
1. **Optimize `sankara/frontend/src/screens/Activities.js`**:
   - Render gallery items instantly on initial mount (0ms latency).
   - Implement `sessionStorage` caching for `/api/activities` data.
   - Add skeleton shimmer effect & `decoding="async"` fade-in image transition.

2. **Build & Verify**:
   - Run `npm run build` in `sankara/frontend`.
   - Commit & push changes to remote git repository.
