export function timeAgo(date: string | Date) {
  if (!date) return "";
  const now = new Date();
  const past =
    typeof date === "string"
      ? new Date(date.endsWith("Z") ? date : date + "Z")
      : date;
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 60) return `Just now`;

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}
