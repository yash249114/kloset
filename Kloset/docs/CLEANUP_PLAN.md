# Kloset Repository Cleanup Plan

**Repo:** `yash249114/kloset`  
**Date:** 2026-06-16  
**Goal:** Remove stale/unnecessary files before production, estimate storage savings.

---

## Classification

### KEEP

| Path | Size | Reason |
|------|------|--------|
| `backend/` | — | Core Go backend |
| `frontend/` | — | Core Next.js frontend |
| `.github/` | 0.01 MB | Active CI/CD workflows (ci, deploy, pr-check) |
| `.agents/` | 0.15 MB | Active AI tooling config (referenced by `skills-lock.json`) |

### ARCHIVE (preserve locally or in tarball, remove from git tracking)

| Path | Size | Reason |
|------|------|--------|
| `artifacts/` | 351.75 MB | 859 files — AI-generated audit screenshots, task logs, scratchpads, reports. Not referenced by production code. |
| `stitch_marketplace/` | 15.54 MB | 105 files — Stitch design export (UI mockups/screenshots). Documentation artifact, not code. |

### DELETE (remove entirely from repo and local)

| Path | Size | Reason |
|------|------|--------|
| `Kloset/` | **1,017.64 MB** | **Stale duplicate** — full nested copy of the entire project (94,443 files, 84,805 untracked). Go module `github.com/kloset/backend` matches root `backend/`. Zero references in any config or import. |
| `template from trickle/` | 0.03 MB | Unused Trickle platform scaffolding template. Not integrated with main project. |
| `stitch_export/` | 0 MB | Empty leftover directory from design tool export. |
| `.antigravitycli/` | ~0 MB | Machine-specific local CLI config (references `C:/Users/alany/...`). Non-portable. |
| `.commandcode/` | ~0 MB | Machine-specific AI coding tool config. Non-portable. |

---

## Estimated Storage Savings

| Category | Size |
|----------|------|
| DELETE — `Kloset/` | 1,017.64 MB |
| DELETE — other dirs | 0.03 MB |
| ARCHIVE — `artifacts/` | 351.75 MB |
| ARCHIVE — `stitch_marketplace/` | 15.54 MB |
| **Total reclaimable** | **~1,385 MB (1.35 GB)** |

After cleanup, the repository shrinks from ~1.5 GB to **~150 MB** (backend + frontend + `.github` + `.agents`).

---

## Execution Plan

```bash
# 1. Archive artifacts + stitch_marketplace to tarball (preserve locally)
tar -czf kloset-archive-2026-06-16.tar.gz artifacts/ stitch_marketplace/

# 2. Remove DELETE directories
rm -rf Kloset/ "template from trickle/" stitch_export/ .antigravitycli/ .commandcode/

# 3. Remove ARCHIVE directories from working tree
rm -rf artifacts/ stitch_marketplace/

# 4. Update .gitignore to prevent re-introduction
cat >> .gitignore << 'EOF'

# Cleanup — archived artifacts
/artifacts/
/stitch_marketplace/
/Kloset/
/template from trickle/
/stitch_export/
.antigravitycli/
.commandcode/
EOF

# 5. Commit and push
git add -A
git commit -m "chore(cleanup): remove stale duplicates, archive artifacts"
git push origin <branch>
```

> **Note:** The 1 GB `Kloset/` duplicate is the primary target — it accounts for ~73% of total reclaimable space. Verify it contains no unique uncommitted work before deletion.
