"use client";

import { useEffect, useRef } from "react";

export default function TopoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

    const pointer = { x: width * 0.5, y: height * 0.35, targetX: width * 0.5, targetY: height * 0.35 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      time += 0.0045;
      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Ambient radial terrain glow
      const radial = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        20,
        pointer.x,
        pointer.y,
        Math.max(width, height) * 0.55
      );
      radial.addColorStop(0, "rgba(122, 154, 110, 0.11)");
      radial.addColorStop(0.45, "rgba(196, 185, 154, 0.04)");
      radial.addColorStop(1, "rgba(10, 13, 8, 0)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Topographic isolines
      const lineCount = 14;
      for (let i = 0; i < lineCount; i++) {
        ctx.beginPath();
        const isAccent = i % 4 === 0;
        ctx.strokeStyle = isAccent
          ? "rgba(196, 185, 154, 0.13)"
          : "rgba(122, 154, 110, 0.11)";
        ctx.lineWidth = isAccent ? 1.25 : 0.85;

        const baseY = (height / (lineCount - 1)) * i;
        const step = 24;

        for (let x = 0; x <= width + step; x += step) {
          const dx = x - pointer.x;
          const dy = baseY - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - dist / 460) * 26;

          const wave1 = Math.sin(x * 0.0022 + time + i * 0.45) * 28;
          const wave2 = Math.cos(x * 0.0055 - time * 0.7 + i * 0.8) * 14;
          const y = baseY + wave1 + wave2 + Math.sin(dist * 0.015 - time * 2) * pull;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Subtle topographic survey crosshairs
      const gridStep = 160;
      ctx.fillStyle = "rgba(196, 185, 154, 0.18)";
      for (let gx = gridStep; gx < width; gx += gridStep) {
        for (let gy = gridStep; gy < height; gy += gridStep) {
          ctx.fillRect(gx - 3, gy, 7, 1);
          ctx.fillRect(gx, gy - 3, 1, 7);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-90"
    />
  );
}

