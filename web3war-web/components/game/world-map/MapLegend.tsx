'use client';

import { Flag } from 'lucide-react';
import { FACTIONS } from './config';

interface MapLegendProps {
    className?: string;
}

export function MapLegend({ className = '' }: MapLegendProps) {
    return (
        <div className={`bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-xl ${className}`}>
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
                <Flag size={12} /> FACTIONS
            </h4>
            <div className="space-y-2">
                {FACTIONS.map(faction => (
                    <div key={faction.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: faction.color }} />
                        <span className="text-xs text-slate-300">{faction.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MapLegend;
