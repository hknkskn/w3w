import { BaseService, WE3WAR_MODULES, RPC_URL } from './base.service';
import { BCS } from 'supra-l1-sdk';

export const AdminService = {
    /**
     * Check if user has an initialized inventory
     */
    hasInventory: async (address: string): Promise<boolean> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.INVENTORY}::get_inventory`, [], [address]);
            // If we get a result (even empty array), inventory exists
            return result !== null && result !== undefined;
        } catch (e) {
            // If view fails, inventory likely doesn't exist
            return false;
        }
    },

    /**
     * Initialize inventory for the caller (admin initiates their own inventory)
     */
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
     * Mint items to any user's inventory
     * NOTE: The target user MUST have an initialized inventory.
     * If minting fails with abort 401, the target needs to call init_inventory first.
     */
    mintItem: async (target: string, itemId: number, category: number, quality: number, quantity: number): Promise<string> => {
        // Check if target has inventory initialized
        const hasInv = await AdminService.hasInventory(target);
        if (!hasInv) {
            console.warn(`[AdminService] Target ${target} does not have an initialized inventory.`);
            console.warn(`[AdminService] The target user must call init_inventory first, or register as a citizen.`);
            throw new Error(`Target user does not have an initialized inventory. They must register first or call init_inventory.`);
        }

        return await BaseService.sendTransaction(
            WE3WAR_MODULES.ADMIN.split('::')[0],
            WE3WAR_MODULES.ADMIN.split('::')[1],
            "mint_item",
            [],
            [
                Array.from(new Uint8Array(Buffer.from(target.replace('0x', ''), 'hex'))),
                Array.from(BCS.bcsSerializeUint64(BigInt(itemId))),
                Array.from(BCS.bcsSerializeU8(category)),
                Array.from(BCS.bcsSerializeU8(quality)),
                Array.from(BCS.bcsSerializeUint64(BigInt(quantity)))
            ]
        );
    },

    /**
     * Add a new admin
     */
    addAdmin: async (newAdmin: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.ADMIN.split('::')[0],
            WE3WAR_MODULES.ADMIN.split('::')[1],
            "add_admin",
            [],
            [Array.from(new Uint8Array(Buffer.from(newAdmin.replace('0x', ''), 'hex')))]
        );
    },

    removeAdmin: async (target: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.ADMIN.split('::')[0],
            WE3WAR_MODULES.ADMIN.split('::')[1],
            "remove_admin",
            [],
            [Array.from(new Uint8Array(Buffer.from(target.replace('0x', ''), 'hex')))]
        );
    }
};
