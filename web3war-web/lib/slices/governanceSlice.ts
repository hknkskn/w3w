import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Proposal, ElectionCandidate, CountryData } from '../types';

export interface GovernanceSlice {
    countryData: Record<number, CountryData>;
    proposals: Proposal[];
    electionCandidates: Record<number, ElectionCandidate[]>;
    treasuryBalance: Record<number, number>;
    isCongressMember: boolean;
    congressElectionData: Record<number, { active: boolean, endTime: number, candidates: string[], votes: number[] }>;

    claimableSalary: Record<string, number>;
    countryGovernance: Record<number, { minWage: number, maxCongress: number, presSalary: number, congSalary: number }>;
    warStatus: Record<number, number[]>;

    // War Mechanics 2.0
    isLandless: boolean;
    reclaimableRegions: number[];
    topDonors: Record<number, { addr: string, amount: number }[]>;
    cooldowns: Record<number, { topicType: number, lastTime: number }[]>;

    fetchCountryData: (countryId: number) => Promise<void>;
    fetchTreasuryBalance: (countryId: number) => Promise<void>;
    fetchProposals: () => Promise<void>;
    fetchCandidates: (countryId: number) => Promise<void>;
    checkCongressMembership: (countryId: number) => Promise<void>;
    fetchCongressElectionData: (countryId: number) => Promise<void>;
    fetchClaimableSalary: (addr: string, countryId: number) => Promise<void>;
    fetchCountryGovernance: (countryId: number) => Promise<void>;
    fetchWarStatus: (countryId: number) => Promise<void>;
    fetchTopDonors: (countryId: number) => Promise<void>;
    fetchCooldowns: (countryId: number) => Promise<void>;

    // War Mechanics 2.0 Actions
    fetchLandlessStatus: (countryId: number) => Promise<void>;
    fetchReclaimableRegions: (countryId: number) => Promise<void>;
    declareWar: (countryId: number, targetCountryId: number, regionId: number) => Promise<void>;
    startResistance: (regionId: number) => Promise<void>;

    registerAsCandidate: (countryId: number) => Promise<void>;
    voteForCandidate: (countryId: number, candidateIdx: number) => Promise<void>;
    createProposal: (countryId: number, type: number, data: number[]) => Promise<void>;
    voteOnProposal: (proposalId: number, support: boolean) => Promise<void>;
    finalizeProposal: (proposalId: number) => Promise<void>;
    claimSalary: (countryId: number) => Promise<void>;
    donateToTreasury: (countryId: number, amount: number) => Promise<void>;
    initializeGovernance: () => Promise<void>;

    // Congress Election Cycle
    startCongressElection: (countryId: number) => Promise<void>;
    registerCongressCandidate: (countryId: number) => Promise<void>;
    voteCongress: (countryId: number, candidateIdx: number) => Promise<void>;
    endCongressElection: (countryId: number) => Promise<void>;

    // Admin Functions
    startElection: (countryId: number) => Promise<void>;
    endElection: (countryId: number) => Promise<void>;
    appointCongress: (countryId: number, members: string[]) => Promise<void>;
    appointPresident: (countryId: number, president: string) => Promise<void>;
    initiateImpeachment: (countryId: number) => Promise<void>;
    executiveDecree: (countryId: number, taxType: number, newRate: number) => Promise<void>;
}

