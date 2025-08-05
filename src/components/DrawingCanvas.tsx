import React, { useEffect } from "react";
import { Shape } from "../interfaces/Shape";
import "./DrawingCanvas.css";

interface DrawingCanvasProps {
  shapes: Shape[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ shapes, canvasRef }) => {
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // ניקוי הציור הקודם
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // ציור כל הצורות
    shapes.forEach((shape, index) => {
      if (!shape?.type) return;

      ctx.fillStyle = shape.color || "black";
      ctx.strokeStyle = shape.color || "black";
      ctx.lineWidth = shape.lineWidth || 2;

      switch (shape.type.toLowerCase()) {
        case "circle": {
          const radius = shape.radius ?? shape.size ?? 30;
          if (typeof shape.x !== "number" || typeof shape.y !== "number") return;
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case "rect":
        case "rectangle": {
          if (typeof shape.x !== "number" || typeof shape.y !== "number") return;
          ctx.fillRect(shape.x, shape.y, shape.width ?? 50, shape.height ?? 50);
          break;
        }

        case "line": {
          if (
            typeof shape.x !== "number" ||
            typeof shape.y !== "number" ||
            typeof shape.width !== "number" ||
            typeof shape.height !== "number"
          )
            return;
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.stroke();
          break;
        }

        case "triangle": {
          if (
            typeof shape.x !== "number" ||
            typeof shape.y !== "number" ||
            typeof shape.width !== "number" ||
            typeof shape.height !== "number"
          )
            return;
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + (shape.width ?? 50), shape.y);
          ctx.lineTo(shape.x + (shape.width ?? 50) / 2, shape.y - (shape.height ?? 50));
          ctx.closePath();
          ctx.fill();
          break;
        }

        default:
          console.warn(`צורה לא מוכרת במספר ${index}:`, shape.type);
      }
    });
  }, [shapes, canvasRef]);

  return <canvas ref={canvasRef} width={1600} height={900} className="drawing-canvas" />;
};

export default DrawingCanvas;
