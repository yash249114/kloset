# Admin Type Fixes

## Type Fixes

### `app/admin/security/page.tsx`

| Before | After | Detail |
|--------|-------|--------|
| `useState<any[]>([])` | `useState<AdminLogEntry[]>([])` | Replaced `any[]` with `AdminLogEntry` imported from `@/lib/api` |
| `(log: any)` in `.map()` | `(log)` | Removed explicit `any` annotation; type inferred from `AdminLogEntry[]` |
| `import Badge from '@/components/ui/Card'` | removed | Unused import — no `<Badge>` in template |
| `import React, { useState, useEffect }` | `import { useState, useEffect }` | Removed unused default `React` import (automatic JSX transform) |

### `app/admin/support/page.tsx`

| Before | After | Detail |
|--------|-------|--------|
| `useState<any[]>([])` | `useState<SupportTicket[]>([])` | Replaced `any[]` with local `SupportTicket` interface |
| `(ticket: any)` in `.map()` | `(ticket)` | Removed explicit `any` annotation; type inferred from `SupportTicket[]` |
| `import React, { useState, useEffect }` | `import { useState, useEffect }` | Removed unused default `React` import (automatic JSX transform) |

**New interface added to `app/admin/support/page.tsx`:**

```ts
interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  renterName?: string;
  created_at: string;
}
```

### `lib/api.ts`

| Before | After | Detail |
|--------|-------|--------|
| `AdminLogEntry` had no `id` field | Added `id?: string` | Security page uses `log.id` as React key; field exists at runtime but was missing from the type |

### Lint result

`npm run lint` passes with **0 errors** and **0 warnings** on both target files.
