import { BaseService, RPC_URL, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';

/**
 * Normalizes an address to a 32-byte Uint8Array for BCS serialization.
 */
const normalizeAddressToBytes = (addr: string): number[] => {
    const clean = addr.toLowerCase().replace('0x', '');
    const bytes = new Uint8Array(32);
    const hexBytes = Buffer.from(clean.padStart(64, '0'), 'hex');
    bytes.set(hexBytes.slice(-32)); // Ensure we take the last 32 bytes if padded
    return Array.from(bytes);
};
import { CitizenProfile } from '../models/CitizenModel';
import { InventoryItem, getItemDisplayInfo } from '../models/InventoryModel';

export const CitizenService = {
    /**
     * Check if user is admin
     */
    isAdmin: async (address: string): Promise<boolean> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.ADMIN}::is_admin`, [], [address]);
            const val = result?.result?.[0] || result?.[0];
            return val === true;
        } catch (e) {
            console.warn("Failed to check admin status on-chain, falling back to deployer check.");
            const adminAddr = WE3WAR_MODULES.ADMIN.split('::')[0];
            return address.toLowerCase() === adminAddr.toLowerCase();
        }
    },

    /**
     * Checks if a user is registered
     */
    checkRegistration: async (address: string): Promise<boolean> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.CITIZEN}::is_registered`, [], [address]);

            // Handle different RPC formats
            if (Array.isArray(result) && result[0] === true) return true;
            if (result?.result && Array.isArray(result.result) && result.result[0] === true) return true;

            return false;
        } catch (e) {
            console.error("Failed to check registration:", e);
            return false;
        }
    },

    /**
     * Registers a new citizen
     */
    registerCitizen: async (username: string, countryCode: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "register",
            [],
            [
                Array.from(BCS.bcsSerializeStr(username)),
                Array.from(BCS.bcsSerializeU8(countryCode))
            ]
        );
    },

    /**
     * Login: Returns detailed profile data including employerId
     */
    getProfile: async (address: string) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.CITIZEN}::get_profile`, [], [address]);

            // Handle {result: [...]} format or direct array
            const data = result?.result || result;

            if (!data || !Array.isArray(data)) return null;

            const rawUsername = parseMoveString(data[1]);
            const [username, avatarSeed] = rawUsername.includes('#')
                ? rawUsername.split('#')
                : [rawUsername, ''];

            return {
                id: data[0],
                username,
                avatarSeed,
                countryId: data[2],
                level: data[3],
                xp: data[4],
                energy: data[5],
                lastEnergyUpdate: data[6],
                strength: data[7],
                rankPoints: data[8],
                credits: data[9],
                employerId: data[10] // Crucial for job workflow
            };
        } catch (e) {
            console.error("Failed to fetch profile:", e);
            return null;
        }
    },

    /**
     * Fetches basic dashboard data
     */
    getDashboardData: async (address: string) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.CITIZEN}::get_dashboard_data`, [], [address]);
            const data = result?.result || result;

            if (!data || !Array.isArray(data)) return null;

            return {
                level: Number(data[0]),
                xp: Number(data[1]),
                energy: Number(data[2]),
                strength: Number(data[3]),
                credits: Number(data[4])
            };
        } catch (e) {
            console.error("Failed to fetch dashboard data:", e);
            return null;
        }
    },

    /**
     * DDS Mapper: Normalizes raw profile data into a CitizenProfile domain model
     */
    mapToCitizenProfile: (address: string, data: any, supraBalance: number, credBalance: number, isAdmin: boolean): CitizenProfile => {
        return {
            address,
            username: data?.username || 'Pilot',
            level: Number(data?.level || 0),
            xp: Number(data?.xp || 0),
            nextLevelXp: 1000,
            strength: Number(data?.strength || 10),
            energy: Number(data?.energy || 0),
            maxEnergy: 200, // Standard max energy
            credits: credBalance, // Use explicit coin balance
            supraBalance: supraBalance,
            isAdmin: isAdmin,
            countryId: Number(data?.countryId || 0),
            rankPoints: Number(data?.rankPoints || 0),
            avatarSeed: data?.avatarSeed,
            employerId: data?.employerId && Number(data.employerId) !== 0 ? Number(data.employerId) : undefined
        };
    },

    /**
     * DDS Mapper: Normalizes raw inventory vectors into InventoryItem domain models
     */
    mapToInventoryItems: (rawItems: any[]): InventoryItem[] => {
        if (!rawItems || !Array.isArray(rawItems)) return [];

        return rawItems.map(raw => {
            const itemId = Number(raw.id);
            const display = getItemDisplayInfo(itemId);
            return {
                id: itemId,
                category: Number(raw.category),
                quality: Number(raw.quality),
                quantity: Number(raw.quantity),
                name: display.name,
                image: display.image,
                description: display.description,
                // Energy restore for Food (ID 201)
                ...(itemId === 201 ? { energyRestore: Number(raw.quality) * 20 } : {})
            };
        });
    },

    /**
     * Get User Inventory
     */
    getInventory: async (address: string) => {
        try {
            console.log(`[DEBUG] Fetching inventory for ${address}...`);
            const result = await BaseService.view(`${WE3WAR_MODULES.INVENTORY}::get_inventory`, [], [address]);
            let raw = result?.result || result;

            console.log(`[DEBUG] Raw Inventory RPC Result:`, JSON.stringify(raw));

            if (!raw || !Array.isArray(raw) || raw.length === 0) {
                console.log(`[DEBUG] Inventory is empty or raw data invalid.`);
                return [];
            }

            // Case A: Nested Array format (seen in Supra IDE/Explorer)
            // e.g. [ [ {item1}, {item2} ] ]
            if (raw.length === 1 && Array.isArray(raw[0])) {
                console.log(`[DEBUG] detected nested array format, flattening...`);
                raw = raw[0];
            }

            // Case B: Tuple of Vectors (Flattened array of arrays)
            // e.g. [ [id1, id2], [cat1, cat2], [qual1, qual2], [qty1, qty2] ]
            if (Array.isArray(raw[0]) && raw.length >= 4 && typeof raw[0][0] !== 'object') {
                console.log(`[DEBUG] Detected tuple of vectors format.`);
                const itemIds = raw[0];
                const categories = raw[1];
                const qualities = raw[2];
                const quantities = raw[3];

                const inventory = [];
                for (let i = 0; i < itemIds.length; i++) {
                    inventory.push({
                        id: Number(itemIds[i]),
                        category: Number(categories[i]),
                        quality: Number(qualities[i]),
                        quantity: Number(quantities[i])
                    });
                }
                return inventory;
            }

            // Case C: Vector of Structs (Array of Objects)
            // e.g. [ {id: 101, category: 3, ...}, ... ]
            console.log(`[DEBUG] Processing as vector of structs.`);
            return raw.map((item: any) => ({
                id: Number(item.id ?? item.item_id ?? 0),
                category: Number(item.category ?? 0),
                quality: Number(item.quality ?? 1),
                quantity: Number(item.quantity ?? 0)
            })).filter((item: any) => item.id !== 0);
        } catch (e) {
            console.error("Failed to fetch inventory:", e);
            return [];
        }
    },

    /**
     * Get CRED Balance
     */
    getCoinBalance: async (address: string) => {
        try {
            const result = await BaseService.view(`0x1::coin::balance`, [WE3WAR_MODULES.COIN_TYPE], [address]);
            const val = result?.result?.[0] || result?.[0];
            // CRED has 2 decimals
            return val ? Number(val) / 100 : 0;
        } catch (e) {
            console.error("Failed to fetch CRED balance:", e);
            return 0;
        }
    },

    /**
     * Get SUPRA Balance 
     */
    getSupraBalance: async (address: string) => {
        try {
            const result = await BaseService.view(`0x1::coin::balance`, [`0x1::supra_coin::SupraCoin`], [address]);
            const val = result?.result?.[0] || result?.[0];
            // Returns number, formatting handled in UI
            return val ? Number(val) / 100000000 : 0;
        } catch (e) {
            return 0;
        }
    },

    /**
     * Consume Energy (Debug/Test)
     */
    consumeEnergy: async (amount: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "consume_energy",
            [],
            [Array.from(BCS.bcsSerializeUint64(BigInt(amount)))]
        );
    },

    /**
     * Recover Energy by consuming food from inventory
     */
    recoverEnergy: async (itemId: number, quality: number): Promise<string> => {
        console.log(`[CitizenService] Recovering energy with food ID ${itemId}, quality ${quality}`);
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "recover_energy",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(BigInt(itemId))),
                Array.from(BCS.bcsSerializeU8(quality))
            ]
        );
    },

    /**
     * Admin only: Mint Credits for testing
     */
    mintCredits: async (target: string, amount: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "mint_credits",
            [],
            [
                normalizeAddressToBytes(target),
                Array.from(BCS.bcsSerializeUint64(BigInt(amount)))
            ]
        );
    },

    addEnergy: async (target: string, amount: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "add_energy",
            [],
            [
                normalizeAddressToBytes(target),
                Array.from(BCS.bcsSerializeUint64(BigInt(amount)))
            ]
        );
    },

    initInventory: async (): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.INVENTORY.split('::')[0],
            WE3WAR_MODULES.INVENTORY.split('::')[1],
            "init_inventory",
            [],
            []
        );
    },

    /**
     * Check if user is registered for CRED coin
     */
    hasCoinRegister: async (address: string): Promise<boolean> => {
        try {
            // Check if coin store exists for CRED
            const result = await BaseService.view(
                `0x1::coin::is_account_registered`,
                [WE3WAR_MODULES.COIN_TYPE],
                [address]
            );
            return result?.result?.[0] || result?.[0] || false;
        } catch (e) {
            return false;
        }
    },

    /**
     * Register user for CRED coin (Gamified as National Bank account)
     */
    registerCoin: async (): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COIN_TYPE.split('::')[0],
            "cred_coin",
            "register",
            [],
            []
        );
    },

    /**
     * Initialize CRED coin (Admin only)
     */
    initializeCoin: async (): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.COIN_TYPE.split('::')[0],
            "cred_coin",
            "initialize",
            [],
            []
        );
    },

    /**
     * Get Country Population
     */
    getPopulation: async (countryId: number): Promise<number> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.CITIZEN}::get_population`, [], [countryId]);
            return Number(result?.result?.[0] || result?.[0] || 0);
        } catch (e) {
            return 0;
        }
    }
};
