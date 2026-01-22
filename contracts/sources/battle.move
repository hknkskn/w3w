/// Battle Module - Web3War
/// Manages combat system, war declarations, and damage dealing.
module web3war::battle {

    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use web3war::citizen;
    use web3war::territory;
    use web3war::military_unit;
    use web3war::game_treasury;
    // use web3war::alliance;
    // Note: Removed governance import to break circular dependency
    // Authorization is handled by governance before calling battle functions
    
    friend web3war::governance;

    // ============================================
    // ERRORS
    // ============================================
    const E_BATTLE_NOT_FOUND: u64 = 1;
    const E_BATTLE_ENDED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_INSUFFICIENT_ENERGY: u64 = 4;
    const E_SAME_COUNTRY: u64 = 5;
    const E_BATTLE_ALREADY_EXISTS: u64 = 6;
    const E_NOT_AT_WAR: u64 = 7;
    const E_BATTLE_ON_BREAK: u64 = 8;
    const E_NOT_ON_BREAK: u64 = 9;
    const E_ROUND_NOT_FINISHED: u64 = 10;

    // ============================================
    // CONSTANTS
    // ============================================
    const FIGHT_ENERGY_COST: u64 = 10;
    const ROUND_DURATION: u64 = 14400; // 4 hours per round
    const BREAK_DURATION: u64 = 3600;  // 1 hour break
    const TOTAL_ROUNDS: u8 = 5;
    const WIN_POINTS_NEEDED: u8 = 3;
    const BASE_DAMAGE: u64 = 100;
    
    // Achievement Titles
    const HERO_REWARD_NORMAL: u64 = 1000000;    // 10K CRED per hero (scaled)
    const HERO_REWARD_RESISTANCE: u64 = 500000; // 5K CRED for resistance

    // Item IDs (Phase 13 Ontology)
    const ID_WEAPON: u64 = 202;
    const ID_MISSILE: u64 = 204;

    // Damage Multipliers (Scaled by 10)
    const MULTIPLIER_BARE_HANDS: u128 = 10; // 1.0x
    const MULTIPLIER_WEAPON_BASE: u128 = 2;   // +0.2x per Q
    const MULTIPLIER_MISSILE_BASE: u128 = 20; // +2.0x per Q

    // ============================================
    // STRUCTS
    // ============================================
    
    struct RoundHistory has store, copy, drop {
        round_number: u8,
        winner_side: u8, // 1 = Attacker, 2 = Defender
        attacker_top: RoundTopDamager,
        defender_top: RoundTopDamager,
    }

    /// Represents an active battle for a region
    struct Battle has key, store, copy, drop {
        id: u64,
        region_id: u64,
        attacker_country: u8,
        defender_country: u8,
        
        attacker_damage: u128,
        defender_damage: u128,
        
        start_time: u64,
        end_time: u64,
        
        // Wall percentage (0-100, 50 = neutral)
        wall: u8,
        
        // Result: 0 = ongoing, 1 = attacker won, 2 = defender won
        result: u8,

        // Flags for special war types
        is_resistance: bool,
        is_training: bool,
        
        // Phase 5: Round Management
        current_round: u8,
        attacker_points: u8,
        defender_points: u8,
        round_end_time: u64,
        is_break: bool,         // True if currently in break between rounds
        break_end_time: u64,    // When break ends
        round_history: vector<RoundHistory>,
    }

    struct BattleRoundHistoryView has store, copy, drop {
        round_number: u8,
        winner_side: u8,
        attacker_top_addr: address,
        attacker_top_influence: u128,
        defender_top_addr: address,
        defender_top_influence: u128,
    }

    struct RoundTopDamager has store, copy, drop {
        addr: address,
        influence: u128,
    }

    struct RoundData has key, store, copy, drop {
        battle_id: u64,
        attacker_top: RoundTopDamager,
        defender_top: RoundTopDamager,
    }

    struct BattleRoundsRegistry has key {
        rounds: vector<RoundData>,
    }

    /// Global battle registry
    struct BattleRegistry has key {
        next_id: u64,
        active_battles: vector<u64>,
    }

    /// Individual battle storage (keyed by ID)
    struct BattleStore has key {
        battles: vector<Battle>,
    }

    // ============================================
    // EVENTS
    // ============================================
    #[event]
    struct BattleStarted has drop, store {
        battle_id: u64,
        region_id: u64,
        attacker: u8,
        defender: u8,
        end_time: u64,
    }

