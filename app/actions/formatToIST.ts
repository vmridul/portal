export function formatToIST(
  timestamp: Date | string | number | undefined,
): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const _time = date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const _date = date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${_date}, ${_time}`;
}
