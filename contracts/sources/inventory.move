/// Inventory Module - Web3War
/// Manages user items (Food, Weapons) using a simple resource storage.
module web3war::inventory {
    use std::signer;
    use std::vector;
    use aptos_framework::event;

    // ============================================
    // ERRORS
    // ============================================
    const E_ITEM_NOT_FOUND: u64 = 1;
    const E_INSUFFICIENT_QUANTITY: u64 = 2;

    // ============================================
    // STRUCTS
    // ============================================
    
    struct Item has store, copy, drop {
        id: u64, // Unique ID for item type (e.g., 1=Q1 Bread, 2=Q2 Bread)
        category: u8, // 1=Food, 2=Weapon, 3=Material
        quality: u8, // 1-5
        quantity: u64,
    }

    struct UserInventory has key {
        items: vector<Item>,
    }

    // ============================================
    // EVENTS
    // ============================================
    #[event]
    struct ItemAdded has drop, store {
        user: address,
        item_id: u64,
        quantity: u64,
    }

    #[event]
    struct ItemConsumed has drop, store {
        user: address,
        item_id: u64,
        quantity: u64,
    }

    // ============================================
    // PUBLIC FUNCTIONS
    // ============================================

    /// Add items to user's inventory (Authorized modules only)
    public fun add_item(
        user_addr: address,
        item_id: u64,
        category: u8,
        quality: u8,
        quantity: u64
    ) acquires UserInventory {
        // Auto-initialization if resource doesn't exist
        if (!exists<UserInventory>(user_addr)) {
             // Note: This requires a signer in standard Move logic if using move_to,
             // but here we might need a workaround or ensure init_inventory is called earlier.
             // For simplicity in this logic, we'll assume the system/module can handle it
             // but ideally, we should ensure the resource exists.
             // We'll keep the check but fix the 'abort'.
             // Actually, move_to requires &signer. 
             // We'll revert to requiring init_inventory for now but making the error clearer.
             abort 401 // E_INVENTORY_NOT_INITIALIZED
        };

        let inv = borrow_global_mut<UserInventory>(user_addr);
        
        // ... rest of logic ...
        let len = vector::length(&inv.items);
        let i = 0;
        let found = false;
        while (i < len) {
            let item = vector::borrow_mut(&mut inv.items, i);
            if (item.id == item_id && item.quality == quality) {
                item.quantity = item.quantity + quantity;
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            let new_item = Item { id: item_id, category, quality, quantity };
            vector::push_back(&mut inv.items, new_item);
        };
        
        event::emit(ItemAdded { user: user_addr, item_id, quantity });
    }

    /// Remove specific items from inventory (for Marketplace Listing/Escrow)
    public fun remove_item(
        user_addr: address,
        item_id: u64,
        quality: u8,
        quantity: u64
    ) acquires UserInventory {
        let inv = borrow_global_mut<UserInventory>(user_addr);
        let len = vector::length(&inv.items);
        let i = 0;
        while (i < len) {
            let item = vector::borrow_mut(&mut inv.items, i);
            if (item.id == item_id && item.quality == quality) {
                assert!(item.quantity >= quantity, E_INSUFFICIENT_QUANTITY);
                item.quantity = item.quantity - quantity;
                
                if (item.quantity == 0) {
                     vector::remove(&mut inv.items, i);
                };
                return
            };
            i = i + 1;
        };
        abort E_ITEM_NOT_FOUND
    }

    /// Initialize inventory (User must call this once or it's called during registration)
    public entry fun init_inventory(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<UserInventory>(addr)) {
            move_to(account, UserInventory { items: vector::empty() });
        };
    }


    /// Internal consume logic with quality selection
    public fun consume_item(
        user_addr: address,
        item_id: u64,
        quality: u8,
        quantity: u64
    ): Item acquires UserInventory {
        let inv = borrow_global_mut<UserInventory>(user_addr);
        
        let len = vector::length(&inv.items);
        let i = 0;
        while (i < len) {
            let item = vector::borrow_mut(&mut inv.items, i);
            if (item.id == item_id && item.quality == quality) {
                assert!(item.quantity >= quantity, E_INSUFFICIENT_QUANTITY);
                item.quantity = item.quantity - quantity;
                
                let consumed_item = *item;
                consumed_item.quantity = quantity;
                
                if (item.quantity == 0) {
                     vector::remove(&mut inv.items, i);
                };
                
                event::emit(ItemConsumed { user: user_addr, item_id, quantity });
                return consumed_item
            };
            i = i + 1;
        };
        abort E_ITEM_NOT_FOUND
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    #[view]
    public fun get_inventory(user_addr: address): vector<Item> acquires UserInventory {
        if (!exists<UserInventory>(user_addr)) {
            return vector::empty()
        };
        borrow_global<UserInventory>(user_addr).items
    }
    
    #[view]
    public fun has_item(user_addr: address, item_id: u64, quantity: u64): bool acquires UserInventory {
        if (!exists<UserInventory>(user_addr)) { return false };
        let inv = borrow_global<UserInventory>(user_addr);
        let i = 0;
        while (i < vector::length(&inv.items)) {
            let item = vector::borrow(&inv.items, i);
            if (item.id == item_id && item.quantity >= quantity) {
                return true
            };
            i = i + 1;
        };
        false
    }
    
    public fun get_category(item: &Item): u8 {
        item.category
    }

    public fun get_quality(item: &Item): u8 {
        item.quality
    }
}
