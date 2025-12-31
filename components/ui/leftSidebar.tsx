"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import {
  LogOut,
  User,
  UserPlus,
  Plus,
  House,
  Menu,
  ArrowDown,
  ArrowRight,
  Circle,
  Moon,
  X,
  Copy,
  Pencil,
  HouseIcon,
} from "lucide-react";
import { generateRoomCode } from "@/app/actions/randomID";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useRooms } from "@/contexts/roomContext";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { useColor } from "@/contexts/colorContext";
import { formatToIST } from "@/app/actions/formatToIST";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import { usePresence } from "@/contexts/presenceContext";

type LeftSidebarProps = {
  className?: string;
};

export default function LeftSidebar({ className = "" }: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinParam = searchParams.get("join");
  const [roomName, setRoomName] = useState("");
  const [createDialog, setCreateDialog] = useState(false);
  const [joinDialog, setJoinDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [room_id, setRoomId] = useState<number | null>(null);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const { rooms, membersCount } = useRooms();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const color = useColor().color;
  const [profileDialog, setProfileDialog] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [presenceMenu, setPresenceMenu] = useState(false);
  const { setStatus } = useGlobalPresence();
  const { onlineUsers, awayUsers } = usePresence();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChangeAvatar = async (file: File | null) => {
    if (!user) return;
    if (!file) return;
    const uploadFile = async (file: File) => {
      const filePath = `${crypto.randomUUID()}-${file.name}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (error) throw error;

      return filePath;
    };
    const getPublicUrl = (path: string) => {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);

      return data.publicUrl;
    };
    const filePath = await uploadFile(file);
    const publicUrl = getPublicUrl(filePath);
    const { data, error } = await supabase
      .from("Users")
      .update({
        avatar: publicUrl,
      })
      .eq("user_id", user?.user_id);

    if (error) throw error;
    setUser({ ...user, avatar: publicUrl });
    toast.success("Avatar updated successfully");
  };

  useEffect(() => {
    const match = pathname.match(/\/home\/room\/(\d+)/);
    if (match) {
      setCurrentRoom(Number(match[1]));
    } else {
      setCurrentRoom(null);
    }
  }, [pathname]);

  useEffect(() => {
    setNewUsername(user?.username || "");
  }, [user]);

  useEffect(() => {
    const close = () => {
      if (presenceMenu) setPresenceMenu(false);
    };
    const closeDialogs = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setCreateDialog(false);
      setJoinDialog(false);
      setLogoutDialog(false);
      setProfileDialog(false);
    };
    window.addEventListener("keydown", closeDialogs);
    window.addEventListener("click", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", closeDialogs);
    };
  }, [presenceMenu]);

  //OPEN JOIN DIALOG WHEN PATHNAME HAVE SEARCHPARAMS: JOIN
  useEffect(() => {
    if (joinParam) {
      setRoomId(Number(joinParam));
      setJoinDialog(true);
    }
  }, [joinParam]);

  const handleChangeName = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("Users")
      .update({
        username: newUsername,
      })
      .eq("user_id", user?.user_id);
    if (error) throw error;
    setUser({ ...user, username: newUsername });
    setNewUsername(user?.username || "");
    toast.success("Username updated successfully");
  };

  useEffect(() => {
    if (pathname.length > 6) {
      setCurrentRoom(parseInt(pathname.slice(-4)));
    }
  }, []);

  //JOIN ROOM
  const handleJoin = async () => {
    if (!room_id) {
      toast.error("Enter a Room ID!");
      return;
    }
    if (room_id < 1000 || room_id > 9999) {
      toast.error("Invalid Room ID!");
      return;
    }
    const { data: roomExist, error: roomExistError } = await supabase
      .from("Rooms")
      .select("room_id")
      .eq("room_id", room_id);

    if (roomExistError) throw roomExistError;
    if (roomExist.length === 0) {
      toast.error("Room does not exist");
      return;
    }
    const { data, error: checkError } = await supabase
      .from("RoomMembers")
      .select("user_id")
      .eq("room_id", room_id)
      .eq("user_id", user?.user_id)
      .maybeSingle();
    if (checkError) throw checkError;
    if (data) {
      toast.error("You are already in this room");
      return;
    }

    const { error: memberError } = await supabase.from("RoomMembers").insert({
      room_id: room_id,
      role: "member",
    });
    if (memberError) throw memberError;
    await supabase.from("Messages").insert({
      room_id,
      sender_id: user?.user_id,
      type: "join",
      content: "joined the room",
    });
    setJoinDialog(false);
    setRoomId(room_id);
    toast.success("Room joined successfully");
    setMobileMenu(false);
    router.push(`/home/room/${room_id}`);
  };

  //CREATE ROOM
  const handleCreate = async () => {
    if (!roomName) {
      toast.error("Enter a valid room name!");
      return;
    }
    try {
      const room_id = await generateRoomCode();
      const { data, error } = await supabase
        .from("Rooms")
        .insert([
          {
            room_name: roomName,
            room_id: room_id,
            is_group: true,
          },
        ])
        .select()
        .single();

      const { error: memberError } = await supabase.from("RoomMembers").insert({
        room_id: room_id,
        user_id: user?.user_id,
        role: "owner",
      });

      if (error) {
        console.error(error);
      }
      if (memberError) throw memberError;
      setCreateDialog(false);
      setRoomName("");
      toast.success("Room created successfully");
      setMobileMenu(false);
      router.push(`/home/room/${room_id}`);
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  //SIGN OUT
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {profileDialog && (
        <div
          className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
        >
          <div className="md:scale-100 scale-[80%] w-[500px] rounded-xl text-lg font-regular bg-[#080f17] border-[#313131] border p-6 text-white">
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
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center opacity-0 rounded-[12px] w-[60px] h-[60px] group-hover:opacity-70 transition-all duration-300 absolute inset-0 bg-white/50"
                  >
                    <Pencil className="w-5 h-5 cursor-pointer text-black transition-all duration-300" />
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleChangeAvatar(e.target.files?.[0] || null)
                    }
                  />
                </div>

                <div className="flex flex-1 items-center gap-3">
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
                            <Moon
                              fill="yellow"
                              className="w-3 h-3 border-none"
                            />
                            <span className={``}>Away</span>
                          </div>
                        ) : (
                          <div className="flex gap-1 items-center text-green-400 bg-[#1b3b12] border px-3 rounded-full border-green-900">
                            <Circle
                              fill="green"
                              className="w-3 h-3 border-none"
                            />
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
                    onClick={handleChangeName}
                    className="bg-white disabled:opacity-50 mt-6 ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-4 rounded-[6px]"
                  >
                    Change Name
                  </button>
                </div>
              </div>
              <div className="relative flex flex-col gap-2">
                <span className="text-xs text-white/60">User ID</span>
                <div className="relative flex items-center">
                  <input
                    className="outline-none border disabled:opacity-70 placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
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
                    className="absolute cursor-pointer flex items-center justify-center right-2 w-7 h-7 rounded-[8px] hover:bg-[#313131]"
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
      )}
      {/* JOIN DIALOG */}
      {joinDialog && (
        <div
          className={`fixed inset-0 z-[9999] bg-black bg-opacity-35 flex items-center justify-center transition-all duration-300`}
        >
          <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#080f17] border-[#313131] border p-6 text-white">
            Join Room
            <div className=" mt-3 flex text-md gap-2 text-sm items-center">
              <input
                required
                min={1000}
                max={9999}
                onChange={(e) => {
                  const val = e.target.value;
                  setRoomId(val === "" ? null : Number(val));
                }}
                className="outline-none border placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
                type="number"
                value={room_id ?? ""}
                placeholder="Room ID"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={() => {
                  setRoomId(null);
                  setJoinDialog(false);
                }}
                className="bg-[#080f17] ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CREATE DIALOG */}
      {createDialog && (
        <div
          className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300`}
        >
          <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#080f17] border-[#313131] border p-6 text-white">
            Create Room
            <div className=" mt-3 flex text-md gap-2 text-sm items-center">
              <input
                required
                onChange={(e) => setRoomName(e.target.value)}
                value={roomName}
                className="outline-none border placeholder-[#c7c7c7] border-[#313131] rounded-[8px] text-[#e3e3e3] bg-[#1b1b1b] py-2 px-3 w-full"
                type="text"
                placeholder="Room Name"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={() => {
                  setCreateDialog(false);
                  setRoomName("");
                }}
                className="bg-[#080f17] ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* LOG OUT DIALOG */}
      {logoutDialog && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-35 z-[9999] flex items-center justify-center transition-all duration-300`}
        >
          <div className="w-96 rounded-xl text-lg md:scale-100 scale-[80%] font-regular bg-[#080f17] border-[#313131] border p-6 text-white">
            Are you sure you want to log out?
            <div className="text-[#676767] mt-2 text-sm">
              You can sign in back anytime.
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={() => setLogoutDialog(false)}
                className="bg-[#080f17] ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  handleSignOut();
                }}
                className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="z-[2000] w-6 h-6 absolute top-2 left-2 text-white md:hidden"
        >
          <Menu
            className={`${
              mobileMenu ? "rotate-180" : ""
            } text-white/60 ease-in-out hover:text-white/80 duration-200 w-5 h-5`}
          />
        </button>
        <div
          className={`bg-[#080f17] ${className} md:translate-y-0 translate-y-10 fixed md:static top-0 left-0 h-screen 
    border-[#322b45] border-r select-none transition-transform duration-300
    flex flex-col p-2 text-white font-sans z-[1500]
    ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0`}
        >
          {!user?.username || !user?.user_id || !user?.avatar ? (
            <Skeleton className="h-14 w-58 bg-[#313131] rounded-[8px]" />
          ) : (
            <div
              onClick={() => setProfileDialog(true)}
              className={`flex justify-between items-center cursor-pointer hover:bg-[#211f31] ease-in-out rounded-xl w-60 px-2 py-2`}
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
          )}
          {!user?.user_id || !membersCount || !rooms ? (
            <Skeleton className="h-[120px] mt-2 w-58 bg-[#313131] rounded-[8px]" />
          ) : (
            <div className={`flex flex-col gap-2 mt-3 text-sm items-center`}>
              <button
                style={{ backgroundColor: color }}
                onClick={() => setCreateDialog(true)}
                className={`flex items-center hover:text-white/80 justify-center hover:shadow-sm hover:shadow-[#272239] gap-1 duration-200 w-56 py-2 rounded-[10px] text-white`}
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>

              <button
                onClick={() => setJoinDialog(true)}
                className="ease-in-out bg-[#161322] hover:bg-[#211f31] text-white/90 hover:text-white duration-200 flex items-center justify-center gap-2 border-[#1c1c1c] border w-56 py-2 rounded-[10px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Room</span>
              </button>
            </div>
          )}
          {!user?.user_id || !membersCount || !rooms ? (
            <Skeleton className="h-[600px] mt-2 w-58 bg-[#313131] rounded-[8px]" />
          ) : (
            <div className="mt-3">
              <div className="flex gap-36 items-center ml-3 text-[#aaaaaa]">
                <span className="text-xs">Rooms</span>
                <div className="bg-[#211f31] rounded-[8px] px-2 py-1 flex text-white/60 text-xs items-center gap-0.5">
                  <HouseIcon className="w-3 h-3 cursor-pointer" />
                  {rooms.length ?? 0}
                </div>
              </div>
              <div className="flex flex-col text-sm text-white">
                {rooms.map((room) => (
                  <div
                    onClick={() => {
                      setMobileMenu(false);
                      router.push(`/home/room/${room?.Rooms?.room_id}`);
                    }}
                    className={`cursor-pointer relative flex items-center gap-3 mt-2 rounded-[8px] py-2 px-2 hover:bg-[#211f31] ${
                      currentRoom?.toString() ===
                        room?.Rooms?.room_id.toString() && "bg-[#211f31]"
                    }`}
                    key={room?.Rooms?.room_id}
                  >
                    <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10">
                      {room?.Rooms?.room_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col rounded-[8px] cursor-pointer">
                      {room?.Rooms?.room_name}
                      <span className="text-white/40 text-xs">
                        ID: {room?.Rooms?.room_id}
                      </span>
                    </div>
                    {/* <div>FOR MENU</div> */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
