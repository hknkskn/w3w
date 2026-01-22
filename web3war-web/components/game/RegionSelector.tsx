'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { TerritoryService, RegionData } from '@/lib/services/territory.service';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
    X,
    Target,
    Lock,
    Shield,
    Swords,
    AlertTriangle,
    CheckCircle2,
    Users,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RegionSelectorProps {
    targetCountryId: number;
    onSelect: (regionId: number) => void;
    onClose: () => void;
    isResistance?: boolean;
}

export function RegionSelector({ targetCountryId, onSelect, onClose, isResistance = false }: RegionSelectorProps) {
    const [regions, setRegions] = useState<RegionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
    const { user, declareWar, startResistanceWar } = useGameStore();

    useEffect(() => {
        async function loadRegions() {
            setLoading(true);
            const all = await TerritoryService.getAllRegions();
            // Filter regions: 
            // - If normal war: regions owned by target country
            // - If resistance: regions where originalOwner is my country but current owner is someone else
            const filtered = all.filter(r => {
                if (isResistance) {
                    return r.originalOwner === user?.countryId && r.ownerCountry !== user?.countryId;
                }
                return r.ownerCountry === targetCountryId;
            });
            setRegions(filtered);
            setLoading(false);
        }
        loadRegions();
    }, [targetCountryId, isResistance, user?.countryId]);

    const handleConfirm = async () => {
        if (!selectedRegion) return;

        if (isResistance) {
            await startResistanceWar(selectedRegion);
        } else {
            await declareWar(user?.countryId || 1, targetCountryId, selectedRegion);
        }
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isResistance ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}>
                            {isResistance ? <Zap className="w-5 h-5 text-red-500" /> : <Target className="w-5 h-5 text-indigo-500" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-wider">
                                {isResistance ? 'Ignite Resistance' : 'Select Target Region'}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                Strategic Command Interface
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <Target className="w-8 h-8 text-slate-700 animate-spin" />
                            <p className="text-slate-500 text-xs font-bold uppercase">Scanning Territory...</p>
                        </div>
                    ) : regions.length === 0 ? (
                        <div className="p-12 text-center space-y-4">
                            <AlertTriangle className="w-12 h-12 text-slate-800 mx-auto" />
                            <p className="text-slate-400 font-medium italic">No regions found matching criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {regions.map((region) => (
                                <RegionCard
                                    key={region.id}
                                    region={region}
                                    isSelected={selectedRegion === region.id}
                                    onSelect={() => setSelectedRegion(region.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Operation Cost:</span>
                            <span className="text-lg font-black text-white italic">
                                {isResistance ? '250,000' : '1,000,000'} <span className="text-indigo-500">CRED</span>
                            </span>
                        </div>
                        <p className="text-[9px] text-slate-600 max-w-[300px]">
                            Funds will be deducted from your {isResistance ? 'personal wallet' : 'national treasury'}.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="ghost" onClick={onClose} className="flex-1 md:flex-none uppercase tracking-widest text-[10px] font-black">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedRegion}
                            className={`flex-1 md:px-8 uppercase tracking-widest text-[10px] font-black ${isResistance
                                    ? 'bg-red-600 hover:bg-red-500 shadow-red-900/40'
                                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'
                                } shadow-lg`}
                        >
                            {isResistance ? 'Start Revolution' : 'Declare War'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function RegionCard({ region, isSelected, onSelect }: { region: RegionData, isSelected: boolean, onSelect: () => void }) {
    // Note: In real setup, we'd check if region is locked via BattleService
    const [isLocked, setIsLocked] = useState(false);

    return (
        <Card
            onClick={onSelect}
            className={`relative cursor-pointer transition-all duration-300 p-4 border-2 ${isSelected
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h4 className="font-black text-white text-sm uppercase italic">{region.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                        <Users className="w-3 h-3" />
                        <span>{region.population.toLocaleString()} Units</span>
                    </div>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800/50">
                    <p className="text-[8px] text-slate-600 font-bold uppercase mb-1 tracking-tighter">Status</p>
                    <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className={`text-[9px] font-black uppercase ${isLocked ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isLocked ? 'Active War' : 'Available'}
                        </span>
                    </div>
                </div>
                <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800/50 text-right">
                    <p className="text-[8px] text-slate-600 font-bold uppercase mb-1 tracking-tighter">Target ID</p>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">#{region.id}</span>
                </div>
            </div>

            {isLocked && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-1">
                        <Lock className="w-5 h-5 text-slate-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">Region Locked</span>
                    </div>
                </div>
            )}
        </Card>
    );
}
