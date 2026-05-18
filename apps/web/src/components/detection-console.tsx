"use client";

import { ChangeEvent, useState } from "react";

type DetectionResult = {
  message?: string;
  detection_result?: {
    data: Array<{
      bounding_boxes: Array<{
        is_deepfake: number;
        bbox_confidence: number;
      }>;
    }>;
    meta?: {
      provider?: string;
      faces_screened?: number;
      rationale?: string;
    };
  };
  error?: string;
};

const MAX_IMAGE_SIDE = 1600;
const TARGET_IMAGE_BYTES = 180 * 1024;

async function optimizeImage(file: File) {
  const sourceDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Unable to process the selected image."));
    element.src = sourceDataUrl;
  });

  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to initialize the image optimizer.");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = 0.9;
  let output = canvas.toDataURL("image/jpeg", quality);

  while (output.length * 0.75 > TARGET_IMAGE_BYTES && quality > 0.45) {
    quality -= 0.1;
    output = canvas.toDataURL("image/jpeg", quality);
  }

  return output;
}

export function DetectionConsole() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const optimizedPreview = await optimizeImage(file);
      setPreview(optimizedPreview);
      setSelectedFileName(file.name);
      setResult(null);
      setError(null);
    } catch (processingError) {
      setError(
        processingError instanceof Error
          ? processingError.message
          : "Unable to prepare the image."
      );
    }
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

  const boxes = result?.detection_result?.data?.[0]?.bounding_boxes ?? [];
  const primaryBox =
    boxes.length > 0
      ? boxes.reduce((highest, current) =>
          current.is_deepfake > highest.is_deepfake ? current : highest
        )
      : null;
  const averageConfidence =
    boxes.length > 0
      ? boxes.reduce((sum, box) => sum + box.bbox_confidence, 0) / boxes.length
      : 0;
  const aiProbability = primaryBox ? Number((primaryBox.is_deepfake * 100).toFixed(1)) : 0;
  const authenticityScore = primaryBox ? Number((100 - aiProbability).toFixed(1)) : 0;
  const facesScreened = result?.detection_result?.meta?.faces_screened ?? boxes.length;
  const providerLabel = result?.detection_result?.meta?.provider ?? "aws-nvidia";
  const rationale = result?.detection_result?.meta?.rationale;

  let riskLabel = "Standby";
  let riskClasses = "border-black/10 bg-black/5 text-black/70";

  if (primaryBox) {
    if (aiProbability >= 75) {
      riskLabel = "Critical Risk";
      riskClasses = "border-red-200 bg-red-50 text-red-700";
    } else if (aiProbability >= 40) {
      riskLabel = "Elevated Risk";
      riskClasses = "border-amber-200 bg-amber-50 text-amber-700";
    } else {
      riskLabel = "Low Risk";
      riskClasses = "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-transparent p-2 md:p-4">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/84 p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-[var(--border-accent)] bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Live media screening
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            Analyze a real image now
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
            Upload an image to run the current production deepfake detection pipeline through the
            live API and convert the response into a trust decision.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] p-5">
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-[var(--muted-foreground)]"
            />

            {selectedFileName ? (
              <div className="mt-3 text-sm text-[var(--muted-foreground)]">
                Optimized for live screening: {selectedFileName}
              </div>
            ) : null}

            {preview ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-3 shadow-[0_14px_32px_rgba(17,17,17,0.06)]">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-80 w-full rounded-2xl object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={runDetection}
                  disabled={loading}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-accent)] bg-[linear-gradient(135deg,#000000_0%,#111111_100%)] px-6 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(212,175,55,0.2),0_10px_30px_rgba(0,0,0,0.25)] transition hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_rgba(247,199,67,0.35),0_16px_34px_rgba(0,0,0,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
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

            {result?.message ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {result.message}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--foreground)] p-6 text-white shadow-[0_20px_50px_rgba(17,17,17,0.16)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                AI trust score
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                {primaryBox ? `${authenticityScore}%` : "--"}
              </div>
              <p className="mt-3 text-sm leading-7 text-white/72">
                {primaryBox
                  ? `${authenticityScore}% human-generated confidence derived from the strongest detection signal.`
                  : "Upload an image to generate authenticity, AI probability, and threat scoring."}
              </p>
            </div>
            <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${riskClasses}`}>
              {riskLabel}
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f7c743_0%,#ffffff_100%)]"
              style={{ width: `${primaryBox ? authenticityScore : 8}%` }}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                AI generated probability
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {primaryBox ? `${aiProbability}%` : "--"}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Screening confidence
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {primaryBox ? `${Number((averageConfidence * 100).toFixed(1))}%` : "--"}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Faces screened
              </div>
              <div className="mt-2 text-2xl font-semibold">{facesScreened || "--"}</div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Trust verdict
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {primaryBox ? (aiProbability >= 50 ? "Escalate review" : "Low-risk media") : "--"}
              </div>
            </div>
          </div>

          {primaryBox ? (
            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/6 p-4 text-sm text-white/80">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Decision source
              </div>
              <div className="mt-2 font-medium text-white">{providerLabel}</div>
              {rationale ? <p className="mt-2 leading-7 text-white/72">{rationale}</p> : null}
            </div>
          ) : null}
        </aside>
      </div>

      {boxes.length > 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/84 p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Analysis output
          </div>
          <div className="mt-4 grid gap-4">
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
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8">
                    <div
                      className={`h-full rounded-full ${
                        isDeepfake
                          ? "bg-[linear-gradient(90deg,#ef4444_0%,#b91c1c_100%)]"
                          : "bg-[linear-gradient(90deg,#22c55e_0%,#15803d_100%)]"
                      }`}
                      style={{ width: `${isDeepfake ? fakeScore : 100 - fakeScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
