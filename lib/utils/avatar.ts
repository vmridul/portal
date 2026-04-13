const DEFAULT_AVATAR = "/assets/default-avatar.png";

export function getAvatarUrl(
  avatar: string | undefined | null,
  fallback?: string,
): string {
  if (avatar) return avatar;
  return fallback || DEFAULT_AVATAR;
}

export function getSenderAvatar(
  messageSenderId: string,
  currentUserId: string | undefined,
  messageSender: { avatar?: string | null } | null | undefined,
  currentUser: { avatar?: string | null } | undefined,
): string {
  const isCurrentUser = messageSenderId === currentUserId;
  const avatar = isCurrentUser ? currentUser?.avatar : messageSender?.avatar;
  return getAvatarUrl(avatar);
}

export function getDisplayName(
  messageSenderId: string,
  currentUserId: string | undefined,
  messageSender: { username?: string | null } | null | undefined,
): string {
  if (messageSenderId === currentUserId) return "You";
  return messageSender?.username || "Unknown";
}