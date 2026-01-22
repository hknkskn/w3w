import { BaseService, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';

export interface RegionData {
    id: number;
    name: string;
    ownerCountry: number;
    originalOwner: number;
    resourceType: number;
    resourceBonus: number;
    population: number;
}

export const TerritoryService = {
    /**
     * Get details for a specific region
     */
    getRegion: async (regionId: number): Promise<RegionData | null> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TERRITORY}::get_region`, [], [String(regionId)]);
            const data = result?.result || result;

            if (!data || !Array.isArray(data)) return null;

            return {
                id: Number(data[0]),
                name: parseMoveString(data[1]),
                ownerCountry: Number(data[2]),
                originalOwner: Number(data[3]),
                resourceType: Number(data[4]),
                resourceBonus: Number(data[5]),
                population: Number(data[6])
            };
        } catch (e) {
            console.error(`Failed to fetch region ${regionId}:`, e);
            return null;
        }
    },

    /**
     * Get all regions
     */
    getAllRegions: async (): Promise<RegionData[]> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TERRITORY}::get_all_regions`, [], []);
            const data = result?.result?.[0] || result?.[0];

            if (!data || !Array.isArray(data)) return [];

            return data.map((r: any) => ({
                id: Number(r.id),
                name: parseMoveString(r.name),
                ownerCountry: Number(r.owner_country),
                originalOwner: Number(r.original_owner),
                resourceType: Number(r.resource_type),
                resourceBonus: Number(r.resource_bonus),
                population: Number(r.population)
            }));
        } catch (e) {
            console.error("Failed to fetch all regions:", e);
            return [];
        }
    },

    /**
     * Admin: Force transfer a region to a different country
     */
    adminTransferRegion: async (regionId: number, newOwner: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.TERRITORY.split('::')[0],
            WE3WAR_MODULES.TERRITORY.split('::')[1],
            "admin_transfer_region",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(regionId)),
                Array.from(BCS.bcsSerializeU8(newOwner))
            ]
        );
    },

    /**
     * Helper to get resource name by type ID
     */
    getResourceName: (type: number): string => {
        switch (type) {
            case 1: return 'Grain';
            case 2: return 'Iron';
            case 3: return 'Oil';
            case 4: return 'Aluminum';
            default: return 'None';
        }
    },

    /**
     * Helper to get resource icon by type ID
     */
    getResourceIcon: (type: number): string => {
        switch (type) {
            case 1: return '/icons/food.webp';
            case 2: return '/icons/weapon.webp';
            case 3: return '/icons/warehouse.webp';
            case 4: return '/icons/weapon.webp'; // Using weapon icon for high-tech metals
            default: return '/icons/inventory.webp';
        }
    }
};
