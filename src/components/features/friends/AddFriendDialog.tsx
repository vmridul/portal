import { toast } from "sonner";
import { useFriendActions } from "@/hooks";
import { useColor } from "@/contexts/colorContext";
import { useUIStore } from "@/store/uiStore";
import { useForm } from "react-hook-form";

export function AddFriendDialog() {
  const { closeModal } = useUIStore();
  const { sendRequest } = useFriendActions();
  const { color, textColor } = useColor();

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
    <div className={`fixed bg-black bg-opacity-35 inset-0 z-[9999] flex items-center justify-center transition-all duration-300 animate-in fade-in-0 duration-200`}>
      <form onSubmit={handleSubmit(onSubmit)} className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-theme-surface border-theme-border border p-6 text-white animate-in zoom-in-95 duration-200">
        Add Friend
        <div className=" mt-3 flex text-md gap-2 text-sm items-center">
          <input
            {...register("friendId", { required: true })}
            className="outline-none border placeholder-[#c7c7c7] border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3 w-full"
            type="text"
            placeholder="Enter User's ID"
            disabled={isSubmitting}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 mt-6 text-sm">
          <button
            type="button"
            onClick={() => {
              reset();
              closeModal();
            }}
            className="ease-in-out hover:bg-theme-surface hover:text-white/90 border border-theme-border text-white py-2 px-6 rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ backgroundColor: color, color: textColor }}
            className="ease-in-out hover:brightness-110 py-2 px-6 rounded-xl disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}