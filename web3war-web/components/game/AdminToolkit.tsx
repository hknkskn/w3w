'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import { Shield, Zap, Coins, User, Loader2, Package, Crosshair, Hammer, Wheat } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminToolkit() {
    const { user, mintCredits, addEnergy } = useGameStore();
    const [isLoading, setIsLoading] = useState(false);
    const [targetAddr, setTargetAddr] = useState(user?.walletAddress || '');

    if (!user?.isAdmin) return null;

    const handleMint = async (amount: number) => {
        setIsLoading(true);
        try {
            await mintCredits(targetAddr, amount);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnergy = async (amount: number) => {
        setIsLoading(true);
        try {
            await addEnergy(targetAddr, amount);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <Shield size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Admin Toolkit</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Authorized Debug & Testing Tools</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] text-slate-500 font-black uppercase mb-1.5 ml-1">Target Address</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            type="text"
                            value={targetAddr}
                            onChange={(e) => setTargetAddr(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-cyan-500 focus:border-cyan-500/50 outline-none transition-all"
                            placeholder="0x..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-[10px] text-slate-500 font-black uppercase ml-1">CRED Management</div>
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 text-[10px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-black"
                                onClick={() => handleMint(1000)}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={12} /> : <Coins size={12} className="mr-2" />}
                                +1,000 CRED
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 text-[10px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-black"
                                onClick={() => handleMint(10000)}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={12} /> : <Coins size={12} className="mr-2" />}
                                +10,000 CRED
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-[10px] text-slate-500 font-black uppercase ml-1">Energy Injection</div>
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 text-[10px] border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-black"
                                onClick={() => handleEnergy(100)}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={12} /> : <Zap size={12} className="mr-2" />}
                                +100 ENERGY
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 text-[10px] border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-black"
                                onClick={() => handleEnergy(200)}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={12} /> : <Zap size={12} className="mr-2" />}
                                REFILL (200)
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 font-black uppercase ml-1">Item Supply</div>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-[10px] border-slate-600/30 text-slate-400 hover:bg-slate-800 font-bold"
                        onClick={() => {
                            // Food Q1 (ID: 201, Cat: 1, Q: 1)
                            const { mintItem } = useGameStore.getState();
                            mintItem(targetAddr, 201, 1, 1, 10);
                        }}
                        disabled={isLoading}
                    >
                        <Package size={12} className="mr-2" /> +10 Food Q1
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-[10px] border-slate-600/30 text-slate-400 hover:bg-slate-800 font-bold"
                        onClick={() => {
                            // Weapon Q1 (ID: 202, Cat: 2, Q: 1)
                            const { mintItem } = useGameStore.getState();
                            mintItem(targetAddr, 202, 2, 1, 5);
                        }}
                        disabled={isLoading}
                    >
                        <Crosshair size={12} className="mr-2" /> +5 Weapon Q1
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-[10px] border-slate-600/30 text-slate-400 hover:bg-slate-800 font-bold"
                        onClick={() => {
                            // Iron Ore (ID: 102, Cat: 3, Q: 1)
                            const { mintItem } = useGameStore.getState();
                            mintItem(targetAddr, 102, 3, 1, 50);
                        }}
                        disabled={isLoading}
                    >
                        <Hammer size={12} className="mr-2" /> +50 Iron
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-[10px] border-slate-600/30 text-slate-400 hover:bg-slate-800 font-bold"
                        onClick={() => {
                            // Grain (ID: 101, Cat: 3, Q: 1)
                            const { mintItem } = useGameStore.getState();
                            mintItem(targetAddr, 101, 3, 1, 50);
                        }}
                        disabled={isLoading}
                    >
                        <Wheat size={12} className="mr-2" /> +50 Grain
                    </Button>
                </div>
            </div>
        </div>

    );
}