    #[event]
    struct DamageDealt has drop, store {
        battle_id: u64,
        citizen_id: u64,
        side: u8, // 1 = attacker, 2 = defender
        damage: u128,
        weapon_quality: u8,
    }

    #[event]
    struct BattleEnded has drop, store {
        battle_id: u64,
        winner: u8, // Country ID
        attacker_total: u128,
        defender_total: u128,
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        let addr = signer::address_of(admin);
        if (!exists<BattleRegistry>(addr)) {
            move_to(admin, BattleRegistry {
                next_id: 1,
                active_battles: vector::empty(),
            });
        };
        if (!exists<BattleStore>(addr)) {
            move_to(admin, BattleStore {
                battles: vector::empty(),
            });
        };
        if (!exists<BattleRoundsRegistry>(addr)) {
            move_to(admin, BattleRoundsRegistry {
                rounds: vector::empty(),
            });
        };
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    // Note: Legacy declare_war function removed to break circular dependency.
    // War declaration is now handled through governance::declare_war which calls start_war_battle.

    /// Start a war battle (called by governance module)
    public(friend) fun start_war_battle(
        attacker_country: u8,
        defender_country: u8,
        region_id: u64,
        is_resistance: bool,
    ) acquires BattleRegistry, BattleStore {
        start_war_battle_internal(attacker_country, defender_country, region_id, is_resistance, false);
    }

    /// Internal function to start a war battle
    fun start_war_battle_internal(
        attacker_country: u8,
        defender_country: u8,
        region_id: u64,
        is_resistance: bool,
        is_training: bool,
    ) acquires BattleRegistry, BattleStore {
        let registry = borrow_global_mut<BattleRegistry>(@web3war);
        let store = borrow_global_mut<BattleStore>(@web3war);
        
        // Check if battle already exists for this region
        let i = 0;
        while (i < vector::length(&registry.active_battles)) {
            let b_id = *vector::borrow(&registry.active_battles, i);
            let active_b = find_battle(&store.battles, b_id);
            assert!(active_b.region_id != region_id, E_BATTLE_ALREADY_EXISTS);
            i = i + 1;
        };

        let battle_id = registry.next_id;
        registry.next_id = registry.next_id + 1;
        
        let now = timestamp::now_seconds();
        
        // Total battle time = 5 rounds x 4 hours + 4 breaks x 1 hour = 24 hours
        let total_duration = (TOTAL_ROUNDS as u64) * ROUND_DURATION + ((TOTAL_ROUNDS - 1) as u64) * BREAK_DURATION;
        let end_time = if (is_training) { now + 3600 } else { now + total_duration };
        let wall = 50;

        let battle = Battle {
            id: battle_id,
            region_id,
            attacker_country,
            defender_country,
            attacker_damage: 0,
            defender_damage: 0,
            start_time: now,
            end_time,
            wall,
            result: 0,
            is_resistance,
            is_training,
            current_round: 1,
            attacker_points: 0,
            defender_points: 0,
            round_end_time: now + ROUND_DURATION,
            is_break: false,
            break_end_time: 0,
            round_history: vector::empty(),
        };
        
        vector::push_back(&mut store.battles, battle);
        vector::push_back(&mut registry.active_battles, battle_id);
        
        event::emit(BattleStarted {
            battle_id,
            region_id,
            attacker: attacker_country,
            defender: defender_country,
            end_time,
        });
    }

