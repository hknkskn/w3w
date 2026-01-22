/// Game Treasury Module - Web3War
/// Central treasury for war fees, hero rewards, and ganimet distribution.
module web3war::game_treasury {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use web3war::citizen;
    use web3war::treasury;
    // Note: Removed governance import to break circular dependency
    // Authorization uses citizen module instead
    
    friend web3war::battle;
    friend web3war::governance;
    
    // ============================================
    // ERRORS
    // ============================================
    const E_INSUFFICIENT_BALANCE: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;
    const E_REWARD_NOT_FOUND: u64 = 3;
    const E_ALREADY_CLAIMED: u64 = 4;
    const E_REWARD_EXPIRED: u64 = 5;
    
    // ============================================
    // CONSTANTS
    // ============================================
    const CLAIM_TIMEOUT: u64 = 2592000; // 30 days in seconds
    
    // War fee distribution percentages (scaled by 100)
    const WINNER_REWARD_PCT: u64 = 60;
    const HERO_REWARD_PCT: u64 = 10;
    const DEFLATION_PCT: u64 = 30;
    
    // Hero reward per round (10K CRED = 1000000 scaled)
    const HERO_REWARD_NORMAL: u64 = 1000000;
    const HERO_REWARD_RESISTANCE: u64 = 500000; // 5K for resistance
    
    // ============================================
    // STRUCTS
    // ============================================
    
    struct GameTreasury has key {
        balance: u64,
        total_received: u64,
        total_distributed: u64,
        total_deflated: u64,
    }
    
    struct PendingWarReward has store, copy, drop {
        battle_id: u64,
        winner_country: u8,
        amount: u64,
        created_at: u64,
        claimed: bool,
    }
    
    struct PendingHeroReward has store, copy, drop {
        battle_id: u64,
        round: u8,
        hero_addr: address,
        side: u8, // 1 = attacker, 2 = defender
        amount: u64,
        created_at: u64,
        claimed: bool,
    }
    
    struct RewardRegistry has key {
        war_rewards: vector<PendingWarReward>,
        hero_rewards: vector<PendingHeroReward>,
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        let addr = signer::address_of(admin);
        if (!exists<GameTreasury>(addr)) {
            move_to(admin, GameTreasury { 
                balance: 0, 
                total_received: 0, 
                total_distributed: 0,
                total_deflated: 0,
            });
        };
        if (!exists<RewardRegistry>(addr)) {
            move_to(admin, RewardRegistry { 
                war_rewards: vector::empty(),
                hero_rewards: vector::empty(),
            });
        };
    }
    
    // ============================================
    // FRIEND FUNCTIONS (Called by battle module)
    // ============================================
    
    /// Receive war fee and calculate distributions
    /// Returns: (winner_reward, hero_pool, deflation)
    public(friend) fun receive_war_fee(amount: u64): (u64, u64, u64) acquires GameTreasury {
        let treasury = borrow_global_mut<GameTreasury>(@web3war);
        
        let winner_reward = (amount * WINNER_REWARD_PCT) / 100;
        let hero_pool = (amount * HERO_REWARD_PCT) / 100;
        let deflation = amount - winner_reward - hero_pool;
        
        // Only deflation stays in treasury permanently
        treasury.balance = treasury.balance + deflation;
        treasury.total_received = treasury.total_received + amount;
        treasury.total_deflated = treasury.total_deflated + deflation;
        
        (winner_reward, hero_pool, deflation)
    }
    
    /// Register pending war reward (ganimet) for winner country
    public(friend) fun register_war_reward(
        battle_id: u64, 
        winner_country: u8, 
        amount: u64
    ) acquires RewardRegistry {
        let reg = borrow_global_mut<RewardRegistry>(@web3war);
        vector::push_back(&mut reg.war_rewards, PendingWarReward {
            battle_id,
            winner_country,
            amount,
            created_at: timestamp::now_seconds(),
            claimed: false,
        });
    }
    
