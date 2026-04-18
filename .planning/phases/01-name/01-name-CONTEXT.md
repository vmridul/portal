# Phase 1: name - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Establishing the visual and interaction contract for frontend phases. This phase sets up the foundation for all UI work including component library configuration, responsive design patterns, performance optimizations, and accessibility baseline.

</domain>

<decisions>
## Implementation Decisions

### Component Implementation Approach
- **D-01:** Extend shadcn components with custom variants for our specific needs - provides consistency with the design system while allowing for our specific UI needs

### Responsive Design Strategy
- **D-02:** Mobile-first with collapsible sidebar on mobile (<768px) and adaptive layouts - matches common dashboard patterns and existing layout structure

### Performance Foundation
- **D-03:** Leverage Next.js automatic route-based code splitting - provides good performance out-of-the-box with minimal configuration

### Accessibility Implementation
- **D-04:** Start with proper ARIA labels and keyboard navigation - these provide the most impact for accessibility with reasonable implementation effort

### OpenCode's Discretion
[Areas where user said "you decide" — note that OpenCode has flexibility here]
- Specific breakpoint values beyond the standard ones (640px, 768px, 1024px, 1280px) can be adjusted by OpenCode based on design needs
- Exact implementation of collapsible sidebar animation and behavior
- Specific ARIA label wording for dynamic content
- Choice of which components to extend vs use as-is

### Folded Todos
[If any todos were folded into scope from the cross_reference_todos step, list them here.
Each entry should include the todo title, original problem, and how it fits this phase's scope.
If no todos were folded: omit this subsection entirely.]

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI/UX Specifications
- `.planning/01-name/01-UI-SPEC.md` — Defines the design system, spacing scale, typography, color usage, copywriting contract, and registry safety for phase 1

### Project Documentation
- `.planning/PROJECT.md` — Project vision, principles, and constraints (currently empty)
- `.planning/REQUIREMENTS.md` — Acceptance criteria and constraints (currently empty)

### Codebase References
- `app/layout.tsx` — Root layout showing providers and overall app structure
- `components/features/messaging/ChatUI.tsx` — Example component showing current usage of shadcn and custom components
- `components/features/messaging/MessageList.tsx` — Messaging component showing current implementation patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn` UI component library with `radix-nova` preset — Provides a solid foundation of accessible, customizable components
- `cn` utility from `@/lib/utils` — Helper for combining class names with Tailwind CSS
- `next/font/google` integration — Already configured for DM Sans, Inter, and Lexend fonts
- Context providers (`PresenceProvider`, `ColorProvider`, `ConvexClientProvider`) — Established pattern for app-wide state and services

### Established Patterns
- Feature-based component organization — Components grouped by feature under `components/features/`
- Layout components in `components/layout/` — Consistent approach to page-level layout structures
- Use of Tailwind CSS for styling — Utility-first approach with responsive variants
- Custom hooks pattern — Custom logic encapsulated in reusable hooks (e.g., `useMessages`, `useMessageActions`)

### Integration Points
- New components should follow the existing import patterns using `@/` aliases
- Styling should extend the existing Tailwind configuration and CSS variables
- Components should be placed under appropriate feature directories in `components/features/`
- State management should leverage existing Context providers or consider Zustand/store patterns already in use (`uiStore`)

</code_context>

<specifics>
## Specific Ideas

- Use the existing spacing scale (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px) consistently across all components
- Apply the defined typography scales (Body: 16px/400, Label: 14px/400, Heading: 20px/600, Display: 28px/600) with appropriate line heights
- Implement the color usage guidelines: Dominant (background), Secondary (cards/sidebar/nav), Accent (interactive elements), Destructive (destructive actions only)
- Follow the copywriting contract for common UI elements (CTAs, empty states, errors, confirmations)
</specifics>

<deferred>
## Deferred Ideas

[Ideas that came up but belong in other phases. Don't lose them.]

### Reviewed Todos (not folded)
[If any todos were reviewed in cross_reference_todos but not folded into scope,
list them here so future phases know they were considered.
If no reviewed-but-deferred todos: omit this subsection entirely.]

</deferred>

---

*Phase: 01-name*
*Context gathered: 2026-04-18*