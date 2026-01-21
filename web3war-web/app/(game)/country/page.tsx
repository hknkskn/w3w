'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import {
    Shield,
    Crown,
    Gavel,
    Landmark,
    TrendingUp,
    Percent,
    Database,
    ArrowRight,
    UserCircle,
    Activity,
    FileText,
    Target
} from 'lucide-react';
import {
    Card,
    StatCard,
    Label,
    Badge,
    TYPOGRAPHY,
    ActionButton,
    EmptyState,
    TabBar,
    ListItem
} from '@/lib/ui-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_CONFIG, getCountryKey } from '@/lib/types';

export default function CountryPage() {
    const {
        user,
        countryData,
        proposals,
        treasuryBalance,
        isCongressMember,
        fetchCountryData,
        fetchProposals,
        fetchTreasuryBalance,
        checkCongressMembership,
        voteOnProposal,
        createProposal
    } = useGameStore();

    const [activeTab, setActiveTab] = useState<'leadership' | 'congress'>('leadership');
    const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [population, setPopulation] = useState<number>(0);
    const countryId = user?.countryId ?? null;

    if (countryId === null) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Awaiting National Link...</p>
                </div>
            </div>
        );
    }

    const currentCountryKey = getCountryKey(countryId);
    const currentCountryConfig = COUNTRY_CONFIG[currentCountryKey];
    const currentCountryData = countryData[countryId];
    const currentTreasury = treasuryBalance[countryId] || 0;
    const selectedProposal = proposals.find(p => p.id === selectedProposalId);

    useEffect(() => {
        if (countryId) {
            fetchCountryData(countryId);
            fetchProposals();
            fetchTreasuryBalance(countryId);
            checkCongressMembership(countryId);

            // Fetch population
            import('@/lib/services/citizen.service').then(({ CitizenService }) => {
                CitizenService.getPopulation(countryId).then(setPopulation);
            });
        }
    }, [countryId]);

    if (!user) return null;

    const TABS = [
        { id: 'leadership', label: 'Leadership', icon: <Shield size={18} /> },
        { id: 'congress', label: 'Congress', icon: <Gavel size={18} /> },
    ];

    const renderLeadership = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Presidential Hero Card */}
            <Card variant="default" className="relative overflow-hidden border-2 border-slate-800 bg-slate-900/40 p-0" padding="none">
                <div className="absolute top-0 right-0 p-4">
                    {user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase() ? (
                        <Badge variant="cyan">
                            YOUR ADMINISTRATION
                        </Badge>
                    ) : (
                        <Badge variant="default">EXECUTIVE OFFICE</Badge>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center shadow-2xl relative z-10">
                            <Shield className="text-cyan-500" size={48} />
                        </div>
                        <div className="absolute -top-3 -right-3 z-20 bg-amber-500 rounded-full p-2 shadow-lg border-2 border-slate-900">
                            <Crown size={20} className="text-slate-950" />
                        </div>
                        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-2">Current Executive Authority</div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic">
                            {currentCountryData?.president ? (
                                user?.address?.toLowerCase() === currentCountryData.president?.toLowerCase() ? user.username : "Active President"
                            ) : "Vacant Seat"}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
                                <Activity size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-mono text-slate-400">{currentCountryData?.president || "0x000...000"}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
                                <Database size={14} className="text-amber-500" />
                                <span className="text-[10px] font-mono text-slate-400">{currentTreasury.toLocaleString()} CRED</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-slate-600 uppercase">Approval Rating</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase">94%</span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[94%]" />
                            </div>
                        </div>
                        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-slate-600 uppercase">National Stability</span>
                                <span className="text-[9px] font-black text-cyan-500 uppercase">98%</span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[98%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="INCOME TAX"
                    value={currentCountryData?.incomeTax || 0}
                    unit="%"
                    icon={<Percent className="text-emerald-400" />}
                />
                <StatCard
                    label="IMPORT TAX"
                    value={currentCountryData?.importTax || 0}
                    unit="%"
                    icon={<TrendingUp className="text-amber-400" />}
                />
                <StatCard
                    label="VAT RATE"
                    value={currentCountryData?.vat || 0}
                    unit="%"
                    icon={<Activity className="text-rose-400" />}
                />
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7">
                    <Card>
                        <div className="flex items-center gap-2 mb-6 text-cyan-400">
                            <Landmark size={20} />
                            <span className={TYPOGRAPHY.h2}>Country Overview</span>
                        </div>
                        <div className="space-y-6">
                            <div className="flex border-b border-slate-800 pb-6 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-10 bg-slate-800 rounded-md overflow-hidden border border-slate-700">
                                        <img src={currentCountryConfig.flag} alt={currentCountryConfig.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{currentCountryConfig.fullName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="cyan">ESTABLISHED</Badge>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: CTR-{countryId.toString().padStart(2, '0')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Stability Index</div>
                                    <div className="text-xl font-black text-emerald-400 tracking-tighter">98.4%</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <Label size="tiny">Government Type</Label>
                                    <div className="text-sm font-bold text-slate-200 mt-1 uppercase">Presidential</div>
                                </div>
                                <div>
                                    <Label size="tiny">Capital Region</Label>
                                    <div className="text-sm font-bold text-slate-200 mt-1 uppercase">{currentCountryConfig.capital}</div>
                                </div>
                                <div>
                                    <Label size="tiny">Active Population</Label>
                                    <div className="text-sm font-bold text-slate-200 mt-1 uppercase">
                                        {population.toLocaleString()} <span className="text-[10px] text-slate-500 ml-1">Citizens</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Label size="tiny">Economic Directives</Label>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge>High Growth</Badge>
                                    <Badge>Protected Market</Badge>
                                    <Badge>Active Stimulus</Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-5">
                    <Card>
                        <div className="flex items-center gap-2 mb-6 text-cyan-400">
                            <Activity size={20} />
                            <span className={TYPOGRAPHY.h2}>Executive Cabinet</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { role: 'Minister of Finance', unit: 'TREA-01', status: 'ACTIVE' },
                                { role: 'Minister of Defense', unit: 'MIL-04', status: 'ACTIVE' },
                                { role: 'Foreign Affairs', unit: 'DIPL-02', status: 'STANDBY' }
                            ].map((cab, idx) => (
                                <div key={idx} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between border-l-2 border-l-cyan-500/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                            <UserCircle size={16} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cab.unit}</div>
                                            <div className="text-xs font-bold text-white uppercase">{cab.role}</div>
                                        </div>
                                    </div>
                                    <Badge variant={cab.status === 'ACTIVE' ? 'emerald' : 'default'}>{cab.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );

    const renderCongress = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-12 gap-6"
        >
            <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Gavel size={14} className="text-cyan-500" />
                        Legislative Queue
                    </h2>
                    <Badge>{proposals.filter(p => p.countryId === countryId).length} ACTIVE</Badge>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {proposals.filter(p => p.countryId === countryId).length > 0 ? (
                        proposals.filter(p => p.countryId === countryId).sort((a, b) => b.id - a.id).map((prop) => (
                            <ListItem
                                key={prop.id}
                                selected={selectedProposalId === prop.id}
                                onClick={() => setSelectedProposalId(prop.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PROP-{prop.id.toString().padStart(4, '0')}</div>
                                        <div className="text-sm font-black text-white uppercase mt-1">
                                            {prop.type === 1 ? 'Tax Adjustment' : 'Treasury Grant'}
                                        </div>
                                    </div>
                                    <Badge variant={prop.executed ? 'emerald' : 'cyan'}>
                                        {prop.executed ? 'EXECUTED' : 'VOTING'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                            style={{ width: `${(prop.yesVotes / (prop.yesVotes + prop.noVotes || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                        {prop.yesVotes} / {prop.noVotes}
                                    </span>
                                </div>
                            </ListItem>
                        ))
                    ) : (
                        <EmptyState
                            icon={<FileText />}
                            title="No Active Proposals"
                            description="Congress has no pending legislative motions for this cycle."
                        />
                    )}
                </div>

                {isCongressMember && (
                    <ActionButton icon={<Target />} variant="primary" label="SUBMIT NEW DIRECTIVE" />
                )}
            </div>

            <div className="col-span-12 lg:col-span-8">
                {selectedProposal ? (
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <FileText size={20} />
                                <span className={TYPOGRAPHY.h2}>{`Motion Details: ${selectedProposal.id}`}</span>
                            </div>
                            <Badge variant="cyan">PROPOSAL-READONLY</Badge>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-8">
                                <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                                    <div className="block mb-4"><Label size="tiny">PROPOSAL CORE DIRECTIVE</Label></div>
                                    <p className="mt-4 text-sm text-slate-200 uppercase tracking-wide leading-relaxed">
                                        Execution of national tax adjustment protocol directed at <span className="text-cyan-400">Sector {selectedProposal.type}</span>.
                                        New target rate synchronization requested by Congress member.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="block mb-1"><Label size="tiny">AFFIRMATIVE VOTES</Label></div>
                                            <div className="text-2xl font-black text-white mt-1">{selectedProposal.yesVotes}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="block mb-1"><Label size="tiny">DISSENTING VOTES</Label></div>
                                            <div className="text-2xl font-black text-white mt-1">{selectedProposal.noVotes}</div>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-slate-950/60 rounded-full border border-slate-800 p-0.5 relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                            style={{ width: `${(selectedProposal.yesVotes / (selectedProposal.yesVotes + selectedProposal.noVotes || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        <span>Quota: 11 REQUIRED</span>
                                        <span>Status: {selectedProposal.yesVotes >= 11 ? 'APPROVED' : 'PENDING QUORUM'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-64 space-y-4">
                                <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-4">
                                    <Label size="tiny">Directive Metadata</Label>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Proposer</span>
                                            <span className="text-[10px] text-cyan-400 font-bold">{selectedProposal.proposer.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Timestamp</span>
                                            <span className="text-[10px] text-white font-bold">20 JAN 2026</span>
                                        </div>
                                    </div>
                                </div>

                                {isCongressMember && !selectedProposal.executed && (
                                    <div className="space-y-2">
                                        <ActionButton
                                            variant="primary"
                                            label="AFFIRM MOTION"
                                            icon={<ArrowRight />}
                                            onClick={() => voteOnProposal(selectedProposal.id, true)}
                                        />
                                        <ActionButton
                                            variant="default"
                                            label="REJECT MOTION"
                                            onClick={() => voteOnProposal(selectedProposal.id, false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center p-12 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800/50">
                        <div className="text-center space-y-4">
                            <Gavel size={48} className="text-slate-800 mx-auto" strokeWidth={1} />
                            <div className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Select a proposal to view telemetry</div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <TabBar
                    tabs={TABS}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as any)}
                    variant="pills"
                />
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'leadership' ? renderLeadership() : renderCongress()}
            </AnimatePresence>
        </div>
    );
}
