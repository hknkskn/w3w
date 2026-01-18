module web3war::training {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;
    use web3war::citizen;

    // ============================================
    // ERRORS
    // ============================================
    const E_COOLDOWN_ACTIVE: u64 = 1;
    const E_NOT_ADMIN: u64 = 2;
    const E_INVALID_REGIMENT: u64 = 3;

    // ============================================
    // CONSTANTS
    // ============================================
    const COOLDOWN_24H: u64 = 86400; // 24 hours
    
    // Regimen IDs
    const REGIMEN_BASIC: u8 = 0;
    const REGIMEN_ADVANCED: u8 = 1;
    const REGIMEN_ELITE: u8 = 2;
    const REGIMEN_SPECIAL_OPS: u8 = 3;

    // ============================================
    // STRUCTS
    // ============================================
    
    struct TrainingConfig has key {
        admin: address,
        // Upgrade costs in SUPRA
        upgrade_costs: vector<u64>, // Tier 2, 3, 4, 5
        // Training costs in CRED (Paid regimens)
        regimen_costs: vector<u64>, // Advanced, Elite, Special Ops
    }

    struct TrainingGrounds has key {
        qualities: vector<u8>, // Quality of 4 buildings
        last_train_time: u64,
        total_trains: u64,
    }

    // ============================================
    // EVENTS
    // ============================================
    #[event]
    struct Trained has drop, store {
        user: address,
        regimens: vector<u8>,
        total_strength_gained: u64,
        total_energy_spent: u64,
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        let upgrade_costs = vector::empty<u64>();
        vector::push_back(&mut upgrade_costs, 2500 * 100000000);
        vector::push_back(&mut upgrade_costs, 5000 * 100000000);
        vector::push_back(&mut upgrade_costs, 10000 * 100000000);
        vector::push_back(&mut upgrade_costs, 20000 * 100000000);

        let regimen_costs = vector::empty<u64>();
        vector::push_back(&mut regimen_costs, 19); // 0.19 CRED (assuming 2 decimals)
        vector::push_back(&mut regimen_costs, 89); // 0.89 CRED
        vector::push_back(&mut regimen_costs, 179); // 1.79 CRED

        move_to(admin, TrainingConfig {
            admin: signer::address_of(admin),
            upgrade_costs,
            regimen_costs,
        });
    }

    /// Update costs (Admin only)
    public entry fun update_config(
        admin: &signer,
        upgrade_costs: vector<u64>,
        regimen_costs: vector<u64>
    ) acquires TrainingConfig {
        let config = borrow_global_mut<TrainingConfig>(@web3war);
        assert!(signer::address_of(admin) == config.admin, E_NOT_ADMIN);
        config.upgrade_costs = upgrade_costs;
        config.regimen_costs = regimen_costs;
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    public entry fun init_training(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<TrainingGrounds>(addr)) {
            let qualities = vector::empty<u8>();
            vector::push_back(&mut qualities, 1);
            vector::push_back(&mut qualities, 1);
            vector::push_back(&mut qualities, 1);
            vector::push_back(&mut qualities, 1);

            move_to(account, TrainingGrounds {
                qualities,
                last_train_time: 0,
                total_trains: 0,
            });
        };
    }

    /// Perform multi-regimen training
    public entry fun train_multi(account: &signer, regimen_ids: vector<u8>) acquires TrainingGrounds, TrainingConfig {
        let addr = signer::address_of(account);
        if (!exists<TrainingGrounds>(addr)) init_training(account);

        let grounds = borrow_global_mut<TrainingGrounds>(addr);
        let config = borrow_global<TrainingConfig>(@web3war);
        let now = timestamp::now_seconds();
        let level = citizen::get_level(addr);

        assert!(now >= grounds.last_train_time + COOLDOWN_24H, E_COOLDOWN_ACTIVE);

        let total_strength_gain: u64 = 0;
        let total_energy_cost: u64 = 0;
        let total_cred_cost: u64 = 0;

        let i = 0;
        let len = vector::length(&regimen_ids);
        while (i < len) {
            let id = *vector::borrow(&regimen_ids, i);
            assert!(id <= 3, E_INVALID_REGIMENT);

            let quality = *vector::borrow(&grounds.qualities, (id as u64));
            
            // 1. Costs
            if (id == REGIMEN_BASIC) {
                total_energy_cost = total_energy_cost + 5 + (level as u64);
                total_strength_gain = total_strength_gain + (quality as u64) * 5; // Basic gives +5
            } else {
                let cred_cost = *vector::borrow(&config.regimen_costs, (id as u64) - 1);
                total_cred_cost = total_cred_cost + cred_cost;
                total_energy_cost = total_energy_cost + 1; // Paid training costs 1 energy
                
                if (id == REGIMEN_ADVANCED) total_strength_gain = total_strength_gain + (quality as u64) * 2; // +2.5 approx
                if (id == REGIMEN_ELITE) total_strength_gain = total_strength_gain + (quality as u64) * 5;
                if (id == REGIMEN_SPECIAL_OPS) total_strength_gain = total_strength_gain + (quality as u64) * 10;
            };

            i = i + 1;
        };

        // Deductions
        if (total_cred_cost > 0) {
            citizen::deduct_credits(addr, total_cred_cost);
        };
        citizen::consume_energy(addr, total_energy_cost);
        citizen::add_strength(addr, total_strength_gain);

        grounds.last_train_time = now;
        grounds.total_trains = grounds.total_trains + len;
        citizen::add_experience(addr, 5 * len, 1);

        event::emit(Trained {
            user: addr,
            regimens: regimen_ids,
            total_strength_gained: total_strength_gain,
            total_energy_spent: total_energy_cost,
        });
    }

    /// Upgrade a specific building
    public entry fun upgrade_building(account: &signer, regimen_id: u8) acquires TrainingGrounds, TrainingConfig {
        let addr = signer::address_of(account);
        let grounds = borrow_global_mut<TrainingGrounds>(addr);
        let config = borrow_global<TrainingConfig>(@web3war);
        
        assert!(regimen_id <= 3, E_INVALID_REGIMENT);
        let current_quality = vector::borrow_mut(&mut grounds.qualities, (regimen_id as u64));
        assert!(*current_quality < 5, 101);
        
        let cost = *vector::borrow(&config.upgrade_costs, (*current_quality as u64) - 1);
        coin::transfer<0x1::supra_coin::SupraCoin>(account, @web3war, cost);
        
        *current_quality = *current_quality + 1;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    #[view]
    public fun get_training_info(addr: address): (vector<u8>, u64, u64) acquires TrainingGrounds {
        if (!exists<TrainingGrounds>(addr)) return (vector[1, 1, 1, 1], 0, 0);
        let g = borrow_global<TrainingGrounds>(addr);
        (g.qualities, g.last_train_time, g.total_trains)
    }

    #[view]
    public fun get_training_pricing(): (vector<u64>, vector<u64>) acquires TrainingConfig {
        let config = borrow_global<TrainingConfig>(@web3war);
        (config.upgrade_costs, config.regimen_costs)
    }
}