    /// Register hero reward for a round top damager
    public(friend) fun register_hero_reward(
        battle_id: u64,
        round: u8,
        hero_addr: address,
        side: u8,
        amount: u64
    ) acquires RewardRegistry {
        let reg = borrow_global_mut<RewardRegistry>(@web3war);
        vector::push_back(&mut reg.hero_rewards, PendingHeroReward {
            battle_id,
            round,
            hero_addr,
            side,
            amount,
            created_at: timestamp::now_seconds(),
            claimed: false,
        });
    }
    
    // ============================================
    // ENTRY FUNCTIONS
    // ============================================
    
    /// Claim war reward (ganimet) - Any citizen of winning country can claim for their treasury
    public entry fun claim_war_reward(
        account: &signer,
        battle_id: u64
    ) acquires RewardRegistry {
        let caller = signer::address_of(account);
        let reg = borrow_global_mut<RewardRegistry>(@web3war);
        
        let i = 0;
        let len = vector::length(&reg.war_rewards);
        while (i < len) {
            let reward = vector::borrow_mut(&mut reg.war_rewards, i);
            if (reward.battle_id == battle_id && !reward.claimed) {
                // Authorization: Must be citizen of winning country
                let caller_country = citizen::get_citizenship(caller);
                assert!(caller_country == reward.winner_country, E_NOT_AUTHORIZED);
                
                // Check timeout
                let now = timestamp::now_seconds();
                assert!(now < reward.created_at + CLAIM_TIMEOUT, E_REWARD_EXPIRED);
                
                // Transfer to country treasury
                treasury::deposit_reward(reward.winner_country, reward.amount);
                
                reward.claimed = true;
                return
            };
            i = i + 1;
        };
        abort E_REWARD_NOT_FOUND
    }
    
    /// Claim hero reward - Individual hero claims their own reward
    public entry fun claim_hero_reward(
        account: &signer,
        battle_id: u64,
        round: u8
    ) acquires RewardRegistry {
        let caller = signer::address_of(account);
        let reg = borrow_global_mut<RewardRegistry>(@web3war);
        
        let i = 0;
        let len = vector::length(&reg.hero_rewards);
        while (i < len) {
            let reward = vector::borrow_mut(&mut reg.hero_rewards, i);
            if (reward.battle_id == battle_id && 
                reward.round == round && 
                reward.hero_addr == caller && 
                !reward.claimed) {
                
                // Check timeout
                let now = timestamp::now_seconds();
                assert!(now < reward.created_at + CLAIM_TIMEOUT, E_REWARD_EXPIRED);
                
                // Transfer to citizen wallet
                citizen::add_credits(caller, reward.amount);
                
                reward.claimed = true;
                return
            };
            i = i + 1;
        };
        abort E_REWARD_NOT_FOUND
    }
    
    /// Admin: Cleanup expired rewards (return to treasury)
    public entry fun cleanup_expired_rewards(admin: &signer) acquires GameTreasury, RewardRegistry {
        let admin_addr = signer::address_of(admin);
        assert!(web3war::admin::is_admin(admin_addr), E_NOT_AUTHORIZED);
        
        let now = timestamp::now_seconds();
        let reg = borrow_global_mut<RewardRegistry>(@web3war);
        let treasury = borrow_global_mut<GameTreasury>(@web3war);
        
        // Cleanup war rewards
        let i = 0;
        while (i < vector::length(&reg.war_rewards)) {
            let reward = vector::borrow_mut(&mut reg.war_rewards, i);
            if (!reward.claimed && now >= reward.created_at + CLAIM_TIMEOUT) {
                treasury.balance = treasury.balance + reward.amount;
                reward.claimed = true;
            };
            i = i + 1;
        };
        
        // Cleanup hero rewards
        let j = 0;
        while (j < vector::length(&reg.hero_rewards)) {
            let reward = vector::borrow_mut(&mut reg.hero_rewards, j);
            if (!reward.claimed && now >= reward.created_at + CLAIM_TIMEOUT) {
                treasury.balance = treasury.balance + reward.amount;
                reward.claimed = true;
            };
            j = j + 1;
        };
    }

