/// Territory Module - Web3War
/// Manages regions with ownership and resource bonuses.
/// 10 Launch Countries x 4 Regions = 40 Regions
module web3war::territory {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;

    const E_REGION_NOT_FOUND: u64 = 1;
    const E_NOT_ADMIN: u64 = 2;

    // Resource Types
    const RESOURCE_NONE: u8 = 0;
    const RESOURCE_GRAIN: u8 = 1;
    const RESOURCE_IRON: u8 = 2;
    const RESOURCE_OIL: u8 = 3;
    const RESOURCE_ALUMINUM: u8 = 4;

    struct Region has key, store, copy, drop {
        id: u64,
        name: String,
        owner_country: u8,
        resource_type: u8,
        resource_bonus: u8,
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

    // ============================================
    // INITIALIZATION - Pre-populate 40 regions
    // ============================================
    
    fun init_module(admin: &signer) {
        let addr = signer::address_of(admin);
        if (!exists<TerritoryRegistry>(addr)) {
            let regions = vector::empty<Region>();
            
            // Nigeria (Country 1) - Regions 1-4
            vector::push_back(&mut regions, Region { id: 1, name: string::utf8(b"Lagos"), owner_country: 1, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });
            vector::push_back(&mut regions, Region { id: 2, name: string::utf8(b"Niger Delta"), owner_country: 1, resource_type: RESOURCE_OIL, resource_bonus: 30, population: 0 });
            vector::push_back(&mut regions, Region { id: 3, name: string::utf8(b"Kano"), owner_country: 1, resource_type: RESOURCE_GRAIN, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 4, name: string::utf8(b"Abuja"), owner_country: 1, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });

            // Ukraine (Country 2) - Regions 5-8
            vector::push_back(&mut regions, Region { id: 5, name: string::utf8(b"Kyiv"), owner_country: 2, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });
            vector::push_back(&mut regions, Region { id: 6, name: string::utf8(b"Donbas"), owner_country: 2, resource_type: RESOURCE_IRON, resource_bonus: 25, population: 0 });
            vector::push_back(&mut regions, Region { id: 7, name: string::utf8(b"Kherson"), owner_country: 2, resource_type: RESOURCE_GRAIN, resource_bonus: 30, population: 0 });
            vector::push_back(&mut regions, Region { id: 8, name: string::utf8(b"Odessa"), owner_country: 2, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });

            // Russia (Country 3) - Regions 9-12
            vector::push_back(&mut regions, Region { id: 9, name: string::utf8(b"Moscow"), owner_country: 3, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });
            vector::push_back(&mut regions, Region { id: 10, name: string::utf8(b"Siberia"), owner_country: 3, resource_type: RESOURCE_OIL, resource_bonus: 35, population: 0 });
            vector::push_back(&mut regions, Region { id: 11, name: string::utf8(b"Ural"), owner_country: 3, resource_type: RESOURCE_IRON, resource_bonus: 30, population: 0 });
            vector::push_back(&mut regions, Region { id: 12, name: string::utf8(b"St Petersburg"), owner_country: 3, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });

            // USA (Country 4) - Regions 13-16
            vector::push_back(&mut regions, Region { id: 13, name: string::utf8(b"Texas"), owner_country: 4, resource_type: RESOURCE_OIL, resource_bonus: 30, population: 0 });
            vector::push_back(&mut regions, Region { id: 14, name: string::utf8(b"California"), owner_country: 4, resource_type: RESOURCE_GRAIN, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 15, name: string::utf8(b"Pennsylvania"), owner_country: 4, resource_type: RESOURCE_IRON, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 16, name: string::utf8(b"Nevada"), owner_country: 4, resource_type: RESOURCE_ALUMINUM, resource_bonus: 25, population: 0 });

            // Turkey (Country 5) - Regions 17-20
            vector::push_back(&mut regions, Region { id: 17, name: string::utf8(b"Marmara"), owner_country: 5, resource_type: RESOURCE_GRAIN, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 18, name: string::utf8(b"Karadeniz"), owner_country: 5, resource_type: RESOURCE_IRON, resource_bonus: 25, population: 0 });
            vector::push_back(&mut regions, Region { id: 19, name: string::utf8(b"Guneydogu"), owner_country: 5, resource_type: RESOURCE_OIL, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 20, name: string::utf8(b"Ic Anadolu"), owner_country: 5, resource_type: RESOURCE_ALUMINUM, resource_bonus: 15, population: 0 });

            // India (Country 6) - Regions 21-24
            vector::push_back(&mut regions, Region { id: 21, name: string::utf8(b"Gujarat"), owner_country: 6, resource_type: RESOURCE_OIL, resource_bonus: 15, population: 0 });
            vector::push_back(&mut regions, Region { id: 22, name: string::utf8(b"Punjab"), owner_country: 6, resource_type: RESOURCE_GRAIN, resource_bonus: 25, population: 0 });
            vector::push_back(&mut regions, Region { id: 23, name: string::utf8(b"Jharkhand"), owner_country: 6, resource_type: RESOURCE_IRON, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 24, name: string::utf8(b"Delhi"), owner_country: 6, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });

            // Spain (Country 7) - Regions 25-28
            vector::push_back(&mut regions, Region { id: 25, name: string::utf8(b"Madrid"), owner_country: 7, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });
            vector::push_back(&mut regions, Region { id: 26, name: string::utf8(b"Andalusia"), owner_country: 7, resource_type: RESOURCE_GRAIN, resource_bonus: 15, population: 0 });
            vector::push_back(&mut regions, Region { id: 27, name: string::utf8(b"Basque"), owner_country: 7, resource_type: RESOURCE_IRON, resource_bonus: 15, population: 0 });
            vector::push_back(&mut regions, Region { id: 28, name: string::utf8(b"Catalonia"), owner_country: 7, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });

            // Poland (Country 8) - Regions 29-32
            vector::push_back(&mut regions, Region { id: 29, name: string::utf8(b"Silesia"), owner_country: 8, resource_type: RESOURCE_IRON, resource_bonus: 25, population: 0 });
            vector::push_back(&mut regions, Region { id: 30, name: string::utf8(b"Masovia"), owner_country: 8, resource_type: RESOURCE_GRAIN, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 31, name: string::utf8(b"Pomerania"), owner_country: 8, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });
            vector::push_back(&mut regions, Region { id: 32, name: string::utf8(b"Krakow"), owner_country: 8, resource_type: RESOURCE_ALUMINUM, resource_bonus: 10, population: 0 });

            // Brazil (Country 9) - Regions 33-36
            vector::push_back(&mut regions, Region { id: 33, name: string::utf8(b"Sao Paulo"), owner_country: 9, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });
            vector::push_back(&mut regions, Region { id: 34, name: string::utf8(b"Amazonas"), owner_country: 9, resource_type: RESOURCE_OIL, resource_bonus: 25, population: 0 });
            vector::push_back(&mut regions, Region { id: 35, name: string::utf8(b"Minas Gerais"), owner_country: 9, resource_type: RESOURCE_IRON, resource_bonus: 30, population: 0 });
            vector::push_back(&mut regions, Region { id: 36, name: string::utf8(b"Rio Grande"), owner_country: 9, resource_type: RESOURCE_GRAIN, resource_bonus: 15, population: 0 });

            // France (Country 10) - Regions 37-40
            vector::push_back(&mut regions, Region { id: 37, name: string::utf8(b"Paris"), owner_country: 10, resource_type: RESOURCE_NONE, resource_bonus: 0, population: 0 });
            vector::push_back(&mut regions, Region { id: 38, name: string::utf8(b"Lorraine"), owner_country: 10, resource_type: RESOURCE_IRON, resource_bonus: 20, population: 0 });
            vector::push_back(&mut regions, Region { id: 39, name: string::utf8(b"Provence"), owner_country: 10, resource_type: RESOURCE_GRAIN, resource_bonus: 15, population: 0 });
            vector::push_back(&mut regions, Region { id: 40, name: string::utf8(b"Aquitaine"), owner_country: 10, resource_type: RESOURCE_OIL, resource_bonus: 10, population: 0 });

            move_to(admin, TerritoryRegistry { regions });
        };
    }

