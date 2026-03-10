"use client";

import { useState } from "react";
import type { Platform } from "@/lib/constants";

const platformConfig = {
  facebook: {
    label: "Facebook",
    bg: "bg-[#1877F2]",
    hoverBg: "hover:bg-[#1565c0]",
    shadow: "hover:shadow-[0_4px_20px_rgba(24,119,242,0.25)]",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  twitter: {
    label: "Twitter / X",
    bg: "bg-stone-800",
    hoverBg: "hover:bg-stone-700",
    shadow: "hover:shadow-[0_4px_20px_rgba(255,255,255,0.06)]",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  pinterest: {
    label: "Pinterest",
    bg: "bg-[#E60023]",
    hoverBg: "hover:bg-[#c8001f]",
    shadow: "hover:shadow-[0_4px_20px_rgba(230,0,35,0.25)]",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
      </svg>
    ),
  },
};

interface ShareButtonProps {
  platform: Platform;
  urlId: number;
  urlString: string;
  title: string;
  description: string | null;
  captionId: number | null;
  captionText: string | null;
  sessionId: string;
  onShareComplete?: () => void;
}

export default function ShareButton({
  platform,
  urlId,
  urlString,
  title,
  description,
  captionId,
  captionText,
  sessionId,
  onShareComplete,
}: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const config = platformConfig[platform];

  const fallbackCaption = captionText ?? (description ? `${title} - ${description}` : title);

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlId, platform, sessionId, captionId }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        window.open(data.shareUrl, "_blank", "noopener,noreferrer");
        setShared(true);
        onShareComplete?.();
      }
    } catch {
      const fallbackUrls: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlString)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlString)}&text=${encodeURIComponent(fallbackCaption)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(urlString)}&description=${encodeURIComponent(fallbackCaption)}`,
      };
      window.open(fallbackUrls[platform], "_blank", "noopener,noreferrer");
      onShareComplete?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className={`
        group relative flex items-center gap-3 px-5 py-3.5 rounded-xl text-white font-medium
        transition-all duration-200 disabled:opacity-50 w-full
        ${config.bg} ${config.hoverBg} ${config.shadow}
        ${shared ? "ring-2 ring-green-400/60 ring-offset-1 ring-offset-stone-900" : ""}
      `}
    >
      <span className="shrink-0">{config.icon}</span>
      <span className="text-base tracking-wide">
        {loading ? "Opening..." : shared ? `Shared on ${config.label}` : `Share on ${config.label}`}
      </span>
      {shared && (
        <svg className="w-4 h-4 ml-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      {!shared && !loading && (
        <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-60 transition-opacity text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      )}
    </button>
  );
}