    /// Admin: Deposit CRED to game treasury (for hero rewards funding)
    public entry fun admin_deposit(admin: &signer, amount: u64) acquires GameTreasury {
        let admin_addr = signer::address_of(admin);
        assert!(web3war::admin::is_admin(admin_addr), E_NOT_AUTHORIZED);
        
        // Burn from admin wallet and add to treasury
        web3war::cred_coin::internal_burn(admin, amount);
        
        let treasury = borrow_global_mut<GameTreasury>(@web3war);
        treasury.balance = treasury.balance + amount;
        treasury.total_received = treasury.total_received + amount;
    }

    /// Admin: Force claim a war reward (for stuck/emergency cases)
    public entry fun admin_force_claim_war(
        admin: &signer,
        battle_id: u64,
        target_country_id: u8
    ) acquires RewardRegistry {
        let admin_addr = signer::address_of(admin);
        assert!(web3war::admin::is_admin(admin_addr), E_NOT_AUTHORIZED);
        
        let reg = borrow_global_mut<RewardRegistry>(@web3war);
        
        let i = 0;
        let len = vector::length(&reg.war_rewards);
        while (i < len) {
            let reward = vector::borrow_mut(&mut reg.war_rewards, i);
            if (reward.battle_id == battle_id && !reward.claimed) {
                // Transfer to specified country treasury
                treasury::deposit_reward(target_country_id, reward.amount);
                reward.claimed = true;
                return
            };
            i = i + 1;
        };
        abort E_REWARD_NOT_FOUND
    }

    /// Admin: Cancel/void a pending war reward
    public entry fun admin_cancel_war_reward(
        admin: &signer,
        battle_id: u64
    ) acquires GameTreasury, RewardRegistry {
        let admin_addr = signer::address_of(admin);
        assert!(web3war::admin::is_admin(admin_addr), E_NOT_AUTHORIZED);
        
        let reg = borrow_global_mut<RewardRegistry>(@web3war);
        let treasury = borrow_global_mut<GameTreasury>(@web3war);
        
        let i = 0;
        let len = vector::length(&reg.war_rewards);
        while (i < len) {
            let reward = vector::borrow_mut(&mut reg.war_rewards, i);
            if (reward.battle_id == battle_id && !reward.claimed) {
                // Return to treasury (deflation)
                treasury.balance = treasury.balance + reward.amount;
                reward.claimed = true;
                return
            };
            i = i + 1;
        };
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    #[view]
    public fun get_balance(): u64 acquires GameTreasury {
        borrow_global<GameTreasury>(@web3war).balance
    }
    
    #[view]
    public fun get_stats(): (u64, u64, u64, u64) acquires GameTreasury {
        let t = borrow_global<GameTreasury>(@web3war);
        (t.balance, t.total_received, t.total_distributed, t.total_deflated)
    }
    
    #[view]
    public fun get_pending_war_rewards(country_id: u8): vector<PendingWarReward> acquires RewardRegistry {
        let reg = borrow_global<RewardRegistry>(@web3war);
        let result = vector::empty<PendingWarReward>();
        
        let i = 0;
        while (i < vector::length(&reg.war_rewards)) {
            let r = vector::borrow(&reg.war_rewards, i);
            if (r.winner_country == country_id && !r.claimed) {
                vector::push_back(&mut result, *r);
            };
            i = i + 1;
        };
        result
    }
    
    #[view]
    public fun get_pending_hero_rewards(addr: address): vector<PendingHeroReward> acquires RewardRegistry {
        let reg = borrow_global<RewardRegistry>(@web3war);
        let result = vector::empty<PendingHeroReward>();
        
        let i = 0;
        while (i < vector::length(&reg.hero_rewards)) {
            let r = vector::borrow(&reg.hero_rewards, i);
            if (r.hero_addr == addr && !r.claimed) {
                vector::push_back(&mut result, *r);
            };
            i = i + 1;
        };
        result
    }
    
    #[view]
    public fun get_hero_reward_amount(is_resistance: bool): u64 {
        if (is_resistance) { HERO_REWARD_RESISTANCE } else { HERO_REWARD_NORMAL }
    }
}