    // ============================================
    // SAFE HELPER FUNCTIONS (No abort)
    // ============================================

    fun try_find_region(regions: &vector<Region>, id: u64): (bool, u64) {
        let i = 0;
        let len = vector::length(regions);
        while (i < len) {
            let r = vector::borrow(regions, i);
            if (r.id == id) { return (true, i) };
            i = i + 1;
        };
        (false, 0)
    }

    // ============================================
    // PUBLIC FUNCTIONS (Safe - no abort)
    // ============================================

    /// Transfer region ownership (called by battle module on win)
    /// Returns silently if region not found
    public fun transfer_ownership(region_id: u64, new_owner: u8) acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return;
        
        let reg = borrow_global_mut<TerritoryRegistry>(@web3war);
        let (found, idx) = try_find_region(&reg.regions, region_id);
        
        if (!found) return;
        
        let region = vector::borrow_mut(&mut reg.regions, idx);
        let old_owner = region.owner_country;
        region.owner_country = new_owner;
        
        event::emit(RegionConquered { region_id, old_owner, new_owner });
    }

    /// Get region owner - returns 0 if not found
    public fun get_region_owner(region_id: u64): u8 acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return 0;
        
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        let (found, idx) = try_find_region(&reg.regions, region_id);
        
        if (!found) return 0;
        
