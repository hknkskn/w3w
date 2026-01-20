import { InventoryItem } from './InventoryModel';

/**
 * Domain Model for Marketplace Listings
 */

export interface MarketListing {
    id: number;
    listingId: number; // On-chain unique ID
    seller: string;
    item: InventoryItem;
    pricePerUnit: number; // Normalized CRED
    totalPrice: number; // price * quantity
    countryId: number;
    createdAt: number;
}
