'use client';

import React from 'react';
import { getIPFSUrl } from '@/lib/ipfsService';

interface TacticalAvatarProps {
    seed: string;
    size?: number;
    className?: string;
    showBackground?: boolean;
}

export function TacticalAvatar({ seed, size = 100, className = '', showBackground = true }: TacticalAvatarProps) {
    // Check if seed is a direct image URL or IPFS hash
    const isImageUrl = seed?.startsWith('http') || seed?.startsWith('data:image/');
    const isIPFS = seed?.startsWith('ipfs://') || (seed && /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|ba[X-Z2-7][0-9a-zA-Z]{57})$/.test(seed));

    // Decode seed: V01K01F01G01S01B01
    const parseSeed = (s: string) => {
        const getV = (char: string) => {
            const idx = s.indexOf(char);
            if (idx === -1) return '01';
            const val = s.substring(idx + 1, idx + 3);
            return val === '00' ? 'none' : val;
        };

        return {
            body: getV('V'),
            clothing: getV('K'),
            head: getV('F'),
            eyes: getV('G'),
            hair: getV('S'),
            beard: getV('B'),
        };
    };

    if (isImageUrl || isIPFS) {
        return (
            <div
                className={`relative overflow-hidden flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700/50 ${className}`}
                style={{ width: size, height: size }}
            >
                <img
                    src={getIPFSUrl(seed)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if IPFS load fails
                        (e.target as HTMLImageElement).src = '/assets/nopp.png';
                    }}
                />
            </div>
        );
    }

    const selections = parseSeed(seed || "V01K01F01G01S01B01");
    const categories: (keyof ReturnType<typeof parseSeed>)[] = ['body', 'clothing', 'head', 'eyes', 'hair', 'beard'];

    return (
        <div
            className={`relative overflow-hidden bg-slate-900 border border-slate-700/50 rounded-xl ${className}`}
            style={{
                width: size,
                height: size,
                imageRendering: 'pixelated'
            }}
        >
            {showBackground && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            )}
            {/* Layer Stacking */}
            {categories.map((cat, idx) => {
                const asset = selections[cat];
                if (asset === 'none') return null;

                return (
                    <img
                        key={cat}
                        src={`/avatar-assets/${cat}/${asset}.svg`}
                        alt={cat}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ zIndex: idx + 1 }}
                    />
                );
            })}

            {/* Tactical Overlay (Minimal) */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-10">
                <div className="w-full h-full border border-cyan-500/20 rounded-full" />
            </div>
        </div>
    );
}
