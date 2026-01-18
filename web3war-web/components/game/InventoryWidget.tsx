'use client';

import { useGameStore } from '@/lib/store';
import { Package, Zap, Swords, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { motion, AnimatePresence } from 'framer-motion';

export function InventoryWidget() {
    const { inventory, useItem } = useGameStore();

    return (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={14} className="text-cyan-400" /> Inventory
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => useGameStore.getState().fetchInventory()} className="text-[10px] text-slate-500 hover:text-white transition-colors">
                        ↻
                    </button>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{inventory.length} Slots</span>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                    <AnimatePresence mode='popLayout'>
                        {inventory.length === 0 ? (
                            <div className="col-span-2 py-8 text-center text-slate-500 text-xs italic">
                                No items in inventory
                            </div>
                        ) : (
                            inventory.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    key={item.id}
                                    className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/50 group hover:border-cyan-500/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-2xl group-hover:scale-110 transition-transform">{item.image}</div>
                                        <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-1 py-0.5 rounded uppercase">
                                            Q{item.quality}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="text-[10px] font-black text-cyan-500">x{item.quantity}</div>
                                        <Button
                                            size="sm"
                                            className="h-6 px-2 text-[10px] bg-slate-700 hover:bg-cyan-600 border-none"
                                            onClick={() => useItem(item.id)}
                                        >
                                            {item.type === 'food' ? <Zap size={10} className="mr-1" /> : <Info size={10} className="mr-1" />}
                                            {item.type === 'food' ? 'EAT' : 'USE'}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="px-4 py-2 bg-slate-900/30 text-center">
                <button className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-tighter transition-colors">
                    Open Full Storage ▸
                </button>
            </div>
        </div>
    );
}
