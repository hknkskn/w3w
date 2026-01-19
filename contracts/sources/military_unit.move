module web3war::military_unit {
    use std::signer;
    use std::vector;
    use std::string::String;
    use web3war::citizen;
    use web3war::admin;

    // ============================================
    // ERRORS
    // ============================================
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_ALREADY_MEMBER: u64 = 2;
    const E_UNIT_NOT_FOUND: u64 = 3;

    // ============================================
    // CONSTANTS
    // ============================================
    const UNIT_CREATION_COST: u64 = 1000; // 1000 CRED to start a MU

    // ============================================
    // STRUCTS
    // ============================================

    struct MilitaryUnit has key, store, copy, drop {
        id: u64,
        name: String,
        leader: address,
        members: vector<address>,
        daily_order_region: u64, // Region ID for the daily order
    }

    struct MURegistry has key {
        next_id: u64,
        units: vector<MilitaryUnit>,
    }

    struct MemberOf has key {
        unit_id: u64,
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    fun init_module(admin: &signer) {
        if (!exists<MURegistry>(signer::address_of(admin))) {
            move_to(admin, MURegistry {
                units: vector::empty(),
                next_id: 1,
            });
        };
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    /// Create a new Military Unit
    public entry fun create_unit(account: &signer, name: String) acquires MURegistry {
        let addr = signer::address_of(account);
        
        // 1. Deduct Cost (Free for admins)
        if (!admin::is_admin(addr)) {
            citizen::deduct_credits(addr, UNIT_CREATION_COST);
        };

        let registry = borrow_global_mut<MURegistry>(@web3war);
        let unit_id = registry.next_id;
        registry.next_id = registry.next_id + 1;

        let members = vector::empty<address>();
        vector::push_back(&mut members, addr);

        let unit = MilitaryUnit {
            id: unit_id,
            name,
            leader: addr,
            members,
            daily_order_region: 0,
        };

        vector::push_back(&mut registry.units, unit);
        
        // Mark as member
        move_to(account, MemberOf { unit_id });
    }

    /// Join an existing Military Unit
    public entry fun join_unit(account: &signer, unit_id: u64) acquires MURegistry {
        let addr = signer::address_of(account);
        assert!(!exists<MemberOf>(addr), E_ALREADY_MEMBER);

        let registry = borrow_global_mut<MURegistry>(@web3war);
        let unit = find_unit_mut(&mut registry.units, unit_id);
        
        vector::push_back(&mut unit.members, addr);
        move_to(account, MemberOf { unit_id });
    }

    /// Set Daily Order (Only leader)
    public entry fun set_daily_order(account: &signer, region_id: u64) acquires MURegistry, MemberOf {
        let addr = signer::address_of(account);
        assert!(exists<MemberOf>(addr), E_NOT_AUTHORIZED);
        
        let unit_id = borrow_global<MemberOf>(addr).unit_id;
        let registry = borrow_global_mut<MURegistry>(@web3war);
        let unit = find_unit_mut(&mut registry.units, unit_id);
        
        assert!(unit.leader == addr, E_NOT_AUTHORIZED);
        unit.daily_order_region = region_id;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    #[view]
    public fun get_member_unit(addr: address): u64 acquires MemberOf {
        if (!exists<MemberOf>(addr)) return 0;
        borrow_global<MemberOf>(addr).unit_id
    }

    #[view]
    public fun is_daily_order(addr: address, region_id: u64): bool acquires MURegistry, MemberOf {
        if (!exists<MemberOf>(addr)) return false;
        let unit_id = borrow_global<MemberOf>(addr).unit_id;
        let registry = borrow_global<MURegistry>(@web3war);
        
        let i = 0;
        let len = vector::length(&registry.units);
        while (i < len) {
            let u = vector::borrow(&registry.units, i);
            if (u.id == unit_id) {
                return u.daily_order_region == region_id
            };
            i = i + 1;
        };
        false
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    fun find_unit_mut(units: &mut vector<MilitaryUnit>, id: u64): &mut MilitaryUnit {
        let len = vector::length(units);
        let i = 0;
        while (i < len) {
            let u = vector::borrow_mut(units, i);
            if (u.id == id) {
                return u
            };
            i = i + 1;
        };
        abort E_UNIT_NOT_FOUND
    }
}
