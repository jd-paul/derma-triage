"use client";

import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";

interface AnalysisResult {
  summary: string;
  concerns: string[];
  recommendations: string[];
  urgency: "low" | "medium" | "high";
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCapture(capturedImage: string) {
    setImage(capturedImage);
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <header className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white text-xl font-bold shadow">
          D
        </div>
        <h1 className="text-2xl font-bold tracking-tight">DermaTriage</h1>
        <p className="text-sm text-zinc-500">
          Snap a photo and get instant, cautious guidance.
        </p>
      </header>

      <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
        <CameraCapture onCapture={handleCapture} />
      </section>

      {loading && (
        <div className="mb-6 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-zinc-200">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-teal-700" />
          <p className="text-sm font-medium text-zinc-700">
            Analysing your skin…
          </p>
          <p className="text-xs text-zinc-500">This usually takes 5–10 seconds.</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}

      {result && (
        <article className="mb-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Analysis</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                result.urgency === "high"
                  ? "bg-red-100 text-red-700"
                  : result.urgency === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {result.urgency.charAt(0).toUpperCase() + result.urgency.slice(1)}{" "}
              urgency
            </span>
          </div>

          <p className="text-sm leading-relaxed text-zinc-700">
            {result.summary}
          </p>

          {result.concerns.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                Observed concerns
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                {result.concerns.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendations.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                Recommendations
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
                {result.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs italic text-zinc-500">
            This is not a medical diagnosis. If you are worried, please see a
            dermatologist or GP.
          </p>
        </article>
      )}

      {image && !loading && (
        <button
          onClick={() => {
            setImage(null);
            setResult(null);
            setError(null);
          }}
          className="mt-auto w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white active:bg-zinc-800"
        >
          Take another photo
        </button>
      )}
    </main>
  );
}