    /// Check if there's an active battle for a specific region
    #[view]
    public fun has_active_battle_for_region(region_id: u64): bool acquires BattleRegistry, BattleStore {
        if (!exists<BattleRegistry>(@web3war)) return false;
        if (!exists<BattleStore>(@web3war)) return false;
        
        let registry = borrow_global<BattleRegistry>(@web3war);
        let store = borrow_global<BattleStore>(@web3war);
        
        let i = 0;
        while (i < vector::length(&registry.active_battles)) {
            let b_id = *vector::borrow(&registry.active_battles, i);
            let battle = find_battle(&store.battles, b_id);
            if (battle.region_id == region_id && battle.result == 0) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /// Calculate influence based on eRep mechanics:
    /// (Strength / 10 + RankPoints / 500) * (1 + WeaponQ * 0.2) * 10
    public fun calculate_influence(
        strength: u64,
        rank_points: u64,
        item_id: u64,
        weapon_quality: u8
    ): u128 {
        let base = (strength as u128) / 10 + (rank_points as u128) / 500 + 10;
        
        let multiplier = MULTIPLIER_BARE_HANDS;
        if (item_id == ID_WEAPON) {
            multiplier = 10 + (weapon_quality as u128) * MULTIPLIER_WEAPON_BASE;
        } else if (item_id == ID_MISSILE) {
            multiplier = 10 + (weapon_quality as u128) * MULTIPLIER_MISSILE_BASE;
        };

        (base * multiplier) 
    }

    /// Fight in a battle - deal damage
    public entry fun fight(
        account: &signer,
        battle_id: u64,
        item_id: u64,       // 0 for bare hands, 202 for weapon, 204 for missile
        weapon_quality: u8, // 0-5
    ) acquires BattleStore, BattleRoundsRegistry {
        let addr = signer::address_of(account);

        // 1. Get citizen info and consume energy
        assert!(citizen::is_registered(addr), E_NOT_AUTHORIZED);
        
        // 1.1 Item Consumption (if not bare hands)
        if (item_id != 0) {
            use web3war::inventory;
            inventory::remove_item(addr, item_id, weapon_quality, 1);
        };

        citizen::consume_energy(addr, FIGHT_ENERGY_COST);

        let strength = citizen::get_strength(addr);
        let rank_points = citizen::get_rank_points(addr);
        
        // 2. Find battle
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        // 3. Determine Side (1 = Attacker, 2 = Defender)
        let side: u8 = if (citizen::get_citizenship(addr) == battle.defender_country) { 2 } else { 1 };
        
        // 4. Calculate Influence
        let influence = calculate_influence(strength, rank_points, item_id, weapon_quality);

        // MU Bonus: +10% if daily order matches region
        if (military_unit::is_daily_order(addr, battle.region_id)) {
            influence = influence + (influence / 10);
        };
        
        // 5. Update Total Damage
        if (side == 1) {
            battle.attacker_damage = battle.attacker_damage + influence;
        } else {
            battle.defender_damage = battle.defender_damage + influence;
        };
        
        // 6. Update Round Top Damager
        let registry = borrow_global_mut<BattleRoundsRegistry>(@web3war);
        let round_data = find_round_data_mut(&mut registry.rounds, battle_id);
        
        if (side == 1) {
            if (influence > round_data.attacker_top.influence) {
                round_data.attacker_top = RoundTopDamager { addr, influence };
            }
        } else {
            if (influence > round_data.defender_top.influence) {
                round_data.defender_top = RoundTopDamager { addr, influence };
            }
        };

        // 7. Update wall percentage
        let total = battle.attacker_damage + battle.defender_damage;
        if (total > 0) {
            let wall_val = (battle.attacker_damage * 100) / total;
            battle.wall = (wall_val as u8);
        };
        
        // 8. Give Rewards (XP and RP)
        citizen::add_experience(addr, 10, (influence / 100 as u64));
        citizen::add_rank_points(addr, (influence / 10 as u64));
        
        event::emit(DamageDealt {
            battle_id,
            citizen_id: 0,
            side,
            damage: influence,
            weapon_quality,
        });
    }

    /// Fight multiple times in a single transaction (Batch Attack)
    public entry fun fight_multi(
        account: &signer,
        battle_id: u64,
        item_id: u64,
        weapon_quality: u8,
        count: u64,
    ) acquires BattleStore, BattleRoundsRegistry {
        let i = 0;
        while (i < count) {
            fight(account, battle_id, item_id, weapon_quality);
            i = i + 1;
        };
    }

    /// End the current round
    public entry fun end_round(
        _account: &signer,
        battle_id: u64
    ) acquires BattleStore, BattleRoundsRegistry {
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        let now = timestamp::now_seconds();
        
        // Cannot end round during break
        assert!(!battle.is_break, E_BATTLE_ON_BREAK);
        assert!(now >= battle.round_end_time, E_ROUND_NOT_FINISHED);

        // Determine round winner from wall
        let winner_side: u8 = if (battle.wall > 50) { 1 } else { 2 };
        
        if (winner_side == 1) {
            battle.attacker_points = battle.attacker_points + 1;
        } else {
            battle.defender_points = battle.defender_points + 1;
        };

        // Capture top damagers
        let registry = borrow_global_mut<BattleRoundsRegistry>(@web3war);
        let round_data = *find_round_data_mut(&mut registry.rounds, battle_id);
        
        let history = RoundHistory {
            round_number: battle.current_round,
            winner_side,
            attacker_top: round_data.attacker_top,
            defender_top: round_data.defender_top,
        };
        
        vector::push_back(&mut battle.round_history, history);
        
        // Check if someone won (first to 3 points)
        if (battle.attacker_points >= WIN_POINTS_NEEDED || battle.defender_points >= WIN_POINTS_NEEDED) {
            // Battle will be ended via end_battle call
            battle.end_time = now; // Allow immediate end_battle call
            return // Don't start break, battle is effectively over
        };
        
        // Check if this was the last round (5 rounds completed)
        if (battle.current_round >= TOTAL_ROUNDS) {
            battle.end_time = now; // Allow immediate end_battle call
            return
        };
        
        // Start break period (1 hour)
        battle.is_break = true;
        battle.break_end_time = now + BREAK_DURATION;
        
        // Reset damages for next round (but keep cumulative totals elsewhere if needed)
        battle.attacker_damage = 0;
        battle.defender_damage = 0;
        battle.wall = 50;
        
        // Reset current top damagers in registry
        let round_data_mut = find_round_data_mut(&mut registry.rounds, battle_id);
        round_data_mut.attacker_top = RoundTopDamager { addr: @0x0, influence: 0 };
        round_data_mut.defender_top = RoundTopDamager { addr: @0x0, influence: 0 };
    }

    /// Start the next round after break
    public entry fun start_next_round(
        _account: &signer,
        battle_id: u64
    ) acquires BattleStore {
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        let now = timestamp::now_seconds();
        
        assert!(battle.is_break, E_NOT_ON_BREAK);
        assert!(now >= battle.break_end_time, E_ROUND_NOT_FINISHED);
        
        // End break and start next round
        battle.is_break = false;
        battle.current_round = battle.current_round + 1;
        battle.round_end_time = now + ROUND_DURATION;
    }

    /// End a battle (callable by anyone after timer expires or when 3 points reached)
    public entry fun end_battle(
        _account: &signer,
        battle_id: u64,
    ) acquires BattleRegistry, BattleStore {
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        let now = timestamp::now_seconds();
        assert!(now >= battle.end_time, E_BATTLE_ENDED);
        assert!(battle.result == 0, E_BATTLE_ENDED); // Not already ended
        
        // Determine winner based on points
        let winner = if (battle.attacker_points > battle.defender_points) {
            battle.result = 1;
            battle.attacker_country
        } else if (battle.defender_points > battle.attacker_points) {
            battle.result = 2;
            battle.defender_country
        } else {
            // Tie break with damage if points are equal
            if (battle.attacker_damage > battle.defender_damage) {
                battle.result = 1;
                battle.attacker_country
            } else {
                battle.result = 2;
                battle.defender_country
            }
        };
        
        // Remove from active battles
        let registry = borrow_global_mut<BattleRegistry>(@web3war);
        let (found, idx) = vector::index_of(&registry.active_battles, &battle_id);
        if (found) {
            vector::remove(&mut registry.active_battles, idx);
        };
        
        // Transfer region ownership if attacker won a real war
        if (battle.result == 1 && !battle.is_training) {
            territory::transfer_ownership(battle.region_id, battle.attacker_country);
        };
        
        // Register ganimet (war spoils) with game_treasury if not training
        if (!battle.is_training) {
            // Calculate winner reward based on war type
            let winner_reward = if (battle.is_resistance) {
                15000000 // 150K CRED (60% of 250K)
            } else {
                60000000 // 600K CRED (60% of 1M)
            };
            
            game_treasury::register_war_reward(battle_id, winner, winner_reward);
            
            // Register hero rewards for each completed round
            let hero_amount = game_treasury::get_hero_reward_amount(battle.is_resistance);
            let i = 0;
            let len = vector::length(&battle.round_history);
            while (i < len) {
                let history = vector::borrow(&battle.round_history, i);
                let round_num = history.round_number;
                
                // Attacker hero
                if (history.attacker_top.addr != @0x0) {
                    game_treasury::register_hero_reward(
                        battle_id, 
                        round_num, 
                        history.attacker_top.addr, 
                        1, // attacker side
                        hero_amount
                    );
                };
                
                // Defender hero
                if (history.defender_top.addr != @0x0) {
                    game_treasury::register_hero_reward(
                        battle_id, 
                        round_num, 
                        history.defender_top.addr, 
                        2, // defender side
                        hero_amount
                    );
                };
                
                i = i + 1;
            };
        };
        
        event::emit(BattleEnded {
            battle_id,
            winner,
            attacker_total: battle.attacker_damage,
            defender_total: battle.defender_damage,
        });
    }

    /// Admin: Force end a battle immediately (winner_side: 1=attacker, 2=defender)
    public entry fun admin_end_battle(
        admin: &signer,
        battle_id: u64,
        winner_side: u8,
    ) acquires BattleRegistry, BattleStore {
        let admin_addr = signer::address_of(admin);
        assert!(web3war::admin::is_admin(admin_addr), E_NOT_AUTHORIZED);
        
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        // Set result based on admin decision
        let winner = if (winner_side == 1) {
            battle.result = 1;
            battle.attacker_country
        } else {
            battle.result = 2;
            battle.defender_country
        };
        
        // Remove from active battles
        let registry = borrow_global_mut<BattleRegistry>(@web3war);
        let (found, idx) = vector::index_of(&registry.active_battles, &battle_id);
        if (found) {
            vector::remove(&mut registry.active_battles, idx);
        };
        
        // Transfer region ownership if attacker won a real war
        if (battle.result == 1 && !battle.is_training) {
            territory::transfer_ownership(battle.region_id, battle.attacker_country);
        };
        
        event::emit(BattleEnded {
            battle_id,
            winner,
            attacker_total: battle.attacker_damage,
            defender_total: battle.defender_damage,
        });
    }

    /// Admin: Cancel a battle (no winner, no territory transfer)
    public entry fun admin_cancel_battle(
        admin: &signer,
        battle_id: u64,
    ) acquires BattleRegistry, BattleStore {
        let admin_addr = signer::address_of(admin);
        assert!(web3war::admin::is_admin(admin_addr), E_NOT_AUTHORIZED);
        
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        // Mark as cancelled (result = 3)
        battle.result = 3;
        
        // Remove from active battles
        let registry = borrow_global_mut<BattleRegistry>(@web3war);
        let (found, idx) = vector::index_of(&registry.active_battles, &battle_id);
        if (found) {
            vector::remove(&mut registry.active_battles, idx);
        };
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    #[view]
    public fun get_battle_info(battle_id: u64): (u64, u8, u8, u128, u128, u8, u8, u8, u8, u64) acquires BattleStore {
        let store = borrow_global<BattleStore>(@web3war);
        let battle = find_battle(&store.battles, battle_id);
        
        (
            battle.region_id,
            battle.attacker_country,
            battle.defender_country,
            battle.attacker_damage,
            battle.defender_damage,
            battle.wall,
            battle.current_round,
            battle.attacker_points,
            battle.defender_points,
            battle.round_end_time
        )
    }

    #[view]
    public fun get_battle_history(battle_id: u64): vector<BattleRoundHistoryView> acquires BattleStore {
        let store = borrow_global<BattleStore>(@web3war);
        let battle = find_battle(&store.battles, battle_id);
        
        let history = vector::empty<BattleRoundHistoryView>();
        let i = 0;
        let len = vector::length(&battle.round_history);
        while (i < len) {
            let h = vector::borrow(&battle.round_history, i);
            vector::push_back(&mut history, BattleRoundHistoryView {
                round_number: h.round_number,
                winner_side: h.winner_side,
                attacker_top_addr: h.attacker_top.addr,
                attacker_top_influence: h.attacker_top.influence,
                defender_top_addr: h.defender_top.addr,
                defender_top_influence: h.defender_top.influence,
            });
            i = i + 1;
        };
        history
    }

    #[view]
    public fun get_active_battles(): vector<u64> acquires BattleRegistry {
        borrow_global<BattleRegistry>(@web3war).active_battles
    }

    // Returns detailed info for all active battles to reduce frontend calls
    // Returns: (ids, region_ids, attackers, defenders, walls, end_times)
    #[view]
    public fun get_active_battle_details(): (
        vector<u64>, 
        vector<u64>, 
        vector<u8>, 
        vector<u8>, 
        vector<u8>, 
        vector<u64>
    ) acquires BattleRegistry, BattleStore {
        let registry = borrow_global<BattleRegistry>(@web3war);
        let store = borrow_global<BattleStore>(@web3war);
        
        let ids = vector::empty<u64>();
        let regions = vector::empty<u64>();
        let attackers = vector::empty<u8>();
        let defenders = vector::empty<u8>();
        let walls = vector::empty<u8>();
        let end_times = vector::empty<u64>();
        
        let len = vector::length(&registry.active_battles);
        let i = 0;
        while (i < len) {
            let battle_id = *vector::borrow(&registry.active_battles, i);
            let battle = find_battle(&store.battles, battle_id);
            
            vector::push_back(&mut ids, battle.id);
            vector::push_back(&mut regions, battle.region_id);
            vector::push_back(&mut attackers, battle.attacker_country);
            vector::push_back(&mut defenders, battle.defender_country);
            vector::push_back(&mut walls, battle.wall);
            vector::push_back(&mut end_times, battle.end_time);
            
            i = i + 1;
        };
        
        (ids, regions, attackers, defenders, walls, end_times)
    }

    #[view]
    public fun get_battle_round_details(battle_id: u64): (
        u8, u8, u8, u64, u128, u128, address, u128, address, u128
    ) acquires BattleStore, BattleRoundsRegistry {
        let store = borrow_global<BattleStore>(@web3war);
        let battle = find_battle(&store.battles, battle_id);
        
        let registry = borrow_global<BattleRoundsRegistry>(@web3war);
        let rounds = &registry.rounds;
        let i = 0;
        let len = vector::length(rounds);
        // let round_found = false;
        let r_ptr: &RoundData = &RoundData { battle_id: 0, attacker_top: RoundTopDamager { addr: @0x0, influence: 0 }, defender_top: RoundTopDamager { addr: @0x0, influence: 0 } };

        while (i < len) {
            let r = vector::borrow(rounds, i);
            if (r.battle_id == battle_id) {
                r_ptr = r;
                // round_found = true;
                break
            };
            i = i + 1;
        };

        (
            battle.current_round,
            battle.attacker_points,
            battle.defender_points,
            battle.round_end_time,
            battle.attacker_damage,
            battle.defender_damage,
            r_ptr.attacker_top.addr,
            r_ptr.attacker_top.influence,
            r_ptr.defender_top.addr,
            r_ptr.defender_top.influence
        )
    }

    #[view]
    public fun get_round_data(battle_id: u64): (u8, u8, u8, address, u128, address, u128) acquires BattleStore, BattleRoundsRegistry {
        let (current_round, att_pts, def_pts, _, _, _, att_top_addr, att_top_inf, def_top_addr, def_top_inf) = get_battle_round_details(battle_id);
        (current_round, att_pts, def_pts, att_top_addr, att_top_inf, def_top_addr, def_top_inf)
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    fun find_battle(battles: &vector<Battle>, id: u64): &Battle {
        let len = vector::length(battles);
        let i = 0;
        while (i < len) {
            let b = vector::borrow(battles, i);
            if (b.id == id) {
                return b
            };
            i = i + 1;
        };
        abort E_BATTLE_NOT_FOUND
    }
    
    fun find_round_data_mut(rounds: &mut vector<RoundData>, id: u64): &mut RoundData {
        let len = vector::length(rounds);
        let i = 0;
        while (i < len) {
            let r = vector::borrow_mut(rounds, i);
            if (r.battle_id == id) {
                return r
            };
            i = i + 1;
        };
        // If not found, create one (Initial round state)
        vector::push_back(rounds, RoundData {
            battle_id: id,
            attacker_top: RoundTopDamager { addr: @0x0, influence: 0 },
            defender_top: RoundTopDamager { addr: @0x0, influence: 0 },
        });
        let new_len = vector::length(rounds);
        vector::borrow_mut(rounds, new_len - 1)
    }

    fun find_battle_mut(battles: &mut vector<Battle>, id: u64): &mut Battle {
        let len = vector::length(battles);
        let i = 0;
        while (i < len) {
            let b = vector::borrow_mut(battles, i);
            if (b.id == id) {
                return b
            };
            i = i + 1;
        };
        abort E_BATTLE_NOT_FOUND
    }
}
