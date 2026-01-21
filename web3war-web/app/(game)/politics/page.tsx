'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import {
    Flag,
    Users,
    Vote,
    Gavel,
    Crown,
    Clock,
    UserPlus,
    Shield,
    Landmark,
    TrendingUp,
    Percent,
    CheckCircle2,
    AlertCircle,
    Activity,
    Database,
    ChevronRight,
    Search,
    UserCircle,
    ArrowRight,
    Building2,
    FileText,
    Target,
    ArrowRightCircle,
    Settings,
    LineChart,
    Package
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
    ListItem,
    Input,
    Modal
} from '@/lib/ui-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_CONFIG, COUNTRY_IDS, CountryId, ElectionCandidate } from '@/lib/types';

export default function PoliticsPage() {
    const {
        user,
        countryData,
        proposals,
        electionCandidates,
        isCongressMember,
        checkCongressMembership,
        registerAsCandidate,
        voteForCandidate,
        voteOnProposal,
        createProposal,
        initiateWarDeclaration,
        initiateImpeachment,
        executiveDecree,
        fetchTreasuryBalance,
        fetchCountryData,
        fetchProposals,
        fetchCandidates,
        treasuryBalance
    } = useGameStore();

    const handleTaxAdjustment = (type: number, currentRate: number) => {
        setAdjustmentType(type);
        setAdjustmentRate(currentRate);
        setAdjustmentMethod('decree');
        setIsActionModalOpen(true);
    };

    const confirmAction = async () => {
        if (adjustmentRate < 0 || adjustmentRate > 100) return;

        setIsSubmitting(true);
        try {
            if (adjustmentMethod === 'decree') {
                if (adjustmentRate < 5 || adjustmentRate > 20) {
                    alert("Decree must be between 5% and 20%");
                    setIsSubmitting(false);
                    return;
                }
                await executiveDecree(countryId!, adjustmentType, adjustmentRate);
                fetchCountryData(countryId!);
            } else {
                await createProposal(countryId!, 1, [adjustmentType, adjustmentRate]);
                fetchProposals();
            }
            setIsActionModalOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const [activeTab, setActiveTab] = useState<'leadership' | 'congress' | 'voter-hub' | 'admin'>('leadership');
    const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
    const [selectedCandidateAddr, setSelectedCandidateAddr] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [population, setPopulation] = useState<number>(0);

    // Presidential Action Modal State
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<number>(0);
    const [adjustmentMethod, setAdjustmentMethod] = useState<'decree' | 'proposal'>('decree');
    const [adjustmentRate, setAdjustmentRate] = useState<number>(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const currentCountryData = countryData[countryId];
    const countryBalance = (treasuryBalance as any || {})[countryId] || 0;
    const candidates = electionCandidates[countryId] || [];
    const selectedProposal = proposals.find(p => p.id === selectedProposalId);
    const [selectedCandidate, setSelectedCandidate] = useState<ElectionCandidate | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const candidate = candidates.find(c => c.address === selectedCandidateAddr);
        if (candidate) {
            setSelectedCandidate(candidate);
            // Fetch detailed profile for strength/level if not present
            if (candidate.strength === undefined) {
                import('@/lib/services/citizen.service').then(({ CitizenService }) => {
                    CitizenService.getProfile(candidate.address).then(profile => {
                        if (profile) {
                            setSelectedCandidate((prev: ElectionCandidate | null) => prev?.address === candidate.address ? {
                                ...prev,
                                strength: Number(profile.strength),
                                level: Number(profile.level)
                            } : prev);
                        }
                    });
                });
            }
        } else {
            setSelectedCandidate(null);
        }
    }, [selectedCandidateAddr, candidates]);

    useEffect(() => {
        if (countryId) {
            fetchCountryData(countryId);
            fetchProposals();
            fetchCandidates(countryId);
            checkCongressMembership(countryId);
            fetchTreasuryBalance(countryId);

            // Fetch population
            const fetchPop = async () => {
                const { CitizenService } = await import('@/lib/services/citizen.service');
                const pop = await CitizenService.getPopulation(countryId);
                setPopulation(pop);
            };
            fetchPop();
        }
    }, [countryId]);

    if (!user) return null;

    const TABS = [
        { id: 'leadership', label: 'Leadership', icon: <Shield size={18} /> },
        { id: 'congress', label: 'Congress', icon: <Gavel size={18} /> },
        { id: 'voter-hub', label: 'Voter Hub', icon: <Vote size={18} /> },
        { id: 'admin', label: 'System Admin', icon: <Settings size={18} /> },
    ];

    const renderLeadership = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Presidential Status Panel */}
            <Card variant="default" className={`relative overflow-hidden border-2 bg-slate-900/40 p-0 ${user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase() ? 'border-cyan-500/30' : 'border-slate-800'}`} padding="none">
                <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-2xl bg-slate-950 border flex items-center justify-center shadow-2xl relative z-10 ${user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase() ? 'border-cyan-500/50' : 'border-slate-800'}`}>
                            <Shield className={user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase() ? "text-cyan-400" : "text-slate-600"} size={40} />
                        </div>
                        {currentCountryData?.president && (
                            <div className="absolute -top-2 -right-2 z-20 bg-amber-500 rounded-full p-1.5 shadow-lg border-2 border-slate-900">
                                <Crown size={16} className="text-slate-950" />
                            </div>
                        )}
                        <div className={`absolute inset-0 blur-3xl rounded-full ${user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase() ? 'bg-cyan-500/20' : 'bg-slate-500/5'}`} />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Executive Administration</div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                            {currentCountryData?.president ? (
                                user?.address?.toLowerCase() === currentCountryData.president?.toLowerCase() ? "Your Administration" : "Council Presidency"
                            ) : "Vacant Authority"}
                        </h2>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                            <Badge variant={currentCountryData?.president ? "cyan" : "default"}>
                                {currentCountryData?.president ? "ACTIVE TERM" : "PENDING ELECTION"}
                            </Badge>
                            <span className="text-[10px] font-mono text-slate-600 truncate max-w-[200px]">
                                {currentCountryData?.president || "0x000...000"}
                            </span>
                        </div>
                    </div>

                    {user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase() ? (
                        <div className="flex gap-2">
                            <Badge variant="cyan">
                                <div className="flex items-center gap-2 px-3 py-1">
                                    <Crown size={14} /> PRESIDENTIAL AUTHORITY
                                </div>
                            </Badge>
                        </div>
                    ) : (
                        currentCountryData?.president && (
                            <ActionButton
                                label="IMPEACH PRESIDENT"
                                variant="danger"
                                icon={<AlertCircle size={14} />}
                                className="h-10 px-4 opacity-50 hover:opacity-100"
                                onClick={async () => {
                                    if (confirm("INITIATE IMPEACHMENT PROTOCOL?\n\nCost: 500k CRED\nRequirement: Simple majority of ALL citizens.\n\nProceed with high-risk political maneuver?")) {
                                        await initiateImpeachment(countryId);
                                    }
                                }}
                            />
                        )
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="APPROVAL"
                    value="94%"
                    unit="RATING"
                    icon={<Activity className="text-emerald-500" />}
                />
                <StatCard
                    label="INCOME TAX"
                    value={`${currentCountryData?.incomeTax || 0}%`}
                    unit="TAX_INC"
                    icon={<Percent className="text-cyan-500" />}
                />
                <StatCard
                    label="IMPORT TAX"
                    value={`${currentCountryData?.importTax || 0}%`}
                    unit="TAX_IMP"
                    icon={<TrendingUp className="text-amber-500" />}
                />
                <StatCard
                    label="VAT RATE"
                    value={`${currentCountryData?.vat || 0}%`}
                    unit="TAX_VAT"
                    icon={<LineChart className="text-blue-500" />}
                />
            </div>

            <Card variant="default" className="bg-slate-900/50 border-slate-700/50 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Landmark size={20} className="text-cyan-400" />
                        <h2 className={TYPOGRAPHY.h2}>Federation Core Telemetry</h2>
                    </div>
                    <Badge variant={currentCountryData?.electionActive ? "amber" : "emerald"}>
                        {currentCountryData?.electionActive ? "Election Cycle Active" : "System Status: Stable"}
                    </Badge>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-12">
                        {user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase() ? (
                            <div className="bg-cyan-500/5 rounded-2xl border border-cyan-500/20 p-6 space-y-4">
                                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                    <Target size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">Executive Command Console</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label size="tiny">Strategic Directives</Label>
                                        <ActionButton
                                            label="DECLARE WAR (1M CRED BURN)"
                                            variant="danger"
                                            className="w-full h-12"
                                            icon={<Shield size={14} />}
                                            onClick={async () => {
                                                const targetId = prompt("Enter Target Country ID:");
                                                if (targetId) await initiateWarDeclaration(countryId, parseInt(targetId));
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label size="tiny">Economic Directives (Direct or Voted)</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <ActionButton
                                                label="SET INC"
                                                variant="primary"
                                                className="w-full h-12 text-[10px]"
                                                icon={<Percent size={12} />}
                                                onClick={() => handleTaxAdjustment(0, currentCountryData?.incomeTax || 0)}
                                            />
                                            <ActionButton
                                                label="SET IMP"
                                                variant="primary"
                                                className="w-full h-12 text-[10px]"
                                                icon={<Percent size={12} />}
                                                onClick={() => handleTaxAdjustment(1, currentCountryData?.importTax || 0)}
                                            />
                                            <ActionButton
                                                label="SET VAT"
                                                variant="primary"
                                                className="w-full h-12 text-[10px]"
                                                icon={<Percent size={12} />}
                                                onClick={() => handleTaxAdjustment(2, currentCountryData?.vat || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800/50">
                                        <Label size="tiny">Population Count</Label>
                                        <div className="text-2xl font-black text-white mt-1">
                                            {population.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">CITIZENS</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800/50">
                                        <Label size="tiny">Election Schedule</Label>
                                        <div className="text-2xl font-black text-cyan-400 mt-1 uppercase">Monthly Cycle</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="block mb-4"><Label size="tiny">NATIONAL TREASURY</Label></div>
                                    <div className="bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center gap-4">
                                        <Database size={32} className="text-slate-600" />
                                        <div>
                                            <p className="text-xl font-black text-white">{(countryBalance / 100).toLocaleString()} <span className="text-[10px] text-slate-500">CRED</span></p>
                                            <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest mt-1 italic">Secured National Reserve</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    const renderCongress = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-12 gap-6"
        >
            {/* Sidebar: Proposals List */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <Label size="small">Legislative Queue</Label>
                    {isCongressMember && (
                        <button
                            className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            onClick={async () => {
                                const category = prompt("SELECT MOTION CATEGORY:\n1. TAX AMENDMENT\n2. TREASURY TRANSFER", "1");
                                if (category === "1") {
                                    const type = prompt("Legislative Motion - Select Tax Sector:\n0 = Income Tax\n1 = Import Tax\n2 = Value Added Tax (VAT)");
                                    if (type === null) return;

                                    const rate = prompt(`Enter Proposed Target Rate % (0-100):`);
                                    if (rate !== null) {
                                        await createProposal(countryId!, 1, [parseInt(type), parseInt(rate)]);
                                    }
                                } else if (category === "2") {
                                    const amount = prompt("Withdraw Amount (CRED):");
                                    if (amount) {
                                        // Simple amount representation for demo
                                        await createProposal(countryId!, 2, [parseInt(amount)]);
                                    }
                                }
                            }}
                        >
                            <UserPlus size={14} /> NEW MOTION
                        </button>
                    )}
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {proposals.length === 0 ? (
                        <EmptyState
                            title="No Active Proposals"
                            description="The legislative queue is currently synchronization complete."
                            icon={<Gavel size={32} className="opacity-10" />}
                        />
                    ) : (
                        proposals.filter(p => p.countryId === countryId).map(proposal => (
                            <ListItem
                                key={proposal.id}
                                selected={selectedProposalId === proposal.id}
                                onClick={() => setSelectedProposalId(proposal.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${selectedProposalId === proposal.id ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white uppercase tracking-tight">Motion #{proposal.id}</div>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                {proposal.type === 1 ? 'Tax Amendment' :
                                                    proposal.type === 2 ? 'Treasury Direct' :
                                                        proposal.type === 4 ? 'Impeachment' : 'Legislative Motion'}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={proposal.executed ? "emerald" : "amber"}>
                                        {proposal.executed ? "PASS" : "VOTE"}
                                    </Badge>
                                </div>
                            </ListItem>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Proposal Detail */}
            <div className="col-span-12 lg:col-span-8">
                {selectedProposal ? (
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 h-full p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className={TYPOGRAPHY.h2}>Legislative Review</h2>
                                    <Badge variant={selectedProposal.executed ? "emerald" : "amber"}>
                                        {selectedProposal.executed ? "Pass" :
                                            selectedProposal.type === 4 ? "Awaiting Citizen Response" : "Awaiting Majority"}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                                    Initiated by: <span className="text-slate-300 font-mono">{selectedProposal.proposer}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <Label size="tiny">Reference ID</Label>
                                <div className="text-2xl font-mono font-black text-white leading-none">#{selectedProposal.id}</div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-8">
                            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                                <Label size="tiny">PROPOSAL CORE DIRECTIVE</Label>
                                <div className="mt-4 text-sm text-slate-200 uppercase tracking-wide leading-relaxed">
                                    {selectedProposal.type === 1 ? (
                                        <>
                                            Execution of national tax adjustment protocol directed at <span className="text-cyan-400">
                                                {selectedProposal.data ? (
                                                    selectedProposal.data[0] === 0 ? 'Income Tax' :
                                                        selectedProposal.data[0] === 1 ? 'Import Tax' : 'VAT'
                                                ) : 'Unknown Sector'}
                                            </span>.
                                            Target Rate Adjustment to <span className="text-cyan-400 font-black">{selectedProposal.data ? `${selectedProposal.data[1]}%` : '??%'}</span>.
                                        </>
                                    ) : selectedProposal.type === 2 ? (
                                        <>
                                            Direct extraction and allocation of national treasury assets.
                                            Target fulfillment: <span className="text-cyan-400">Executive Discretionary Fund</span>.
                                        </>
                                    ) : selectedProposal.type === 4 ? (
                                        <>
                                            High-level governance reset: <span className="text-rose-500 font-black">IMPEACHMENT OF SITTING PRESIDENT</span>.
                                            Requires absolute majority of the citizen population.
                                        </>
                                    ) : (
                                        "Standard legislative directive requiring congressional consensus."
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <Label size="tiny">AFFIRMATIVE VOTES</Label>
                                        <div className="text-2xl font-black text-white mt-1">{selectedProposal.yesVotes}</div>
                                    </div>
                                    <div className="text-right">
                                        <Label size="tiny">DISSENTING VOTES</Label>
                                        <div className="text-2xl font-black text-white mt-1">{selectedProposal.noVotes}</div>
                                    </div>
                                </div>
                                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-white/5 p-0.5">
                                    <div
                                        className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-1000 rounded-full"
                                        style={{ width: `${(selectedProposal.yesVotes / (Math.max(1, selectedProposal.yesVotes + selectedProposal.noVotes))) * 100}%` }}
                                    />
                                    <div
                                        className="h-full bg-rose-500 transition-all duration-1000 rounded-full ml-1"
                                        style={{ width: `${(selectedProposal.noVotes / (Math.max(1, selectedProposal.yesVotes + selectedProposal.noVotes))) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Majority Threshold: 11 Votes Required</p>
                                </div>
                            </div>
                        </div>

                        {!selectedProposal.executed && (
                            <div className="mt-auto pt-8 border-t border-slate-800 flex gap-4">
                                <ActionButton
                                    label="EXECUTE AFFIRMATIVE"
                                    variant="success"
                                    className="flex-1 h-14"
                                    onClick={() => voteOnProposal(selectedProposal.id, true)}
                                />
                                <ActionButton
                                    label="EXECUTE DISSENT"
                                    variant="danger"
                                    className="flex-1 h-14"
                                    onClick={() => voteOnProposal(selectedProposal.id, false)}
                                />
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-800 h-full flex flex-col items-center justify-center text-center p-12">
                        <Search size={48} className="text-slate-800 mb-6 opacity-20" />
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-tighter">Registry Key Required</h3>
                        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-2">Select a motion from the queue to review legislative telemetry.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderVoterHub = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-12 gap-6"
        >
            {/* Sidebar: Candidates List */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <Label size="small">Verified Candidates</Label>
                    {currentCountryData?.electionActive && user.level >= 10 && (
                        <button
                            className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            onClick={() => registerAsCandidate(countryId)}
                        >
                            <UserPlus size={14} /> FILE CANDIDACY (10K CRED FEE)
                        </button>
                    )}
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {candidates.length === 0 ? (
                        <EmptyState
                            title="Registry Empty"
                            description="No citizens have filed for executive candidacy in the current cycle."
                            icon={<Users size={32} className="opacity-10" />}
                        />
                    ) : (
                        candidates.map((candidate, idx) => (
                            <ListItem
                                key={candidate.address}
                                selected={selectedCandidateAddr === candidate.address}
                                onClick={() => setSelectedCandidateAddr(candidate.address)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${selectedCandidateAddr === candidate.address ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                                            <span className="font-mono font-black">#{idx + 1}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white uppercase tracking-tight">{candidate.username}</div>
                                            <div className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-wider">
                                                {candidate.address.slice(0, 16)}...
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-black ${selectedCandidateAddr === candidate.address ? 'text-cyan-400' : 'text-white'}`}>{candidate.votes}</div>
                                        <div className="text-[8px] text-slate-600 font-black uppercase">VOTES</div>
                                    </div>
                                </div>
                            </ListItem>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Election Terminal */}
            <div className="col-span-12 lg:col-span-8">
                {selectedCandidate ? (
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 h-full p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center shadow-xl">
                                    <UserCircle size={48} className="text-slate-700" />
                                </div>
                                <div className="pt-2">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">{selectedCandidate.username}</h2>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="cyan">Verified Citizen</Badge>
                                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">{selectedCandidate.address}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Label size="tiny">Secured Support</Label>
                                <div className="text-4xl font-black text-cyan-400 leading-none mt-1">{selectedCandidate.votes}</div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="block mb-6"><Label size="tiny">CANDIDATE ELIGIBILITY AUDIT</Label></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength Output</span>
                                    <span className={`text-xs font-black ${(selectedCandidate.strength || 0) >= 250 ? 'text-cyan-400' : 'text-rose-500'}`}>
                                        {selectedCandidate.strength || 0} / 250
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidacy Fee</span>
                                    <Badge variant="emerald">PAID</Badge>
                                </div>
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry ID Check</span>
                                    <Badge variant="emerald">VERIFIED</Badge>
                                </div>
                                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Term Limitation</span>
                                    <Badge variant="emerald">ELIGIBLE</Badge>
                                </div>
                            </div>
                        </div>

                        {currentCountryData?.electionActive && (
                            <div className="mt-auto pt-8 border-t border-slate-800">
                                <ActionButton
                                    label="COMMIT BALLOT"
                                    variant="primary"
                                    className="h-14"
                                    icon={<ArrowRightCircle size={18} />}
                                    onClick={() => {
                                        const idx = candidates.findIndex(c => c.address === selectedCandidate.address);
                                        voteForCandidate(countryId, idx);
                                    }}
                                />
                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-4 text-center">Caution: Ballot commitment is irreversible and secured by chain protocol.</p>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-800 h-full flex flex-col items-center justify-center text-center p-12">
                        {currentCountryData?.electionActive ? (
                            <>
                                <Vote size={48} className="text-slate-800 mb-6 opacity-20" />
                                <h3 className="text-xl font-black text-slate-600 uppercase tracking-tighter">Election Terminal Live</h3>
                                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-2">Cycle ends in 18:42:05. Select a candidate to review their platform.</p>
                            </>
                        ) : (
                            <>
                                <Clock size={48} className="text-slate-800 mb-6 opacity-20" />
                                <h3 className="text-xl font-black text-slate-600 uppercase tracking-tighter">Ballot Registry Offline</h3>
                                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-2">Next election cycle pending governance protocol initialization.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderAdmin = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-cyan-400 mb-2">
                        <Flag size={20} />
                        <h3 className="font-black uppercase tracking-tighter">Foundation Setup</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                        Initialize governance registry and setup default country parameters across all sectors.
                    </p>
                    <ActionButton
                        label="INITIALIZE GOVERNANCE"
                        variant="primary"
                        className="w-full"
                        onClick={async () => {
                            if (confirm("Initialize governance for all 10 countries?")) {
                                await (useGameStore.getState() as any).initializeGovernance();
                            }
                        }}
                    />
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Vote size={20} />
                        <h3 className="font-black uppercase tracking-tighter">Election Controller</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                        Manually trigger or finalize presidential election cycles for the current sector.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <ActionButton
                            label="START ELECTION"
                            variant="primary"
                            className="bg-slate-800"
                            onClick={() => (useGameStore.getState() as any).startElection(countryId)}
                        />
                        <ActionButton
                            label="END ELECTION"
                            variant="primary"
                            className="bg-slate-800"
                            onClick={() => (useGameStore.getState() as any).endElection(countryId)}
                        />
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <Users size={20} />
                        <h3 className="font-black uppercase tracking-tighter">Authority Management</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                        Directly appoint operatives to executive and legislative branches for protocol verification.
                    </p>
                    <div className="space-y-2">
                        <ActionButton
                            label="APPOINT SELF AS PRESIDENT"
                            variant="primary"
                            className="w-full bg-cyan-600 hover:bg-cyan-500"
                            onClick={async () => {
                                if (user?.address) {
                                    await (useGameStore.getState() as any).appointPresident(countryId, user.address);
                                }
                            }}
                        />
                        <ActionButton
                            label="APPOINT SELF TO CONGRESS"
                            variant="success"
                            className="w-full"
                            onClick={async () => {
                                if (user?.address) {
                                    await (useGameStore.getState() as any).appointCongress(countryId, [user.address]);
                                }
                            }}
                        />
                    </div>
                </Card>
            </div>

            <Card className="p-8 border-dashed border-slate-800 bg-slate-900/20">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <Shield className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Protocol Override Terminal</h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">High-level administrative command interface.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <Label size="tiny">System Status</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-white uppercase tracking-widest leading-none">Admin Telemetry Active</span>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <Label size="tiny">Active Operative</Label>
                        <div className="text-xs font-mono text-cyan-400 mt-2 truncate">
                            {user?.address}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <TabBar
                    tabs={TABS}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as any)}
                    variant="pills"
                />
            </div>

            {/* Viewport */}
            <div className="min-h-[650px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'leadership' && renderLeadership()}
                    {activeTab === 'congress' && renderCongress()}
                    {activeTab === 'voter-hub' && renderVoterHub()}
                    {activeTab === 'admin' && renderAdmin()}
                </AnimatePresence>
            </div>

            {renderActionModal()}
        </div>
    );

    function renderActionModal() {
        const taxLabels = ['Income Tax', 'Import Tax', 'VAT Rate'];
        const isInvalidDecree = adjustmentMethod === 'decree' && (adjustmentRate < 5 || adjustmentRate > 20);

        return (
            <Modal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                title="Economic Directive"
            >
                <div className="space-y-6">
                    <div>
                        <Label size="tiny">Target Sector</Label>
                        <div className="flex gap-2 mt-2">
                            {taxLabels.map((lbl, idx) => (
                                <button
                                    key={lbl}
                                    onClick={() => setAdjustmentType(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${adjustmentType === idx ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setAdjustmentMethod('decree')}
                            className={`p-4 rounded-xl border text-left transition-all ${adjustmentMethod === 'decree' ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900 border-slate-800 opacity-50 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={14} className={adjustmentMethod === 'decree' ? 'text-cyan-400' : 'text-slate-500'} />
                                <span className="text-[10px] font-black uppercase text-white">Decree</span>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">Immediate effect. Strictly limited range (5-20%).</p>
                        </button>

                        <button
                            onClick={() => setAdjustmentMethod('proposal')}
                            className={`p-4 rounded-xl border text-left transition-all ${adjustmentMethod === 'proposal' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-slate-800 opacity-50 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Gavel size={14} className={adjustmentMethod === 'proposal' ? 'text-emerald-400' : 'text-slate-500'} />
                                <span className="text-[10px] font-black uppercase text-white">Proposal</span>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">Legislative vote. Flexible range (0-100%).</p>
                        </button>
                    </div>

                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <Label size="tiny">Target Rate</Label>
                            <div className="text-xl font-mono font-black text-white">{adjustmentRate}%</div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={adjustmentRate}
                            onChange={(e) => setAdjustmentRate(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-[8px] text-slate-600 font-black uppercase">Low</span>
                            <span className="text-[8px] text-slate-600 font-black uppercase">Neutral</span>
                            <span className="text-[8px] text-slate-600 font-black uppercase">High</span>
                        </div>
                    </div>

                    {isInvalidDecree && (
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-3">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[9px] text-red-500 font-bold uppercase leading-tight">
                                Range Violation: Decrees are strictly regulated between 5% and 20%.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsActionModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isInvalidDecree || isSubmitting}
                            onClick={confirmAction}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isInvalidDecree || isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                        >
                            {isSubmitting ? 'Processing...' : adjustmentMethod === 'decree' ? 'Issue Decree' : 'Submit Proposal'}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }
}
