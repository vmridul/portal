import AvatarStack from "../ui/AvatarStack"

import { HugeiconsIcon } from "@hugeicons/react"
import { CallEnd01Icon, MicOff02Icon, Mic02Icon } from "@hugeicons/core-free-icons"

const isMuted = false;

export const ActiveCallMock = ({ className }: { className?: string }) => (
    <div className={`p-3  ${className}`}>
        <div className="flex items-center justify-between mb-3 ">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-white">Active Call</span>
            </div>
            <span className="text-xs text-gray-400">24m</span>
        </div>

        <div className="flex items-center mb-3">
            <AvatarStack users={[{ user_id: "pi", username: "pi", avatar: "/assets/pi.png" }, { user_id: "bu", username: "bu", avatar: "/assets/bu.png" }]} size={24} showCount />
        </div>

        <div className="flex gap-2">
            <button

                className={`cursor-default flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${isMuted ? "bg-red-500/20 text-red-400" : "bg-theme-hover text-white"
                    }`}
            >
                {isMuted ? (
                    <HugeiconsIcon icon={MicOff02Icon} className="w-4 h-4" />
                ) : (
                    <HugeiconsIcon icon={Mic02Icon} className="w-4 h-4" />
                )}
                <span className="text-sm">{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            <button
                className="cursor-default  flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-800 text-red-100 transition-colors"
            >
                <HugeiconsIcon icon={CallEnd01Icon} className="w-4 h-4" />
                <span className="text-sm">Leave</span>
            </button>
        </div>
    </div>
)