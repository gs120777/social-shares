export const PLATFORMS = ["facebook", "twitter", "pinterest"] as const;
export type Platform = (typeof PLATFORMS)[number];

export function buildShareUrl(
  platform: Platform,
  url: string,
  title: string,
  description?: string | null,
  captionText?: string | null
): string {
  const encodedUrl = encodeURIComponent(url);
  const caption = captionText ?? (description ? `${title} - ${description}` : title);
  const encodedCaption = encodeURIComponent(caption);

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedCaption}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "pinterest":
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedCaption}`;
  }
}
