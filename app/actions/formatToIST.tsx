export const formatToIST = (timestamp: string | Date | undefined) => {
  if (!timestamp) return "";
  const date =
    typeof timestamp === "string" ? new Date(timestamp + "Z") : timestamp;

  // Format time (HH:MM)
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Format date (D Mon)
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);

  return `${hours}:${minutes}, ${day} ${month}, ${year}`;
};
