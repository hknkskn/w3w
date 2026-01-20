import { BaseService, WE3WAR_MODULES } from './base.service';
import { BCS } from 'supra-l1-sdk';
import { MarketListing } from '../models/MarketModel';
import { getItemDisplayInfo } from '../models/InventoryModel';

export const MarketService = {
    /**
     * List Item on Marketplace
     */
    listMarketItem: async (itemId: number, category: number, quality: number, quantity: number, price: number, country: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            WE3WAR_MODULES.MARKETPLACE.split('::')[1],
            "list_item",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(itemId)),
                Array.from(BCS.bcsSerializeU8(category)),
                Array.from(BCS.bcsSerializeU8(quality)),
                Array.from(BCS.bcsSerializeUint64(quantity)),
                Array.from(BCS.bcsSerializeUint64(price)),
                Array.from(BCS.bcsSerializeU8(country))
            ]
        );
    },

    /**
     * Buy Item from Marketplace
     */
    buyMarketItem: async (listingId: number, quantity: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            WE3WAR_MODULES.MARKETPLACE.split('::')[1],
            "buy_item",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(listingId)),
                Array.from(BCS.bcsSerializeUint64(quantity))
            ]
        );
    },

    /**
     * Cancel Listing
     */
    cancelListing: async (listingId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            WE3WAR_MODULES.MARKETPLACE.split('::')[1],
            "cancel_listing",
            [],
            [Array.from(BCS.bcsSerializeUint64(listingId))]
        );
    },

    getMarketListingsByCategory: async (category: number) => {
        try {
            console.log(`[DEBUG] Fetching market listings for category ${category}...`);
            const result = await BaseService.view(`${WE3WAR_MODULES.MARKETPLACE}::get_listings_by_category`, [], [category]);
            let raw = result?.result || result;

            console.log(`[DEBUG] Raw Market Listings Result:`, JSON.stringify(raw));

            if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

            // Case A: Nested Array format (e.g. [[{...}]])
            if (raw.length === 1 && Array.isArray(raw[0]) && raw[0].length > 0) {
                console.log(`[DEBUG] Detected nested array format in market listings.`);
                raw = raw[0];
            }

            // Case B: Flattened Tuple of Vectors (Supra standard)
            // 0: id, 1: seller, 2: cat, 3: qual, 4: orig_id, 5: qty, 6: price, 7: country, 8: ts
            if (Array.isArray(raw[0]) && raw.length >= 8 && typeof raw[0][0] !== 'object') {
                console.log(`[DEBUG] Detected tuple of vectors in market listings.`);
                const listings = [];
                for (let i = 0; i < raw[0].length; i++) {
                    listings.push({
                        id: Number(raw[0][i]),
                        seller: raw[1][i],
                        item_type: {
                            category: Number(raw[2][i]),
                            quality: Number(raw[3][i])
                        },
                        original_item_id: Number(raw[4][i]),
                        quantity: Number(raw[5][i]),
                        price_per_unit: Number(raw[6][i]),
                        country: Number(raw[7][i]),
                        created_at: Number(raw[8][i] || 0)
                    });
                }
                return listings;
            }

            // Case C: Vector of Structs
            console.log(`[DEBUG] Processing market listings as vector of structs.`);
            return raw.map((l: any) => ({
                id: Number(l.id || 0),
                seller: l.seller,
                item_type: l.item_type || { category: Number(l.category || 0), quality: Number(l.quality || 1) },
                original_item_id: Number(l.original_item_id || 0),
                quantity: Number(l.quantity || 0),
                price_per_unit: Number(l.price_per_unit || 0),
                country: Number(l.country || 0),
                created_at: Number(l.created_at || 0)
            }));
        } catch (e) {
            console.error("Failed to fetch market listings:", e);
            return [];
        }
    },

    /**
     * DDS Mapper: Normalizes raw market data into MarketListing domain models
     */
    mapToMarketListings: (rawListings: any[]): MarketListing[] => {
        if (!rawListings || !Array.isArray(rawListings)) return [];

        return rawListings.map(raw => {
            const itemId = Number(raw.item_type?.id || raw.original_item_id || 0);
            const category = Number(raw.item_type?.category || 0);
            const quality = Number(raw.item_type?.quality || 1);
            const display = getItemDisplayInfo(itemId);

            const quantity = Number(raw.quantity || 0);
            const priceRaw = Number(raw.price_per_unit || 0);
            const pricePerUnit = priceRaw / 100; // CRED has 2 decimals

            return {
                id: Number(raw.id),
                listingId: Number(raw.id),
                seller: raw.seller,
                item: {
                    id: itemId,
                    category,
                    quality,
                    quantity,
                    name: display.name,
                    image: display.image,
                    description: display.description
                },
                pricePerUnit,
                totalPrice: pricePerUnit * quantity,
                countryId: Number(raw.country || 0),
                createdAt: Number(raw.created_at || 0)
            };
        });
    },

    getMyListings: async (address: string) => {
        try {
            console.log(`[DEBUG] Fetching my listings for ${address}...`);
            const result = await BaseService.view(`${WE3WAR_MODULES.MARKETPLACE}::get_my_listings`, [], [address]);
            let raw = result?.result || result;

            console.log(`[DEBUG] Raw My Listings Result:`, JSON.stringify(raw));

            if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

            // Case A: Nested Array format
            if (raw.length === 1 && Array.isArray(raw[0]) && raw[0].length > 0) {
                raw = raw[0];
            }

            if (Array.isArray(raw[0]) && raw.length >= 8 && typeof raw[0][0] !== 'object') {
                const listings = [];
                for (let i = 0; i < raw[0].length; i++) {
                    listings.push({
                        id: Number(raw[0][i]),
                        seller: raw[1][i],
                        item_type: {
                            category: Number(raw[2][i]),
                            quality: Number(raw[3][i])
                        },
                        original_item_id: Number(raw[4][i]),
                        quantity: Number(raw[5][i]),
                        price_per_unit: Number(raw[6][i]),
                        country: Number(raw[7][i]),
                        created_at: Number(raw[8][i] || 0)
                    });
                }
                return listings;
            }

            return raw.map((l: any) => ({
                id: Number(l.id || 0),
                seller: l.seller,
                item_type: l.item_type || { category: Number(l.category || 0), quality: Number(l.quality || 1) },
                original_item_id: Number(l.original_item_id || 0),
                quantity: Number(l.quantity || 0),
                price_per_unit: Number(l.price_per_unit || 0),
                country: Number(l.country || 0),
                created_at: Number(l.created_at || 0)
            }));
        } catch (e) {
            console.error("Failed to fetch my listings:", e);
            return [];
        }
    }
};
