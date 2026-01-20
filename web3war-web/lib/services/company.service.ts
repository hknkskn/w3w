import { BaseService, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';
import { CompanyProfile } from '../models/CompanyModel';

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
    /**
     * DDS Mapper: Normalizes raw company data into CompanyProfile domain models
     */
    mapToCompanies: (rawCompanies: any[]): CompanyProfile[] => {
        if (!rawCompanies || !Array.isArray(rawCompanies)) return [];

        return rawCompanies.map(raw => ({
            id: Number(raw.id),
            name: parseMoveString(raw.name),
            type: Number(raw.company_type),
            regionId: Number(raw.region_id),
            owner: raw.owner,
            quality: Number(raw.quality),
            funds: Number(raw.balance) / 100, // CRED 2 decimals
            stocks: {
                raw: Number(raw.raw_stock || 0),
                product: Number(raw.product_stock || 0)
            },
            employeeCount: Number(raw.employees ? raw.employees.length : 0),
            employees: Array.isArray(raw.employees) ? raw.employees.map((e: any) => String(e)) : []
        }));
    },

    /**
     * DDS Mapper: Normalizes job offers
     */
    mapToJobOffers: (rawCompanies: any[]): any[] => {
        if (!rawCompanies || !Array.isArray(rawCompanies)) return [];

        return rawCompanies
            .filter(c => c.job_offer && Boolean(c.job_offer.active) && Number(c.job_offer.open_positions) > 0)
            .map(c => ({
                companyId: Number(c.id),
                companyName: parseMoveString(c.name),
                salary: Number(c.job_offer.salary) / 100,
                positions: Number(c.job_offer.open_positions),
                quality: Number(c.quality),
                type: Number(c.company_type)
            }));
    },

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
