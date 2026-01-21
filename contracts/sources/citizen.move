module web3war::citizen {
    use std::string::{Self, String};
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use web3war::inventory;
    use web3war::admin;
    use aptos_framework::coin;
    use web3war::cred_coin::{Self, CRED};

    // ... (existing constants)
    const MAX_ENERGY: u64 = 200;
    const ENERGY_REGEN_PER_HOUR: u64 = 20;
    
    // Error Codes
    const E_NOT_REGISTERED: u64 = 1;

    const FOOD_CATEGORY: u8 = 1;

    // ... (existing structs)
    struct CitizenProfile has key {
        id: u64,
        username: String,
        citizenship: u8,
        level: u64,
        xp: u64,
        energy: u64,
        last_energy_update: u64,
        strength: u64,
        rank_points: u64,
        // credits field removed - using FT balance instead
        employer_id: u64,
    }

    struct CitizenRegistry has key {
        next_id: u64,
        population: vector<u64>, // Index is country_id
    }

    // ... (existing events)
    #[event]
    struct EnergyRecovered has drop, store {
        citizen_id: u64,
        amount: u64,
        new_energy: u64,
    }

    #[event]
    struct EnergyConsumed has drop, store {
        citizen_id: u64,
        amount: u64,
        new_energy: u64,
    }

    #[event]
    struct CitizenRegistered has drop, store {
        id: u64,
        addr: address,
        username: String,
        citizenship: u8,
    }

    fun init_module(admin: &signer) {
        if (!exists<CitizenRegistry>(signer::address_of(admin))) {
            let population = vector::empty<u64>();
            let i = 0;
            while (i < 255) {
                vector::push_back(&mut population, 0);
                i = i + 1;
            };
            move_to(admin, CitizenRegistry { next_id: 1, population });
        };
    }
    
    public entry fun register(account: &signer, username: String, citizenship: u8) acquires CitizenRegistry {
        let addr = signer::address_of(account);
        assert!(!exists<CitizenProfile>(addr), 100); // E_ALREADY_REGISTERED
        
        // Auto-initialize components for new user
        inventory::init_inventory(account);
        // training::init_training(account); // Cyclic dependency warning: we'll call it from training module if needed or handle carefully

        let reg = borrow_global_mut<CitizenRegistry>(@web3war);
        let id = reg.next_id;
        reg.next_id = reg.next_id + 1;
        
        let now = timestamp::now_seconds();
        
        move_to(account, CitizenProfile {
            id,
            username,
            citizenship,
            level: 1,
            xp: 0,
            energy: MAX_ENERGY,
            last_energy_update: now,
            strength: 10,
            rank_points: 0,
            // credits: 500, // removed
            employer_id: 0,
        });

        // Initialize coin register for new users if possible? 
        // No, entry function register needs signer to register for coin.
        // We'll handle coin registration in frontend or a separate call.

        // Update population
        let pop = vector::borrow_mut(&mut reg.population, (citizenship as u64));
        *pop = *pop + 1;

        event::emit(CitizenRegistered { id, addr, username, citizenship });
    }

    /// Internal helper to increase strength
    public fun add_strength(addr: address, amount: u64) acquires CitizenProfile {
        assert!(exists<CitizenProfile>(addr), E_NOT_REGISTERED);
        let profile = borrow_global_mut<CitizenProfile>(addr);
        profile.strength = profile.strength + amount;
    }
    
    #[view]
    public fun is_registered(addr: address): bool {
        exists<CitizenProfile>(addr)
    }

    #[view]
    public fun get_citizenship(addr: address): u8 acquires CitizenProfile {
        if (!exists<CitizenProfile>(addr)) return 0;
        borrow_global<CitizenProfile>(addr).citizenship
    }

    public fun get_strength(addr: address): u64 acquires CitizenProfile {
        if (!exists<CitizenProfile>(addr)) return 0;
        borrow_global<CitizenProfile>(addr).strength
    }

    #[view]
    public fun get_level(addr: address): u64 acquires CitizenProfile {
        if (!exists<CitizenProfile>(addr)) return 0;
        borrow_global<CitizenProfile>(addr).level
    }

    #[view]
    public fun get_population(country_id: u8): u64 acquires CitizenRegistry {
        let reg = borrow_global<CitizenRegistry>(@web3war);
        if ((country_id as u64) < vector::length(&reg.population)) {
            *vector::borrow(&reg.population, (country_id as u64))
        } else {
            0
        }
    }

    /// Internal helper to spend energy
    /// Can be called by other game modules (battle, company)
    public fun consume_energy(addr: address, amount: u64) acquires CitizenProfile {
        assert!(exists<CitizenProfile>(addr), E_NOT_REGISTERED);
        let profile = borrow_global_mut<CitizenProfile>(addr);
        
        update_energy(profile);
        
        assert!(profile.energy >= amount, 2); // E_INSUFFICIENT_ENERGY
        profile.energy = profile.energy - amount;

        event::emit(EnergyConsumed {
            citizen_id: profile.id,
            amount,
            new_energy: profile.energy,
        });
    }

    /// Internal helper to add XP
    public fun add_experience(addr: address, xp: u64, _rp_legacy: u64) acquires CitizenProfile {
        assert!(exists<CitizenProfile>(addr), E_NOT_REGISTERED);
        let profile = borrow_global_mut<CitizenProfile>(addr);
        profile.xp = profile.xp + xp;
        
        // Simple level up logic: factor of 1000
        let new_level = (profile.xp / 1000) + 1;
        if (new_level > profile.level) {
            profile.level = new_level;
        };
    }

    /// Internal helper to add Rank Points
    public fun add_rank_points(addr: address, rp: u64) acquires CitizenProfile {
        assert!(exists<CitizenProfile>(addr), E_NOT_REGISTERED);
        let profile = borrow_global_mut<CitizenProfile>(addr);
        profile.rank_points = profile.rank_points + rp;
    }

    #[view]
    public fun get_rank_points(addr: address): u64 acquires CitizenProfile {
        if (!exists<CitizenProfile>(addr)) return 0;
        borrow_global<CitizenProfile>(addr).rank_points
    }

    // Helper for energy update (private)
    fun update_energy(profile: &mut CitizenProfile) {
        let now = timestamp::now_seconds();
        let hours_passed = (now - profile.last_energy_update) / 3600;
        if (hours_passed > 0) {
            let regen = hours_passed * ENERGY_REGEN_PER_HOUR;
            if (profile.energy + regen > MAX_ENERGY) {
                profile.energy = MAX_ENERGY;
            } else {
                profile.energy = profile.energy + regen;
            };
            profile.last_energy_update = now;
        };
    }

    /// Recover energy by consuming food from inventory
    public entry fun recover_energy(
        account: &signer,
        item_id: u64,
        quality: u8,
    ) acquires CitizenProfile {
        let addr = signer::address_of(account);
        assert!(exists<CitizenProfile>(addr), E_NOT_REGISTERED);
        
        let profile = borrow_global_mut<CitizenProfile>(addr);
        
        // Update energy first to get accurate current value
        update_energy(profile);
        
        assert!(profile.energy < MAX_ENERGY, 0); // Already full
        
        // Consume 1 unit of food with specified quality
        let item = inventory::consume_item(addr, item_id, quality, 1);
        
        // Verify it is food
        assert!(inventory::get_category(&item) == FOOD_CATEGORY, 99); // E_NOT_FOOD
        
        // Restore based on quality (Q1=2, Q5=10 -> simple formula: Q * 2)
        let amount = (inventory::get_quality(&item) as u64) * 20; // e.g. Q1 = 20 energy
        
        if (profile.energy + amount > MAX_ENERGY) {
            profile.energy = MAX_ENERGY;
        } else {
            profile.energy = profile.energy + amount;
        };
        
        event::emit(EnergyRecovered {
            citizen_id: profile.id,
            amount,
            new_energy: profile.energy,
        });
    }

    /// Add Credits to citizen (e.g. from sales)
    /// Now sends real FT CRED tokens by minting from treasury/admin
    public fun add_credits(addr: address, amount: u64) {
        if (coin::is_account_registered<CRED>(addr)) {
            cred_coin::internal_mint(addr, amount);
        }
    }

    /// Deduct Credits from citizen - NOW DEPRECATED
    /// Purchases should use coin::transfer directly.
    public fun deduct_credits(_addr: address, _amount: u64) {
        // No-op or abort to find callers
        abort 999 
    }

    /// Set employment status
    public fun set_employment(addr: address, company_id: u64) acquires CitizenProfile {
        assert!(exists<CitizenProfile>(addr), E_NOT_REGISTERED);
        let profile = borrow_global_mut<CitizenProfile>(addr);
        profile.employer_id = company_id;
    }

    /// Admin only: Mint Credits for testing (Mints real FT CRED)
    public entry fun mint_credits(account: &signer, target: address, amount: u64) {
        let caller = signer::address_of(account);
        assert!(admin::is_admin(caller), 99); // E_NOT_ADMIN
        
        cred_coin::mint(account, target, amount);
    }

    /// Admin only: Add Energy for testing
    public entry fun add_energy(account: &signer, target: address, amount: u64) acquires CitizenProfile {
        let caller = signer::address_of(account);
        assert!(admin::is_admin(caller), 99); 
        
        let profile = borrow_global_mut<CitizenProfile>(target);
        if (profile.energy + amount > MAX_ENERGY) {
            profile.energy = MAX_ENERGY;
        } else {
            profile.energy = profile.energy + amount;
        };
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    #[view]
    public fun get_profile(addr: address): (u64, String, u8, u64, u64, u64, u64, u64, u64, u64, u64) acquires CitizenProfile {
        if (!exists<CitizenProfile>(addr)) {
            // Return empty/zero values if not registered
            return (0, string::utf8(b""), 0, 0, 0, 0, 0, 0, 0, 0, 0)
        };
        
        let profile = borrow_global<CitizenProfile>(addr);
        
        // Calculate current energy dynamically without modifying state
        let now = timestamp::now_seconds();
        let hours_passed = (now - profile.last_energy_update) / 3600;
        let regen = hours_passed * ENERGY_REGEN_PER_HOUR;
        let current_energy = if (profile.energy + regen > MAX_ENERGY) {
            MAX_ENERGY
        } else {
            profile.energy + regen
        };
        
        (
            profile.id,
            profile.username,
            profile.citizenship,
            profile.level,
            profile.xp,
            current_energy,
            MAX_ENERGY,
            profile.strength,
            profile.rank_points,
            0, // profile.credits removed, using 0 for legacy view compat

            profile.employer_id
        )
    }

    #[view]
    public fun get_energy(addr: address): u64 acquires CitizenProfile {
        if (!exists<CitizenProfile>(addr)) {
            return 0
        };
        
        let profile = borrow_global<CitizenProfile>(addr);
        let now = timestamp::now_seconds();
        let hours_passed = (now - profile.last_energy_update) / 3600;
        let regen = hours_passed * ENERGY_REGEN_PER_HOUR;
        
        if (profile.energy + regen > MAX_ENERGY) {
            MAX_ENERGY
        } else {
            profile.energy + regen
        }
    }

    // Aggregator view for frontend dashboard
    #[view]
    public fun get_dashboard_data(addr: address): (u64, u64, u64, u64, u64) acquires CitizenProfile {
        if (!exists<CitizenProfile>(addr)) return (0, 0, 0, 0, 0);
        let profile = borrow_global<CitizenProfile>(addr);
        
        let now = timestamp::now_seconds();
        let hours_passed = (now - profile.last_energy_update) / 3600;
        let regen = hours_passed * ENERGY_REGEN_PER_HOUR;
        let current_energy = if (profile.energy + regen > MAX_ENERGY) {
            MAX_ENERGY
        } else {
            profile.energy + regen
        };

        (
            profile.level,
            profile.xp,
            current_energy,
            profile.strength,
            0 // profile.credits removed, returning 0 for legacy view compat
        )
    }
}
