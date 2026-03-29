/**
 * Format a lastSeen ISO timestamp into a human-readable online status string.
 * Returns null when lastSeen is not available (user never sent a heartbeat).
 */
export function formatLastSeen(lastSeen: string | null | undefined): string | null {
  if (!lastSeen) return null;
  const diff = Date.now() - new Date(lastSeen).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 5) return 'Online';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return 'Long ago';
}
