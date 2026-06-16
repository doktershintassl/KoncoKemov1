/**
 * Utility functions for the boilerplate.
 */

/**
 * Converts a Google Drive shareable link into a direct image link suitable for <img> tags.
 * Example input: "https://drive.google.com/file/d/1Y36_yn7_PSap4x4tOX8W94wsrmifOnrY/view?usp=drive_link"
 * Output: "https://lh3.googleusercontent.com/d/1Y36_yn7_PSap4x4tOX8W94wsrmifOnrY"
 * 
 * @param url The standard Google Drive sharing URL
 * @returns The direct usable image URL, or the original URL if no ID was found
 */
export function getDirectDriveImageUrl(url: string): string {
  if (!url) return url;

  // Regex untuk mencari ID file dari berbagai format link Google Drive
  const regex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/|export\=download\&id=)([-\w]{25,})/;
  const match = url.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
}
