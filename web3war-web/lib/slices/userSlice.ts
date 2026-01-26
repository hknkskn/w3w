import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { CountryId, COUNTRY_IDS } from '../types';
import { CitizenProfile } from '../models/CitizenModel';
import { TrainingFacility } from '../models/TrainingModel';

export interface UserSlice {
    user: CitizenProfile | null;
    isLoggedIn: boolean;
    login: (username: string, country: CountryId, walletAddress: string) => void;
    checkWalletConnection: () => Promise<void>;
    consumeEnergy: (amount: number) => boolean;
    restoreEnergy: (amount: number) => void;
    addDamage: (amount: number) => void;
    spendCredits: (amount: number) => boolean;
    dailyReset: () => void;
    // Simulation Mechanics
    facilities: TrainingFacility[];
    fetchTraining: () => Promise<void>;
    fetchTrainingPricing: () => Promise<void>;
    train: (selectedRegimens: { id: number; cost: number; strengthBonus: number; energyCost: number }[]) => Promise<void>;
    upgradeTrainingGrounds: (regimenId: number) => Promise<void>;
    createMilitaryUnit: (name: string) => Promise<void>;
    joinMilitaryUnit: (unitId: number) => Promise<void>;
    setDailyOrder: (regionId: number) => Promise<void>;
    fetchDashboardData: () => Promise<void>;
    mintCredits: (target: string, amount: number) => Promise<void>;
    addEnergy: (target: string, amount: number) => Promise<void>;
    mintItem: (target: string, itemId: number, category: number, quality: number, quantity: number) => Promise<void>;
}

