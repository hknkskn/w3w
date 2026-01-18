'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Company, COMPANY_TYPES_CONFIG } from '@/lib/types';
import { Button } from '@/components/Button';
import {
    Users,
    ArrowRightLeft,
    Package,
    History,
    Settings,
    TrendingUp,
    Coins,
    Swords,
    ChevronRight,
    Search,
    PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyManagerProps {
    company: Company;
}

export function CompanyManager({ company }: CompanyManagerProps) {
    const { withdrawCompanyProduct, depositCompanyRaw, inventory } = useGameStore();
    const [view, setView] = useState<'overview' | 'logistics' | 'employees'>('overview');

    const config = COMPANY_TYPES_CONFIG[company.type];
    const isMfg = company.type.includes('MFG');

    return (
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col h-full shadow-2xl">
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-700/50 bg-slate-900/40">
                <button
                    onClick={() => setView('overview')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${view === 'overview' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setView('logistics')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${view === 'logistics' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Logistics
                </button>
                <button
                    onClick={() => setView('employees')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${view === 'employees' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    HR & Jobs
                </button>
            </div>

            <div className="p-6 flex-1 h-[450px] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {view === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Production Status */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-[10px] text-slate-500 font-black uppercase">Internal Stocks</div>
                                        <div className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-black text-cyan-400 border border-cyan-500/20">Q{company.quality}</div>
                                    </div>
                                    <div className="flex items-end justify-between font-mono">
                                        <div>
                                            <div className="text-2xl font-black text-white">{company.productStock || 0}</div>
                                            <div className="text-[10px] text-cyan-500 font-bold uppercase">{config.output}</div>
                                        </div>
                                        {isMfg && (
                                            <div className="text-right">
                                                <div className="text-xl font-black text-amber-500">{company.rawStock || 0}</div>
                                                <div className="text-[10px] text-amber-600 font-bold uppercase">{config.input}</div>
                                            </div>
                                        )}
                                    </div>
                                    {(() => {
                                        const upgradeCosts: Record<number, number> = { 1: 2500, 2: 5000, 3: 10000, 4: 20000 };
                                        const cost = upgradeCosts[company.quality];
                                        return (
                                            <Button
                                                onClick={() => useGameStore.getState().upgradeCompanyQuality(company.id)}
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 w-full h-8 text-[10px] border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 font-black tracking-widest"
                                                disabled={company.quality >= 5}
                                            >
                                                <TrendingUp size={12} className="mr-2" />
                                                {company.quality >= 5 ? 'MAX QUALITY' : `UPGRADE TO Q${company.quality + 1} (${cost}.0 SUPRA)`}
                                            </Button>
                                        );
                                    })()}
                                </div>
                                <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/30">
                                    <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Treasury Funds</div>
                                    <div className="text-2xl font-black text-emerald-400 font-mono">
                                        {company.funds.toFixed(2)} CRED
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-2 h-7 text-[9px] border-emerald-500/20 text-emerald-400">
                                        <PlusCircle size={10} className="mr-1" /> Deposit Funds
                                    </Button>
                                    <p className="text-[8px] text-slate-500 mt-3 italic uppercase font-bold">Needed for daily salaries</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <StatCard icon={<TrendingUp size={16} className="text-emerald-400" />} label="Daily Produ." value="+120u" />
                                <StatCard icon={<Users size={16} className="text-cyan-400" />} label="Employees" value={company.employees.length.toString()} />
                                <StatCard icon={<Coins size={16} className="text-amber-400" />} label="Avg. Salary" value={`${company.jobOffer?.salary || 0} CRED`} />
                            </div>
                        </motion.div>
                    )}

                    {view === 'logistics' && (
                        <motion.div
                            key="logistics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-cyan-500/5 rounded-xl border border-cyan-500/20 p-4">
                                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <ArrowRightLeft size={14} /> Logistics Management
                                </h4>

                                <div className="space-y-4">
                                    {/* Withdraw Product */}
                                    <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
                                        <div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase">Ready for Shipment</div>
                                            <div className="text-sm font-bold text-white">{company.productStock || 0} units of {config.output}</div>
                                        </div>
                                        <Button
                                            onClick={() => withdrawCompanyProduct(company.id, 10)}
                                            disabled={(company.productStock || 0) < 10}
                                            className="bg-cyan-600 hover:bg-cyan-500 h-9 px-4 text-xs"
                                        >
                                            Withdraw 10
                                        </Button>
                                    </div>

                                    {/* Deposit Raw (Only for MFG) */}
                                    {isMfg && (
                                        <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
                                            <div>
                                                <div className="text-[10px] text-slate-500 font-black uppercase">Input Needed ({config.input})</div>
                                                <div className="text-sm font-bold text-amber-500">
                                                    {inventory.find(i => i.name.toLowerCase() === config.input?.toLowerCase())?.quantity || 0} units in inventory
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    const raw = inventory.find(i => i.name.toLowerCase() === config.input?.toLowerCase());
                                                    if (raw) {
                                                        depositCompanyRaw(company.id, raw.id, 10);
                                                    } else {
                                                        alert(`You need ${config.input} to deposit!`);
                                                    }
                                                }}
                                                variant="outline"
                                                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-9 px-4 text-xs"
                                            >
                                                Deposit 10
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {view === 'employees' && (
                        <motion.div
                            key="employees"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-slate-900/60 rounded-xl border border-slate-700/30 p-4">
                                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Users size={14} /> Workforce ({company.employees.length})
                                </h4>

                                {company.employees.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {company.employees.map((emp, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs">
                                                <span className="font-mono text-slate-300">{String(emp).slice(0, 8)}...{String(emp).slice(-4)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-xs italic">No employees yet</p>
                                )}
                            </div>

                            {/* Resign Button - Only show if owner is employed here */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Leave Job</h4>
                                <p className="text-[10px] text-slate-400 mb-3">If you are employed at this company, you can resign. This action is irreversible.</p>
                                <Button
                                    onClick={() => useGameStore.getState().resignJob()}
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-9 text-xs w-full"
                                >
                                    RESIGN FROM JOB
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{label}</div>
            </div>
            <div className="text-sm font-bold text-white">{value}</div>
        </div>
    );
}

