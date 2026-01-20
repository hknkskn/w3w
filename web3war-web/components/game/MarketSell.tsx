'use client';

import { useMarket } from '@/lib/hooks/useMarket';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Package, Tag, Plus, Minus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { IDSCard, IDSLabel } from '@/components/ui/ids';

export function MarketSell() {
    const {
        inventory,
        selectedItemId,
        selectedItem,
        form,
        methods
    } = useMarket();

    const handleList = async () => {
        try {
            await methods.handleListAction();
        } catch (e: any) {
            const { idsAlert } = useGameStore.getState();
            await idsAlert(e.message || "Failed to post listing", "Market Exchange", "error");
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 items-start">
                {/* HD Inventory Registry */}
                <div className="col-span-12 lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2 px-2">
                        <Package size={12} className="text-slate-600" />
                        <IDSLabel color="dim">Registered Inventory</IDSLabel>
                    </div>

                    <div className="grid grid-cols-1 gap-1 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.length === 0 ? (
                            <IDSCard variant="outline" className="py-20 text-center border-dashed border-slate-800">
                                <IDSLabel color="dim">No assets detected</IDSLabel>
                            </IDSCard>
                        ) : (
                            inventory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => methods.selectItem(item.id)}
                                    className={`flex items-center gap-4 px-4 py-2.5 rounded-lg border transition-all text-left group h-16 ${selectedItemId === item.id
                                        ? 'bg-amber-500/5 border-amber-500/50 shadow-inner'
                                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded flex items-center justify-center text-2xl transition-all shrink-0 ${selectedItemId === item.id ? 'bg-amber-500/10 border-amber-500/20 shadow-inner' : 'bg-slate-950 border-slate-800'}`}>
                                        {item.image}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <div className="font-black text-white text-[11px] uppercase tracking-tight truncate group-hover:text-amber-400">{item.name}</div>
                                            <span className={`text-[8px] font-black px-1 py-0.5 rounded-sm uppercase tracking-widest ${item.quality >= 5 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                                Q{item.quality}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center group-hover:text-slate-300">
                                            <IDSLabel color="dim" className="truncate">{item.category}</IDSLabel>
                                            <div className="text-[10px] font-bold font-mono text-amber-500 tabular-nums leading-none">×{item.quantity}</div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* HD Liquidation Workstation - Using IDSCard */}
                <IDSCard className="col-span-12 lg:col-span-7 flex flex-col min-h-[480px]">
                    <div className="flex items-center gap-2 mb-6">
                        <Tag size={12} className="text-slate-600" />
                        <IDSLabel color="dim">LIQUIDATION WORKSTATION</IDSLabel>
                    </div>

                    {selectedItem ? (
                        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
                            {/* Selected Header */}
                            <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
                                <div className="text-4xl">{selectedItem.image}</div>
                                <div>
                                    <div className="font-black text-white text-lg uppercase tracking-tight leading-none">{selectedItem.name}</div>
                                    <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                        Asset Quality: <span className="text-amber-500">Q{selectedItem.quality}</span>
                                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                        Category: {selectedItem.category}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Quantity Picker */}
                                <div className="space-y-3 text-center">
                                    <IDSLabel color="dim">TRADING VOLUME</IDSLabel>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => methods.updateQuantity(form.quantity - 1)}
                                            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white active:scale-95 transition-all shadow-md"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <div className="flex-1 h-10 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center font-black text-xl text-white font-mono shadow-inner">
                                            {form.quantity}
                                        </div>
                                        <button
                                            onClick={() => methods.updateQuantity(form.quantity + 1)}
                                            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white active:scale-95 transition-all shadow-md"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="text-[8px] text-slate-700 font-black uppercase tracking-widest leading-none">LOCAL STOCK: {selectedItem.quantity}</div>
                                </div>

                                {/* Price Input */}
                                <div className="space-y-3 text-center">
                                    <IDSLabel color="dim">UNIT PRICE (CRED)</IDSLabel>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => methods.updatePrice(parseFloat(e.target.value) || 0)}
                                            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-black text-xl font-mono focus:border-amber-500/40 focus:outline-none transition-all pl-12 text-center shadow-inner"
                                            step="0.01"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500 uppercase tracking-widest">CRED</span>
                                    </div>
                                    <div className="text-[8px] text-slate-700 font-black uppercase tracking-widest leading-none">AVG: 0.55 • 5% TAX</div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 mt-auto">
                                <button
                                    onClick={handleList}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg transition-all active:scale-[0.98] shadow-lg flex items-center justify-between px-6 group"
                                >
                                    <span>POST LISTING</span>
                                    <div className="flex items-center gap-1.5 text-emerald-100 font-mono text-lg">
                                        <span>{(form.price * form.quantity).toFixed(2)}</span>
                                        <span className="text-[8px] font-black">CRED</span>
                                    </div>
                                </button>
                                <p className="text-center text-[8px] text-slate-700 font-black uppercase tracking-widest mt-3">
                                    ASSETS WILL BE ESCROWED UNTIL SETTLEMENT
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-800 space-y-4 text-center">
                            <div className="w-16 h-16 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 border-dashed">
                                <Package size={32} className="opacity-10" />
                            </div>
                            <div>
                                <IDSLabel color="dim" className="tracking-[0.3em] mb-1">SYSTEM STANDBY</IDSLabel>
                                <IDSLabel color="dim" size="sm">SELECT ASSET FROM REGISTRY</IDSLabel>
                            </div>
                        </div>
                    )}
                </IDSCard>
            </div>

            {/* HD Note Panel - Using IDSCard */}
            <IDSCard className="flex gap-4 items-center bg-amber-500/5 border-amber-500/10">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <div>
                    <IDSLabel color="accent" className="mb-0.5">Escrow Directive</IDSLabel>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">
                        National taxes apply. Listing assets prevents use in combat units.
                    </p>
                </div>
            </IDSCard>
        </div>
    );
}
