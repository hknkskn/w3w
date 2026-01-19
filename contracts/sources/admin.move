module web3war::admin {
    use std::signer;
    use std::vector;

    // ============================================
    // ERRORS
    // ============================================
    const E_NOT_ADMIN: u64 = 1;
    const E_ALREADY_ADMIN: u64 = 2;
    const E_ALREADY_INITIALIZED: u64 = 3;
    const E_NOT_DEPLOYER: u64 = 4;

    // ============================================
    // STRUCTS
    // ============================================
    
    struct AdminRegistry has key {
        admins: vector<address>,
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(account: &signer) {
        if (!exists<AdminRegistry>(signer::address_of(account))) {
            let admins = vector::empty<address>();
            vector::push_back(&mut admins, signer::address_of(account));
            move_to(account, AdminRegistry { admins });
        };
    }

    /// Manual initialization (use if init_module didn't run during deploy)
    public entry fun initialize_registry(account: &signer) {
        let addr = signer::address_of(account);
        assert!(addr == @web3war, E_NOT_DEPLOYER);
        assert!(!exists<AdminRegistry>(@web3war), E_ALREADY_INITIALIZED);
        
        let admins = vector::empty<address>();
        vector::push_back(&mut admins, addr);
        move_to(account, AdminRegistry { admins });
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    /// Add a new admin (Only existing admins can call)
    public entry fun add_admin(account: &signer, new_admin: address) acquires AdminRegistry {
        let caller = signer::address_of(account);
        let registry = borrow_global_mut<AdminRegistry>(@web3war);
        
        assert!(vector::contains(&registry.admins, &caller), E_NOT_ADMIN);
        assert!(!vector::contains(&registry.admins, &new_admin), E_ALREADY_ADMIN);
        
        vector::push_back(&mut registry.admins, new_admin);
    }

    /// Remove an admin (Only existing admins can call)
    public entry fun remove_admin(account: &signer, target: address) acquires AdminRegistry {
        let caller = signer::address_of(account);
        let registry = borrow_global_mut<AdminRegistry>(@web3war);
        
        assert!(vector::contains(&registry.admins, &caller), E_NOT_ADMIN);
        
        let (found, idx) = vector::index_of(&registry.admins, &target);
        if (found) {
            vector::remove(&mut registry.admins, idx);
        };
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    #[view]
    public fun is_admin(addr: address): bool acquires AdminRegistry {
        if (!exists<AdminRegistry>(@web3war)) return false;
        let registry = borrow_global<AdminRegistry>(@web3war);
        vector::contains(&registry.admins, &addr)
    }

    #[view]
    public fun get_admins(): vector<address> acquires AdminRegistry {
        if (!exists<AdminRegistry>(@web3war)) return vector::empty();
        borrow_global<AdminRegistry>(@web3war).admins
    }

    // ============================================
    // ADMIN TOOLS - TESTING/DEBUG
    // ============================================

    /// Admin only: Mint items to any user's inventory (for testing)
    public entry fun mint_item(
        account: &signer,
        target: address,
        item_id: u64,
        category: u8,
        quality: u8,
        quantity: u64
    ) acquires AdminRegistry {
        let caller = signer::address_of(account);
        assert!(is_admin(caller), E_NOT_ADMIN);
        
        // Add item to target's inventory
        web3war::inventory::add_item(target, item_id, category, quality, quantity);
    }
}
