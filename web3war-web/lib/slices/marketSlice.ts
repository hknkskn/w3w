import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { MarketItem, CountryId } from '../types';

export interface MarketSlice {
    marketItems: MarketItem[];
    myListings: MarketItem[];
    fetchMarketItems: () => Promise<void>;
    fetchMyListings: () => Promise<void>;
    listMarketItem: (itemId: string, quantity: number, pricePerUnit: number) => void;
    cancelMarketListing: (listingId: string) => void;
    buyItem: (itemId: string, quantity: number) => void;
}

export const createMarketSlice: StateCreator<GameState, [], [], MarketSlice> = (set, get) => ({
    marketItems: [],
    myListings: [],

    fetchMarketItems: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const categories = [1, 2, 3, 4]; // Food, Weapon, Material, Ticket
            let allListings: MarketItem[] = [];

            for (const cat of categories) {
                const listings = await ContractService.getMarketListingsByCategory(cat);
                if (listings && Array.isArray(listings)) {
                    const mapped = listings.map((l: any) => {
                        const itemId = Number(l.original_item_id);
                        let name = "Unknown Item";
                        let image = "📦";

                        // ID-based Naming (Ontology Phase 13)
                        if (itemId === 101) { name = "Grain"; image = "🌾"; }
                        else if (itemId === 102) { name = "Iron"; image = "⚒️"; }
                        else if (itemId === 103) { name = "Oil"; image = "🛢️"; }
                        else if (itemId === 104) { name = "Aluminum"; image = "💎"; }
                        else if (itemId === 201) { name = "Food"; image = "🍞"; }
                        else if (itemId === 202) { name = "Weapon"; image = "⚔️"; }
                        else if (itemId === 203) { name = "Ticket"; image = "🎫"; }
                        else if (itemId === 204) { name = "Missile"; image = "🚀"; }

                        const sellerCountries: CountryId[] = ['NG', 'UA', 'RU', 'US', 'TR', 'IN', 'ES', 'PL', 'BR', 'FR'];
                        return {
                            id: l.id,
                            name: `${name} Q${l.item_type.quality}`,
                            quality: l.item_type.quality,
                            stock: Number(l.quantity),
                            price: Number(l.price_per_unit),
                            seller: l.seller,
                            sellerCountry: sellerCountries[Math.floor(Math.random() * sellerCountries.length)],
                            category: cat === 1 ? 'food' : cat === 2 ? 'weapons' : cat === 3 ? 'raw' : 'tickets',
                            type: cat === 1 ? 'food' : cat === 2 ? 'weapon' : cat === 3 ? 'material' : 'ticket',
                            image,
                            damage: (cat === 2) ? l.item_type.quality * 10 : undefined,
                            energyRestore: (cat === 1) ? l.item_type.quality * 10 : undefined,
                            originalItemId: itemId
                        };
                    });
                    allListings = [...allListings, ...mapped];
                }
            }

            set({ marketItems: allListings });
        } catch (e) {
            console.error("Failed to fetch market listings", e);
        }
    },

    fetchMyListings: async () => {
        try {
            const user = get().user;
            if (!user || !user.walletAddress) {
                set({ myListings: [] });
                return;
            }

            const { ContractService } = await import('../contract-service');
            const listings = await ContractService.getMyListings(user.walletAddress);

            if (!listings || !Array.isArray(listings)) {
                set({ myListings: [] });
                return;
            }

            const mapped = listings.map((l: any) => {
                const itemId = Number(l.original_item_id);
                let name = "Unknown Item";
                let image = "📦";

                if (itemId === 101) { name = "Grain"; image = "🌾"; }
                else if (itemId === 102) { name = "Iron"; image = "⚒️"; }
                else if (itemId === 103) { name = "Oil"; image = "🛢️"; }
                else if (itemId === 104) { name = "Aluminum"; image = "💎"; }
                else if (itemId === 201) { name = "Food"; image = "🍞"; }
                else if (itemId === 202) { name = "Weapon"; image = "⚔️"; }
                else if (itemId === 203) { name = "Ticket"; image = "🎫"; }
                else if (itemId === 204) { name = "Missile"; image = "🚀"; }

                return {
                    id: l.id,
                    name: `${name} Q${l.item_type?.quality || 1}`,
                    quality: l.item_type?.quality || 1,
                    stock: Number(l.quantity),
                    price: Number(l.price_per_unit),
                    seller: l.seller,
                    category: 'my',
                    type: 'listed',
                    image,
                    originalItemId: itemId
                };
            });

            set({ myListings: mapped });
        } catch (e) {
            console.error("Failed to fetch my listings", e);
            set({ myListings: [] });
        }
    },

    listMarketItem: async (itemId, quantity, pricePerUnit) => {
        try {
            const { ContractService } = await import('../contract-service');
            const state = get();

            const item = state.inventory.find(i => i.id === itemId);
            if (!item) return;

            const numericId = parseInt(itemId);

            // Map item to contract category
            let category = 3; // Default Raw
            if (numericId === 201) category = 1; // Food
            else if (numericId === 202 || numericId === 204) category = 2; // Equipment
            else if (numericId >= 101 && numericId <= 104) category = 3; // Raw
            else if (numericId === 203) category = 4; // Ticket

            await ContractService.listMarketItem(
                numericId,
                category,
                item.quality,
                quantity,
                pricePerUnit,
                1 // TODO: Dynamic Country ID
            );

            // Optimistic Update
            state.fetchMarketItems();
            state.fetchInventory();
            alert("Listing transaction sent!");

        } catch (e) {
            console.error(e);
            alert("Failed to list item");
        }
    },

    cancelMarketListing: async (listingId) => {
        try {
            const { ContractService } = await import('../contract-service');
            await ContractService.cancelListing(Number(listingId));

            // Optimistic update
            const state = get();
            set({
                marketItems: state.marketItems.filter(l => l.id !== listingId)
            });
            state.fetchInventory(); // Refresh inventory
        } catch (e) {
            console.error(e);
            alert("Failed to cancel listing");
        }
    },

    buyItem: async (listingId, quantity) => {
        try {
            const { ContractService } = await import('../contract-service');

            // Call Smart Contract
            await ContractService.buyMarketItem(Number(listingId), quantity);

            // Optimistic UI Update not crucial here as data refreshes are better
            // But we can trigger a refresh
            const state = get();
            setTimeout(() => {
                state.fetchMarketItems();
                state.fetchInventory();
                // Refresh user balance
                const userLogin = get().login;
                // If we had a dedicated refreshBalance it would be better, but re-login works to refresh profile
            }, 2000); // Wait for block?

            alert("Buy transaction sent!");
        } catch (e) {
            console.error(e);
            alert("Failed to buy item");
        }
    }
});
