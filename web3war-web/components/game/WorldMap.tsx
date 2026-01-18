'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export interface RegionData {
    id: string;
    name: string;
    ownerDetail: string; // e.g., "Republic of Turkey"
    color: string;
    path: string; // SVG path d attribute
}

interface WorldMapProps {
    regions: RegionData[];
    onRegionSelect: (regionId: string) => void;
    selectedRegionId: string | null;
}

export function WorldMap({ regions, onRegionSelect, selectedRegionId }: WorldMapProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAdjustment = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.5, scale + scaleAdjustment), 5);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const zoomIn = () => setScale(s => Math.min(s * 1.2, 5));
    const zoomOut = () => setScale(s => Math.max(s / 1.2, 0.5));
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div className="relative w-full h-[600px] bg-[#1a2b3c] overflow-hidden rounded-lg shadow-inner border border-slate-600 group cursor-move">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button onClick={zoomIn} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded shadow border border-slate-500"><ZoomIn size={20} /></button>
                <button onClick={zoomOut} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded shadow border border-slate-500"><ZoomOut size={20} /></button>
                <button onClick={resetZoom} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded shadow border border-slate-500"><Maximize size={20} /></button>
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-slate-400 pointer-events-none select-none">
                Wait for texture load... Map rendered via SVG Vector
            </div>

            <svg
                ref={svgRef}
                viewBox="0 0 1000 500"
                className="w-full h-full"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
                    {/* Ocean Background */}
                    <rect x="-5000" y="-5000" width="10000" height="10000" fill="#1a2b3c" />

                    {regions.map((region) => (
                        <path
                            key={region.id}
                            d={region.path}
                            fill={region.color}
                            stroke={selectedRegionId === region.id ? "#ffffff" : "#000000"}
                            strokeWidth={selectedRegionId === region.id ? 2 : 0.5}
                            className={cn(
                                "transition-colors duration-200 hover:brightness-110 cursor-pointer",
                                selectedRegionId === region.id ? "brightness-125" : "brightness-100"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegionSelect(region.id);
                            }}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}
