'use client';

import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Backpack, Search, Package, Zap, Swords, Filter, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function FloatingInventory() {
    const { inventory, isInventoryOpen, toggleInventory, fetchInventory, useItem } = useGameStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'food' | 'weapon' | 'material' | 'ticket'>('all');

    const filteredInventory = (inventory || []).filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (!isInventoryOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[500] pointer-events-none">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => toggleInventory(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                />

                {/* Sidebar */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute right-4 top-20 bottom-4 w-96 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 rounded-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                                <Backpack size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Equipment</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{inventory.length} Assets Found</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchInventory()}
                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                                <RefreshCw size={18} />
                            </button>
                            <button
                                onClick={() => toggleInventory(false)}
                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Filter & Search */}
                    <div className="p-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="flex gap-2">
                            {[
                                { id: 'all', label: 'All', icon: <Package size={14} /> },
                                { id: 'food', label: 'Food', icon: <Zap size={14} /> },
                                { id: 'weapon', label: 'Armory', icon: <Swords size={14} /> },
                                { id: 'material', label: 'Goods', icon: <Filter size={14} /> },
                                { id: 'ticket', label: 'Tickets', icon: <Package size={14} /> },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id as any)}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${filter === cat.id
                                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {cat.icon}
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
                        <div className="grid grid-cols-2 gap-3">
                            {filteredInventory.length === 0 ? (
                                <div className="col-span-2 py-20 text-center text-slate-500 italic">
                                    <div className="text-4xl mb-4 opacity-20">📦</div>
                                    <p className="text-xs font-bold uppercase tracking-widest">No items matched</p>
                                </div>
                            ) : (
                                filteredInventory.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 group hover:border-cyan-500/30 hover:bg-slate-950/60 transition-all cursor-pointer relative"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                                {item.image}
                                            </div>
                                            <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${item.quality >= 5 ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
                                                item.quality >= 3 ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' :
                                                    'bg-white/5 border-white/10 text-slate-500'
                                                }`}>
                                                Q{item.quality}
                                            </div>
                                        </div>

                                        <div className="text-xs font-black text-white truncate mb-1">{item.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 mb-3">Qty: <span className="text-cyan-400">{item.quantity}</span></div>

                                        {item.type === 'food' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    useItem(item.id);
                                                }}
                                                className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all border border-emerald-500/20"
                                            >
                                                CONSUME
                                            </button>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Total Weight: UNKNOWN</span>
                        <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest cursor-pointer hover:text-cyan-400 transition-colors">Go to Vault ›</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
