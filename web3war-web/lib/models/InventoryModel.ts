/**
 * Domain Model for Game Items and Inventory
 */

export type ItemCategory = number;

export interface GameItem {
    id: number;
    name: string;
    category: ItemCategory;
    quality: number;
    image: string;
    description?: string;
    energyRestore?: number;
    damage?: number;
    durability?: number;
}

export interface InventoryItem extends GameItem {
    quantity: number;
}

/**
 * Static registry for item metadata
 * Maps by Item ID (matches ITEMS_CATALOG.md and on-chain inventory.move)
 */
export const ITEM_METADATA: Record<number, { name: string, image: string, description: string }> = {
    // Raw Materials (Category 3) - IDs 101-104
    101: { name: 'Grain', image: '/icons/Grain.webp', description: 'Raw grain used for food production.' },
    102: { name: 'Iron', image: '/icons/Iron.webp', description: 'Raw iron used for weapon manufacturing.' },
    103: { name: 'Oil', image: '/icons/Oil.webp', description: 'Raw oil used for transport fuel.' },
    104: { name: 'Aluminum', image: '/icons/Aluminum.webp', description: 'Raw aluminum used for missile production.' },
    // Finished Goods - IDs 201-204
    201: { name: 'Food', image: '/icons/food.webp', description: 'Restores energy to keep you fighting.' },
    202: { name: 'Weapon', image: '/icons/weapon.webp', description: 'Increases damage output in battles.' },
    203: { name: 'Ticket', image: '/icons/inventory.webp', description: 'Required for international travel.' },
    204: { name: 'Missile', image: '/icons/weapon.webp', description: 'High-impact weapon for tactical strikes.' },
};

/**
 * Get display info for an item by its ID
 */
export const getItemDisplayInfo = (id: number) => {
    return ITEM_METADATA[id] || { name: 'Unknown Item', image: '📦', description: 'Mystery box.' };
};
