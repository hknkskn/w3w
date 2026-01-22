'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

export function ExplosionEffect() {
    const explosionId = useGameStore((state) => state.explosionId);
    const [activeExplosions, setActiveExplosions] = useState<{ id: number; timestamp: number }[]>([]);

    useEffect(() => {
        if (explosionId > 0) {
            const newExplosion = { id: explosionId, timestamp: Date.now() };
            setActiveExplosions((prev) => [...prev, newExplosion]);

            // Clear explosion after 3.5 seconds (allowing for all animations to fade)
            setTimeout(() => {
                setActiveExplosions((prev) => prev.filter((exp) => exp.id !== explosionId));
            }, 3500);
        }
    }, [explosionId]);

    return (
        <div className="absolute inset-0 pointer-events-none z-[80] overflow-hidden">
            <AnimatePresence>
                {activeExplosions.map((exp) => (
                    <ExplosionInstance key={exp.id} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ExplosionInstance() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
            {/* 1. Core Blast Flash */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1.5, 2.2],
                    opacity: [0, 1, 0]
                }}
                transition={{ duration: 0.6, times: [0, 0.2, 1], ease: "easeOut" }}
                className="absolute w-64 h-64 bg-white rounded-full blur-3xl shadow-[0_0_100px_#fff]"
            />

            {/* 2. Expanding Fire Ring */}
            <motion.div
                initial={{ scale: 0.2, opacity: 0, border: '4px solid #f59e0b' }}
                animate={{
                    scale: 4,
                    opacity: [0, 0.8, 0],
                    borderWidth: ['10px', '2px', '0px']
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-40 h-40 rounded-full"
            />

            {/* 3. Smoke Clouds (Multiple) */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={`smoke-${i}`}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
                    animate={{
                        scale: [0, 1.5, 2.5],
                        opacity: [0, 0.8, 0.4, 0],
                        x: (Math.random() - 0.5) * 300,
                        y: (Math.random() - 0.5) * 200,
                        rotate: Math.random() * 360
                    }}
                    transition={{
                        duration: 2.5 + Math.random(),
                        delay: 0.1 + (i * 0.05),
                        ease: "easeOut"
                    }}
                    className="absolute w-32 h-32 bg-slate-400/30 rounded-full blur-2xl"
                />
            ))}

            {/* 4. Dust/Debris Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`spark-${i}`}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                        x: (Math.random() - 0.5) * 600,
                        y: (Math.random() - 0.5) * 500,
                        opacity: 0,
                        scale: 0
                    }}
                    transition={{
                        duration: 1 + Math.random(),
                        delay: Math.random() * 0.2,
                        ease: "circOut"
                    }}
                    className={`absolute w-1 h-1 ${Math.random() > 0.5 ? 'bg-orange-400' : 'bg-slate-300'} rounded-full`}
                />
            ))}

            {/* 5. Central Impact Glow */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 3 }}
                className="absolute w-[800px] h-[400px] bg-red-600/10 blur-[100px] pointer-events-none"
            />
        </div>
    );
}
