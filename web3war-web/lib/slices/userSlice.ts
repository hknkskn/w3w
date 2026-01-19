import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Citizen, CountryId } from '../types';

export interface UserSlice {
    user: Citizen | null;
    isLoggedIn: boolean;
    login: (username: string, country: CountryId, walletAddress: string) => void;
    checkWalletConnection: () => Promise<void>;
    consumeEnergy: (amount: number) => boolean;
    restoreEnergy: (amount: number) => void;
    addDamage: (amount: number) => void;
    spendCredits: (amount: number) => boolean;
    dailyReset: () => void;
    // Simulation Mechanics
    trainingInfo: {
        qualities: number[];
        lastTrainTime: number;
        totalTrains: number;
    } | null;
    trainingPricing: {
        upgradeCosts: number[];
        regimenCosts: number[];
    } | null;
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
    // ...
    isLoggedIn: false,

    login: async (username, country, walletAddress) => {
        // Mock User Structure Initial - Real data will come from fetchProfile
        // But we need to set initial state fast
        const userState: Citizen = {
            id: walletAddress, // Use wallet address as user ID for ownership matching
            username,
            walletAddress,
            citizenship: country,
            location: { id: 1, name: 'Marmara', country },
            level: 1,
            xp: 0,
            nextLevelXp: 100,
            energy: 200,
            maxEnergy: 200,
            strength: 5.0,
            rankPoints: 0,
            credits: 0, // Game credits (mock/profile)
            employerId: undefined,
            walletBalance: 0 // New field
        };

        set({ isLoggedIn: true, user: userState });

        try {
            const { ContractService } = await import('../contract-service');

            // 1. Fetch Aggregated Profile (Simulation Stats)
            const dashboardData = await ContractService.getDashboardData(walletAddress);

            // Try to fetch employer ID separately (safely)
            let employerId = undefined;
            try {
                const profile = await ContractService.getProfile(walletAddress);
                if (profile && Number(profile.employerId) > 0) {
                    employerId = `co_${profile.employerId}`;
                }
            } catch (e) {
                console.warn("Failed to fetch extra profile info:", e);
            }

            // 2. Fetch Wallet Balances
            const credBalance = await (ContractService as any).getCoinBalance(walletAddress);
            const supraBalance = await (ContractService as any).getSupraBalance(walletAddress);

            // 3. Check Admin Status
            const isAdmin = await ContractService.isAdmin(walletAddress);

            set((state) => ({
                user: {
                    ...state.user!,
                    ...(dashboardData ? {
                        level: Number(dashboardData.level),
                        xp: Number(dashboardData.xp),
                        energy: Number(dashboardData.energy),
                        strength: Number(dashboardData.strength),
                        credits: credBalance
                    } : {}),
                    employerId: employerId,
                    walletBalance: supraBalance, // SUPRA balance
                    isAdmin: !!isAdmin
                }
            }));

            // Trigger other slices
            get().fetchInventory();
            get().fetchCompanies();
            get().fetchTraining();

        } catch (e) {
            console.error("Login fetch error:", e);
        }
    },

    checkWalletConnection: async () => {
        // Validation logic
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

    trainingInfo: null,
    trainingPricing: null,

    fetchTraining: async () => {
        const user = get().user;
        if (!user || !user.walletAddress) return;
        try {
            const { ContractService } = await import('../contract-service');
            const info = await ContractService.getTrainingInfo(user.walletAddress);
            if (info) {
                set({
                    trainingInfo: {
                        qualities: info.qualities,
                        lastTrainTime: info.lastTrainTime,
                        totalTrains: info.totalTrains
                    }
                });
            }
        } catch (e) {
            console.error("Fetch training error:", e);
        }
    },

    fetchTrainingPricing: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const pricing = await ContractService.getTrainingPricing();
            if (pricing) {
                set({ trainingPricing: pricing });
            }
        } catch (e) {
            console.error("Fetch training pricing error:", e);
        }
    },

    train: async (selectedRegimens) => {
        const totalCost = selectedRegimens.reduce((sum, r) => sum + r.cost, 0);
        const totalEnergy = selectedRegimens.reduce((sum, r) => sum + r.energyCost, 0);
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
                            credits: user.credits - totalCost,
                            strength: user.strength + totalStrength
                        }
                    });
                }
                setTimeout(() => {
                    get().fetchTraining();
                    get().fetchDashboardData(); // Refresh full stats
                }, 2000);
            }
        } catch (e) {
            console.error("Training error:", e);
        }
    },

    upgradeTrainingGrounds: async (regimenId: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const txHash = await ContractService.upgradeTrainingGrounds(regimenId);
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
                setTimeout(() => get().login(get().user!.username, get().user!.citizenship, get().user!.walletAddress!), 2000);
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
                setTimeout(() => get().login(get().user!.username, get().user!.citizenship, get().user!.walletAddress!), 2000);
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
        if (!user || !user.walletAddress) return;
        try {
            const { ContractService } = await import('../contract-service');
            const dashboardData = await ContractService.getDashboardData(user.walletAddress);
            const credBalance = await ContractService.getCoinBalance(user.walletAddress);
            const supraBalance = await ContractService.getSupraBalance(user.walletAddress);

            // Try to refresh employer ID separately
            let employerId = get().user?.employerId; // Keep existing by default
            try {
                const profile = await ContractService.getProfile(user.walletAddress);
                if (profile) {
                    employerId = Number(profile.employerId) > 0 ? `co_${profile.employerId}` : undefined;
                }
            } catch (e) { console.warn("Profile fetch failed in dashboard update", e); }

            if (dashboardData) {
                set((state) => ({
                    user: {
                        ...state.user!,
                        level: Number(dashboardData.level),
                        xp: Number(dashboardData.xp),
                        energy: Number(dashboardData.energy),
                        strength: Number(dashboardData.strength),
                        employerId,
                        credits: credBalance,
                        walletBalance: supraBalance
                    }
                }));

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
            if (target === get().user?.walletAddress) {
                await get().fetchInventory();
            }
        } catch (e) {
            console.error("Mint item error:", e);
        }
    }
});
