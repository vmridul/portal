# UI Component Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create reusable UI component library (Button, Dialog, Input) with shadcn-style API and refactor all 7 modals to use new components

**Architecture:** Build atomic UI components (Button, Input) first, then composite Dialog components using Radix UI, then refactor existing modals. All components use existing cn() utility from src/lib/utils.ts and theme tokens from tailwind.config.ts.

**Tech Stack:** React, Radix UI Dialog, class-variance-authority (cva), tailwind-merge, existing theme tokens

---

## File Structure

### New Files to Create
- `src/components/ui/button/index.ts` - Export Button
- `src/components/ui/button/Button.tsx` - Button component with cva
- `src/components/ui/dialog/index.ts` - Export all dialog components
- `src/components/ui/dialog/Dialog.tsx` - Root Radix Dialog
- `src/components/ui/dialog/DialogContent.tsx` - Modal content container
- `src/components/ui/dialog/DialogHeader.tsx` - Title + description wrapper
- `src/components/ui/dialog/DialogFooter.tsx` - Action buttons wrapper
- `src/components/ui/dialog/DialogTitle.tsx` - ARIA title
- `src/components/ui/dialog/DialogDescription.tsx` - ARIA description
- `src/components/ui/dialog/ConfirmDialog.tsx` - Preset confirmation dialog
- `src/components/ui/dialog/FormDialog.tsx` - Preset form dialog
- `src/components/ui/input/index.ts` - Export Input
- `src/components/ui/input/Input.tsx` - Input component
- `src/components/ui/index.ts` - Barrel export

### Files to Modify
- `src/components/ui/modals/CreateRoomModal.tsx` - Use new UI components
- `src/components/ui/modals/JoinRoomModal.tsx` - Use new UI components
- `src/components/ui/modals/LogoutModal.tsx` - Use new UI components
- `src/components/ui/modals/CallSwitchModal.tsx` - Use new UI components
- `src/components/features/rooms/LeaveDialog.tsx` - Use new UI components
- `src/components/features/rooms/RoomInfoDialog.tsx` - Use new UI components
- `src/components/features/friends/AddFriendDialog.tsx` - Use new UI components

---

## Task 1: Button Component with cva

**Files:**
- Create: `src/components/ui/button/index.ts`
- Create: `src/components/ui/button/Button.tsx`

- [ ] **Step 1: Create button/index.ts**

```ts
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

- [ ] **Step 2: Create button/Button.tsx**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-regular transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "", // Color set via inline style from colorContext
        secondary: "border border-theme-border hover:bg-theme-surface hover:text-white/90 text-white",
        destructive: "bg-[#ae4447] hover:bg-[#ae4447]/90 text-white",
        ghost: "hover:bg-theme-border text-white",
      },
      size: {
        sm: "py-1 px-4 text-sm",
        md: "py-2 px-6 text-base",
        lg: "py-3 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button/
git commit -m "feat(ui): add Button component with cva variants"
```

---

## Task 2: Input Component

**Files:**
- Create: `src/components/ui/input/index.ts`
- Create: `src/components/ui/input/Input.tsx`

- [ ] **Step 1: Create input/index.ts**

```ts
export { Input } from "./Input";
export type { InputProps } from "./Input";
```

