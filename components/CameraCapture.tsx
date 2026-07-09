"use client";

import { useRef, useState, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (image: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      setError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError("Could not access the camera. Please allow camera access.");
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the image back to show what the user sees naturally.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);
    stopCamera();
  }

  function retake() {
    setPreview(null);
    startCamera();
  }

  function confirm() {
    if (preview) {
      onCapture(preview);
    }
  }

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center">
      {error && (
        <p className="mb-3 text-center text-sm text-red-600">{error}</p>
      )}

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black">
        {!preview ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={preview}
            alt="Captured skin area"
            className="h-full w-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!preview ? (
        <button
          onClick={takePhoto}
          disabled={!stream}
          className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg ring-4 ring-white active:bg-teal-800 disabled:opacity-50"
          aria-label="Take photo"
        >
          <span className="h-12 w-12 rounded-full border-2 border-white" />
        </button>
      ) : (
        <div className="mt-4 flex w-full gap-3">
          <button
            onClick={retake}
            className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-900 active:bg-zinc-200"
          >
            Retake
          </button>
          <button
            onClick={confirm}
            className="flex-1 rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white active:bg-teal-800"
          >
            Analyse
          </button>
        </div>
      )}
    </div>
  );
}
