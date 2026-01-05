export const shouldShowMeta = (index: number, messages: Array<any>) => {
  const TIME_GAP_SECONDS = 20;
  if (index === 0) return true;

  const curr = messages[index];
  const prev = messages[index - 1];

  if (curr.type !== prev.type) return true;
  if (curr.sender_id !== prev.sender_id) return true;

  const currTime = new Date(curr.sent_at).getTime();
  const prevTime = new Date(prev.sent_at).getTime();

  const diffSeconds = (currTime - prevTime) / 1000;

  return diffSeconds > TIME_GAP_SECONDS;
};
