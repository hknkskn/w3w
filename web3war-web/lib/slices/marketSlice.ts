import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { MarketListing } from '../models/MarketModel';
import { COUNTRY_IDS, CountryId } from '../types';

export interface MarketSlice {
    marketItems: MarketListing[];
    myListings: MarketListing[];
    fetchMarketItems: () => Promise<void>;
    fetchMyListings: () => Promise<void>;
    listMarketItem: (itemId: any, quantity: number, pricePerUnit: number) => void;
    cancelMarketListing: (listingId: any) => void;
    buyItem: (listingId: any, quantity: number) => void;
}

const CRED_DECIMALS = 100;

export const createMarketSlice: StateCreator<GameState, [], [], MarketSlice> = (set, get) => ({
    marketItems: [],
    myListings: [],

    fetchMarketItems: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const { MarketService } = await import('../services/market.service');
            const categories = [1, 2, 3, 4]; // Food, Weapon, Material, Ticket
            let allListings: MarketListing[] = [];

            for (const cat of categories) {
                const listings = await ContractService.getMarketListingsByCategory(cat);
                const mapped = MarketService.mapToMarketListings(listings);
                allListings = [...allListings, ...mapped];
            }

            set({ marketItems: allListings });
        } catch (e) {
            console.error("Failed to fetch market listings", e);
        }
    },

    fetchMyListings: async () => {
        try {
            const user = get().user;
            if (!user?.address) {
                set({ myListings: [] });
                return;
            }
            const { ContractService } = await import('../contract-service');
            const { MarketService } = await import('../services/market.service');
            const listings = await ContractService.getMyListings(user.address);

            const mapped = MarketService.mapToMarketListings(listings);

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

            const numericId = Number(itemId);
            const item = state.inventory.find(i => i.id === numericId);
            if (!item) return;

            // Map item to contract category
            let category = 3; // Default Raw
            if (numericId === 201) category = 1; // Food
            else if (numericId === 202 || numericId === 204) category = 2; // Equipment
            else if (numericId >= 101 && numericId <= 104) category = 3; // Raw
            else if (numericId === 203) category = 4; // Ticket

            const priceOnChain = Math.floor(pricePerUnit * CRED_DECIMALS);
            const countryId = state.user?.countryId || 1;

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

            await get().idsAlert("Listing transaction sent!", "Global Trade", "success");

        } catch (e) {
            console.error(e);
            await get().idsAlert("Failed to list item", "Trade Error", "error");
        }
    },

    cancelMarketListing: async (listingId) => {
        try {
            const { ContractService } = await import('../contract-service');
            await ContractService.cancelListing(Number(listingId));

            // Optimistic update
            const state = get();
            set({
                marketItems: state.marketItems.filter(l => l.id !== Number(listingId))
            });
            state.fetchInventory(); // Refresh inventory
        } catch (e) {
            console.error(e);
            await get().idsAlert("Failed to cancel listing", "Trade Error", "error");
        }
    },

    buyItem: async (listingId, quantity) => {
        try {
            const { ContractService } = await import('../contract-service');
            const numericId = typeof listingId === 'string' ? Number(listingId) : listingId;
            const tx = await ContractService.buyMarketItem(numericId, quantity);
            if (tx) {
                await get().idsAlert("Purchase request sent!", "Global Trade", "success");
                setTimeout(() => {
                    const state = get();
                    state.fetchMarketItems();
                    state.fetchInventory();
                    state.fetchDashboardData();
                }, 3000);
            }
        } catch (e) {
            console.error(e);
            await get().idsAlert("Failed to buy item", "Trade Error", "error");
        }
    }
});
