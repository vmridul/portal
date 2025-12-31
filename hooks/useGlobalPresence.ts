import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase/client"

type Status = "online" | "away"

export function useGlobalPresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [awayUsers, setAwayUsers] = useState<Set<string>>(new Set())

  const channelRef = useRef<any>(null)
  const userIdRef = useRef<string | null>(null)

  const setStatus = async (status: Status) => {
    if (!channelRef.current || !userIdRef.current) return

    await channelRef.current.track({
      user_id: userIdRef.current,
      status,
    })
  }

  useEffect(() => {
    let active = true

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return

      userIdRef.current = user.id

      const channel = supabase.channel("global-presence", {
        config: { presence: { key: user.id } },
      })

      channelRef.current = channel

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const online = new Set<string>()
        const away = new Set<string>()

        Object.values(state).forEach((list: any[]) => {
          list.forEach((p) => {
            if (!p.user_id) return;
            p.status === "away"
              ? away.add(p.user_id)
              : online.add(p.user_id)
          })
        })

        setOnlineUsers(online)
        setAwayUsers(away)
      })

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await setStatus("online")
        }
      })
    }

    setup()

    return () => {
      active = false
      channelRef.current?.untrack()
      channelRef.current?.unsubscribe()
    }
  }, [])

  return { onlineUsers, awayUsers, setStatus }
}
