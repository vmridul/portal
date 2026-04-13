import { Upload, Moon, Circle, Copy, LogOut, Camera } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { formatToIST } from "@/lib/utils/date";
import { Skeleton } from "./skeleton";
import { useState, useEffect, useRef } from "react";
import { useUserProfileActions } from "@/src/hooks";
import { useColor } from "@/contexts/colorContext";
import { usePresence } from "@/contexts/presenceContext";

export const UserInfoTab = () => {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [presenceMenu, setPresenceMenu] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [isUploading, setIsUploading] = useState(false);
  const { color, textColor } = useColor();

  const { changeName, changeAvatar, generateUploadUrl, getUrl } = useUserProfileActions();
  const { awayUsers, setStatus } = usePresence();

  useEffect(() => {
    setNewUsername(user?.username || "");
  }, [user?.user_id]);

  const onChangeName = async () => {
    if (!newUsername || newUsername === user?.username) return;
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

  return (
    <div className="flex flex-col items-center justify-center pt-2 overflow-y-auto md:pt-10 w-[80%] md:w-[47%] mx-auto">
      <div className="flex md:items-end justify-center gap-2 md:gap-4 w-full md:flex-row flex-col items-center">
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-300 pl-1">Avatar</span>
          <div className="group relative">
            <Image
              src={user?.avatar || "/assets/default-avatar.png"}
              alt="Profile"
              width={120}
              height={120}
              unoptimized
              className="rounded-[12px] w-24 h-24 border border-theme-border"
            />
          </div>
          <div className="mt-2">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setPresenceMenu(true);
              }}
              className={`mt-2 flex w-full select-none cursor-pointer relative items-center py-0 gap-1 rounded-xl text-xs`}
            >
              {user?.user_id && awayUsers.has(user?.user_id.toString()) ? (
                <div className="flex w-full justify-center gap-1 items-center text-yellow-400 bg-theme-border p-1 md:px-3 md:py-2 hover:bg-theme-hover rounded-[6px]">
                  <Moon fill="yellow" className="w-3 h-3 text-yellow-200" />
                  <span className={``}>Away</span>
                </div>
              ) : (
                <div className="flex w-full justify-center gap-1 items-center text-green-500 bg-theme-border p-1 md:px-3 md:py-2 hover:bg-theme-hover rounded-[6px]">
                  <Circle fill="green" className="w-3 h-3 text-green-700" />
                  <span className={``}>Online</span>
                </div>
              )}
              {presenceMenu && (
                <div className="absolute w-[105px] border border-theme-border cursor-pointer md:-right-[108px] md:-top-[4px] top-7 z-10 bg-theme-base text-xs text-white rounded-[10px] shadow-md shadow-theme-base">
                  <ul className="py-0">
                    <li
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatus("online");
                        setPresenceMenu(false);
                      }}
                      className="px-4 py-2 flex items-center hover:bg-theme-border rounded-[10px] gap-2 text-green-500"
                    >
                      <Circle fill="green" className="w-3 h-3 text-green-700 border-none" />
                      <span className="">Online</span>
                    </li>
                    <li
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatus("away");
                        setPresenceMenu(false);
                      }}
                      className="px-4 py-2 flex items-center hover:bg-theme-border rounded-[10px] gap-2 text-yellow-400"
                    >
                      <Moon fill="yellow" className="w-3 h-3 border-none text-yellow-200" />
                      <span>Away</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:items-start w-full">
          <button
            onClick={() => !isUploading && fileRef?.current?.click()}
            disabled={isUploading}
            className={`gap-2 relative select-none md:px-5 px-10 py-5 text-sm cursor-pointer rounded-xl flex items-center justify-center bg-theme-border hover:bg-theme-hover disabled:opacity-50`}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </button>
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
              <input
                className="md:w-[270px] w-[100%] outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3"
                type="text"
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                minLength={3}
                maxLength={16}
                value={newUsername || ""}
              />
              <button
                disabled={newUsername === user?.username}
                onClick={onChangeName}
                style={{ backgroundColor: color, color: textColor }}
                className="disabled:opacity-50 ease-in-out hover:brightness-110 py-2 px-3 md:px-4 text-sm rounded-[6px]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 w-full mt-5">
        <span className="text-xs text-gray-300">User ID</span>
        <div className="relative border-theme-border bg-opacity-70 border-opacity-70 rounded-[8px] text-[#e3e3e3] bg-theme-hover py-1 px-3 w-full border flex justify-between items-center">
          <input
            className="outline-none truncate overflow-hidden w-full whitespace-nowrap text-ellipsis bg-transparent text-gray-300 text-sm placeholder-[#c7c7c7]"
            type="text"
            disabled
            value={user?.user_id}
            placeholder="User ID"
          />
          <div
            onClick={() => {
              if (!user?.user_id) return;
              toast.success("User ID copied to clipboard");
              navigator.clipboard.writeText(user?.user_id || "");
            }}
            className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-[8px] hover:bg-theme-base"
          >
            <Copy className="w-4 h-4 text-gray-300" />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1 mt-5">
        <span className="text-xs text-gray-300">Email</span>
        <input
          className="outline-none text-sm border text-gray-300 bg-theme-hover placeholder-[#c7c7c7] border-theme-border rounded-[8px] py-2 px-3 w-full"
          type="text"
          disabled
          value={user?.email || ""}
          placeholder="Email"
        />
      </div>
      <div className="w-full flex flex-col gap-1 mt-5">
        <span className="text-xs text-gray-300">Joined On</span>
        <input
          className="outline-none text-sm border text-gray-300 bg-theme-hover placeholder-[#c7c7c7] border-theme-border rounded-[8px] py-2 px-3 w-full"
          type="text"
          disabled
          value={formatToIST(user?._creationTime)}
          placeholder="Joined On"
        />
      </div>

      <div className="flex md:flex-row flex-col gap-2 md:gap-3 items-center w-full mt-5">
        <button className="ease-in-out bg-red-800 w-full hover:text-gray-200 py-2 px-2 md:px-4 text-sm rounded-[6px]">
          Delete Account
        </button>
        <button
          onClick={() => setLogoutConfirm(true)}
          className="ease-in-out py-2 px-2 bg-theme-border md:px-4 w-full hover:text-gray-200 text-sm rounded-[6px]"
        >
          Logout
        </button>
      </div>

      {logoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-35 z-[9999] flex items-center justify-center">
          <div className="w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white">
            Are you sure you want to log out?
            <div className="text-[#676767] mt-2 text-sm">
              You can sign in back anytime.
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const auth = getAuth();
                  await signOut(auth);
                  setLogoutConfirm(false);
                  router.push("/");
                }}
                style={{ backgroundColor: color, color: textColor }}
                className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};