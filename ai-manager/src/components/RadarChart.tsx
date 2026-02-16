"use client";

import { useEffect, useRef, useState } from "react";

interface BucketScore {
  label: string;
  score: number;
  category: string;
}

interface RadarChartProps {
  buckets: BucketScore[];
  selectedCategory: string | null;
  onCategoryClick: (category: string) => void;
}

export function RadarChart({ buckets, selectedCategory, onCategoryClick }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [clickableRegions, setClickableRegions] = useState<{ category: string; x: number; y: number; radius: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;
    const numberOfPoints = buckets.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw concentric circles (grid lines)
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / 5) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw axes
    const vertices: { x: number; y: number; category: string }[] = [];
    const newClickableRegions: { category: string; x: number; y: number; radius: number }[] = [];

    for (let i = 0; i < numberOfPoints; i++) {
      const angle = (Math.PI * 2 * i) / numberOfPoints - Math.PI / 2;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);

      // Draw axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Calculate vertex position based on score
      const scoreRatio = buckets[i].score / 100;
      const vertexX = centerX + maxRadius * scoreRatio * Math.cos(angle);
      const vertexY = centerY + maxRadius * scoreRatio * Math.sin(angle);
      vertices.push({ x: vertexX, y: vertexY, category: buckets[i].category });

      // Store clickable region
      newClickableRegions.push({
        category: buckets[i].category,
        x: vertexX,
        y: vertexY,
        radius: 20
      });

      // Draw labels
      const labelX = centerX + (maxRadius + 40) * Math.cos(angle);
      const labelY = centerY + (maxRadius + 40) * Math.sin(angle);

      ctx.font = "600 13px DM Sans, sans-serif";
      ctx.fillStyle = selectedCategory === buckets[i].category ? "#7c3aed" : "#374151";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Wrap text for long labels
      const words = buckets[i].label.split(" ");
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(" "), labelX, labelY - 8);
        ctx.fillText(words.slice(2).join(" "), labelX, labelY + 8);
      } else {
        ctx.fillText(buckets[i].label, labelX, labelY);
      }

      // Draw score percentage below label
      ctx.font = "700 14px DM Sans, sans-serif";
      ctx.fillStyle = buckets[i].score >= 80 ? "#10b981" : buckets[i].score >= 60 ? "#f59e0b" : "#ef4444";
      ctx.fillText(`${buckets[i].score}%`, labelX, labelY + 24);
    }

    setClickableRegions(newClickableRegions);

    // Draw filled polygon
    ctx.beginPath();
    vertices.forEach((vertex, i) => {
      if (i === 0) {
        ctx.moveTo(vertex.x, vertex.y);
      } else {
        ctx.lineTo(vertex.x, vertex.y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(124, 58, 237, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw vertices
    vertices.forEach((vertex) => {
      const isSelected = selectedCategory === vertex.category;
      const isHovered = hoveredCategory === vertex.category;

      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, isSelected || isHovered ? 10 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#7c3aed" : isHovered ? "#a78bfa" : "#fff";
      ctx.fill();
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = isSelected || isHovered ? 3 : 2;
      ctx.stroke();

      // Add glow effect for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(124, 58, 237, 0.4)";
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    });
  }, [buckets, selectedCategory, hoveredCategory]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near any vertex
    for (const region of clickableRegions) {
      const distance = Math.sqrt(Math.pow(x - region.x, 2) + Math.pow(y - region.y, 2));
      if (distance <= region.radius) {
        onCategoryClick(region.category);
        return;
      }
    }

    // Click outside all vertices - clear filter
    onCategoryClick("");
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundHover = false;
    for (const region of clickableRegions) {
      const distance = Math.sqrt(Math.pow(x - region.x, 2) + Math.pow(y - region.y, 2));
      if (distance <= region.radius) {
        setHoveredCategory(region.category);
        canvas.style.cursor = "pointer";
        foundHover = true;
        break;
      }
    }

    if (!foundHover) {
      setHoveredCategory(null);
      canvas.style.cursor = "default";
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredCategory(null)}
        className="max-w-full h-auto"
      />
    </div>
  );
}
