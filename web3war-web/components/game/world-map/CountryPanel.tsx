'use client';

import { motion } from 'framer-motion';
import { Users, Shield, Coins, Swords, Plane } from 'lucide-react';
import { Button } from '@/components/Button';
import { CountryId, COUNTRY_CONFIG, Battle } from '@/lib/types';

interface CountryPanelProps {
    countryId: CountryId;
    numericCode?: string;
    activeBattles: Battle[];
    onClose: () => void;
    onTravel?: () => void;
    onDeclareWar?: () => void;
}

export function CountryPanel({
    countryId,
    numericCode,
    activeBattles,
    onClose,
    onTravel,
    onDeclareWar
}: CountryPanelProps) {
    const countryInfo = COUNTRY_CONFIG[countryId];
    if (!countryInfo) return null;

    const countryBattles = activeBattles.filter((b: Battle) =>
        b.defender === countryId || b.attacker === countryId
    );
    const isConflictZone = countryBattles.length > 0;

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-72 bg-slate-900/95 backdrop-blur-md rounded-xl overflow-hidden border border-slate-700 shadow-2xl"
        >
            {/* Header */}
            <div
                className="p-4 border-b border-slate-700"
                style={{ background: `linear-gradient(135deg, ${countryInfo.color}33, ${countryInfo.color}11)` }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={countryInfo.flag} alt={countryInfo.name} className="w-8 h-5 object-cover rounded shadow-sm border border-white/10" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{countryInfo.name}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-2 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-white/5 rounded">ID: {countryId}</span>
                    {numericCode && <span className="px-1.5 py-0.5 bg-white/5 rounded">ISO: {numericCode}</span>}
                </div>
            </div>

            {/* Stats - These will connect to on-chain data */}
            <div className="p-4 space-y-3">
                <StatRow icon={<Users size={14} />} label="Citizens" value="--" color="cyan" />
                <StatRow icon={<Shield size={14} />} label="Defense" value="--" color="emerald" />
                <StatRow icon={<Coins size={14} />} label="Tax Rate" value="--" color="amber" />
                <StatRow icon={<Swords size={14} />} label="Active Wars" value={countryBattles.length.toString()} color="red" />
            </div>

            {/* Defense Bar */}
            <div className="px-4 pb-4">
                <div className="text-xs text-slate-400 mb-2">Territory Defense</div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                        initial={{ width: 0 }}
                        animate={{ width: `50%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-700 space-y-2">
                <Button
                    onClick={onTravel}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 gap-2 font-black uppercase text-xs"
                >
                    <Plane size={14} /> Travel Here
                </Button>
                <Button
                    onClick={onDeclareWar}
                    variant="outline"
                    className={`w-full gap-2 font-black uppercase text-xs ${isConflictZone ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}
                >
                    <Swords size={14} /> {isConflictZone ? 'Join Battle' : 'Declare War'}
                </Button>
            </div>
        </motion.div>
    );
}

function StatRow({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    const colorMap: Record<string, string> = {
        cyan: 'text-cyan-400 bg-cyan-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
        red: 'text-red-400 bg-red-500/10',
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
                <span className={colorMap[color]}>{icon}</span>
                <span className="text-xs">{label}</span>
            </div>
            <span className={`text-sm font-bold ${colorMap[color].split(' ')[0]}`}>{value}</span>
        </div>
    );
}

export default CountryPanel;
