import { useEffect, useRef } from "react";

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const columns = Math.floor(width / 20);
    const drops: number[] = new Array(columns).fill(1);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";

    function draw() {
      // Slightly more transparent background for smoother trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; 
      ctx.fillRect(0, 0, width, height);

      // Create a gradient for the green text
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0F0");
      gradient.addColorStop(1, "#050");

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(0, 255, 0, 0.5)";
      ctx.font = "bold 16px monospace";

      for (let i = 0; i < drops.length; i++) {
        // Occasionally use special characters
        const text = Math.random() > 0.9 ? "EliteVault"[Math.floor(Math.random() * 10)] : chars[Math.floor(Math.random() * chars.length)];
        
        // Randomize brightness for some characters
        if (Math.random() > 0.9) {
          ctx.fillStyle = "#FFF";
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#FFF";
        } else {
          ctx.fillStyle = gradient;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(0, 255, 0, 0.5)";
        }

        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40 z-0"
    />
  );
}
