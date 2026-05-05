"use client";

import Image from "next/image";

export const MentionsAutocompleteMock = ({
  className,
}: {
  className?: string;
}) => {
  const users = [
    {
      user_id: "1",
      username: "squir",
      avatar: "/assets/sq.png",
    },
    {
      user_id: "2",
      username: "charm",
      avatar: "/assets/ch.png",
    },
    {
      user_id: "3",
      username: "pika",
      avatar: "/assets/pi.png",
    },
  ];

  return (
    <div
      className={`bg-[#121214] border border-white/5 rounded-xl ${className}`}
      style={{ width: "350px" }}
    >
      {users.map((user, index) => (
        <div
          key={user.user_id}
          className={`flex items-center gap-3 px-3 py-2 transition-colors rounded-t-lg cursor-pointer ${
            index === 0 ? "bg-white/10" : ""
          }`}
        >
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={user.avatar}
              alt={user.username}
              fill
              sizes="32px"
              className="rounded-[12px] object-cover"
            />
          </div>
          <span className="text-sm text-gray-200 font-medium">
            {user.username}
          </span>
        </div>
      ))}
    </div>
  );
};
