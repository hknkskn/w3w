'use client';

import { useGameStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Package, Zap, Swords, Filter, RefreshCw, PlusCircle, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryPage() {
    const { user, inventory, fetchInventory, initInventory, useItem } = useGameStore();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'weapon' | 'material' | 'ticket'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    const categories = [
        { id: 'all', name: 'All Assets', icon: <img src="/icons/inventory.webp" className="w-5 h-5 object-contain" alt="" /> },
        { id: 'weapon', name: 'Armory', icon: <img src="/icons/weapon.webp" className="w-5 h-5 object-contain" alt="" /> },
        { id: 'food', name: 'Consumables', icon: <img src="/icons/food.webp" className="w-5 h-5 object-contain" alt="" /> },
        { id: 'material', name: 'Raw Goods', icon: <img src="/icons/warehouse.webp" className="w-5 h-5 object-contain" alt="" /> },
        { id: 'ticket', name: 'Access Keys', icon: <img src="/icons/inventory.webp" className="w-5 h-5 object-contain" alt="" /> },
    ];

    const filteredInventory = (inventory || []).filter(item => {
        // Map category ID to type for filtering (Aligned with ITEMS_CATALOG.md)
        const type = item.category === 1 ? 'food' : item.category === 2 ? 'weapon' : item.category === 4 ? 'ticket' : 'material';
        const matchesFilter = selectedCategory === 'all' || type === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (!user) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-2">

            {/* Search Bar */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by asset name or property..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border-2 border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 backdrop-blur-sm"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 p-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Categories</h3>
                        <nav className="space-y-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id as any)}
                                    className={`w-full text-left px-4 py-3 text-sm font-bold rounded-lg transition-all flex items-center gap-3 ${selectedCategory === cat.id
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    {cat.icon}
                                    {cat.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Assets Table */}
                <div className="lg:col-span-4">
                    <div className="bg-slate-800/20 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <div className="col-span-6">Asset Specification</div>
                            <div className="col-span-2">Quality</div>
                            <div className="col-span-2">Quantity</div>
                            <div className="col-span-2 text-right">Operations</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/5 min-h-[400px]">
                            {filteredInventory.length === 0 ? (
                                <div className="py-24 text-center">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-700 opacity-20">
                                        <Package size={24} />
                                    </div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Vault Sector Empty</p>
                                </div>
                            ) : (
                                filteredInventory.map((item) => {
                                    const uId = `${item.id}-${item.category}-${item.quality}`;
                                    const type = item.category === 1 ? 'food' : item.category === 2 ? 'weapon' : item.category === 4 ? 'ticket' : 'material';

                                    return (
                                        <motion.div
                                            key={uId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <div className="col-span-6 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform border border-white/5 overflow-hidden p-2">
                                                    {item.image.startsWith('/') ? (
                                                        <img src={item.image} className="w-full h-full object-contain filter drop-shadow-lg" alt="" />
                                                    ) : (
                                                        <span className="text-2xl filter drop-shadow-lg">{item.image}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-0.5">
                                                        ID: #{item.id} • Registered Asset
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black border ${item.quality >= 5 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                    item.quality >= 3 ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                                                        'bg-slate-900 border-white/5 text-slate-500'
                                                    }`}>
                                                    Q{item.quality}
                                                </div>
                                            </div>

                                            <div className="col-span-2 text-white font-mono font-bold">
                                                {item.quantity.toLocaleString()}
                                            </div>

                                            <div className="col-span-2 text-right">
                                                {type === 'food' ? (
                                                    <button
                                                        onClick={() => useItem(uId)}
                                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded text-[9px] font-black uppercase transition-all border border-emerald-500/20"
                                                    >
                                                        Consume
                                                    </button>
                                                ) : (
                                                    <button className="px-3 py-1.5 bg-white/5 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[9px] font-black uppercase transition-all border border-white/5">
                                                        Details
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
