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
    const [selectedQuality, setSelectedQuality] = useState(1);
    const [selectedQuantity, setSelectedQuantity] = useState(10);

    if (!user?.isAdmin) return null;

    const CATEGORIZED_ITEMS = [
        {
            name: 'Materials',
            icon: <Hammer size={12} />,
            color: 'text-slate-400',
            items: [
                { id: 101, cat: 3, name: 'Grain', icon: <Wheat size={12} /> },
                { id: 102, cat: 3, name: 'Iron', icon: <Hammer size={12} /> },
                { id: 103, cat: 3, name: 'Oil', icon: <Package size={12} /> },
                { id: 104, cat: 3, name: 'Aluminum', icon: <Shield size={12} /> },
            ]
        },
        {
            name: 'Consumables',
            icon: <Zap size={12} />,
            color: 'text-amber-500',
            items: [
                { id: 201, cat: 1, name: 'Food', icon: <Package size={12} /> },
            ]
        },
        {
            name: 'Combat',
            icon: <Crosshair size={12} />,
            color: 'text-red-500',
            items: [
                { id: 202, cat: 2, name: 'Weapon', icon: <Crosshair size={12} /> },
                { id: 204, cat: 2, name: 'Missile', icon: <Zap size={12} /> },
            ]
        },
        {
            name: 'Misc',
            icon: <Package size={12} />,
            color: 'text-cyan-500',
            items: [
                { id: 203, cat: 4, name: 'Ticket', icon: <Package size={12} /> },
            ]
        }
    ];

    const CRED_DECIMALS = 100; // CRED has 2 decimals

    const handleMint = async (amount: number) => {
        setIsLoading(true);
        try {
            // Convert display amount to on-chain amount (e.g., 50000 CR = 5000000 units)
            await mintCredits(targetAddr, amount * CRED_DECIMALS);
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

    const handleMintItem = async (itemId: number, category: number) => {
        setIsLoading(true);
        try {
            const { mintItem } = useGameStore.getState();
            await mintItem(targetAddr, itemId, category, selectedQuality, selectedQuantity);
            // Refresh inventory after mint
            const { fetchInventory } = useGameStore.getState();
            setTimeout(() => fetchInventory(), 4000);
            alert(`Item minted successfully!`);
        } catch (e: any) {
            console.error("Mint item error:", e);
            if (e?.message?.includes("initialized inventory")) {
                alert(`Error: Target user does not have an inventory initialized.\n\nThe target must either:\n1. Register as a citizen first, or\n2. Call init_inventory`);
            } else {
                alert(`Mint failed: ${e?.message || 'Unknown error'}`);
            }
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
                    <div>
                        <label className="block text-[9px] text-slate-500 font-black uppercase mb-1.5 ml-1">Mint Quality (1-5)</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(q => (
                                <button
                                    key={q}
                                    onClick={() => setSelectedQuality(q)}
                                    className={`flex-1 h-7 rounded-lg text-[10px] font-black transition-all ${selectedQuality === q
                                        ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    Q{q}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-500 font-black uppercase mb-1.5 ml-1">Mint Quantity</label>
                        <div className="flex gap-1">
                            {[10, 50, 100].map(qty => (
                                <button
                                    key={qty}
                                    onClick={() => setSelectedQuantity(qty)}
                                    className={`flex-1 h-7 rounded-lg text-[10px] font-black transition-all ${selectedQuantity === qty
                                        ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {qty}
                                </button>
                            ))}
                            <input
                                type="number"
                                value={selectedQuantity}
                                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                                className="w-12 h-7 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-center font-bold text-cyan-400 outline-none focus:border-cyan-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
                    <div className="space-y-3">
                        <div className="text-[10px] text-slate-500 font-black uppercase ml-1 flex items-center gap-2">
                            <Coins size={10} className="text-emerald-500" /> Currency & Energy
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-bold"
                                onClick={() => handleMint(50000)}
                                disabled={isLoading}
                            >
                                +50K CR
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-black shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                onClick={() => handleMint(100000)}
                                disabled={isLoading}
                            >
                                +100K CR
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-bold"
                                onClick={() => handleEnergy(100)}
                                disabled={isLoading}
                            >
                                +100 EN
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[10px] text-slate-500 font-black uppercase ml-1 flex items-center gap-2">
                            <Shield size={10} className="text-cyan-500" /> System Params
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 font-bold"
                                onClick={async () => {
                                    const { initializeGovernance } = useGameStore.getState();
                                    setIsLoading(true);
                                    try {
                                        await initializeGovernance();
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                Init Gov
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-bold"
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        const { CitizenService } = await import('@/lib/services/citizen.service');
                                        await CitizenService.initializeCoin();
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                Init Coin
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] border-amber-500/20 text-amber-400 hover:bg-amber-500/10 font-bold"
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        const { CitizenService } = await import('@/lib/services/citizen.service');
                                        await CitizenService.initInventory();
                                        alert('Inventory initialized for your wallet!');
                                    } catch (e: any) {
                                        alert(`Init Inventory failed: ${e?.message || 'Unknown error'}`);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                Init Inv
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] border-slate-700 text-slate-400 hover:bg-slate-800 font-bold"
                                onClick={() => {
                                    const { fetchInventory } = useGameStore.getState();
                                    fetchInventory();
                                }}
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-slate-800/50">
                    {CATEGORIZED_ITEMS.filter(c => c.name !== 'Misc').map(category => (
                        <div key={category.name} className="space-y-2">
                            <div className={`text-[10px] font-black uppercase ml-1 flex items-center gap-2 ${category.color}`}>
                                {category.icon} {category.name}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {category.items.map(item => (
                                    <Button
                                        key={item.id}
                                        size="sm"
                                        variant="outline"
                                        className="h-9 text-[10px] border-slate-800 bg-slate-900/40 text-slate-300 hover:border-cyan-500/50 hover:text-white font-bold justify-start px-3"
                                        onClick={() => handleMintItem(item.id, item.cat)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={12} /> : item.icon}
                                        <span className="ml-2 uppercase tracking-tighter">Mint {item.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
