# Plan: Git Commit & Push to Production

## Steps
1. **Commit & Push in `sankara/`**:
   - `git add backend/.env.example backend/resources/views/developer_dashboard.blade.php backend/routes/api.php`
   - `git commit -m "feat: add dynamic SANKARA_ID_API_URL configuration and refactor health endpoints"`
   - `git push origin main`

2. **Commit & Push in `/home/fox/sankara_id`**:
   - `git add admin-client/ backend/ sankara plan.md`
   - `git commit -m "feat: centralize API configuration, restore database seed data, fix static uploads mount, and update sankara submodule"`
   - `git push origin main`
