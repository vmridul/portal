# UI Component Library Design Specification

**Date:** 2026-04-21
**Purpose:** Refactor chat app into reusable UI component library (shadcn-style)

---

## Overview

Extract reusable UI components from existing chat application to eliminate duplicated code, ensure consistency, and create a scalable component system.

---

## Folder Structure

```
src/components/ui/
├── button/
│   ├── index.ts          # Main Button + variants export
│   └── Button.tsx       # cva-based Button component
├── dialog/
│   ├── index.ts         # All subcomponents export
│   ├── Dialog.tsx       # Root Radix Dialog
│   ├── DialogContent.tsx
│   ├── DialogHeader.tsx
│   ├── DialogFooter.tsx
│   ├── DialogTitle.tsx
│   ├── DialogDescription.tsx
│   ├── ConfirmDialog.tsx    # Confirmation dialog (Leave, Logout pattern)
│   └── FormDialog.tsx       # Form wrapper (CreateRoom, JoinRoom pattern)
├── input/
│   ├── index.ts
│   └── Input.tsx
└── index.ts             # Barrel export
```

---

## Component Specifications

### 1. Button Component

**Location:** `src/components/ui/button/Button.tsx`

**API:**
```tsx
<Button
  variant?: "primary" | "secondary" | "destructive" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  disabled?: boolean
  className?: string
  asChild?: boolean
>
```

**Variants:**
- `primary`: Uses theme color from colorContext (`backgroundColor: color, color: textColor`)
- `secondary`: `border border-theme-border hover:bg-theme-surface text-white`
- `destructive`: `bg-[#ae4447] hover:bg-[#ae4447]/90 text-white`
- `ghost`: `hover:bg-theme-border text-white`

**Sizes:**
- `sm`: `py-1 px-4 text-sm`
- `md`: `py-2 px-6 text-base` (default)
- `lg`: `py-3 px-8 text-lg`

**Features:**
- cva-based variant system
- Loading state with "Loading..." text
- Disabled state with opacity
- Uses existing `cn()` utility

---

### 2. Dialog Components

**Location:** `src/components/ui/dialog/`

**Root Dialog (Dialog.tsx):**
- Uses `@radix-ui/react-dialog`
- Portal rendering
- Focus trap
- ESC to close
- ARIA attributes

**DialogContent:**
```tsx
<DialogContent className="w-96 rounded-xl bg-theme-surface border border-theme-border p-6 text-white">
  <DialogHeader>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogHeader>
  {children}
  <DialogFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </DialogFooter>
</DialogContent>
```

**ConfirmDialog (preset):**
```tsx
<ConfirmDialog
  open={isOpen}
  onOpenChange={setOpen}
  title="Leave Room?"
  description="You can join back anytime using the Room ID."
  confirmText="Leave"
  variant="destructive"
  onConfirm={handleLeave}
/>
```

**FormDialog (preset):**
```tsx
<FormDialog
  open={isOpen}
  onOpenChange={setOpen}
  title="Create Room"
  onSubmit={handleSubmit}
>
  <Input label="Room Name" placeholder="Enter room name" {...register("name")} />
</FormDialog>
```

---

### 3. Input Component

**Location:** `src/components/ui/input/Input.tsx`

**API:**
```tsx
<Input
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  ...htmlInputProps
/>
```

**Styling:**
- `outline-none border border-theme-border rounded-[8px] bg-theme-hover text-[#e3e3e3] py-2 px-3 w-full`
- Placeholder: `placeholder-[#c7c7c7]`
- Error state: `border-red-500`
- Label above: `text-xs text-white/60`

---

## Visual Consistency (Extracted from Existing Code)

### Modal Overlay Patterns
- Current: `fixed inset-0 bg-black bg-opacity-35 z-[9999] flex items-center justify-center`
- New: Handled by Dialog component

### Modal Container
- Current: `w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white animate-in zoom-in-95 duration-200`
- New: Handled by DialogContent

### Button Styling Captured
```tsx
// Primary (from CreateRoomModal, JoinRoomModal, AddFriendDialog)
<button style={{ backgroundColor: color, color: textColor }} className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl" />

// Secondary (from LeaveDialog, LogoutModal)
<button className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl" />

// Destructive (from LeaveDialog)
<button className="bg-[#ae4447] ease-in-out hover:bg-[#ae4447]/90 text-white py-2 px-6 rounded-xl" />
```

---

## Implementation Priority

1. **Button** - Core utility, used everywhere
2. **Input** - Used in all form modals
3. **Dialog** base - Root Radix Dialog
4. **ConfirmDialog / FormDialog** - Presets for existing patterns
5. **Refactor modals** - Convert all 8 modals to use new components

---

## Modals to Refactor

| Current Modal | New Wrapper | Status |
|--------------|------------|--------|
| CreateRoomModal | FormDialog | Refactor |
| JoinRoomModal | FormDialog | Refactor |
| LeaveDialog | ConfirmDialog | Refactor |
| RoomInfoDialog | FormDialog | Refactor |
| LogoutModal | ConfirmDialog | Refactor |
| AddFriendDialog | FormDialog | Refactor |
| CallSwitchModal | ConfirmDialog | Refactor |
| MediaDialog | Custom (keep) | Skip |

---

## Technical Notes

- **cn() utility:** Already exists at `src/lib/utils.ts`
- **Radix Dialog:** Already in dependencies (`radix-ui`)
- **cva:** Already in dependencies (`class-variance-authority`)
- **useOutsideClick:** Already exists at `src/hooks/ui/useOutsideClick.ts`

---

## Success Criteria

- [ ] All 8 UI components created
- [ ] 7 modals refactored (skip MediaDialog)
- [ ] No visual regression
- [ ] Tree-shaking supported via index exports
- [ ] Props API matches specification