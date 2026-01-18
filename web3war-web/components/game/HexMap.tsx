'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Hexagon math constants
const HEX_SIZE = 40;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;

interface Hex {
    q: number;
    r: number;
    s: number;
    resource: 'oil' | 'gold' | 'ammo' | 'none';
    owner: 'player' | 'enemy' | 'neutral';
    id: string;
}

interface HexMapProps {
    onHexClick: (hex: Hex) => void;
    selectedHexId: string | null;
}

export function HexMap({ onHexClick, selectedHexId }: HexMapProps) {
    // Generate a simple hex grid
    const hexes = useMemo(() => {
        const grid: Hex[] = [];
        const radius = 5; // Grid radius

        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                const s = -q - r;
                // Randomly assign resources and owners for demo
                const rand = Math.random();
                const resource = rand > 0.8 ? 'oil' : rand > 0.6 ? 'gold' : rand > 0.5 ? 'ammo' : 'none';
                const owner = rand > 0.9 ? 'player' : rand > 0.7 ? 'enemy' : 'neutral';

                grid.push({
                    q, r, s,
                    resource,
                    owner,
                    id: `${q},${r}`
                });
            }
        }
        return grid;
    }, []);

    // Convert cube coordinates to pixel coordinates
    const hexToPixel = (hex: Hex) => {
        const x = HEX_SIZE * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r);
        const y = HEX_SIZE * (3 / 2 * hex.r);
        return { x, y };
    };

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#050510] relative">
            <svg
                viewBox="-400 -350 800 700"
                className="w-full h-full max-w-[1000px] max-h-[800px] select-none drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 50px rgba(0,242,234,0.1))' }}
            >
                {/* Connection lines or background effects could go here */}

                {hexes.map((hex) => {
                    const { x, y } = hexToPixel(hex);
                    const isSelected = selectedHexId === hex.id;
                    const isPlayer = hex.owner === 'player';
                    const isEnemy = hex.owner === 'enemy';

                    let fill = '#1e293b'; // Default neutral slate
                    if (isPlayer) fill = '#0ea5e9'; // Blue
                    if (isEnemy) fill = '#ef4444'; // Red
                    if (isSelected) fill = '#f59e0b'; // Amber selection

                    return (
                        <g
                            key={hex.id}
                            transform={`translate(${x},${y})`}
                            onClick={() => onHexClick(hex)}
                            className="cursor-pointer transition-all duration-200"
                            style={{ opacity: isSelected ? 1 : 0.8 }}
                        >
                            <motion.path
                                d={`M0,${-HEX_SIZE} L${HEX_WIDTH / 2},${-HEX_SIZE / 2} L${HEX_WIDTH / 2},${HEX_SIZE / 2} L0,${HEX_SIZE} L${-HEX_WIDTH / 2},${HEX_SIZE / 2} L${-HEX_WIDTH / 2},${-HEX_SIZE / 2} Z`}
                                fill={fill}
                                stroke={isSelected ? 'white' : 'rgba(255,255,255,0.1)'}
                                strokeWidth={isSelected ? 3 : 1}
                                initial={{ scale: 0 }}
                                animate={{ scale: isSelected ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                whileHover={{ scale: 1.05, stroke: 'white', strokeWidth: 2, zIndex: 10 }}
                            />

                            {/* Resource Icon Placeholder */}
                            {hex.resource !== 'none' && (
                                <text
                                    y="5"
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="14"
                                    fontWeight="bold"
                                    pointerEvents="none"
                                >
                                    {hex.resource === 'oil' ? '🛢️' : hex.resource === 'gold' ? '💰' : '🔫'}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
