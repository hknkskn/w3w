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
    Package,
    Wallet,
    ShoppingCart,
    Edit3,
    Info,
    Handshake
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
import { COUNTRY_CONFIG, COUNTRY_IDS, CountryId, ElectionCandidate, getCountryKey } from '@/lib/types';
import { TerritoryService, RegionData } from '@/lib/services/territory.service';

export default function PoliticsPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        declareWar,
        initiateImpeachment,
        executiveDecree,
        fetchTreasuryBalance,
        fetchCountryData,
        fetchProposals,
        fetchCandidates,
        treasuryBalance,
        claimableSalary,
        fetchClaimableSalary,
        claimSalary,
        countryGovernance,
        fetchCountryGovernance,
        warStatus,
        fetchWarStatus,
        finalizeProposal,
        startCongressElection,
        registerCongressCandidate,
        voteCongress,
        endCongressElection,
        congressElectionData,
        fetchCongressElectionData,
        donateToTreasury,
        fetchTopDonors,
        topDonors,
        isLandless,
        reclaimableRegions,
        fetchLandlessStatus,
        fetchReclaimableRegions,
        startResistance
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

    // War Declaration Modal State
    const [isWarModalOpen, setIsWarModalOpen] = useState(false);
    const [warTargetCountry, setWarTargetCountry] = useState<number | null>(null);
    const [warTargetRegion, setWarTargetRegion] = useState<number | null>(null);
    const [warMethod, setWarMethod] = useState<'decree' | 'proposal'>('decree');
    const [allRegions, setAllRegions] = useState<RegionData[]>([]);

    // Donation State
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState<number>(100000);

    // Governance Proposition Modal State
    const [isGovModalOpen, setIsGovModalOpen] = useState(false);
    const [govProposalType, setGovProposalType] = useState<number>(5);
    const [govRoleType, setGovRoleType] = useState<number>(0);
    const [govTargetValue, setGovTargetValue] = useState<number>(0);
    const [govTargetAddress, setGovTargetAddress] = useState<string>('');

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

    // Initial Data Fetch
    useEffect(() => {
        if (!countryId) return;

        const loadData = async () => {
            try {
                // Sequence critical data fetching to avoid RPC flooding/rate-limits
                await fetchCountryData(countryId);
                await fetchTreasuryBalance(countryId);
                await fetchCountryGovernance(countryId);
                await fetchWarStatus(countryId);

                // Group non-critical but necessary data
                await Promise.all([
                    checkCongressMembership(countryId),
                    fetchProposals(),
                    fetchCandidates(countryId)
                ]);

                // Remaining secondary data
                await Promise.all([
                    fetchTopDonors(countryId),
                    fetchLandlessStatus(countryId),
                    fetchReclaimableRegions(countryId)
                ]);

                // Async dynamic imports and secondary fetches
                TerritoryService.getAllRegions().then(setAllRegions);

                if (user?.address) {
                    fetchClaimableSalary(user.address, countryId);
                }

                const { CitizenService } = await import('@/lib/services/citizen.service');
                const pop = await CitizenService.getPopulation(countryId);
                setPopulation(pop);

            } catch (e) {
                console.error("Politics: Failed to load national telemetry:", e);
            }
        };

        loadData();
    }, [countryId, user?.address]);

    if (!user) return null;


    const TABS = [
        { id: 'leadership', label: 'Leadership', icon: <Shield size={18} /> },
        { id: 'congress', label: 'Congress', icon: <Gavel size={18} /> },
        { id: 'voter-hub', label: 'Voter Hub', icon: <Vote size={18} /> },
        { id: 'admin', label: 'System Admin', icon: <Settings size={18} /> },
    ];

    const renderExecutivePanel = () => {
        const isPres = user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase();
        if (!isPres) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-12 gap-6"
            >
                {/* Sidebar: Executive Identity & Telemetry */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center">
                                <Shield className="text-cyan-400" size={32} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Executive Status</div>
                                <h2 className="text-xl font-black text-white uppercase italic">Sector President</h2>
                                <div className="mt-1">
                                    <Badge variant="cyan">PRIMARY AUTHORITY</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-800/50">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                                <span className="text-slate-500">ID Link</span>
                                <span className="text-slate-300 font-mono italic">{user?.address?.substring(0, 16)}...</span>
                            </div>
                        </div>

                        {Number(claimableSalary[`${user?.address}-${countryId}`] || 0) > 0 && (
                            <ActionButton
                                label={`CLAIM SALARY`}
                                sublabel={`${(Number(claimableSalary[`${user?.address}-${countryId}`]) / 100).toLocaleString()} CRED`}
                                variant="primary"
                                onClick={() => countryId && claimSalary(countryId)}
                                className="mt-6 h-12"
                                icon={<Wallet size={16} />}
                            />
                        )}
                    </Card>

                    <Label size="small">National Link: Telemetry</Label>
                    <ul className="space-y-3">
                        <ListItem>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-500">
                                        <Database size={14} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reserve</span>
                                </div>
                                <div className="text-sm font-black text-white">{(countryBalance / 100).toLocaleString()} <span className="text-[10px] text-slate-600">CRED</span></div>
                            </div>
                        </ListItem>
                        <ListItem>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500">
                                        <Users size={14} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizens</span>
                                </div>
                                <div className="text-sm font-black text-white">{population.toLocaleString()}</div>
                            </div>
                        </ListItem>
                        <ListItem>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500">
                                        <Shield size={14} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conflicts</span>
                                </div>
                                <div className="text-sm font-black text-white">{warStatus[countryId!]?.length || 0} SEC</div>
                            </div>
                        </ListItem>
                    </ul>
                </div>

                {/* Main Content: Executive Policy & Directives */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Economic Policy Directive Card */}
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <LineChart className="text-cyan-400" size={18} />
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Executive Economic Directives</h3>
                            </div>
                            <Badge variant="default">DECREE LIMIT: 5-20%</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {[
                                { label: 'Income Tax', value: currentCountryData?.incomeTax, type: 0, icon: <Wallet size={14} /> },
                                { label: 'Import Tax', value: currentCountryData?.importTax, type: 1, icon: <Package size={14} /> },
                                { label: 'VAT Rate', value: currentCountryData?.vat, type: 2, icon: <ShoppingCart size={14} /> },
                            ].map(tax => (
                                <div key={tax.label} className="p-4 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{tax.label}</span>
                                        <button
                                            onClick={() => handleTaxAdjustment(tax.type, tax.value || 0)}
                                            className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                    </div>
                                    <div className="text-2xl font-black text-white">{tax.value || 0}%</div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-slate-900/30 border border-dashed border-slate-800 flex items-center gap-4">
                            <Info size={16} className="text-slate-600 shrink-0" />
                            <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                                Executive authority permits direct tax adjustments within the regulated bracket.
                                Changes are synchronized immediately to the national core.
                            </p>
                        </div>
                    </Card>

                    {/* Legislative Propositions Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Gavel size={18} className="text-emerald-500" />
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Legislative Propositions</h4>
                            </div>
                            <div className="space-y-3">
                                <ActionButton
                                    label="PROPOSE MIN WAGE"
                                    sublabel="VOTE"
                                    variant="default"
                                    onClick={() => {
                                        setGovProposalType(5);
                                        setGovTargetValue((countryGovernance[countryId!]?.minWage || 0) / 100);
                                        setIsGovModalOpen(true);
                                    }}
                                    className="h-10 border-slate-700 bg-slate-900/50"
                                    icon={<TrendingUp size={14} />}
                                />
                                <ActionButton
                                    label="ADJUST SALARIES"
                                    sublabel="VOTE"
                                    variant="default"
                                    onClick={() => {
                                        setGovProposalType(7);
                                        setGovRoleType(0);
                                        setGovTargetValue((countryGovernance[countryId!]?.presSalary || 0) / 100);
                                        setIsGovModalOpen(true);
                                    }}
                                    className="h-10 border-slate-700 bg-slate-900/50"
                                    icon={<UserCircle size={14} />}
                                />
                            </div>
                        </Card>

                        <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Clock size={18} className="text-amber-500" />
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Cycle Management</h4>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-6 leading-relaxed">
                                {congressElectionData[countryId]?.active
                                    ? "Congressional election is currently live. Monitor candidate registration."
                                    : "Initialize next congressional term election cycle."}
                            </p>
                            <ActionButton
                                label={congressElectionData[countryId]?.active ? "VIEW ELECTION" : "START ELECTION"}
                                variant={congressElectionData[countryId]?.active ? "default" : "primary"}
                                onClick={async () => {
                                    if (congressElectionData[countryId]?.active) {
                                        setActiveTab('congress');
                                    } else {
                                        await startCongressElection(countryId!);
                                    }
                                }}
                                className="h-10"
                                icon={<Vote size={14} />}
                            />
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Target size={18} className="text-rose-500" />
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Strategic Terminal</h4>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-6 leading-relaxed">
                                Authorize direct mobilization. Circumvents legislative debate but requires 1M CRED treasury burn.
                            </p>
                            <ActionButton
                                label="DECLARE WAR"
                                variant="danger"
                                onClick={() => setIsWarModalOpen(true)}
                                className="h-10"
                                icon={<Flag size={14} />}
                            />
                        </Card>

                        <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Users size={18} className="text-cyan-500" />
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Welfare Index</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 px-3 bg-slate-900/50 border border-slate-800">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Min Wage</span>
                                    <span className="text-xs font-black text-white">{(countryGovernance[countryId!]?.minWage || 0) / 100} CRD</span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-slate-900/50 border border-slate-800">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Pres Salary</span>
                                    <span className="text-xs font-black text-white">{(countryGovernance[countryId!]?.presSalary || 0) / 100} CRD</span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-slate-900/50 border border-slate-800">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Cong Salary</span>
                                    <span className="text-xs font-black text-white">{(countryGovernance[countryId!]?.congSalary || 0) / 100} CRD</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {topDonors[countryId!] && topDonors[countryId!]?.length > 0 && (
                        <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                            <div className="mb-4">
                                <Label size="small">National Patriots (Top Donors)</Label>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {topDonors[countryId!].slice(0, 4).map((donor, idx) => (
                                    <div key={idx} className="p-3 bg-slate-900/30 border border-slate-800 hover:border-emerald-500/30 transition-colors">
                                        <div className="text-[9px] font-mono text-cyan-500 mb-1">{donor.addr.substring(0, 10)}...</div>
                                        <div className="text-xs font-black text-white">{(donor.amount / 100).toLocaleString()} <span className="text-[8px] text-slate-600">CRD</span></div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderLeadership = () => {
        const isPres = user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase();

        if (isPres) {
            return renderExecutivePanel();
        }

        return (
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
                            <div className="flex flex-col gap-2">
                                <Badge variant="cyan">
                                    <div className="flex items-center gap-2 px-3 py-1">
                                        <Crown size={14} /> PRESIDENTIAL AUTHORITY
                                    </div>
                                </Badge>
                                {Number(claimableSalary[`${user.address}-${countryId}`] || 0) > 0 && (
                                    <ActionButton
                                        label={`CLAIM SALARY (${(Number(claimableSalary[`${user.address}-${countryId}`]) / 100).toLocaleString()} CRED)`}
                                        variant="primary"
                                        onClick={() => claimSalary(countryId)}
                                        className="h-10 text-[10px]"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {isCongressMember && Number(claimableSalary[`${user.address}-${countryId}`] || 0) > 0 && (
                                    <ActionButton
                                        label={`CLAIM SALARY (${(Number(claimableSalary[`${user.address}-${countryId}`]) / 100).toLocaleString()} CRED)`}
                                        variant="primary"
                                        onClick={() => claimSalary(countryId)}
                                        className="h-10 text-[10px]"
                                    />
                                )}
                                {currentCountryData?.president && (
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
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="MIN WAGE"
                        value={`${(countryGovernance[countryId]?.minWage || 0) / 100}`}
                        unit="CRED"
                        icon={<Gavel className="text-emerald-500" />}
                    />
                    <StatCard
                        label="PRES SALARY"
                        value={`${(countryGovernance[countryId]?.presSalary || 0) / 100}`}
                        unit="CRED/D"
                        icon={<Crown className="text-amber-500" />}
                    />
                    <StatCard
                        label="CONG SALARY"
                        value={`${(countryGovernance[countryId]?.congSalary || 0) / 100}`}
                        unit="CRED/D"
                        icon={<Users className="text-blue-500" />}
                    />
                    <StatCard
                        label="VAT RATE"
                        value={`${currentCountryData?.vat || 0}%`}
                        unit="TAX_VAT"
                        icon={<LineChart className="text-cyan-500" />}
                    />
                </div>

                <Card variant="default" className="bg-slate-900/50 border-slate-700/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Landmark size={20} className="text-cyan-400" />
                            <h2 className={TYPOGRAPHY.h2}>Federation Core Telemetry</h2>
                        </div>
                        <div className="flex gap-2">
                            {warStatus[countryId]?.length > 0 && (
                                <Badge variant="amber">
                                    AT WAR WITH: {warStatus[countryId].map(id => getCountryKey(id)).join(', ')}
                                </Badge>
                            )}
                            <Badge variant={currentCountryData?.electionActive ? "amber" : "emerald"}>
                                {currentCountryData?.electionActive ? "Election Cycle Active" : "System Status: Stable"}
                            </Badge>
                        </div>
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
                                                onClick={() => setIsWarModalOpen(true)}
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
                                        {isLandless && (
                                            <div className="space-y-3">
                                                <Label size="tiny">Freedom Fighters</Label>
                                                <ActionButton
                                                    label="START RESISTANCE (250K CRED)"
                                                    variant="primary"
                                                    className="w-full h-12"
                                                    icon={<Flag size={14} />}
                                                    onClick={() => {
                                                        alert("Landless Resistance Protocol Activated. Choose a region to liberate.");
                                                        setIsWarModalOpen(true);
                                                    }}
                                                />
                                            </div>
                                        )}
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
                                        <div className="space-y-6">
                                            {/* Treasury Card */}
                                            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2 text-cyan-400">
                                                        <Landmark size={18} />
                                                        <span className="text-xs font-black uppercase tracking-widest">National Treasury</span>
                                                    </div>
                                                    <Badge variant="cyan">{(countryBalance / 100).toLocaleString()} CRED</Badge>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Funding Status</span>
                                                        <span className="text-[10px] text-emerald-500 font-black uppercase">NOMINAL</span>
                                                    </div>
                                                    <ActionButton
                                                        label="DONATE CRED TO TREASURY"
                                                        variant="primary"
                                                        className="w-full h-10 border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10"
                                                        onClick={() => setIsDonationModalOpen(true)}
                                                    />
                                                </div>

                                                {topDonors[countryId] && topDonors[countryId].length > 0 && (
                                                    <div className="mt-6 pt-6 border-t border-slate-800/50">
                                                        <Label size="tiny">Top Patriots (Donors)</Label>
                                                        <div className="mt-3 space-y-2">
                                                            {topDonors[countryId].slice(0, 3).map((donor, idx) => (
                                                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/30">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">#{idx + 1}</div>
                                                                        <span className="text-[9px] font-mono text-slate-400">{donor.addr.substring(0, 10)}...</span>
                                                                    </div>
                                                                    <span className="text-[9px] font-black text-white">{(donor.amount / 100).toLocaleString()} CRED</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800/50">
                                                <Label size="tiny">Election Schedule</Label>
                                                <div className="text-2xl font-black text-cyan-400 mt-1 uppercase">Monthly Cycle</div>
                                            </div>
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
    };

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
                            onClick={() => {
                                setGovProposalType(1);
                                setGovTargetValue(10);
                                setIsGovModalOpen(true);
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
                                                        proposal.type === 3 ? 'War Declaration' :
                                                            proposal.type === 4 ? 'Impeachment' :
                                                                proposal.type === 5 ? 'Min Wage Law' :
                                                                    proposal.type === 6 ? 'Congress Size' : 'Salary Adj'}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={proposal.executed ? "emerald" : ((Date.now() / 1000) > proposal.createdAt + 86400 ? "amber" : "cyan")}>
                                        {proposal.executed ? "PASS" : ((Date.now() / 1000) > proposal.createdAt + 86400 ? "FINALIZE" : "VOTE")}
                                    </Badge>
                                </div>
                            </ListItem>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Proposal Detail & Congress Elections */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Election Management / Active Election */}
                {(congressElectionData[countryId]?.active || user.address === currentCountryData?.president) && (
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic">
                                    {congressElectionData[countryId]?.active ? "Active Congress Election" : "Legislative Cycle Management"}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    {congressElectionData[countryId]?.active
                                        ? `Election ends in: ${Math.max(0, Math.floor((congressElectionData[countryId]?.endTime - Date.now() / 1000) / 60))} mins`
                                        : "Initialize a new congressional term selection."}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {congressElectionData[countryId]?.active ? (
                                    <>
                                        {!congressElectionData[countryId]?.candidates.includes(user.address) && isCongressMember && (
                                            <ActionButton
                                                label="REGISTER"
                                                variant="primary"
                                                onClick={() => registerCongressCandidate(countryId)}
                                                className="h-10 px-6"
                                            />
                                        )}
                                        {user.address === currentCountryData?.president && (
                                            <ActionButton
                                                label="END ELECTION"
                                                variant="danger"
                                                onClick={() => endCongressElection(countryId)}
                                                className="h-10 px-6"
                                            />
                                        )}
                                    </>
                                ) : (
                                    user.address === currentCountryData?.president && (
                                        <ActionButton
                                            label="START ELECTION"
                                            variant="primary"
                                            onClick={() => startCongressElection(countryId)}
                                            className="h-10 px-6"
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        {congressElectionData[countryId]?.active && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {congressElectionData[countryId]?.candidates.map((candidate, idx) => (
                                    <div key={candidate} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[8px] font-black text-cyan-400">
                                                ID
                                            </div>
                                            <div className="truncate">
                                                <div className="text-[10px] text-white font-black uppercase truncate">{candidate}</div>
                                                <div className="text-[8px] text-slate-500 font-bold">{congressElectionData[countryId]?.votes[idx]} VOTES</div>
                                            </div>
                                        </div>
                                        <button
                                            className="text-cyan-400 hover:text-cyan-300 transition-colors p-2"
                                            onClick={() => voteCongress(countryId, idx)}
                                        >
                                            <Vote size={18} />
                                        </button>
                                    </div>
                                ))}
                                {congressElectionData[countryId]?.candidates.length === 0 && (
                                    <p className="col-span-2 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest py-4">No candidates registered yet.</p>
                                )}
                            </div>
                        )}
                    </Card>
                )}

                {/* Proposal Detail */}
                {selectedProposal ? (
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className={TYPOGRAPHY.h2}>Legislative Review</h2>
                                    <Badge variant={selectedProposal.executed ? "emerald" : "amber"}>
                                        {selectedProposal.executed ? "Pass" :
                                            (Date.now() / 1000) > selectedProposal.createdAt + 86400 ? "Voting Finished" :
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
                                {!selectedProposal.executed && (Date.now() / 1000) > selectedProposal.createdAt + 86400 && (
                                    <ActionButton
                                        label="EXECUTE"
                                        variant="primary"
                                        onClick={() => finalizeProposal(selectedProposal.id)}
                                        className="h-8 px-4 mt-2 text-[10px]"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
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
                                            Target fulfillment: <span className="text-cyan-400">Recipient Address</span>.
                                        </>
                                    ) : selectedProposal.type === 3 ? (
                                        <>
                                            Declaration of State of Conflict. Target Nation ID: <span className="text-rose-500 font-black">{selectedProposal.data ? selectedProposal.data[0] : '??'}</span>.
                                            Requires Congressional Ratification.
                                        </>
                                    ) : selectedProposal.type === 4 ? (
                                        <>
                                            High-level governance reset: <span className="text-rose-500 font-black">IMPEACHMENT OF SITTING PRESIDENT</span>.
                                            Requires absolute majority of the citizen population.
                                        </>
                                    ) : selectedProposal.type === 5 ? (
                                        <>
                                            Social welfare adjustment: <span className="text-emerald-500 font-black">SET MINIMUM WAGE</span>.
                                            Target: <span className="text-emerald-500">{selectedProposal.data ? selectedProposal.data[0] : '??'} CRED</span>.
                                        </>
                                    ) : selectedProposal.type === 6 ? (
                                        <>
                                            Administrative restructuring: <span className="text-blue-500 font-black">CONGRESS SIZE REVISION</span>.
                                            New Seat Count: <span className="text-blue-500">{selectedProposal.data ? selectedProposal.data[0] : '??'}</span>.
                                        </>
                                    ) : selectedProposal.type === 7 ? (
                                        <>
                                            Compensation adjustment for <span className="text-amber-500 font-black">{selectedProposal.data ? (selectedProposal.data[0] === 0 ? 'PRESIDENT' : 'CONGRESS') : 'OFFICIALS'}</span>.
                                            Target: <span className="text-amber-500">{selectedProposal.data ? selectedProposal.data[1] : '??'} CRED</span> per day.
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
                            </div>
                        </div>

                        {isMounted && !selectedProposal.executed && (Date.now() / 1000) <= selectedProposal.createdAt + 86400 && (
                            <div className="mt-8 pt-8 border-t border-slate-800 flex gap-4">
                                <ActionButton
                                    label="VOTE AFFIRMATIVE"
                                    variant="success"
                                    className="flex-1 h-14"
                                    onClick={() => voteOnProposal(selectedProposal.id, true)}
                                />
                                <ActionButton
                                    label="VOTE DISSENT"
                                    variant="danger"
                                    className="flex-1 h-14"
                                    onClick={() => voteOnProposal(selectedProposal.id, false)}
                                />
                            </div>
                        )}
                    </Card>
                ) : (
                    !congressElectionData[countryId]?.active && (
                        <div className="bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-800 h-full flex flex-col items-center justify-center text-center p-12">
                            <Search size={48} className="text-slate-800 mb-6 opacity-20" />
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-tighter">Registry Key Required</h3>
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-2">Select a motion from the queue to review legislative telemetry.</p>
                        </div>
                    )
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

                <ul className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
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
                </ul>
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
        </motion.div >
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

    const renderActionModal = () => {
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
    };

    const renderWarModal = () => {
        // Filter out current country
        const targetCountries = (Object.keys(COUNTRY_CONFIG) as CountryId[])
            .filter(cid => COUNTRY_IDS[cid] !== countryId);

        // Filter regions by selected country
        const countryRegions = allRegions.filter(r => r.ownerCountry === warTargetCountry);
        const isResistance = isLandless;

        return (
            <Modal
                isOpen={isWarModalOpen}
                onClose={() => setIsWarModalOpen(false)}
                title={isResistance ? "Liberation Protocol: Freedom Fighters" : "Strategic Command: Declare War"}
            >
                <div className="space-y-6">
                    {/* Method Selection (Only for Presidential Decree/Proposal) */}
                    {!isResistance && (
                        <div>
                            <Label size="tiny">Authorization Method</Label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <button
                                    onClick={() => setWarMethod('decree')}
                                    className={`p-4 rounded-xl border text-left transition-all ${warMethod === 'decree' ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-slate-900 border-slate-800'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield size={14} className={warMethod === 'decree' ? 'text-red-400' : 'text-slate-500'} />
                                        <span className="text-[9px] font-black uppercase text-white">Direct Decree</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase leading-tight">Presidential action. Immediate declaration. Cost: 1M CRED.</p>
                                </button>

                                <button
                                    onClick={() => setWarMethod('proposal')}
                                    className={`p-4 rounded-xl border text-left transition-all ${warMethod === 'proposal' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-slate-800'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Gavel size={14} className={warMethod === 'proposal' ? 'text-emerald-400' : 'text-slate-500'} />
                                        <span className="text-[9px] font-black uppercase text-white">Congress Proposal</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase leading-tight">Legislative vote. 24h voting period. Cost: 800K CRED.</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Country Selection */}
                    <div>
                        <Label size="tiny">{isResistance ? "Federation to Liberate From" : "Target Federation"}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {targetCountries.map(cid => (
                                <button
                                    key={cid}
                                    onClick={() => {
                                        setWarTargetCountry(COUNTRY_IDS[cid]);
                                        setWarTargetRegion(null);
                                    }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${warTargetCountry === COUNTRY_IDS[cid] ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'}`}
                                >
                                    <img src={COUNTRY_CONFIG[cid].flag} className="w-8 h-5 object-cover rounded shadow-sm" alt="" />
                                    <span className="text-[10px] font-black uppercase text-slate-300">{COUNTRY_CONFIG[cid].name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Region Selection */}
                    {warTargetCountry && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <Label size="tiny">Select Target Region</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {countryRegions.length > 0 ? (
                                    countryRegions.map(region => (
                                        <button
                                            key={region.id}
                                            onClick={() => setWarTargetRegion(region.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${warTargetRegion === region.id ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400">
                                                    <Target size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-black text-white uppercase">{region.name}</div>
                                                    <div className="text-[8px] text-slate-500 font-bold uppercase">Region ID: {region.id}</div>
                                                </div>
                                            </div>
                                            {warTargetRegion === region.id && (
                                                <CheckCircle2 size={14} className="text-cyan-400" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">No targetable regions found</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Operational Warning */}
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Operational Alert</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                            {isResistance ? (
                                <>Warning: Starting a resistance war costs <span className="text-white">250,000 CRED</span> from your account. Guerilla units will be mobilized immediately.</>
                            ) : (
                                <>Warning: War declaration will burn <span className="text-white">{warMethod === 'decree' ? '1,000,000' : '800,000'} CRED</span> from the national treasury. Mobilization will follow {warMethod === 'decree' ? 'IMMEDIATELY' : 'after congressional approval'}.</>
                            )}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsWarModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            Aborted
                        </button>
                        <button
                            disabled={!warTargetCountry || !warTargetRegion || isSubmitting}
                            onClick={async () => {
                                if (!warTargetCountry || !warTargetRegion) return;
                                setIsSubmitting(true);
                                try {
                                    if (isResistance) {
                                        await startResistance(warTargetRegion);
                                    } else if (warMethod === 'decree') {
                                        await declareWar(countryId!, warTargetCountry, warTargetRegion);
                                    } else {
                                        await createProposal(countryId!, 3, [warTargetCountry]);
                                    }
                                    setIsWarModalOpen(false);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!warTargetCountry || !warTargetRegion || isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]'}`}
                        >
                            {isSubmitting ? 'Commanding...' : isResistance ? 'Start Revolution' : warMethod === 'decree' ? 'Confirm Mobilization' : 'Submit Proposal'}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    const renderDonationModal = () => {
        return (
            <Modal
                isOpen={isDonationModalOpen}
                onClose={() => setIsDonationModalOpen(false)}
                title="Patriotic Contribution: Donate CRED"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed text-center">
                            Your donation will be deposited into the <span className="text-white">National Treasury</span> to fund expansion, infrastructure, and defense.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Label size="tiny">Donation Amount (CRED)</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[1000, 5000, 10000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setDonationAmount(amt)}
                                    className={`py-3 rounded-xl border text-[10px] font-black transition-all ${donationAmount === amt ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                                >
                                    {amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        <Input
                            type="number"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                            placeholder="Custom Amount"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsDonationModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={donationAmount <= 0 || isSubmitting}
                            onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                    await donateToTreasury(countryId!, donationAmount);
                                    setIsDonationModalOpen(false);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${donationAmount <= 0 || isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                        >
                            {isSubmitting ? 'Sending...' : 'Confirm Donation'}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

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
            {renderGovModal()}
            {renderWarModal()}
            {renderDonationModal()}
        </div>
    );

    function renderGovModal() {
        const motionLabels: Record<number, string> = {
            1: "Tax Amendment",
            2: "Treasury Withdrawal",
            4: "Impeachment",
            5: "Minimum Wage Law",
            6: "Congress Size Adjustment",
            7: "Official Salary Adjustment"
        };

        return (
            <Modal
                isOpen={isGovModalOpen}
                onClose={() => setIsGovModalOpen(false)}
                title={`Legislative Motion: ${motionLabels[govProposalType]}`}
            >
                <div className="space-y-6">
                    {/* Category Selection (Only if opened from Congress tab without specific context) */}
                    <div>
                        <Label size="tiny">Motion Category</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            {[1, 2, 5, 6, 7].map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setGovProposalType(type);
                                        // Reset values based on type
                                        if (type === 1) setGovTargetValue(10);
                                        if (type === 2) setGovTargetValue(1000);
                                        if (type === 5) setGovTargetValue((countryGovernance[countryId!]?.minWage || 0) / 100);
                                        if (type === 6) setGovTargetValue(7);
                                        if (type === 7) setGovTargetValue((countryGovernance[countryId!]?.presSalary || 0) / 100);
                                    }}
                                    className={`px-2 py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${govProposalType === type ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {motionLabels[type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {govProposalType === 1 && (
                        <div>
                            <Label size="tiny">Target Tax Sector</Label>
                            <div className="flex gap-2 mt-2">
                                {['Income', 'Import', 'VAT'].map((lbl, idx) => (
                                    <button
                                        key={lbl}
                                        onClick={() => setGovRoleType(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${govRoleType === idx ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                                    >
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {govProposalType === 7 && (
                        <div>
                            <Label size="tiny">Target Role</Label>
                            <div className="flex gap-2 mt-2">
                                {[
                                    { label: 'President', value: 0 },
                                    { label: 'Congress', value: 1 }
                                ].map((role) => (
                                    <button
                                        key={role.label}
                                        onClick={() => {
                                            setGovRoleType(role.value);
                                            setGovTargetValue(role.value === 0 ? (countryGovernance[countryId!]?.presSalary || 0) / 100 : (countryGovernance[countryId!]?.congSalary || 0) / 100);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${govRoleType === role.value ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    {(govProposalType === 1 || govProposalType === 2 || govProposalType === 5 || govProposalType === 6 || govProposalType === 7) && (
                        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <Label size="tiny">
                                    {govProposalType === 1 ? "Proposed Rate (%)" :
                                        govProposalType === 2 ? "Amount (CRED)" :
                                            govProposalType === 6 ? "Congress Size" : "Target Amount (CRED)"}
                                </Label>
                                <div className="text-xl font-mono font-black text-white">
                                    {govTargetValue.toLocaleString()}{govProposalType === 1 ? "%" : ""}
                                </div>
                            </div>
                            <input
                                type="range"
                                min={govProposalType === 6 ? 1 : 0}
                                max={govProposalType === 1 ? 100 : (govProposalType === 2 ? 1000000 : 10000)}
                                step={govProposalType === 6 ? 1 : 10}
                                value={govTargetValue}
                                onChange={(e) => setGovTargetValue(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                    )}

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Gavel size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Legislative Protocol active</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                            This motion requires a 51% majority vote from Congress within a 24-hour cycle.
                            Unauthorized attempts will be blocked by the protocol core.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsGovModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            Abort
                        </button>
                        <button
                            disabled={isSubmitting}
                            onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                    let args: number[] = [];
                                    if (govProposalType === 1) args = [govRoleType, govTargetValue];
                                    else if (govProposalType === 2) args = [govTargetValue * 100];
                                    else if (govProposalType === 5) args = [govTargetValue * 100];
                                    else if (govProposalType === 6) args = [govTargetValue];
                                    else if (govProposalType === 7) args = [govRoleType, govTargetValue * 100];

                                    await createProposal(countryId!, govProposalType, args);
                                    fetchProposals();
                                    setIsGovModalOpen(false);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
                        >
                            {isSubmitting ? 'Commanding...' : 'Initiate Vote'}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

}
