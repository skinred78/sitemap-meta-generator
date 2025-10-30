/**
 * Clipboard utility for copy-to-clipboard functionality
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Copy multiple values to clipboard as formatted text
 */
export async function copyMetaData(data: {
  url: string;
  title: string;
  description: string;
}): Promise<boolean> {
  const formatted = `URL: ${data.url}
Title: ${data.title}
Description: ${data.description}`;

  return copyToClipboard(formatted);
}
