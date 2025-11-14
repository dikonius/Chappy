
export const formatMessageTime = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // Calculate difference in minutes
  const diffMinutes = (now.getTime() - messageDate.getTime()) / (60 * 1000);
  const messageTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Less than 5 minutes ago: "now"
  if (diffMinutes < 5) {
    return 'now';
  }

  // Check for today (older than 5 minutes)
  const isToday = messageDate.getDate() === now.getDate() &&
                  messageDate.getMonth() === now.getMonth() &&
                  messageDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return messageTime; // E.g., 10:30 AM
  }

  // Check for yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = messageDate.getDate() === yesterday.getDate() &&
                      messageDate.getMonth() === yesterday.getMonth() &&
                      messageDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday ${messageTime}`;
  }

  // Older than yesterday: full date
  return messageDate.toLocaleDateString(); // E.g., 11/13/2025
};