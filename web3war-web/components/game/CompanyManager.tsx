'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Company, COMPANY_TYPES_CONFIG } from '@/lib/types';
import { Button } from '@/components/Button';
import {
    Users,
    ArrowRightLeft,
    Package,
    TrendingUp,
    Coins,
    ChevronRight,
    PlusCircle,
    Building2,
    Zap,
    Target,
    Award,
    Activity,
    Cpu,
    Boxes,
    Settings,
    Truck,
    LineChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyManagerProps {
    company: Company;
}

export function CompanyManager({ company }: CompanyManagerProps) {
    const { withdrawCompanyProduct, depositCompanyRaw, inventory, depositCompanyFunds, postJob, upgradeCompanyQuality } = useGameStore();
    const [view, setView] = useState<'overview' | 'production' | 'logistics' | 'employees'>('overview');

    // Job Offer Form State
    const [isPostingJob, setIsPostingJob] = useState(false);
    const [jobSalary, setJobSalary] = useState(company.jobOffer?.salary || 10);
    const [jobPositions, setJobPositions] = useState(5);

    const config = COMPANY_TYPES_CONFIG[company.type];
    const isMfg = company.type.includes('MFG');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LineChart size={14} /> },
        { id: 'production', label: 'Production', icon: <Cpu size={14} /> },
        { id: 'logistics', label: 'Logistics', icon: <Truck size={14} /> },
        { id: 'employees', label: 'Employees', icon: <Users size={14} /> },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
            {/* Minimal Header */}
            <div className="p-8 border-b border-slate-800 bg-slate-800/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center text-cyan-400">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{company.name}</h2>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${company.type.includes('RAW') ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
                                    {config?.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <span>ID: {company.id}</span>
                                <span className="opacity-30">•</span>
                                <span>Region: {company.region}</span>
                                <span className="opacity-30">•</span>
                                <span className="text-cyan-500/80">Quality Q{company.quality}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-right min-w-[160px]">
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Treasury Balance</div>
                            <div className="text-2xl font-mono text-emerald-400 font-bold leading-none tabular-nums">
                                {company.funds.toFixed(1)} <span className="text-xs opacity-50 ml-1">CRED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Industrial Navigation Bar */}
            <div className="flex bg-slate-900/50 border-b border-slate-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id as any)}
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border-b-2 ${view === tab.id
                            ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5'
                            : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Scrollable Workspace */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
                <AnimatePresence mode="wait">
                    {view === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div className="grid grid-cols-4 gap-4">
                                <SimpleStat icon={<Package size={16} />} label="Stock" value={company.productStock || 0} unit={config?.output} />
                                {isMfg && <SimpleStat icon={<Zap size={16} />} label="Fuel" value={company.rawStock || 0} unit={config?.input} />}
                                <SimpleStat icon={<Users size={16} />} label="Workers" value={company.employees.length} unit="Personnel" />
                                <SimpleStat icon={<Target size={16} />} label="Grade" value={`Q${company.quality}`} unit="Quality" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Coins size={14} className="text-emerald-500" />
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Liquidity</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Deposit CRED to cover salary expenses and operational maintenance.</p>
                                    <button
                                        onClick={() => {
                                            const amount = prompt("Enter CRED amount to deposit:");
                                            if (amount && !isNaN(Number(amount))) depositCompanyFunds(company.id, Number(amount));
                                        }}
                                        className="w-full h-12 bg-slate-700 hover:bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        Deposit Capital
                                    </button>
                                </div>

                                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-cyan-500" />
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Facility Grade</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Upgrade quality to increase production yields and worker capacity.</p>
                                    <button
                                        onClick={() => upgradeCompanyQuality(company.id)}
                                        disabled={company.quality >= 5}
                                        className="w-full h-12 border border-slate-700 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-20 transition-all"
                                    >
                                        {company.quality >= 5 ? 'MAX GRADE' : 'INITIATE UPGRADE'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {view === 'production' && (
                        <motion.div key="production" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="p-8 bg-slate-800/40 rounded-3xl border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-8">
                                    <Cpu className="text-cyan-500" size={20} />
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Operational Efficiency</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-8">
                                    <div>
                                        <div className="text-4xl font-black text-white font-mono">{10 * company.quality}</div>
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Units / Cycle</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black text-white font-mono">{company.employees.length}</div>
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Active Slots</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black text-cyan-400 font-mono">{10 * company.quality * (company.employees.length || 1)}</div>
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Potential Output</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                    <Settings size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Yield Algorithm</span>
                                </div>
                                <code className="text-[11px] font-mono text-cyan-600/80">Output = (Quality_Multiplier * Skill_Factor) + Regional_Bonus</code>
                            </div>
                        </motion.div>
                    )}

                    {view === 'logistics' && (
                        <motion.div key="logistics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500 border border-slate-700">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase">Product Hub</h4>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">{company.productStock || 0} units stored</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => withdrawCompanyProduct(company.id, 10)}
                                    disabled={(company.productStock || 0) < 10}
                                    className="px-6 py-3 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all"
                                >
                                    Withdraw 10
                                </button>
                            </div>

                            {isMfg && (
                                <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 border border-slate-700">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase">Input Feedstock</h4>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">{company.rawStock || 0} units remaining</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const raw = inventory.find(i => i.name.toLowerCase() === config?.input?.toLowerCase());
                                            if (raw) depositCompanyRaw(company.id, raw.id, 10);
                                            else alert(`Insufficient ${config?.input} in inventory.`);
                                        }}
                                        className="px-6 py-3 bg-slate-800 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Supply 10
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {view === 'employees' && (
                        <motion.div key="employees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Users size={14} /> Active Personnel ({company.employees.length})
                                    </h4>
                                    <button
                                        onClick={() => setIsPostingJob(true)}
                                        className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        {company.jobOffer?.active ? 'Manage Offer' : 'Initiate Hiring'}
                                    </button>
                                </div>

                                {company.employees.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {company.employees.map((emp, idx) => (
                                            <div key={idx} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-slate-700">
                                                <span className="text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
                                                    {String(emp).slice(0, 10)}...{String(emp).slice(-6)}
                                                </span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center border border-dashed border-slate-800 rounded-xl">
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">No personnel registered.</p>
                                    </div>
                                )}
                            </div>

                            {isPostingJob && (
                                <div className="p-8 bg-slate-950/50 border border-emerald-500/20 rounded-2xl space-y-6">
                                    <h4 className="text-xs font-black text-emerald-400 uppercase">Employment Protocol Setup</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-slate-500 font-black uppercase">Salary (CRED)</label>
                                            <input
                                                type="number"
                                                value={jobSalary}
                                                onChange={(e) => setJobSalary(Number(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-sm outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-slate-500 font-black uppercase">Vacant Slots</label>
                                            <input
                                                type="number"
                                                value={jobPositions}
                                                onChange={(e) => setJobPositions(Number(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button className="flex-1 bg-slate-800 h-10 text-[9px] rounded-lg" onClick={() => setIsPostingJob(false)}>Cancel</Button>
                                        <Button className="flex-1 bg-emerald-600 h-10 text-[9px] rounded-lg" onClick={() => { postJob(company.id, jobSalary, jobPositions); setIsPostingJob(false); }}>Release Listing</Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function SimpleStat({ icon, label, value, unit }: { icon: any, label: string, value: any, unit?: string }) {
    return (
        <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-colors">
            <div className="text-slate-500 mb-3">{icon}</div>
            <div className="text-2xl font-black text-white font-mono leading-none mb-1 tabular-nums">{value}</div>
            <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{unit || label}</div>
        </div>
    );
}

export default CompanyManager;
