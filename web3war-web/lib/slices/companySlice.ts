import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { CompanyProfile } from '../models/CompanyModel';

export interface CompanySlice {
    companies: CompanyProfile[];
    fetchCompanies: () => Promise<void>;
    createCompany: (name: string, type: number) => void;
    postJob: (companyId: number, salary: number, positions: number) => Promise<void>;
    applyForJob: (companyId: number) => Promise<void>;
    resignJob: () => Promise<void>;
    work: () => Promise<void>;
    depositCompanyFunds: (companyId: number, amount: number) => void;
    withdrawCompanyProduct: (companyId: number, amount: number) => void;
    depositCompanyRaw: (companyId: number, itemId: number, amount: number) => void;
    upgradeCompanyQuality: (companyId: number) => Promise<void>;
}

export const createCompanySlice: StateCreator<GameState, [], [], CompanySlice> = (set, get) => ({
    companies: [],

    fetchCompanies: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const chainCompanies = await ContractService.getAllCompanies();
            const mappedCompanies = ContractService.mapToCompanies(chainCompanies);
            set({ companies: mappedCompanies });
        } catch (e) {
            console.error("Store: Failed to fetch companies", e);
        }
    },

    createCompany: async (name, type) => {
        const user = get().user;
        if (!user) return;

        try {
            const { ContractService } = await import('../contract-service');
            // Hardcoding Region ID 1 (Marmara) for now as we don't have region selection in UI yet
            const regionId = 1;

            const txHash = await ContractService.createCompany(name, type, regionId);
            console.log("Create Company TX:", txHash);

            await get().idsAlert("Company creation transaction sent! Waiting for confirmation...", "Industrial Registry", "success");

            setTimeout(() => {
                get().fetchDashboardData();
                get().fetchCompanies();
            }, 4000);

        } catch (e) {
            console.error("Failed to create company:", e);
            await get().idsAlert("Failed to create company transaction.", "Registry Error", "error");
        }
    },

    postJob: async (companyId, salary, positions) => {
        try {
            const { ContractService } = await import('../contract-service');
            // Convert salary to CRED atomic units (8 decimals)
            const salaryInAtomicUnits = salary * 100; // 10^2
            const tx = await ContractService.postJobOffer(companyId, salaryInAtomicUnits, positions);

            if (tx) {
                await get().idsAlert("Job offer posted! Waiting for confirmation...", "Employment Bureau", "success");
                setTimeout(() => get().fetchCompanies(), 4000);
            }
        } catch (e) {
            console.error("Post job failed:", e);
            await get().idsAlert("Failed to post job offer.", "Employment Error", "error");
        }
    },

    applyForJob: async (companyId) => {
        try {
            const user = get().user;
            if (!user) return;

            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.takeJob(companyId);

            if (tx) {
                await get().idsAlert("Job Application Sent! Waiting for confirmation...", "Employment Bureau", "success");
                set((state) => ({
                    user: { ...state.user!, employerId: companyId }
                }));
            }
        } catch (e) {
            console.error("Failed to apply:", e);
            await get().idsAlert("Failed to apply for job.", "Employment Error", "error");
        }
    },

    resignJob: async () => {
        try {
            const user = get().user;
            if (!user || user.employerId === undefined) {
                await get().idsAlert("You are not employed!", "Industrial Status", "warning");
                return;
            }

            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.resignJob(user.employerId);

            if (tx) {
                await get().idsAlert("Resignation submitted! Waiting for confirmation...", "Employment Bureau", "warning");
                set((state) => ({
                    user: { ...state.user!, employerId: undefined }
                }));
            }
        } catch (e) {
            console.error("Failed to resign:", e);
            await get().idsAlert("Failed to resign from job.", "Employment Error", "error");
        }
    },

    work: async () => {
        try {
            const user = get().user;
            if (!user || user.employerId === undefined) {
                await get().idsAlert("You are unemployed!", "Industrial Status", "warning");
                return;
            }

            if (user.energy < 10) {
                await get().idsTacticalAlert('INSUFFICIENT_ENERGY');
                return;
            }

            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.performWork(user.employerId);

            if (tx) {
                await get().idsAlert("Work Shift Complete! Salary + XP earned.", "Industrial Output", "success");
                set((state) => ({
                    user: { ...state.user!, energy: Math.max(0, state.user!.energy - 10) }
                }));
                get().fetchInventory();
                setTimeout(() => get().fetchDashboardData(), 3000);
            }
        } catch (e) {
            console.error("Work failed:", e);
            await get().idsTacticalAlert('TX_FAILED');
        }
    },

    withdrawCompanyProduct: async (companyId, amount) => {
        try {
            const { ContractService } = await import('../contract-service');
            await ContractService.withdrawCompanyProduct(companyId, amount);

            await get().idsAlert(`Successfully withdrawn ${amount} units. Transaction sent.`, "Logistics Hub", "success");

            setTimeout(() => {
                get().fetchInventory();
                get().fetchCompanies();
            }, 4000);

        } catch (e) {
            console.error("Withdraw failed:", e);
            await get().idsAlert("Failed to withdraw products.", "Logistics Error", "error");
        }
    },

    depositCompanyRaw: async (companyId, itemId, amount) => {
        try {
            const { ContractService } = await import('../contract-service');
            await ContractService.depositCompanyRaw(companyId, itemId, amount);

            await get().idsAlert(`Raw materials deposited. Transaction sent.`, "Supply Chain", "success");

            setTimeout(() => {
                get().fetchCompanies();
                get().fetchInventory();
            }, 4000);

        } catch (e) {
            console.error("Deposit failed:", e);
            await get().idsAlert("Failed to deposit raw materials.", "Supply Error", "error");
        }
    },

    depositCompanyFunds: async (companyId, amount) => {
        try {
            const { ContractService } = await import('../contract-service');
            // Convert amount to CRED atomic units (8 decimals)
            const amountInAtomicUnits = amount * 100; // 10^2
            const tx = await ContractService.depositCompanyFunds(companyId, amountInAtomicUnits);

            if (tx) {
                await get().idsAlert("Funds deposited! Waiting for confirmation...", "Treasury System", "success");
                setTimeout(() => {
                    get().fetchCompanies();
                    get().fetchDashboardData();
                }, 4000);
            }
        } catch (e) {
            console.error("Deposit funds failed:", e);
            await get().idsAlert("Failed to deposit funds.", "Treasury Error", "error");
        }
    },

    upgradeCompanyQuality: async (companyId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.upgradeCompanyQuality(companyId);

            if (tx) {
                await get().idsAlert("Quality Upgrade Transaction Sent! Waiting for confirmation...", "Facility Upgrade", "success");
                setTimeout(() => get().fetchCompanies(), 4000);
            }
        } catch (e) {
            console.error("Upgrade failed:", e);
            await get().idsAlert("Failed to upgrade company quality.", "Engineering Error", "error");
        }
    }
});
