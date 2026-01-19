import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { MarketItem, CountryId, COUNTRY_IDS } from '../types';

export interface MarketSlice {
    marketItems: MarketItem[];
    myListings: MarketItem[];
    fetchMarketItems: () => Promise<void>;
    fetchMyListings: () => Promise<void>;
    listMarketItem: (itemId: string, quantity: number, pricePerUnit: number) => void;
    cancelMarketListing: (listingId: string) => void;
    buyItem: (itemId: string, quantity: number) => void;
}

const CRED_DECIMALS = 100;

export const createMarketSlice: StateCreator<GameState, [], [], MarketSlice> = (set, get) => ({
    marketItems: [],
    myListings: [],

    fetchMarketItems: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const categories = [1, 2, 3, 4]; // Food, Weapon, Material, Ticket
            let allListings: MarketItem[] = [];

            const { getItemFromOntology } = await import('../ontology');
            const { COUNTRY_IDS } = await import('../types');
            const ID_TO_COUNTRY = Object.fromEntries(Object.entries(COUNTRY_IDS).map(([k, v]) => [v, k]));

            for (const cat of categories) {
                const listings = await ContractService.getMarketListingsByCategory(cat);
                if (listings && Array.isArray(listings)) {
                    const mapped = listings.map((l: any) => {
                        const itemId = Number(l.original_item_id);
                        const quality = Number(l.item_type?.quality || 1);
                        const ontologyItem = getItemFromOntology(itemId, quality);

                        return {
                            ...ontologyItem,
                            id: String(l.id), // Marketplace listing ID
                            stock: Number(l.quantity),
                            price: Number(l.price_per_unit) / CRED_DECIMALS,
                            seller: l.seller,
                            sellerCountry: ID_TO_COUNTRY[l.country] as CountryId || 'TR',
                            category: cat === 1 ? 'food' : cat === 2 ? 'weapons' : cat === 3 ? 'raw' : 'tickets',
                            originalItemId: itemId
                        } as MarketItem;
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
            if (!user?.walletAddress) {
                set({ myListings: [] });
                return;
            }
            const { ContractService } = await import('../contract-service');
            const { getItemFromOntology } = await import('../ontology');
            const listings = await ContractService.getMyListings(user.walletAddress);

            if (!listings || !Array.isArray(listings)) {
                set({ myListings: [] });
                return;
            }

            const mapped = listings.map((l: any) => {
                const itemId = Number(l.original_item_id);
                const quality = Number(l.item_type?.quality || 1);
                const ontologyItem = getItemFromOntology(itemId, quality);

                return {
                    ...ontologyItem,
                    id: String(l.id),
                    stock: Number(l.quantity),
                    price: Number(l.price_per_unit) / CRED_DECIMALS,
                    seller: l.seller,
                    category: 'my',
                    originalItemId: itemId
                } as MarketItem;
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

            const priceOnChain = Math.floor(pricePerUnit * CRED_DECIMALS);
            const userCountry = state.user?.citizenship || 'TR';
            const countryId = COUNTRY_IDS[userCountry] || 1;

            await ContractService.listMarketItem(
                numericId,
                category,
                item.quality,
                quantity,
                priceOnChain,
                countryId
            );

            // Optimistic Update
            setTimeout(() => {
                state.fetchMyListings();
                state.fetchInventory();
            }, 3000);

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

    buyItem: async (listingId: string, quantity: number) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.buyMarketItem(Number(listingId), quantity);
            if (tx) {
                alert("Purchase request sent!");
                setTimeout(() => {
                    const state = get();
                    state.fetchMarketItems();
                    state.fetchInventory();
                    state.fetchDashboardData();
                }, 3000);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to buy item");
        }
    }
});
