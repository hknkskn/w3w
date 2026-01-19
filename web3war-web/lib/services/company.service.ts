import { BaseService, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';

export const CompanyService = {
    /**
     * Get all companies
     */
    getAllCompanies: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.COMPANY}::get_all_companies`, [], []);
            const companies = result?.result?.[0] || result?.[0];

            if (!companies || !Array.isArray(companies)) return [];
            return companies;
        } catch (e) {
            console.error("Failed to fetch companies:", e);
            return [];
        }
    },

    /**
     * Create a new company
     */
    createCompany: async (name: string, type: number, regionId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "create_company",
            [],
            [
                Array.from(BCS.bcsSerializeStr(name)),
                Array.from(BCS.bcsSerializeU8(type)),
                Array.from(BCS.bcsSerializeUint64(BigInt(regionId)))
            ]
        );
    },

    /**
     * Post a Job Offer
     */
    postJobOffer: async (companyId: number, salary: number, positions: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "post_job_offer",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(BigInt(companyId))),
                Array.from(BCS.bcsSerializeUint64(BigInt(salary))),
                Array.from(BCS.bcsSerializeUint64(BigInt(positions)))
            ]
        );
    },

    /**
     * Apply for a Job
     */
    takeJob: async (companyId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "take_job",
            [],
            [Array.from(BCS.bcsSerializeUint64(BigInt(companyId)))]
        );
    },

    /**
     * Resign from Job
     */
    resignJob: async (companyId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "resign_job",
            [],
            [Array.from(BCS.bcsSerializeUint64(BigInt(companyId)))]
        );
    },

    /**
     * Perform Work Shift
     */
    performWork: async (companyId: number): Promise<string> => {
        console.log(`[CompanyService] Performing work at company ID: ${companyId}`);
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "work",
            [],
            [Array.from(BCS.bcsSerializeUint64(BigInt(companyId)))]
        );
    },

    /**
     * Deposit Funds to Treasury
     */
    depositCompanyFunds: async (companyId: number, amount: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "deposit_funds",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(BigInt(companyId))),
                Array.from(BCS.bcsSerializeUint64(BigInt(amount)))
            ]
        );
    },

    /**
     * Deposit Raw Materials
     */
    depositCompanyRaw: async (companyId: number, itemId: number, amount: number): Promise<string> => {
        console.log(`[CompanyService] Depositing raw: companyId=${companyId}, itemId=${itemId}, amount=${amount}`);
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "deposit_raw",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(BigInt(companyId))),
                Array.from(BCS.bcsSerializeUint64(BigInt(itemId))),
                Array.from(BCS.bcsSerializeUint64(BigInt(amount)))
            ]
        );
    },

    /**
     * Withdraw Finished Products
     */
    withdrawCompanyProduct: async (companyId: number, amount: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "withdraw_product",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(BigInt(companyId))),
                Array.from(BCS.bcsSerializeUint64(BigInt(amount)))
            ]
        );
    },

    /**
     * Upgrade Company Quality
     */
    upgradeCompanyQuality: async (companyId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "upgrade_quality",
            [],
            [Array.from(BCS.bcsSerializeUint64(BigInt(companyId)))]
        );
    }
};