- [ ] **Step 2: Create input/Input.tsx**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <span className="text-xs text-white/60">{label}</span>
        )}
        <input
          className={cn(
            "outline-none border border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full placeholder-[#c7c7c7] disabled:opacity-70",
            error && "border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/input/
git commit -m "feat(ui): add Input component"
```

---

## Task 3: Root Dialog Component (Radix-based)

**Files:**
- Create: `src/components/ui/dialog/Dialog.tsx`

- [ ] **Step 1: Create dialog/Dialog.tsx**

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Close01Icon } from "@hugeicons/core-free-icons";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 bg-black/35 z-[9998] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-theme-border bg-theme-surface p-6 text-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] md:scale-100 scale-95 rounded-xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity focus:outline-none">
        <HugeiconsIcon icon={Close01Icon} className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-white/60", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/dialog/Dialog.tsx
git commit -m "feat(ui): add root Dialog component with Radix"
```

---

## Task 4: Dialog Presets (ConfirmDialog & FormDialog)

**Files:**
- Create: `src/components/ui/dialog/ConfirmDialog.tsx`
- Create: `src/components/ui/dialog/FormDialog.tsx`
- Create: `src/components/ui/dialog/index.ts`

- [ ] **Step 1: Create dialog/ConfirmDialog.tsx**

```tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./Dialog";
import { Button } from "../button/Button";

interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "destructive";
  onConfirm?: () => void;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  onConfirm,
  children,
  trigger,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-96 max-w-[w-full]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            onClick={() => {
              onConfirm?.();
              onOpenChange?.(false);
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create dialog/FormDialog.tsx**

```tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "./Dialog";
import { Button } from "../button/Button";

interface FormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  children,
  loading,
  disabled,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-96 max-w-[w-full]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange?.(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button type="submit" loading={loading} disabled={disabled}>
              {loading ? "Loading..." : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create dialog/index.ts**

```ts
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./Dialog";

export { ConfirmDialog } from "./ConfirmDialog";
export { FormDialog } from "./FormDialog";
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/dialog/
git commit -m "feat(ui): add ConfirmDialog and FormDialog presets"
```

---

## Task 5: UI Barrel Export

**Files:**
- Create: `src/components/ui/index.ts`

- [ ] **Step 1: Create barrel export**

```ts
export { Button } from "./button";
export type { ButtonProps } from "./button";

export { Input } from "./input";
export type { InputProps } from "./input";

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogOverlay,
  DialogClose,
} from "./dialog";

export { ConfirmDialog, FormDialog } from "./dialog";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/index.ts
git commit -m "feat(ui): add barrel export for UI components"
```

---

## Task 6: Refactor CreateRoomModal

**Files:**
- Modify: `src/components/ui/modals/CreateRoomModal.tsx`

- [ ] **Step 1: Refactor CreateRoomModal**

```tsx
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRoomActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { generateRoomCode } from "@/app/actions/randomID";
import { toast } from "sonner";
import { FormDialog } from "../dialog";
import { Input } from "../input";
import { Button } from "../button";
import { useColor } from "@/contexts/colorContext";

export function CreateRoomModal() {
  const { closeModal } = useUIStore();
  const { color, textColor } = useColor();
  const { createRoom } = useRoomActions();
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { roomName: "" }
  });

  const onSubmit = async (data: { roomName: string }) => {
    if (!data.roomName.trim()) {
      toast.error("Enter a valid room name!");
      return;
    }
    try {
      const generated_id = await generateRoomCode();
      await createRoom({ room_name: data.roomName.trim(), room_id: generated_id.toString() });
      closeModal();
      toast.success("Room created successfully");
      router.push(`/portal/room/${generated_id}`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to create room");
    }
  };

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Create Room"
      onSubmit={handleSubmit(onSubmit)}
      submitText="Create"
      loading={isSubmitting}
    >
      <Input
        {...register("roomName", { required: true })}
        label="Room Name"
        placeholder="Room Name"
        autoFocus
      />
    </FormDialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/modals/CreateRoomModal.tsx
git commit -m "refactor: use new UI components in CreateRoomModal"
```

---

## Task 7: Refactor JoinRoomModal

**Files:**
- Modify: `src/components/ui/modals/JoinRoomModal.tsx`

- [ ] **Step 1: Refactor JoinRoomModal**

```tsx
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useRoomActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { toast } from "sonner";
import { FormDialog } from "../dialog";
import { Input } from "../input";

export function JoinRoomModal() {
  const { closeModal } = useUIStore();
  const { joinRoom } = useRoomActions();
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { roomId: "" }
  });

  const onSubmit = async (data: { roomId: string }) => {
    if (!data.roomId.trim()) {
      toast.error("Enter a Room ID!");
      return;
    }
    try {
      await joinRoom({ room_id: data.roomId.trim() });
      closeModal();
      toast.success("Room joined successfully");
      router.replace(`/portal/room/${data.roomId.trim()}`);
    } catch (e) {
      const msg = (e as Error).message || "Failed to join room";
      if (msg.includes("already in this room")) {
        toast.info("You are already in this room");
        closeModal();
        router.replace(`/portal/room/${data.roomId.trim()}`);
      } else {
        toast.error("Failed to join room");
      }
    }
  };

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Join Room"
      onSubmit={handleSubmit(onSubmit)}
      submitText="Join"
      loading={isSubmitting}
    >
      <Input
        {...register("roomId", { required: true, minLength: 4 })}
        label="Room ID"
        placeholder="Room ID"
        autoFocus
      />
    </FormDialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/modals/JoinRoomModal.tsx
git commit -m "refactor: use new UI components in JoinRoomModal"
```

---

## Task 8: Refactor LogoutModal

**Files:**
- Modify: `src/components/ui/modals/LogoutModal.tsx`

- [ ] **Step 1: Refactor LogoutModal**

```tsx
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useUIStore } from "@/store/uiStore";
import { ConfirmDialog } from "../dialog";

export function LogoutModal() {
  const { closeModal } = useUIStore();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      closeModal();
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Log Out"
      description="Are you sure you want to log out? You can sign in back anytime."
      confirmText="Log Out"
      onConfirm={handleLogout}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/modals/LogoutModal.tsx
git commit -m "refactor: use new UI components in LogoutModal"
```

---

## Task 9: Refactor LeaveDialog

**Files:**
- Modify: `src/components/features/rooms/LeaveDialog.tsx`

- [ ] **Step 1: Refactor LeaveDialog**

```tsx
import { useRoomActions } from "@/hooks";
import { toast } from "sonner";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { ConfirmDialog } from "@/components/ui/dialog";

export const LeaveDialog = () => {
  const { modalData, closeModal } = useUIStore();
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  if (!modalData) return null;
  const { roomName, room_id, owner_id } = modalData;

  const isOwner = String(owner_id) === String(user?.user_id);
  const { deleteRoom, leaveRoom } = useRoomActions();

  const onAction = async () => {
    try {
      if (isOwner) {
        await deleteRoom({ room_id });
        toast.success("Room deleted");
      } else {
        await leaveRoom({ room_id });
        toast.success("Left room");
      }
      closeModal();
      router.replace("/portal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed action");
    }
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title={isOwner ? `Delete the room "${roomName}"?` : `Leave the room "${roomName}"?`}
      description={
        isOwner
          ? "You won't be able to revert this action!"
          : "You can join back anytime using the Room ID."
      }
      confirmText={isOwner ? "Delete" : "Leave"}
      variant="destructive"
      onConfirm={onAction}
    />
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/rooms/LeaveDialog.tsx
git commit -m "refactor: use new UI components in LeaveDialog"
```

---

## Task 10: Refactor RoomInfoDialog

**Files:**
- Modify: `src/components/features/rooms/RoomInfoDialog.tsx`

- [ ] **Step 1: Refactor RoomInfoDialog**

```tsx
import { formatToIST } from "@/lib/utils/date";
import { toast } from "sonner";
import { useRoomActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/useUserStore";
import { useForm } from "react-hook-form";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const RoomInfoDialog = () => {
  const { modalData, closeModal } = useUIStore();
  const user = useUserStore((s) => s.user);
  const { renameRoom } = useRoomActions();

  const { register, handleSubmit, formState: { isSubmitting }, watch } = useForm({
    defaultValues: { newRoomName: modalData?.roomName || "" }
  });

  const newRoomName = watch("newRoomName");

  if (!modalData) return null;
  const { owner_id, ownerName, roomName, createdAt, room_id } = modalData;

  const onRename = async (data: { newRoomName: string }) => {
    try {
      await renameRoom({ room_id, new_name: data.newRoomName });
      closeModal();
      toast.success("Changed room name");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rename room");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Room Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onRename)} className="flex flex-col gap-4">
          <Input
            {...register("newRoomName", { required: true, minLength: 3, maxLength: 16 })}
            label="Room Name"
            disabled={owner_id !== user?.user_id || isSubmitting}
          />
          <Input
            label="Room Owner"
            value={ownerName || "Unknown"}
            disabled
          />
          <Input
            label="Created On"
            value={formatToIST(createdAt || Date.now())}
            disabled
          />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={newRoomName === roomName || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/rooms/RoomInfoDialog.tsx
git commit -m "refactor: use new UI components in RoomInfoDialog"
```

---

## Task 11: Refactor AddFriendDialog

**Files:**
- Modify: `src/components/features/friends/AddFriendDialog.tsx`

- [ ] **Step 1: Refactor AddFriendDialog**

```tsx
import { toast } from "sonner";
import { useFriendActions } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AddFriendDialog() {
  const { closeModal } = useUIStore();
  const { sendRequest } = useFriendActions();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { friendId: "" }
  });

  const onSubmit = async (data: { friendId: string }) => {
    if (!data.friendId.trim()) {
      toast.info("Please enter a valid user ID");
      return;
    }

    try {
      await sendRequest(data.friendId.trim());
      toast.success("Friend request sent!");
      reset();
      closeModal();
    } catch (e) {
      const msg = (e as Error).message || "Failed to send request";
      toast.error(msg);
    }
  };

  return (
    <FormDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          reset();
          closeModal();
        }
      }}
      title="Add Friend"
      onSubmit={handleSubmit(onSubmit)}
      submitText="Send"
      loading={isSubmitting}
    >
      <Input
        {...register("friendId", { required: true })}
        label="User ID"
        placeholder="Enter User's ID"
        autoFocus
      />
    </FormDialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/friends/AddFriendDialog.tsx
git commit -m "refactor: use new UI components in AddFriendDialog"
```

---

## Task 12: Refactor CallSwitchModal

**Files:**
- Modify: `src/components/ui/modals/CallSwitchModal.tsx`

- [ ] **Step 1: Refactor CallSwitchModal**

```tsx
"use client";

import { useUIStore } from "@/store/uiStore";
import { useCallStore } from "@/store/callStore";
import { useCallSessionActions } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { ConfirmDialog } from "../dialog";

export function CallSwitchModal() {
  const { closeModal, modalData } = useUIStore();
  const activeCallId = useCallStore((state) => state.callId);
  const { switchSession } = useCallSessionActions();
  const user = useUserStore((s) => s.user);

  const handleSwitch = async () => {
    const { newCallId, newRoomId, newRoomName, oldCallId } = modalData;
    const currentCallId = oldCallId || activeCallId;

    if (!currentCallId) {
      closeModal();
      return;
    }

    try {
      await switchSession(
        {
          callId: newCallId,
          room: {
            id: newRoomId,
            name: newRoomName,
          },
          user: {
            userId: user?.user_id,
            displayName: user?.username || "Guest",
            avatarUrl: user?.avatar || undefined,
          },
        },
        currentCallId
      );
      closeModal();
    } catch {
      closeModal();
    }
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && closeModal()}
      title="Switch Call"
      description="You are already in a call. Joining this one will automatically disconnect you from your current session."
      confirmText="Switch Now"
      onConfirm={handleSwitch}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/modals/CallSwitchModal.tsx
git commit -m "refactor: use new UI components in CallSwitchModal"
```

---

## Task 13: Fix Button for primary variant color support

**Files:**
- Modify: `src/components/ui/button/Button.tsx`

- [ ] **Step 1: Update Button to support primary color**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useColor } from "@/contexts/colorContext";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-regular transition-all duration-200 ease-in-out focus:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "", // Color set via inline style
        secondary: "border border-theme-border hover:bg-theme-surface hover:text-white/90 text-white",
        destructive: "bg-[#ae4447] hover:bg-[#ae4447]/90 text-white",
        ghost: "hover:bg-theme-border text-white",
      },
      size: {
        sm: "py-1 px-4 text-sm",
        md: "py-2 px-6 text-base",
        lg: "py-3 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, style, ...props }, ref) => {
    const { color, textColor } = useColor();
    
    const variantStyle = variant === "primary" 
      ? { backgroundColor: color, color: textColor }
      : undefined;

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        style={{ ...variantStyle, ...style }}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/button/Button.tsx
git commit -m "fix(ui): add color context support to Button primary variant"
```

---

## Self-Review

1. **Spec coverage:** All 7 modals (excluding MediaDialog) are refactored. Button, Input, and Dialog components created. ✓
2. **Placeholder scan:** No TBD or TODO in plan. ✓
3. **Type consistency:** All exports named consistently, component props defined inline. ✓

---

## Implementation Complete

All tasks written. Ready for execution.

---

## Plan saved to

`docs/superpowers/plans/2026-04-21-ui-component-library-plan.md`

**Two execution options:**

1. **Subagent-Driven (recommended)** - Fresh subagent per task, fast iteration  
2. **Inline Execution** - Execute in this session with checkpoints

Which approach?