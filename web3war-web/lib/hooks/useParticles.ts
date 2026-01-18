'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
}

export function useParticles() {
    const [particles, setParticles] = useState<Particle[]>([]);

    const spawnParticles = useCallback((x: number, y: number, color: string = '#f59e0b') => {
        const count = 12;
        const newParticles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Math.random(),
                x,
                y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.7) * 15,
                color,
                size: Math.random() * 4 + 2
            });
        }

        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    useEffect(() => {
        if (particles.length === 0) return;

        const interval = setInterval(() => {
            setParticles(prev =>
                prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.vx,
                        y: p.y + p.vy,
                        vy: p.vy + 0.5, // gravity
                        size: Math.max(0, p.size - 0.1)
                    }))
                    .filter(p => p.size > 0)
            );
        }, 16);

        return () => clearInterval(interval);
    }, [particles.length]);

    return { particles, spawnParticles };
}
