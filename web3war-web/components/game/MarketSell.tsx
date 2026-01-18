'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Package, Tag, Plus, Minus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';

export function MarketSell() {
    const searchParams = useSearchParams();
    const { inventory, listMarketItem } = useGameStore();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(1);

    useEffect(() => {
        const preSelected = searchParams.get('item');
        if (preSelected && inventory.some(i => i.id === preSelected)) {
            setSelectedItemId(preSelected);
        }
    }, [searchParams, inventory]);

    const selectedItem = inventory.find(i => i.id === selectedItemId);

    const handleList = () => {
        if (!selectedItemId || !selectedItem) return;
        if (quantity > selectedItem.quantity) return;

        listMarketItem(selectedItemId, quantity, price);
        setSelectedItemId(null);
        setQuantity(1);
        setPrice(1);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inventory Selection */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Package size={16} /> Your Inventory
                    </h3>
                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {inventory.length === 0 ? (
                            <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                                Your inventory is empty
                            </div>
                        ) : (
                            inventory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedItemId(item.id);
                                        setQuantity(1);
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all text-left group ${selectedItemId === item.id
                                        ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                        : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-2xl">{item.image}</div>
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${item.quality === 5 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            Q{item.quality}
                                        </span>
                                    </div>
                                    <div className="font-bold text-white text-sm truncate">{item.name}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase truncate">{item.type}</div>
                                    <div className="mt-2 text-xs font-black text-cyan-400">Qty: {item.quantity}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Listing Form */}
                <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border-2 border-slate-700/50 p-6 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Tag size={16} /> Create Listing
                    </h3>

                    {selectedItem ? (
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                                <div className="text-4xl">{selectedItem.image}</div>
                                <div>
                                    <div className="font-bold text-white text-lg">{selectedItem.name}</div>
                                    <div className="text-xs text-slate-500">Quality {selectedItem.quality} • {selectedItem.type.toUpperCase()}</div>
                                </div>
                            </div>

                            {/* Quantity Picker */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Quantity to Sell</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <div className="flex-1 text-center font-black text-2xl text-white">
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={() => setQuantity(Math.min(selectedItem.quantity, quantity + 1))}
                                        className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="text-[10px] text-slate-500 text-center uppercase font-bold">Max Available: {selectedItem.quantity}</div>
                            </div>

                            {/* Price Input */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Price per Unit (CRED)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Math.max(0.01, parseFloat(e.target.value) || 0))}
                                        className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white font-black text-xl focus:border-cyan-500 focus:outline-none transition-all pl-12"
                                        step="0.01"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-bold">CRED</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                    <span>Market Avg: ~0.55 ¢</span>
                                    <span className="text-amber-500 italic">5% VAT applies on sale</span>
                                </div>
                            </div>

                            <div className="pt-4 mt-auto">
                                <Button
                                    onClick={handleList}
                                    className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-lg font-black shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                                >
                                    LIST FOR {(price * quantity).toFixed(2)} CRED
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border-2 border-slate-700 border-dashed">
                                <Package size={32} opacity={0.3} />
                            </div>
                            <p className="text-sm">Select an item from your inventory<br />to start a listing</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warning / Tip */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-500 uppercase tracking-wider text-xs">Market Rules</span>
                        {useGameStore.getState().user?.citizenship && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 rounded-full border border-amber-500/30">
                                <img
                                    src={COUNTRY_CONFIG[useGameStore.getState().user?.citizenship as CountryId]?.flag}
                                    className="w-3.5 h-2 object-cover rounded shadow-sm"
                                    alt=""
                                />
                                <span className="text-[9px] font-black text-amber-200 uppercase tracking-tighter">
                                    {COUNTRY_CONFIG[useGameStore.getState().user?.citizenship as CountryId]?.name} TAX
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-amber-200/70 leading-relaxed">
                        Listing items locks them in escrow. You cannot use or trade them until the listing is sold or cancelled.
                        A sales tax (VAT) determined by your nation's governance will be deducted from your earnings.
                    </p>
                </div>
            </div>
        </div>
    );
}
