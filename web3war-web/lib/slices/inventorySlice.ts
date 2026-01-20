import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { InventoryItem } from '../models/InventoryModel';
import { Item } from '../types';

export interface InventorySlice {
    inventory: InventoryItem[];
    isInventoryOpen: boolean;
    fetchInventory: () => Promise<void>;
    addItemToInventory: (item: any, quantity: number) => void;
    useItem: (itemId: string) => void;
    toggleInventory: (open?: boolean) => void;
    initInventory: () => Promise<void>;
}

export const createInventorySlice: StateCreator<GameState, [], [], InventorySlice> = (set, get) => ({
    inventory: [], // Initial state
    isInventoryOpen: false,

    toggleInventory: (open) => {
        set({ isInventoryOpen: open !== undefined ? open : !get().isInventoryOpen });
    },

    initInventory: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            await ContractService.initInventory();
            await get().idsAlert("Inventory initialized! You can now receive items.", "Logistics Protocol", "success");
            get().fetchInventory();
        } catch (e) {
            console.error("Failed to initialize inventory:", e);
        }
    },

    fetchInventory: async () => {
        const user = get().user;
        if (!user || !user.address) return;

        try {
            const { ContractService } = await import('../contract-service');
            const { CitizenService } = await import('../services/citizen.service');
            const chainItems = await ContractService.getInventory(user.address);

            const inventoryItems = CitizenService.mapToInventoryItems(chainItems);

            set({ inventory: inventoryItems });
        } catch (e) {
            console.error("Store: Failed to fetch inventory", e);
        }
    },

    addItemToInventory: (item, quantity) => {
        const currentInv = get().inventory;
        const itemId = typeof item.id === 'string' ? Number(item.id) : item.id;
        const category = Number(item.category || 3);
        const quality = Number(item.quality || 1);

        const existingItem = currentInv.find(i =>
            i.id === itemId &&
            i.category === category &&
            i.quality === quality
        );

        if (existingItem) {
            set({
                inventory: currentInv.map(i =>
                    (i.id === itemId && i.category === category && i.quality === quality)
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                )
            });
        } else {
            const newItem: InventoryItem = {
                id: itemId,
                name: item.name || 'Unknown',
                category: category,
                quality: quality,
                image: item.image || '📦',
                quantity: quantity
            };
            set({
                inventory: [...currentInv, newItem]
            });
        }
    },

    useItem: async (uId: string) => {
        const state = get();
        // uId is "id-category-quality"
        const [idStr, catStr, qualStr] = uId.split('-');
        const id = Number(idStr);
        const category = Number(catStr);
        const quality = Number(qualStr);

        const item = state.inventory.find(i =>
            i.id === id && i.category === category && i.quality === quality
        );

        if (!item || item.quantity <= 0) return;

        try {
            const { ContractService } = await import('../contract-service');

            if (item.category === 1) { // Food (Aligned with ITEMS_CATALOG.md)
                await ContractService.recoverEnergy(id, quality);
                await get().idsAlert(`Energy recovery transaction sent! (+${quality * 20} Energy)`, "Physiological Restore", "success");

                // Refresh data after block
                setTimeout(() => {
                    state.fetchInventory();
                    state.fetchDashboardData();
                }, 4000);
            } else {
                await get().idsAlert("Only food items can be consumed for energy right now.", "Item Compatibility", "warning");
            }
        } catch (e) {
            console.error("Failed to use item:", e);
            await get().idsAlert("Failed to consume item.", "System Error", "error");
        }
    }
});
