import React, { useEffect, useRef } from 'react';

interface HeatmapOverlayProps {
    data: { x: number; y: number; value: number }[];
    className?: string;
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ data, className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;

        // Clear existing
        ctx.clearRect(0, 0, width, height);

        // 1. Draw "shadow" circles for each point
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 15;

        data.forEach(p => {
            const x = (p.x / 100) * width;
            const y = (p.y / 100) * height;

            // Draw a radial gradient for the "heat" source
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
            gradient.addColorStop(0, 'rgba(0,0,0,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
        });

        // 2. Colorize based on alpha (heat intensity)
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            const alpha = pixels[i + 3]; // Use alpha to determine "heat"
            if (alpha > 0) {
                // Tactical green -> yellow -> red gradient mapping
                if (alpha < 128) {
                    pixels[i] = 34;   // R
                    pixels[i + 1] = 197; // G (Green-500)
                    pixels[i + 2] = 94;  // B
                } else if (alpha < 200) {
                    pixels[i] = 251;  // R
                    pixels[i + 1] = 191; // G (Yellow-400)
                    pixels[i + 2] = 36;  // B
                } else {
                    pixels[i] = 239;  // R
                    pixels[i + 1] = 68;  // G (Red-500)
                    pixels[i + 2] = 68;  // B
                }
                // Modulate final opacity for glassmorphism look
                pixels[i + 3] = alpha * 0.6;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }, [data]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-20 pointer-events-none w-full h-full ${className}`}
        />
    );
};

export default HeatmapOverlay;
