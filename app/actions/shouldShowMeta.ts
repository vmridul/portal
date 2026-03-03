export function shouldShowMeta(currentMsg: any, previousMsg: any) {
  if (!previousMsg) return true;
  if (currentMsg.sender_id !== previousMsg.sender_id) return true;

  const currentT = new Date(currentMsg._creationTime);
  const prevT = new Date(previousMsg._creationTime);
  const diffInMins = (currentT.getTime() - prevT.getTime()) / 60000;
  return diffInMins > 10;
}
