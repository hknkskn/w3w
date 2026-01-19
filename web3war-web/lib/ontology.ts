export interface ItemOntology {
    id: number;
    name: string;
    image: string;
    type: 'material' | 'food' | 'weapon' | 'ticket';
    category: number;
    baseEffect?: number; // Damage or EnergyRestore base
}

export const ITEM_ONTOLOGY: Record<number, ItemOntology> = {
    // Materials (Category 3)
    101: { id: 101, category: 3, name: "Grain", image: "🌾", type: 'material' },
    102: { id: 102, category: 3, name: "Iron", image: "⚒️", type: 'material' },
    103: { id: 103, category: 3, name: "Oil", image: "🛢️", type: 'material' },
    104: { id: 104, category: 3, name: "Aluminum", image: "💎", type: 'material' },

    // Consumables (Category 1)
    201: { id: 201, category: 1, name: "Food", image: "🍞", type: 'food', baseEffect: 20 },

    // Combat (Category 2)
    202: { id: 202, category: 2, name: "Weapon", image: "⚔️", type: 'weapon', baseEffect: 10 },
    204: { id: 204, category: 2, name: "Missile", image: "🚀", type: 'weapon', baseEffect: 50 },

    // Specialized (Category 4)
    203: { id: 203, category: 4, name: "Ticket", image: "🎫", type: 'ticket' }
};

export const getItemFromOntology = (id: number, quality: number = 1) => {
    const base = ITEM_ONTOLOGY[id];
    if (!base) {
        return {
            id: String(id),
            name: `Unknown #${id}`,
            image: "📦",
            type: "material",
            quality,
        };
    }

    return {
        ...base,
        id: String(id),
        name: quality > 1 ? `${base.name} Q${quality}` : base.name,
        quality,
        energyRestore: base.type === 'food' ? (base.baseEffect || 0) * quality : undefined,
        damage: base.type === 'weapon' ? (base.baseEffect || 0) * quality : undefined,
    };
};