export const createGovernanceSlice: StateCreator<GameState, [], [], GovernanceSlice> = (set, get) => ({
    countryData: {},
    proposals: [],
    electionCandidates: {},
    treasuryBalance: {},
    isCongressMember: false,
    claimableSalary: {},
    countryGovernance: {},
    warStatus: {},
    congressElectionData: {},
    isLandless: false,
    reclaimableRegions: [],
    topDonors: {},
    cooldowns: {},

    fetchCountryData: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await ContractService.getCountryData(countryId);
            if (data) {
                set(state => ({
                    countryData: { ...state.countryData, [countryId]: { ...data, id: countryId, electionEndTime: data.electionEndTime || 0 } }
                }));
            }
        } catch (e) {
            console.error("Store: Failed to fetch country data", e);
        }
    },

    fetchTreasuryBalance: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const balance = await ContractService.getTreasuryBalance(countryId);
            set(state => ({
                treasuryBalance: { ...state.treasuryBalance, [countryId]: balance }
            }));
        } catch (e) {
            console.error("Store: Failed to fetch treasury balance", e);
        }
    },

    checkCongressMembership: async (countryId: number) => {
        const { user } = get();
        if (!user || !user.address) return;
        try {
            const { ContractService } = await import('../contract-service');
            const isMember = await (ContractService as any).isCongressMember(user.address, countryId);
            set({ isCongressMember: !!isMember });
        } catch (e) {
            console.error("Store: Failed to check congress membership", e);
        }
    },

    fetchCongressElectionData: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await (ContractService as any).getCongressElectionData(countryId);
            if (data) {
                set(state => ({
                    congressElectionData: {
                        ...state.congressElectionData,
                        [countryId]: {
                            active: !!data.active,
                            endTime: Number(data.endTime),
                            candidates: data.candidates || [],
                            votes: (data.votes || []).map(Number)
                        }
                    }
                }));
            }
        } catch (e) {
            console.error("Store: Failed to fetch congress election data", e);
        }
    },

    fetchClaimableSalary: async (addr: string, countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const amount = await (ContractService as any).getClaimableSalary(addr, countryId);
            set(state => ({
                claimableSalary: { ...state.claimableSalary, [`${addr}-${countryId}`]: Number(amount) }
            }));
        } catch (e) {
            console.error("Store: Failed to fetch claimable salary", e);
        }
    },

    fetchCountryGovernance: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await (ContractService as any).getCountryGovernanceData(countryId);
            if (data) {
                set(state => ({
                    countryGovernance: {
                        ...state.countryGovernance,
                        [countryId]: {
                            minWage: Number(data.minWage),
                            maxCongress: Number(data.maxCongress),
                            presSalary: Number(data.presSalary),
                            congSalary: Number(data.congSalary)
                        }
                    }
                }));
            }
        } catch (e) {
            console.error("Store: Failed to fetch country governance", e);
        }
    },

    fetchWarStatus: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const status = await (ContractService as any).getWarStatus(countryId);
            if (status) {
                // Ensure status is an array to avoid map errors
                const statusArray = Array.isArray(status) ? status : [status];
                set(state => ({
                    warStatus: { ...state.warStatus, [countryId]: statusArray.map(Number) }
                }));
            }
        } catch (e) {
            console.error("Store: Failed to fetch war status", e);
        }
    },

    fetchTopDonors: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const donors = await (ContractService as any).getTopDonors(countryId);
            set(state => ({
                topDonors: { ...state.topDonors, [countryId]: donors }
            }));
        } catch (e) {
            console.error("Store: Failed to fetch top donors", e);
        }
    },

    fetchCooldowns: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await (ContractService as any).getCooldowns(countryId);
            if (data) {
                const types = data[0] || [];
                const times = data[1] || [];
                const mapped = types.map((type: any, i: number) => ({
                    topicType: Number(type),
                    lastTime: Number(times[i])
                }));
                set(state => ({
                    cooldowns: { ...state.cooldowns, [countryId]: mapped }
                }));
            }
        } catch (e) {
            console.error("Store: Failed to fetch cooldowns", e);
        }
    },

    fetchLandlessStatus: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const isLandless = await ContractService.isCountryLandless(countryId);
            set({ isLandless });
        } catch (e) {
            console.error("Store: Failed to fetch landless status", e);
        }
    },

    fetchReclaimableRegions: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const regions = await ContractService.getReclaimableRegions(countryId);
            set({ reclaimableRegions: regions.map(Number) });
        } catch (e) {
            console.error("Store: Failed to fetch reclaimable regions", e);
        }
    },

    declareWar: async (countryId, targetCountryId, regionId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.declareWar(countryId, targetCountryId, regionId);
            if (tx) {
                await get().idsAlert("War declared!", "Strategic Command", "warning");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("War declaring failed:", e);
            await get().idsAlert("Operation aborted.", "Command Error", "error");
        }
    },

    startResistance: async (regionId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.startResistance(regionId);
            if (tx) {
                await get().idsAlert("Resistance war started!", "Freedom Fighters", "warning");
                const { user } = get();
                if (user?.countryId) {
                    setTimeout(() => get().fetchLandlessStatus(user.countryId!), 3000);
                }
            }
        } catch (e) {
            console.error("Resistance start failed:", e);
        }
    },

    fetchProposals: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const chainProposals = await ContractService.getProposals();

            const mapped: Proposal[] = chainProposals.map((p: any) => ({
                id: Number(p.id),
                countryId: Number(p.country_id),
                proposer: p.proposer,
                type: Number(p.proposal_type),
                data: p.data,
                yesVotes: Number(p.yes_votes),
                noVotes: Number(p.no_votes),
                executed: p.executed,
                createdAt: Number(p.created_at)
            }));

            set({ proposals: mapped });
        } catch (e) {
            console.error("Store: Failed to fetch proposals", e);
        }
    },

    fetchCandidates: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await ContractService.getCandidates(countryId);

            const candidates: ElectionCandidate[] = data.addresses.map((addr: string, idx: number) => ({
                address: addr,
                username: `Candidate ${addr.substring(0, 6)}`,
                votes: Number(data.votes[idx])
            }));

            set(state => ({
                electionCandidates: { ...state.electionCandidates, [countryId]: candidates }
            }));
        } catch (e) {
            console.error("Store: Failed to fetch candidates", e);
        }
    },

    registerAsCandidate: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.registerCandidate(countryId);
            if (tx) {
                await get().idsAlert("Candidate registration sent!", "Election Bureau", "success");
                setTimeout(() => get().fetchCandidates(countryId), 3000);
            }
        } catch (e) {
            console.error("Registration failed:", e);
            await get().idsTacticalAlert('STRENGTH_LOW');
        }
    },

    voteForCandidate: async (countryId, candidateIdx) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.vote(countryId, candidateIdx);
            if (tx) {
                await get().idsAlert("Vote casted successfully!", "Election Bureau", "success");
                setTimeout(() => get().fetchCandidates(countryId), 3000);
            }
        } catch (e) {
            console.error("Voting failed:", e);
        }
    },

    createProposal: async (countryId, type, data) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.createProposal(countryId, type, data);
            if (tx) {
                await get().idsAlert("Proposal created!", "Congress Registry", "success");
                setTimeout(() => get().fetchProposals(), 3000);
            }
        } catch (e) {
            console.error("Proposal creation failed:", e);
        }
    },

    voteOnProposal: async (proposalId, support) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.voteProposal(proposalId, support);
            if (tx) {
                await get().idsAlert("Vote on proposal sent!", "Congress Registry", "success");
                setTimeout(() => get().fetchProposals(), 3000);
            }
        } catch (e) {
            console.error("Proposal voting failed:", e);
        }
    },

    finalizeProposal: async (proposalId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).finalizeProposal(proposalId);
            if (tx) {
                await get().idsAlert("Proposal finalized and executed!", "Congress Registry", "success");
                setTimeout(() => get().fetchProposals(), 3000);
            }
        } catch (e) {
            console.error("Proposal finalization failed:", e);
        }
    },

    claimSalary: async (countryId) => {
        const { user } = get();
        if (!user || !user.address) return;
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).claimSalary(countryId);
            if (tx) {
                await get().idsAlert("Salary claimed successfully!", "National Treasury", "success");
                setTimeout(() => {
                    get().fetchClaimableSalary(user.address, countryId);
                    get().fetchDashboardData();
                }, 3000);
            }
        } catch (e) {
            console.error("Salary claim failed:", e);
        }
    },

    donateToTreasury: async (countryId, amount) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).donateToTreasury(countryId, amount);
            if (tx) {
                await get().idsAlert("Thank you for your donation!", "National Treasury", "success");
                setTimeout(() => {
                    get().fetchTreasuryBalance(countryId);
                    get().fetchTopDonors(countryId);
                }, 3000);
            }
        } catch (e) {
            console.error("Donation failed:", e);
        }
    },

    startCongressElection: async (countryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).startCongressElection(countryId);
            if (tx) {
                await get().idsAlert("Congress election started!", "System", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Congress election start failed:", e);
        }
    },

    registerCongressCandidate: async (countryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).registerCongressCandidate(countryId);
            if (tx) {
                await get().idsAlert("Congress candidacy active!", "System", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Congress candidacy failed:", e);
            await get().idsTacticalAlert('RANK_LOW');
        }
    },

    voteCongress: async (countryId, candidateIdx) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).voteCongress(countryId, candidateIdx);
            if (tx) {
                await get().idsAlert("Vote for Congress casted!", "System", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Congress voting failed:", e);
        }
    },

    endCongressElection: async (countryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).endCongressElection(countryId);
            if (tx) {
                await get().idsAlert("Congress election ended!", "System", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Congress election end failed:", e);
        }
    },

    initializeGovernance: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const countries = [
                { id: 1, name: 'Nigeria' },
                { id: 2, name: 'Ukraine' },
                { id: 3, name: 'Russia' },
                { id: 4, name: 'United States' },
                { id: 5, name: 'Turkey' },
                { id: 6, name: 'India' },
                { id: 7, name: 'Spain' },
                { id: 8, name: 'Poland' },
                { id: 9, name: 'Brazil' },
                { id: 10, name: 'France' }
            ];

            for (const country of countries) {
                console.log(`Setting up ${country.name}...`);
                await ContractService.setupCountry(country.id, country.name);
                await new Promise(r => setTimeout(r, 500));
            }

            await get().idsAlert("Governance initialized with 10 countries!", "Foundation Protocol", "success");
        } catch (e) {
            console.error("Governance initialization failed:", e);
            await get().idsAlert("Failed to initialize governance", "System Error", "error");
        }
    },

    startElection: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.startElection(countryId);
            if (tx) {
                await get().idsAlert("Election cycle triggered!", "System Admin", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Failed to start election:", e);
        }
    },

    endElection: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.endElection(countryId);
            if (tx) {
                await get().idsAlert("Election cycle finalized!", "System Admin", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Failed to end election:", e);
        }
    },

    appointCongress: async (countryId: number, members: string[]) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.appointCongress(countryId, members);
            if (tx) {
                await get().idsAlert("Congress members appointed!", "System Admin", "success");
                setTimeout(() => get().checkCongressMembership(countryId), 3000);
            }
        } catch (e) {
            console.error("Failed to appoint congress:", e);
        }
    },

    appointPresident: async (countryId: number, president: string) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.appointPresident(countryId, president);
            if (tx) {
                await get().idsAlert("Executive authority appointed!", "System Admin", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Failed to appoint president:", e);
        }
    },


    initiateImpeachment: async (countryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).initiateImpeachment(countryId);
            if (tx) {
                await get().idsAlert("Impeachment protocol activated!", "Governance Bureau", "warning");
                setTimeout(() => get().fetchProposals(), 3000);
            }
        } catch (e) {
            console.error("Impeachment initiation failed:", e);
            await get().idsTacticalAlert('INSUFFICIENT_CREDITS');
        }
    },

    executiveDecree: async (countryId, taxType, newRate) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).executiveDecree(countryId, taxType, newRate);
            if (tx) {
                await get().idsAlert("Executive decree synchronized!", "Council Presidency", "success");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("Executive decree failed:", e);
            await get().idsAlert("Directive Rejected: Outside regulated range (5-20%)", "Council Error", "error");
        }
    }
});
