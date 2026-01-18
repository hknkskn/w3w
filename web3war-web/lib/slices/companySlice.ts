import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Company, CompanyType, Item } from '../types';

export interface CompanySlice {
    companies: Company[];
    fetchCompanies: () => Promise<void>;
    createCompany: (name: string, type: CompanyType) => void;
    postJob: (companyId: string, salary: number, positions: number) => Promise<void>;
    applyForJob: (companyId: string) => Promise<void>;
    resignJob: () => Promise<void>;
    work: () => Promise<void>;
    depositCompanyFunds: (companyId: string, amount: number) => void;
    withdrawCompanyProduct: (companyId: string, amount: number) => void;
    depositCompanyRaw: (companyId: string, itemId: string, amount: number) => void;
    upgradeCompanyQuality: (companyId: string) => Promise<void>;
}

// Helper to parse Move strings (hex or byte array)
const parseMoveString = (value: any) => {
    if (typeof value === 'string') {
        if (value.startsWith('0x')) {
            const hex = value.slice(2);
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
            }
            return str;
        }
        return value;
    }
    if (Array.isArray(value)) {
        return String.fromCharCode(...value);
    }
    return '';
};

export const createCompanySlice: StateCreator<GameState, [], [], CompanySlice> = (set, get) => ({
    companies: [],

    fetchCompanies: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const chainCompanies = await ContractService.getAllCompanies();

            const mappedCompanies: Company[] = chainCompanies.map((c: any) => ({
                id: `co_${c.id}`,
                ownerId: c.owner,
                name: parseMoveString(c.name),
                type: c.co_type === 1 ? 'RAW_GRAIN'
                    : c.co_type === 2 ? 'RAW_IRON'
                        : c.co_type === 3 ? 'RAW_OIL'
                            : c.co_type === 4 ? 'RAW_ALUMINUM'
                                : c.co_type === 11 ? 'MFG_FOOD'
                                    : c.co_type === 12 ? 'MFG_WEAPON'
                                        : c.co_type === 13 ? 'MFG_TRANSPORT'
                                            : 'MFG_MISSILE',
                quality: c.quality,
                region: `Region ${c.region_id}`,
                funds: Number(c.balance),
                inventory: {
                    rawMaterial: Number(c.raw_stock),
                    products: Number(c.product_stock)
                },
                employees: c.employees,
                jobOffer: {
                    id: `job_${c.id}`,
                    companyId: `co_${c.id}`,
                    companyName: parseMoveString(c.name),
                    salary: Number(c.job_offer.salary),
                    positions: Number(c.job_offer.open_positions),
                    active: Boolean(c.job_offer.active), // Fixed: Mapping the active field
                    minSkill: 0
                },
                rawStock: Number(c.raw_stock),
                productStock: Number(c.product_stock)
            }));

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

            // Map string type to u8
            // 'RAW_GRAIN': 1, 'RAW_IRON': 2, 'RAW_OIL': 3, 'MFG_FOOD': 11, 'MFG_WEAPON': 12
            let typeId = 1;
            if (type === 'RAW_IRON') typeId = 2;
            if (type === 'RAW_OIL') typeId = 3;
            if (type === 'RAW_ALUMINUM') typeId = 4;
            if (type === 'MFG_FOOD') typeId = 11;
            if (type === 'MFG_WEAPON') typeId = 12;
            if (type === 'MFG_TRANSPORT') typeId = 13;
            if (type === 'MFG_MISSILE') typeId = 14;

            const txHash = await ContractService.createCompany(name, typeId, regionId);
            console.log("Create Company TX:", txHash);

            alert("Company creation transaction sent! Waiting for confirmation...");

            // Optimistic update or wait for refresh
            // For now, let's just trigger a refresh after a delay
            setTimeout(() => {
                get().fetchCompanies();
                get().spendCredits(40); // Optimistic credit deduction
            }, 4000);

        } catch (e) {
            console.error("Failed to create company:", e);
            alert("Failed to create company transaction.");
        }
    },

    postJob: async (companyId, salary, positions) => {
        try {
            const numericId = Number(companyId.replace('co_', ''));
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.postJobOffer(numericId, salary, positions);

            if (tx) {
                alert("Job offer posted! Waiting for confirmation...");
                setTimeout(() => get().fetchCompanies(), 4000);
            }
        } catch (e) {
            console.error("Post job failed:", e);
            alert("Failed to post job offer.");
        }
    },

    applyForJob: async (companyId) => {
        try {
            const user = get().user;
            if (!user) return;

            const numericId = Number(companyId.replace('co_', ''));

            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.takeJob(numericId);

            if (tx) {
                alert("Job Application Sent! Waiting for confirmation...");
                set((state) => ({
                    user: { ...state.user!, employerId: companyId }
                }));
            }
        } catch (e) {
            console.error("Failed to apply:", e);
            alert("Failed to apply for job.");
        }
    },

    resignJob: async () => {
        try {
            const user = get().user;
            if (!user || !user.employerId) {
                alert("You are not employed!");
                return;
            }

            const numericId = Number(String(user.employerId).replace('co_', ''));

            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.resignJob(numericId);

            if (tx) {
                alert("Resignation submitted! Waiting for confirmation...");
                set((state) => ({
                    user: { ...state.user!, employerId: undefined }
                }));
            }
        } catch (e) {
            console.error("Failed to resign:", e);
            alert("Failed to resign from job.");
        }
    },

    work: async () => {
        try {
            const user = get().user;
            if (!user || !user.employerId) {
                alert("You are unemployed!");
                return;
            }

            if (user.energy < 10) {
                alert("Not enough energy (Need 10)!");
                return;
            }

            const numericId = Number(String(user.employerId).replace('co_', ''));

            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.performWork(numericId);

            if (tx) {
                alert("Work Shift Complete! Salary + XP earned.");
                set((state) => ({
                    user: { ...state.user!, energy: state.user!.energy - 10 }
                }));
                get().fetchInventory();
            }
        } catch (e) {
            console.error("Work failed:", e);
            alert("Failed to work. Check console.");
        }
    },

    withdrawCompanyProduct: async (companyId, amount) => {
        try {
            const state = get();
            const company = state.companies.find(c => c.id === companyId);
            if (!company) return;

            if ((company.productStock || 0) < amount) {
                alert("Insufficient product stock!");
                return;
            }

            const numericId = Number(companyId.replace('co_', ''));

            const { ContractService } = await import('../contract-service');
            await ContractService.withdrawCompanyProduct(numericId, amount);

            alert(`Successfully withdrawn ${amount} units. Transaction sent.`);

            // Optimistic update
            set({
                companies: state.companies.map(c =>
                    c.id === companyId ? { ...c, productStock: (c.productStock || 0) - amount } : c
                )
            });

            // Refresh inventory after delay
            setTimeout(() => {
                get().fetchInventory();
                get().fetchCompanies();
            }, 4000);

        } catch (e) {
            console.error("Withdraw failed:", e);
            alert("Failed to withdraw products.");
        }
    },

    depositCompanyRaw: async (companyId, itemId, amount) => {
        try {
            const state = get();
            const company = state.companies.find(c => c.id === companyId);
            if (!company) return;

            const numericCoId = Number(companyId.replace('co_', ''));
            // Assuming itemId is passed as numeric ID string or we parse it
            // Mapping string IDs or generic IDs to Move-specific Item IDs
            let finalItemId = Number(itemId.replace('item_', ''));
            if (Number.isNaN(finalItemId)) {
                if (itemId.includes('grain')) finalItemId = 101;
                else if (itemId.includes('iron')) finalItemId = 102;
                else if (itemId.includes('oil')) finalItemId = 103;
                else if (itemId.includes('aluminum')) finalItemId = 104;
            }

            const { ContractService } = await import('../contract-service');
            await ContractService.depositCompanyRaw(numericCoId, finalItemId, amount);

            alert(`Raw materials deposited. Transaction sent.`);

            // Optimistic update
            state.fetchCompanies();
            state.fetchInventory();

        } catch (e) {
            console.error("Deposit failed:", e);
            alert("Failed to deposit raw materials.");
        }
    },

    depositCompanyFunds: async (companyId, amount) => {
        try {
            const numericId = Number(companyId.replace('co_', ''));
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.depositCompanyFunds(numericId, amount);

            if (tx) {
                alert("Funds deposited! Waiting for confirmation...");
                setTimeout(() => get().fetchCompanies(), 4000);
            }
        } catch (e) {
            console.error("Deposit funds failed:", e);
            alert("Failed to deposit funds.");
        }
    },

    upgradeCompanyQuality: async (companyId) => {
        try {
            const numericId = Number(companyId.replace('co_', ''));
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.upgradeCompanyQuality(numericId);

            if (tx) {
                alert("Quality Upgrade Transaction Sent! Waiting for confirmation...");
                setTimeout(() => get().fetchCompanies(), 4000);
            }
        } catch (e) {
            console.error("Upgrade failed:", e);
            alert("Failed to upgrade company quality.");
        }
    }
});
