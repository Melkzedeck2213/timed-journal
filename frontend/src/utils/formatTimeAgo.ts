export function formatTimeAgo(dateString: string, now: Date = new Date()): string {
  const created = new Date(dateString);
  let diff = Math.floor((now.getTime() - created.getTime()) / 1000); // in seconds

  if (diff < 60) {
    return `${diff}s`;
  }
  const minutes = Math.floor(diff / 60);
  diff = diff % 60;
  if (minutes < 60) {
    return `${minutes}m${diff > 0 ? ` ${diff}s` : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}${diff > 0 ? ` ${diff}s` : ""}`;
  }
  const days = Math.floor(hours / 24);
  const hrs = hours % 24;
  return `${days}d${hrs > 0 ? ` ${hrs}h` : ""}${mins > 0 ? ` ${mins}m` : ""}${diff > 0 ? ` ${diff}s` : ""}`;
}