export const createUserSlice: StateCreator<GameState, [], [], UserSlice> = (set, get) => ({
    user: null,
    isLoggedIn: false,

    login: async (username, country, walletAddress) => {
        // Initial quick set for UI responsiveness
        set({
            isLoggedIn: true,
            user: {
                address: walletAddress,
                username,
                level: 1,
                xp: 0,
                nextLevelXp: 100,
                energy: 200,
                maxEnergy: 200,
                strength: 5.0,
                credits: 0,
                supraBalance: 0,
                isAdmin: false,
                countryId: COUNTRY_IDS[country] || 0,
                rankPoints: 0
            }
        });

        try {
            const { ContractService } = await import('../contract-service');

            // 1. Fetch Aggregated Profile
            const dashboardData = await ContractService.getDashboardData(walletAddress);
            const supraBalance = await ContractService.getSupraBalance(walletAddress);
            const credBalance = await ContractService.getCoinBalance(walletAddress);
            const isAdmin = await ContractService.isAdmin(walletAddress);

            // 2. Map specialized profile for employerId
            const profile = await ContractService.getProfile(walletAddress);
            const mappedUser = ContractService.mapToCitizenProfile(
                walletAddress,
                profile || dashboardData,
                supraBalance,
                credBalance,
                !!isAdmin
            );

            set({ isLoggedIn: true, user: mappedUser });

            // Trigger other slices
            get().fetchInventory();
            get().fetchCompanies();
            get().fetchTraining();

        } catch (e) {
            console.error("Login fetch error:", e);
        }
    },

    checkWalletConnection: async () => {
        // Implementation remains same
    },

    consumeEnergy: (amount) => {
        const user = get().user;
        if (!user || user.energy < amount) return false;
        set({ user: { ...user, energy: user.energy - amount } });
        return true;
    },

    restoreEnergy: (amount) => {
        const user = get().user;
        if (!user) return;
        const newEnergy = Math.min(user.energy + amount, user.maxEnergy);
        set({ user: { ...user, energy: newEnergy } });
    },

    addDamage: (amount) => {
        const user = get().user;
        if (!user) return;
        set({
            user: {
                ...user,
                rankPoints: user.rankPoints + (amount / 10),
                xp: user.xp + 1
            }
        });
    },

    spendCredits: (amount) => {
        const user = get().user;
        if (!user || user.credits < amount) return false;
        set({ user: { ...user, credits: user.credits - amount } });
        return true;
    },

    facilities: [],

    fetchTraining: async () => {
        const user = get().user;
        if (!user || !user.address) return;
        try {
            const { ContractService } = await import('../contract-service');
            const info = await ContractService.getTrainingInfo(user.address);
            const pricing = await ContractService.getTrainingPricing();

            // Mapper now handles null inputs with safe defaults
            const mappedFacilities = ContractService.mapToTrainingFacilities(info, pricing);
            set({ facilities: mappedFacilities });

            if (!info || !pricing) {
                console.warn(`[DEBUG] Training data partially missing: info=${!!info}, pricing=${!!pricing}. Using defaults.`);
            }
        } catch (e) {
            console.error("Fetch training error:", e);
        }
    },

    fetchTrainingPricing: async () => {
        // Aggregated into fetchTraining
    },

    train: async (selectedRegimens) => {
        const totalEnergy = selectedRegimens.reduce((sum, r) => sum + r.energyCost, 0);
        const totalCost = selectedRegimens.reduce((sum, r) => sum + r.cost, 0);
        const totalStrength = selectedRegimens.reduce((sum, r) => sum + r.strengthBonus, 0);
        const regimenIds = selectedRegimens.map(r => r.id);

        try {
            const { ContractService } = await import('../contract-service');
            const txHash = await ContractService.trainMulti(regimenIds);

            if (txHash) {
                const user = get().user;
                if (user) {
                    set({
                        user: {
                            ...user,
                            energy: user.energy - totalEnergy,
                            credits: Math.max(0, user.credits - totalCost),
                            strength: user.strength + totalStrength
                        }
                    });
                }
                setTimeout(() => {
                    get().fetchTraining();
                    get().fetchDashboardData();
                }, 2000);
            }
        } catch (e) {
            console.error("Training error:", e);
        }
    },

    upgradeTrainingGrounds: async (regimenId: number) => {
        console.log(`[DEBUG] userSlice.upgradeTrainingGrounds called with regimenId=${regimenId}`);
        try {
            const { ContractService } = await import('../contract-service');
            console.log(`[DEBUG] Calling ContractService.upgradeTrainingGrounds(${regimenId})...`);
            const txHash = await ContractService.upgradeTrainingGrounds(regimenId);
            console.log(`[DEBUG] upgradeTrainingGrounds txHash:`, txHash);
            if (txHash) {
                setTimeout(() => get().fetchTraining(), 2000);
            }
        } catch (e) {
            console.error("Upgrade training error:", e);
        }
    },

    dailyReset: () => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, energy: user.maxEnergy } });
    },

    createMilitaryUnit: async (name: string) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.createMilitaryUnit(name);
            if (tx) {
                const user = get().user;
                if (user) setTimeout(() => get().fetchDashboardData(), 2000);
            }
        } catch (e) {
            console.error("Create MU error:", e);
        }
    },

    joinMilitaryUnit: async (unitId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.joinMilitaryUnit(unitId);
            if (tx) {
                const user = get().user;
                if (user) setTimeout(() => get().fetchDashboardData(), 2000);
            }
        } catch (e) {
            console.error("Join MU error:", e);
        }
    },

    setDailyOrder: async (regionId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.setDailyOrder(regionId);
            if (tx) {
                alert("Daily Order updated!");
            }
        } catch (e) {
            console.error("Set Daily Order error:", e);
        }
    },

    fetchDashboardData: async () => {
        const user = get().user;
        if (!user || !user.address) return;
        try {
            const { ContractService } = await import('../contract-service');
            const dashboardData = await ContractService.getDashboardData(user.address);
            const supraBalance = await ContractService.getSupraBalance(user.address);
            const credBalance = await ContractService.getCoinBalance(user.address);
            const isAdmin = await ContractService.isAdmin(user.address);

            if (dashboardData) {
                const profile = await ContractService.getProfile(user.address);
                const mappedUser = ContractService.mapToCitizenProfile(
                    user.address,
                    profile || dashboardData,
                    supraBalance,
                    credBalance,
                    !!isAdmin
                );

                set({ user: mappedUser });

                // Refresh extra info
                get().fetchTraining();
                get().fetchInventory();
            }
        } catch (e) {
            console.error("Dashboard fetch error:", e);
        }
    },

    mintCredits: async (target, amount) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.mintCredits(target, amount * 100);
            if (tx) {
                alert(`Credits minted for ${target}!`);
                get().fetchDashboardData();
            }
        } catch (e) {
            console.error("Mint credits failed:", e);
            await get().idsTacticalAlert('TX_FAILED');
        }
    },

    addEnergy: async (target, amount) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.addEnergy(target, amount);
            if (tx) {
                alert(`Energy added to ${target}!`);
                get().fetchDashboardData();
            }
        } catch (e) {
            console.error("Add energy failed:", e);
        }
    },

    mintItem: async (target, itemId, category, quality, quantity) => {
        try {
            const { ContractService } = await import('../contract-service');
            await ContractService.mintItem(target, itemId, category, quality, quantity);

            // Refresh inventory if self-minting
            if (get().user && target === get().user!.address) {
                await get().fetchInventory();
            }
        } catch (e) {
            console.error("Mint item error:", e);
        }
    }
});
