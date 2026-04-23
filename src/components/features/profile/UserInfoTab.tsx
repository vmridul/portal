import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon, Moon02Icon, CopyIcon } from "@hugeicons/core-free-icons";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { formatToIST } from "@/lib/utils/date";
import { useState, useEffect, useRef } from "react";
import { useUserProfileActions } from "@/hooks";
import { usePresence } from "@/contexts/presenceContext";
import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu";

interface DeleteDialogState {
  isOpen: boolean;
  input: string;
  isDeleting: boolean;
}

const initialDeleteDialog: DeleteDialogState = {
  isOpen: false,
  input: "",
  isDeleting: false,
};

export const UserInfoTab = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const user = useUserStore((s) => s.user);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteDialogState>(initialDeleteDialog);
  const setUser = useUserStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [isUploading, setIsUploading] = useState(false);

  const {
    changeName,
    changeAvatar,
    generateUploadUrl,
    getUrl,
    deleteUserAccount,
  } = useUserProfileActions();
  const { awayUsers, setStatus } = usePresence();

  useEffect(() => {
    setNewUsername(user?.username || "");
  }, [user?.user_id]);

  const onChangeName = async () => {
    if (newUsername === user?.username) return;
    if (newUsername.length < 3 || newUsername.length > 16)
      return toast.error("Username must be between 3 and 16 characters");
    try {
      await changeName(newUsername);
      setUser({ ...user!, username: newUsername });
      toast.success("Name updated successfully");
    } catch (e) {
      toast.error((e as Error).message || "Failed to change name");
    }
  };

  const onChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      const newAvatarUrl = await getUrl(storageId);

      if (newAvatarUrl) {
        await changeAvatar(newAvatarUrl);
        setUser({ ...user!, avatar: newAvatarUrl });
        toast.success("Avatar updated successfully");
      }
    } catch (e) {
      toast.error((e as Error).message || "Failed to change avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsLogoutDialogOpen(false);
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteDialog.input !== "DELETE") return;
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
    try {
      await deleteUserAccount();
      sessionStorage.setItem("accountDeleted", "true");
      await signOut();
      router.push("/");
    } catch (e) {
      toast.error((e as Error).message || "Failed to delete account");
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const openDeleteDialog = () =>
    setDeleteDialog({ ...initialDeleteDialog, isOpen: true });
  const closeDeleteDialog = () => setDeleteDialog(initialDeleteDialog);
  const updateDeleteInput = (input: string) =>
    setDeleteDialog((prev) => ({ ...prev, input }));

  return (
    <div className="flex flex-col items-center justify-center pt-2 overflow-y-auto md:pt-10 w-[80%] md:w-[47%] mx-auto">
      <div className="flex md:items-end justify-center gap-2 md:gap-4 w-full md:flex-row flex-col items-center">
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-300 pl-1">Avatar</span>
          <div className="group relative">
            <Image
              src={user?.avatar || "/assets/defaultAvatar.png"}
              alt="Profile"
              width={120}
              height={120}
              unoptimized
              className="rounded-[12px] w-24 h-24"
            />
          </div>
          <div className="mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`mt-2 flex w-full select-none cursor-pointer relative items-center py-0 gap-1 rounded-xl text-xs`}
                >
                  {user?.user_id && awayUsers.has(user?.user_id.toString()) ? (
                    <div className="flex w-full justify-center gap-1 items-center text-yellow-400 bg-theme-border p-1 md:px-3 md:py-2 hover:bg-theme-hover rounded-[6px]">
                      <HugeiconsIcon
                        icon={Moon02Icon}
                        fill="currentColor"
                        className="w-3 h-3 text-yellow-400"
                      />
                      <span className={``}>Away</span>
                    </div>
                  ) : (
                    <div className="flex w-full justify-center gap-1 items-center text-green-500 bg-theme-border p-1 md:px-3 md:py-2 hover:bg-theme-hover rounded-[6px]">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span className={``}>Online</span>
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  sideOffset={8}
                  align="end"
                  className="w-auto min-w-[100px] bg-theme-base border border-theme-border rounded-[8px] shadow-xl z-[100] animate-in fade-in duration-100 outline-none"
                >
                  <DropdownMenuItem
                    onClick={() => setStatus("online")}
                    className="px-3 py-2 text-xs text-green-500 hover:bg-theme-border flex items-center gap-2 cursor-pointer outline-none"
                  >
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <span>Online</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatus("away")}
                    className="px-3 py-2 text-xs text-yellow-500 hover:bg-theme-border flex items-center gap-2 cursor-pointer outline-none"
                  >
                    <HugeiconsIcon
                      icon={Moon02Icon}
                      fill="currentColor"
                      className="w-3 h-3 text-yellow-400"
                    />
                    <span>Away</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:items-start w-full">
          <Button
            variant="other"
            size="iconLg"
            onClick={() => !isUploading && fileRef?.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HugeiconsIcon icon={Upload01Icon} className="w-5 h-5" />
            )}
          </Button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onChangeAvatar}
          />
          <div className="flex flex-col gap-1 w-full">
            <span className="text-xs text-gray-300">Username</span>
            <div className="flex gap-2">
              <Input
                className="md:w-[270px] w-full"
                type="text"
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                minLength={3}
                maxLength={16}
                value={newUsername || ""}
              />
              <Button
                disabled={newUsername === user?.username}
                onClick={onChangeName}
                variant="primary"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 w-full mt-5">
        <span className="text-xs text-gray-300">User ID</span>
        <div className="flex gap-2 w-full">
          <Input className="flex-1" value={user?.user_id} disabled />
          <Button
            variant="other"
            size="sm"
            onClick={() => {
              if (!user?.user_id) return;
              toast.success("User ID copied to clipboard");
              navigator.clipboard.writeText(user?.user_id || "");
            }}
          >
            <HugeiconsIcon icon={CopyIcon} className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1 mt-5">
        <span className="text-xs text-gray-300">Email</span>
        <Input value={user?.email || ""} disabled />
      </div>
      <div className="w-full flex flex-col gap-1 mt-5">
        <span className="text-xs text-gray-300">Joined On</span>
        <Input value={formatToIST(user?._creationTime)} disabled />
      </div>

      <div className="flex md:flex-row flex-col gap-2 md:gap-3 items-center w-full mt-5">
        <Button
          variant="destructive"
          onClick={openDeleteDialog}
          className="w-full"
        >
          Delete Account
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsLogoutDialogOpen(true)}
          className="w-full"
        >
          Logout
        </Button>
      </div>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Log Out"
        description="Are you sure you want to log out? You can sign in back anytime."
        confirmText="Log Out"
        onConfirm={handleLogout}
      />

      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && closeDeleteDialog()}
      >
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="text-[#a0a0a0] text-sm">
            This will permanently delete your account and remove you from all
            rooms. Your messages will remain but will show as from a deleted
            user.
          </div>
          <div className="mt-4">
            <label className="text-xs text-gray-400">
              Type <span className="text-red-400">DELETE</span> to confirm
            </label>
            <Input
              value={deleteDialog.input}
              onChange={(e) => updateDeleteInput(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                deleteDialog.input !== "DELETE" || deleteDialog.isDeleting
              }
            >
              {deleteDialog.isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
