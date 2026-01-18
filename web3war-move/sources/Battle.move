module web3war::battle {
    use std::signer;
    use std::vector;
    use web3war::commander;
    use web3war::world;

    /// Error codes
    const E_NOT_COMMANDER: u64 = 1;
    const E_INVALID_REGION: u64 = 2;
    const E_BATTLE_LOST: u64 = 3;

    /// Log of a battle
    struct BattleRecord has store, drop, copy {
        attacker: address,
        region_id: u64,
        timestamp: u64,
        outcome: bool, // true = win
        reward_xp: u64,
    }

    /// Global battle history (optional, for leaderboard later)
    struct BattleHistory has key {
        battles: vector<BattleRecord>,
    }

    /// Initialize battle history (Admin)
    public entry fun init_battle_system(admin: &signer) {
        if (!exists<BattleHistory>(signer::address_of(admin))) {
            move_to(admin, BattleHistory {
                battles: vector::empty<BattleRecord>(),
            });
        }
    }

    /// Attack a region
    /// Logic: Consumes 10 Energy. Win chance based on strength (simplified: Strength > 10 = Win for prototype).
    /// Rewards: +5 XP on win.
    public entry fun attack_region(account: &signer, region_id: u64) {
        let addr = signer::address_of(account);
        
        // 1. Consume Energy (Cost of War)
        commander::consume_energy(account, 10);

        // 2. Get Player Stats
        let (_, _, _, _, strength, _, _) = commander::get_profile(addr);

        // 3. Battle Logic
        // For prototype: If strength >= 10, you win against neutral regions.
        // In real game: compare vs Region defense or Occupier strength.
        let is_win = strength >= 10;

        if (is_win) {
             // 4. Distribute Rewards
             commander::add_rank_points(account, 5);
             // TODO: Add loot mechanism
        } else {
             // Loss logic (maybe lose health?)
        };

        // 5. Log Battle (if we want on-chain history, else events are better)
        // emits event usually, simplified here
    }
}
