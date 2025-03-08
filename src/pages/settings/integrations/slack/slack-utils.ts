
/**
 * Processes a Slack message template by replacing variables with actual values
 * @param template The message template with variables like {employee_name}
 * @param data Object containing values for the variables
 * @returns Processed message with variables replaced by actual values
 */
export const processTemplate = (
  template: string,
  data: Record<string, string | number | boolean | null | undefined>
): string => {
  return template.replace(/{([^}]+)}/g, (match, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
};

/**
 * Format a Slack message for display
 * Replaces Slack markdown with HTML/CSS for display
 */
export const formatSlackMessage = (message: string): string => {
  return message
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>') // Bold
    .replace(/_([^_]+)_/g, '<em>$1</em>') // Italic
    .replace(/~([^~]+)~/g, '<del>$1</del>') // Strikethrough
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Code
    .replace(/\n/g, '<br />'); // Line breaks
};

/**
 * Validates if a Slack token is valid
 */
export const isValidSlackToken = (token: string): boolean => {
  // Simple validation - Slack tokens typically start with xoxb- or xoxp-
  return /^xox[bp]-\d+-\d+-[a-zA-Z0-9]+$/.test(token);
};

/**
 * Creates a simple checksum for a message to help with duplicate detection
 */
export const createMessageChecksum = (
  recipientId: string,
  message: string
): string => {
  // Simple checksum using string concatenation
  return `${recipientId}-${message.length}-${message.substring(0, 20)}`;
};
