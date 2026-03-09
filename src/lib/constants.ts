export const PLATFORMS = ["facebook", "twitter", "pinterest"] as const;
export type Platform = (typeof PLATFORMS)[number];

export function buildShareUrl(
  platform: Platform,
  url: string,
  title: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "pinterest":
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
  }
}
