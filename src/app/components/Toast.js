"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Toast({ message, type = "success", onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    const timer = setTimeout(() => {
      gsap.to(ref.current, {
        x: 80,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: onDone,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDone]);

  const colors = {
    success: "border-status-done/30 text-status-done",
    error: "border-status-error/30 text-status-error",
    info: "border-accent/30 text-accent",
  };

  return (
    <div
      ref={ref}
      className={`fixed bottom-6 right-6 z-50 rounded-lg border bg-surface-elevated px-4 py-2.5 text-xs ${colors[type]}`}
    >
      {message}
    </div>
  );
}
