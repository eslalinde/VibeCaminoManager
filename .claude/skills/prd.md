---
name: prd
description: 'Generate Product Requirements Documents (PRDs) for ComunidadCat features. Includes user stories, technical specs for Next.js/Electron/Supabase, and domain-aware scoping.'
---

# Product Requirements Document (PRD)

## Overview

Design PRDs tailored to the ComunidadCat stack: Next.js 15 + Electron + Supabase. Documents are scoped to this domain (Neocatechumenal community management) and its specific technical constraints.

## When to Use

- Starting a new feature or enhancement for ComunidadCat
- Defining requirements for a new entity, report, or workflow
- Planning changes that affect multiple layers (DB + API + UI + Electron)
- User asks to "write a PRD", "plan a feature", or "document requirements"

---

## Operational Workflow

### Phase 1: Discovery

Before writing the PRD, **ask the user** to fill knowledge gaps:

- **The Feature**: What should it do? Which entity/page does it affect?
- **Users**: Who uses it? (Admin, contributor, viewer per RLS roles)
- **Scope**: Is it web-only, Electron-only, or both?
- **Data Model**: Does it need new tables/columns in Supabase?
- **Constraints**: Does it interact with existing entities or RLS policies?

### Phase 2: Analysis

Investigate the codebase:

1. Check existing entity configs in `src/config/entities.ts`
2. Review related hooks in `src/hooks/`
3. Check Supabase migrations in `supabase/migrations/`
4. Review current RLS policies if auth-related
5. Identify affected routes in `src/app/(main)/(protected)/`

### Phase 3: Draft the PRD

---

## PRD Schema

### 1. Executive Summary

- **Problem Statement**: 1-2 sentences on the gap.
- **Proposed Solution**: 1-2 sentences on the approach.
- **Success Criteria**: 3-5 measurable outcomes.

### 2. User Experience

- **User Personas**: Admin, Contributor, Viewer (map to RLS roles).
- **User Stories**: `Como [usuario], quiero [acción] para [beneficio].`
- **Acceptance Criteria**: Bulleted "Done" definitions.
- **Non-Goals**: What we are NOT building.
- **UI Language**: All user-facing text in Spanish.

### 3. Data Model Changes

- **New Tables**: Schema with columns, types, constraints.
- **Modified Tables**: Columns added/removed, migration strategy.
- **RLS Policies**: Required policies per role (admin, contributor, viewer).
- **Migration File**: Naming convention `YYYYMMDDHHMMSS_description.sql`.

### 4. Technical Specifications

- **Frontend**:
  - Route: `/src/app/(main)/(protected)/[route]/page.tsx`
  - Components: EntityConfig, hooks, modals needed
  - State: React Query keys and cache strategy
- **Supabase**: Tables, views, functions, RLS
- **Electron** (if applicable): IPC handlers, preload changes
- **Integration Points**: Foreign keys, existing hooks affected

### 5. Risks & Rollout

- **Migration Risk**: Data loss, breaking changes
- **RLS Risk**: Security gaps if policies are incomplete
- **Phased Rollout**: What is MVP vs. future enhancement

---

## Quality Standards

Use concrete, measurable criteria:

```diff
# Vague (BAD)
- The page should load fast and be easy to use.

# Concrete (GOOD)
+ The entity list must support search with accent-aware matching.
+ The form must validate required fields before submission.
+ RLS must prevent contributors from deleting records they don't own.
```

---

## Implementation Guidelines

### DO
- Verify data model changes against existing migrations
- Define RLS policies for every new table
- Specify Spanish UI text for all labels and messages
- Include React Query cache invalidation strategy

### DON'T
- Skip Discovery: Always ask at least 2 clarifying questions
- Assume table structure: Check `supabase/migrations/` first
- Forget Electron: Consider static export implications
