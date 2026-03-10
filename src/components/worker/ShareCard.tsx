"use client";

import { useEffect, useState, useCallback } from "react";
import ShareButton from "./ShareButton";
import type { Platform } from "@/lib/constants";

interface CaptionData {
  id: number;
  text: string;
}

interface UrlData {
  id: number;
  url: string;
  title: string;
  description: string | null;
  caption: CaptionData | null;
}

const platforms: Platform[] = ["facebook", "twitter", "pinterest"];

interface ShareCardProps {
  initialUrl: UrlData;
  projectSlug?: string;
}

export default function ShareCard({ initialUrl, projectSlug }: ShareCardProps) {
  const [url, setUrl] = useState<UrlData>(initialUrl);
  const [sessionId, setSessionId] = useState("");
  const [loadingNew, setLoadingNew] = useState(false);

  // Step tracking
  const [captionCopied, setCaptionCopied] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  const hasCaption = url.caption !== null;

  useEffect(() => {
    let id = localStorage.getItem("worker_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("worker_session_id", id);
    }
    setSessionId(id);
  }, []);

  // Caption text: use the explicit caption if available, else fall back to title+description
  const captionText = hasCaption
    ? url.caption!.text
    : url.description
      ? `${url.title} - ${url.description}`
      : url.title;

  const copyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = captionText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2500);
    }
  }, [captionText]);

  const handleShareComplete = useCallback(() => {
    setHasShared(true);
  }, []);

  const getAnotherUrl = useCallback(async () => {
    setLoadingNew(true);
    try {
      const endpoint = projectSlug
        ? `/api/projects/${projectSlug}/random?exclude=${url.id}`
        : `/api/urls/random?exclude=${url.id}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.id) {
        setUrl(data);
        // Reset step states
        setCaptionCopied(false);
        setHasShared(false);
      }
    } catch {
      // ignore
    } finally {
      setLoadingNew(false);
    }
  }, [url.id, projectSlug]);

  // Steps adapt based on whether a caption exists
  const steps = hasCaption
    ? [
        { label: "Read the URL and caption below", done: true },
        { label: "Copy the caption text", done: captionCopied },
        { label: "Click a share button to post", done: hasShared },
        { label: "Paste caption & publish on the platform", done: false },
      ]
    : [
        { label: "Read the URL below", done: true },
        { label: "Click a share button to post", done: hasShared },
        { label: "Publish on the platform", done: false },
      ];

  const completedSteps = steps.filter((s) => s.done).length;

  return (
    <div
      className="w-full max-w-md mx-auto relative z-10 animate-fade-up"
      style={{ animationDelay: "150ms" }}
    >
      <div className="gradient-border rounded-2xl p-6 space-y-5 backdrop-blur-sm">
        {/* Step-by-Step Guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-medium">
              Steps to complete
            </p>
            <span className="text-xs text-stone-500 font-mono">
              {completedSteps}/{steps.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedSteps / steps.length) * 100}%` }}
            />
          </div>

          {/* Steps list */}
          <div className="space-y-1.5">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 py-1.5 transition-colors duration-300 ${
                  step.done ? "text-stone-300" : "text-stone-500"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300 ${
                    step.done
                      ? "bg-orange-500 text-white"
                      : "border border-stone-700 text-stone-600"
                  }`}
                >
                  {step.done ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm leading-tight">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-800/60" />

        {/* URL Info */}
        <div>
          <h2 className="text-2xl font-bold text-stone-50 mb-1 tracking-tight">
            {url.title}
          </h2>
          {url.description && (
            <p className="text-base text-stone-300 leading-relaxed">
              {url.description}
            </p>
          )}
          <div className="mt-3 px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl">
            <p className="text-sm text-orange-500 break-all font-mono tracking-tight">
              {url.url}
            </p>
          </div>
        </div>

        {/* Caption Block — only shown when captions exist */}
        {hasCaption && (
          <div className="space-y-2">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-medium">
              Caption to copy
            </p>
            <div>
              <div className="px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl">
                <p className="text-base text-stone-200 leading-relaxed">
                  {captionText}
                </p>
              </div>
              <button
                onClick={copyCaption}
                className={`mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  captionCopied
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40"
                }`}
              >
                {captionCopied ? (
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Share Buttons */}
        <div className="space-y-3">
          <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-medium">
            Share this URL on
          </p>
          <div className="stagger-children space-y-2.5">
            {platforms.map((platform) => (
              <ShareButton
                key={platform}
                platform={platform}
                urlId={url.id}
                urlString={url.url}
                title={url.title}
                description={url.description}
                captionId={url.caption?.id ?? null}
                captionText={hasCaption ? captionText : null}
                sessionId={sessionId}
                onShareComplete={handleShareComplete}
              />
            ))}
          </div>
        </div>

        {/* Get Another */}
        <button
          onClick={getAnotherUrl}
          disabled={loadingNew}
          className="w-full py-3 text-sm text-stone-400 hover:text-stone-50 border border-stone-800 hover:border-orange-500/30 rounded-xl transition-all duration-200 disabled:opacity-50 hover:bg-orange-500/10 font-medium tracking-wide"
        >
          {loadingNew ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            "Get Another URL"
          )}
        </button>
      </div>
    </div>
  );
}
