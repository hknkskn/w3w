'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Vote,
    UserPlus,
    Clock,
    Trophy,
    Users,
    Shield,
    Gavel,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    ChevronRight,
    Search,
    Crown
} from 'lucide-react';
import {
    Card,
    Label,
    Badge,
    ActionButton,
    ListItem,
    EmptyState,
    StatCard,
    TabBar
} from '@/lib/ui-kit';
import { useGameStore } from '@/lib/store';
import { CountryData, ElectionCandidate } from '@/lib/types';

interface ElectionHubProps {
    countryId: number;
    currentCountryData: CountryData | null;
    candidates: ElectionCandidate[];
    addressNames: Record<string, string>;
    resolveAddress: (addr: string) => Promise<void>;
}

export function ElectionHub({
    countryId,
    currentCountryData,
    candidates,
    addressNames,
    resolveAddress
}: ElectionHubProps) {
    const {
        user,
        registerAsCandidate,
        voteForCandidate,
        congressElectionData,
        registerCongressCandidate,
        voteCongress,
        fetchCandidates,
        fetchCongressElectionData
    } = useGameStore();

    const [activeElectionTab, setActiveElectionTab] = useState<'presidential' | 'congressional'>('presidential');
    const [selectedCandidateAddr, setSelectedCandidateAddr] = useState<string | null>(null);
    const [now, setNow] = useState(Date.now() / 1000);

    // Refresh time every second for countdowns
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now() / 1000), 1000);
        return () => clearInterval(timer);
    }, []);

    const isPresElectionActive = currentCountryData?.electionActive;
    const presElectionEndTime = currentCountryData?.electionEndTime || 0;
    const isCongressElectionActive = congressElectionData[countryId]?.active;
    const congressElectionEndTime = congressElectionData[countryId]?.endTime || 0;

    const SIX_HOURS = 6 * 60 * 60;
    const isPresLockdown = isPresElectionActive && (presElectionEndTime - now < SIX_HOURS);
    const isCongressLockdown = isCongressElectionActive && (congressElectionEndTime - now < SIX_HOURS);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "00:00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const totalPresVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    const congressData = congressElectionData[countryId];
    const totalCongressVotes = congressData?.votes.reduce((sum, v) => sum + v, 0) || 0;

    const renderCandidacySection = () => {
        const isActive = activeElectionTab === 'presidential' ? isPresElectionActive : isCongressElectionActive;
        const isLockdown = activeElectionTab === 'presidential' ? isPresLockdown : isCongressLockdown;
        const endTime = activeElectionTab === 'presidential' ? presElectionEndTime : congressElectionEndTime;

        if (!isActive) {
            return (
                <Card variant="default" className="bg-slate-950/40 border-slate-800 p-8 text-center">
                    <Clock size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                    <h3 className="text-xl font-black text-slate-500 uppercase italic">Registration Offline</h3>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">
                        Next cycle pending governance initialization.
                    </p>
                </Card>
            );
        }

        return (
            <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <UserPlus className="text-cyan-400" size={20} />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Candidacy Filing</h3>
                    </div>
                    {isLockdown ? (
                        <Badge variant="amber">LOCKDOWN ACTIVE</Badge>
                    ) : (
                        <Badge variant="emerald">REGISTRATION OPEN</Badge>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lockdown Countdown</div>
                        <div className={`text-2xl font-black font-mono ${isLockdown ? 'text-rose-500' : 'text-white'}`}>
                            {isLockdown ? "00:00:00" : formatTime((endTime || 0) - now - SIX_HOURS)}
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                        {isLockdown
                            ? "Registration period has ended. The election has entered the final 6-hour voting lockdown."
                            : "Citizens with strength over 250 may file for candidacy. Requires 5,000 CRED fee."}
                    </p>

                    {((user?.level || 0) < 10 || (user?.strength || 0) < 250 || (user?.credits || 0) < 5000) && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 mb-2">
                            <AlertCircle size={14} className="text-rose-500 shrink-0" />
                            <p className="text-[9px] font-bold text-rose-200 uppercase tracking-tighter">
                                Requirements not met: Level 10, Strength 250, 5,000 CRED.
                            </p>
                        </div>
                    )}

                    {!isLockdown && (
                        <ActionButton
                            label={activeElectionTab === 'presidential' ? "FILE FOR PRESIDENT" : "RUN FOR CONGRESS"}
                            variant="primary"
                            className="h-12 w-full"
                            onClick={() => {
                                if (activeElectionTab === 'presidential') registerAsCandidate(countryId);
                                else registerCongressCandidate(countryId);
                            }}
                            disabled={
                                (user?.level || 0) < 10 ||
                                (user?.strength || 0) < 250 ||
                                (user?.credits || 0) < 5000
                            }
                        />
                    )}
                </div>
            </Card>
        );
    };

    const renderVotingPanel = () => {
        const isActive = activeElectionTab === 'presidential' ? isPresElectionActive : isCongressElectionActive;
        const currentCandidates = activeElectionTab === 'presidential' ? candidates : (congressData?.candidates || []);
        const currentVotes = activeElectionTab === 'presidential'
            ? candidates.map(c => c.votes)
            : (congressData?.votes || []);
        const totalVotes = activeElectionTab === 'presidential' ? totalPresVotes : totalCongressVotes;

        if (!isActive) {
            return (
                <EmptyState
                    title="Ballot Registry Offline"
                    description="Voting terminal is currently disconnected from the national core."
                    icon={<Vote size={48} className="opacity-10" />}
                />
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <Label size="small">Live Voting Terminal</Label>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase">Live Feed</span>
                    </div>
                </div>

                <div className="grid gap-3">
                    {currentCandidates.length === 0 ? (
                        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                            <span className="text-[10px] text-slate-600 font-black uppercase">Awaiting Candidate Disclosures...</span>
                        </div>
                    ) : (
                        currentCandidates.map((addr, idx) => {
                            const candidateAddr = typeof addr === 'string' ? addr : (addr as any).address;
                            const candidateName = typeof addr === 'string' ? (addressNames[addr] || addr.substring(0, 12)) : (addr as any).username;
                            const votes = currentVotes[idx];
                            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                            return (
                                <ListItem
                                    key={candidateAddr}
                                    selected={selectedCandidateAddr === candidateAddr}
                                    onClick={() => setSelectedCandidateAddr(candidateAddr)}
                                    className="group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-black group-hover:border-cyan-500/50 transition-colors">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase group-hover:text-cyan-400 transition-colors">{candidateName}</div>
                                                    <div className="text-[8px] font-mono text-slate-500">{candidateAddr.substring(0, 16)}...</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-white">{percentage.toFixed(1)}%</div>
                                                <div className="text-[8px] font-black text-slate-600 uppercase">{votes} VOTES</div>
                                            </div>
                                        </div>

                                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all duration-1000"
                                            />
                                        </div>

                                        {selectedCandidateAddr === candidateAddr && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="pt-2"
                                            >
                                                <ActionButton
                                                    label="COMMIT BALLOT"
                                                    variant="primary"
                                                    className="h-10 w-full text-[10px]"
                                                    onClick={() => {
                                                        if (activeElectionTab === 'presidential') voteForCandidate(countryId, idx);
                                                        else voteCongress(countryId, idx);
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </ListItem>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    const renderResultsDashboard = () => {
        const winner = activeElectionTab === 'presidential'
            ? currentCountryData?.president
            : null; // Winning congress members logic is more complex

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Trophy className="text-amber-500" size={18} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Election Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Current Authority</div>
                        {winner ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-white uppercase">{addressNames[winner] || winner.substring(0, 12)}</div>
                                        <Badge variant="cyan">SITTING PRESIDENT</Badge>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs font-black text-slate-600 uppercase italic">Vacant Seat</div>
                        )}
                    </Card>

                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Participation</div>
                        <div className="flex items-center gap-4">
                            <div>
                                <div className="text-2xl font-black text-white">{totalPresVotes + totalCongressVotes}</div>
                                <div className="text-[8px] font-black text-slate-600 uppercase">TOTAL BALLOTS</div>
                            </div>
                            <TrendingUp size={24} className="text-emerald-500/20" />
                        </div>
                    </Card>
                </div>

                {/* Presidential Winner Breakdown */}
                <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <Label size="small">Executive Pulse</Label>
                        <Badge variant="default">LAST 30 DAYS</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National Mandate</span>
                            <span className="text-xl font-black text-white">82.4% <span className="text-[10px] text-slate-600">CONFIDENCE</span></span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[82%]" />
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed text-center italic">
                            Authority is maintained through consistent legislative output and successful military campaigns.
                        </p>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Election Type Selection */}
            <div className="flex items-center justify-start border-b border-slate-800 pb-1 mb-6">
                <TabBar
                    tabs={[
                        { id: 'presidential', label: 'Presidential', icon: <Crown size={18} /> },
                        { id: 'congressional', label: 'Congressional', icon: <Gavel size={18} /> }
                    ]}
                    activeTab={activeElectionTab}
                    onTabChange={(id) => setActiveElectionTab(id as any)}
                    variant="pills"
                />
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Registration & Stats */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {renderCandidacySection()}
                    {renderResultsDashboard()}
                </div>

                {/* Right Column: Live Voting */}
                <div className="col-span-12 lg:col-span-8">
                    {renderVotingPanel()}
                </div>
            </div>
        </motion.div>
    );
}
