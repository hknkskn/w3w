/// Territory Module - Web3War
/// Manages regions as NFTs with ownership and resource bonuses.
module web3war::territory {
    use std::string::String;
    use std::vector;
    use aptos_framework::event;

    const E_REGION_NOT_FOUND: u64 = 1;

    struct Region has key, store, copy, drop {
        id: u64,
        name: String,
        owner_country: u8,
        resource_type: u8, // 1=Grain, 2=Iron, 3=Oil, 4=None
        resource_bonus: u8, // 0-100%
        population: u64,
    }

    struct TerritoryRegistry has key {
        regions: vector<Region>,
    }

    #[event]
    struct RegionConquered has drop, store {
        region_id: u64,
        old_owner: u8,
        new_owner: u8,
    }

    /// Transfer region ownership (called by battle module on win)
    public fun transfer_ownership(region_id: u64, new_owner: u8) acquires TerritoryRegistry {
        let reg = borrow_global_mut<TerritoryRegistry>(@web3war);
        let region = find_region_mut(&mut reg.regions, region_id);
        let old_owner = region.owner_country;
        region.owner_country = new_owner;
        
        event::emit(RegionConquered { region_id, old_owner, new_owner });
    }

    #[view]
    public fun get_region_owner(region_id: u64): u8 acquires TerritoryRegistry {
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        find_region(&reg.regions, region_id).owner_country
    }

    #[view]
    public fun get_resource_bonus(region_id: u64): (u8, u8) acquires TerritoryRegistry {
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        let r = find_region(&reg.regions, region_id);
        (r.resource_type, r.resource_bonus)
    }

    /// Helper for Company module: Returns bonus % for a specific resource type
    public fun get_production_bonus(region_id: u64, resource_type: u8): u64 acquires TerritoryRegistry {
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        let r = find_region(&reg.regions, region_id);
        
        if (r.resource_type == resource_type) {
            (r.resource_bonus as u64)
        } else {
            0
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        move_to(admin, TerritoryRegistry {
            regions: vector::empty(),
        });
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /// Admin adds a region to the map
    public entry fun setup_region(
        _admin: &signer,
        id: u64,
        name: String,
        owner_country: u8,
        resource_type: u8,
        resource_bonus: u8
    ) acquires TerritoryRegistry {
        // TODO: Assert admin check
        let reg = borrow_global_mut<TerritoryRegistry>(@web3war);
        
        let region = Region {
            id,
            name,
            owner_country,
            resource_type,
            resource_bonus,
            population: 0
        };
        
        // Check if exists? For simplicity just push
        vector::push_back(&mut reg.regions, region);
    }

    fun find_region(regions: &vector<Region>, id: u64): &Region {
        let i = 0;
        while (i < vector::length(regions)) {
            let r = vector::borrow(regions, i);
            if (r.id == id) { return r };
            i = i + 1;
        };
        abort E_REGION_NOT_FOUND
    }

    fun find_region_mut(regions: &mut vector<Region>, id: u64): &mut Region {
        let i = 0;
        while (i < vector::length(regions)) {
            let r = vector::borrow_mut(regions, i);
            if (r.id == id) { return r };
            i = i + 1;
        };
        abort E_REGION_NOT_FOUND
    }
}