        vector::borrow(&reg.regions, idx).owner_country
    }

    /// Get resource bonus - returns (0, 0) if not found
    public fun get_resource_bonus(region_id: u64): (u8, u8) acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return (0, 0);
        
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        let (found, idx) = try_find_region(&reg.regions, region_id);
        
        if (!found) return (0, 0);
        
        let r = vector::borrow(&reg.regions, idx);
        (r.resource_type, r.resource_bonus)
    }

    /// Helper for Company module: Returns bonus % for a specific resource type
    /// Returns 0 if region not found or resource type doesn't match
    public fun get_production_bonus(region_id: u64, resource_type: u8): u64 acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return 0;
        
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        let (found, idx) = try_find_region(&reg.regions, region_id);
        
        if (!found) return 0;
        
        let r = vector::borrow(&reg.regions, idx);
        
        if (r.resource_type == resource_type) {
            (r.resource_bonus as u64)
        } else {
            0
        }
    }

    // ============================================
    // VIEW FUNCTIONS (For Frontend)
    // ============================================

    #[view]
    public fun get_region(region_id: u64): (u64, vector<u8>, u8, u8, u8, u64) acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return (0, b"", 0, 0, 0, 0);
        
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        let (found, idx) = try_find_region(&reg.regions, region_id);
        
        if (!found) return (0, b"", 0, 0, 0, 0);
        
        let r = vector::borrow(&reg.regions, idx);
        (r.id, *string::bytes(&r.name), r.owner_country, r.resource_type, r.resource_bonus, r.population)
    }

    #[view]
    public fun get_all_regions(): vector<Region> acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return vector::empty();
        borrow_global<TerritoryRegistry>(@web3war).regions
    }

    #[view]
    public fun get_regions_by_country(country_id: u8): vector<Region> acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return vector::empty();
        
        let reg = borrow_global<TerritoryRegistry>(@web3war);
        let result = vector::empty<Region>();
        let i = 0;
        let len = vector::length(&reg.regions);
        
        while (i < len) {
            let r = vector::borrow(&reg.regions, i);
            if (r.owner_country == country_id) {
                vector::push_back(&mut result, *r);
            };
            i = i + 1;
        };
        
        result
    }

    #[view]
    public fun get_region_count(): u64 acquires TerritoryRegistry {
        if (!exists<TerritoryRegistry>(@web3war)) return 0;
        vector::length(&borrow_global<TerritoryRegistry>(@web3war).regions)
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /// Admin adds a new region (for future expansion)
    public entry fun setup_region(
        _admin: &signer,
        id: u64,
        name: String,
        owner_country: u8,
        resource_type: u8,
        resource_bonus: u8
    ) acquires TerritoryRegistry {
        let reg = borrow_global_mut<TerritoryRegistry>(@web3war);
        
        let region = Region {
            id,
            name,
            owner_country,
            resource_type,
            resource_bonus,
            population: 0
        };
        
        vector::push_back(&mut reg.regions, region);
    }

    /// Legacy functions for compatibility
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
