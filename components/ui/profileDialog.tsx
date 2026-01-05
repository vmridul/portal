import Image from "next/image";
import { Moon, X, Circle, Pencil, Copy } from "lucide-react";
import { User } from "@/store/useUserStore";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { formatToIST } from "@/app/actions/formatToIST";
import { Skeleton } from "./skeleton";
import { useState, useEffect, useRef } from "react";
import { handleChangeName } from "@/app/actions/changeName";
import { handleChangeAvatar } from "@/app/actions/changeAvatar";

export const ProfileDialog = ({
  user,
  setProfileDialog,
  awayUsers,
  setStatus,
}: {
  user: User | null;
  setProfileDialog: (value: boolean) => void;
  awayUsers: Set<string>;
  setStatus: (value: string) => void;
}) => {
  const [presenceMenu, setPresenceMenu] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newUsername, setNewUsername] = useState(user?.username || "");

  useEffect(() => {
    setNewUsername(user?.username || "");
  }, [user?.user_id]);

  useEffect(() => {
    const closeDialogs = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setProfileDialog(false);
    };
    window.addEventListener("keydown", closeDialogs);
    return () => {
      window.removeEventListener("keydown", closeDialogs);
    };
  }, []);

  if (!user) return <Skeleton className="w-[500px] h-[380px]" />;
  return (
    <div
      onClick={() => setPresenceMenu(false)}
      className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
    >
      <div className="md:scale-100 scale-[80%] w-[500px] rounded-xl text-lg font-regular bg-[#05070d] border-[#313131] border p-6 text-white">
        <div className="flex justify-between items-center">
          <span>User Profile</span>
          <X
            className="w-5 h-5 cursor-pointer text-white opacity-50 hover:opacity-70 transition-all duration-300"
            onClick={() => {
              setNewUsername(user?.username || "");
              setProfileDialog(false);
            }}
          />
        </div>
        <div className=" mt-3 flex flex-col gap-3 text-sm">
          <div className="flex gap-4 items-center">
            <div className="cursor-pointer group relative ">
              <Image
                src={user?.avatar || "/assets/default-avatar.png"}
                alt="Profile"
                width={60}
                height={60}
                unoptimized
                className="rounded-[12px] w-[60px] h-[60px] border border-[#313131]"
              />
              <div
                onClick={() => fileRef?.current?.click()}
                className="flex items-center justify-center opacity-0 rounded-[12px] w-[60px] h-[60px] group-hover:opacity-70 transition-all duration-300 absolute inset-0 bg-white/50"
              >
                <Pencil className="w-5 h-5 cursor-pointer text-black transition-all duration-300" />
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) =>
                  handleChangeAvatar(e.target.files?.[0] || null, user, setUser)
                }
              />
            </div>

            <div className="flex md:flex-row gap-0 flex-col flex-1 items-center md:gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex justify-between gap-4 items-center ">
                  <span className="text-xs text-white/60">Username</span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setPresenceMenu(true);
                    }}
                    className={`flex select-none cursor-pointer relative items-center py-0 gap-1 rounded-xl text-xs`}
                  >
                    {user?.user_id &&
                      awayUsers.has(user?.user_id.toString()) ? (
                      <div className="flex gap-1 items-center text-yellow-400 bg-[#3b3a12] border px-3 rounded-full border-yellow-600 border-opacity-30">
                        <Moon fill="yellow" className="w-3 h-3 border-none" />
                        <span className={``}>Away</span>
                      </div>
                    ) : (
                      <div className="flex gap-1 items-center text-green-400 bg-[#1b3b12] border px-3 rounded-full border-green-900">
                        <Circle fill="green" className="w-3 h-3 border-none" />
                        <span className={``}>Online</span>
                      </div>
                    )}
                    {presenceMenu && (
                      <div className="absolute cursor-pointer -right-[130%] -top-[20%] z-10 bg-[#0d1722] text-xs text-white rounded-xl shadow-lg">
                        <ul className="py-0">
                          <li
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatus("online");
                              setPresenceMenu(false);
                            }}
                            className="px-4 py-2 flex items-center hover:bg-[#2a3826] rounded-[20px] gap-2 text-green-400"
                          >
                            <Circle
                              fill="green"
                              className="w-3 h-3 text-green-500 border-none"
                            />
                            <span className="">Online</span>
                          </li>
                          <li
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatus("away");
                              setPresenceMenu(false);
                            }}
                            className="px-4 py-2 flex items-center hover:bg-[#383726] rounded-[20px] gap-2 text-yellow-400"
                          >
                            <Moon
                              fill="yellow"
                              className="w-3 h-3 border-none"
                            />
                            <span>Away</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
                  type="text"
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username"
                  minLength={3}
                  maxLength={16}
                  value={newUsername || ""}
                />
              </div>
              <button
                disabled={newUsername === user?.username}
                onClick={() =>
                  handleChangeName({
                    user,
                    newUsername,
                    setUser,
                    setNewUsername,
                  })
                }
                className="bg-white disabled:opacity-50 mt-6 ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-2 md:px-4 rounded-[6px]"
              >
                Change Name
              </button>
            </div>
          </div>
          <div className="relative flex flex-col gap-2">
            <span className="text-xs text-white/60">User ID</span>
            <div className="relative flex justify-between items-center">
              <input
                className="outline-none truncate
    overflow-hidden
    whitespace-nowrap
    text-ellipsis
     border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
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
                className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-[8px] hover:bg-[#313131]"
              >
                <Copy className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Joined On</span>
            <input
              className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
              type="text"
              disabled
              value={formatToIST(user?.created_at)}
              placeholder="Joined On"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
