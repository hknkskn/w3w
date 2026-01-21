import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Proposal, ElectionCandidate, CountryData } from '../types';

export interface GovernanceSlice {
    countryData: Record<number, CountryData>;
    proposals: Proposal[];
    electionCandidates: Record<number, ElectionCandidate[]>;
    treasuryBalance: Record<number, number>;
    isCongressMember: boolean;

    fetchCountryData: (countryId: number) => Promise<void>;
    fetchTreasuryBalance: (countryId: number) => Promise<void>;
    fetchProposals: () => Promise<void>;
    fetchCandidates: (countryId: number) => Promise<void>;
    checkCongressMembership: (countryId: number) => Promise<void>;

    registerAsCandidate: (countryId: number) => Promise<void>;
    voteForCandidate: (countryId: number, candidateIdx: number) => Promise<void>;
    createProposal: (countryId: number, type: number, data: number[]) => Promise<void>;
    voteOnProposal: (proposalId: number, support: boolean) => Promise<void>;
    initializeGovernance: () => Promise<void>;

    // Admin Functions
    startElection: (countryId: number) => Promise<void>;
    endElection: (countryId: number) => Promise<void>;
    appointCongress: (countryId: number, members: string[]) => Promise<void>;
    appointPresident: (countryId: number, president: string) => Promise<void>;
    initiateWarDeclaration: (countryId: number, targetCountryId: number) => Promise<void>;
    initiateImpeachment: (countryId: number) => Promise<void>;
    executiveDecree: (countryId: number, taxType: number, newRate: number) => Promise<void>;
}

export const createGovernanceSlice: StateCreator<GameState, [], [], GovernanceSlice> = (set, get) => ({
    countryData: {},
    proposals: [],
    electionCandidates: {},
    treasuryBalance: {},
    isCongressMember: false,

    fetchCountryData: async (countryId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await ContractService.getCountryData(countryId);
            if (data) {
                set(state => ({
                    countryData: { ...state.countryData, [countryId]: { ...data, id: countryId } }
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
            const isMember = await (ContractService as any).checkCongressMember(user.address, countryId);
            set({ isCongressMember: !!isMember });
        } catch (e) {
            console.error("Store: Failed to check congress membership", e);
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

    initiateWarDeclaration: async (countryId, targetCountryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await (ContractService as any).initiateWarDeclaration(countryId, targetCountryId);
            if (tx) {
                await get().idsAlert("War declaration initiated!", "Strategic Command", "warning");
                setTimeout(() => get().fetchCountryData(countryId), 3000);
            }
        } catch (e) {
            console.error("War declaration failed:", e);
            await get().idsAlert("Operation aborted: Check authorization or funds.", "Command Error", "error");
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
            await get().idsAlert("Registry Error: Check citizenship or CRED balance.", "Governance Error", "error");
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
