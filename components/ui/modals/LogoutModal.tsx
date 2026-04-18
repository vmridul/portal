import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useUIStore } from "@/store/uiStore";
import { useColor } from "@/contexts/colorContext";

export function LogoutModal() {
  const { closeModal } = useUIStore();
  const { color, textColor } = useColor();
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
    <div className="w-96 rounded-xl text-lg md:scale-100 scale-95 font-regular bg-theme-surface border-theme-border border p-6 text-white animate-in zoom-in-95 duration-200">
      <div>Are you sure you want to log out?</div>
      <div className="text-[#676767] mt-2 text-sm">
        You can sign in back anytime.
      </div>
      <div className="flex justify-end gap-2 mt-6 text-sm">
        <button
          onClick={closeModal}
          className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
        >
          Cancel
        </button>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: color, color: textColor }}
          className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
