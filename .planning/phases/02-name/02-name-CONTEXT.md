# Phase 2: name - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 builds upon the foundation established in Phase 1 to implement core chat functionality including user authentication, real-time messaging, and message persistence. This phase delivers the ability for users to register, authenticate, send and receive messages in real-time, and persist chat history.

</domain>

<decisions>
## Implementation Decisions

### Authentication
- **D-01:** Implement JWT-based authentication with httpOnly cookies for secure session management
- **D-02:** Create authentication context provider to manage user state across the application
- **D-03:** Design login/register forms with form validation and error handling

### Data Management
- **D-04:** Use React Query for server state management and caching
- **D-05:** Implement pagination for message lists to handle large chat histories efficiently
- **D-06:** Design RESTful API endpoints for message operations (send, fetch, delete)

### Real-time Communication
- **D-07:** Integrate WebSocket connection for live message updates
- **D-08:** Implement message broadcasting to update all connected clients when new messages arrive
- **D-09:** Handle connection reconnection and offline message queuing

### Error Handling
- **D-10:** Implement global error boundary to catch and display unexpected errors
- **D-11:** Create standardized error response format for API endpoints
- **D-12:** Add retry mechanism for failed requests with exponential backoff

### Performance
- **D-13:** Implement query caching with React Query to reduce redundant API calls
- **D-14:** Use windowing/virtualization for long message lists (building on Phase 1 foundation)
- **D-15:** Implement lazy loading for non-critical components and assets

### OpenCode's Discretion
- Specific UI component libraries for authentication forms
- Choice between different WebSocket implementations (Socket.IO vs native WebSocket)
- Exact caching strategy and cache invalidation rules

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap References
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria

### Requirements References
- `.planning/REQUIREMENTS.md` — REQ-04 and REQ-05 (specific requirements to be detailed)

### Prior Phase Decisions
- `.planning/phases/01-name/01-name-CONTEXT.md` — All Phase 1 decisions are carried forward:
  - Component implementation approach
  - Responsive design with collapsible sidebar
  - Performance optimization via Next.js code splitting
  - Accessibility foundations with ARIA labels and keyboard navigation

### Codebase Discoveries
- `components/layout/Sidebar.tsx` — Existing sidebar component to extend for authentication status
- `components/layout/Header.tsx` — Existing header to extend with user authentication controls
- `lib/utils.ts` — Existing utility functions including `cn` for class name merging
- `app/layout.tsx` — Existing layout structure to maintain

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Sidebar component** (`components/layout/Sidebar.tsx`): Can be extended to show user authentication status and login/logout controls
- **Header component** (`components/layout/Header.tsx`): Can be extended to display user avatar and authentication menus
- **cn utility** (`lib/utils.ts`): Reusable for combining Tailwind classes across new components
- **Layout structure** (`app/layout.tsx`): Provides consistent foundation for authentication-protected routes

### Established Patterns
- **Responsive design**: Mobile-first approach with breakpoint-based styling (to be continued)
- **Component composition**: Building complex UIs from smaller, focused components (to be extended)
- **State management**: Using React context for global state (to be expanded for auth state)
- **Error boundaries**: React error boundaries for graceful error handling (to be implemented globally)

### Integration Points
- **Authentication flows**: Will integrate with existing layout components to show/hide navigation based on auth state
- **Real-time features**: Will connect to existing message list components to update UI when new messages arrive
- **Data fetching**: Will enhance existing message fetching to use React Query for caching and pagination

</code_context>

<specifics>
## Specific Ideas

- Authentication should support both email/password and OAuth providers (Google, GitHub) eventually
- Message persistence should allow for message editing and deletion with appropriate time limits
- Real-time updates should include typing indicators and read receipts
- Error handling should distinguish between network errors, validation errors, and server errors
- Performance optimizations should consider prefetching of likely next messages in a conversation

</specifics>

<deferred>
## Deferred Ideas

- Message reactions and threaded conversations (belongs in Phase 3)
- Advanced search and filtering capabilities (belongs in Phase 3 or 4)
- Message forwarding and media sharing (belongs in Phase 3)
- Admin dashboard and moderation tools (belongs in Phase 4)

### Reviewed Todos (not folded)
- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-name*
*Context gathered: 2026-04-18*