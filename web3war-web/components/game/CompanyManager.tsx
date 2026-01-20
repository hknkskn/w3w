'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { CompanyProfile, COMPANY_TYPES } from '@/lib/models/CompanyModel';
import { Button } from '@/components/Button';
import {
    Users,
    Package,
    TrendingUp,
    Coins,
    Building2,
    Zap,
    Target,
    Cpu,
    Settings,
    Truck,
    LineChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyManagerProps {
    company: CompanyProfile;
}

export function CompanyManager({ company }: CompanyManagerProps) {
    const { withdrawCompanyProduct, depositCompanyRaw, inventory, depositCompanyFunds, postJob, upgradeCompanyQuality } = useGameStore();
    const [view, setView] = useState<'overview' | 'production' | 'logistics' | 'employees'>('overview');

    // Job Offer Form State - Using defaults or normalized data
    const [isPostingJob, setIsPostingJob] = useState(false);
    const [jobSalary, setJobSalary] = useState(10); // Default to 10 CRED
    const [jobPositions, setJobPositions] = useState(5);

    const typeInfo = COMPANY_TYPES[company.type];
    const isMfg = company.type >= 11;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LineChart size={14} /> },
        { id: 'production', label: 'Production', icon: <Cpu size={14} /> },
        { id: 'logistics', label: 'Logistics', icon: <Truck size={14} /> },
        { id: 'employees', label: 'Employees', icon: <Users size={14} /> },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
            {/* Minimal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center text-cyan-400">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{company.name}</h2>
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border ${company.type < 10 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
                                    {typeInfo?.name || 'Unit'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                <span>ID_{company.id}</span>
                                <span className="text-cyan-500/80">Q{company.quality} Grade</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800 text-right">
                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5 flex items-center justify-end gap-1">
                            <img src="/icons/treasury.webp" className="w-2.5 h-2.5 object-contain opacity-50" alt="" />
                            Treasury
                        </div>
                        <div className="text-lg font-mono text-emerald-400 font-bold leading-none tabular-nums">
                            {company.funds.toFixed(2)} <span className="text-[10px] opacity-50 ml-0.5">CRED</span>
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
                                <SimpleStat customIcon="/icons/warehouse.webp" label="Stock" value={company.stocks.product} unit={typeInfo?.productItem} />
                                {isMfg && <SimpleStat customIcon="/icons/energie.webp" label="Fuel" value={company.stocks.raw} unit={typeInfo?.rawItem} />}
                                <SimpleStat customIcon="/icons/workforce.webp" label="Workers" value={company.employeeCount} unit="Personnel" />
                                <SimpleStat customIcon="/icons/trainingbase.webp" label="Grade" value={`Q${company.quality}`} unit="Quality" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Coins size={14} className="text-emerald-500" />
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Liquidity</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Deposit CRED to cover salary expenses and operational maintenance.</p>
                                    <button
                                        onClick={async () => {
                                            const { idsPrompt } = useGameStore.getState();
                                            const amountStr = await idsPrompt("Enter CRED amount to deposit:", "100", "Capital Deposit");
                                            if (amountStr) {
                                                const amount = parseFloat(amountStr);
                                                if (!isNaN(amount) && amount > 0) {
                                                    depositCompanyFunds(company.id, amount);
                                                }
                                            }
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
                                        onClick={async () => {
                                            const { idsConfirm } = useGameStore.getState();
                                            const confirmed = await idsConfirm(`Upgrade to Q${company.quality + 1} for 1000.00 SUPRA?`, "Quality Upgrade");
                                            if (confirmed) upgradeCompanyQuality(company.id);
                                        }}
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
                                        <div className="text-4xl font-black text-white font-mono">{company.employeeCount}</div>
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Active Personnel</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black text-cyan-400 font-mono">{10 * company.quality * (company.employeeCount || 1)}</div>
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
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">{company.stocks.product} units stored</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        const { idsPrompt } = useGameStore.getState();
                                        const amountStr = await idsPrompt("How many units do you want to withdraw?", "10", "Inventory Withdrawal");
                                        if (amountStr) {
                                            const amount = parseInt(amountStr);
                                            if (!isNaN(amount) && amount > 0) {
                                                withdrawCompanyProduct(company.id, amount);
                                            }
                                        }
                                    }}
                                    disabled={company.stocks.product < 1}
                                    className="px-6 py-3 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all"
                                >
                                    Withdraw
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
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">{company.stocks.raw} units remaining</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const { idsAlert } = useGameStore.getState();
                                            // Using the input item name from config to find the correct item in user inventory
                                            const raw = inventory.find(i => i.name.toLowerCase() === typeInfo?.rawItem?.toLowerCase());
                                            if (raw) depositCompanyRaw(company.id, raw.id, 10);
                                            else await idsAlert(`Insufficient ${typeInfo?.rawItem} in inventory.`, "Supply Error");
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
                                        <Users size={14} /> Active Personnel ({company.employeeCount})
                                    </h4>
                                    <button
                                        onClick={() => setIsPostingJob(true)}
                                        className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Initiate Hiring
                                    </button>
                                </div>

                                {company.employees && company.employees.length > 0 ? (
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

function SimpleStat({ icon, customIcon, label, value, unit }: { icon?: any, customIcon?: string, label: string, value: any, unit?: string }) {
    return (
        <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-colors">
            <div className="text-slate-500 mb-3">
                {customIcon ? (
                    <img src={customIcon} className="w-5 h-5 object-contain opacity-60" alt="" />
                ) : icon}
            </div>
            <div className="text-2xl font-black text-white font-mono leading-none mb-1 tabular-nums">{value}</div>
            <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{unit || label}</div>
        </div>
    );
}

export default CompanyManager;
