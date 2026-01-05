import Image from "next/image";
import { User as UserIcon, Moon } from "lucide-react";
import { User } from "@/store/useUserStore";

export const RoomMembersList = ({
  members,
  memberCount,
  onlineUsers,
  awayUsers,
  user,
}: {
  members: any[];
  memberCount: number;
  onlineUsers: Set<string>;
  awayUsers: Set<string>;
  user: User | null;
}) => {
  return (
    <div className="mt-3 overflow-y-scroll">
      <div className="flex items-center gap-40">
        <span className="text-xs ml-2 text-[#aaaaaa]">Members</span>
        <div className="bg-[#211f31] rounded-[8px] px-2 py-1 flex text-white/60 text-xs items-center gap-0.5">
          <UserIcon className="w-3 h-3 cursor-pointer" />
          {memberCount}
        </div>
      </div>

      <div className="mt-2">
        {members?.map((member) => {
          const isUserOnline = onlineUsers.has(member.user_id.toString());
          const isUserAway = awayUsers.has(member.user_id.toString());
          return (
            <div className="text-sm ml-2 mt-2" key={member.user_id}>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Image
                    src={
                      member?.Users?.user_id == user?.user_id
                        ? user?.avatar
                        : member?.Users?.avatar
                    }
                    alt="Avatar"
                    width={30}
                    height={30}
                    unoptimized
                    className="border w-8 h-8 border-[#313131] rounded-[10px]"
                  />
                  {isUserOnline ? (
                    <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 bg-green-500 border border-[#59ab44] rounded-full" />
                  ) : isUserAway ? (
                    <Moon
                      fill="yellow"
                      className="absolute text-yellow-400 right-0 bottom-0 w-[10px] h-[10px] opacity-90"
                    />
                  ) : (
                    <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 bg-gray-500 border border-[#858585] rounded-full" />
                  )}
                </div>
                <div className="flex flex-col">
                  {member?.Users?.user_id == user?.user_id
                    ? user?.username
                    : member?.Users?.username}
                  {member.role && (
                    <span className="text-[#aaaaaa] font-extralight">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
