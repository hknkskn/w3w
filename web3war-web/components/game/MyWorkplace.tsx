'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Company, COMPANY_TYPES_CONFIG } from '@/lib/types';
import { Button } from '@/components/Button';
import {
    Briefcase,
    Zap,
    Clock,
    DollarSign,
    ExternalLink,
    AlertCircle,
    UserCheck,
    CheckCircle2,
    XCircle,
    ArrowRight,
    TrendingUp,
    Shield,
    Package,
    Activity,
    Factory
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyWorkplace() {
    const { user, companies, performWork, terminateContract } = useGameStore();
    const [isLoading, setIsLoading] = useState(false);

    // Find the company the user works for
    const employer = companies.find(c => {
        const userIdLower = user?.id?.toLowerCase();
        const walletLower = user?.walletAddress?.toLowerCase();
        return c.employees.some(emp =>
            emp.toLowerCase() === userIdLower ||
            emp.toLowerCase() === walletLower
        );
    });

    const handleWork = async () => {
        if (!employer) return;
        setIsLoading(true);
        try {
            await performWork(employer.id);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResign = async () => {
        if (!employer || !confirm("Are you sure you want to terminate your contract?")) return;
        setIsLoading(true);
        try {
            await terminateContract(employer.id);
        } finally {
            setIsLoading(false);
        }
    };

    if (!employer) {
        return (
            <div className="bg-slate-900/40 rounded-[2rem] border border-slate-700/50 p-20 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-700">
                    <Briefcase className="text-slate-600" size={48} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Status: Unemployed</h2>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                    You are not currently under contract with any industrial unit. Visit the Job Market to apply for open positions.
                </p>
                <Button className="mt-10 bg-cyan-600 hover:bg-cyan-500 px-10 h-14 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-cyan-900/10 transition-all active:scale-95">
                    Browse Markets
                </Button>
            </div>
        );
    }

    const config = COMPANY_TYPES_CONFIG[employer.type];

    return (
        <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Left: Employment Status Summary */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-700">
                            {employer.type.includes('RAW') ? <Package size={32} /> : <Shield size={32} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">{employer.name}</h3>
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase">
                                {config?.name}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <StatusLine icon={<Clock size={14} />} label="Contract Type" value="Active Duty" color="emerald" />
                        <StatusLine icon={<DollarSign size={14} />} label="Salary Rate" value={`${employer.jobOffer?.salary.toFixed(1)} CRED`} color="emerald" />
                        <StatusLine icon={<Activity size={14} />} label="Sector" value={employer.region} color="slate" />
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <Button
                            variant="outline"
                            onClick={handleResign}
                            disabled={isLoading}
                            className="w-full border-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl py-6 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                        >
                            Terminate Contract
                        </Button>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-500" /> Operational Protocol
                    </h4>
                    <ul className="space-y-3">
                        {['Personnel must maintain >10 energy', 'Shifts are finalized upon task completion', 'Salary is deducted from treasury reserves'].map((text, i) => (
                            <li key={i} className="flex gap-3 text-[10px] text-slate-600 font-bold leading-relaxed">
                                <span className="text-cyan-500">•</span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right: Operational Controls */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 flex-1 relative overflow-hidden flex flex-col">
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Shift Control</h3>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Initialize production task for operational yields</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Current Vitality</div>
                                    <div className="text-2xl font-mono text-cyan-400 font-bold">{user?.energy || 0} <span className="text-xs opacity-50">EY</span></div>
                                </div>
                                <div className="w-12 h-12 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-cyan-400">
                                    <Zap size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="p-8 bg-slate-800/30 rounded-3xl border border-slate-700/50 group hover:bg-slate-800/50 transition-all">
                                <TrendingUp className="text-cyan-500 mb-6" size={28} />
                                <div className="text-3xl font-black text-white font-mono leading-none mb-2">10.0</div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Efficiency Bonus</div>
                            </div>
                            <div className="p-8 bg-slate-800/30 rounded-3xl border border-slate-700/50 group hover:bg-slate-800/50 transition-all">
                                <CheckCircle2 className="text-emerald-500 mb-6" size={28} />
                                <div className="text-3xl font-black text-white font-mono leading-none mb-2">100%</div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Duty Readiness</div>
                            </div>
                        </div>

                        <button
                            onClick={handleWork}
                            disabled={isLoading || (user?.energy || 0) < 10}
                            className={`w-full h-24 rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden ${isLoading || (user?.energy || 0) < 10
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-[0.98]'
                                }`}
                        >
                            <Factory size={24} />
                            Execute Shift Task
                            <ArrowRight size={20} className="opacity-50" />
                        </button>
                    </div>

                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                        <Activity size={300} />
                    </div>
                </div>

                <div className="p-6 bg-slate-950/20 border border-slate-800/50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserCheck className="text-slate-600" size={16} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Biometric Authentication Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Encrypted Line Stable</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusLine({ icon, label, value, color }: { icon: any, label: string, value: string, color: 'emerald' | 'slate' | 'amber' }) {
    const textColors = {
        emerald: 'text-emerald-400',
        slate: 'text-slate-300',
        amber: 'text-amber-500'
    };

    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
            <div className="flex items-center gap-3">
                <span className="text-slate-600">{icon}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <span className={`text-[11px] font-mono font-bold ${textColors[color]}`}>{value}</span>
        </div>
    );
}
