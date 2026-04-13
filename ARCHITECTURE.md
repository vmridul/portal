# Portal Architecture

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Convex (real-time queries, mutations, subscriptions)
- **Auth:** Firebase Auth (Google OAuth)
- **State:** Zustand (UI state), Convex (server state)

## Key Patterns

### 1. Data Layer Separation
- **Server State:** Convex queries via custom hooks in `src/hooks/`
- **Client State:** Zustand for global UI (`store/`), React Context for theme/presence
- **Components:** Thin - only rendering and event wiring, no Convex calls

### 2. Folder Structure
```
src/
├── hooks/        # All Convex data access (queries, mutations)
├── components/   # Chat components (virtualized-message-list)
├── lib/
│   ├── constants/   # Routes, config
│   ├── types/      # TypeScript domain types
│   └── utils/      # Date, message, avatar helpers
components/ui/   # UI components
convex/         # Backend handlers
store/          # Zustand stores
contexts/       # React contexts
```

### 3. Data Flow
1. User action → Component calls hook function
2. Hook executes Convex query/mutation
3. Real-time updates propagate via Convex subscriptions
4. UI re-renders from server state

### 4. Pagination
- Cursor-based pagination in Convex queries
- `@tanstack/react-virtual` for message virtualization

## No-Nos
- ❌ No `useQuery`/`useMutation` directly in components (use hooks)
- ❌ No `any` (use domain interfaces from `lib/types`)
- ❌ No hardcoded strings (use `lib/constants/`)
- ❌ No business logic in components (use `lib/utils/`)

## Pre-Existing Issues
- `rightSidebar.tsx`: TypeScript strict mode issues (not migrated)

## Notes
- Original file structure at root level (`components/`, `lib/`, `store/`)
- New structured code in `src/hooks/`, `src/components/`, `src/lib/`
- Migration of old code to new structure ongoing