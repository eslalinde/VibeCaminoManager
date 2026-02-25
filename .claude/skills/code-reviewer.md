---
name: code-reviewer
description: 'Review code changes for ComunidadCat. Checks correctness, Supabase patterns, React Query usage, RLS policies, and Electron compatibility.'
---

# Code Reviewer

Review code for the ComunidadCat application (Next.js 15 + Electron + Supabase).

## Workflow

### 1. Determine Review Target

- **Remote PR**: If given a PR number/URL, use `gh pr checkout <number>`
- **Local Changes**: If no PR specified, review `git diff` and `git diff --staged`

### 2. Preparation

#### For Remote PRs:
1. Checkout: `gh pr checkout <PR_NUMBER>`
2. Verify: `cd caminomanager && npm run type-check && npm run lint`
3. Read PR description and existing comments

#### For Local Changes:
1. `git status` to identify changed files
2. `git diff` and `git diff --staged` for detailed changes

### 3. Analysis Pillars

#### Correctness
- Does the code work as intended?
- Are Supabase queries correct (proper `.select()`, `.eq()`, `.order()`)?
- Are React Query mutations invalidating the right query keys?
- Do form validations match DB constraints?

#### Data Layer
- Are new tables covered by RLS policies?
- Do migrations handle rollback scenarios?
- Are foreign keys properly defined with cascade behavior?
- Is the Supabase client used via the singleton pattern (`createClient()` from utils)?
- Are error codes (23505, 23503, 23514) properly handled?

#### React Patterns
- Are hooks following Rules of Hooks?
- Is `useCrud` used for standard CRUD instead of custom hooks?
- Are query keys from `queryKeys` (not hardcoded strings)?
- Is `staleTime`/`gcTime` consistent with project defaults?
- Are components using `EntityConfig` pattern for new entities?

#### TypeScript
- Are types properly defined (no `any`, no `as` casts without justification)?
- Do types match the Supabase schema?
- Is strict mode respected?
- Are `@/*` path aliases used consistently?

#### Security
- No Supabase keys hardcoded
- RLS policies cover all CRUD operations
- Auth checks in protected routes
- No sensitive data in client-side code

#### Electron Compatibility
- Does the change work with `output: 'export'` (static)?
- No server-side features (API routes, middleware) unless web-only
- IPC communication uses `contextBridge` (no direct Node.js exposure)

#### UI/UX
- All user-facing text in **Spanish**
- Radix UI + Tailwind patterns followed
- Print-friendly classes where needed (`print:hidden`, `print:block`)
- Accent-aware search for text inputs

### 4. Feedback Format

#### Summary
A high-level overview of the changes.

#### Findings

- **Critical**: Bugs, security issues, RLS gaps, breaking changes
- **Improvements**: Better patterns, performance, cache strategy
- **Nitpicks**: Formatting, naming conventions (optional)

#### Conclusion
Clear recommendation: **Approved** / **Request Changes**

### 5. Cleanup (Remote PRs)
Ask if the user wants to switch back to the default branch.
