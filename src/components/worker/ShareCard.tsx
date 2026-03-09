"use client";

import { useEffect, useState, useCallback } from "react";
import ShareButton from "./ShareButton";
import type { Platform } from "@/lib/constants";

interface UrlData {
  id: number;
  url: string;
  title: string;
  description: string | null;
}

const platforms: Platform[] = ["facebook", "twitter", "pinterest"];

export default function ShareCard({ initialUrl }: { initialUrl: UrlData }) {
  const [url, setUrl] = useState<UrlData>(initialUrl);
  const [sessionId, setSessionId] = useState("");
  const [loadingNew, setLoadingNew] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem("worker_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("worker_session_id", id);
    }
    setSessionId(id);
  }, []);

  const getAnotherUrl = useCallback(async () => {
    setLoadingNew(true);
    try {
      const res = await fetch(`/api/urls/random?exclude=${url.id}`);
      const data = await res.json();
      if (data.id) {
        setUrl(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingNew(false);
    }
  }, [url.id]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">{url.title}</h2>
          {url.description && (
            <p className="text-sm text-zinc-400">{url.description}</p>
          )}
          <div className="mt-3 px-3 py-2 bg-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-300 break-all font-mono">
              {url.url}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            Share this URL on
          </p>
          {platforms.map((platform) => (
            <ShareButton
              key={platform}
              platform={platform}
              urlId={url.id}
              urlString={url.url}
              title={url.title}
              sessionId={sessionId}
            />
          ))}
        </div>

        <button
          onClick={getAnotherUrl}
          disabled={loadingNew}
          className="w-full py-2.5 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loadingNew ? "Loading..." : "Get Another URL"}
        </button>
      </div>
    </div>
  );
}
