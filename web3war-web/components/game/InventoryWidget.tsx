'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { Package, Zap, Swords, Info, Coins, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/Button';
import { motion, AnimatePresence } from 'framer-motion';

export function InventoryWidget() {
    const { inventory, useItem, fetchInventory } = useGameStore();
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'food' | 'weapon' | 'material'>('all');

    const filteredInventory = (inventory || []).filter(item => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    const categories = [
        { id: 'all', label: 'All', icon: <Package size={12} /> },
        { id: 'food', label: 'Food', icon: <Zap size={12} /> },
        { id: 'weapon', label: 'Weapons', icon: <Swords size={12} /> },
        { id: 'material', label: 'Materials', icon: <Package size={12} /> },
    ];

    return (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg flex flex-col h-[480px]">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Package size={16} className="text-cyan-400" /> Inventory
                </h3>
                <button
                    onClick={() => fetchInventory()}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-cyan-400 transition-all"
                >
                    <motion.div whileTap={{ rotate: 180 }}>↻</motion.div>
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex bg-slate-900/30 p-1 gap-1 border-b border-slate-700/30 shrink-0">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all ${filter === cat.id
                            ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
                            }`}
                    >
                        {cat.icon}
                        <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-3 scrollbar-hide bg-slate-900/20">
                <div className="grid grid-cols-2 gap-2 pb-2">
                    <AnimatePresence mode='popLayout'>
                        {filteredInventory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-2 py-12 text-center"
                            >
                                <div className="text-3xl opacity-20 mb-2">📦</div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                                    No {filter !== 'all' ? filter : ''} items
                                </p>
                            </motion.div>
                        ) : (
                            filteredInventory.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                    key={item.id}
                                    className="relative p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 group hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all shadow-sm"
                                >
                                    {/* Item Header (Image & Quality) */}
                                    <div className="flex justify-between items-start mb-1.5">
                                        <div className="w-10 h-10 bg-slate-900/60 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            {item.image}
                                        </div>
                                        <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border ${(item.quality || 1) >= 4 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                            (item.quality || 1) >= 2 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                                                'bg-slate-700/50 border-slate-600 text-slate-400'
                                            }`}>
                                            Q{item.quality || 1}
                                        </div>
                                    </div>

                                    {/* Item Info */}
                                    <div className="text-[10px] font-black text-white truncate mb-0.5">{item.name}</div>
                                    <div className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Quantity: {item.quantity}</div>

                                    {/* Actions */}
                                    <div className="flex gap-1.5">
                                        {item.type === 'food' && (
                                            <button
                                                className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 shadow-lg border border-emerald-400/30"
                                                onClick={() => useItem(item.id)}
                                            >
                                                <Zap size={10} fill="currentColor" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">EAT</span>
                                            </button>
                                        )}
                                        <button
                                            className="flex-1 h-7 bg-slate-700 hover:bg-amber-600/80 text-white rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 border border-slate-600/50"
                                            onClick={() => router.push(`/market?view=sell&item=${item.id}`)}
                                        >
                                            <Coins size={10} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">SELL</span>
                                        </button>
                                    </div>

                                    {/* Hover Details overlay */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-1 bg-slate-900 rounded-md border border-slate-700">
                                            <Info size={8} className="text-cyan-400" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50 text-center shrink-0">
                <button className="text-[9px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
                    Manage All Assets <ChevronRight size={10} />
                </button>
            </div>
        </div>
    );
}
