import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { InventoryItem, Item } from '../types';

export interface InventorySlice {
    inventory: InventoryItem[];
    fetchInventory: () => Promise<void>;
    addItemToInventory: (item: Item, quantity: number) => void;
    useItem: (itemId: string) => void;
}

export const createInventorySlice: StateCreator<GameState, [], [], InventorySlice> = (set, get) => ({
    inventory: [], // Initial state

    fetchInventory: async () => {
        const user = get().user;
        if (!user || !user.walletAddress) return;

        try {
            const { ContractService } = await import('../contract-service');
            const chainItems = await ContractService.getInventory(user.walletAddress);

            const inventoryItems: InventoryItem[] = chainItems.map((item: any) => {
                const itemId = Number(item.id);
                let name = `Item #${item.id}`;
                let type: any = 'material';
                let image = '📦';
                let energyRestore = undefined;
                let damage = undefined;

                // Category 1: Food (201)
                if (item.category === 1) {
                    type = 'food';
                    name = itemId === 201 ? "Food" : `Food Q${item.quality}`;
                    image = '🍞';
                    energyRestore = item.quality * 20;
                }
                // Category 2: Equipment (202, 204)
                else if (item.category === 2) {
                    type = 'weapon';
                    if (itemId === 204) {
                        name = "Missile";
                        image = "🚀";
                        damage = 50 * item.quality;
                    } else {
                        name = "Weapon";
                        image = "⚔️";
                        damage = 10 * item.quality;
                    }
                }
                // Category 3: Raw Materials (101-104)
                else if (item.category === 3) {
                    type = 'material';
                    if (itemId === 101) { name = "Grain"; image = "🌾"; }
                    else if (itemId === 102) { name = "Iron"; image = "⚒️"; }
                    else if (itemId === 103) { name = "Oil"; image = "🛢️"; }
                    else if (itemId === 104) { name = "Aluminum"; image = "💎"; }
                }
                // Category 4: Specialized (203)
                else if (item.category === 4) {
                    type = 'ticket';
                    name = "Ticket";
                    image = "🎫";
                }

                return {
                    id: String(item.id),
                    name,
                    type,
                    quality: item.quality,
                    image,
                    quantity: Number(item.quantity),
                    energyRestore,
                    damage
                };
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
