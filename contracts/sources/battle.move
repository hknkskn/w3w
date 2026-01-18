/// Battle Module - Web3War
/// Manages combat system, war declarations, and damage dealing.
module web3war::battle {

    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use web3war::citizen;
    use web3war::governance;
    use web3war::territory;
    use web3war::military_unit;
    // use web3war::alliance;

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

    // ============================================
    // CONSTANTS
    // ============================================
    const FIGHT_ENERGY_COST: u64 = 10;
    const BATTLE_DURATION: u64 = 14400; // 4 hours in seconds
    const BASE_DAMAGE: u64 = 100;
    
    // Achievement Titles
    const MEDAL_BATTLE_HERO: u64 = 10; // Reward in CRED for Battle Hero

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

    struct RoundData has key, store {
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
        move_to(admin, BattleRegistry {
            next_id: 1,
            active_battles: vector::empty(),
        });
        move_to(admin, BattleStore {
            battles: vector::empty(),
        });
        move_to(admin, BattleRoundsRegistry {
            rounds: vector::empty(),
        });
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    /// Declare war on a region (requires President authority)
    public entry fun declare_war(
        account: &signer,
        region_id: u64,
        attacker_country: u8,
        is_training: bool,
    ) acquires BattleRegistry, BattleStore {
        let caller = signer::address_of(account);
        
        // 1. Authorization: Only president can declare war

        assert!(governance::is_president(caller, attacker_country), E_NOT_AUTHORIZED);
        
        let defender_country = territory::get_region_owner(region_id);
        assert!(attacker_country != defender_country, E_SAME_COUNTRY);
        
        // 2. Determine if it's a Resistance War
        // Simplified: We assume for now if you attack your own region that is occupied, it's resistance.
        // But since we don't store 'original_owner' yet, we'll set is_resistance to false or 
        // need to add original_owner to Region struct. For now: false.
        let is_resistance = false; 
        
        let registry = borrow_global_mut<BattleRegistry>(@web3war);
        let store = borrow_global_mut<BattleStore>(@web3war);
        
        // 3. Check if battle already exists for this region
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
        
        let (end_time, wall) = if (is_training) {
            (now + 3600, 50) // Training wars last 1 hour
        } else {
            (now + BATTLE_DURATION, 50)
        };

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
            round_end_time: now + 7200,
            round_history: vector::empty(),
        };
        
        vector::push_back(&mut store.battles, battle);
        vector::push_back(&mut registry.active_battles, battle_id);
        
        // 4. Handle MPPs (Simplified: If defender has MPPs, they gain defensive bonuses)
        // In full implementation, this could trigger secondary battles.
        
        event::emit(BattleStarted {
            battle_id,
            region_id,
            attacker: attacker_country,
            defender: defender_country,
            end_time,
        });
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

    /// End the current round
    public entry fun end_round(
        _account: &signer,
        battle_id: u64
    ) acquires BattleStore, BattleRoundsRegistry {
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        let now = timestamp::now_seconds();
        // Simplified: anyone can trigger end round if time is up
        assert!(now >= battle.round_end_time, E_BATTLE_ENDED);

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
        
        // Reset for next round
        battle.current_round = battle.current_round + 1;
        battle.round_end_time = now + 7200;
        battle.attacker_damage = 0;
        battle.defender_damage = 0;
        battle.wall = 50;
        
        // Reset current top damagers in registry
        let round_data_mut = find_round_data_mut(&mut registry.rounds, battle_id);
        round_data_mut.attacker_top = RoundTopDamager { addr: @0x0, influence: 0 };
        round_data_mut.defender_top = RoundTopDamager { addr: @0x0, influence: 0 };
    }

    /// End a battle (callable by anyone after timer expires)
    public entry fun end_battle(
        _account: &signer,
        battle_id: u64,
    ) acquires BattleRegistry, BattleStore {
        let store = borrow_global_mut<BattleStore>(@web3war);
        let battle = find_battle_mut(&mut store.battles, battle_id);
        
        let now = timestamp::now_seconds();
        assert!(now >= battle.end_time, E_BATTLE_ENDED);
        
        // Determine winner based on points (Simplified: بیشتر امتیاز برنده است)
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
        
        // 3. Transfer region ownership if attacker won a real war
        if (battle.result == 1 && !battle.is_training) {
            territory::transfer_ownership(battle.region_id, battle.attacker_country);
        };
        
        // 4. Reward distribution (Battle Hero - Placeholder Logic)
        // In a real implementation we would track top damager per battle.
        // For now, we emit the status.
        
        event::emit(BattleEnded {
            battle_id,
            winner,
            attacker_total: battle.attacker_damage,
            defender_total: battle.defender_damage,
        });
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
        let round_found = false;
        let r_ptr: &RoundData = &RoundData { battle_id: 0, attacker_top: RoundTopDamager { addr: @0x0, influence: 0 }, defender_top: RoundTopDamager { addr: @0x0, influence: 0 } };

        while (i < len) {
            let r = vector::borrow(rounds, i);
            if (r.battle_id == battle_id) {
                r_ptr = r;
                round_found = true;
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
