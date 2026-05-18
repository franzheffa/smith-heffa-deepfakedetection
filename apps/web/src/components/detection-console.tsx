"use client";

import { ChangeEvent, useState } from "react";

type DetectionResult = {
  body?: {
    detection_result?: {
      data: Array<{
        bounding_boxes: Array<{
          is_deepfake: number;
          bbox_confidence: number;
        }>;
      }>;
    };
  };
  error?: string;
};

export function DetectionConsole() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setPreview(String(loadEvent.target?.result || ""));
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const runDetection = async () => {
    if (!preview) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const image = preview.split(",")[1];
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Detection failed.");
      }

      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed.");
    } finally {
      setLoading(false);
    }
  };

  const boxes = result?.body?.detection_result?.data?.[0]?.bounding_boxes ?? [];

  return (
    <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
        Image detection workspace
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
        Upload an image to run the current deepfake detection pipeline through the production API.
      </p>

      <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] p-5">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block w-full text-sm text-[var(--muted-foreground)]"
        />

        {preview ? (
          <div className="mt-5 space-y-4">
            <img src={preview} alt="Preview" className="max-h-80 rounded-2xl border border-[var(--border-soft)] object-contain" />
            <button
              type="button"
              onClick={runDetection}
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Run detection"}
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {boxes.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {boxes.map((box, index) => {
              const fakeScore = Number((box.is_deepfake * 100).toFixed(1));
              const detectionScore = Number((box.bbox_confidence * 100).toFixed(1));
              const isDeepfake = box.is_deepfake > 0.5;

              return (
                <div
                  key={`${box.is_deepfake}-${index}`}
                  className={`rounded-2xl border px-4 py-4 text-sm ${
                    isDeepfake
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  <div className="font-semibold uppercase tracking-[0.14em]">
                    {isDeepfake ? "Deepfake detected" : "Authentic image"}
                  </div>
                  <div className="mt-2">Confidence: {isDeepfake ? fakeScore : 100 - fakeScore}%</div>
                  <div>Detection accuracy: {detectionScore}%</div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
