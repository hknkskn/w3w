import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { InventoryItem, Item } from '../types';

export interface InventorySlice {
    inventory: InventoryItem[];
    isInventoryOpen: boolean;
    fetchInventory: () => Promise<void>;
    addItemToInventory: (item: Item, quantity: number) => void;
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
            alert("Inventory initialized! You can now receive items.");
            get().fetchInventory();
        } catch (e) {
            console.error("Failed to initialize inventory:", e);
        }
    },

    fetchInventory: async () => {
        const user = get().user;
        if (!user || !user.walletAddress) return;

        try {
            const { ContractService } = await import('../contract-service');
            const chainItems = await ContractService.getInventory(user.walletAddress);

            const { getItemFromOntology } = await import('../ontology');

            const inventoryItems: InventoryItem[] = chainItems.map((item: any) => {
                const itemId = Number(item.id);
                const ontologyItem = getItemFromOntology(itemId, item.quality);

                return {
                    ...ontologyItem,
                    quantity: Number(item.quantity)
                } as InventoryItem;
            });

            set({ inventory: inventoryItems });
        } catch (e) {
            console.error("Store: Failed to fetch inventory", e);
        }
    },

    addItemToInventory: (item, quantity) => {
        const currentInv = get().inventory;
        const existingItem = currentInv.find(i => i.id === item.id);

        if (existingItem) {
            set({
                inventory: currentInv.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                )
            });
        } else {
            set({
                inventory: [...currentInv, { ...item, quantity }]
            });
        }
    },

    useItem: async (itemId) => {
        const state = get();
        const item = state.inventory.find(i => i.id === itemId);
        if (!item) return;

        if (item.quantity <= 0) return;

        try {
            const { ContractService } = await import('../contract-service');
            const numericId = parseInt(itemId);
            const quality = item.quality || 1;

            if (item.type === 'food') {
                await ContractService.recoverEnergy(numericId, quality);
                alert(`Energy recovery transaction sent! (+${quality * 20} Energy)`);

                // Refresh data after block
                setTimeout(() => {
                    state.fetchInventory();
                    state.fetchDashboardData();
                }, 4000);
            } else {
                alert("Only food items can be consumed for energy right now.");
            }
        } catch (e) {
            console.error("Failed to use item:", e);
            alert("Failed to consume item.");
        }
    }
});
