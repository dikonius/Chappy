/**
 * Extracts initials from a name
 * @param {string} name - The name to extract initials from
 * @param {number} maxInitials - Max number of initials (default: 2)
 * @returns {string} - Initials in uppercase
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name || typeof name !== 'string') {
    return '?';
  }

  // Split name into words and filter out empty strings
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) {
    return '?';
  }

  // Take the first letter from each word, up to maxInitials
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials || '?';
}

/**
 * Generates a consistent color based on a name
 * Same name always gets the same color
 * @param {string} name - The name to generate color from
 * @returns {string} - Hex color (e.g. '#FF5733')
 */
export function getColorFromName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '#808080'; // Fallback gray
  }

  // Array with different colors 
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Blue
    '#FFA07A', // Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Light Blue
    '#F8B739', // Orange
    '#52BE80', // Green
    '#EC7063', // Coral
    '#5DADE2', // Sky Blue
    '#F1948A', // Light Pink
    '#82E0AA', // Light Green
    '#F4D03F', // Gold
    '#AF7AC5', // Light Purple
    '#3498DB', // Clear Blue
  ];

  // Simple hash function to convert name to a number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use absolute value and modulo to get an index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
