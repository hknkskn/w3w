'use client';

import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface MapControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    className?: string;
}

export function MapControls({ onZoomIn, onZoomOut, onReset, className = '' }: MapControlsProps) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <button
                onClick={onZoomIn}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 transition-all hover:scale-105"
                aria-label="Zoom in"
            >
                <ZoomIn size={18} />
            </button>
            <button
                onClick={onZoomOut}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 transition-all hover:scale-105"
                aria-label="Zoom out"
            >
                <ZoomOut size={18} />
            </button>
            <button
                onClick={onReset}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 transition-all hover:scale-105"
                aria-label="Reset view"
            >
                <Maximize size={18} />
            </button>
        </div>
    );
}

export default MapControls;
