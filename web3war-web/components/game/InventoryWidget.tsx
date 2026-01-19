'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { Package, Zap, Swords, Info, Coins, ChevronRight, Filter, Search } from 'lucide-react';
import { Button } from '@/components/Button';
import { motion, AnimatePresence } from 'framer-motion';

export function InventoryWidget() {
    const { inventory, useItem, fetchInventory } = useGameStore();
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'food' | 'weapon' | 'material' | 'ticket'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const filteredInventory = (inventory || []).filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const categories = [
        { id: 'all', label: 'All', icon: <Package size={14} /> },
        { id: 'food', label: 'Food', icon: <Zap size={14} /> },
        { id: 'weapon', label: 'Armory', icon: <Swords size={14} /> },
        { id: 'material', label: 'Goods', icon: <Package size={14} /> },
    ];

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex flex-col h-[480px]">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900/60 border-b border-white/5 flex justify-between items-center shrink-0">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                    Tactical Assets
                </h3>
                <button
                    onClick={() => fetchInventory()}
                    className="p-1 px-3 bg-white/5 hover:bg-cyan-500/10 rounded-lg text-slate-500 hover:text-cyan-400 text-[10px] font-black transition-all border border-white/5"
                >
                    SYNC
                </button>
            </div>

            {/* Controls Bar */}
            <div className="px-4 py-3 space-y-3 bg-slate-900/20 border-b border-white/5">
                <div className="relative group">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH INVENTORY..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/50 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all uppercase tracking-wider"
                    />
                </div>

                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${filter === cat.id
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                : 'text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'
                                }`}
                        >
                            {cat.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-slate-950/20">
                <div className="grid grid-cols-4 gap-2 pb-2">
                    <AnimatePresence mode='popLayout'>
                        {filteredInventory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-4 py-24 text-center opacity-20"
                            >
                                <Package size={32} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Vault Empty</p>
                            </motion.div>
                        ) : (
                            filteredInventory.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={item.id}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all cursor-crosshair group overflow-hidden ${(item.quality || 1) >= 5 ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.05)]' :
                                            (item.quality || 1) >= 3 ? 'border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.05)]' :
                                                'border-white/5 bg-slate-900/50 hover:bg-slate-800'
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        {item.image}
                                    </div>

                                    {/* Small Quantity Badge */}
                                    <div className="absolute bottom-1 right-1.5 px-1 bg-slate-950/80 rounded-sm text-[9px] font-black font-mono text-white/80 border border-white/5">
                                        {item.quantity}
                                    </div>

                                    {/* Quality Indicator Dot */}
                                    <div className={`absolute top-1 right-1.5 w-1 h-1 rounded-full ${(item.quality || 1) >= 5 ? 'bg-amber-400' :
                                            (item.quality || 1) >= 3 ? 'bg-cyan-400' :
                                                'bg-slate-600'
                                        }`}></div>

                                    {/* Compact Hover Details Overlay */}
                                    <AnimatePresence>
                                        {hoveredItem === item.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-2 z-50 overflow-hidden"
                                            >
                                                <div className="text-[7px] font-black text-cyan-400 uppercase tracking-tighter text-center line-clamp-1 mb-1">{item.name}</div>
                                                <div className="flex flex-col gap-1 w-full">
                                                    {item.type === 'food' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); useItem(item.id); }}
                                                            className="w-full py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-md text-[7px] font-black uppercase transition-colors border border-emerald-500/30"
                                                        >
                                                            USE
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.push(`/market?view=sell&item=${item.id}`); }}
                                                        className="w-full py-1 bg-white/5 hover:bg-cyan-500 text-slate-300 hover:text-white rounded-md text-[7px] font-black uppercase transition-colors border border-white/10"
                                                    >
                                                        OFFER
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Interaction Note */}
            <div className="px-4 py-2 bg-slate-950/50 flex items-center gap-2 border-t border-white/5 shrink-0">
                <Info size={10} className="text-slate-600" />
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter italic">Hover for specs & quick actions</span>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-slate-900/60 border-t border-white/5 text-center shrink-0">
                <button
                    onClick={() => router.push('/inventory')}
                    className="w-full h-10 bg-white/5 hover:bg-white/10 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2"
                >
                    ENTER VAULT <ChevronRight size={12} className="text-cyan-400" />
                </button>
            </div>
        </div>
    );
}

