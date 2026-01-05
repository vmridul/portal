import Image from "next/image";
import { Moon } from "lucide-react";
import { LogOut } from "lucide-react";
import { User } from "@/store/useUserStore";

export const ProfileUI = ({
  user,
  awayUsers,
  setProfileDialog,
  setLogoutDialog,
}: {
  user: User | null;
  awayUsers: Set<string>;
  setProfileDialog: (value: boolean) => void;
  setLogoutDialog: (value: boolean) => void;
}) => {
  return (
    <div
      onClick={() => setProfileDialog(true)}
      className={`flex justify-between absolute bottom-2 items-center cursor-pointer hover:bg-[#211f31] ease-in-out rounded-xl w-60 px-2 py-2`}
    >
      <div className="flex gap-4 items-center">
        <div className="relative">
          <Image
            src={user?.avatar || "/default-avatar.png"}
            alt="Avatar"
            width={40}
            height={40}
            unoptimized
            className="rounded-xl w-10 h-10 border border-[#313131]"
          />

          {user?.user_id && awayUsers.has(user?.user_id.toString()) ? (
            <Moon
              fill="yellow"
              className="absolute text-yellow-400 right-0 bottom-0 w-[12px] h-[12px] opacity-90"
            />
          ) : (
            <div className="z-[9999] absolute right-0 bottom-0 w-[10px] h-[10px] opacity-90 bg-green-500 border border-[#59ab44] rounded-full"></div>
          )}
        </div>
        <div className="flex flex-col text-sm">
          {user?.username ? `${user?.username}` : "Loading..."}
          {user?.user_id && (
            <span className="text-[#aaaaaa] font-extralight ease-in-out cursor-pointer">
              {user?.user_id.slice(0, 12)}…
            </span>
          )}
        </div>
      </div>
      <LogOut
        onClick={(e) => {
          e.stopPropagation();
          setLogoutDialog(true);
        }}
        className="w-4 h-4 mr-1 text-white hover:text-gray-200 cursor-pointer"
      />
    </div>
  );
};
