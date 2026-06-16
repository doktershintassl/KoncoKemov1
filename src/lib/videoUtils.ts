/**
 * Utility to parse and transform YouTube URLs for embedding
 */
export function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Regex to match various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }

  return null;
}

/**
 * Detects if a URL is a YouTube link
 */
export function isYoutubeUrl(url: string): boolean {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
}

/**
 * Gets the video ID from a YouTube URL
 */
export function getYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Gets a high-quality thumbnail for a YouTube video
 */
export function getYoutubeThumbnail(url: string): string | null {
  const videoId = getYoutubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
}
