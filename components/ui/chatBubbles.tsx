import React from "react";

const ChatBubbles = () => {
  const messages = [
    "Did you push the update?",
    "Yes, it is live.",
    "Portal feels faster.",
    "Realtime sync stable.",

    "Messages load instantly.",
    "UI polish looks solid.",
    "Typing indicator works.",
    "Dark mode balanced.",

    "Presence status fixed.",
    "Chat feels reliable.",
    "Rooms more active.",
    "Animation is smooth.",

    "Latency very low.",
    "Friend chat works.",
    "Production ready.",
    "Deploying now.",

    "Purple theme fits.",
    "Branding is clean.",
    "Design feels right.",
    "We should ship.",

    "Scrolling is smooth.",
    "Mobile works fine.",
    "Realtime consistent.",
    "Strong release.",

    "UX feels intentional.",
    "Performance solid.",
    "System stable.",
    "Launch ready.",

    "Final checks done.",
    "Releasing shortly.",
    "Monitoring rollout.",
    "All systems green.",

    "No errors detected.",
    "Build passed checks.",
    "Everything aligned.",
    "Shipping complete.",

    "Sync feels responsive.",
    "State updates correct.",
    "No dropped messages.",
    "Connection is stable.",

    "Auth flow works.",
    "Session restored.",
    "Reconnect successful.",
    "Latency within limits.",

    "UI feels consistent.",
    "Layout holds well.",
    "Transitions are smooth.",
    "No visual glitches.",

    "Server load normal.",
    "Database queries fast.",
    "Cache hit rate high.",
    "Background jobs running.",

    "Logs look clean.",
    "Metrics are healthy.",
    "Alerts remain quiet.",
    "Ready to scale.",
  ];

  // Array of purple shades
  const colors = ["#8B5CF6", "#8B5CF66A"];
  const dotIndices = [3, 12, 25, 38, 51, 60];

  const getColor = (index: number) => colors[index % colors.length];

  // group into rows of 3
  const rows: string[][] = [];
  for (let i = 0; i < messages.length; i += 3) {
    rows.push(messages.slice(i, i + 3));
  }

  // ✅ MOBILE LIMITS
  const MOBILE_TOP_ROWS = 2;
  const MOBILE_BOTTOM_ROWS = 5;

  const topRows = rows.slice(0, MOBILE_TOP_ROWS);
  const bottomRows = rows.slice(-MOBILE_BOTTOM_ROWS);

  const BubbleRow = ({
    row,
    baseIndex,
  }: {
    row: string[];
    baseIndex: number;
  }) => (
    <div className="flex justify-end gap-2.5">
      {row.map((message, i) => {
        const index = baseIndex + i;
        const isDot = dotIndices.includes(index);

        return (
          <div
            key={index}
            style={{
              backgroundColor: getColor(index),
              borderRadius: "8px 8px 0 8px",
            }}
            className={`
            relative transition-all duration-200 ease-in-out
            hover:opacity-90 hover:scale-105
            ${isDot ? "dots w-32" : "px-3 py-2 text-white text-sm"}
          `}
          >
            {!isDot && <p className="whitespace-nowrap">{message}</p>}
          </div>
        );
      })}
    </div>
  );


  return (
    <div className="absolute inset-0 z-[9999] pointer-events-none select-none">
      {/* 📱 MOBILE — TOP (2 rows only) */}
      <div className="md:hidden absolute top-4 right-2 flex flex-col gap-2">
        {topRows.map((row, i) => (
          <BubbleRow key={i} row={row} baseIndex={i * 3} />
        ))}
      </div>

      {/* 📱 MOBILE — BOTTOM (4–5 rows only) */}
      <div className="md:hidden absolute bottom-4 right-2 flex flex-col gap-2">
        {bottomRows.map((row, i) => (
          <BubbleRow
            key={i}
            row={row}
            baseIndex={(rows.length - MOBILE_BOTTOM_ROWS + i) * 3}
          />
        ))}
      </div>

      {/* 💻 DESKTOP — FULL WALL */}
      <div className="hidden md:flex absolute right-2 top-0 flex-col gap-2">
        {rows.map((row, i) => (
          <BubbleRow key={i} row={row} baseIndex={i * 3} />
        ))}
      </div>
    </div>
  );
};

export default ChatBubbles;